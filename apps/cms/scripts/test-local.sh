#!/usr/bin/env bash
set -euo pipefail

# Run CMS build and tests against a disposable local Supabase Postgres instance.
# This script never links, logs in, pushes, or contacts a hosted Supabase project.

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cms_root="$(cd "$script_dir/.." && pwd)"
repo_root="$(cd "$cms_root/../.." && pwd)"
local_root="$(mktemp -d "${TMPDIR:-/tmp}/linksites-cms-local.XXXXXX")"

cleanup() {
  supabase --workdir "$local_root" stop --no-backup >/dev/null 2>&1 || true
  rm -rf "$local_root"
}
trap cleanup EXIT

mkdir -p "$local_root/supabase"
sed 's/^project_id = .*/project_id = "cms-local-validation"/' \
  "$repo_root/supabase/config.toml" > "$local_root/supabase/config.toml"

export SUPABASE_TELEMETRY_DISABLED=1
supabase --workdir "$local_root" start \
  --exclude gotrue,realtime,storage-api,imgproxy,kong,mailpit,postgrest,postgres-meta,studio,edge-runtime,logflare,vector,supavisor

# These values are valid only for the disposable local Supabase database started above.
# They are intentionally not production credentials or application secrets.
export DATABASE_URI="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
export PAYLOAD_SECRET="cms-local-validation-only-not-a-secret"
export PAYLOAD_PUBLIC_SERVER_URL="http://127.0.0.1:3000"

cd "$cms_root"
pnpm run build
pnpm run test
