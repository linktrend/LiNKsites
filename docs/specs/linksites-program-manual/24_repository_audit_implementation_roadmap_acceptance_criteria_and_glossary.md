# LiNKsites Program Manual

## Section 24 — Repository Audit Requirements, Implementation Roadmap, Acceptance Criteria, and Glossary

**Document set:** LiNKsites Program Manual  
**Section:** 24 of 24  
**Status:** Reconciled current doctrine for engineering preparation  
**Date:** 2026-07-13  
**Owner:** LiNKtrend  
**Intended readers:** Carlos, AI repository auditors, Codex and Cursor implementation agents, product and engineering agents, security and infrastructure reviewers, LiNKtrend Sales integration designers, OpenClaw oversight designers, and future human collaborators  

---

## 1. Purpose of this section

This section converts the LiNKsites doctrine defined in Sections 1–23 into a controlled repository-audit and implementation-completion method.

It defines:

- What a future AI must inspect before proposing changes
- How to distinguish working code, partial code, placeholders, duplicates, and obsolete assumptions
- How to map repository evidence to manual requirements
- How to preserve useful existing work and open-source components
- How to classify gaps and risks
- What audit deliverables must be produced
- How to create an evidence-based implementation roadmap
- Definitions of Ready and Done
- Program-level acceptance criteria
- The canonical glossary used throughout the manual

The section is written for a reader who has no access to the originating conversation.

## 2. Plain-English instruction to the future auditor

Do not begin by rebuilding LiNKsites.

First find every relevant repository, deployed service, database, automation, configuration, document, and reusable asset. Determine what is real, what works, what is unfinished, and what conflicts with this manual. Preserve working assets. Repair and integrate where sensible. Replace only when evidence shows that adaptation is unsafe, more expensive, or incompatible.

The audit must end with a precise completion plan that another AI can implement in bounded work packets.

## 3. Status and authority of this manual

The 24-section LiNKsites Program Manual is the reconciled current doctrine for engineering preparation.

Authority order for the audit is:

1. Carlos's explicit later decisions
2. This reconciled manual and approved amendments
3. Approved architecture/decision records produced after it
4. Verified current repository and deployment evidence
5. Older PRDs, proposals, notes, and archived sources as historical evidence

Older material does not override the manual merely because it is implemented in code.

## 4. Settled doctrine the audit must preserve

At minimum:

- LiNKsites is both the managed-website business and autonomous website-factory Program.
- Program hierarchy is Program → Modules → Stages → Issues → Runs.
- The production method is deterministic reusable assembly plus governed AI adaptation.
- Vertical Kits, tier specifications, components, design intelligence, foundations, and previews are reusable factory assets.
- Build-first, sell-from-proof uses progressive preview investment and recycling.
- Supabase/PostgreSQL is the working and operational layer; Payload/PostgreSQL is draft/published content authority.
- LiNKsites, LiNKtrend Sales, and LiNKautowork remain independent Programs.
- LiNKtrend Sales is product-agnostic.
- Stripe is payment-first; Odoo is commercial/accounting authority.
- LiNKaios is postponed and not a LiNKsites dependency.
- OpenClaw is an external oversight adapter, not the runtime/control plane.
- Hosting begins lean, scales by measured capacity, and may become regional around justified 60–80-client cohorts.
- Legal resolution is deferred, but technical enforcement points must exist.
- Open-source reuse is preferred over building mature general capabilities from scratch.

## 5. What the audit must not do

During the audit phase, do not:

- Delete, move, rename, archive, or rewrite repositories or files
- Rotate credentials
- Change production state
- Migrate databases
- Merge branches or open implementation PRs
- Disable CI or security controls
- Expose secrets in reports
- Treat failed tests as irrelevant
- Assume configured services are deployed or reachable
- Infer completion from README claims
- Mark historical LiNKaios/Suite dependencies as current doctrine
- Recommend a greenfield rewrite without comparative evidence
- Resolve legal policy by engineering assumption

Read-only diagnostic commands and safe local analysis are permitted.

## 6. Required audit outcome

The audit produces:

1. Repository and deployment inventory
2. Architecture and dependency map
3. Requirement-to-evidence Traceability Matrix
4. Current-state classification for every material capability
5. Security, reliability, data, and supply-chain findings
6. Reusable asset and open-source adoption register
7. Contradiction and decision register
8. Gap and risk register
9. Test and CI baseline
10. Proposed target repository topology
11. Phased implementation roadmap
12. AI-ready context package and work-packet backlog
13. Evidence-backed estimate ranges only after discovery
14. Explicit blockers requiring Carlos

## 7. Audit principles

1. Evidence over claims.
2. Preserve before changing.
3. Inspect deployed reality as well as code.
4. One requirement may span several repositories.
5. One repository may support several Programs but must keep boundaries.
6. Working does not automatically mean aligned.
7. Incomplete does not mean worthless.
8. Security-critical unknowns are risks, not assumed passes.
9. Tests prove only what they actually cover.
10. A weighted score cannot hide a critical failure.
11. Audit outputs must be reproducible.
12. The solo nontechnical owner receives a plain-language summary.

## 8. Audit scope

Scope includes:

- GitHub organizations and repositories
- Local or archived repositories identified by Carlos
- LiNKsites frontend/template/component code
- Payload forks, configurations, plugins, and schemas
- Supabase/PostgreSQL migrations and projects
- n8n fork, workflows, credentials references, and deployment
- Sales, Odoo, and Stripe adapters relevant to LiNKsites
- Infrastructure-as-code, Docker, reverse proxy, Cloudflare, DNS, CI/CD, and VPS configuration
- Observability, Langfuse, monitoring, backup, and secrets configuration
- Documentation, PRDs, manuals, ADRs, runbooks, and manifests
- Design catalogs, Vertical Kits, foundations, media, and test fixtures
- Deployed development, staging, and production environments
- Vendor and open-source dependencies

## 9. Access and safety prerequisites

Before inspection, record:

- Authorized repositories and organizations
- Read-only credentials and expiry
- Environments that may be queried
- Prohibited systems or data
- Sensitive-data handling rules
- Carlos's approval for any non-read action
- Working directory and evidence location
- Audit tool versions

Never put secrets into Markdown, prompts, screenshots, logs, or issue descriptions.

## 10. Audit Evidence Record

