#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
local_root="$(mktemp -d "${TMPDIR:-/tmp}/linksites-w2-04-local.XXXXXX")"
local_project_id="w2-04-local-${$}"
cms_port="4311"
web_port="4312"
cms_pid=""
web_pid=""
random_value() { node -e "process.stdout.write(require('node:crypto').randomBytes(24).toString('hex'))"; }
payload_secret="$(random_value)"
preview_token="$(random_value)"

kill_tree() {
  local parent_pid="$1"
  local child_pid
  while read -r child_pid; do
    [[ -n "$child_pid" ]] && kill_tree "$child_pid"
  done < <(pgrep -P "$parent_pid" 2>/dev/null || true)
  kill "$parent_pid" >/dev/null 2>&1 || true
}

cleanup() {
  if [[ -n "$web_pid" ]]; then
    kill_tree "$web_pid"
    wait "$web_pid" 2>/dev/null || true
  fi
  if [[ -n "$cms_pid" ]]; then
    kill_tree "$cms_pid"
    wait "$cms_pid" 2>/dev/null || true
  fi
  supabase --workdir "$local_root" stop --no-backup >/dev/null 2>&1 || true
  rm -rf "$local_root"
}
trap cleanup EXIT

if lsof -tiTCP:"$cms_port" -sTCP:LISTEN >/dev/null 2>&1 || lsof -tiTCP:"$web_port" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "W2-04 local proof ports are already occupied" >&2
  exit 1
fi

mkdir -p "$local_root/supabase" "$local_root/artifacts"
# Use a private contiguous port range so an unrelated local Supabase project
# cannot make this disposable proof fail before any consumer assertion runs.
supabase_port_base=""
for candidate_base in $(seq 54000 54100); do
  candidate_free=1
  for candidate_offset in 0 1 2 3 4 5 6 7 8 9; do
    candidate_port=$((candidate_base + candidate_offset))
    if lsof -tiTCP:"$candidate_port" -sTCP:LISTEN >/dev/null 2>&1; then
      candidate_free=0
      break
    fi
  done
  if [[ "$candidate_free" == "1" ]]; then
    supabase_port_base="$candidate_base"
    break
  fi
done
if [[ -z "$supabase_port_base" ]]; then
  echo 'No free contiguous Supabase port range was available' >&2
  exit 1
fi
supabase_config="$local_root/supabase/config.toml"
sed "s/^project_id = .*/project_id = \"${local_project_id}\"/" "$repo_root/supabase/config.toml" > "$supabase_config"
for original_port in $(seq 54320 54329); do
  offset=$((original_port - 54320))
  replacement_port=$((supabase_port_base + offset))
  sed -i.bak "s/port = ${original_port}/port = ${replacement_port}/g; s/shadow_port = ${original_port}/shadow_port = ${replacement_port}/g" "$supabase_config"
done
rm -f "$supabase_config.bak"
export SUPABASE_TELEMETRY_DISABLED=1
supabase --workdir "$local_root" start --exclude gotrue,realtime,storage-api,imgproxy,kong,mailpit,postgrest,postgres-meta,studio,edge-runtime,logflare,vector,supavisor

supabase_db_port=$((supabase_port_base + 2))
export DATABASE_URI="postgresql://postgres:postgres@127.0.0.1:${supabase_db_port}/postgres"
export PAYLOAD_SECRET="ltfx.auto.payload_secret.19615ad30fae.v1"
export PAYLOAD_PUBLIC_SERVER_URL="http://127.0.0.1:${cms_port}"
export LINKSITES_W2_04_LOCAL_PROOF=1
export W2_04_PROOF_PATH="$local_root/proof.json"
proof_template_id="${W2_04_TEMPLATE_ID:-marketing-smb-v1}"
export W2_04_PREVIEW_API_KEY="$(random_value)"
export W2_04_PREVIEW_PASSWORD="$(random_value)"
if ! seed_output="$(cd "$repo_root" && pnpm --filter @linksites/cms exec tsx scripts/w2-04-seed.ts)"; then
  printf '%s\n' "$seed_output" >&2
  echo 'W2-04 seed failed' >&2
  exit 1
fi
proof_json="$(< "$W2_04_PROOF_PATH")"
[[ -n "$proof_json" ]] || { printf '%s\n' "$seed_output" >&2; echo 'W2-04 seed did not emit proof admission evidence' >&2; exit 1; }
preview_api_key="$(node -e 'const x=JSON.parse(process.argv[1]); process.stdout.write(x.previewApiKey)' "$proof_json")"
[[ -n "$preview_api_key" ]] || { printf '%s\n' "$seed_output" >&2; echo 'W2-04 seed did not emit preview API key' >&2; exit 1; }
site_id="$(node -e 'const x=JSON.parse(process.argv[1]); process.stdout.write(x.siteId)' "$proof_json")"
[[ -n "$site_id" ]] || { printf '%s\n' "$seed_output" >&2; echo 'W2-04 seed did not emit site ID' >&2; exit 1; }

