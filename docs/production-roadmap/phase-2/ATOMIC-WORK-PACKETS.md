# LiNKsites Atomic Work Packets

Status: prepared for founder review; dispatch is not authorized
Execution rule: each packet receives one governed issue identity, one isolated worktree where source changes are required, a checkpoint commit/push, focused validation, and a machine-readable completion record.

## Common packet contract

Every executor must:

1. Read `AGENTS.md`, the packet, the exact protected base identity, and only the relevant local skills/references.
2. Run `agentsetup` for a new source packet or `agentcomply` for already-open work. Do not ask the founder to invent an issue number or branch name.
3. Record `repository`, `baseCommit`, `baseTree`, `branch`, `worktree`, `allowedPaths`, `forbiddenPaths`, `dependencies`, and `acceptanceChecks` before editing.
4. Preserve user-owned dirty work and unrelated changes. Stop if an allowed path overlaps unknown dirty work that cannot be isolated.
5. Use Cursor SDK/API with Grok 4.6 Medium, Fast off, explicit repository/ref/commit/tree readback for ordinary engineering. Do not use the local Cursor CLI login as authority.
6. Make only the packet’s changes. Do not merge, self-review, promote, or deploy.
7. Run the packet’s focused checks; repair ordinary defects for no more than three cycles.
8. Commit and push the checkpoint, write sanitized evidence, and mark review-ready through the installed 2.5.2 lifecycle.
9. Report `completed`, `completed_needs_fix`, `missing`, or `blocked_by_founder_input`. Do not use invented PASS labels.

## File ownership map

| Lane | Exclusive primary paths |
|---|---|
| Trust | `.github/workflows/**`, `.github/linktrend-secret-scan-fixtures.json`, `scripts/gitops/**`, trust-specific tests/docs |
| Provider/runtime | `apps/web-master/src/templates/**`, `apps/web-master/src/lib/template-*`, `packages/factory-catalog/**`, provider-specific orchestrator adapters/tests |
| Deployment | `deploy/**`, except monitoring files assigned to Operations |
| Operations | `deploy/monitoring/**`, backup/restore/runbook additions |
| Consolidation | evidence/index files only; source conflicts are returned to the owning lane |

No two simultaneous packets may own the same file. A discovered overlap is resolved by sequencing, not by parallel edits.

## Wave 0 — Certainty and preservation

### LS-PRE-001 — Freeze current identities

- Type: read-only coordinator packet
- Dependencies: none
- Objective: capture the exact pre-execution state immediately before dispatch.
- Actions:
  1. Fetch remote refs without pruning or deleting anything.
  2. Record protected branch commit/tree identities, open PR heads, ruleset IDs/rules, and required checks.
  3. Record primary checkout branch/status and checksum the user-owned `apps/cms/next-env.d.ts` without reading secrets.
  4. Record Server03 host, Docker version, running projects/containers, networks, disk/capacity, LiNKsites directories, database/role names, and current Traefik LiNKsites configuration.
  5. Record the direct Cursor SDK package/version and credential presence without revealing the key.
- Acceptance:
  - Every identity is an exact value or explicit `not present`.
  - No repository, GitHub, Cursor, or Server03 mutation occurred.
- Evidence: `docs/evidence/production-completion/LS-PRE-001/baseline.json` on the eventual planning branch.
- Rollback: none; read-only.

### LS-PRE-002 — Salvage and disposition all retained work

- Type: read-only analysis followed by one coordinator record
- Dependencies: LS-PRE-001
- Objective: ensure no useful work is lost or unnecessarily repeated.
- Inputs:
  - protected `development`;
  - all remote `issue/*` and `phase/*` refs;
  - open PRs 463, 473, 475, and 489 if still open at execution time;
  - historical Server03 release and Issue 470 rehearsal material;
  - user-owned primary-checkout modification.
- Actions:
  1. For each ref, calculate merge base, ahead/behind counts, patch IDs, changed files, and whether each commit’s effective patch already exists in protected development.
  2. For every unique change, compare behavior and tests to current protected source.
  3. Assign exactly one disposition: `already_integrated`, `retain_in_packet`, `superseded_with_reason`, or `unrelated_preserve`.
  4. Map retained changes to LS-SRC-001, LS-SRC-002, LS-SRC-003, or LS-OPS-001.
  5. Do not delete branches, close PRs, remove server worktrees, or modify the dirty checkout.