```yaml
evidence_id: id
evidence_type: file|commit|workflow-run|test-result|deployment|database-schema|screenshot|provider-state
source:
  repository: optional-url
  commit: optional-sha
  path: optional-path
  environment: optional-name
  external_ref: optional-ref
captured_at: timestamp
captured_by: auditor-id
content_digest: sha256
summary: concise-factual-description
supports_requirements: []
data_classification: internal
limitations: []
```

Evidence references are stable and do not rely on an ephemeral chat transcript.

## 11. Audit snapshot

Record one reproducible baseline:

- Repository default branches and commit SHAs
- Tags/releases
- Open PRs and issues
- CI status and recent failures
- Dependency lockfile digests
- Deployed image/release identifiers
- Database migration heads
- Active service versions
- Relevant provider configuration summaries
- Timestamp and auditor toolchain

If a repository changes during audit, record the new snapshot rather than mixing evidence silently.

## 12. Repository discovery

Search repository names, topics, READMEs, package manifests, Docker Compose, CI references, submodules, package scopes, deployment files, environment-variable examples, webhooks, database URLs, and internal documentation.

Discover forks such as `link-*`, upstream remotes, archived or private repositories, and duplicate prototypes. A repository name alone does not establish its purpose.

## 13. Repository Registry

```yaml
repository_id: id
name: name
url: url
visibility: private|public
default_branch: branch
snapshot_commit: sha
owner: team-or-person
programs: []
declared_role: text
observed_role: text
upstream:
  url: optional-url
  fork_point: optional-sha
languages: []
package_managers: []
deployments: []
ci_workflows: []
security_features: []
status: active|experimental|archived|unknown
```

## 14. Deployment and Service Registry

For each service record:

- Service ID and purpose
- Repository and release
- Environment and region
- Host/provider
- Domain/endpoints
- Data stores
- Credentials identity, not value
- Network exposure
- Health/monitoring
- Backup/restore
- Owner
- Current state
- Cost source
- Dependencies and consumers

Configured but unreachable services are classified separately from verified deployments.

## 15. Data and Storage Registry

Inventory:

- PostgreSQL/Supabase projects
- Payload databases
- Schemas, tables, RLS, roles, functions, triggers, queues, and migrations
- Object-storage buckets
- Backup locations
- Observability stores
- Local persistent volumes
- Odoo mappings

Record authority, tenant key, environment, sensitivity, retention reference, backup, migration owner, and consumers.

## 16. Current-state classifications

Every material asset/capability receives one status:

| Status | Meaning |
|---|---|
| `verified-working` | Demonstrated against current snapshot and evidence |
| `working-misaligned` | Functions but contradicts current doctrine or boundary |
| `partial` | Meaningful implementation exists but completion criteria fail |
| `prototype` | Exploratory implementation, not production-ready |
| `configured-unverified` | Definition exists; runtime operation not proved |
| `stub-placeholder` | Interface, TODO, mock, or fake result only |
| `broken` | Intended capability exists but tests/runtime fail |
| `duplicate` | Overlaps another implementation; authority unresolved |
| `obsolete` | Implements superseded doctrine |
| `absent` | No relevant implementation found |
| `unknown` | Insufficient access/evidence |

## 17. Capability Completion Record

```yaml
capability_id: linksites.preview.generate
manual_requirements: [section-13-refs]
repositories: []
current_status: partial
evidence_refs: []
tests:
  present: true
  last_verified: timestamp
  limitations: []
dependencies: []
security_notes: []
gaps: []
recommended_disposition: adapt
confidence: value
```

## 18. Requirement Traceability Matrix

The matrix connects:

```text
Manual requirement
→ architecture/component
→ repository/path
→ schema/configuration
→ tests
→ deployment evidence
→ observability evidence
→ current status
→ gap/work packet
```

Every acceptance criterion in Sections 1–23 must have a traceability entry or explicit not-applicable rationale.

## 19. Code evidence standard

Evidence that code exists includes exact path, commit, symbol/configuration, tests, and runtime relationship.

Comments, TODOs, generated types without handlers, unused packages, disabled workflows, and mocks do not prove the capability. A passing test that never exercises production configuration is identified as limited evidence.

## 20. Contradiction handling

When code, documentation, or deployments conflict:

1. Record both claims.
2. Identify their dates and authority.
3. Test actual behavior.
4. Apply the manual's authority order.
5. Classify useful implementation separately from obsolete meaning.
6. Create an ADR or Carlos decision only if current doctrine does not resolve it.

Never erase contradictory evidence during audit.

## 21. Architecture audit

Determine:

- Actual monorepo/multirepo topology
- Runtime boundaries
- Data flows
- Control-plane ownership
- Deployment boundaries
- Shared versus Program-specific services
- Single points of failure
- Circular dependencies
- Environment separation
- Migration paths
- Whether documentation matches reality

Produce a current-state and target-state architecture map.

## 22. Program-boundary audit

Verify that:

- LiNKsites owns website production/operation.
- Sales owns leads, outreach, offers, checkout initiation, and commercial pipeline.
- Odoo owns commercial/accounting records.
- Stripe owns processor payment facts.
- LiNKautowork is not the universal LiNKsites executor.
- OpenClaw is not the Program Controller.
- LiNKaios is not required.
- Payload is not a CRM.
- Supabase is not accounting authority.
- n8n history is not canonical workflow state.

## 23. Program-core audit

Inspect Program, Module, Stage, Issue Type, Issue, Run, Gate, evidence, retry, compensation, exception, approval, cost, and capacity records.

Verify deterministic state transitions, idempotency, leases/fencing where required, executor adapters, budgets, audit events, and recovery. If the Program Ledger does not exist, identify reusable work before proposing it.

## 24. Schema and contract audit

Inventory schemas for:

- Site Specifications
- Design and component registries
- Vertical Kits and tier specifications
- Preview requests/results
- Working and promotion packages
- Paid activation and launch completion
- Cross-Program contracts
- Issues/Runs/Gates
- Hosting/domain assignments
- Incidents/exceptions/approvals
- Telemetry/cost/capacity

Check versioning, validation, compatibility, generated types, examples, and contract tests.

## 25. Database audit

Review migration ordering, schema drift, indexes, foreign keys, tenant scoping, RLS, grants, service roles, functions, triggers, locks, connection pooling, backups, PITR, restore tests, query performance, disk IO, and environment isolation.

