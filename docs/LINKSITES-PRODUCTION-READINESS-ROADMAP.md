# LiNKsites Phase 1 Production-Readiness Roadmap

**Status:** Draft — pending Principal approval. This document authorizes no implementation, deployment, credential use, external-system mutation, merge, promotion, or release by itself.

**Purpose:** Define every change and proof required to make LiNKsites ready for deployment to a VPS, then define the separately authorized VPS deployment and one-website completion test.

**Audience:** The Principal, the master orchestrator, Codex Luna High or Grok 4.5 High implementation agents, Codex Sol Medium auditors, reviewers, and operators.

**Execution packet index:** [`production-roadmap/WORK-PACKET-INDEX.md`](./production-roadmap/WORK-PACKET-INDEX.md)

**Execution control:** [`production-roadmap/EXECUTION-PROTOCOL.md`](./production-roadmap/EXECUTION-PROTOCOL.md), [`production-roadmap/WAVE-MANIFEST.yaml`](./production-roadmap/WAVE-MANIFEST.yaml), and [`production-roadmap/EXECUTION-STATE.yaml`](./production-roadmap/EXECUTION-STATE.yaml)

**Current source-of-truth companions:** [`LINKSITES-INTENT.md`](./LINKSITES-INTENT.md), [`LINKSITES-TECHNICAL-PRD.md`](./LINKSITES-TECHNICAL-PRD.md), [`LINKSITES-OPERATIONS-MANUAL.md`](./LINKSITES-OPERATIONS-MANUAL.md), and [`OPEN-ISSUES.md`](./OPEN-ISSUES.md). When this roadmap is approved, its clarified Program boundaries and delivery gates govern the Phase 1 implementation. Implementation must also reconcile the companion documents so they do not remain contradictory.

---

## 1. Outcome in plain English

LiNKsites must become a continuously operating website-production Program. It continuously pulls qualified lead information and research from LiNKreach's authorized source, safely claims one job, coordinates the agents and software needed to create a complete website, validates the result, deploys a private demonstration, and returns a completion envelope and URL to LiNKreach.

LiNKsites does not discover leads, perform outreach, collect payment, negotiate contracts, or own customer service. LiNKreach owns those commercial activities. When LiNKreach later records a sale or no-sale outcome, LiNKsites pulls that outcome and performs the corresponding technical work: public activation and domain configuration after a sale, or cleansing/refactoring/recycling after a no-sale decision.

The first controlled production test does not wait for LiNKreach. A manually supplied lead/research package uses the same versioned intake contract as the future CRM adapter. Success is a complete private website running on the VPS plus a CRM-shaped completion record. Payment, public activation, customer-domain cutover, and post-sales are not part of that first test.

---

## 2. Canonical Program definition

An **Agentic Workflow** is a Program: one automated end-to-end system coordinating specialized AI agents, automations, conventional code, scripts, tools, APIs, MCP access, and OSS adapters toward one outcome.

LiNKsites uses this hierarchy everywhere:

```text
Program → Module → Phase → Issue → Executor → Run
```

- **Program:** LiNKsites as the complete website-production workflow.
- **Module:** A stable capability area such as intake, template-package consumption, prospect copy adaptation, assembly, promotion, validation, or preview deployment.
- **Phase:** A checkpointed group of related Issues inside a Module. “Stage” is not the canonical term and must be removed from active LiNKsites contracts, code, migrations, and live documentation where it means Phase.
- **Issue:** The atomic schedulable task.
- **Executor:** The AI agent, LiNKautowork automation, code/script, tool, OSS adapter, or API/MCP adapter that performs an Issue.
- **Run:** One attempt to execute an Issue.

Dependencies determine readiness. Independent Issues may run in parallel. Every Issue, Phase, Module, and the Program has a definition of done and a blocking evidence gate. Execution, review, integration, and release are separate decisions. An agent statement, mock-only demonstration, document, or unverified record never proves completion.

