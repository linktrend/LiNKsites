#!/usr/bin/env bash
set -euo pipefail

# Run the repository's forward migrations and local RLS probes in a disposable
# Supabase project. The source migrations contain dbmate-style `migrate:down`
# comments; Supabase CLI executes SQL comments as comments, so the down blocks
# must be removed from the disposable copy without changing the repository
# files. A few legacy filenames also split an 8-digit date from a 6-digit
# sequence with an extra underscore; the disposable copy joins those parts for
# stable names in the local staging directories. Platform and LiNKsites SQL
# are applied directly in their required order so unrelated migration versions
# cannot collide. This script never links, logs in, pushes, or contacts a cloud
# project.

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/.." && pwd)"
platform_repo="${LINKSITES_PLATFORM_REPOSITORY:-/Users/linktrend/Projects/LiNKplatform-worktrees/linksites-platform-rls-grants}"
foundation_relative_path="supabase/migrations/20260714_000001_platform_foundation.sql"
grant_relative_path="supabase/migrations/20260804233546_linksites_platform_rls_grants.sql"
expected_platform_commit="63635ecec576887e5e25080745c4ad169b335508"
expected_foundation_sha256="39c3cc4795fed5ed9bc79842383b0219d93dbaf87dc06318882805862e41bac4"
expected_grant_sha256="4241230960c0a0899df540804ec8e7cb3af5cbd1f4cb11855ed1ce2e5dd24bca"

[[ -e "$platform_repo/.git" ]] || {
  echo "missing exact Platform worktree: $platform_repo" >&2
  exit 1
}

actual_platform_commit="$(git -C "$platform_repo" rev-parse HEAD)"
[[ "$actual_platform_commit" == "$expected_platform_commit" ]] || {
  echo "platform repository HEAD mismatch: expected $expected_platform_commit, got $actual_platform_commit" >&2
  exit 1
}

for platform_migration in "$foundation_relative_path" "$grant_relative_path"; do
  git -C "$platform_repo" cat-file -e "$expected_platform_commit:$platform_migration"
done

actual_foundation_sha256="$(git -C "$platform_repo" show "$expected_platform_commit:$foundation_relative_path" | shasum -a 256 | awk '{print $1}')"
actual_grant_sha256="$(git -C "$platform_repo" show "$expected_platform_commit:$grant_relative_path" | shasum -a 256 | awk '{print $1}')"
[[ "$actual_foundation_sha256" == "$expected_foundation_sha256" ]] || {
  echo "platform foundation SHA-256 mismatch: expected $expected_foundation_sha256, got $actual_foundation_sha256" >&2
  exit 1
}
[[ "$actual_grant_sha256" == "$expected_grant_sha256" ]] || {
  echo "Platform grant migration SHA-256 mismatch: expected $expected_grant_sha256, got $actual_grant_sha256" >&2
  exit 1
}

local_root="$(mktemp -d "${TMPDIR:-/tmp}/linksites-supabase-gate.XXXXXX")"

cleanup() {
  supabase --workdir "$local_root" stop --no-backup >/dev/null 2>&1 || true
  rm -rf "$local_root"
}
trap cleanup EXIT

mkdir -p "$local_root/platform-migrations" "$local_root/linksites-migrations" "$local_root/supabase/migrations" "$local_root/supabase/tests"
cp "$repo_root/supabase/config.toml" "$local_root/supabase/config.toml"
cp "$repo_root/supabase/seed.sql" "$local_root/supabase/seed.sql"
cp "$repo_root/supabase/tests/w1_02_tenant_isolation.sql" "$local_root/supabase/tests/w1_02_tenant_isolation.sql"

cd "$local_root"
export SUPABASE_TELEMETRY_DISABLED=1
db_container="supabase_db_w1-02-supabase-gate"
db_admin_user="postgres"
# Supabase CLI's disposable local database uses this default only inside Docker.
# No external credential is read, stored, or contacted by this harness.
db_admin_password="postgres"

