# LiNKsites atomic work packets

Status: correction candidate; dispatch is not authorised

## Common execution contract

Every packet must name its exact protected base, issue/branch, allowed and
prohibited paths, dependencies, inputs, acceptance commands, evidence and stop
conditions before work starts. Founder execution direction supersedes every
other worker model: every implementation and repair agent uses the Cursor
REST/API SDK with Grok 4.6 Medium and Fast false. Exactly one independent
read-only review exists at LSREV-01 for the exact consolidated source
candidate; that reviewer cannot review its own implementation. Issue checkpoints
do not unconditionally require independent_narrow_review. Implementers
commit and push checkpoints but do not open PRs, merge, promote or deploy.
The coordinator preserves unrelated dirty work, uses the installed completion
gate, and returns conflicts to the behavior owner.

Completion classes are only:

- **completed:** every acceptance condition passed on the exact identity;
- **completed but needs testing or fixing:** source/output exists but a named
  acceptance condition is not yet proven;
- **missing:** the required output does not exist; or
- **unknown:** evidence/access is not available and dependent work is held.

Provider `FINISHED`, a pushed branch, a green focused test or a planning
acceptance is not packet acceptance by itself.

## Wave 0 — refresh, preserve and admit

### LSG0-00 — Refresh exact authority and runtime state

- Owner/type: coordinator, read-only.
- Dependencies: founder approval bound to the Deployment Advisor-accepted plan.
- Inputs: current GitHub, dispatcher, queue-control, Server03 and upstream task
  readbacks.
- Actions: refresh protected commits/trees/rulesets/open PRs, current issue and
  Phase tips, primary dirty paths, dispatcher SHA/account/model/repository,
  queue owner/status, Server03 service/network/path/database/proxy inventory and
  direct upstream handoff status. Compare with the planning snapshot.
- Acceptance: a sanitized baseline receipt records exact identities and every
  drift item has a named downstream owner; no mutation occurred.
- Stop/recovery: unknown repository, owner, credential account, production host
  or shared-service identity stops affected work; unaffected read-only work
  continues.

### LSG0-01 — Preserve and disposition existing work

- Owner/type: coordinator, read-only analysis plus repository evidence record.
- Dependencies: LSG0-00.
- Scope: Issue 480 variants, Issues 490/492/508/511, unique Phase tips and the
  user-owned `apps/cms/next-env.d.ts` change.
- Actions: for each unique commit, record merge-base, files, stable patch IDs,
  protected equivalents and requirement mapping. Classify each file/behavior as
  integrated, retain/reuse, superseded by stronger exact behavior, not applicable
  with reason, or user-owned HOLD. Prepare cherry-pick/manual-port order; delete
  nothing.
- Acceptance: every unique commit and changed path has one disposition; all
  retained behavior maps to an implementation lane; user dirty work remains
  byte-identical and unstaged.
- Evidence: branch-disposition JSON plus checksums and comparison commands.

### LSG0-02 — Publish worker-visible upstream inputs

- Owner/type: coordinator, planning/source-input checkpoint.
- Dependencies: LSG0-00 and the currently available, provenance-bearing
  planning inputs. Later exact handoffs are published as new immutable bundle
  versions before any worker depends on them.
- Allowed path: `docs/end-to-end-delivery/upstreams/` only.
- Actions: copy only consumed schemas, fixtures and wire mappings for
  LiNKharness/Profile, LiNKlibraries providers, Platform claims/migration
  receipts and LiNKautowork events/receipts. Record original repository,
  commit/tree/path, SHA-256, compatibility, owner and evidence level. Exclude
  secrets, customer data and upstream implementation.
- Acceptance: provenance validator compares every copied byte to the exact
  upstream source; the checkpoint is committed/pushed and its GitHub
  commit/tree is used by dependent packets.
- Stop/recovery: semantic conflict returns to the upstream owner; LiNKsites does
  not invent or repair the upstream contract.

### LSG0-03 — Obtain truthful provider handoffs

- Owner/type: dependency coordinator; upstream repositories remain owned by
  their tasks.
- Dependencies: LSG0-00.
- Required outputs:
  1. current exact selectable `marketing-smb-v1` release for the first private
     website, including qualification/admission and immutable digests; and
  2. exact admitted Master Website Template A1/A2/A3 and A/B/C/L provider
     release/handoff for full completion.
- Acceptance: LiNKlibraries protected identities and receipts independently
  prove selectable lifecycle state and exact bytes. Current quarantined/draft
  state, old approved evidence or a local fixture fails.