Do not run destructive migration repair during audit.

## 26. Frontend and runtime audit

Inspect Next.js/runtime version, multi-tenant site resolution, unknown-host behavior, caching keys, draft/public separation, component registry integration, dynamic versus static rendering, error pages, forms, analytics, Web Vitals, bundles, images, security headers, and release strategy.

Prove that one customer's content cannot be served to another.

## 27. Payload audit

Inspect collections/globals, access control, tenant plugins/logic, hooks, draft/version behavior, localization, media, migrations, jobs, API exposure, publication, admin roles, preview tokens, and PostgreSQL deployment.

Identify whether Payload writes bypass the governed Promotion Service.

## 28. Design and factory-asset audit

Inventory design tokens, UI-UX Pro Max-derived catalog data, color palettes, font pairings, component definitions, examples, Vertical Kits, tier rules, templates/foundations, copy/media patterns, and provenance.

Classify assets as reusable, customer-specific, restricted, duplicated, outdated, untested, or missing.

## 29. Preview-production audit

Trace prospect input through research package, authorization level, foundation selection, adaptation, working layer, promotion, Payload draft, preview build, QA, deployment, analytics, conversion lock, expiry, and recycling.

Prove cost attribution and that recycling removes prospect-specific private information.

## 30. Paid fulfilment audit

Trace verified payment and Odoo state through Paid Website Activation Package, idempotent Customer Site creation, entitlement snapshot, customer facts, finalization, approval, launch candidate, production validation, Launch Certificate, completion handoff, and active service.

A browser redirect must not authorize fulfilment.

## 31. Hosting and operations audit

Inspect Cloudflare, Traefik, frontend pools, container definitions, site placement, regional configuration, Payload/database topology, desired state, monitoring, remediation, backup, restore, migration, patching, capacity, incident, and decommission workflows.

Reject fixed “20 sites per VPS” logic unless it is merely a configurable hypothesis with measured override.

## 32. Cross-Program integration audit

Inspect outbox/inbox, Integration Ledger, signatures, versions, idempotency, ordering, Stripe ingress, Payment Verification Records, Odoo Adapter, catalog mappings, activations, launch completion, service-state instructions, website lead routing, reconciliation, and repair.

No direct database write across Program boundaries is accepted without explicit architecture approval.

## 33. Security architecture audit

Assess against the manual, NIST SSDF, OWASP ASVS, and applicable OWASP LLM verification guidance.

Cover threat model, identity, authentication, authorization, tenant isolation, input validation, output encoding, secrets, network exposure, supply chain, audit, logging, backup, incident response, prompt injection, model/tool permissions, and data protection.

## 34. Secret audit

Use approved secret scanning without printing discovered values.

Record secret type, location reference, environment, exposure status, owner, rotation need, and remediation priority. Check source history, CI logs, `.env` files, workflow definitions, images, backups, and documentation.

## 35. Dependency and fork audit

For each important dependency/fork record:

- Upstream project and license
- Current version/commit
- Local modifications
- Update strategy
- Security/support status
- Transitive dependency risk
- Replacement cost
- Whether custom work can become a plugin/adapter instead of a permanent fork

## 36. Software-supply-chain audit

Review branch protection, review policy, signed commits/tags where used, pinned Actions, dependency review, vulnerability scanning, SBOM generation, artifact provenance/attestations, registry controls, release immutability, OIDC deployment identity, and upstream-sync automation.

Use SLSA and OpenSSF Scorecard as guidance, not as a substitute for product-specific review.

## 37. CI/CD audit

Inventory every workflow, trigger, permission, secret, environment, runner, cache, artifact, dependency, deployment, rollback, concurrency policy, and recent result.

Classify canceled or failing workflows by root cause. A badge or workflow file does not prove a healthy pipeline.

## 38. Test audit

Inventory unit, schema, contract, component, integration, E2E, browser, visual, accessibility, performance, security, load, failure-injection, backup/restore, and operational tests.

Record coverage by requirement rather than relying only on line coverage. Identify flaky, skipped, snapshot-only, obsolete, and environment-dependent tests.

## 39. Quality audit

Verify lint, type checks, formatting, dead-code detection, error handling, logging, accessibility, performance budgets, SEO, responsive states, cross-browser tests, visual regression, factual validation, and release Gates.

Quality thresholds must be versioned and tier-aware.

## 40. Observability and cost audit

Inspect OpenTelemetry, metrics, logs, traces, Prometheus/Grafana/Loki/Tempo, Langfuse, correlation IDs, redaction, sampling, alerts, dashboards, cost events, provider prices, allocation, Odoo summaries, SLOs, and capacity forecasts.

Raw AI telemetry must not be copied into Odoo.

## 41. Documentation and runbook audit

Check README, architecture, setup, development, deployment, data dictionary, environment variables, APIs, contracts, runbooks, backup/restore, incidents, security, contribution, upstream sync, licenses, ADRs, and AI agent instructions.

Commands must be executable against the current snapshot.

## 42. License and provenance audit

Record licenses for code, dependencies, fonts, images, video, copy, datasets, models, components, plugins, and forks.

Verify attribution, redistribution, commercial-use, modification, and copyleft obligations. Unknown rights block public reuse of the affected asset but do not require deletion during audit.

## 43. Environment and deployment audit

Verify development, test, staging, preview, and production separation; configuration parity; secret scopes; domain isolation; test/live Stripe separation; database/project boundaries; migration process; feature flags; rollback; and release evidence.

## 44. Data migration and compatibility audit

Identify existing customer/site/content data, schema versions, fixtures, seed data, import/export, migration scripts, rollback, backups, and compatibility guarantees.

Any proposal to replace a component includes a tested data and operational migration path.

## 45. Production evidence audit

If nothing has launched, record that plainly. Development deployments, preview URLs, passing demos, and configured providers do not equal production customers.

Still inspect existing live resources for cost, security, data, and operational risk.

## 46. Existing CI-failure handling

Recent failing or canceled LiNKtrend workflows are audit evidence, not automatic proof that the underlying product is unusable.

For each recurring failure determine first failing step, root cause, affected repository/release, whether failure is deterministic, security impact, whether upstream-sync automation is safe, and the bounded repair needed.

## 47. Existing security-finding handling