- Required explicit comparisons:
  - three Issue 480 variants;
  - Issues 490 and 492 against current CI/fixture binding;
  - Issue 508 against current publication manifest code;
  - Issue 511 against the complete trust-boundary requirement;
  - unique stale Phase tips against their owning issue branches.
- Acceptance:
  - Every remote ref has a disposition and evidence.
  - Every retained patch has one future owner and no duplicate owner.
  - User-owned dirty work remains byte-identical.
- Evidence: `branch-disposition.json`, `retained-change-map.md`, patch-ID inventory.
- Rollback: none; read-only.

### LS-PRE-003 — Resolve founder-owned production inputs

- Type: validation only; no secret values enter evidence
- Dependencies: LS-PRE-001
- Objective: prove that execution can obtain every required external input.
- Actions:
  1. Verify by presence/readability reference, not by printing, the CMS, Payload API, preview, LiNKautowork, outcome-gateway, database, backup-encryption, registry, and GitHub credentials.
  2. Validate the exact private CMS and preview hostnames against Tailscale DNS, Traefik rules, and certificate strategy.
  3. Resolve production organisation UUID, site UUID, Payload site identifier, and approved-facts path.
  4. Validate the LiNKautowork gateway URL, signing key ID, environment, and event-grant JSON.
  5. Record backup retention, encryption, restore target, and decision owner.
  6. Validate the founder-approved pilot input and record only its checksum and non-sensitive classification.
- Acceptance:
  - Every item in PRD section 7 is `PASS` with a sanitized probe or has one exact founder action.
  - No placeholder is treated as a value.
- Stop condition: a missing founder-controlled value is reported as one concrete action; source work that does not depend on it may continue only after execution approval.
- Evidence: redacted `production-input-readiness.json`.

### LS-PRE-004 — Bind execution routes and workspaces

- Type: read-only/prepared intent; no dispatch
- Dependencies: LS-PRE-001, LS-PRE-002
- Objective: prove that each future agent can be launched on the correct repository and exact base.
- Actions:
  1. Verify the running LiNKdeveloper factory has `@cursor/sdk` and credential presence.
  2. Prepare, but do not submit, one request per source packet with `repos[]`, exact starting ref, base commit/tree, Grok 4.6 Medium, and Fast false.
  3. If an existing named LiNKsites Cursor cloud environment exists, record whether its repository/ref is current; update is deferred until execution approval. It is convenience metadata only.
  4. Define idempotency keys and archive-on-mismatch behavior.
  5. Define isolated worktree roots and ensure they do not overlap the primary dirty checkout.
- Acceptance:
  - Every source packet has a valid prepared route and exact repository identity.
  - No agent/run was created.
- Evidence: `prepared-dispatches.json` with no credentials.

## Wave 1 — Source completion

### LS-SRC-001 — Repair the promotion trust boundary

- Type: source engineering
- Dependencies: LS-PRE-002, LS-PRE-004
- Primary paths: `.github/workflows/**`, `scripts/gitops/**`, `.github/linktrend-secret-scan-fixtures.json`, trust tests/docs
- Objective: ensure only trusted, current, exact evidence can satisfy protected promotion.
- Required behavior:
  1. Candidate code cannot approve or generate the authoritative release check for itself.
  2. Trusted workflow code is taken from the protected default branch and never executes candidate code with privileged credentials.
  3. Verification binds repository, source branch, current protected base commit, candidate/promotion head, exact tree, Full Suite run ID/attempt/head, source PR, workflow path, artifact identity/digest, target branch, expiry, and prior-use state.
  4. The verifier checks the live protected base supplied from GitHub at verification time; self-consistency within a submitted transition receipt is insufficient.
  5. Duplicate check names, foreign check-suite producers, copied artifacts, old receipts, wrong base, wrong source branch, wrong target, replay, and candidate-authored substitutes fail closed.
  6. Ruleset contexts remain unique and correspond to the trusted workflow producer.
- Reuse:
  - retain useful Issue 511 adversarial tests;
  - evaluate Issue 490/492 fixture changes rather than duplicating them.
- Focused checks:
  - existing promotion transition tests;
  - Issue 511 adversarial cases;
  - workflow static validation;
  - secret fixture validator;
  - `git diff --check`.
- Acceptance:
  - Every adversarial case fails for the expected reason.
  - A genuine exact current candidate passes in a credential-free fixture test.
  - No proposed code can publish the authoritative check using proposed-code credentials.