---

## 3. Program boundary and ownership

### 3.1 Normal business flow

```text
LiNKreach
  lead discovery → lead research → CRM eligible record
                                      │
                                      ▼
LiNKsites continuous pull runtime
  claim → plan → select/materialize template package → adapt copy → assemble → promote → validate
  → private deploy → CRM demo-complete record
                                      │
                                      ▼
LiNKreach
  outreach → sale/no-sale → CRM outcome
                                      │
                     ┌────────────────┴────────────────┐
                     ▼                                 ▼
LiNKsites sale activation                    LiNKsites recycling
  publish/public access                        remove prospect identity
  domain/DNS/TLS request execution             refactor reusable content
  launch evidence                              return foundation to inventory
                     │
                     ▼
LiNKreach post-sales/customer service
  relationship, service, support, and upsell orchestration
```

### 3.2 Authority table

| Concern | Owner | LiNKsites relationship |
|---|---|---|
| Lead discovery and research | LiNKreach | LiNKsites continuously pulls and claims eligible authorized records |
| Outreach, sale/no-sale decision | LiNKreach | Consumes recorded outcome |
| Payment and agreement | LiNKreach or its owned workflow | Acts only on LiNKreach's versioned activation authorization; no direct payment integration |
| Website creation and private preview | LiNKsites | Owns and executes |
| Reusable template, baseline copy, and template media creation | Manual LiNKtrend template-production process initially; a future dedicated Program may automate it | LiNKsites does not request per-prospect generation; it consumes the complete approved package from LiNKlibraries |
| Payload content promotion/publication | LiNKsites | Owns controlled technical execution |
| Domain/DNS/TLS/visibility changes | LiNKsites | Executes after LiNKreach authorization |
| Unsold-site refactor/recycling | LiNKsites | Executes after LiNKreach outcome |
| Customer relationship, support, and upsell | LiNKreach post-sales/customer service | Requests technical changes through a contract |
| Shared reusable assets | LiNKlibraries | LiNKsites consumes SHA-pinned entries |
| Automation runtime | LiNKautowork | LiNKsites calls governed gateway/events, never raw n8n as a separate dependency |
| Org identity, capability and handoff envelope | LiNKplatform | Shared contracts and infrastructure only |

### 3.3 Explicitly outside the Phase 1 implementation

- LiNKreach implementation.
- Live LiNKreach-owned payment adapters.
- Pricing, package economics, discounts, contracts, or commercial-frontend implementation.
- Production customer-domain activation during the first website test.
- LiNKreach post-sales/customer-service workflows.
- Customer self-service CMS.
- Multi-region scaling beyond deployment-readiness seams and documented boundaries.

---

## 4. Data and content authority

### 4.1 Plain-English rule

- **Supabase is the private workshop.** Agents create and change versioned working content there. It also holds the LiNKsites Ledger and evidence.
- **Payload draft is the final controlled review area.** A specific validated Supabase working version is promoted into Payload as a draft.
- **Payload published content is live content.** A separate publication gate publishes the approved draft.
- **web-master renders published Payload content only.** Private demos remain private through preview-host routing and an access wall, not by letting the public frontend read unapproved drafts.

```text
Supabase working version
  → validation/gates
  → Payload draft
  → publication gate
  → Payload published
  → private access-controlled demo
```

There is no blind periodic two-way synchronization. Every promotion identifies the source working version, target Payload document, checksums, actor, gate evidence, and result. A conflict or stale base fails closed.

### 4.2 Required Supabase responsibilities

1. `lsites_ledger`: durable Program/Module/Phase/Issue/Run/Gate/Event/idempotency/dependency state.
2. `lsites_sites`: organization- and site-scoped working content, immutable versions, provenance, validation state, promotion state, and correlation references.
3. Tenant isolation: an executor scoped to Site A cannot read or write Site B.
4. Claiming and idempotency: two orchestrator workers cannot process the same CRM item or outcome simultaneously.
5. Evidence and receipts: every material transition can be reconstructed without relying on logs alone.

