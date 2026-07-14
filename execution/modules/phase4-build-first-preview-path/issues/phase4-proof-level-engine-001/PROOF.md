---
proof_id: "proof-phase4-proof-level-engine-001"
subject_type: "issue"
subject_id: "phase4-proof-level-engine-001"
status: "draft"
criteria_evidence:
  - criterion: "assertProofSpecificationIsProductionReady() throws for non-active specifications and does not throw for active ones"
    evidence: "tests/proofLevel.spec.ts: 'assertProofSpecificationIsProductionReady' describe block, 2 tests -- passing"
  - criterion: "checkInvestmentAgainstBudget() returns the correct disposition for allowed / exceeds_authorized_budget / exceeds_specification_ceiling, and throws for a non-active spec"
    evidence: "tests/proofLevel.spec.ts: 'checkInvestmentAgainstBudget' describe block, 4 tests, including a case with the authorization ceiling deliberately set higher than the specification ceiling so exceeds_specification_ceiling is reachable and distinct -- all passing"
  - criterion: "createProofBlock() happy path, budget-failure rejection, and Level-0 rejection"
    evidence: "tests/proofLevel.spec.ts: 'createProofBlock' describe block, 3 tests -- passing"
  - criterion: "escalateProofBlock() happy path (previous.supersededBy === next.proofBlockId), same/lower-level rejection, and delegated budget-failure rejection"
    evidence: "tests/proofLevel.spec.ts: 'escalateProofBlock' describe block, 4 tests -- passing"
artifacts:
  - "packages/factory-catalog/src/proofLevel.ts"
  - "packages/factory-catalog/tests/proofLevel.spec.ts"
  - "packages/factory-catalog/src/index.ts (added `export * from './proofLevel.js'`)"
verification_summary:
  - "packages/factory-catalog test run: 160/160 passing (13 new proofLevel.spec.ts tests + 147 prior tests unaffected)"
  - "packages/factory-catalog typecheck (tsc -p tsconfig.json): clean"
  - "Workspace-wide typecheck (10 packages: blocks, cms, config, factory-catalog, program-ledger, types, ui, utils, web-company, web-master), run with --force after clearing apps/web-master/.next and apps/web-company/.next: 6 typecheck tasks successful, clean"
optional_fields:
  commands_run:
    - "pnpm exec vitest run (packages/factory-catalog)"
    - "pnpm exec tsc -p tsconfig.json (packages/factory-catalog)"
    - "rm -rf apps/web-master/.next apps/web-company/.next && pnpm run typecheck --force (workspace root)"
  open_gaps:
    - "Exact dollar budgets and page counts per level are explicitly left as open policy by the manual (§10.48) -- the maxAuthorizedInvestmentUsd and maximumCostUsd values used in this Issue's fixtures/tests are structural placeholders illustrating the shape of the budget-check engine, not real commercial commitments, and must not be presented to a customer or Sales as approved figures."
    - "This module does not implement per-level integration allowlists, Gate profiles, or Sales-handoff content requirements the manual also describes for each level -- only the level/specification/authority/escalation mechanics are built here. A future Issue would need to add those dimensions to ProofSpecification (or a sibling object) if/when that scope is prioritized."
    - "authorityRef on InvestmentAuthorization is an opaque string reference only -- no real Sales-authority validation system exists in this repository to check that the referenced authority is genuine, current, or was actually granted by Sales. This module validates budget arithmetic against the numbers it is given, not organizational authority itself."
  notes:
    - "ProofBlock's proofBlockId field fills a deliberate interface gap the originating task called out explicitly (supersededBy needed something real to reference); it is generated via crypto.randomUUID(), matching the existing crypto.randomUUID() pattern already used in packages/factory-catalog/src/promotionService.ts."
    - "Proof level (this module) and paid tier (tierSpecification.ts) are deliberately kept decoupled -- proofLevel.ts does not import from or reference tierSpecification.ts anywhere, matching the manual's explicit doctrine that a Level 1 preview can demonstrate Premium-tier value without prebuilding Premium entitlement."
---

# Proof

## Subject

`phase4-proof-level-engine-001` -- Proof Level engine: Proof Specification schema, budget-check gate, and ProofBlock create/escalate lifecycle with preserved history.

## Criteria To Evidence Map / Artifacts / Verification Summary

See front matter.

## Failures Or Gaps

See front matter `open_gaps`.

## Gate Guidance

Non-vacuous: every criterion maps to specific, named, passing tests exercising real budget-decision and escalation-history logic (including a deliberately-constructed case where the authorization ceiling is higher than the specification ceiling, so both disposition branches are genuinely distinct and reachable), not placeholder assertions.