- Evidence: exact command results, threat table, workflow producer identity map.
- Rollback: revert this packet checkpoint before Phase consolidation; no ruleset mutation occurs in this packet.

### LS-SRC-002 — Make `marketing-smb-v1` the real pilot provider

- Type: source engineering
- Dependencies: LS-PRE-002, LS-PRE-004
- Primary paths: provider/runtime lane paths
- Objective: reconcile the production runtime with the founder-approved provider without pretending the unfinished replacement template is ready.
- Required behavior:
  1. Production accepts exactly the pinned `marketing-smb-v1` entry from the approved LiNKlibraries commit.
  2. Admission verifies provider repository, commit, tree, catalogue bytes/checksum, entry bytes/checksum, and the consumer materialization result.
  3. The runtime configuration expresses legacy provider readiness separately from replacement-template status.
  4. `web-master`, Program orchestrator, factory catalog, release manifest, and preflight select the same exact provider.
  5. Fixture paths under tests cannot be selected in production.
  6. The unfinished native Revision 2 replacement remains explicitly excluded and cannot block legacy pilot publication.
- Reuse:
  - evaluate the three Issue 480 variants, especially template admission, orchestrator composition, publish permissions, and native validator work;
  - retain only behavior that supports the approved provider and current DoD.
- Focused checks:
  - provider catalogue/entry checksum tests;
  - production selection and fixture-rejection tests;
  - one render/materialization test using committed `marketing-smb-v1` assets;
  - orchestrator-to-renderer identity propagation tests;
  - `git diff --check`.
- Acceptance:
  - a real committed provider bundle is selectable;
  - wrong commit/tree/checksum/entry and fixture bundle fail closed;
  - resulting page data is renderable and carries exact provider provenance.
- Evidence: provider identity record and focused test receipt.
- Rollback: revert packet checkpoint; no provider repository mutation.

### LS-SRC-003 — Reconcile production deployment contracts

- Type: source engineering
- Dependencies: LS-PRE-002, LS-SRC-002
- Primary paths: `deploy/**` excluding monitoring ownership
- Objective: make release manifest, five images, runtime environment, Compose, preflight, migrations, and smoke tests agree with the approved pilot.
- Required behavior:
  1. Compose project remains `linksites-foundation` and includes exactly CMS, web-master, worker, orchestrator, and one-shot migrations behavior.
  2. Production environment schema contains no test placeholders in accepted runtime files.
  3. Five images are digest-pinned and match the release manifest.
  4. Provider fields support the admitted legacy provider and keep replacement template excluded.
  5. CMS and orchestrator database identities are distinct.
  6. Server03 networks and routes are configurable with existing `linktrend-s03-proxy` and private middleware names.
  7. Preflight verifies source SHA, tree, manifest digest, image digests, migration checksums, provider checksums, runtime schema, hostnames, data paths, and absence of fixture mode.
  8. Smoke verifies real readiness, authenticated preview, and provider provenance.
- Reuse:
  - compare Issue 508 publication workflow/manifest changes;
  - compare Issue 480 deployment/runtime changes;
  - retain current protected deployment tooling where it is already stronger.
- Focused checks:
  - deployment manifest, deployment surface, runtime contract, Compose config, preflight fixtures, smoke fixtures, migration identity tests.
- Acceptance:
  - one generated manifest can drive one production Compose configuration with five exact digests;
  - all placeholders, mutable-only tags, wrong provider states, and wrong migration identities fail.
- Evidence: generated fixture manifest, Compose render checksum, focused test receipt.
- Rollback: revert packet checkpoint.

### LS-OPS-001 — Complete monitoring, backup, restore, and rollback contracts

- Type: source engineering/documentation
- Dependencies: LS-PRE-002, LS-PRE-003
- Primary paths: `deploy/monitoring/**`, backup/restore scripts, `deploy/OPERATIONS.md`
- Objective: make operational controls executable for the exact Server03 topology.
- Required behavior:
  1. Health, backlog, retry/dead-letter, completion, certificate, backup age, storage, CPU/memory, and service restart signals are defined.
  2. Backup covers LiNKsites database/schema, Payload media/data, worker outbox/state, Program state, runtime config checksum, release manifest, and Traefik LiNKsites dynamic config.
  3. Restore targets an isolated validation location by default.
  4. Rollback never removes volumes and distinguishes application rollback from database restore.
  5. Commands identify exact Compose project and release SHA and do not affect other Server03 projects.
