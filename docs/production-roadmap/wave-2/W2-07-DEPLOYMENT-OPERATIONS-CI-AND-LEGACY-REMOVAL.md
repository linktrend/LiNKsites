# W2-07 — Deployment, Operations, CI, and Legacy Removal

**Status:** Implementation complete in the release candidate; runtime proof deferred to Phase 2 VPS execution
**Wave:** 2
**Executor:** one or more Luna High agents with non-overlapping lanes; integrated by the master
**Boundary:** prepare deployable artifacts only; do not access or mutate the VPS

## Outcome

Produce a reproducible, secure, observable, backup-aware deployment bundle and CI/release gate that can be installed in Phase 2 without additional product coding. Remove approved inactive duplicates and prevent legacy paths from shipping.

## Required deliverables

### Build and release

1. Reproducible pinned builds for orchestrator, CMS, `web-master`, and required workers/migrations.
2. Production container/service definitions with non-root execution where supported, health checks, resource limits, graceful shutdown, restart policy, and immutable image/version labels.
3. A versioned deployment manifest listing exact repository SHA, LiNKlibraries SHA(s), image digests, schema versions, and configuration schema.
4. Preflight and post-deploy smoke commands that fail closed.

### Configuration and secrets

5. One environment-variable/configuration reference: purpose, owner, secret/non-secret, required/optional, format, rotation effect, and which service receives it.
6. Validate configuration at startup. No production default credentials, localhost assumptions, or mock-mode fallbacks.
7. Keep secrets out of images, Git, browser bundles, logs, evidence, and health responses.

### Networking and privacy

8. Document/containerize intended Traefik/internal network topology, ports, TLS route assumptions, private preview authentication/privacy wall, noindex behavior, and service-to-service access.
9. Prepare but do not execute public DNS/domain operations.

### Data and recovery

10. Migration ordering and one-shot migration job/process for Supabase/Postgres and Payload data stores.
11. Backup and restore procedure for CMS, working content, Ledger/evidence, and required media; include retention/encryption/verification expectations.
12. Prepare the automated recovery rehearsal. Its execution against the deployed environment is a Phase 2 VPS gate; do not describe the unexecuted rehearsal as a pass.

### Observability and operations

13. Structured correlated logs, health/readiness, metrics for work backlog/runs/retries/gates/completions/event delivery, and documented alert thresholds/runbooks.
14. Runbooks for stalled Program, dead letter, Payload failure, working-store failure, migration failure, preview failure, credential rotation, rollback, backup restore, and privacy incident.
15. Rollback procedure that respects forward-only database compatibility and identifies point-of-no-return decisions.

### CI and repository cleanup

16. CI must install cleanly and run formatting/lint, typecheck, builds for every production application including CMS, unit/integration tests, Supabase migrations/RLS, real local Payload integration, browser E2E, artifact/container build, secret/dependency scanning, and evidence summary.
17. Required checks must fail on skipped required suites or absent services.
18. Remove `apps/web-company` from the active workspace and deployment after confirming no dependency. Preserve any needed history through Git, not an active duplicate.
19. Remove/archive retired mirror-sync and direct raw-n8n entry points. Remove mock content from production paths.
20. Reconcile READMEs, intent/PRD/operations/open issues and deployment manual with the executable system.

## Acceptance gates

- The source includes documented build, preflight, migration, startup, health, backup, restore, rollback, and shutdown procedures for the exact candidate.
- The deployment bundle has been independently source-audited and integrated through the governed branch path.
- `web-company` and retired integrations are absent from active build/deploy surfaces.
- Runtime stack startup, migration execution, private-preview rendering, backup/restore, and rollback evidence are required Phase 2 VPS gates. They are not claimed as completed by this packet.
- No VPS/live external mutation occurs under this packet.

## Evidence and handoff

Provide the exact SHA, deployment source/manifest generator, config-name matrix, topology, operations manual, legacy-removal search results, clean Git status, and Phase 2 preflight checklist. Phase 2 provides the build/image digests and runtime backup/restore/rollback evidence.
