# W2-06 — Outcomes, Recycling, and LiNKsites Architect

**Status:** Planned — requires W2-02 and W2-05 contracts
**Wave:** 2
**Executor:** one Codex Luna High implementation agent
**Safe lane:** commercial-outcome technical handlers and asset-curation proposal flow

## Outcome

Implement the technical lifecycle after LiNKreach reports `sold` or `no_sale`, and create the LiNKsites Architect role that learns from completed outcomes and proposes reusable assets without bypassing LiNKlibraries governance.

## Ownership rules

- LiNKreach decides and authorizes sold/no-sale/deferred/abandoned outcomes.
- LiNKsites performs technical publication/domain/hosting/recycling work.
- The first production test does not execute public activation or real domain changes.
- The LiNKsites Architect proposes reusable improvements; it cannot overwrite approved canonical assets.

## Required implementation

1. Validate, deduplicate, and persist `CommercialOutcomeEnvelope` events.
2. Implement a sold-flow state machine that accepts an `ActivationRequest`, verifies LiNKreach authorization, and schedules technical publication/domain work.
3. Complete the production adapter boundary for sold-site operations: Payload publication/visibility, private-wall transition, domain ownership/validation, DNS record changes through the approved Cloudflare/provider adapter, Traefik/site-route activation, TLS-readiness verification, health/smoke evidence, and compensating rollback. Provider calls must be idempotent and receipt-producing.
4. Phase 1 contract-tests these adapters against recorded/sandbox/fake provider boundaries and dry-runs the full activation graph. It must prove public actions cannot occur without explicit live authorization. Real DNS/public-domain mutation is reserved for a later separately approved operational test, not the first private-site pilot.
5. Implement no-sale recycling: remove/quarantine lead-specific content and sensitive data according to policy, release or reclassify inventory safely, preserve required audit/evidence, and create a clean refactoring request.
6. Define deferred/abandoned behavior with explicit retention and no infinite polling/action loop.
7. Implement LiNKsites Architect inputs from completed/unsold runs, quality results, and commercial outcomes.
8. The Architect may identify/extract reusable candidate components, layouts, patterns, and vertical assets; measure available quality/commercial evidence; prepare new versions/variants; and submit through the W1-05 LiNKlibraries candidate interface.
9. Candidate submissions must include provenance, license, tests, compatibility, source run/evidence, version intent, and privacy review. Lead/customer data must be removed.
10. Require LiNKlibraries validation/approval before a candidate can become a selectable canonical asset.
11. Record lifecycle and candidate-submission evidence in Ledger/Factory Catalog.

## Required tests

- duplicate/conflicting outcome handling
- sold authorization required before activation graph creation
- idempotent Cloudflare/provider DNS, route, visibility, TLS-readiness, and rollback contract tests
- no public/domain side effect during first-test configuration
- no-sale cleanup/release and retention behavior
- customer/lead data absent from reusable candidate
- candidate cannot overwrite or masquerade as approved entry
- rejected candidate has no catalog selection effect
- restart/replay at each lifecycle transition

## Acceptance gates

- Commercial decisions remain outside LiNKsites; technical authority remains inside it.
- Dry-run proves sale/no-sale flows are executable but cannot mutate live DNS/public hosting under Phase 1.
- Recycling does not leak prospect data or corrupt reusable inventory.
- LiNKsites Architect exists as a governed proposal path and is named consistently.
- Tests and evidence pass at the exact checkpoint.

## Evidence and handoff

Provide outcome state diagrams, authorization controls, redacted recycling trace, candidate manifest example, privacy/provenance results, exact SHA, and the list of live activation capabilities still intentionally reserved for Phase 2.
