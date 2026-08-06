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
  ???????*) ;;
  *) echo 'platform migration proof must be an immutable SHA' >&2; exit 78 ;;
esac

for migration in /migrations/*.sql; do
  [ -f "$migration" ] || continue
  echo "Applying LiNKsites migration $(basename "$migration")"
  psql "$DATABASE_URI" --set ON_ERROR_STOP=1 --file "$migration" >/dev/null
done
echo 'LiNKsites Supabase/Postgres migrations applied successfully.'
