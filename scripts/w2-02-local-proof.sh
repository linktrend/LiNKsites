#!/usr/bin/env bash
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# The W2-07 restore rehearsal supplies its own already-private temporary root
# and post-hook.  Keeping the normal default makes this script self-cleaning
# for W2-02 while allowing the recovery gate to snapshot the *actual* running
# services before their disposable teardown.
local_root=${LINKSITES_LOCAL_PROOF_ROOT:-"$(mktemp -d "${TMPDIR:-/tmp}/linksites-w2-02-local.XXXXXX")"}
if [[ -n "${LINKSITES_LOCAL_PROOF_ROOT:-}" ]]; then
  test ! -e "$local_root" || { echo "LINKSITES_LOCAL_PROOF_ROOT must not exist" >&2; exit 64; }
  mkdir -p "$local_root"
fi
cms_port=4321; web_port=4322; cms_pid=""; web_pid=""
random_value() { node -e "process.stdout.write(require('node:crypto').randomBytes(24).toString('hex'))"; }
payload_secret="$(random_value)"
preview_token="$(random_value)"
outcome_gateway_secret="$(random_value)"
run_marker="w2-02-run-$(random_value | cut -c1-16)"
stop_tree() { local process="$1" child; [[ -n "$process" ]] || return 0; for child in $(pgrep -P "$process" 2>/dev/null || true); do stop_tree "$child"; done; kill -TERM "$process" >/dev/null 2>&1 || true; }
cleanup() { stop_tree "$web_pid"; [[ -f "$local_root/web-restarted.pid" ]] && stop_tree "$(cat "$local_root/web-restarted.pid")"; stop_tree "$cms_pid"; [[ -f "$local_root/cms-restarted.pid" ]] && stop_tree "$(cat "$local_root/cms-restarted.pid")"; supabase --workdir "$local_root" stop --no-backup >/dev/null 2>&1 || true; [[ "${LINKSITES_KEEP_LOCAL_REHEARSAL:-}" = 1 ]] || rm -rf "$local_root"; }
trap cleanup EXIT
mkdir -p "$local_root/supabase" "$local_root/state"
local_project_id="w2-02-local-${$}"
cms_lock="$repo_root/apps/cms/.next/dev/lock"
if [[ -f "$cms_lock" ]]; then
  lock_pid="$(node -p 'JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8")).pid' "$cms_lock")"
  kill -0 "$lock_pid" >/dev/null 2>&1 && { echo "an active CMS development lock already exists" >&2; exit 1; }
  rm -f "$cms_lock"
fi
sed "s/^project_id = .*/project_id = \"${local_project_id}\"/" "$repo_root/supabase/config.toml" > "$local_root/supabase/config.toml"
SUPABASE_TELEMETRY_DISABLED=1 supabase --workdir "$local_root" start --exclude gotrue,realtime,storage-api,imgproxy,kong,mailpit,postgrest,postgres-meta,studio,edge-runtime,logflare,vector,supavisor >/dev/null
export DATABASE_URI="postgresql://postgres:postgres@127.0.0.1:54322/postgres" PAYLOAD_SECRET="$payload_secret" PAYLOAD_PUBLIC_SERVER_URL="http://127.0.0.1:${cms_port}" LINKSITES_W2_04_LOCAL_PROOF=1 W2_04_PROOF_PATH="$local_root/seed.json" W2_04_PREVIEW_API_KEY="$(random_value)" W2_04_PREVIEW_PASSWORD="$(random_value)"
pnpm --dir "$repo_root" --filter @linksites/cms exec tsx scripts/w2-04-seed.ts >/dev/null
api_key="$(node -e 'process.stdout.write(JSON.parse(require("fs").readFileSync(process.argv[1])).previewApiKey)' "$local_root/seed.json")"
site_id="$(node -e 'process.stdout.write(JSON.parse(require("fs").readFileSync(process.argv[1])).siteId)' "$local_root/seed.json")"
wait_for() { local url="$1"; for _ in $(seq 1 120); do if curl -fsS "$url" >/dev/null 2>&1; then return 0; fi; sleep 1; done; return 1; }
(cd "$repo_root" && pnpm --filter @linksites/cms dev --hostname 127.0.0.1 --port "$cms_port") >"$local_root/cms.log" 2>&1 & cms_pid="$!"
wait_for "http://127.0.0.1:${cms_port}/api/pages?site=${site_id}" || { cat "$local_root/cms.log" >&2; exit 1; }
env PAYLOAD_BASE_URL="http://127.0.0.1:${cms_port}" PAYLOAD_PUBLIC_SERVER_URL="http://127.0.0.1:${cms_port}" NEXT_PUBLIC_PAYLOAD_API_URL="http://127.0.0.1:${cms_port}" PAYLOAD_API_KEY="$api_key" PREVIEW_ACCESS_TOKEN="$preview_token" PREVIEW_RUN_MARKER="$run_marker" LINKSITES_W2_04_LOCAL_PROOF=1 LINKSITES_W2_04_LOCAL_PROOF_TEMPLATE_ID=marketing-smb-v1 LINKSITES_ADMITTED_TEMPLATE_SHA=1111111111111111111111111111111111111111 LINKSITES_ADMITTED_TEMPLATE_RECEIPT_JSON="$(node -e 'process.stdout.write(JSON.stringify(JSON.parse(require("fs").readFileSync(process.argv[1])).receipt))' "$local_root/seed.json")" LINKSITES_ADMITTED_TEMPLATE_EVIDENCE_JSON="$(node -e 'process.stdout.write(JSON.stringify(JSON.parse(require("fs").readFileSync(process.argv[1])).evidence))' "$local_root/seed.json")" pnpm --dir "$repo_root" --filter @linksites/web-master build >"$local_root/web-build.log" 2>&1
(cd "$repo_root" && env PAYLOAD_BASE_URL="http://127.0.0.1:${cms_port}" PAYLOAD_PUBLIC_SERVER_URL="http://127.0.0.1:${cms_port}" NEXT_PUBLIC_PAYLOAD_API_URL="http://127.0.0.1:${cms_port}" PAYLOAD_API_KEY="$api_key" PREVIEW_ACCESS_TOKEN="$preview_token" PREVIEW_RUN_MARKER="$run_marker" LINKSITES_W2_04_LOCAL_PROOF=1 LINKSITES_W2_04_LOCAL_PROOF_TEMPLATE_ID=marketing-smb-v1 LINKSITES_ADMITTED_TEMPLATE_SHA=1111111111111111111111111111111111111111 LINKSITES_ADMITTED_TEMPLATE_RECEIPT_JSON="$(node -e 'process.stdout.write(JSON.stringify(JSON.parse(require("fs").readFileSync(process.argv[1])).receipt))' "$local_root/seed.json")" LINKSITES_ADMITTED_TEMPLATE_EVIDENCE_JSON="$(node -e 'process.stdout.write(JSON.stringify(JSON.parse(require("fs").readFileSync(process.argv[1])).evidence))' "$local_root/seed.json")" pnpm --filter @linksites/web-master start --hostname 127.0.0.1 --port "$web_port") >"$local_root/web.log" 2>&1 & web_pid="$!"
wait_for "http://127.0.0.1:${web_port}/api/healthz" || { cat "$local_root/web.log" >&2; exit 1; }
chromium_executable="${W2_02_CHROMIUM_EXECUTABLE:-}"
if [ -z "$chromium_executable" ]; then
  chromium_executable="$(command -v google-chrome || command -v chromium || command -v chromium-browser || true)"