Unresolved Supabase or provider findings involving public tables, sensitive columns, RLS, or exposed data are presumptive release blockers for the affected environment.

Verify the current state directly. Do not repeat secret or sensitive content in the report.

## 48. Audit operational safety

Use least-privilege read access, rate-limited queries, local dependency installation only where safe, isolated test databases, redacted evidence, and no production load tests without explicit approval.

If a read action could materially affect cost or service, request authority first.

## 49. Gap Record

```yaml
gap_id: id
requirement_refs: []
capability_id: id
current_status: partial
evidence_refs: []
gap_description: factual-text
impact:
  customer: value
  security: value
  reliability: value
  business: value
  implementation: value
severity: blocker|critical|high|medium|low
dependencies: []
recommended_disposition: reuse|adapt|integrate|replace|retire|build-missing
acceptance_tests: []
decision_required: optional-ref
```

## 50. Gap severity

| Severity | Meaning |
|---|---|
| Blocker | Prevents safe audit continuation, pilot, or required dependency |
| Critical | Tenant isolation, secret exposure, data loss, unauthorized payment/publication, or similar intolerable risk |
| High | Required capability absent/broken or likely major customer/operational failure |
| Medium | Important incompleteness with bounded workaround |
| Low | Improvement, cleanup, documentation, or low-impact inconsistency |

Severity and implementation order also consider dependencies and risk reduction.

## 51. Disposition decisions

Every material existing asset receives one recommended disposition:

- **Reuse:** keep with configuration or minor maintenance.
- **Adapt:** preserve core and modify for current contracts.
- **Integrate:** connect separate sound components through explicit boundaries.
- **Replace:** migrate away because risk/incompatibility outweighs adaptation.
- **Retire:** stop use after dependencies and evidence are preserved.
- **Build missing:** implement LiNKsites-specific capability that no suitable asset provides.
- **Defer:** intentionally postpone with impact and trigger.

“Replace” requires comparative evidence, migration plan, and rollback.

## 52. Audit scoring

The audit may summarize maturity by domain, but scoring rules are:

- Unknown is not a pass.
- Critical failure cannot be averaged away.
- Documentation without runtime evidence receives limited credit.
- Runtime behavior without tests/documentation is still incomplete.
- Security and tenant-isolation Gates are binary release blockers where applicable.
- Confidence is reported separately from score.

## 53. Required audit deliverables

The auditor must produce separate version-controlled Markdown and machine-readable files:

```text
audit/
├── 00_executive_summary.md
├── 01_scope_snapshot_and_method.md
├── 02_repository_registry.yaml
├── 03_service_and_deployment_registry.yaml
├── 04_data_and_storage_registry.yaml
├── 05_current_architecture.md
├── 06_target_architecture.md
├── 07_requirements_traceability.csv
├── 08_capability_status.yaml
├── 09_gap_and_risk_register.yaml
├── 10_security_and_supply_chain.md
├── 11_test_ci_and_release_baseline.md
├── 12_reusable_asset_register.yaml
├── 13_decision_and_contradiction_register.md
├── 14_implementation_roadmap.md
├── 15_ai_context_package.md
└── evidence_manifest.yaml
```

Names may vary, but the contents may not be omitted.

## 54. Executive audit report

The executive summary for Carlos states:

- What LiNKsites currently is in practice
- What is genuinely working
- What is reusable
- What is missing or dangerous
- The few highest-priority decisions
- The proposed first pilot slice
- The phase sequence
- Cost/time ranges with confidence only after evidence
- What the implementation AI should do next

Technical appendices carry detail.

## 55. AI Context Package

The later implementation AI receives:

- This complete manual
- Audit snapshot and registries
- Current and target architecture
- Traceability Matrix
- Decision/contradiction register
- Gap/risk register
- Repository-specific instructions
- Approved roadmap and pilot scope
- Test/CI baseline
- Environment and secret-reference map without values
- Known blockers and approvals
- Exact Definition of Ready and Done

It must not rely on the original chat.

## 56. PRD requirements

After audit, create or update a LiNKsites PRD that references—not duplicates inconsistently—the manual.

The PRD defines:

- Product outcomes and non-goals
- Pilot customer/vertical/tier scope
- Functional and nonfunctional requirements
- Named contracts and schemas
- Acceptance criteria
- Dependencies
- Metrics and release Gates
- Deferred features and policies
- Requirement identifiers linked to the Traceability Matrix

## 57. Architecture Decision Records

Use ADRs for material choices such as:

- Repository topology
- Program Ledger/queue implementation
- Central versus regional Payload/database topology
- Odoo adapter mechanism
- Observability deployment
- Secrets platform
- Preview serving architecture
- Fork versus plugin strategy

Each ADR records context, decision, alternatives, consequences, evidence, status, and supersession.

## 58. Implementation roadmap doctrine

The roadmap is dependency- and evidence-driven, not date-driven.

Rules:

1. Stabilize and understand before feature expansion.
2. Reuse and integrate before replacement.
3. Implement contracts and state before autonomous agents.
4. Secure tenant and secret boundaries before real customer data.
5. Prove one vertical/tier path end to end before broad catalog expansion.
6. Introduce AI only where deterministic methods are insufficient.
7. Instrument before scaling.
8. Make each phase deployable, testable, reversible, and documented.
9. Preserve independent Program operation.
10. Do not block all engineering on deferred legal decisions; expose policy interfaces and safe defaults.

## 59. Roadmap dependency order

```text
Audit and safety baseline
→ canonical contracts and target architecture
→ Program core and security foundations
→ reusable asset factory
→ preview production path
→ paid commercial handoff
→ customer fulfilment and hosting operations
→ observability, autonomy, and exception oversight
→ controlled pilot
→ measured expansion and regional scaling
```

Some work may run in parallel only when dependencies and file ownership do not conflict.

## 60. Phase 0 — Audit, containment, and baseline

Objectives:

- Complete registries and Traceability Matrix.
- Snapshot repositories/deployments.
- Verify current security alerts and CI failures.
- Contain exposed secrets/data without destructive changes under approved remediation work.
- Establish target architecture and decisions.
- Select the pilot slice.

Exit Gate:

- Audit deliverables approved.
- Critical unknowns identified.
- No unresolved known data exposure in pilot environment.
- Implementation backlog is bounded and prioritized.

## 61. Phase 1 — Canonical contracts and repository foundations

