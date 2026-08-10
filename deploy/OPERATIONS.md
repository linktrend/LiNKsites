# LiNKsites Phase 2 deployment and operations manual

This document prepares a deployment. It does not authorize or perform VPS,
DNS, public-domain, Cloudflare, Traefik, or customer-data changes.

## Topology and privacy

The `edge` network is the existing Traefik network; `internal` is a Docker
internal network. Only Traefik may reach CMS and web-master. CMS has a named
private middleware. Preview has a different named private middleware and must
also enforce its application-level preview token. Neither router is a wildcard
public route. Private preview responses retain `noindex, nofollow`; DNS/domain
activation is a separate LiNKreach-authorized Phase 2 operation.

## Ordered deployment

1. Build all four images from an exact Git revision and record registry digest.
2. Generate and review the release manifest.
3. Render the protected runtime environment file outside Git. Run preflight.
4. Confirm the named Traefik network and privacy middlewares already exist.
5. Run the one-shot `supabase-migrate`, then `payload-migrate`; neither may be
   bypassed. The first requires a verified Platform migration SHA. The
   migration job records each filename and SHA-256 checksum, refuses altered
   applied files, and executes each new file plus its history receipt in one
   transaction. This source contract is VPS-only proof; no local migration is
   performed in Phase 1.
6. Start the long-running services and run
   `deploy/scripts/postdeploy-smoke.sh <protected-runtime-env-file>`. The
   script executes from `web-master` over Compose service DNS and localhost;
   it reads the protected preview token inside the container and never accepts
   or logs a token-bearing URL.

The orchestrator must run with `W2_02_MODE=production`, a UUID
`W2_02_ORG_ID`, a UUID `W2_02_SITE_ID`, explicit `W2_02_DATABASE_ROLE`,
absolute `W2_02_APPROVED_FACTS_PATH`, the distinct `W2_02_DATABASE_URI`
least-privilege credential, and the exact packaged
`W2_02_POSTGRES_ADAPTER_MODULE=@linksites/program-orchestrator/postgres-adapter`,
and the release-pinned `LINKLIBRARIES_ARTIFACT_PATH` Git checkout. Compose
passes the distinct URI to the adapter's `DATABASE_URI` name only inside the
orchestrator container; CMS/worker/migration services retain their separate
`DATABASE_URI`. No credential or preview token belongs in the image or this document. The
orchestrator's `W2_02_PREVIEW_ACCESS_TOKEN` is distinct from the web-master
variable name and is required by the production orchestrator path; it must match
the protected token web-master receives so the internal preview proof can
authenticate.
7. Do not expose a public DNS name or publish Payload content in this procedure.

## Backup, retention, and restore

Back up four classes together: Payload/Postgres data and migrations, Supabase
working content and Ledger/evidence, durable LiNKautowork outbox, and media
with checksums/provenance. Encrypt backups at rest with a separately managed
key, retain daily 35 days/monthly 12 months unless a customer/legal policy is
stricter, and verify every backup using an isolated restore. `pnpm
deploy:restore-rehearsal` is the committed disposable local fixture rehearsal;
it proves file-class integrity, noindex private serving, and no public
activation. It does **not** claim to restore a hosted production database.

## Alerts and runbooks

The orchestrator's `/metrics` exposes backlog (`active_issues`), retries,
dead letters, manual attention, and completion delivery counts. Alert when a
dead letter/manual-attention value is nonzero, retry count increases for 15
minutes, readiness is non-200 for 5 minutes, or a backup checksum/rehearsal
fails. Use structured JSON logs with correlation ID; do not place content,
tokens, secrets, credentials, or URL query tokens in logs.

| Incident | Safe response |
|---|---|
| Stalled Program / retries | Pause intake, preserve Ledger/outbox, inspect run and gate evidence by correlation ID, then retry only the ready Issue. |
| Dead letter | Do not replay blindly. Preserve receipt, classify boundary failure, obtain owner decision, and create a new fenced attempt. |
| Payload failure | Keep preview private, check CMS readiness/migration state, restore only after checksum verification. |
| Working-store failure | Pause promotion; restore working content and Ledger together, then rerun content gates. |
| Migration failure | Stop before app services. Diagnose the exact migration; never edit an already-applied migration. Use a compatible forward migration. |
| Preview failure | Keep Traefik privacy middleware enabled, check token/noindex and Payload draft readback, then rerun private preview validation. |
| Credential rotation | Use gateway/CMS dual-key overlap, stop/drain outbox as required, rotate one service group, run readiness and signed-boundary proof, then revoke old key. |
| Privacy incident | Immediately disable affected Traefik router, revoke preview token/API key, preserve evidence, assess exposure, and restore only private draft state. |

## Rollback

Roll back the application image only when the target revision is compatible
with the already-applied database schema. Every migration is forward-only:
after an irreversible data transformation, the point of no return is the
successful migration job. Restore from a verified backup into an isolated
environment first; do not roll a database backward in place. Record release
SHA, migration list, manifest digest, and evidence before declaring recovery.