- Recovery: coordinate the missing qualification/admission with the existing
  LiNKlibraries owner. Do not mutate that repository from LiNKsites and do not
  substitute a fake provider. Other source lanes may proceed against frozen
  schemas, but source release acceptance waits for exact provider handoffs.

### LSG0-04 — Obtain Platform and LiNKautowork handoffs

- Owner/type: dependency coordinator, read-only consumption.
- Dependencies: LSG0-00.
- Required outputs: current Platform claim/service/migration receipt bundle and
  current LiNKautowork gateway/event/receipt/consumer-registration bundle as
  specified in `UPSTREAM-DEPENDENCIES.md`.
- Acceptance: exact protected source, interface versions, sanitized fixtures,
  endpoint/health, scope/grant and receipt identities are present; missing live
  surfaces remain explicit HOLDs.
- Recovery: continue implementation of disabled/manual compatible paths; final
  live integration cannot pass until owners produce real handoffs.

### LSG0-05 — Create branches, lane hash and admitted packets

- Owner/type: coordinator, repository/queue setup.
- Dependencies: LSG0-01, LSG0-02 and current lane plan.
- Actions: create/reuse GitHub issues and `issue/<number>-<slug>` branches from
  current protected development; calculate the accepted lane-plan SHA-256;
  render one dispatch packet per implementation lane; read back exact branch
  commit/tree; under the persistent `outputs/cursor-cloud/state/.dispatch.lock`,
  atomically union only this task's LiNKsites queue membership using the exact
  transaction in `EXECUTION-ROUTE.md`; set `admitted: true` only after founder/
  identity/dependency checks; run dispatcher `validate` on each packet.
- Acceptance: every packet validates, every advertised branch exists at exact
  commit/tree, scopes are literal/non-overlapping, queue readback proves only
  the additive membership, owner-key preexistence/addition and file-mode facts
  are recorded, capacity is reconciled under the same lock, and no worker has
  yet been created.
- Rollback: reread latest state under the same persistent lock and remove only
  membership this task actually added; preserve concurrent grants, unknown
  fields, current mode, global `SUSPENDED`, any pre-existing empty owner key,
  and all issue branches/checkpoints. A backup is never a rollback overwrite.

## Wave 1 — exclusive data compatibility

### LSDATA-01 — Freeze additive Payload/data compatibility

- Lane: L-DATA; one exclusive source writer.
- Dependencies: LSG0-02 and LSG0-05. The input bundle must contain the
  relevant frozen provider schemas; selectable release proof is not required
  for this source-only compatibility packet.
- Objective: ensure current Profile v2 data models and migrations satisfy
  provider identities, Products/Services distinction, adoption/entitlement,
  existing Offer/Case/template data, failed-upgrade and rollback behavior.
- Actions: reconcile existing LS03/LS10 source and retained branches; add only
  new additive migrations; never edit an applied migration; regenerate Payload
  types once; prove fresh install, compatible/incompatible copied-data upgrade,
  denial/tenant boundaries, prior-adoption retention and replay.
- Acceptance: migration/source checks pass; fixtures show old data remains
  usable or explicitly migrated; failure leaves prior state active; checkpoint
  committed/pushed with exact tree.
- Recovery: restore source branch to its pre-packet checkpoint by revert; live
  data is not touched in this packet.

## Wave 2 — four parallel source lanes

These four packets may run simultaneously only after LSDATA-01 and frozen
upstream inputs, using the literal paths in `IMPLEMENTATION-LANES.md`.

### LSTRUST-01 — Close the protected-promotion trust boundary

- Lane: L-TRUST.
- Dependencies: LSDATA-01 and LSG0-05.
- Objective: ensure only a trusted producer can attest the exact approved
  source/current base/test/review/expiry/single-use transition.
- Allowed paths: the L-TRUST literal set in `IMPLEMENTATION-LANES.md` and
  `LANE-PLAN.json`, including `.github/workflows/ci.yml`,
  `docs/contracts/CI-SUITE.md` and
  `scripts/tests/test_promotion_receipt_adversarial.py`. Those three paths are
  admitted so LSTRUST-01 can incorporate and complete retained Issue 511 work
  (`ee671c0242dd6d6f3832f8a7ed064de03dfc4b98` / tree
  `be90a36770dc429101702dbe8cc0c40629fad6e7`) rather than discard or duplicate
  it. They remain disjoint from every other lane.