Objectives:

- Establish repository ownership and contribution rules.
- Version schemas and generated types.
- Define identifiers, events, contracts, configuration, and policy registries.
- Establish CI baseline, test environments, secret references, SBOM, dependency review, and release provenance.
- Remove mandatory LiNKaios/OpenClaw coupling.

Exit Gate:

- Contract tests pass.
- Repositories build reproducibly.
- CI failures have dispositions.
- Environments and credentials are separated.

## 62. Phase 2 — Program core and governed execution

Objectives:

- Implement or complete Program Ledger.
- Implement Program/Module/Stage/Issue/Run/Gate objects.
- Add queue, leases, idempotency, retries, fallback, repair, and compensation.
- Add executor registry/adapters and deterministic Policy Decision Point.
- Add evidence and audit events.

Exit Gate:

- A synthetic workflow survives duplicates, worker crash, timeout, cancellation, and replay.
- One Issue can be traced through accepted output and cost.
- No model owns workflow truth or authority.

## 63. Phase 3 — Reusable asset and assembly foundation

Objectives:

- Complete Design Intelligence Catalog.
- Complete component registry and deterministic renderer contract.
- Define one approved Vertical Kit and tier specification for the pilot.
- Create representative foundations and fixtures.
- Complete copy/media provenance and asset handling.
- Establish Supabase working layer and Promotion Service boundary.

Exit Gate:

- Deterministic assembly produces valid sites from versioned specifications.
- Component, design, tier, and Payload mappings pass tests.
- Assets have rights/provenance state.

## 64. Phase 4 — Build-first preview path

Objectives:

- Implement Sales Preview Production Request intake.
- Validate research and preview authorization.
- Select/reuse/refactor foundations.
- Create working packages and Payload drafts.
- Build, test, deploy, analyze, lock, expire, and recycle previews.
- Attribute cost and remove prospect-private data during reuse.

Exit Gate:

- At least one synthetic and one approved real pilot prospect can receive a quality-gated preview.
- Duplicate requests do not duplicate builds.
- Recycling is proven safe.

## 65. Phase 5 — Commercial and paid-activation spine

Objectives:

- Implement Integration Ledger/outbox/inbox.
- Implement Stripe verified event ingress.
- Implement Odoo Community adapter for the audited version.
- Publish Product Catalog mappings.
- Implement Payment Verification and Paid Website Activation Package.
- Add launch completion, entitlement change, service state, and reconciliation.

Exit Gate:

- Stripe test-mode payment, Odoo record, activation, and acknowledgement reconcile end to end.
- Browser redirect cannot activate fulfilment.
- Duplicate and out-of-order events are safe.

## 66. Phase 6 — Customer finalization and production launch

Objectives:

- Create Customer Site Instance.
- Finalize facts, copy, media, integrations, domain, and hosting.
- Implement customer approval and scope-change handling.
- Implement launch readiness, publication, deployment, production verification, rollback, Launch Certificate, and completion package.

Exit Gate:

- One pilot site launches from a paid activation using the exact certified release.
- Rollback and recovery are tested.
- Entitlement and customer authority remain traceable.

## 67. Phase 7 — Autonomous hosting and lifecycle operations

Objectives:

- Establish desired-state registry, monitoring, incidents, runbooks, patching, backup, restore, scaling, migrations, domains, TLS, forms, and maintenance.
- Implement site-aware Cloudflare/Traefik routing and security controls.
- Prove one shared frontend pool.
- Implement safe suspension, reactivation, and decommission paths.

Exit Gate:

- Routine failures are detected, remediated, and verified without Carlos.
- Restore and VPS/site migration drills pass.
- Unknown host and cross-tenant tests fail closed.

## 68. Phase 8 — Observability, economics, and OpenClaw oversight

Objectives:

- Complete OpenTelemetry, metrics/logs/traces, Langfuse, dashboards, SLOs, cost events, allocation, capacity forecasts, alerts, exceptions, approvals, and Capability Broker.
- Connect approved financial summaries to Odoo.
- Deploy OpenClaw initially read-only and graduate named runbooks only after evidence.

Exit Gate:

- Carlos can understand health, economics, capacity, and required decisions in plain language.
- OpenClaw outage does not interrupt the Program.
- Every delegated effect has policy, grant, receipt, and verification.

## 69. Phase 9 — Controlled pilot and stabilization

Objectives:

- Run a deliberately small pilot cohort.
- Observe conversion, build cost, launch lead time, quality, hosting cost, reliability, support, and intervention.
- Fix defects and tune policies.
- Validate backup, incident, payment, customer-update, and termination paths.

Exit Gate:

- Pilot acceptance criteria pass over the defined observation window.
- No unresolved Critical/High safety blocker exists.
- Unit economics and capacity evidence support the next cohort.

## 70. Phase 10 — Expansion and regional scaling

Objectives:

- Add Vertical Kits and tiers through the registry process.
- Expand preview volume and active-site cohorts.
- Add VPS capacity according to measured saturation.
- Review architecture around the ~40-client checkpoint.
- Evaluate regional bundles around justified 60–80-client density.
- Revisit Payload/PostgreSQL topology using evidence.

Exit Gate:

- Each expansion preserves SLO, isolation, quality, cost, and recovery criteria.

## 71. Pilot-slice discipline

The first pilot should intentionally constrain:

- One selected SMB vertical
- One primary tier, with only necessary options
- One language/locale combination if practical
- One initial hosting region
- One payment path
- One Odoo commercial mapping
- One preview level subset
- One repeatable customer onboarding path

The exact slice is decided after audit; it is not guessed in this manual.

## 72. Phase Gate contract

```yaml
phase_gate_id: id
phase: phase-number
entry_requirements: []
required_deliverables: []
required_tests: []
security_requirements: []
data_migration_requirements: []
operational_evidence: []
unresolved_allowed: []
blocking_findings: []
decision: pass|conditional|fail
approved_by: authority-ref
evidence_digest: sha256
```

No phase passes from a narrative status update alone.

## 73. AI implementation work packet

Every AI coding task states:

- Context and requirement IDs
- Exact repository, branch, and allowed paths
- Current evidence and dependencies
- Required behavior and interfaces
- Non-goals
- Schemas and contracts
- Security/data constraints
- Tests to create/run
- Definition of Done
- Expected artifacts/receipts
- Commands for verification
- Rollback or safe failure
- Whether writes, deployments, or external actions are authorized

