#!/usr/bin/env bash
set -euo pipefail

# Run CMS integration and browser tests against a disposable local Supabase
# Postgres instance. The production build is owned exactly once by
# scripts/ci-required.sh as the cms-production-build Full component.
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
export DATABASE_URI="ltfx.db.uri.postgresql.cf6453a9f9.v1"
export PAYLOAD_SECRET="ltfx.auto.payload_secret.2b7cc4fe3e1b.v1"
export PAYLOAD_PUBLIC_SERVER_URL="http://127.0.0.1:3000"

cd "$cms_root"
# This path deliberately performs tests only; it must not hide or duplicate the
# named production-build coverage component in the Full profile.
pnpm run test