Payload continues using its own `public` schema through Payload migrations. LiNKsites does not write directly to Payload tables; it uses an authenticated Payload adapter.

### 4.3 Required cleanup

- Active runtime code must not depend on retired `lsites_core`, `sync_ingress`, or `sync_jobs` mirror behavior.
- Legacy scripts and shared JSON contracts that describe the retired mirror must be removed, archived, or replaced so active commands cannot accidentally invoke them.
- No service-role or database credential may be exposed to web-master or any browser-visible environment variable.

---

## 5. Reusable assets and the LiNKsites Architect

### 5.1 Ownership split

| Location | Owns |
|---|---|
| LiNKlibraries | Complete versioned vertical-template packages: templates, components, layouts, design systems, baseline copy/text, all template media/assets, tested helpers, content schemas, metadata, licenses, provenance, and immutable Git versions |
| LiNKsites Factory Catalog | Vertical rules, compatibility, allowed combinations, inventory, reservations, Site Specifications, Assembly Manifests, lifecycle state, and exact LiNKlibraries entry/SHA references |
| Materialized web-master source | A verified copy of selected library assets used to build the runtime; never an unrecorded fork |
| Payload | Site-specific content and configuration |
| Program Ledger | Receipt of every selected library entry/SHA and resulting artifact |

LiNKsites must not depend on LiNKlibraries at request time. It fetches approved entries during planning/build, verifies hashes, records the exact commit SHA, and materializes them into the build workspace.

### 5.2 Initial master template

The current `marketing-smb-v1` implementation becomes the first production master template only after it:

- is represented as an approved, substantive LiNKlibraries template entry;
- includes the complete baseline copy/text and media/assets required by its supported vertical and tier, so LiNKsites does not call a content/media generation Program for each prospect;
- has deterministic materialization and SHA evidence;
- reads real Payload content for the certified path;
- contains no material demo/mock fallback in production;
- supports the approved Home Services / Standard pilot;
- passes responsive, accessibility, SEO, performance, localization, and visual gates;
- supports a private, noindex demonstration and unknown-host fail-closed behavior.

### 5.3 LiNKsites Architect

The **LiNKsites Architect** is a domain agent outside the critical path of publishing a single site. It reviews completed and unsold runs, evaluates reusable patterns and performance, packages candidate assets, and proposes new or improved LiNKlibraries entries. It cannot overwrite canonical entries, approve itself, or bypass LiNKlibraries governance.

Individual no-sale cleansing and refactoring remain part of the main LiNKsites lifecycle. Aggregate learning and reusable asset improvement belong to the LiNKsites Architect.

---

## 6. Current repository baseline

This roadmap was prepared against `main` at `78f5d50ab8acbdc38de863895deb337220d201c1`. An implementation master must re-verify the actual approved base SHA before dispatch; this identifier describes the inspected baseline, not permission to use a stale commit.

### 6.1 What exists

- `apps/cms`: the Payload CMS application and collection/plugin configuration.
- `apps/web-master`: the intended single rendering platform and the current `marketing-smb-v1` template.
- `apps/web-company`: a paused placeholder duplicate with no intended production role.
- `packages/program-ledger`: substantial Ledger domain/store code and tests.
- `packages/factory-catalog`: catalog, lifecycle, executor, promotion, and repository code with substantial tests.
- `packages/types`: shared TypeScript definitions, currently too small to be the complete cross-Program contract authority.
- `supabase/migrations`: current Ledger/site work alongside historical mirror-era artifacts that must be distinguished and reconciled.
- `deploy/docker-compose.deploy.yml` and deployment/runbook material: useful deployment foundations, not proof of a production deployment.
- CI and package-level tests: useful local evidence, but not full coverage of CMS build/integration, browser behavior, production composition, recovery, or a complete website Program run.

