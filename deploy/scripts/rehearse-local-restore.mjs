#!/usr/bin/env node
// This gate uses the W2-02 real-service harness: local Supabase/Postgres,
// Payload, web-master and Chromium.  It never contacts a VPS or cloud system.
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { chmod, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const root = resolve(new URL('../..', import.meta.url).pathname)
const evidenceAt = process.argv.includes('--evidence')
  ? resolve(process.cwd(), process.argv[process.argv.indexOf('--evidence') + 1] ?? '')
  : null
if (process.argv.includes('--evidence') && !evidenceAt) throw new Error('--evidence requires a path')

const run = (command, args, options = {}) => new Promise((resolveRun, rejectRun) => {
  const child = spawn(command, args, { cwd: root, stdio: 'inherit', ...options })
  child.once('error', rejectRun)
  child.once('exit', (code, signal) => code === 0 ? resolveRun() : rejectRun(new Error(`${command} exited ${code ?? signal ?? 'unknown'}`)))
})

const rehearsal = await mkdtemp(join(tmpdir(), 'linksites-w2-07-recovery-'))
const hook = join(rehearsal, 'posthook.sh')
const rawReceipt = join(rehearsal, 'receipt.json')
const mediaName = `w2-07-recovery-${randomBytes(10).toString('hex')}.txt`
const hookLines = [
  '#!/usr/bin/env bash', 'set -euo pipefail',
  'die() { echo "restore rehearsal: $*" >&2; exit 1; }',
  `root=${JSON.stringify(root)}`, `receipt=${JSON.stringify(rawReceipt)}`, `media_name=${JSON.stringify(mediaName)}`,
  'backup="$LINKSITES_LOCAL_PROOF_ROOT/backup"', 'restore="$LINKSITES_LOCAL_PROOF_ROOT/restored"', 'mkdir -p "$backup" "$restore"',
  'db="supabase_db_${LINKSITES_LOCAL_PROOF_PROJECT_ID}"', 'docker inspect "$db" >/dev/null 2>&1 || die "local Supabase Postgres is unavailable"',
  '# Logical backup of the actual Payload pages graph, including the draft-version tables.  The latter use a leading underscore and are not covered by pages*. Avoid global Supabase event-trigger DDL: its privileged ownership is intentionally outside the application recovery authority.',
  'docker exec "$db" pg_dump -U postgres -d postgres --data-only --inserts --no-owner --no-privileges -t "public.pages*" -t "public._pages_v*" > "$backup/postgres.sql"', 'test -s "$backup/postgres.sql" || die "Postgres backup is empty"', 'grep -q "Data for Name: _pages_v" "$backup/postgres.sql" || die "Payload draft-version backup is missing"',
  '# Archive the actual PGlite working plane, durable ledger, evidence and delivered outbox.',
  'ledger_files=("$LINKSITES_LOCAL_PROOF_ROOT"/state/program-ledger.json.*.json)', 'test -f "${ledger_files[0]}" || die "durable ledger is missing"',
  'grep -q "\\\"completion.emitted\\\"" "${ledger_files[@]}" || die "completion event missing"',
  'grep -q "\\\"delivered\\\"" "${ledger_files[@]}" || die "delivered outbox state missing"',
  'tar -C "$LINKSITES_LOCAL_PROOF_ROOT/state" -cf "$backup/program-state.tar" .', 'test -s "$backup/program-state.tar" || die "state backup is empty"',
  '# Use Payload configured local media storage, with a new disposable private object.',
  'media_dir="$root/apps/cms/media"', 'mkdir -p "$media_dir"', 'media="$media_dir/$media_name"', 'printf "%s\\n" "$media_name" > "$media"',
  'media_hash="$(shasum -a 256 "$media" | awk "{print \\\u00241}")"', 'cp "$media" "$backup/$media_name"',
  '# Destruct only disposable Payload page content, its temporary state, and test media.  The seed site/user rows remain so the restored page records retain their real relations.',
  'docker exec "$db" psql -v ON_ERROR_STOP=1 -U postgres -d postgres -c "truncate table public.pages restart identity cascade" >/dev/null',
  "count=\"$(docker exec \"$db\" psql -At -U postgres -d postgres -c \"select count(*) from public.pages where promotion_run_marker = '$LINKSITES_LOCAL_PROOF_RUN_MARKER'\")\"", 'test "$count" = 0 || die "draft destructive probe failed"',
  'rm -rf "$LINKSITES_LOCAL_PROOF_ROOT/state"', 'rm -f "$media"', 'test ! -e "$media" || die "media destructive probe failed"',
  '# Restore Payload page data, PGlite working state/ledger/outbox, and media.',
  'docker exec -i "$db" psql -v ON_ERROR_STOP=1 -U postgres -d postgres < "$backup/postgres.sql" >/dev/null',
  'mkdir -p "$LINKSITES_LOCAL_PROOF_ROOT/state"', 'tar -C "$LINKSITES_LOCAL_PROOF_ROOT/state" -xf "$backup/program-state.tar"', 'cp "$backup/$media_name" "$media"',
  "count=\"$(docker exec \"$db\" psql -At -U postgres -d postgres -c \"select count(*) from public.pages where promotion_run_marker = '$LINKSITES_LOCAL_PROOF_RUN_MARKER' and status = 'draft' and _status = 'draft'\")\"", 'test "$count" = 5 || die "restored private draft count is not five"', "unique_ids=\"$(docker exec \"$db\" psql -At -U postgres -d postgres -c \"select count(distinct id) from public.pages where promotion_run_marker = '$LINKSITES_LOCAL_PROOF_RUN_MARKER' and id is not null\")\"", 'test "$unique_ids" = 5 || die "restored private drafts do not retain five unique non-null PostgreSQL IDs"',
  'test "$(shasum -a 256 "$media" | awk "{print \\\u00241}")" = "$media_hash" || die "media checksum mismatch"',
  'grep -q "\\\"completion.emitted\\\"" "${ledger_files[@]}" || die "completion was not restored"',
  'grep -q "\\\"delivered\\\"" "${ledger_files[@]}" || die "outbox was not restored"',
  '# Restart the actual CMS after direct PostgreSQL recovery so its database pool and Payload state are re-established exactly as in a service recovery.',
  'mkdir -p "$restore"',
  // `pnpm dev` is a wrapper; stopping it alone can leave Next.js listening.
  // Terminate only the listener we just started on the dedicated disposable
  // test port, after checking its command belongs to this CMS worktree.
  'is_cms_descendant() { candidate="$1"; while test -n "$candidate" && test "$candidate" != 1; do test "$candidate" = "$LINKSITES_LOCAL_PROOF_CMS_PID" && return 0; candidate="$(ps -p "$candidate" -o ppid= 2>/dev/null | tr -d " ")"; done; return 1; }',
  'listener_pids="$(lsof -nP -tiTCP:"$LINKSITES_LOCAL_PROOF_CMS_PORT" -sTCP:LISTEN || true)"', 'test -n "$listener_pids" || die "expected local CMS listener is missing before restart"',
  'for listener_pid in $listener_pids; do is_cms_descendant "$listener_pid" || die "refusing to stop listener $listener_pid which is not a child of the disposable CMS launcher"; done',
  'next_lock="$root/apps/cms/.next/dev/lock"', 'test -f "$next_lock" || die "expected CMS development lock is missing before restart"', "next_lock_pid=\"$(node -p 'const value = JSON.parse(require(\"node:fs\").readFileSync(process.argv[1], \"utf8\")); if (!Number.isInteger(value.pid) || value.pid < 2) process.exit(2); value.pid' \"$next_lock\")\" || die \"CMS development lock is malformed\"", 'is_cms_descendant "$next_lock_pid" || die "refusing to remove development lock not owned by the disposable CMS launcher"',
  'cms_descendants() { for child in $(pgrep -P "$1" 2>/dev/null || true); do cms_descendants "$child"; printf "%s\\n" "$child"; done; }', 'cms_tree="$(cms_descendants "$LINKSITES_LOCAL_PROOF_CMS_PID")"', 'test -n "$cms_tree" || die "CMS launcher has no descendant tree to stop"',
  'for cms_process in $cms_tree "$LINKSITES_LOCAL_PROOF_CMS_PID"; do kill -TERM "$cms_process" >/dev/null 2>&1 || true; done',
  'for attempt in $(seq 1 10); do test -z "$(lsof -nP -tiTCP:"$LINKSITES_LOCAL_PROOF_CMS_PORT" -sTCP:LISTEN || true)" && ! kill -0 "$next_lock_pid" >/dev/null 2>&1 && break; sleep 1; done', 'test -z "$(lsof -nP -tiTCP:"$LINKSITES_LOCAL_PROOF_CMS_PORT" -sTCP:LISTEN || true)" || die "CMS listener did not stop for recovery restart"', 'if kill -0 "$next_lock_pid" >/dev/null 2>&1; then kill -KILL "$next_lock_pid" || die "could not stop verified disposable CMS lock owner"; fi', 'for attempt in $(seq 1 10); do ! kill -0 "$next_lock_pid" >/dev/null 2>&1 && break; sleep 1; done', '! kill -0 "$next_lock_pid" >/dev/null 2>&1 || die "CMS development lock owner did not exit for recovery restart"', 'rm -f "$next_lock"', 'test ! -e "$next_lock" || die "stale CMS development lock could not be removed"',
  '(cd "$root" && pnpm --filter @linksites/cms dev --hostname 127.0.0.1 --port "$LINKSITES_LOCAL_PROOF_CMS_PORT") > "$restore/cms-restarted.log" 2>&1 & restarted_cms=$!', 'echo "$restarted_cms" > "$LINKSITES_LOCAL_PROOF_ROOT/cms-restarted.pid"',
  'for attempt in $(seq 1 45); do curl -fsS "http://127.0.0.1:$LINKSITES_LOCAL_PROOF_CMS_PORT/api/readyz" >/dev/null 2>&1 && break; sleep 1; done', 'curl -fsS "http://127.0.0.1:$LINKSITES_LOCAL_PROOF_CMS_PORT/api/readyz" >/dev/null || die "restarted Payload is not ready"',
  '# Re-read actual Payload and actual token-protected web-master after restore.',
  'sleep 2', 'mkdir -p "$restore"', 'test -d "$restore" || die "post-restart readback directory is unavailable"', 'payload_body="$restore/payload-readback.json"', ': > "$payload_body" || die "could not create post-restart Payload readback file"', 'payload_status="$(curl --globoff --retry 4 --retry-connrefused --silent -o "$payload_body" -w "%{http_code}" -H "Authorization: users API-Key $LINKSITES_LOCAL_PROOF_API_KEY" "http://127.0.0.1:$LINKSITES_LOCAL_PROOF_CMS_PORT/api/pages?site=$LINKSITES_LOCAL_PROOF_SITE_ID&where[promotionRunMarker][equals]=$LINKSITES_LOCAL_PROOF_RUN_MARKER&draft=true&limit=100" || true)"', 'test "$payload_status" = 200 || die "Payload readback HTTP status $payload_status (body bytes $(wc -c < "$payload_body" 2>/dev/null || echo 0))"', "node -e 'const value = JSON.parse(require(\"node:fs\").readFileSync(process.argv[1], \"utf8\")); const marker = process.argv[2]; const docs = value.docs; if (!Array.isArray(docs) || docs.length !== 5 || new Set(docs.map((doc) => doc.id)).size !== 5 || docs.some((doc) => !doc.id || doc.promotionRunMarker !== marker || doc.status !== \"draft\" || doc._status !== \"draft\")) process.exit(1)' \"$payload_body\" \"$LINKSITES_LOCAL_PROOF_RUN_MARKER\" || die \"Payload readback did not retain five unique non-null restored draft IDs\"",
  // The web process remains alive while CMS is restored. Restart only its
  // verified disposable process tree after API restoration so it cannot serve
  // a stale private-preview cache across the service-recovery boundary.
  'is_web_descendant() { candidate="$1"; while test -n "$candidate" && test "$candidate" != 1; do test "$candidate" = "$LINKSITES_LOCAL_PROOF_WEB_PID" && return 0; candidate="$(ps -p "$candidate" -o ppid= 2>/dev/null | tr -d " ")"; done; return 1; }',
  'web_listener_pids="$(lsof -nP -tiTCP:"$LINKSITES_LOCAL_PROOF_WEB_PORT" -sTCP:LISTEN || true)"', 'test -n "$web_listener_pids" || die "expected local web-master listener is missing before restart"', 'for web_listener_pid in $web_listener_pids; do is_web_descendant "$web_listener_pid" || die "refusing to stop listener not owned by disposable web-master launcher"; done',
  'web_descendants() { for child in $(pgrep -P "$1" 2>/dev/null || true); do web_descendants "$child"; printf "%s\\n" "$child"; done; }', 'web_tree="$(web_descendants "$LINKSITES_LOCAL_PROOF_WEB_PID")"', 'test -n "$web_tree" || die "web-master launcher has no descendant tree to stop"', 'for web_process in $web_tree "$LINKSITES_LOCAL_PROOF_WEB_PID"; do kill -TERM "$web_process" >/dev/null 2>&1 || true; done', 'for attempt in $(seq 1 20); do test -z "$(lsof -nP -tiTCP:"$LINKSITES_LOCAL_PROOF_WEB_PORT" -sTCP:LISTEN || true)" && break; sleep 1; done', 'test -z "$(lsof -nP -tiTCP:"$LINKSITES_LOCAL_PROOF_WEB_PORT" -sTCP:LISTEN || true)" || die "web-master listener did not stop for recovery restart"',
  'web_receipt="$(node -e \'process.stdout.write(JSON.stringify(JSON.parse(require("node:fs").readFileSync(process.argv[1])).receipt))\' "$LINKSITES_LOCAL_PROOF_ROOT/seed.json")"', 'web_evidence="$(node -e \'process.stdout.write(JSON.stringify(JSON.parse(require("node:fs").readFileSync(process.argv[1])).evidence))\' "$LINKSITES_LOCAL_PROOF_ROOT/seed.json")"',
  '(cd "$root" && env PAYLOAD_BASE_URL="http://127.0.0.1:$LINKSITES_LOCAL_PROOF_CMS_PORT" PAYLOAD_PUBLIC_SERVER_URL="http://127.0.0.1:$LINKSITES_LOCAL_PROOF_CMS_PORT" NEXT_PUBLIC_PAYLOAD_API_URL="http://127.0.0.1:$LINKSITES_LOCAL_PROOF_CMS_PORT" PAYLOAD_API_KEY="$LINKSITES_LOCAL_PROOF_API_KEY" PREVIEW_ACCESS_TOKEN="$LINKSITES_LOCAL_PROOF_PREVIEW_TOKEN" PREVIEW_RUN_MARKER="$LINKSITES_LOCAL_PROOF_RUN_MARKER" LINKSITES_W2_04_LOCAL_PROOF=1 LINKSITES_W2_04_LOCAL_PROOF_TEMPLATE_ID=marketing-smb-v1 LINKSITES_ADMITTED_TEMPLATE_SHA=1111111111111111111111111111111111111111 LINKSITES_ADMITTED_TEMPLATE_RECEIPT_JSON="$web_receipt" LINKSITES_ADMITTED_TEMPLATE_EVIDENCE_JSON="$web_evidence" pnpm --filter @linksites/web-master start --hostname 127.0.0.1 --port "$LINKSITES_LOCAL_PROOF_WEB_PORT") > "$restore/web-restarted.log" 2>&1 & restarted_web=$!', 'echo "$restarted_web" > "$LINKSITES_LOCAL_PROOF_ROOT/web-restarted.pid"', 'for attempt in $(seq 1 45); do curl -fsS "http://127.0.0.1:$LINKSITES_LOCAL_PROOF_WEB_PORT/api/healthz" >/dev/null 2>&1 && break; sleep 1; done', 'curl -fsS "http://127.0.0.1:$LINKSITES_LOCAL_PROOF_WEB_PORT/api/healthz" >/dev/null || die "restarted web-master is not ready"',
  'for attempt in $(seq 1 20); do curl --fail --silent -D "$restore/headers" -o "$restore/preview.html" "http://127.0.0.1:$LINKSITES_LOCAL_PROOF_WEB_PORT/en/demo/$LINKSITES_LOCAL_PROOF_PREVIEW_TOKEN" || die "private preview HTTP readback failed"; grep -qi "^x-robots-tag:.*noindex" "$restore/headers" && grep -q "$LINKSITES_LOCAL_PROOF_RUN_MARKER" "$restore/preview.html" && break; sleep 1; done', 'grep -qi "^x-robots-tag:.*noindex" "$restore/headers" || die "private preview lost noindex"', 'grep -q "$LINKSITES_LOCAL_PROOF_RUN_MARKER" "$restore/preview.html" || die "private preview did not render restored draft after web restart"',
  'node - "$receipt" "$media_hash" <<\'NODE\'',
  'const fs = require("node:fs")', 'const [path, mediaChecksum] = process.argv.slice(2)',
  'fs.writeFileSync(path, JSON.stringify({ schemaVersion: "1.0.0", rehearsal: "real-disposable-local-recovery", environment: "isolated-local-only", services: ["local-supabase-postgres", "payload-cms", "web-master", "program-orchestrator-state"], backupClasses: { payloadPostgres: true, supabaseWorkingContentAndPgliteState: true, durableLedgerAndOutbox: true, media: { restored: true, sha256: mediaChecksum } }, destructiveProbe: { privateDraftRowsRemovedThenRestored: true, programStateRemovedThenRestored: true, mediaRemovedThenRestored: true }, postRestoreReadback: { privateDraftCount: 5, completionEmitted: true, outboxDelivered: true, privatePreviewRendered: true, noindex: true }, publicActivation: false, credentialsPersisted: false }, null, 2) + "\\n")',
  'NODE',
].join('\n')

try {
  await writeFile(hook, hookLines, { mode: 0o700 })
  await chmod(hook, 0o700)
  await run('bash', ['scripts/w2-02-local-proof.sh'], { env: { ...process.env, LINKSITES_LOCAL_PROOF_ROOT: join(rehearsal, 'services'), LINKSITES_LOCAL_PROOF_POSTHOOK: hook, LINKSITES_LOCAL_PROOF_ARTIFACT_PATH: join(rehearsal, 'vertical-slice.json') } })
  const receipt = JSON.parse(await readFile(rawReceipt, 'utf8'))
  assert.equal(receipt.publicActivation, false)
  assert.equal(receipt.credentialsPersisted, false)
  assert.equal(receipt.postRestoreReadback.privateDraftCount, 5)
  assert.equal(/(?:api.?key|preview.?token|password|secret)\s*[:=]\s*[^\s]/i.test(JSON.stringify(receipt)), false, 'receipt contains a credential')
  if (evidenceAt) await writeFile(evidenceAt, `${JSON.stringify(receipt, null, 2)}\n`)
  process.stdout.write(`${JSON.stringify(receipt)}\n`)
} finally {
  // A failed disposable rehearsal may be retained only on an explicit local
  // diagnostic request; normal operation always removes every temporary copy.
  if (process.env.LINKSITES_KEEP_LOCAL_REHEARSAL !== '1') await rm(rehearsal, { recursive: true, force: true })
  await rm(join(root, 'apps/cms/media', mediaName), { force: true })
}
