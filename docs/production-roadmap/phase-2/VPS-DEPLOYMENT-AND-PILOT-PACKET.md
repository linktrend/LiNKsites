# Delivery Phase 2 — VPS Deployment and One-Website Pilot Packet

**Status:** Planned — separately authorized only after Delivery Phase 1 PASS
**Executor:** Terra master coordinating narrowly scoped Luna High operators/implementers
**Independent audit:** Codex Sol Medium at deployment readiness and final pilot evidence
**Live-change warning:** This packet mutates VPS services, databases, secrets, routing, and private hosting. It must not begin under Phase 1 approval.

## Objective

Deploy the exact Phase 1 release candidate onto the approved VPS, configure its production dependencies and private access safely, then run one manually supplied lead/research package through the real continuously operating LiNKsites Program. Success is one complete private website and one CRM-shaped completion record with end-to-end evidence.

This pilot excludes payment, sales, public customer launch, customer-domain activation, and post-sales.

## Entry gate

Do not proceed unless all are true:

1. Phase 1 exact SHA and image/artifact digests have a final Sol Medium `PASS`.
2. The repository and release worktrees are clean and the exact commits are pushed/available.
3. The Principal explicitly authorizes this Phase 2 packet and names the target VPS/environment.
4. Target inventory, access method, maintenance window, change owner, and rollback decision-maker are recorded.
5. Required secret/configuration values are available through the approved secret channel; never paste values into issues, chat, Git, or evidence.
6. Backup destinations, retention, encryption, restore target, and available disk/capacity are verified.
7. Cloudflare/Traefik/private preview responsibilities and allowed mutations are confirmed.
8. The manually supplied lead fixture is approved, legally usable, and schema-valid.

If a prerequisite is missing, stop without changing live state.

## Phase 2 work packs

### P2-01 — Target discovery and immutable deployment plan

**Mode:** read-only until approved plan checkpoint.

1. Record OS/runtime, CPU/RAM/disk, network interfaces, firewall, current services, Docker/container runtime, volumes, reverse proxy, certificates, DNS/Cloudflare state, monitoring, backup tools, time sync, and port conflicts.
2. Identify existing Payload/Supabase/Postgres/LiNKautowork dependencies and whether they are local, managed, or external. Do not assume architecture from local Compose.
3. Verify all required outbound/inbound network routes without exposing secrets.
4. Compare target state to the Phase 1 deployment manifest and produce exact intended changes, commands, affected services, order, health gates, downtime, backup, rollback, and stop conditions.
5. Obtain the Principal's live-change approval if the approved Phase 2 authorization did not already cover the discovered exact actions.

**Gate:** target-specific plan, backup/rollback, and exact artifacts are accepted; no unresolved critical capacity/network/security conflict.

### P2-02 — Backups, directories, identities, and secrets

1. Take and verify recoverable pre-change backups of every affected data/configuration surface.
2. Create only explicit application directories/volumes and least-privilege service identities.
3. Install/inject secrets using the approved mechanism with restrictive permissions and rotation ownership.
4. Validate configuration names/formats without printing values.
5. Record backup identifiers, checksums where appropriate, restore command/procedure, ownership, and expiry.

**Gate:** an independent restore validation or safe sampled restore proves the pre-change recovery path before migrations/deployment.

### P2-03 — Deploy data services and apply migrations

1. Pull/build only the exact audited artifacts or verify digests before use.
2. Start required database/data services in dependency order with health checks and persistent volumes.
3. Apply reviewed migrations using the one-shot migration process. Capture schema versions and sanitized results.
4. Verify RLS/roles, connectivity from intended services, and denial from unintended networks/identities.
5. On any migration or integrity failure, stop; do not improvise destructive repair. Follow rollback/restore decision rules.

**Gate:** databases healthy, schema versions exact, isolation smoke tests pass, and backup remains usable.

### P2-04 — Deploy CMS, orchestrator, frontend, and workers

1. Deploy Payload CMS, orchestrator, `web-master`, and required workers/adapters using exact image digests.
2. Validate non-root/runtime identity, resource limits, restart policy, health/readiness, dependency readiness, logs, and graceful restart.
3. Confirm the production composition root is active and continuously polling the configured manual/CRM-shaped intake boundary.
4. Confirm optional YouTube behavior, public activation, and any unapproved integrations are disabled.
5. Do not load test-success records manually into downstream stores.

**Gate:** all services healthy after controlled restart; no retry storm, stuck migration, secret leakage, or mock mode.

### P2-05 — Traefik, Cloudflare, TLS, and private preview

1. Configure only the approved hostnames/routes. Unknown hosts must fail closed.
2. Configure TLS and proxy headers according to the target topology.
3. Enforce the approved private access wall and confirm unauthorized denial.
4. Verify `noindex,nofollow`, robots behavior, cache controls, and no discovery through sitemap/public indexes.
5. Ensure CMS/admin/database ports are not publicly exposed beyond the approved access boundary.
6. Do not configure a customer production domain or public launch.