### 6.2 Confirmed gaps this roadmap closes

- No production composition root currently instantiates the Ledger, repositories, executors, intake loop, and external adapters as one continuously operating Program.
- Phase definitions and gates are incomplete, and some completed execution artifacts still expose legacy `Stage` names at a documented code-compatibility boundary.
- The CRM pull/claim/completion adapter and the canonical shared envelope are absent.
- The active Supabase working-content layer is not yet wired through template-package consumption, prospect copy adaptation, validation, exact-version promotion, and receipts.
- Promotion logic does not yet prove a complete real Payload draft/read-back/separate-publication path.
- `web-master` still has mock/fallback behavior and lacks full production browser/quality proof.
- Current code contains direct raw-n8n boundary drift instead of a governed LiNKautowork adapter.
- LiNKlibraries consumption, substantive master-template governance, and the LiNKsites Architect proposal path are not complete.
- VPS artifacts exist, but deployment, secrets, migrations, monitoring, recovery, and one live end-to-end run have not been proven.

The existence of unit-tested classes is therefore not equivalent to a functioning LiNKsites Program. Each later packet must connect its capability through the real composition root and prove the result.

---

## 7. Runtime architecture required before VPS deployment

### 7.1 Central orchestrator

A production composition root must exist as an independently runnable service. It must:

1. Continuously poll an injected intake adapter for eligible CRM work.
2. Atomically claim work using a stable external ID and idempotency key.
3. Create or resume the correct Ledger hierarchy and Issues.
4. Compute readiness from dependencies and gates.
5. Dispatch registered executors with bounded concurrency.
6. Persist Run attempts, leases/fencing, retries, timeouts, cancellation, costs, evidence, and outputs.
7. Recover after process termination without duplicating side effects.
8. Poll or consume outcome records and dispatch activation or recycling flows.
9. Write a versioned completion or failure envelope through an output adapter.
10. Expose health/readiness and structured operational telemetry.

The first controlled test uses a file/manual adapter implementing the same interface as the future CRM adapter. It must not introduce a second contract.

### 7.2 Required executor chain for the first website

```text
Intake validation
  → foundation/template selection
  → exact-SHA template package verification and materialization
  → Site Specification
  → prospect adaptation
  → lead-fact mapping and copy/text adaptation using bundled template assets
  → Site Assembly Manifest
  → working-content persistence and pre-promotion gates
  → Payload draft promotion
  → CMS parity plus functional/visual/accessibility/SEO/security gates
  → Payload publication for private preview
  → preview deployment/access wall/noindex verification
  → completion envelope with private URL and evidence
```

Each arrow is a dependency and each material side effect is idempotent and receipted.

### 7.3 Template-bundled assets and prospect copy adaptation

The initial production model does not request new content or media generation for each prospect. At first, LiNKtrend manually creates a vertical template once together with its complete baseline copy/text and media/assets, and stores the approved versioned package in LiNKlibraries. A future dedicated Program may automate that template-production process, but it is not part of the current LiNKsites Program. Template creation is therefore a one-off product-development cost outside the per-website LiNKsites run.

For each website, LiNKsites must:

- consume the exact approved LiNKlibraries template/package SHA and verify its complete inventory, integrity, compatibility, licenses, and provenance;
- map the verified `LeadResearchPackage` facts into the package's content schema;
- modify/adapt the package's baseline copy and text for the specific prospect without inventing facts;
- use the package's bundled media/assets, plus only verified prospect-owned brand assets when supplied and authorized;
- create a new immutable Supabase working-content version recording source lead/research fields, baseline package and asset SHAs, copy modifications, factual-claim validation, locale/translation lineage, costs/retries, and resulting checksum;
- fail closed when a required asset, field, fact, license, or package component is absent instead of initiating an ungoverned per-prospect generation request.

