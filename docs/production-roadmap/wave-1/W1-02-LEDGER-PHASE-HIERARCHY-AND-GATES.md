# W1-02 — Ledger Phase Hierarchy and Gates

**Status:** Planned — pending approval and W1-01 contract freeze
**Wave:** 1
**Executor:** one Codex Luna High implementation agent
**Safe lane:** Program Ledger only

## Outcome

Make the Program Ledger the durable, auditable record of what LiNKsites intended to do, what actually ran, which evidence was produced, and why progression was allowed or stopped.

## Read before work

- W1-01 accepted contract handoff
- `packages/program-ledger/**`
- `supabase/migrations/**`
- `execution/**`
- the three `.cursor/execution` runtime-law documents referenced by W1-01

## Owned paths

- `packages/program-ledger/**`
- one additive Supabase migration created with `supabase migration new <descriptive_name>`
- ledger-specific fixtures and tests

Do not edit the orchestrator, Factory Catalog, CMS, or frontend.

## Required implementation

1. Replace the ledger's public `Stage` model with `Phase`, including types, repositories, SQL, seeds, projections, and CLI surfaces.
2. Preserve existing durable data through an additive migration. If compatibility fields or views are needed, document their removal path and keep them read-only from new code.
3. Represent all five levels: Program, Module, Phase, Issue, Run. Populate real Phases and Issues for the first private-demo path; empty placeholder phase arrays are not acceptable.
4. Store dependency edges between Issues and support dependency-aware readiness queries.
5. Store executor identity/type, attempt number, lease/claim, start/end, terminal state, failure classification, retry timing, and correlation/idempotency keys.
6. Implement evidence-backed gates for Issue, Phase, Module, and Program. A gate evaluation records inputs, evaluator/version, verdict, reasons, evidence receipts, timestamp, and exact subject revision.
7. Make claiming atomic and lease-based so two workers cannot perform the same side effect. Expired leases may be recovered without losing prior attempts.
8. Enforce legal state transitions and append audit records. A failed/rejected gate must prevent dependents from becoming runnable.
9. Implement restart/recovery projections: after process restart, completed work is not repeated and interrupted work can be safely resumed or retried.
10. Add queries required by the orchestrator: runnable Issues, unresolved dependencies, current gate verdict, attempts, program completion, and terminal failure.

## Required tests

- hierarchy creation and retrieval with non-empty Phases
- dependency ordering and safe parallel readiness
- competing atomic claims
- lease expiry and recovery
- idempotent replay
- retryable versus terminal failure
- evidence-less gate rejection
- rejected gate blocking dependents
- process restart/rebuild producing the same current state
- organization isolation using `org_id`
- migration from the current schema without destructive data loss

## Acceptance gates

- No active ledger API exposes `Stage`.
- The first-demo Program graph can be seeded and queried with all required hierarchy levels.
- Concurrent claim tests prove at-most-one active owner.
- Gate PASS requires valid evidence; a mere `completed=true` flag is insufficient.
- Recovery tests prove that durable work survives a fresh process/store instance.
- Supabase migration and RLS/policy validation pass in a clean local stack.

## Validation

Use the repository's pinned Supabase CLI flow; do not hand-invent migration timestamps. At minimum run ledger tests, root typecheck, schema reset/migration validation, and `git diff --check`. Capture commands and exact counts in the evidence handoff.

## Out of scope

- executing website work
- CRM network integration
- Payload promotion
- VPS deployment
- changing business ownership

## Handoff

Provide the master with schema diagram, state-transition table, public API list, migration proof, test results, exact SHA, and any compatibility surface that W1-06 must remove or isolate.