normalize_migration_name() {
  local migration_name="$1"
  if [[ "$migration_name" =~ ^([0-9]{8})_([0-9]{6})_(.*)$ ]]; then
    migration_name="${BASH_REMATCH[1]}${BASH_REMATCH[2]}_${BASH_REMATCH[3]}"
  fi
  printf '%s\n' "$migration_name"
}

copy_forward_migration() {
  local source_path="$1"
  local migration_name
  migration_name="$(normalize_migration_name "$(basename "$source_path")")"
  awk '/^--[[:space:]]*migrate:down([[:space:]]|$)/ { exit } { print }' \
    "$source_path" > "$local_root/linksites-migrations/$migration_name"
}

copy_platform_migration() {
  local relative_path="$1"
  local migration_name
  migration_name="$(normalize_migration_name "$(basename "$relative_path")")"
  git -C "$platform_repo" show "$expected_platform_commit:$relative_path" \
    | awk '/^--[[:space:]]*migrate:down([[:space:]]|$)/ { exit } { print }' \
    > "$local_root/platform-migrations/$migration_name"
}

supabase --workdir "$local_root" start \
  --exclude gotrue,realtime,storage-api,imgproxy,kong,mailpit,postgrest,postgres-meta,studio,edge-runtime,logflare,vector,supavisor

docker exec -e "PGPASSWORD=$db_admin_password -i "$db_container" psql --username "$db_admin_user" --dbname postgres --set ON_ERROR_STOP=1 <<'SQL'
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'svc_linksites_runtime') then
    create role svc_linksites_runtime nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'svc_linksites_ledger') then
    create role svc_linksites_ledger nologin;
  end if;
end $$;
create schema if not exists auth;
create schema if not exists lbrain;
create schema if not exists lskills;
create extension if not exists pgtap with schema extensions;
do $$
begin
  if to_regprocedure('auth.uid()') is null then
    raise exception 'Supabase local auth.uid() adapter is missing';
  end if;
end $$;
SQL

while IFS= read -r platform_migration; do
  copy_platform_migration "$platform_migration"
done < <(git -C "$platform_repo" ls-tree -r --name-only "$expected_platform_commit" supabase/migrations | LC_ALL=C sort)

while IFS= read -r platform_migration; do
  migration_name="$(normalize_migration_name "$(basename "$platform_migration")")"
  echo "Applying exact Platform migration $migration_name"
  docker exec -e "PGPASSWORD=$db_admin_password -i "$db_container" psql --username "$db_admin_user" --dbname postgres --set ON_ERROR_STOP=1 \
    < "$local_root/platform-migrations/$migration_name"
done < <(git -C "$platform_repo" ls-tree -r --name-only "$expected_platform_commit" supabase/migrations | LC_ALL=C sort)

for migration in "$repo_root"/supabase/migrations/*.sql; do
  copy_forward_migration "$migration"
done

for migration in "$repo_root"/supabase/migrations/*.sql; do
  migration_name="$(normalize_migration_name "$(basename "$migration")")"
  echo "Applying LiNKsites migration $migration_name"
  docker exec -e "PGPASSWORD=$db_admin_password -i "$db_container" psql \
    --username "$db_admin_user" --dbname postgres --set ON_ERROR_STOP=1 \
    < "$local_root/linksites-migrations/$migration_name"
done

docker exec -e "PGPASSWORD=$db_admin_password -i "$db_container" psql --username "$db_admin_user" --dbname postgres --set ON_ERROR_STOP=1 < "$local_root/supabase/seed.sql"
test_output="$local_root/w1-02-tenant-isolation.tap"
docker exec -e "PGPASSWORD=$db_admin_password -i "$db_container" psql --username "$db_admin_user" --dbname postgres \
  --set ON_ERROR_STOP=1 --no-align --tuples-only --quiet \
  < "$local_root/supabase/tests/w1_02_tenant_isolation.sql" \
  | tee "$test_output"
grep -Fq '1..19' "$test_output" || {
  echo "W1-02 pgTAP plan did not complete" >&2
  exit 1
}
if grep -Eq '(^|[[:space:]])not ok([[:space:]]|$)' "$test_output"; then
  echo "W1-02 pgTAP reported a failing assertion" >&2
  exit 1
fi