Placeholder text, fake testimonials, fake addresses, fake certifications, unsupported claims, unlicensed media, or an incomplete template package fail the production gate.

### 7.4 LiNKautowork boundary

LiNKsites integrates with LiNKautowork through a signed, versioned adapter or event contract. Source code must not describe a raw n8n webhook as the Program boundary. For the first test, LiNKautowork-dependent optional behavior may use a documented local sink, but the interface, signatures, idempotency, event identity, and failure behavior must be production-shaped.

YouTube metadata ingestion remains optional and disabled for the initial path.

---

## 8. Security and safety invariants

The implementation and both audits must enforce all of the following:

1. Unknown hostnames fail closed.
2. Private demos require an access control mechanism and return `noindex`/non-discovery signals.
3. Public web requests never receive Payload/Supabase privileged credentials.
4. Payload public reads are site-scoped, locale-scoped, and published-only.
5. Supabase working records and Ledger records have organization/site isolation appropriate to their consumers.
6. Service identities have the minimum required database/API privileges.
7. Secrets come from runtime injection; repository examples contain names/placeholders only.
8. Inbound manual/CRM and LiNKautowork envelopes are schema-validated, authenticated when live, replay-resistant, and correlated.
9. Promotion and publication are separate capabilities and leave separate receipts.
10. Retries cannot duplicate Payload documents, deploy previews twice, or write contradictory completion records.
11. No-sale recycling cannot run while a conversion lock is active.
12. Logs and evidence redact credentials and sensitive lead/customer fields.
13. Destructive cleanup, migration application, publication, DNS, and restore operations are explicitly gated.

---

## 9. Two delivery Phases

### Delivery Phase 1 — everything ready before VPS deployment

Phase 1 contains two implementation waves followed by independent audits and one final local release gate. Phase 1 changes source, migrations, tests, contracts, documentation, and deploy artifacts. It does not mutate the VPS, live Supabase, Cloudflare, DNS, Payload, LiNKautowork, CRM, secrets, or protected branches without separate authority.

#### Wave 1 — contracts and durable foundations

Wave 1 establishes the definitions that every later Issue relies on:

- canonical scope and Phase terminology;
- CRM-shaped pull/completion/outcome contracts;
- populated Program/Module/Phase hierarchy and gates;
- continuous orchestrator foundation and durable claims;
- versioned Supabase working-content contracts and repositories;
- LiNKlibraries consumption and master-template identity;
- retirement plan for legacy `web-company` and mirror-era artifacts.

Wave 1 closes only after integration and a Codex Sol Medium audit returns `PASS`. Any `HOLD` finding becomes a bounded Luna High correction packet and is re-audited against the corrected exact SHA.

#### Wave 2 — complete vertical slice and release readiness

Wave 2 implements:

- complete template-package consumption and real prospect-specific copy/text adaptation using bundled assets;
- deterministic assembly and end-to-end orchestration;
- authenticated Payload draft promotion and separate publication;
- final master template and private preview controls;
- LiNKautowork boundary and event behavior;
- sale/no-sale technical outcome flows and LiNKsites Architect baseline;
- Docker/deploy/health/backup/rollback/observability preparation;
- CI, integration, browser, security, tenancy, failure, and local release certification.

Wave 2 closes only after a Codex Sol Medium audit returns `PASS`, every correction is re-audited, and the Phase 1 release gate passes from a clean exact commit.

### Delivery Phase 2 — VPS deployment and one controlled website test

Phase 2 is separately authorized operational work. It applies reviewed migrations, injects real secrets, builds/runs exact images on the VPS, configures Traefik/Cloudflare/private preview access, verifies monitoring and backup/restore, runs one manual-input website through the real deployed Program, and records the completion envelope and evidence.

