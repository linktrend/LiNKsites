# LiNKsites Server03 operations (one production installation)

This document is sequential source for operating and recovering exactly one
LiNKsites Server03 installation named `linksites-foundation`. It prepares
later authorized work. It does **not** authorize or perform deployment, VPS
mutation, DNS, Cloudflare, Traefik edits, database writes, or image pulls
from this packet.

Signal names, thresholds, inspection commands, healthy state, and
alert responses are in [`monitoring/SIGNALS.md`](./monitoring/SIGNALS.md).
Validate rules with `node deploy/monitoring/validate-rules.mjs` and, when
present, `promtool check rules deploy/monitoring/server03-foundation.rules.yml`.
Import those rules only after the `linksites-server03-foundation` scrape
target and `/var/lib/linksites/metrics/linksites.prom` textfile exist.

## STOP conditions

STOP and do not continue the current step when any of the following is true:

1. This session is LSOPS-01 source work: do not start Compose, Docker, Traefik,
   databases, or Server03 services.
2. Founder/Phase 2 authority for live change is absent.
3. The five image references are missing, mutable (`latest`), or do not match
   the bound release manifest.
4. `LINKSITES_PLATFORM_STATE` is not `ready` or
   `LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA` is missing or fabricated.
5. CMS and orchestrator database URIs are the same identity, loopback, or not
   LiNKsites.
6. A command would target a Docker project other than `linksites-foundation`
   (production) or `linksites-restore-rehearsal-<UTC>` (isolated restore).
7. A restore would attach `linksites-foundation_linksites-runtime` or overwrite
   production Postgres.
8. Backup encryption secret `LINKSITES_BACKUP_ENCRYPTION_SECRET` is absent, or
   a checksum does not match `identity.json` before restore.
9. Privacy middleware, TLS, or noindex cannot be proven; or a URL would be
   logged with a token or query credential.
10. Disk is below 15 percent on `/`, `/var/lib/linksites`, or `/var/lib/docker`
    and the only remaining space would require deleting production volumes.
11. Mixed five-digest images, an unknown digest, or a failed migration job.
12. Cross-tenant data, public activation, or unrelated database/project names
    appear in the command.

## 1. Startup (later authorized Server03 gate only)

Do not run these commands during LSOPS-01. They are the ordered later sequence.

1. Confirm STOP conditions 1–12 are clear.
2. Render the protected runtime environment file outside Git. Never commit it.
3. `bash deploy/scripts/preflight-server03-foundation.sh <protected-runtime-env-file> <release-manifest.json>`
4. Apply one-shot migrations, never bypassed, never in parallel with serving:

   `docker compose --project-name linksites-foundation --env-file <protected-runtime-env-file> -f deploy/docker-compose.server03-foundation.yml run --rm supabase-migrate`

   then

   `docker compose --project-name linksites-foundation --env-file <protected-runtime-env-file> -f deploy/docker-compose.server03-foundation.yml run --rm payload-migrate`

5. Start only the four long-running services from the same five-digest
   manifest: `payload`, `web-master`, `autowork-worker`, `program-orchestrator`.
6. `bash deploy/scripts/postdeploy-server03-foundation-smoke.sh <protected-runtime-env-file>`
7. STOP before public DNS, customer launch, or template-dependent publishing
   while `LINKSITES_TEMPLATE_RELEASE_STATE=deferred`.
8. `LINKSITES_AUTOWORK_MODE` remains `manual` until an admitted live handoff
   exists. Do not set fake live Autowork fields.

## 2. Health

From the `linksites-foundation` project only:

1. `docker compose --project-name linksites-foundation ps`
   Expected: `payload`, `web-master`, `autowork-worker`, `program-orchestrator`
   healthy; migrate jobs exited 0.
2. Internal HTTP only: Payload `/api/readyz`, web-master `/api/readyz`,
   orchestrator `/readyz` and `/metrics`. Worker has no HTTP ready endpoint;
   use Docker health.
3. Confirm running `name@sha256` values match the five image fields on the
   bound manifest. Write `linksites_release_digest_match 1`.
4. Confirm private Traefik routers still name the existing CMS and preview
   privacy middleware, TLS is on, and preview `x-robots-tag` includes
   noindex. Record only 0/1 metrics, never the URL or token.
5. Confirm Platform/provider HOLD metrics: deferred provider is healthy;
   pending Platform after intended run is HOLD.

## 3. Alerts

1. Group by `installation=linksites-foundation` and `service`. Inhibit
   downstream HTTP alerts when the foundation target is down.
2. Treat dead letters and manual attention as critical even if intake is
   otherwise normal. Do not add an alert that fires merely because intake is
   enabled.
3. On alert: capture the alert name, `release_sha` if present, service, and
   time. Do not copy log bodies that may contain customer content.
4. Follow the Response / rollback column in `monitoring/SIGNALS.md`.
5. After two failed bounded recreates of the same service, escalate. Do not
   invent a second installation.

## 4. Backup

Back up only LiNKsites-authorized classes for this installation. Encrypt with
restic using the runtime-provided `LINKSITES_BACKUP_ENCRYPTION_SECRET`. Write
SHA-256 checksums for every artifact. Do not dump `platform`, `auth`,
`storage`, `vault`, other Supabase projects, or unrelated Docker volumes.

