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
# psql's unaligned boolean representation is `t` / `f`, not the SQL text
# `true` / `false`.  Keep the comparison strict so a partial Platform
# prerequisite still fail-closes this migration job.
[ "$platform_state" = 't|t|t|t|t' ] || {
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

psql "$DATABASE_URI" --set ON_ERROR_STOP=1 --command "
  create table if not exists lsites_ledger.linksites_migration_history (
    filename text primary key,
    checksum char(64) not null check (checksum ~ '^[0-9a-f]{64}$'),
    applied_at timestamptz not null default now()
  );
" >/dev/null

# Version-sort the timestamped filenames so date-only names such as
# 20260804_000001 run before same-day wall-clock names such as 20260804113354.
# The history table is the idempotency boundary: an applied filename may never
# change bytes, while an unapplied migration is executed and recorded in one
# database transaction.
for migration in $(find /migrations -maxdepth 1 -type f -name '*.sql' -print | sort -V); do
  [ -f "$migration" ] || continue
  migration_name="$(basename "$migration")"
  migration_checksum="$(sha256sum "$migration" | awk '{print $1}')"
  applied_checksum="$(psql "$DATABASE_URI" --no-align --tuples-only --quiet --set ON_ERROR_STOP=1 \
    -v migration_name="$migration_name" \
    --command "select checksum from lsites_ledger.linksites_migration_history where filename = :'migration_name';" | tr -d '[:space:]')"
  if [ -n "$applied_checksum" ]; then
    [ "$applied_checksum" = "$migration_checksum" ] || {
      echo "applied migration checksum mismatch: $migration_name" >&2
      exit 78
    }
    echo "Skipping already-applied LiNKsites migration $migration_name"
    continue
  fi
  echo "Applying LiNKsites migration $migration_name"
  # Migration files carry a documented `migrate:down` section for human
  # recovery review.  Deployment is forward-only: feeding that section to
  # psql would immediately undo the just-applied schema and make later
  # migrations fail.  Execute only the source preceding that delimiter.
  {
    echo 'begin;'
    sed '/^-- migrate:down/,$d' "$migration"
    printf "insert into lsites_ledger.linksites_migration_history (filename, checksum) values (:'migration_name', :'migration_checksum');\n"
    echo 'commit;'
  } | psql "$DATABASE_URI" --set ON_ERROR_STOP=1 \
    -v migration_name="$migration_name" -v migration_checksum="$migration_checksum" >/dev/null
done
receipt="$(psql "$DATABASE_URI" --no-align --tuples-only --quiet --set ON_ERROR_STOP=1 --command "select platform_commit_sha from lsites_ledger.platform_migration_receipts where platform_commit_sha = '$LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA';" | tr -d '[:space:]')"
[ "$receipt" = "$LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA" ] || { echo 'platform migration receipt readback failed' >&2; exit 78; }
echo 'LiNKsites Supabase/Postgres migrations applied successfully with verified Platform prerequisite.'