**Gate:** TLS/private access/security headers/unknown-host/noindex behavior pass from an external test perspective.

### P2-06 — Observability, backup, and rollback rehearsal

1. Verify structured logs/correlation across intake, Program/Issue/Run, content, promotion, render, event, and completion.
2. Verify metrics/alerts for health, backlog, retries, gates, completion, delivery failures, resources, certificates, backups, and storage.
3. Execute a production backup and restore to an isolated validation target where safe.
4. Rehearse non-destructive rollback/previous-version start or the approved equivalent, including database compatibility decision points.
5. Confirm runbook commands and escalation owners.

**Gate:** monitoring and recovery are operational evidence, not only documents.

### P2-07 — One-website completion test

#### Test input

Use one Principal-approved `LeadResearchPackage` supplied through the manual adapter. It must be representative of the future CRM payload and use a unique lead ID, correlation ID, and idempotency key. Record its checksum, not sensitive raw contents, in the evidence index.

#### Execution

1. Submit the input once and let the continuous runtime pull it normally.
2. Observe without bypassing gates or editing downstream state.
3. Confirm the Program creates the full Module/Phase/Issue graph and runs independent Issues in safe parallelism.
4. Confirm exact-SHA complete template-package consumption, real prospect-specific copy/text adaptation using bundled assets, immutable working version, provenance, library SHA receipt, Payload draft promotion/read-back, separate private publication, `web-master` render, and validation gates.
5. Confirm one CRM-shaped completion record containing private URL, status, lead/site/correlation IDs, exact content/template/library/artifact revisions, and evidence references.
6. Submit/replay the same logical input and verify no duplicate site, promotion, deployment, or completion record.
7. Restart at one safe controlled point or exercise the approved recovery test without corrupting the successful pilot.

#### Website validation

- all required routes and content present
- lead-specific facts accurate against supplied research
- no mock/lorem/example values or unsupported claims
- navigation, links, media, and scoped forms/affordances work
- desktop/mobile responsive layouts pass
- accessibility, SEO metadata, performance budget, visual baseline, and security/privacy checks pass
- private access and noindex remain enforced
- no cross-organization/site or draft-content exposure

#### Operational validation

- services remain healthy and within resource expectations
- no uncontrolled retry/dead-letter backlog
- logs/evidence are correlated and secret-safe
- cost/usage receipts are present where applicable
- post-test backup completes and can be verified

**Gate:** every final success condition below passes. A visible homepage alone is not completion.

### P2-08 — Independent final audit and handoff

Freeze the deployed artifact/SHA/configuration-version evidence and dispatch a fresh Sol Medium auditor in read-only mode. The auditor validates the running private site, completion/evidence chain, service health, privacy boundaries, backups, and exact deployed artifacts. Any `HOLD` finding enters a Luna correction under the smallest required authority and must be re-audited.

After PASS, produce the founder handoff: what is live, how to access the private site, exact test result, known limitations, operational owners, monitoring/backup status, and which capabilities remain untested/out of scope.

## Final Phase 2 success condition

Phase 2 passes only when all of the following are evidenced:

- audited exact artifacts are running on the named VPS;
- service/data/proxy/TLS/private-access configuration is healthy and reproducible;
- one canonical manual lead package was pulled and processed by the real Program without bypass;
- one complete private Home Services / Standard website is served by `web-master` from published Payload content;
- Supabase working versions, provenance, Ledger hierarchy, Runs, gates, and receipts form one traceable chain;
- exact LiNKlibraries entry/SHA and deployment digests are recorded;
- one CRM-shaped completion record contains the private URL and evidence references;
- duplicate/restart behavior causes no duplicate logical side effects;
- privacy, noindex, tenancy, content, functional, visual, responsive, accessibility, SEO, performance, and security gates pass;
- monitoring, backup/restore, rollback, and runbooks are proven on the deployed environment;
- final Sol Medium verdict is `PASS`;
- payment, public launch/domain cutover, and post-sales were neither executed nor claimed.

## Stop/rollback conditions

Stop new work and follow the approved rollback/restore procedure on data integrity loss, migration ambiguity, credential exposure, unauthorized public access, tenant leakage, unknown artifact digest, repeated non-idempotent side effects, failed backup/restore, or inability to identify the running version. Do not make destructive repairs or broaden live access without explicit authority.

## Evidence bundle

- target inventory and approved change plan
- exact source SHAs, library SHAs, image/artifact digests, schemas, and sanitized configuration version
- backup/restore/rollback identifiers and proof
- deployment/migration/health/route/TLS/access validation results
- redacted Program/Ledger/content/promotion/publication/deployment/completion trace
- website screenshots and quality reports
- monitoring snapshot and post-test backup proof
- audit findings/corrections/final PASS
- exclusions and unresolved non-pilot work