- Focused checks: monitoring rule validation, backup dry-run fixture, isolated restore rehearsal, runbook command lint.
- Acceptance: all required surfaces have executable commands, expected outputs, failure handling, and stop conditions.
- Evidence: rehearsal receipts and runbook checklist.
- Rollback: revert packet checkpoint.

## Wave 2 — Consolidation and source acceptance

### LS-INT-001 — Consolidate source checkpoints

- Type: coordinator integration
- Dependencies: LS-SRC-001, LS-SRC-002, LS-SRC-003, LS-OPS-001
- Objective: create one coherent candidate without hiding conflicts or repeating work.
- Actions:
  1. Verify each checkpoint is pushed and bound to its evidence.
  2. Integrate in dependency order: provider/runtime, deployment, operations, trust; resolve conflicts through the owning packet.
  3. Re-run only checks affected by conflict resolution.
  4. Confirm the primary dirty checkout is untouched.
  5. Generate exact candidate commit/tree and complete branch-disposition record.
- Acceptance: one candidate has no unresolved overlap, no missing retained patch, clean diff, and exact identity.
- Evidence: integration manifest and change-to-requirement traceability matrix.
- Rollback: abandon the integration branch; retain all packet branches.

### LS-VAL-001 — Run the one complete source suite

- Type: validation
- Dependencies: LS-INT-001
- Objective: prove the exact consolidated candidate once.
- Actions:
  1. Run repository-required lint, type checks, builds, unit/integration tests, security/secret fixture checks, deployment tests, and release validators through the existing Full Suite profile.
  2. Bind run ID/attempt, commit/tree, dependency identity, workflow identity, and artifact digest.
  3. If failure is caused by code, return to the owning packet, repair, create a new exact candidate, and rerun once on that new candidate.
- Acceptance: hosted complete source suite PASS on the exact candidate; no skipped required job.
- Evidence: immutable Full Suite receipt.
- Rollback: none; validation only.

### LS-REV-001 — Independent consolidated source/release review

- Type: independent read-only review
- Dependencies: LS-VAL-001
- Reviewer: separate Grok 4.6 High worker or founder-approved independent equivalent; never an implementer
- Scope: exact candidate vs protected base, PRD requirements, branch salvage, provider path, trust boundary, deployment, operations, tests, and receipt identity.
- Required output: first line exactly `PASS` or `FAIL`, followed by concise file/line evidence and exact candidate commit/tree.
- Acceptance: PASS with no unresolved material finding.
- Failure handling: corrections return to owning packet; one new exact review is required after substantive correction.

## Wave 3 — Protected integration and immutable release

### LS-REL-001 — Integrate to protected development

- Type: protected-source operation
- Dependencies: LS-REV-001, founder execution approval
- Actions:
  1. Package one or the minimum necessary Phase PRs.
  2. Verify expected head and current protected base immediately before merge.
  3. Use the delivery controller and required checks.
  4. If the normal publisher/controller is technically broken after bounded repair, invoke founder bootstrap with exact checkpoint, tests, independent review, and protection snapshot. Record any waived mechanism as `WAIVED`, never PASS.
  5. Read back protected `development` commit/tree and confirm expected content.
- Acceptance: protected development contains the exact accepted changes and required checks/evidence.
- Rollback: corrective PR; never rewrite protected history.

### LS-REL-002 — Promote once through staging to main

- Type: protected-source operation
- Dependencies: LS-REL-001
- Actions:
  1. Prepare the development-to-staging same-tree promotion.
  2. Verify current protected base and trusted receipt at the gate.
  3. Read back staging commit/tree.
  4. Prepare the staging-to-main same-tree promotion under founder-approved mode.
  5. Verify current protected base and trusted receipt; read back main commit/tree.
- Acceptance: development, staging, and main have the intended exact tree and auditable transition identities; no source suite is redundantly rerun for tree-neutral promotion.
- Rollback: corrective promotion PR from an accepted source; never reset protected refs.

### LS-ART-001 — Build and publish five immutable images

- Type: release operation
- Dependencies: LS-REL-002
- Actions:
  1. Build CMS, web-master, worker, orchestrator, and migrations from exact main SHA.
  2. Generate provenance and SBOM where existing workflow supports them.
  3. Publish to the approved registry.
  4. Resolve and record each immutable digest.
  5. Generate and verify the release manifest against registry readback.
