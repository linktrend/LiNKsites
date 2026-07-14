---
proof_id: "proof-phase3-assembly-and-promotion-ledger-integration-001"
subject_type: "issue"
subject_id: "phase3-assembly-and-promotion-ledger-integration-001"
status: "draft"
criteria_evidence:
  - criterion: "SiteAssemblyExecutor happy path matches a direct assembleSiteManifest() call and reaches awaiting_gate"
    evidence: "tests/siteAssemblyExecutor.spec.ts, first test -- passing"
  - criterion: "SiteAssemblyExecutor negative paths (unregistered spec, mismatched adaptation, malformed input) each fail cleanly"
    evidence: "tests/siteAssemblyExecutor.spec.ts, remaining 3 tests -- passing"
  - criterion: "PromotionExecutor happy path succeeds when every item promotes and passes readback"
    evidence: "tests/promotionExecutor.spec.ts, first test -- passing"
  - criterion: "PromotionExecutor classifies a readback failure as transient_infrastructure, not invalid_input or an unhandled throw"
    evidence: "tests/promotionExecutor.spec.ts, second test -- passing"
  - criterion: "PromotionExecutor's shared PromotionService instance does not re-promote on a repeated idempotencyKey"
    evidence: "tests/promotionExecutor.spec.ts, third test -- passing, asserts upsertDraft call count stays at 1 across a ledger-driven run plus a direct repeated call"
  - criterion: "Both executors fail cleanly (invalid_input) on malformed input"
    evidence: "tests/siteAssemblyExecutor.spec.ts and tests/promotionExecutor.spec.ts, final test in each -- passing"
artifacts:
  - "packages/factory-catalog/src/executors/siteAssemblyExecutor.ts"
  - "packages/factory-catalog/src/executors/promotionExecutor.ts"
  - "packages/factory-catalog/tests/siteAssemblyExecutor.spec.ts"
  - "packages/factory-catalog/tests/promotionExecutor.spec.ts"
verification_summary:
  - "packages/factory-catalog test run: 114/114 passing (106 prior [90 + 8 assembly-manifest + 8 promotion-service] + 8 new)"
  - "packages/program-ledger test run: 36/36 passing, unaffected"
  - "Workspace-wide typecheck (6 packages): clean"
optional_fields:
  commands_run:
    - "pnpm exec vitest run (packages/factory-catalog)"
    - "pnpm --filter @linksites/program-ledger run test"
    - "pnpm run typecheck (workspace-wide)"
  open_gaps:
    - "No automatic pipeline chains Site Specification -> Site Assembly -> Promotion Issues together; each is dispatched independently today. Building that orchestration (creating the next Issue from the prior one's accepted output) is a natural next Issue."
    - "PromotionExecutor's PayloadDraftTarget dependency is still in-memory only; a real Payload-backed target requires live infrastructure (GAP-50)."
  notes:
    - "This is the third round of Program Ledger <-> factory-catalog wiring this session, following the same executor pattern as SiteSpecificationExecutor: Issue.input carries only serializable identifiers (or, for PromotionExecutor, the already-serializable PromotionRequest contract itself); known validation errors are classified invalid_input; unexpected errors are re-thrown rather than silently swallowed."
---

# Proof

## Subject

`phase3-assembly-and-promotion-ledger-integration-001` -- Program Ledger wiring for Site Assembly Manifest and Promotion Service.

## Criteria To Evidence Map / Artifacts / Verification Summary

See front matter.

## Failures Or Gaps

See front matter `open_gaps`.

## Gate Guidance

Non-vacuous: the idempotency test asserts an actual call-count invariant (not just "no error thrown"), and the readback-failure test specifically distinguishes a write-succeeded-but-unverified case from a true success, matching the most safety-critical invariant in the underlying Promotion Service.