1. STOP if the encryption secret reference is unset (check the name only).
2. Write `identity.json` with release SHA/tree, config schema version, five
   image digests, Platform migration SHA, Payload/LiNKsites migration
   checksums, and Autowork/template states. No secret values.
3. Logical dump of Payload `public` tables plus `lsites_sites` and
   `lsites_ledger` from the CMS URI host/database only.
4. Archive `/var/lib/linksites/program`, the Autowork outbox path, media under
   `/var/lib/linksites`, and the release manifest.
5. `restic backup` those files into the configured repository. Record snapshot
   ID and SHA-256.
6. `restic check`.
7. Apply retention: keep daily copies 35 days and monthly copies 12 months
   unless a stricter customer/legal policy exists. `restic forget` must not
   run against a repository that failed `check`.
8. Emit textfile metrics `linksites_backup_last_success_timestamp_seconds` and
   `linksites_backup_last_attempt_result`. Failed attempts set result `0` and
   must not pretend success.

## 5. Isolated restore rehearsal

Production is never the restore target. Real end-to-end restore against
Server03 is a later gate. This repository's `node
deploy/scripts/rehearse-local-restore.mjs --plan-only` is the deterministic
static plan. A missing Docker engine is an environment HOLD, not a restore
receipt.

When Docker and an authorized disposable target exist:

1. Create `RESTORE_ID=linksites-restore-rehearsal-$(date -u +%Y%m%dT%H%M%SZ)`.
   STOP unless it matches `^linksites-restore-rehearsal-[0-9]{8}T[0-9]{6}Z$`.
2. Create a separate database name matching
   `linksites_restore_<same-stamp>` and a disposable runtime env that points
   only at that database and at volume `${RESTORE_ID}_linksites-runtime`.
3. Verify checksums and `identity.json` **before** any restore write.
4. Restore into `--project-name "$RESTORE_ID"` only. Prove migrations, Payload
   data, site pins, completion, outbox, media, and noindex.
5. Never run `docker compose --project-name linksites-foundation down --volumes`.
6. Clean up only `$RESTORE_ID`:

   `docker compose --project-name "$RESTORE_ID" down --volumes --remove-orphans`

7. Write `linksites_restore_rehearsal_last_success_timestamp_seconds` only
   after those proofs. Plan-only output must keep `restoreExecuted: false`.

## 6. Incident

| Incident | Safe response |
|---|---|
| Stalled Program / retries | Pause intake, preserve Ledger/outbox, inspect by correlation ID, retry only the ready Issue. |
| Dead letter | Do not replay blindly. Preserve receipt, classify, owner decision, new fenced attempt. |
| Payload / Postgres failure | Keep preview private. Restore only after checksum verification into isolation. |
| Working-store failure | Pause promotion. Restore `lsites_sites` and `lsites_ledger` together. Do not restore `platform`. |
| Migration failure | STOP before app services. Never edit an applied migration. Forward-only or isolated restore. |
| Preview / noindex / private route | Keep Traefik privacy middleware. Disable the affected router if exposure is possible. |
| TLS | Keep private. Do not publish DNS. |
| Autowork live without admission | STOP. Return `LINKSITES_AUTOWORK_MODE=manual`. |
| Provider HOLD + publish attempt | STOP intake and publishing. Deferred provider is the expected first state. |
| Disk / memory pressure | Recreate the named LiNKsites service or free restore leftovers. Never delete production volumes. |
| Backup failure / stale restore proof | Re-run backup or isolated restore. Do not claim production recovery. |
| Privacy incident | Disable the affected router, revoke preview token/API key through the secret channel, preserve evidence, restore only private draft state. |
| Credential rotation | Dual-key overlap, drain outbox, rotate one service group, prove readiness, revoke the old key. Never print values. |

## 7. Rollback to the prior five-digest manifest

Roll back application images only when the target revision is compatible with
the already-applied database schema. Every migration is forward-only.

1. STOP intake and disable the private routers if serving mixed or unknown
   digests.
2. Identify the previous accepted release manifest with five `sha256:` digests.
3. Confirm schema compatibility. If the current schema is newer than the
   prior images, STOP image rollback and use isolated restore of a compatible
   backup instead of in-place downgrade.
4. `docker compose --project-name linksites-foundation --env-file <protected-runtime-env-file> -f deploy/docker-compose.server03-foundation.yml up -d`
   using the prior five digest environment values only. Do not change
   Dockerfiles here.
5. Re-run the Server03 smoke script. Confirm digest match, health, noindex,
   and privacy middleware.
6. Record the prior and current release SHAs. Do not alter a released
   manifest in place.

## 8. Escalation

Escalate to the Principal when STOP conditions remain after the bounded
response, when data integrity is uncertain, when privacy may have failed, when
backup/restore cannot be proven, or when authority for live Autowork,
Platform, DNS, or public launch is required. Include alert name, release SHA,
service, time, and redacted fingerprints only.

OpenClaw may explain the incident. It does not replace Prometheus evaluation or
this runbook.

## Environment-only HOLD (this cloud workspace)

- Docker is not present: do not execute Compose or claim a restore receipt.
- `promtool` is absent: repository YAML validation still runs; Server03 must
  re-run `promtool check rules` before reload.
- Deployment remains a later one-time Server03 gate.