- Actions: reconcile current workflows and Issue 511; keep proposed-code
  credentials unable to publish the authoritative check; bind receipts to
  repository, transition, base/head commit/tree, workflow identity, result,
  reviewer, expiry and consumption; reject copied/stale/duplicate-name/
  candidate-authored/wrong-base/self-reviewed evidence.
- Acceptance commands: focused receipt/transition unit tests including
  `scripts/tests/test_promotion_receipt_adversarial.py`, workflow static
  validation and `git diff --check`.
- Acceptance: every adversarial case fails for the intended reason and one
  genuine fixture passes without giving candidate code approval authority.
- Recovery: bounded repair on the issue branch; no ruleset change in this packet.

### LSFACT-01 — Complete exact provider/adoption/assembly behavior

- Lane: L-FACTORY.
- Dependencies: LSDATA-01 and LSG0-05. LSG0-02's committed input bundle must
  contain the frozen provider schemas; exact selectable handoffs remain a
  later source-release and live-acceptance gate.
- Objective: reconcile protected Profile v2 factory source with the current
  Library handoffs and FR-01 through FR-03/LS-FR-01 through LS-FR-12.
- Actions: exact selection/materialization/cache/startup-without-checkout;
  layered adoption and entitlements; A/B/C/L credits; deterministic capability,
  page, route, navigation and content resolution; semantic working-content and
  Payload promotion; existing-site pinning; fail-closed lifecycle/tamper paths.
- Acceptance commands: focused factory-catalog tests for provider,
  materialization, adoption, credits, assembly, promotion, idempotency and
  rollback; affected typecheck; `git diff --check`.
- Acceptance: both provider families can be bound by injected exact handoffs;
  quarantined/draft/tampered/fixture/unknown identities fail production
  selection; no provider implementation is copied.

### LSRENDER-01 — Complete rendering, routes, discovery and user quality

- Lane: L-RENDER.
- Dependencies: LSDATA-01 and LSG0-05. LSG0-02's committed input bundle must
  contain the frozen factory/provider schemas.
- Objective: satisfy FR-04 through FR-07 and LS-FR-13 through LS-FR-22.
- Actions: full semantic adapter coverage; real A1/A2/A3 structural rendering;
  A/B/C/L behavior; tenant/locale routes and redirects; real shell; SSR,
  visible-fact JSON-LD, sitemap/robots/AI consistency; form/consent fail-closed;
  accessibility and representative performance fixtures.
- Acceptance commands: focused web-master unit/integration suites, LS06/LS07
  quality harnesses, server-render checks and bounded browser matrix; affected
  build/typecheck; `git diff --check`.
- Acceptance: no all-Hero flattening, placeholder shell, mock success, public
  error/template text, cross-tenant data or schema/visible-content mismatch.

### LSAUTO-01 — Complete canonical intake, automation and completion boundary

- Lane: L-AUTOWORK.
- Dependencies: LSDATA-01 and LSG0-05. LSG0-02's committed input bundle must
  contain the frozen Platform/Autowork schemas; live endpoints and receipts
  remain final-integration gates.
- Objective: satisfy FR-08 while preserving one website completion authority.
- Actions: reconcile manual/file and signed-gateway adapters at the same
  contract; persist before dispatch; enforce correlation/idempotency,
  timestamp/nonce, scope/grants, bounded retry/acknowledgement, durable outbox,
  restart/replay and CRM-shaped completion. Keep downstream receipts from
  mutating Program gates directly.
- Acceptance commands: autowork-boundary, orchestrator, CMS composition and
  durable crash/replay tests; affected typecheck; `git diff --check`.
- Acceptance: manual mode supports initial acceptance; live mode consumes only
  exact scoped handoff; duplicate and late callbacks return the original result;
  missing endpoint/keys/grants fails closed.

## Wave 3 — dependency security, deployment and operations source

### LSSEC-01 — Reconcile dependency security and release closure

- Lane: L-SECURITY, repository-exclusive after the four Wave 2 source lanes.
- Dependencies: LSTRUST-01, LSFACT-01, LSRENDER-01 and LSAUTO-01.
- Allowed paths: `package.json`, `pnpm-lock.yaml`, `apps/cms/package.json`,
  `apps/web-master/package.json` and
  `archive/paused-applications/web-company/package.json`.
- Objective: own the current 33 open Dependabot alerts and the final
  production dependency/image closure before Full or immutable release.
- Actions: refresh the exact alert inventory and affected dependency graph;
  identify deployed, build/test-only and archived paths; determine
  exploitability; make the smallest compatible manifest/lock changes for every
  release-blocking finding; and record evidence, owner, reason and acceptance
  threshold for every non-applicable or explicitly deferred finding. Never use
  a green Full Suite or an archived-path label as automatic disposition.
