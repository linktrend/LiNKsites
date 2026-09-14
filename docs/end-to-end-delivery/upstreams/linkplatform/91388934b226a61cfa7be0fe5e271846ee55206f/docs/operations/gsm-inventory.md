# GSM secret-name inventory — LiNKsites Platform binding

Timezone: **Asia/Taipei (CST, UTC+8)**
Updated: `2026-09-13`
Authority: ADR 0009; `infra/services/sites-service.yaml`; sequential migration `000017`

## Purpose

List Google Secret Manager (GSM) secret **names** required to bind the registered LiNKsites catalogue slot (`sites-service`) to Platform stage and production. This file is definitions-only. It does **not** contain values, does **not** create secrets, and does **not** grant injectors.

Brain, Skills, Librarian, deploy-automation, and PACI names remain in `infra/secrets/gsm-inventory.md` (not rewritten by this Issue 273 slice).

## Current interim state

| Item | State |
|---|---|
| Authoritative target store | GSM (Studio standing rule) |
| GSM write/verify from this source worker | **Blocked** unless an authorised `gcloud`/GSM session is present |
| Tracked secret values in git tree | None expected; do not add any |
| Production enablement | `infra/environments/production.yaml` remains `enabled: false` |

## Required names — stage (`LINKTREND_PLATFORM_STAGE_SITES_*`)

These names are copied from `infra/services/sites-service.yaml` `credential_secret_refs`. Do not invent additional SITES names.

| Secret name | Purpose (metadata only) | Consumed by (slot) |
|---|---|---|
| `LINKTREND_PLATFORM_STAGE_SITES_RUNTIME_CREDENTIAL_REF` | Scoped LiNKsites runtime credential metadata/ref | `sites-service` stage (`sites-runtime-stage`, role `svc_linksites_runtime`) |
| `LINKTREND_PLATFORM_STAGE_SITES_LEDGER_CREDENTIAL_REF` | Scoped LiNKsites ledger credential metadata/ref | `sites-service` stage (`sites-ledger-stage`, role `svc_linksites_ledger`) |

## Required names — production (`LINKTREND_PLATFORM_PROD_SITES_*`)

| Secret name | Purpose (metadata only) | Consumed by (slot) |
|---|---|---|
| `LINKTREND_PLATFORM_PROD_SITES_RUNTIME_CREDENTIAL_REF` | Scoped LiNKsites runtime credential metadata/ref | `sites-service` prod (`sites-runtime-prod`, role `svc_linksites_runtime`) |
| `LINKTREND_PLATFORM_PROD_SITES_LEDGER_CREDENTIAL_REF` | Scoped LiNKsites ledger credential metadata/ref | `sites-service` prod (`sites-ledger-prod`, role `svc_linksites_ledger`) |

## Related Platform names (not created here)

Hosted apply of sequential `000017`, when separately authorised, uses the existing PACI database-URL names whose login role is `svc_platform`:

- `LINKTREND_PLATFORM_STAGE_PACI_DATABASE_URL`
- `LINKTREND_PLATFORM_PROD_PACI_DATABASE_URL`

Those names are recorded in `infra/secrets/gsm-inventory.md` (production PACI table) and the PACI runbook. This file does not create them.

## Hard stops

- Do not paste secret values into this file, evidence, or chat
- Do not treat `.env` as production authority
- Do not run `gcloud` secret create/update until Principal/env gates and working auth allow it
- Do not enable production from this inventory
- Broad `service_role` credentials remain forbidden for LiNKsites production runtime