## 74. AI implementation rules

Implementation agents must:

- Inspect before editing.
- Preserve unrelated user changes.
- Use narrow commits/PRs.
- Never commit secrets.
- Implement interfaces/mocks when external services are unavailable rather than fake success.
- Use deterministic code for validation and authority.
- Maintain idempotency and tenant scope.
- Add tests and documentation with code.
- Report assumptions and residual gaps.
- Avoid autonomous production deployment without explicit authority.
- Not rewrite a repository solely for stylistic preference.

## 75. Definition of Ready

An Issue is ready when:

- Requirement and acceptance criteria are clear.
- Target repository/path ownership is known.
- Inputs and schemas exist.
- Dependencies and environments are available or intentionally mocked.
- Security, tenant, and authority classification is set.
- Test method is defined.
- Required decision/approval is present.
- Rollback or compensation is known for effects.
- Budget and executor policy exist.
- No unresolved blocker makes implementation speculative.

## 76. Definition of Done

An Issue is done only when:

- Code/configuration is implemented in authorized scope.
- Formatting, lint, types, unit, contract, integration, and relevant E2E tests pass.
- Security and tenant-negative tests pass.
- Schema/migration is reversible or has tested recovery.
- Observability, cost, and audit evidence exist.
- Documentation and runbook are current.
- No secret or sensitive fixture is committed.
- CI passes at the snapshot commit.
- Required reviewer/Gate accepts the output.
- Deployment evidence exists where deployment is in scope.
- Traceability Matrix and Issue receipt are updated.

“The agent says it is complete” is not completion evidence.

## 77. Test acceptance hierarchy

Required testing is proportional to risk:

1. Static analysis, formatting, types, schema validation
2. Unit and property tests
3. Contract and migration tests
4. Component and integration tests
5. Browser/E2E, visual, accessibility, performance, and SEO tests
6. Tenant-isolation and security-negative tests
7. Load, fault, retry, idempotency, compensation, and recovery tests
8. Staging/canary operational verification
9. Pilot observation

No single layer substitutes for all others.

## 78. Security release acceptance

A release cannot proceed with:

- Known cross-tenant exposure
- Unresolved committed production secret
- Public access to restricted tables/data
- Unverified migration affecting customer data
- Unsupported authentication/authorization bypass
- Untrusted AI/tool path capable of privileged effect
- Missing payment, publication, DNS, or deletion authority check
- Critical dependency vulnerability without approved mitigation
- Missing rollback for a material production change

## 79. Operational release acceptance

Before production:

- Health and readiness checks work.
- Monitoring and alerts are active.
- Backup is current and restore path tested.
- Capacity/headroom is adequate.
- Runbooks and ownership exist.
- Deployment and rollback are rehearsed.
- Correlation and release IDs are visible.
- Customer-impact communication path exists.
- OpenClaw is not required for normal operation.

## 80. Business and product acceptance

The implemented product must:

- Produce a convincing business-specific preview from reusable assets.
- Keep preview cost within authorized policy.
- Convert a valid sale into an exact entitlement.
- Finalize and launch a certified customer site.
- Operate and maintain the site autonomously.
- Preserve customer authority and factual accuracy.
- Report status to Sales/Odoo through contracts.
- Measure cost, quality, capacity, and outcome.
- Support safe change, suspension, reactivation, export/termination policy hooks, and decommission.

## 81. Final Program acceptance

LiNKsites is engineering-complete for its approved initial scope only when:

1. All pilot requirements trace to verified evidence.
2. All required Modules/Stages/Issue Types operate end to end.
3. Critical and High pilot blockers are resolved or explicitly accepted by authorized policy where acceptance is permitted.
4. Security, quality, recovery, and operational Gates pass.
5. Sales/Stripe/Odoo contracts reconcile.
6. One production customer path is proven without manual hidden steps.
7. Routine hosting and maintenance are autonomous.
8. Carlos receives exception-based oversight.
9. Unit economics and capacity are measurable.
10. Documentation permits a new engineer/AI to operate without the original chat.

This is not a claim that every future tier, vertical, region, or optional integration is complete.

## 82. Unresolved-decision handling

Open decisions are represented as:

- ADR `proposed`
- Configuration with safe default
- Feature flag disabled by default
- Policy placeholder with blocked protected action
- Decision Issue assigned to Carlos
- Deferred roadmap item with trigger

They must not be buried as TODO comments or guessed by implementation agents.

## 83. Legal-policy deferral

Jurisdiction-specific legal decisions remain deferred to the final business/legal reconciliation stage.

Engineering must still provide configurable enforcement points for consent, suppression, retention, deletion, domain/customer authority, licensing, outreach constraints, call recording, privacy notices, export, and termination.

Where policy is unknown, protected action remains disabled or uses the approved safe default.

## 84. Change control after approval

Material doctrine changes require:

1. Proposed amendment or ADR
2. Affected manual requirements and repositories
3. Reason and evidence
4. Security, data, cost, customer, and migration impact
5. Compatibility plan
6. Carlos approval
7. Manual/PRD/Traceability update
8. Versioned implementation and tests

Repository behavior does not silently redefine the business.

## 85. Manual compilation and handoff

After Section 24 is approved:

- Confirm all 24 numbered files exist.
- Preserve each file verbatim and in numeric order.
- Create a compiled manual with title, document control, table of contents, and separators.
- Generate a manifest containing filenames, sizes, and digests.
- Keep the separate sections as the maintainable sources.
- Version the compiled manual and manifest together.
- Use the compiled manual as input to the repository audit.

## 86. Glossary — A to C