Phase 2 does not test payment, public customer launch, customer domain cutover, or post-sales. Its detailed packet is [`production-roadmap/phase-2/VPS-DEPLOYMENT-AND-PILOT-PACKET.md`](./production-roadmap/phase-2/VPS-DEPLOYMENT-AND-PILOT-PACKET.md).

---

## 10. Phase 1 Definition of Done

Phase 1 is complete only when every condition below is evidenced from one exact, clean, pushed candidate SHA and the final Sol Medium release audit returns `PASS`.

### 10.1 Architecture and contracts

- Active docs and code use Program → Module → Phase → Issue → Executor → Run consistently.
- LiNKsites continuously pulls/claims work; no language treats normal operation as passive receipt only.
- LiNKreach, post-sales, LiNKlibraries, LiNKautowork, LiNKplatform, Payload, Supabase, and web-master ownership boundaries are consistent across active docs and code.
- Intake, completion, outcome, activation, recycling, library receipt, content version, promotion, publication, and preview records are versioned and schema-validated.

### 10.2 Real executable workflow

- A production composition root starts without test-only assembly.
- A manual lead packet executes through the same input port as a future CRM record.
- Duplicate dispatch, parallel workers, crash/restart, timeout, retry, cancellation, replay, and partial failure are tested.
- The complete first-site dependency graph is represented as real Ledger Issues/Runs/Gates and can resume from durable state.
- No critical path depends only on an in-memory map or an opaque caller-supplied success reference.

### 10.3 Working content and CMS

- Supabase migrations and repositories implement versioned, site-scoped working content and provenance.
- Tenant-isolation positive and negative matrices pass against a real PostgreSQL-compatible engine.
- A real Payload instance accepts authenticated draft promotion, readback verifies checksums, publication is separately gated, and public reads remain published-only.
- Retired `lsites_core` runtime paths cannot be invoked by active scripts or CI.

### 10.4 Master template and assets

- `marketing-smb-v1` or its renamed successor is the first approved LiNKlibraries template entry with substantive source/tests and a recorded commit SHA.
- LiNKsites fetches/verifies/materializes the entry and records a Library receipt.
- Production mode has no material mock/fallback content path.
- Home Services / Standard real-content fixture renders complete pages from Payload.
- Responsive, accessibility, SEO, performance, localization, visual, unknown-host, noindex, and access-wall gates pass.
- `apps/web-company` is removed from the active workspace and CI after dependency/reference verification; Git history remains the recovery mechanism.

### 10.5 Integrations and lifecycle

- Direct n8n-as-boundary naming/code is replaced with a LiNKautowork adapter/event contract.
- Optional YouTube behavior is disabled for the certified first path.
- Sale authorization can trigger technical activation without giving LiNKreach infrastructure credentials.
- No-sale outcome triggers prospect cleansing/refactoring/recycling and respects conversion locks.
- LiNKsites Architect produces a governed candidate proposal without directly mutating LiNKlibraries.

### 10.6 Deploy and operate

- CMS, web-master, and orchestrator production images build and run locally from pinned bases.
- Compose/deployment artifacts use health checks, non-root runtime users, bounded resources, restart behavior, volumes, networks, and secret injection.
- Environment contract, migration/apply/rollback procedure, deployment order, smoke tests, backup/restore, rollback, monitoring, and incident evidence are documented and mechanically checked where possible.
- Phase 2 operator packet identifies every external input and Principal gate without embedding secret values.

### 10.7 Verification baseline