- Acceptance: five unique service entries with immutable digests, exact source/tree, provider identity, migration identity, and successful manifest verification.
- Rollback: do not deploy; published immutable artifacts remain retained and unselected.

## Wave 4 — Server03 preparation

### LS-VPS-001 — Create recoverable Server03 application layout

- Type: live operation
- Dependencies: LS-ART-001, LS-PRE-003, founder execution approval
- Actions:
  1. Snapshot current service inventory and shared Traefik configuration.
  2. Create only `/srv/linktrend/apps/linksites`, its `config` and `evidence` children, `/srv/linktrend/backups/linksites`, and immutable release directory for the main SHA with restrictive ownership.
  3. Install the release control files and protected runtime environment by reference; validate permissions and absence of placeholders.
  4. Do not start services.
- Acceptance: paths, ownership, permissions, config checksum, manifest checksum, and exact release identity pass; other services unchanged.
- Rollback: move the newly created unused LiNKsites directories to a timestamped quarantine location; do not delete shared data.

### LS-DATA-001 — Prove pre-change backup and isolated restore

- Type: live data-safety operation
- Dependencies: LS-VPS-001
- Actions:
  1. Back up current `linksites` and `linksites_payload_baseline` databases/schemas and any historical LiNKsites data selected for reuse.
  2. Back up relevant Traefik LiNKsites config and historical release manifests.
  3. Encrypt/store per the resolved policy.
  4. Restore into an isolated validation database/location and verify schema/object counts and checksums.
- Acceptance: backup ID, size, checksum, retention, encryption status, restore target, and restore verification PASS.
- Stop condition: no migration or deployment proceeds without PASS.
- Rollback: none; backup operation is additive.

### LS-DATA-002 — Provision least-privilege roles and apply migrations

- Type: live data operation
- Dependencies: LS-DATA-001
- Actions:
  1. Record current schema and migration state.
  2. Create/repair distinct CMS and orchestrator roles with only required privileges.
  3. Validate tenant/site seed identities and approved facts.
  4. Run the digest-pinned migrations image once.
  5. Read back schema versions, migration identities, grants, and denial from unauthorised identities.
  6. Run the migration job again only to prove safe no-op/idempotent behavior if the migration contract requires it.
- Acceptance: exact migrations applied, roles isolated, intended connections pass, unintended access fails, backup remains available.
- Rollback: follow migration compatibility decision; restore to isolated target before any destructive replacement.

## Wave 5 — One production installation

### LS-VPS-002 — Start the LiNKsites production services

- Type: live deployment
- Dependencies: LS-DATA-002
- Actions:
  1. Verify five registry digests and release manifest again on Server03.
  2. Render Compose and verify only intended networks, mounts, roles, restart policies, health checks, and resource constraints.
  3. Start the single `linksites-foundation` project in dependency order.
  4. Wait for health; inspect sanitized logs for migration loops, retry storms, fixture mode, or secret leakage.
  5. Perform one controlled restart and verify recovery.
- Acceptance: all intended services healthy on exact digests; no other Compose project or container health regresses.
- Rollback: stop only `linksites-foundation`, select prior compatible immutable release if one exists, preserve volumes and evidence.

### LS-EDGE-001 — Enable private CMS and preview routes

- Type: live network operation
- Dependencies: LS-VPS-002
- Actions:
  1. Add exact private CMS and preview routers to the existing LiNKsites Traefik dynamic file.
  2. Attach existing private Tailscale middlewares and TLS entrypoint.
  3. Validate configuration before reload and capture the prior file checksum/copy.
  4. Verify authorised access, unauthorised denial, unknown-host denial, TLS, proxy headers, robots/noindex, and no direct database/admin port exposure.
- Acceptance: routes are private and functional; existing portfolio routes remain healthy.
- Rollback: restore the exact prior LiNKsites dynamic file and reload Traefik; do not alter unrelated dynamic configuration.

### LS-OPS-002 — Activate monitoring and scheduled backups

- Type: live operations
- Dependencies: LS-VPS-002, LS-EDGE-001
- Actions:
  1. Load and validate LiNKsites monitoring rules.
  2. Verify logs correlate intake, Program, Issue/Run, content, publication, deployment, and completion IDs.
  3. Configure backup schedule and retention.
  4. Trigger one production backup and one safe isolated restore verification.
  5. Exercise one alert path without creating a prolonged outage.
