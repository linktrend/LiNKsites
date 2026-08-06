#!/usr/bin/env sh
set -eu

: "${DATABASE_URI:?DATABASE_URI is required}"
: "${LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA:?LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA is required}"

case "$DATABASE_URI" in
  postgresql://*|postgres://*) ;;
  *) echo 'DATABASE_URI must be a PostgreSQL URI' >&2; exit 78 ;;
esac
case "$DATABASE_URI" in
  *localhost*|*127.0.0.1*|*0.0.0.0*) echo 'loopback DATABASE_URI is forbidden for deployment migration' >&2; exit 78 ;;
esac
case "$LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA" in
  [0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]) ;;
  *) echo 'platform migration proof must be a lowercase full 40-character Git SHA' >&2; exit 78 ;;
esac

# A supplied SHA is not evidence that the shared Platform migration was
# applied. Verify the exact prerequisite objects and the two narrow grants in
# the target database before any LiNKsites migration can mutate it.
platform_state="$(psql "$DATABASE_URI" --no-align --tuples-only --quiet --set ON_ERROR_STOP=1 --command "
select concat_ws('|',
  to_regprocedure('platform.has_org_access(uuid,platform.member_role)') is not null,
  has_schema_privilege('svc_linksites_runtime', 'platform', 'USAGE'),
  has_function_privilege('svc_linksites_runtime', 'platform.has_org_access(uuid,platform.member_role)', 'EXECUTE'),
  has_schema_privilege('svc_linksites_ledger', 'platform', 'USAGE'),
  has_function_privilege('svc_linksites_ledger', 'platform.has_org_access(uuid,platform.member_role)', 'EXECUTE')
);" | tr -d '[:space:]')"
[ "$platform_state" = 'true|true|true|true|true' ] || {
  echo "required Platform migration state is absent or incomplete: $platform_state" >&2
  exit 78
}

psql "$DATABASE_URI" --set ON_ERROR_STOP=1 --command "
  create schema if not exists lsites_ledger;
  create table if not exists lsites_ledger.platform_migration_receipts (
    platform_commit_sha char(40) primary key,
    verified_at timestamptz not null default now(),
    verifier text not null check (verifier = 'linksites-supabase-migrate-v1')
  );
" >/dev/null
psql "$DATABASE_URI" --set ON_ERROR_STOP=1 --command "
  insert into lsites_ledger.platform_migration_receipts (platform_commit_sha, verifier)
  values ('$LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA', 'linksites-supabase-migrate-v1')
  on conflict (platform_commit_sha) do update set verified_at = excluded.verified_at;
" >/dev/null

for migration in /migrations/*.sql; do
  [ -f "$migration" ] || continue
  echo "Applying LiNKsites migration $(basename "$migration")"
  psql "$DATABASE_URI" --set ON_ERROR_STOP=1 --file "$migration" >/dev/null
done
receipt="$(psql "$DATABASE_URI" --no-align --tuples-only --quiet --set ON_ERROR_STOP=1 --command "select platform_commit_sha from lsites_ledger.platform_migration_receipts where platform_commit_sha = '$LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA';" | tr -d '[:space:]')"
[ "$receipt" = "$LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA" ] || { echo 'platform migration receipt readback failed' >&2; exit 78; }
echo 'LiNKsites Supabase/Postgres migrations applied successfully with verified Platform prerequisite.'
