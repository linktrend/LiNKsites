# LiNKsites Platform catalogue registration and 000017 grant handoff

**Date:** 2026-09-13
**Issue branch:** `issue/273-complete-linksites-platform-registration-grants`
**Scope:** Platform-owned source predecessors for a real LiNKsites service catalogue slot, in-chain 000017 grants, verification SQL, and local health/grant proof.
**Live apply:** not performed.

## What was already proven and not repeated

- Sequential migration `supabase/migrations/20260804_000017_linksites_platform_rls_grants.sql` (SHA-256 `e42ff4bc6486111c3779398379c3b2a0cc1b3f9ef95b08e81677d0cc8a66cf42`) remains the current-bound grant. It was not rewritten.
- Local 000017 postgres provider proof of 2026-08-31 remains the local grant receipt. It is not a hosted receipt.
- Provider-trust fixture `packages/contracts/fixtures/provider-trust/valid-v1.json` remains the LiNKsites stage positive fixture (`service-linksites-stage`, `linksites.advisory.projection.read` only).

## Source completed on this branch

| Surface | Path |
|---|---|
| Service catalogue slot | `infra/services/sites-service.yaml` |
| Grant verification SQL | `supabase/verification/20260804_000017_linksites_platform_rls_grants.verify.sql` |
| Catalogue/health source assert | `scripts/assert-linksites-platform-catalogue-registration.py` |
| In-chain 000017 identity | `scripts/assert-current-bound-000017-identity.py` |
| Local grant proof | `scripts/test-linksites-platform-rls-grants.sh` (Docker or local initdb) |

`scripts/assert-current-bound-000017-identity.py` previously required 000017 to be the filename-sort tip. That was a lock defect after 000018–000023 were admitted. The script now binds 000017 as an in-chain file whose bytes still match the 2026-08-31 local proof.

## Hosted state

No `LINKTREND_PLATFORM_STAGE_*` or `PROD` database/API values were present in the executor environment. `gcloud` was not installed. Docker was unavailable; local PostgreSQL initdb is the grant-proof runtime when present. `infra/environments/production.yaml` remains `enabled: false`. No stage or production mutation was attempted.

Exact HOLD: `docs/evidence/phase-1/LINKSITES-PLATFORM-HANDOFF-HOLD-2026-09-13.json`
Code: `LINKTREND_PLATFORM_STAGE_THEN_PROD_APPLY_AUTHORITY_ABSENT`

## Non-claims

- No stage or production migration application receipt.
- No live least-privilege readback against hosted Supabase.
- No GSM secret create for `LINKTREND_PLATFORM_{STAGE,PROD}_SITES_*` names.
- Environment YAML slots and `infra/secrets/gsm-inventory.md` were outside this issue's allowed paths and were not edited.