- Acceptance commands: frozen install; CMS and web-master affected tests,
  typechecks and builds; any package directly changed for compatibility;
  repository production `pnpm audit --prod --audit-level=high`, licence/SBOM/
  supply-chain validators and `git diff --check`.
- Acceptance: no unresolved exploitable critical/high advisory is present in
  the deployed or build-to-deploy closure; every remaining alert has an exact
  evidence-backed disposition and owner, and no security exception is accepted
  without separate founder authority.
- Recovery: compatibility failure returns to the smallest owning source lane;
  any additional required manifest/path causes a lane-plan revision before
  editing. Revert only this issue checkpoint; do not rewrite the lock manually.

### LSDEP-01 — Reconcile release, configuration and five images

- Lane: L-DEPLOY, exclusive.
- Dependencies: LSSEC-01 and current provider/Platform/Autowork handoff shapes.
- Objective: make Compose, environment schema, preflight, migrations, smoke,
  provider modes, exact service images and publication workflow agree.
- Actions: remove hardcoded/unproven hostname assumptions; support initial
  manual/legacy-provider and final live/MWT modes without fixture bypass;
  digest-pin all base and output images; bind five image digests, source/tree,
  providers, Profile/Harness, migrations and config; keep databases/roles
  distinct and shared Server03 services external.
- Acceptance commands: runtime-contract, deployment-surface and manifest tests;
  Compose render; preflight/smoke fixtures; Dockerfile digest validator;
  workflow static check; `git diff --check`.
- Acceptance: one release manifest drives one `linksites-foundation` Compose
  project; mutable-only images, placeholders, wrong provider state, wrong
  migrations and public admin/database exposure fail.

### LSOPS-01 — Complete monitoring, backup, restore and rollback source

- Lane: L-OPS, exclusive after LSDEP-01.
- Dependencies: LSDEP-01.
- Actions: cover service health, backlog, retry/dead-letter, completion,
  certificates, backup age, disk/resource and restart; back up database,
  Payload/media, outbox/Program state, config/manifest and scoped Traefik file;
  restore isolated by default; separate app rollback, route disable and database
  recovery; ensure commands name only LiNKsites project/paths.
- Acceptance commands: monitoring rule validation, backup dry fixture,
  isolated restore rehearsal, runbook command lint and `git diff --check`.
- Acceptance: executable commands, expected outputs, stop conditions and
  rollback are complete without volume deletion or unrelated service action.

## Wave 4 — consolidate, test, review and publish source

### LSINT-01 — Consolidate retained and new checkpoints

- Owner/type: coordinator integration.
- Dependencies: LSDATA-01, LSTRUST-01, LSFACT-01, LSRENDER-01, LSAUTO-01,
  LSSEC-01, LSDEP-01, LSOPS-01, LSG0-03 exact provider handoffs.
- Actions: verify pushed identities/evidence; integrate in dependency order;
  return conflicts to owners; bind upstream copies; run only conflict-affected
  checks; finalize branch dispositions and requirement-to-change traceability.
- Acceptance: one clean exact candidate includes all required retained behavior,
  no unresolved overlap/local-only input and no user dirty file change.

### LSVAL-01 — Run one complete source suite

- Dependencies: LSINT-01.
- Actions: run the repository Full Suite/profile once against exact candidate,
  including lint/type/build/tests, provider/browser contract checks, migration,
  deployment, secret-fixture, supply-chain/licence and release validators.
- Acceptance: hosted run succeeds with no skipped required job and receipt binds
  candidate commit/tree/workflow/dependencies/artifacts; LSSEC-01's exact alert
  inventory and dispositions still match the candidate dependency closure.
- Recovery: code failures return to the smallest source lane; changed candidate
  receives one new Full run. Infrastructure outage retries the same identity
  only after diagnosis.

### LSREV-01 — Independent consolidated source/release review

- Reviewer/type: the single independent read-only Cursor REST/API SDK agent
  using Grok 4.6 Medium and Fast false; cannot review its own implementation.
  This is the only independent product review in the 30-packet set.
- Dependencies: LSVAL-01.
- Scope: exact base-to-candidate diff of the coherent source Phase. The receipt
  must explicitly name these material risks: auth/authorization and
  secret-handling logic; additive Payload/Postgres migration and RLS/data-
  boundary safety; and production deployment/rollback configuration.