**Acceptance Gate:** A rule/evidence boundary that must pass before state advances.  
**Action Class:** Deterministic risk category A0–A5 for a proposed effect.  
**Activation Package:** Sales-issued contract authorizing one paid LiNKsites entitlement after Stripe/Odoo reconciliation.  
**ADR:** Architecture Decision Record.  
**Agent:** AI-based executor or overseer with bounded inputs, outputs, tools, and authority.  
**Artifact:** A durable output such as a specification, image, build, report, manifest, or certificate.  
**Authority:** Verified right to approve or perform a particular action.  
**Autonomy Mode:** Manual, supervised, autonomous, or paused posture for a scope.  
**Capability:** Named effect an actor/service may request through policy.  
**Capability Broker:** Service that enforces policy and invokes a narrow privileged executor.  
**Capability Grant:** Scoped, expiring authorization for one capability.  
**Canonical:** Accepted current authority for a fact or doctrine.  
**Carlos:** LiNKtrend founder and current sole human final authority.  
**Component:** Registered reusable frontend building block with schema and tests.  
**Compensation:** Governed action that reverses or neutralizes a prior side effect.  
**Contract:** Versioned structured command, event, query, acknowledgement, or handoff.  
**Correlation ID:** Stable identifier linking related work across systems.  
**Customer Site Instance:** LiNKsites technical/service identity for one paying website entitlement.

## 87. Glossary — D to G

**Definition of Done:** Evidence required before work is accepted as complete.  
**Definition of Ready:** Preconditions required before work may start.  
**Design Intelligence Catalog:** Governed design styles, tokens, palettes, type pairings, and selection rules.  
**Desired State:** Declared configuration the hosting/control system must maintain.  
**Deterministic Executor:** Script/service/automation whose behavior is governed by explicit inputs and rules rather than open-ended reasoning.  
**Entitlement:** Exact product/tier/options/service scope commercially purchased.  
**Evidence:** Attributable information supporting a state, decision, or Gate.  
**Exception:** Condition normal policy cannot safely resolve without non-routine decision or action.  
**Executor:** Automation, code/script, service, browser runner, AI agent, or human that attempts an Issue.  
**Foundation:** Reusable site starting point combining approved structure, components, design, and content patterns.  
**Gate:** See Acceptance Gate.  
**Glossary:** Canonical meanings used throughout the manual.

## 88. Glossary — H to L

**Idempotency:** Property that repeating the same intended action does not create duplicate business effects.  
**Incident:** Unwanted service, security, data, or operational disruption.  
**Integration Ledger:** Durable record of cross-system messages, processing, mapping, and reconciliation.  
**Issue:** Smallest atomic schedulable governed piece of work.  
**Langfuse:** Preferred AI-observability layer for model traces, usage, cost, and evaluations.  
**Launch Certificate:** Evidence that the exact production release passed launch requirements.  
**LiNKautowork:** Independent managed-automation factory/Program; not LiNKsites' universal runtime.  
**LiNKsites:** LiNKtrend's autonomous managed-website business and website-factory Program.  
**LiNKtrend Sales:** Independent product-agnostic lead-to-commercial Program.  
**LiNKaios:** Postponed operating-system concept; not required by LiNKsites.  
**Locale:** In this manual, content language/format context unless explicitly referring to infrastructure region; not a sales-market permission.  
**Module:** Major functional division within a Program.

## 89. Glossary — M to P

**Manifest:** Versioned inventory describing exact inputs, outputs, versions, and evidence.  
**Model Route:** Recorded selection of model/provider/configuration for an AI Run.  
**n8n:** Integration/workflow executor; not the Program source of truth.  
**Odoo:** Commercial/accounting system of record for Linktrend LLC.  
**OpenClaw:** Replaceable external executive/operations oversight adapter.  
**OpenTelemetry:** Vendor-neutral instrumentation and context-propagation framework.  
**Payload:** CMS whose PostgreSQL layer is authority for draft/published website content.  
**Plane:** Human-readable/project work surface where used; not automatically the production Program Ledger.  
**Preview:** Pre-sale website proof linked to one prospect/opportunity and reusable foundation.  
**Preview Level:** Sales-authorized progressive investment class for preview production.  
**Program:** Autonomous factory workflow producing a repeatable business output.  
**Program Controller:** Deterministic service controlling normal state progression.  
**Program Ledger:** Canonical operational record of Issues, Runs, Gates, evidence, and state.  
**Promotion Service:** Trusted boundary validating working content before Payload draft write.  
**Provenance:** Traceable origin, rights, lineage, and transformation history.

## 90. Glossary — Q to S

**Quality Gate:** Gate evaluating factual, functional, visual, accessibility, performance, SEO, security, or release quality.  
**Reconciliation:** Comparison of authorities/records to find and repair missing or conflicting state.  
**Release:** Immutable versioned deployable code/content/configuration set.  
**Repair Issue:** New work that changes invalid inputs, code, configuration, or state before reattempt.  
**Repository Audit:** Evidence-based read-first assessment mapping implementation to current doctrine.  
**Retry:** Another Run of the same Issue contract after an eligible failure.  
**Run:** One immutable execution attempt of an Issue.  
**Runbook:** Versioned operational procedure with authority, preconditions, steps, verification, and rollback.  
**Sales Program:** See LiNKtrend Sales.  
**Site ID:** Stable tenant/site identity used throughout LiNKsites.  
**Site Specification:** Structured definition of pages, content, design, assets, integrations, tier, and constraints.  
**Stage:** Ordered lifecycle segment inside a Module.  
**Stripe:** Initial payment processor and authority for processor event facts.  
**Supabase Working Layer:** PostgreSQL-backed operational workspace for generation, evidence, validation, and promotion state.

## 91. Glossary — T to Z

**Telemetry:** Metrics, logs, traces, events, profiles, and related operational measurements.  
**Tenant:** Customer/site security and data-isolation scope.  
**Tier Specification:** Versioned technical entitlement definition for a saleable website tier.  
**Traceability Matrix:** Mapping from manual requirement to code, test, deployment, evidence, and gap.  
**Vertical:** SMB business category or type.  
**Vertical Kit:** Reusable governed domain package for one vertical.  
**VPS:** Virtual private server hosting one or more shared frontend/runtime workloads.  
**Working Package:** Versioned unpromoted content/asset/site material undergoing validation.

## 92. Canonical object glossary

Key objects include Product Catalog Item, Organization, Prospect, Opportunity, Preview Request, Preview, Preview Release, Foundation, Site Specification, Working Package, Promotion Record, Payload Content Release, Customer, Entitlement, Customer Site Instance, Domain Assignment, Hosting Assignment, Launch Manifest, Launch Certificate, Issue, Run, Gate Result, Incident, Exception, Approval, Cost Event, Capacity Forecast, and Audit Evidence Record.

Each object has stable ID, schema version, lifecycle state, authority, timestamps, provenance, and evidence appropriate to its role.

## 93. State glossary