At minimum, the clean candidate passes:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm audit --audit-level=moderate
```

It also passes dedicated:

- orchestrator end-to-end and recovery tests;
- CMS contract/integration and Playwright tests using disposable real services;
- web-master browser and multi-tenant tests;
- Payload promotion/publication integration tests;
- RLS/tenant-isolation tests;
- Docker image build/run and health probes;
- secret scan and configuration-contract validation;
- one local or disposable-environment full website completion rehearsal using real software components rather than mocked success.

Skipped tests, cached-only evidence, missing credentials, unavailable Docker, or unavailable live services must be reported. They cannot be silently counted as a pass for the Phase 1 release gate.

---

## 11. Execution governance

### 11.1 Master orchestrator

The master orchestrator remains GPT-5.6 Terra Medium for the entire delivery task and is not handed off to an implementation or audit agent. It owns the dependency graph, worktree allocation, Codex CLI dispatch, progress tracking, integration order, conflict resolution, audit/correction loops, and final evidence. It does not implement a work packet, let an implementation agent self-approve, or merge protected branches.

### 11.2 Implementation agents

- Implementation and correction work is dispatched by the Terra master through Codex CLI to Codex Luna High with High reasoning. Grok 4.5 High is an approved alternative only when explicitly selected through an available CLI surface.
- A fresh Codex Sol Medium subagent performs every independent wave/release audit. Sol is read-only, never implements its audit subject, and does not repair its own findings.
- One independent packet per agent.
- Isolated worktree and dedicated branch per packet.
- Exact start SHA must be recorded before work.
- Agents may edit only their owned paths and must stop on overlapping user/agent work.
- Agents produce code, tests, proof, exact commands/results, changed files, residual risks, commit SHA, and clean-worktree evidence.
- Agents do not self-audit, self-merge, promote, deploy, create credentials, or mutate live infrastructure.

### 11.3 Work packs and atomic Issues

Each Markdown work packet is one **work pack**. A work pack groups related atomic Issues that can share one owner and code boundary. Every numbered item under `Required implementation`, `Required tests`, or an equivalent checklist must be represented in the execution system as either:

- one atomic Issue with one observable outcome, owner, dependency set, allowed paths, test, evidence requirement, and gate; or
- a short dependency-ordered set of smaller Issues when the item cannot safely be completed and verified as one unit.

An Issue is not atomic if it has multiple unrelated owners, can be half-complete while reported complete, or cannot be independently tested. The implementation agent must submit its proposed Issue manifest to the master before editing. The master approves the split, records dependencies, and dispatches only ready Issues. This clarification does not let an agent expand the packet's scope.

### 11.4 Integration

The master verifies each packet’s ancestry, diff boundary, tests, and proof before serial integration into the wave candidate. Downstream readiness depends on integrated—not merely completed—work.

### 11.5 Independent audit

After every wave, a fresh Codex Sol Medium auditor receives the exact candidate SHA and [`production-roadmap/audit/WAVE-AUDIT-PACKET.md`](./production-roadmap/audit/WAVE-AUDIT-PACKET.md). The auditor is read-only and returns exactly `PASS` or `HOLD` with reproducible findings.

- `PASS`: the next wave or release gate may proceed.
- `HOLD`: each finding becomes a bounded Luna High correction packet; the whole corrected candidate is re-audited.

Unavailable evidence or an external prerequisite is recorded inside a `HOLD`; it never permits progression.

No waived critical/high finding is allowed for Phase 1 completion. Any lower-severity waiver requires explicit Principal approval and a recorded rationale.

---

## 12. Dependency graph and concurrency

```text
W1-01 canonical contracts/terminology
 ├── W1-02 Ledger hierarchy and durable gates
 ├── W1-03 CRM-shaped pull/output contracts and orchestrator foundation
 ├── W1-04 versioned working-content plane
 └── W1-05 LiNKlibraries client/master-template contract

W1-02 + W1-03 + W1-04 + W1-05
 └── W1-06 Wave 1 integration and legacy-boundary reconciliation
      └── Sol Wave 1 audit → corrections until PASS

Wave 1 PASS
 ├── W2-01 template-asset consumption/copy adaptation
 ├── W2-03 Payload promotion/publication
 ├── W2-04 master template/private demo
 └── W2-05 LiNKautowork adapter/events

W2-01 + W2-03 + W2-04
 └── W2-02 end-to-end orchestrator vertical slice