- Required output: first line `PASS` or `FAIL`, exact repository/commit/tree,
  named-risk coverage, and concise file/line findings.
- Acceptance: PASS with no unresolved material finding on those named risks.
  Do not repeat for an unchanged SHA/tree. Reviewer infrastructure, tool,
  dependency or network failure is not a product failure and is not grounds
  for an equivalent replacement review. A substantive change to the named
  risk surfaces invalidates the receipt; deterministic documentation,
  metadata, fixture, packaging, generated-manifest or controller-state
  corrections do not.
- Not required: independent review of evidence formatting, metadata rebinding,
  fixture restamping, deterministic packaging, documentation-only changes,
  generated manifests, controller-state publication, or narrow corrections
  fully covered by deterministic tests plus secret scanning.

### LSREL-01 — Integrate and promote source once

- Owner/type: Phase Packager/Coordinator and delivery controller.
- Dependencies: LSREV-01 and continued founder authority.
- Actions: create the minimum substantial Phase PR(s); verify head/current base;
  merge to protected development; prepare same-tree development-to-staging and
  staging-to-main promotions; validate trusted current receipts at each gate;
  read back every protected commit/tree.
- Acceptance: intended tree is protected through main with real required checks
  and no direct/self merge. If the publisher is technically broken after
  bounded repair, founder bootstrap records the waived mechanism and uses only
  real exact evidence.
- Recovery: corrective PR/promotion; never rewrite protected history.

### LSART-01 — Build and publish the immutable release

- Dependencies: LSREL-01.
- Actions: build CMS, web-master, worker, orchestrator and migrations from exact
  protected main; publish by digest; read back registry manifests; generate the
  release manifest/SBOM/provenance supported by current workflow.
- Acceptance: exactly five service entries bind immutable digests, exact
  source/tree, providers, Profile/Harness, migrations and configuration; release
  verification passes.
- Recovery: retain unselected immutable artifacts; do not deploy failed release.

## Wave 5 — one Server03 installation

### LSVPS-01 — Prepare the recoverable application layout

- Owner/type: sole live deployment owner.
- Dependencies: LSART-01 and LSG0-00 current Server03 refresh.
- Actions: snapshot shared service/proxy state; create only LiNKsites control,
  release, evidence and backup paths with restrictive ownership; install exact
  manifest/config references; validate permissions/placeholders; start nothing.
- Acceptance: path, ownership, config/manifest checksum and release identity
  pass; all existing services remain unchanged/healthy.
- Rollback: move only newly created unused LiNKsites paths to timestamped
  quarantine; do not delete shared or historical data.

### LSVPS-02 — Back up and prove isolated restore

- Dependencies: LSVPS-01.
- Actions: inventory and back up existing LiNKsites databases/schemas, selected
  historical data, scoped proxy config and release metadata; encrypt/store;
  restore into isolated target; compare schema/object/data checksums.
- Acceptance: backup/manifest/archive IDs, sizes, checksums, encryption,
  retention, target and matched restore receipt pass.
- Stop: no migration or service start without PASS.

### LSVPS-03 — Apply least-privilege data/configuration

- Dependencies: LSVPS-02 and Platform migration/application receipts.
- Actions: record current state; create/repair distinct scoped identities;
  validate tenant/site/provider seeds; apply digest-pinned migrations once;
  read back versions/grants/denials; prove safe no-op/reconciliation where
  contract requires.
- Acceptance: exact migration receipts and intended access pass, unintended
  access fails, and backup remains restorable.
- Recovery: follow declared forward-fix/restore decision; no blind SQL rerun.

### LSVPS-04 — Start the single production installation

- Dependencies: LSVPS-03.
- Actions: reverify five digests and manifest; render Compose; start
  `linksites-foundation` in dependency order; wait for health; inspect sanitized
  logs; perform one controlled restart and health recovery.
- Acceptance: intended services run exact digests, persistent state survives,
  fixture mode is absent and all other Server03 projects remain healthy.
- Rollback: stop only LiNKsites, preserve volumes/evidence, select prior
  compatible immutable release if available.

### LSVPS-05 — Enable private routes and operations

- Dependencies: LSVPS-04.
- Actions: update only scoped LiNKsites Traefik routers using existing private
  middleware; verify config before reload; test authorized/unauthorized/unknown
  hosts, TLS, headers, `noindex,nofollow` and port exposure; activate scoped
  monitoring and scheduled backups; trigger one alert, backup and isolated
  restore.
