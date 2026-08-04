---
proof_id: "proof-phase4-conversion-lock-001"
subject_type: "issue"
subject_id: "phase4-conversion-lock-001"
status: "draft"
criteria_evidence:
  - criterion: "createLock() succeeds only for a published-status Adaptation, populating all fields correctly with a real lockId/lockedAt; rejects draft/previewed/archived statuses with ConversionLockError naming the actual status found"
    evidence: "tests/conversionLock.spec.ts 'ConversionLockRegistry.createLock' block: one happy-path test asserting every ConversionLock field against the input, plus three distinct rejection tests (draft, previewed, archived), each asserting the thrown message contains that exact status string -- all passing"
  - criterion: "createLock() is idempotent for the same adaptationId and rejects a different adaptationId targeting an already-locked Foundation"
    evidence: "tests/conversionLock.spec.ts: one test calling createLock() twice with the same adaptationId but different ref values, asserting the second call's lockId/lockedAt/previewDeploymentVersionRef match the first call's result unchanged; one test asserting a second, different adaptationId targeting the same foundationId throws ConversionLockError -- both passing"
  - criterion: "getLockForFoundation()/isLocked() report null/false before a lock exists and the real lock/true after, scoped per-Foundation"
    evidence: "tests/conversionLock.spec.ts 'ConversionLockRegistry.getLockForFoundation / isLocked' block (before/after pair) plus 'ConversionLockRegistry per-Foundation scoping' block (a second, distinct Foundation proven unaffected by the first Foundation's lock via getLockForFoundation, isLocked, and assertRecycleAllowed) -- all passing"
  - criterion: "assertRecycleAllowed() does not throw for an unlocked Foundation and throws ConversionLockError naming both the foundationId and the locking adaptationId for a locked Foundation"
    evidence: "tests/conversionLock.spec.ts 'ConversionLockRegistry.assertRecycleAllowed' block: one not-throw test, one throw test asserting the message contains both the foundationId and the locking adaptation's adaptationId -- both passing"
artifacts:
  - "packages/factory-catalog/src/conversionLock.ts"
  - "packages/factory-catalog/tests/conversionLock.spec.ts"
  - "packages/factory-catalog/src/index.ts (added export)"
verification_summary:
  - "packages/factory-catalog test run: 158/158 passing (11 new Conversion Lock tests + 147 prior tests across 14 other spec files unaffected)"
  - "packages/factory-catalog typecheck (pnpm exec tsc -p tsconfig.json): clean"
  - "Workspace-wide typecheck (pnpm run typecheck --force, 10 packages / 6 tasks with typecheck scripts): clean"
optional_fields:
  commands_run:
    - "pnpm exec vitest run (packages/factory-catalog)"
    - "pnpm exec tsc -p tsconfig.json (packages/factory-catalog)"
    - "rm -rf apps/web-master/.next apps/web-company/.next && pnpm run typecheck --force (workspace root)"
  open_gaps:
    - "No real Stripe or Odoo integration exists in this repository (GAP-33/34/35, a previously-identified blocker requiring cross-Program access this repository does not have). stripePaymentConfirmationRef and odooCommercialRecordRef are opaque, caller-supplied string references, with no live verification against a real Stripe API call or Odoo commercial record. conversionInstructionRef is likewise unverified against any real Sales-authority system."
    - "This module implements only the Conversion Lock and its recycle-blocking gate (assertRecycleAllowed()), not the downstream customer-finalization workflow the manual explicitly separates out (verifying customer facts, replacing provisional assets, completing purchased scope, production integration/domain configuration, approval, and launch Gates). None of those objects/integrations exist in this repository yet."
    - "archiveAndRecycleFoundation() in prospectAdaptation.ts is NOT modified to call assertRecycleAllowed() automatically. Wiring that call in is left as explicit future work, to avoid an unreviewed edit to already-merged shared code within this Issue's scope. Until that wiring lands, assertRecycleAllowed() is a gate other code must remember to call -- it is not yet enforced end-to-end."
  notes:
    - "This module deliberately mirrors reusableFoundation.ts's FoundationReservationManager pattern (claim -> block-conflicting-operations -> release), applied to a Foundation's conversion state instead of its reservation slot, for consistency with an already-reviewed exclusivity pattern in this repository."
---

# Proof

## Subject

`phase4-conversion-lock-001` -- Conversion Lock: block recycling/reassignment of a Foundation once Sales converts a published preview.

## Criteria To Evidence Map / Artifacts / Verification Summary

See front matter.

## Failures Or Gaps

See front matter `open_gaps`. None of these are defects in this Issue's own scope; they are honestly-documented boundaries of what integrations and objects this repository has today, and an explicit, deliberate choice not to edit already-merged shared code (`prospectAdaptation.ts`) within this Issue.

## Gate Guidance

Non-vacuous: every criterion maps to specific, named, passing tests, including negative-path (draft/previewed/archived rejection, each naming its own status), idempotency, and cross-Foundation isolation tests, not just a single happy-path assertion. Doc comments in `conversionLock.ts` explicitly name what is and is not covered (no live Stripe/Odoo/Sales-authority verification, no downstream finalization workflow, no automatic wiring into `archiveAndRecycleFoundation()`) so a reviewer does not need to infer scope boundaries from the code alone.
