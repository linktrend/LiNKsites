# W1-01 — Canonical Contracts and Terminology

**Status:** Planned — not authorized until Principal approval
**Wave:** 1
**Executor:** one Codex Luna High implementation agent
**Dependency:** none
**Blocks:** W1-02 through W1-06

## Outcome

Create one executable vocabulary and one set of versioned data contracts for the entire LiNKsites Program. After this packet, an agent should not need to guess what a lead package, demo completion, commercial outcome, activation request, workflow event, or evidence receipt means.

## Read before work

1. `docs/LINKSITES-PRODUCTION-READINESS-ROADMAP.md`
2. `docs/LINKSITES-INTENT.md`
3. `docs/LINKSITES-TECHNICAL-PRD.md`
4. `docs/LINKSITES-OPERATIONS-MANUAL.md`
5. `.cursor/execution/CANONICAL-LAWS.md`
6. `.cursor/execution/MINIMUM-RUNTIME-MODEL.md`
7. `.cursor/execution/AUTONOMOUS-MODULE-EXECUTION.md`
8. `execution/PROGRAM.md`
9. `packages/types/**`

## Current gap

The repository mixes `Stage` and `Phase`, contains historical obligations that belong to LiNKreach or post-sales, and lacks one runtime-validated contract shared by manual test input, the future CRM adapter, orchestration, completion reporting, and commercial outcome handling.

## Owned paths

- `packages/types/**`
- active top-level product documents listed above
- `execution/PROGRAM.md`
- contract fixtures placed under the shared types package
- root lockfile only if a small runtime-validation dependency is demonstrably required

Do not edit ledger, catalog, CMS, or frontend implementation in this packet.

## Required implementation

1. Replace active use of `Stage` with `Phase`. Compatibility aliases may exist only at an explicitly documented persistence or migration boundary; no new public API may expose `Stage`.
2. Make the Program hierarchy explicit: `Program -> Module -> Phase -> Issue -> Run`, where a Run is one attempt by an Executor to complete an Issue.
3. Define versioned, runtime-validatable contracts for:
   - `LeadResearchPackage` — stable lead ID, organization scope, research, requested vertical, correlation ID, source, schema version, and idempotency key.
   - `DemoCompletionEnvelope` — lead/site IDs, private preview URL, status, exact artifact/library/content revisions, evidence references, timestamps, correlation/idempotency data, and safe error state.
   - `CommercialOutcomeEnvelope` — `sold`, `no_sale`, `deferred`, or `abandoned`, with LiNKreach authorization reference and replay protection.
   - `ActivationRequest` — sold-site technical publication/domain request. It must not contain payment processing logic.
   - `RecyclingRequest` — no-sale instruction and the site/template inventory identity to recycle.
   - `LiNKautoworkEventEnvelope` — versioned event name, payload, correlation, signature metadata, delivery attempt, and acknowledgement.
   - `EvidenceReceipt` — producer, subject, checksum, exact revision/SHA, storage location, gate association, and timestamp.
4. Provide positive and negative fixtures. The manually supplied first-test lead must validate against exactly the same `LeadResearchPackage` used by the future CRM adapter.
5. State ownership in active documentation:
   - LiNKsites continuously pulls and claims ready work.
   - LiNKreach owns commercial authorization.
   - LiNKsites exclusively executes technical website operations.
   - Payload published content is live authority; Supabase holds working versions and workflow evidence.
   - LiNKlibraries owns reusable implementations; the Factory Catalog owns LiNKsites selection/lifecycle metadata and SHA receipts.
6. Remove active statements that make Stripe, Odoo, or raw n8n direct LiNKsites dependencies. Preserve historical records as historical rather than silently rewriting them.
7. Update exports and package documentation so downstream packets consume one canonical module rather than copying shapes.

## Contract rules

- Every inbound envelope is rejected before side effects when its schema version, organization scope, stable ID, or idempotency key is invalid.
- Unknown enum values fail closed.
- Secrets and raw credentials never appear in contract payloads or evidence.
- `org_id` is the canonical organization/tenant field.
- A successful completion record cannot be emitted without evidence references.
- Runtime validation must be deterministic and testable without network access.

## Acceptance gates

- Repository search finds no active hierarchy definition using `Stage` except documented migration/compatibility code.
- All seven contracts have a version discriminator, exported type, runtime validator, valid fixture, and invalid fixture.
- The manual input fixture and CRM-port fixture are byte-compatible at the application boundary.
- Documentation consistently describes active pulling, commercial/technical ownership, Payload/Supabase, LiNKlibraries, and LiNKautowork.
- Existing typecheck and contract tests pass.

## Validation

Run the package-specific typecheck/tests discovered in `package.json`, then:

```bash
pnpm typecheck
pnpm test
rg -n "\bStage\b|N8N_WEBHOOK_URL|Stripe|Odoo" docs execution packages/types
git diff --check
```

The final `rg` output must be classified line by line as allowed history/compatibility or corrected active drift.

## Evidence and handoff

Record the exact base and result SHA, changed files, commands, results, contract fixture inventory, dependency changes and justification, unresolved blockers, and a concise downstream contract guide. Do not self-approve. The master freezes the accepted contract surface before parallel packets start.