- Acceptance: private routes and operations work and existing portfolio routes,
  monitoring and backups remain healthy.
- Rollback: restore exact prior LiNKsites proxy file and remove only LiNKsites
  rules/schedules.

## Wave 6 — initial real private website

### LSPILOT-01 — Configure the admitted legacy provider and real facts

- Dependencies: LSVPS-05 and exact selectable `marketing-smb-v1` handoff.
- Actions: install verified provider bytes/read-only receipt; bind exact site,
  tenant, locale, approved-facts checksum and manual canonical adapter; validate
  no placeholder/fixture path and keep all public/customer routes disabled.
- Acceptance: preflight proves exact provider/source/config and rejects current
  quarantined or stale identities.

### LSPILOT-02 — Produce one private website

- Dependencies: LSPILOT-01.
- Actions: submit founder-approved facts once; observe normal Program without
  inserting downstream success; verify provider use, semantic content, Payload
  draft/promotion/readback, rendering, publication and completion; check desktop/
  mobile, keyboard/accessibility, metadata/schema, privacy/tenancy/security,
  links/media/forms and practical lab performance.
- Acceptance: exactly one complete prospect-specific private site and one
  CRM-shaped completion record with full identity chain; no mock, lorem,
  placeholder, unsupported claim or fixture provider.

### LSPILOT-03 — Prove duplicate prevention and recovery

- Dependencies: LSPILOT-02.
- Actions: replay same idempotency identity; verify all logical counts remain
  one; perform controlled restart/recovery; verify site/trace integrity; take
  and restore-verify a post-test backup.
- Acceptance: no duplicate site/content/publication/deployment/completion and no
  corruption; post-test backup PASS.

## Wave 7 — full product on the same installation

### LSFULL-01 — Activate exact Master Website Template v2

- Dependencies: LSPILOT-03 and exact admitted A1/A2/A3 + A/B/C/L handoff.
- Actions: atomically materialize verified provider bytes/cache/receipt; configure
  the existing installation; run paired provider/consumer server/browser matrix,
  provider-checkout removal restart, existing-site pinning/migration, failed
  upgrade, retirement and rollback. Do not rebuild source unless a real defect
  requires a corrective release.
- Acceptance: FR-01 through FR-07 and LS-FR-01 through LS-FR-24 pass on exact
  provider/consumer identities at their declared evidence levels.

### LSFULL-02 — Activate live Platform/LiNKautowork integration

- Dependencies: LSPILOT-03, LSG0-04 live handoffs and current health.
- Actions: configure scoped Platform identity/claims and LiNKautowork private
  gateway/keys-by-reference/grants; drain/switch safely; send one authorised
  signed request; observe durable acknowledgement/execution/receipt/completion;
  test duplicate/late callback and temporary outage recovery.
- Acceptance: exact live request/receipt and LiNKsites completion are separately
  traceable; no broad credential, arbitrary workflow, direct ledger mutation or
  duplicate effect; manual fallback remains documented.

### LSFULL-03 — Final operational acceptance and handoff

- Type: deterministic live acceptance and coordinator founder handoff. There
  is no separate independent live operational reviewer; LSREV-01 already
  covered the coherent source Phase.
- Dependencies: LSFULL-01 and LSFULL-02.
- Scope: exact protected main/tree, five deployed digests, both provider
  identities, full LS-FR matrix, one installation, site/content trace, live
  automation, health/resources, backup/restore/restart/rollback, privacy,
  tenancy, security, accessibility and performance.
- Acceptance: deterministic PASS of exact-release identity, health, privacy,
  backup/restore, rollback, idempotency, completion-chain and
  controller/readback evidence; every PRD DoD item maps to exact evidence;
  founder receives private access and exact operating/recovery
  instructions. Corrections after this packet re-run the affected
  deterministic proofs; they are not re-audited by another independent
  reviewer. Only then may LiNKsites be declared DONE.

## Dependency summary

```text
G0-00 -> G0-01 -> G0-02 -> DATA-01
G0-00 -> G0-03 -------------------------------> INT-01
G0-00 -> G0-04 -------------------------------> FULL-02
G0-02 + DATA-01 -> TRUST / FACTORY / RENDER / AUTOWORK (max four)
four lanes -> SECURITY -> DEPLOY -> OPS -> INT -> FULL SUITE -> SOURCE REVIEW
-> protected promotion -> five images -> layout -> backup/restore -> data
-> single install -> private routes/operations -> first website -> replay/recovery
-> MWT v2 + live Autowork on same install -> deterministic live acceptance/handoff
```
