---
proof_id: "proof-phase3-promotion-service-001"
subject_type: "issue"
subject_id: "phase3-promotion-service-001"
status: "draft"
criteria_evidence:
  - criterion: "All items succeed and pass readback -> receipt status 'succeeded', correct itemResults, non-null draftReleaseId"
    evidence: "tests/promotionService.spec.ts 'PromotionService happy path' block -- passing"
  - criterion: "One item's upsertDraft throws -> that item is 'failed' with a failureReason, others still succeed, overall status 'partial'"
    evidence: "tests/promotionService.spec.ts 'PromotionService partial failure (upsertDraft throws)' block -- passing"
  - criterion: "upsertDraft succeeds but readback returns null -> item is 'failed', not 'succeeded'"
    evidence: "tests/promotionService.spec.ts 'PromotionService readback failure' block -- passing; test explicitly asserts upsertDraft was called (proving the write path was exercised) and that the item is still recorded failed"
  - criterion: "Every item fails -> overall status 'failed', draftReleaseId is null"
    evidence: "tests/promotionService.spec.ts 'PromotionService full failure' block -- passing"
  - criterion: "Same idempotencyKey + same checksum returns identical receipt content and does not re-call upsertDraft"
    evidence: "tests/promotionService.spec.ts 'PromotionService idempotency' block, first test -- passing, asserts upsertDraft call count is unchanged between the two invocations"
  - criterion: "Same idempotencyKey + different checksum throws PromotionServiceError"
    evidence: "tests/promotionService.spec.ts 'PromotionService idempotency' block, second test -- passing"
  - criterion: "Empty items array -> status 'succeeded', empty itemResults"
    evidence: "tests/promotionService.spec.ts 'PromotionService empty items' block -- passing, also asserts upsertDraft was never called"
artifacts:
  - "packages/factory-catalog/src/promotionService.ts"
  - "packages/factory-catalog/tests/promotionService.spec.ts"
  - "packages/factory-catalog/src/index.ts (export added)"
verification_summary:
  - "packages/factory-catalog test run: 98/98 passing (8 new promotionService tests + 90 prior tests across all other factory-catalog modules unaffected)"
  - "packages/factory-catalog typecheck: clean"
  - "Workspace-wide typecheck (10 packages, forced/no cache): clean"
optional_fields:
  commands_run:
    - "pnpm exec vitest run (packages/factory-catalog)"
    - "pnpm exec tsc -p tsconfig.json (packages/factory-catalog)"
    - "pnpm run typecheck --force (workspace-wide, after clearing apps/web-master and apps/web-company .next caches)"
  open_gaps:
    - "PayloadDraftTarget is an interface only -- no real Payload-backed implementation exists yet. Building one requires a live Payload instance/Local API connection not available in this environment (GAP-50)."
    - "requiredGateReceiptIds is recorded on the receipt for audit only and is not validated against any real Gate-receipt registry, since no such registry exists yet."
    - "Publication (draft -> published) is explicitly and intentionally out of scope -- this module only ever writes drafts; there is no publish operation anywhere in promotionService.ts."
  notes:
    - "This is the Promotion Service explicitly called out as out-of-scope in execution/modules/phase3-reusable-asset-factory/MODULE.md's module-level scope notes (\"needs a live Supabase/Payload connection to test meaningfully beyond types\"). This Issue delivers the types plus the full decision logic (idempotency/checksum-conflict, readback verification, result-ledger derivation) behind an injected PayloadDraftTarget interface, so the doctrine-level invariants are real and tested even though no live Supabase/Payload connection exists in this environment."
---

# Proof

## Subject

`phase3-promotion-service-001` -- Promotion Service: draft-only Supabase-working-layer-to-Payload-draft promotion, idempotency with checksum-conflict detection, readback verification, and item/package result ledger.

## Criteria To Evidence Map / Artifacts / Verification Summary

See front matter.

## Failures Or Gaps

See front matter `open_gaps`.

## Gate Guidance

Non-vacuous: every criterion maps to a specific, named, passing test, including the readback-failure test, which is the most important test in the suite because it is the one most likely to pass trivially against a naive "write succeeded = done" implementation if not written carefully -- it explicitly asserts the write path was exercised (`upsertDraft` called) before asserting the item is still recorded as `'failed'`.