fi
if [ -z "$chromium_executable" ] && [ -x "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]; then
  chromium_executable="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
fi
test -x "$chromium_executable" || { echo "No runnable Chromium/Chrome executable found" >&2; exit 1; }

W2_02_STATE_DIR="$local_root/state" W2_02_PAYLOAD_BASE_URL="http://127.0.0.1:${cms_port}" W2_02_PAYLOAD_API_KEY="$api_key" W2_02_PAYLOAD_SITE_ID="$site_id" W2_02_WEB_MASTER_BASE_URL="http://127.0.0.1:${web_port}" W2_02_PREVIEW_ACCESS_TOKEN="$preview_token" W2_02_RUN_MARKER="$run_marker" W2_02_CHROMIUM_EXECUTABLE="$chromium_executable" W2_05_OUTCOME_GATEWAY_SECRET="$outcome_gateway_secret" W2_05_OUTCOME_GATEWAY_KEY_ID="local-proof-key" W2_02_ARTIFACT_PATH="${LINKSITES_LOCAL_PROOF_ARTIFACT_PATH:-$repo_root/docs/production-roadmap/evidence/w2-02/real-service-vertical-slice.json}" pnpm --dir "$repo_root" --filter @linksites/program-orchestrator exec tsx scripts/real-service-vertical-slice.ts

if [[ -n "${LINKSITES_LOCAL_PROOF_POSTHOOK:-}" ]]; then
  test -x "$LINKSITES_LOCAL_PROOF_POSTHOOK" || { echo "LINKSITES_LOCAL_PROOF_POSTHOOK must be executable" >&2; exit 64; }
  LINKSITES_LOCAL_PROOF_ROOT="$local_root" \
  LINKSITES_LOCAL_PROOF_CMS_PORT="$cms_port" \
  LINKSITES_LOCAL_PROOF_CMS_PID="$cms_pid" \
  LINKSITES_LOCAL_PROOF_WEB_PORT="$web_port" \
  LINKSITES_LOCAL_PROOF_WEB_PID="$web_pid" \
  LINKSITES_LOCAL_PROOF_DATABASE_URI="$DATABASE_URI" \
  LINKSITES_LOCAL_PROOF_PROJECT_ID="$local_project_id" \
  LINKSITES_LOCAL_PROOF_SITE_ID="$site_id" \
  LINKSITES_LOCAL_PROOF_API_KEY="$api_key" \
  LINKSITES_LOCAL_PROOF_PREVIEW_TOKEN="$preview_token" \
  LINKSITES_LOCAL_PROOF_RUN_MARKER="$run_marker" \
  "$LINKSITES_LOCAL_PROOF_POSTHOOK"
fi
