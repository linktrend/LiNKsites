#!/usr/bin/env bash
# Fixture-backed local preview. Same /en/demo/<token> surface, no disposable
# Postgres. Use scripts/master-template-candidate-preview.sh for the full
# W2-04 Payload path when Docker/Supabase time is available.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
local_root="$(mktemp -d "${TMPDIR:-/tmp}/linksites-master-preview-lite.XXXXXX")"
web_port="${LINKSITES_MASTER_TEMPLATE_PREVIEW_PORT:-4312}"
keep_running="${LINKSITES_MASTER_TEMPLATE_PREVIEW_KEEP:-0}"
web_pid=""
preview_token="${PREVIEW_ACCESS_TOKEN:-$(node -e "process.stdout.write(require('node:crypto').randomBytes(24).toString('hex'))")}"
fixture_root="$repo_root/packages/factory-catalog/tests/fixtures/linklibraries/master-template-type-1-1.0.0"
fixture_path="$local_root/preview-fixture.json"

kill_tree() {
  local parent_pid="$1"
  local child_pid
  while read -r child_pid; do
    [[ -n "$child_pid" ]] && kill_tree "$child_pid"
  done < <(pgrep -P "$parent_pid" 2>/dev/null || true)
  kill "$parent_pid" >/dev/null 2>&1 || true
}

cleanup() {
  if [[ "$keep_running" != "1" && -n "$web_pid" ]]; then
    kill_tree "$web_pid"
    wait "$web_pid" 2>/dev/null || true
    rm -rf "$local_root"
  fi
}
trap cleanup EXIT

if lsof -tiTCP:"$web_port" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Candidate preview port ${web_port} is already occupied" >&2
  exit 1
fi

mkdir -p "$local_root"
export LINKSITES_MASTER_TEMPLATE_FIXTURE_ROOT="$fixture_root"
(cd "$repo_root" && LINKSITES_MASTER_TEMPLATE_PREVIEW_FIXTURE_PATH="$fixture_path" pnpm --filter @linksites/cms exec tsx -e "
import { writeMasterTemplateCandidatePreviewFixture, assertProductionStillRejectsDraftMaster } from '${repo_root}/packages/factory-catalog/src/masterTemplatePreviewSeam.ts'
const destination = process.env.LINKSITES_MASTER_TEMPLATE_PREVIEW_FIXTURE_PATH
if (!destination) throw new Error('preview fixture path missing')
assertProductionStillRejectsDraftMaster(process.env.LINKSITES_MASTER_TEMPLATE_FIXTURE_ROOT)
writeMasterTemplateCandidatePreviewFixture(destination, {
  hostname: '127.0.0.1',
  siteId: 'northline-preview',
  locale: 'en',
  fixtureRoot: process.env.LINKSITES_MASTER_TEMPLATE_FIXTURE_ROOT,
})
console.log('wrote fixture and confirmed production still rejects the draft')
")

wait_for() {
  local url="$1"
  for _ in $(seq 1 90); do
    if curl --fail --silent --show-error "$url" >/dev/null 2>&1; then return 0; fi
    sleep 1
  done
  return 1
}

web_environment=(
  NEXT_PUBLIC_CMS_PROVIDER=fixture
  CMS_FIXTURE_PATH="$fixture_path"
  PREVIEW_ACCESS_TOKEN="ltfx.auto.preview_access_token.bc0741b948c7.v1"
  LINKSITES_MASTER_TEMPLATE_LOOK_AND_FEEL_PROOF=1
  LINKSITES_MASTER_TEMPLATE_FIXTURE_ROOT="$fixture_root"
)
(cd "$repo_root" && env "${web_environment[@]}" pnpm --filter @linksites/web-master dev --hostname 127.0.0.1 --port "$web_port" --webpack) >"$local_root/web.log" 2>&1 &
web_pid="$!"
wait_for "http://127.0.0.1:${web_port}/en/demo/${preview_token}" || { cat "$local_root/web.log" >&2; exit 1; }

fail=0
for path_and_text in \
  "/en/demo/${preview_token}|Northline" \
  "/en/demo/${preview_token}/about|About Northline" \
  "/en/demo/${preview_token}/contact|Contact Northline"
do
  path="${path_and_text%%|*}"
  text="${path_and_text#*|}"
  body="$(curl --fail --silent --show-error "http://127.0.0.1:${web_port}${path}")"
  printf '%s' "$body" | grep -q "$text" || { echo "missing ${text} on ${path}" >&2; fail=1; }
  printf '%s' "$body" | grep -q 'data-production-selectable="false"' || { echo "missing fail-closed marker on ${path}" >&2; fail=1; }
  printf '%s' "$body" | grep -qi dentist && { echo "dentist copy leaked on ${path}" >&2; fail=1; }
done
missing_status="$(curl --silent --output /dev/null --write-out '%{http_code}' "http://127.0.0.1:${web_port}/en/demo/not-the-token")"
if [[ "$missing_status" != "404" ]]; then
  echo "invalid token must 404, got ${missing_status}" >&2
  fail=1
fi
if [[ "$fail" -ne 0 ]]; then
  cat "$local_root/web.log" >&2
  exit 1
fi

preview_url="http://127.0.0.1:${web_port}/en/demo/${preview_token}"
echo "Master template candidate lite preview: PASS"
echo "PREVIEW_URL=${preview_url}"
echo "ABOUT_URL=${preview_url}/about"
echo "CONTACT_URL=${preview_url}/contact"
echo "This is a private local preview, not a live website."
echo "Gap: fixture CMS instead of disposable Payload. Full path: scripts/master-template-candidate-preview.sh"

if [[ "$keep_running" == "1" ]]; then
  echo "KEEP=1 web_pid=${web_pid} log=${local_root}/web.log token file=${local_root}/preview.url"
  printf '%s\n' "$preview_url" > "$local_root/preview.url"
  printf '%s\n' "$web_pid" > "$local_root/web.pid"
  trap - EXIT
  wait "$web_pid"
fi