W2-02 + W2-05
 └── W2-06 activation/recycling/LiNKsites Architect

All Wave 2 implementation packets
 └── W2-07 deployment/operations/CI hardening
      └── W2-08 local certification and release evidence
           └── Sol Wave 2 release audit → corrections until PASS
                └── Phase 1 complete
                     └── Principal authorization required for Phase 2 VPS work
```

Agents may run in parallel only where this graph and path ownership permit. The master must reduce concurrency whenever shared migrations, manifests, generated files, lockfiles, or cross-cutting types would create unsafe overlap.

---

## 13. Phase 2 entry gate

VPS deployment may begin only when:

1. Phase 1 Definition of Done is satisfied.
2. Final Sol Medium audit verdict is `PASS`.
3. Exact release candidate SHA and container image digests are recorded.
4. Worktrees are clean and expected branches are pushed.
5. Phase 2 external prerequisites are inventoried without exposing values.
6. Backup/rollback targets are named and verified available.
7. The Principal explicitly authorizes VPS, live Supabase/Payload, secret, DNS/Cloudflare, and deployment mutations.

Approval to implement Phase 1 does not authorize Phase 2.

---

## 14. Inputs that must be supplied or confirmed

These do not change the approved architecture. They are environment/business inputs that cannot be invented by an implementation agent:

| Input | Needed by | Effect if unavailable |
|---|---|---|
| LiNKlibraries repository access and approval workflow | W1-05/W2-04 | Blocks substantive cross-repository template completion |
| Actual CRM vendor/API and LiNKreach field mapping | Continuous operation after the manual pilot | Does not block the contract-identical manual pilot; blocks claiming live CRM integration complete |
| LiNKautowork signed gateway/event specification and credentials | W2-05 live proof/Phase 2 | Local contract/outbox proof can proceed; live delivery cannot be claimed |
| Approved complete LiNKlibraries vertical-template package, including baseline copy/text, bundled media/assets, schemas, licenses, and provenance | W1-05/W2-01/W2-04 | Blocks the real first-site path; LiNKsites does not substitute per-prospect content/media generation |
| Working-content, prospect-asset, retention, privacy, and license policy | W1-04/W2-01/W2-06 | Blocks final data/RLS/recycling gates |
| VPS inventory, access, hostnames, ports, backup location, and maintenance window | Phase 2 | Blocks deployment only |
| Cloudflare zone/access method and approved private-preview authentication | Phase 2 | Blocks external TLS/private-preview proof |
| Principal-approved first lead/research package | Phase 2 pilot | Blocks the one-website test |

The master must surface any missing item at the packet that first requires it. It may not silently replace live evidence with a mock or choose a vendor/policy that changes scope.

---

## 15. Final first-test success condition

The first deployed website completion test passes only when one manually supplied, schema-valid lead/research package produces all of the following through the real deployed LiNKsites Program:

- one claimed and completed Program workflow with no duplicate side effects;
- one complete Home Services / Standard website using the approved master-template package, its bundled assets, and real lead-specific adapted copy;
- versioned Supabase working records and complete provenance;
- authenticated Payload draft promotion and separate publication receipt;
- a private, access-controlled, noindex URL served by web-master on the VPS;
- functional pages/navigation/media/forms as scoped for the template;
- passing content, visual, responsive, accessibility, SEO, performance, tenant-isolation, and security gates;
- a CRM-shaped demo-completion record containing correlation IDs, URL, template/library SHA, evidence references, and completion status;
- health, logs, metrics, cost, backup, and rollback evidence;
- no payment, public-domain cutover, or post-sales claim.

If any required evidence is absent, the test is not complete.

---

## 16. Approval boundary

This roadmap and its work packets are planning artifacts. The next action after documentation validation is Principal review. Implementation begins only after the Principal explicitly approves the roadmap and packets. Phase 2 begins only after a later, separate operational approval.