**Draft:** Editable and not accepted.  
**Validated:** Contract or checks passed; not necessarily published.  
**Accepted:** Required Gate approved the result.  
**Published:** Content is eligible for public serving.  
**Active:** Current operational service state.  
**Blocked:** Cannot progress until named dependency is resolved.  
**Deferred:** Intentionally postponed with trigger.  
**Degraded:** Operating with reduced capability.  
**Suspended:** Public/service capability restricted under authority.  
**Superseded:** Replaced by a later version but retained.  
**Retired:** No longer used for new work.  
**Decommissioned:** Service/resources removed after verified lifecycle completion.

## 94. Authority glossary

**Autonomous Authority:** Deterministic permission for routine action within policy.  
**Customer Authority:** Verified right to approve customer facts, content, domain, or entitled change.  
**Carlos-Protected Authority:** Decisions retained by Carlos unless explicitly delegated.  
**OpenClaw Delegated Authority:** OCS-scoped oversight/runbook capability.  
**Commercial Authority:** Odoo/Sales-backed right defining product, order, entitlement, and service state.  
**Payment Verification:** Verified Stripe processor fact reconciled to commercial context.  
**Break Glass:** Exceptional time-limited human emergency access independent of OpenClaw.

## 95. Observability glossary

**Metric:** Numeric measurement over time.  
**Log:** Structured event record.  
**Trace:** Causal operation path across services.  
**Span:** One operation within a trace.  
**Exemplar:** Representative trace linked from an aggregate metric.  
**SLI:** Service-level indicator.  
**SLO:** Service-level objective.  
**Error Budget:** Permitted gap between perfect service and SLO.  
**Cardinality:** Number of unique metric/log label combinations.  
**Synthetic Monitor:** Controlled automated probe of expected behavior.

## 96. Cost and capacity glossary

**Direct Cost:** Cost attributable to one output/site.  
**Shared Cost:** Cost serving several workloads and allocated by rule.  
**Cost Event:** Operational record of measured/estimated/reconciled cost.  
**Unit Economics:** Cost and contribution per preview, sale, build, site, or cohort.  
**Site Weight:** Calibrated relative workload used for placement/allocation.  
**Capacity:** Safe supported workload while meeting SLO and recovery headroom.  
**Headroom:** Reserved capacity for spikes, failover, backup, deploy, and recovery.  
**Saturation:** Resource condition where additional load threatens objectives.  
**Regional Bundle:** Sites grouped on infrastructure in a justified region; not a sales-market definition.

## 97. Audit and engineering glossary

**SBOM:** Machine-readable software-component inventory.  
**SLSA:** Supply-chain security framework for artifact/source integrity and provenance.  
**SSDF:** NIST Secure Software Development Framework.  
**ASVS:** OWASP Application Security Verification Standard.  
**ADR:** Architecture Decision Record.  
**CI/CD:** Automated integration, validation, release, and deployment pipeline.  
**Artifact Attestation:** Signed statement describing how an artifact was built.  
**Current-State Classification:** Verified-working, misaligned, partial, prototype, configured-unverified, stub, broken, duplicate, obsolete, absent, or unknown.  
**Disposition:** Reuse, adapt, integrate, replace, retire, build missing, or defer.

## 98. Final checklist for the future auditor

Before handing off the audit, confirm:

1. All repositories/services/data stores were searched or marked inaccessible.
2. Snapshot SHAs and environment versions are recorded.
3. No files or production state were changed during read-only audit.
4. Secrets are not exposed in deliverables.
5. All Sections 1–23 acceptance criteria appear in the Traceability Matrix.
6. Every capability has status, evidence, gap, and disposition.
7. Working assets are preserved.
8. Replacement recommendations have evidence and migration plans.
9. Current and target architectures exist.
10. CI/test/security/deployment baselines are reproducible.
11. Critical unknowns and blockers are explicit.
12. Deferred legal/business policies are not guessed.
13. The pilot scope is proposed but not invented without evidence/approval.
14. Roadmap phases have Gates, not speculative promises.
15. AI work packets are bounded and testable.
16. Carlos has a plain-language summary and decision list.

## 99. Governing conclusion

The LiNKsites manual is complete when these 24 sections are read together. It defines the product, business, production method, data architecture, asset systems, preview model, paid fulfilment, hosting, security, quality, execution grammar, integrations, oversight, observability, economics, scaling, and completion method.

The next engineering step is not a greenfield build and not an immediate autonomous code-writing campaign. It is a preservation-first, evidence-backed audit of all current repositories and deployments. That audit must determine which of the 60–80% completed work is sound, aligned, reusable, broken, duplicated, or obsolete. Only then can the roadmap be estimated and converted into implementation Issues.

Implementation proceeds from contracts and Program state outward: secure foundations, reusable asset system, preview path, Stripe/Odoo activation, customer fulfilment, autonomous hosting, observability, OpenClaw exception oversight, controlled pilot, and measured expansion. Each phase advances through evidence and rollback-aware Gates.

The final measure is not how much code exists. LiNKsites succeeds when it repeatedly produces persuasive previews and certified customer websites at controlled cost; keeps them secure, available, maintainable, and isolated; reconciles commercial truth; operates routinely without Carlos; and gives him clear authority over the few decisions that genuinely require the owner.

## 100. Primary standards and technical references

- [NIST Secure Software Development Framework, SP 800-218](https://csrc.nist.gov/pubs/sp/800/218/final)
- [NIST AI-specific SSDF practices, SP 800-218A](https://csrc.nist.gov/pubs/sp/800/218/a/final)
- [OWASP Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/)
- [OWASP LLM Verification Standard](https://owasp.org/www-project-llm-verification-standard/LLMSVS-v2.0-en.html)
- [SLSA specification 1.2](https://slsa.dev/spec/v1.2/)
- [OpenSSF Scorecard](https://openssf.org/projects/scorecard/)
- [CycloneDX Bill of Materials standard](https://cyclonedx.org/)
- [GitHub Actions secure-use reference](https://docs.github.com/en/actions/reference/security/secure-use)
- [GitHub artifact attestations and build security](https://docs.github.com/en/code-security/tutorials/implement-supply-chain-best-practices/securing-builds)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing)
- [Playwright visual comparisons](https://playwright.dev/docs/test-snapshots)

---

**End of Section 24**

**End of the LiNKsites Program Manual section set**
