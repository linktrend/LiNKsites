# LiNKsites Platform catalogue registration

**Scope:** Register the LiNKsites consumer slot on Platform and prove the existing 000017 helper grants. This is not authorization to enable the service or apply SQL to shared databases.

**Authority:** ADR 0006 service slots; ADR 0005 / migration-application runbook for apply; sequential migration `20260804_000017_linksites_platform_rls_grants.sql`.

## Source identity

1. Confirm the work branch and that 000017 bytes still match the 2026-08-31 local proof:

```bash
python3 scripts/assert-current-bound-000017-identity.py
python3 scripts/assert-linksites-platform-catalogue-registration.py
```

2. Confirm the catalogue file `infra/services/sites-service.yaml` remains `enabled_by_default: false` and `broad_service_role_in_production: forbidden`.

3. Local grant proof (disposable Postgres only):

```bash
./scripts/test-linksites-platform-rls-grants.sh
```

## Hosted apply (stage then production)

Use `@linktrend/platform-migration-control` `platform-migrate apply` only when:

- stage `enabled` and Principal env gate allow apply;
- encrypted backup + isolated restore receipts exist;
- `PLATFORM_MIGRATE_ALLOW_LIVE=1` and `--i-understand-live-apply` are used;
- the DSN login is `svc_platform` from GSM name `LINKTREND_PLATFORM_STAGE_PACI_DATABASE_URL`, then the production name after a separate production approval.

Post-apply, run `supabase/verification/20260804_000017_linksites_platform_rls_grants.verify.sql` as a single read-only statement. Do not fabricate receipts if the command cannot run.

LiNKsites still owns creation of `svc_linksites_runtime` and `svc_linksites_ledger`. Platform does not create those roles.

## Health

Catalogue health paths are `/healthz` and `/readyz`. Until live endpoints exist they remain placeholders. Source health is the catalogue assert plus local grant proof. Live health is a separate hosted receipt.