wait_for() {
  local url="$1"
  for _ in $(seq 1 120); do
    if curl --fail --silent --show-error "$url" >/dev/null 2>&1; then return 0; fi
    sleep 1
  done
  return 1
}

(cd "$repo_root" && DATABASE_URI="$DATABASE_URI" PAYLOAD_SECRET="$PAYLOAD_SECRET" PAYLOAD_PUBLIC_SERVER_URL="$PAYLOAD_PUBLIC_SERVER_URL" pnpm --filter @linksites/cms dev --hostname 127.0.0.1 --port "$cms_port") >"$local_root/cms.log" 2>&1 &
cms_pid="$!"
wait_for "http://127.0.0.1:${cms_port}/api/pages?site=${site_id}" || { cat "$local_root/cms.log" >&2; exit 1; }

web_environment=(
  PAYLOAD_BASE_URL="http://127.0.0.1:${cms_port}" \
  PAYLOAD_PUBLIC_SERVER_URL="http://127.0.0.1:${cms_port}" \
  NEXT_PUBLIC_PAYLOAD_API_URL="http://127.0.0.1:${cms_port}" \
  PAYLOAD_API_KEY="$preview_api_key" \
  PREVIEW_ACCESS_TOKEN="$preview_token" \
  LINKSITES_W2_04_LOCAL_PROOF=1 \
  LINKSITES_W2_04_LOCAL_PROOF_TEMPLATE_ID="$proof_template_id" \
  LINKSITES_ADMITTED_TEMPLATE_SHA="1111111111111111111111111111111111111111" \
  LINKSITES_ADMITTED_TEMPLATE_RECEIPT_JSON="$(node -e 'const x=JSON.parse(process.argv[1]); process.stdout.write(JSON.stringify(x.receipt))' "$proof_json")" \
  LINKSITES_ADMITTED_TEMPLATE_EVIDENCE_JSON="$(node -e 'const x=JSON.parse(process.argv[1]); process.stdout.write(JSON.stringify(x.evidence))' "$proof_json")"
)
(cd "$repo_root" && env "${web_environment[@]}" pnpm --filter @linksites/web-master build) >"$local_root/web-build.log" 2>&1
(cd "$repo_root" && env "${web_environment[@]}" pnpm --filter @linksites/web-master start --hostname 127.0.0.1 --port "$web_port") >"$local_root/web.log" 2>&1 &
web_pid="$!"
wait_for "http://127.0.0.1:${web_port}/api/healthz" || { cat "$local_root/web.log" >&2; exit 1; }

chromium_executable="${W2_04_CHROMIUM_EXECUTABLE:-}"
if [ -z "$chromium_executable" ]; then
  chromium_executable="$(command -v google-chrome || command -v chromium || command -v chromium-browser || true)"
fi
if [ -z "$chromium_executable" ] && [ -x "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]; then
  chromium_executable="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
fi
test -x "$chromium_executable" || { echo "No runnable Chromium/Chrome executable found" >&2; exit 1; }

if ! browser_output="$(W2_04_CMS_URL="http://127.0.0.1:${cms_port}" \
  W2_04_WEB_URL="http://127.0.0.1:${web_port}" \
  PREVIEW_ACCESS_TOKEN="$preview_token" \
  W2_04_PREVIEW_API_KEY="$preview_api_key" \
  W2_04_SITE_ID="$site_id" \
  W2_04_ARTIFACT_DIR="$local_root/artifacts" \
  W2_04_CHROMIUM_EXECUTABLE="$chromium_executable" \
  pnpm --filter @linksites/cms exec node scripts/w2-04-browser-proof.mjs 2>&1)"; then
  printf '%s\n' "$browser_output" >&2
  echo 'W2-04 browser proof failed' >&2
  exit 1
fi
printf '%s\n' "$browser_output"
mkdir -p "$repo_root/docs/production-roadmap/evidence/w2-04/browser"
cp "$local_root/artifacts/public-desktop.png" "$repo_root/docs/production-roadmap/evidence/w2-04/browser/public-desktop.png"
cp "$local_root/artifacts/public-mobile.png" "$repo_root/docs/production-roadmap/evidence/w2-04/browser/public-mobile.png"
