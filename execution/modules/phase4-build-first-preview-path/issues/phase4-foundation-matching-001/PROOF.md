---
proof_id: "proof-phase4-foundation-matching-001"
subject_type: "issue"
subject_id: "phase4-foundation-matching-001"
status: "draft"
criteria_evidence:
  - criterion: "findEligibleFoundations() excludes Foundations that fail any single hard filter and includes a genuinely eligible Foundation"
    evidence: "tests/foundationMatching.spec.ts 'findEligibleFoundations' block, 5 isolated tests -- one per exclusion reason (wrong kitId, wrong tierId, non-active status, already-reserved) plus one confirming a genuinely-eligible Foundation is included -- all passing"
  - criterion: "rankFoundations() orders by recency, tie-breaks deterministically, and does not mutate its input"
    evidence: "tests/foundationMatching.spec.ts 'rankFoundations' block, 3 tests: differing createdAt ordering, identical-createdAt tie-break by foundationId ascending, and input-array-unchanged-after-call -- all passing"
  - criterion: "findAndReserveFoundation() reserves the correctly-ranked winner with a confirmable reservation, throws FoundationMatchingError when no candidate survives hard filters (including empty pool), and skips an already-reserved top candidate in favor of the next-best eligible one"
    evidence: "tests/foundationMatching.spec.ts 'findAndReserveFoundation' block, 4 tests: happy path with getActiveReservation() follow-up confirmation, empty-pool throw, all-candidates-fail-hard-filters throw naming kitId/tierId, and reservation-exclusivity-skip-to-next-best -- all passing"
artifacts:
  - "packages/factory-catalog/src/foundationMatching.ts"
  - "packages/factory-catalog/tests/foundationMatching.spec.ts"
  - "packages/factory-catalog/src/index.ts (added export)"
verification_summary:
  - "packages/factory-catalog test run: 140/140 passing (12 new Foundation Matching tests + 128 prior tests across 12 other spec files unaffected)"
  - "packages/factory-catalog typecheck (pnpm exec tsc -p tsconfig.json): clean"
  - "Workspace-wide typecheck (pnpm run typecheck --force, 10 packages / 6 tasks with typecheck scripts): clean"
optional_fields:
  commands_run:
    - "pnpm exec vitest run (packages/factory-catalog)"
    - "pnpm exec tsc -p tsconfig.json (packages/factory-catalog)"
    - "rm -rf apps/web-master/.next apps/web-company/.next && pnpm run typecheck --force (workspace root)"
  open_gaps:
    - "Hard filters only check the 4 data points that genuinely exist today (lifecycle status, kitId match, tierId match, current reservation state). The manual lists many more hard filters -- content availability, design-profile compatibility, locale/script, runtime mode, integration availability, accessibility status, performance budget, security policy, incident/suspension status -- that this repository cannot yet check because the underlying data model doesn't exist for any of them."
    - "Ranking uses only recency (most-recently-created-first) as a signal. The manual's full multi-factor ranking engine -- foundation reuse, vertical suitability, content fit, conversion objective, distinctiveness, historical quality, engagement evidence, adaptation effort, rendering cost, operational simplicity -- requires engagement/telemetry/content-fit data this repository does not have yet. Recency was chosen because it is the one signal that is real and defensible without inventing data."
    - "This is Phase 4 scope (Build-first preview path) per the manual's own phase ordering, built ahead of some other Phase 3/4 boundary work in this module because it was a specifically-named open gap (GAP-16, audit/14_implementation_roadmap.md) and was genuinely unblocked once the prior Reusable Site Foundation Issue landed."
  notes:
    - "This module deliberately does not duplicate reservation-exclusivity logic -- findEligibleFoundations() and findAndReserveFoundation() both delegate to the existing FoundationReservationManager from phase3-reusable-foundation-001."
---

# Proof

## Subject

`phase4-foundation-matching-001` -- Foundation Matching Engine first slice: hard filters on real data, single-signal recency ranking, and auto-reserve.

## Criteria To Evidence Map / Artifacts / Verification Summary

See front matter.

## Failures Or Gaps

See front matter `open_gaps`. None of these are defects in this Issue's own scope; they are honestly-documented boundaries of what data this repository has today.

## Gate Guidance

Non-vacuous: every criterion maps to specific, named, passing tests, including negative-path (empty pool, all-filtered-out) and exclusivity-interaction (already-reserved-top-candidate-skipped) tests, not just happy-path assertions. Doc comments in `foundationMatching.ts` explicitly name what is and is not covered so a reviewer does not need to infer scope boundaries from the code alone.
