# W2-02 — End-to-End Program Orchestration

**Status:** Planned — requires Wave 1 PASS and W2-01/W2-03/W2-04 executor contracts
**Wave:** 2
**Executor:** one Codex Luna High implementation agent
**Safe lane:** orchestrator composition and first-site Program graph

## Outcome

Wire the real first-site executors into one dependency-driven LiNKsites Program that continuously pulls a lead, creates a private complete website, validates it, and writes a completion result. This is the production composition root; tests alone constructing services do not count.

## Required Program graph

The exact Module/Phase names must match the accepted canonical definitions. The graph must include Issues for:

1. pull and validate lead/research
2. atomically claim/idempotently create Program
3. qualify package/vertical compatibility
4. reserve foundation/template inventory
5. resolve and verify exact LiNKlibraries artifacts
6. build site specification and assembly manifest
7. verify/materialize the exact complete template package, map lead facts, and adapt its baseline copy/text for the prospect using its bundled assets
8. verify/process the package's bundled media and any authorized prospect-owned brand assets with provenance
9. assemble and validate a working-content version
10. run content, schema, quality, security/privacy, and asset gates
11. promote the exact accepted version to Payload draft
12. run CMS read-back parity gate
13. publish only to the private preview environment for the first test
14. render and validate the complete private site
15. capture functional/visual/SEO/accessibility/privacy evidence
16. emit one CRM-shaped completion record

Independent ready Issues should run in parallel; unsafe side effects and gates remain ordered.

## Required implementation

1. Create the production composition root that instantiates durable ledger/store, Factory Catalog repositories, working-content repositories, library client, CMS adapter, frontend/deployment adapter, event adapter, executor registry, intake adapter, and completion sink from validated configuration.
2. Register explicit executor name/version/capability metadata. Unknown or unapproved executor kinds fail closed.
3. Store the graph before execution and use ledger readiness queries; do not encode the entire workflow as one opaque function.
4. Make every external mutation idempotent and receipt-producing.
5. Use gates to unlock dependency edges. Documentation or an executor's success claim without evidence cannot unlock work.
6. Implement compensation/manual-attention behavior for partial failures such as promoted CMS draft but failed preview render.
7. Recover after restart from the durable last accepted state without duplicating sites, Payload documents, completion records, or external events.
8. Support the manual/file intake adapter and CRM-shaped output for the first production test, with the same contracts used by the future CRM adapter.
9. Surface health, current Program/Issue state, retries, dead letters, and completion metrics without exposing secrets.
10. Explicitly exclude sold-site public activation from the first-test graph; it is a separately authorized follow-on flow.

## Required tests

- full fixture vertical slice with real local stores/adapters
- safe parallelism and dependency order
- failure/retry at each external boundary
- crash/restart after each irreversible receipt
- duplicate lead and duplicate delivery
- gate rejection prevents preview/completion
- partial mutation compensation/manual-attention
- exactly-once logical completion record
- configuration/secrets validation fails closed
- production composition root boots with required local dependencies

## Acceptance gates

- The production binary/service—not a test-only constructor—can execute the complete first-site graph against local service equivalents.
- Every Issue/Run/gate/evidence record is visible in the ledger.
- Restart and replay tests prove logical exactly-once outcomes.
- Manual first-test input and future CRM input share the same application boundary.
- No direct Stripe/Odoo/raw-n8n code is present.

## Evidence and handoff

Provide graph export/diagram, executor registry, configuration matrix, sample redacted run trace, failure/recovery matrix, test commands/results, exact SHA, and remaining environment requirements for W2-07/Phase 2.