- Acceptance: dashboards/queries, alert, backup, restore, and runbook commands work against the live installation.
- Rollback: remove only LiNKsites-specific rule/schedule entries and restore their prior configuration.

## Wave 6 — Real pilot and completion

### LS-PILOT-001 — Process one real lead into one private website

- Type: live product acceptance
- Dependencies: LS-OPS-002
- Actions:
  1. Record checksum, unique lead ID, correlation ID, and idempotency key for the founder-approved package.
  2. Submit it once through the real manual intake boundary.
  3. Observe the normal Program; do not edit downstream success records.
  4. Verify Program/Phase/Issue/Run graph, provider consumption, prospect-specific content generation, Payload draft/promotion/readback, private publication, `web-master` rendering, and completion event.
  5. Verify the completion record includes private URL and exact source/provider/content/image identities.
  6. Test routes, links, media, scoped forms/affordances, desktop/mobile layout, accessibility, metadata, privacy, tenancy, security, and practical performance.
  7. Confirm there are no mocks, placeholders, lorem text, unsupported claims, fixture provider paths, or cross-tenant data.
- Acceptance: exactly one complete private marketing website and one traceable completion record.
- Rollback: disable the LiNKsites routes and stop only LiNKsites services if privacy/integrity fails; preserve evidence and data for diagnosis.

### LS-PILOT-002 — Prove duplicate prevention and recovery

- Type: live product acceptance
- Dependencies: LS-PILOT-001
- Actions:
  1. Replay the same logical input using the same idempotency identity.
  2. Verify no second logical site, content promotion, publication, deployment, or completion record.
  3. Perform the approved controlled restart/recovery point.
  4. Verify the original site and trace recover without duplication or corruption.
  5. Complete a post-test backup and verify it.
- Acceptance: duplicate counts remain one, recovery resumes safely, and post-test backup PASS.

### LS-REV-002 — Independent final operational review

- Type: independent read-only review
- Dependencies: LS-PILOT-002
- Scope:
  - exact deployed main SHA and five image digests;
  - private live website and CMS boundary;
  - Program/content/deployment/completion trace;
  - duplicate/recovery proof;
  - service health and resource state;
  - monitoring, backup, restore, and rollback proof;
  - exclusions.
- Required output: first line exactly `PASS` or `FAIL`, exact deployment identity, concise evidence, and any material finding.
- Acceptance: PASS.
- Failure handling: smallest owning packet corrects the defect; the exact corrected deployment is reviewed again.

### LS-HANDOFF-001 — Founder handoff and DONE declaration

- Type: documentation/readback
- Dependencies: LS-REV-002
- Actions:
  1. Provide private access method and URL without exposing credentials.
  2. List exact source commit/tree, five image digests, provider identity, configuration checksum, migration state, backup ID, and review result.
  3. Provide service, log, health, backup, restore, restart, route-disable, and rollback commands.
  4. List excluded capabilities and any non-material known limitation.
  5. Mark DONE only when every PRD definition-of-done item maps to PASS evidence.
- Acceptance: founder can identify what is live, verify health, access the private site, and invoke recovery without unstated knowledge.

## Dependency graph

```text
PRE-001
  ├─ PRE-002 ─ PRE-004 ─┬─ SRC-001 ─────────────┐
  │                     └─ SRC-002 ─ SRC-003 ──┤
  └─ PRE-003 ───────────── OPS-001 ─────────────┤
                                                v
                                            INT-001
                                                v
                                            VAL-001
                                                v
                                            REV-001
                                                v
                  REL-001 -> REL-002 -> ART-001
                                                v
                  VPS-001 -> DATA-001 -> DATA-002
                                                v
                  VPS-002 -> EDGE-001 -> OPS-002
                                                v
                  PILOT-001 -> PILOT-002 -> REV-002 -> HANDOFF-001
```

## Parallelism limits

- Maximum simultaneous source implementers: three, only on disjoint ownership lanes.
- LS-SRC-003 begins after LS-SRC-002 establishes the provider contract.
- Consolidation, Full Suite, source review, protected promotions, image publication, data migration, deployment, pilot, and final review are sequential gates.
- A reviewer cannot review its own implementation.
- No live Server03 packet begins before LS-ART-001 and explicit founder execution approval.
