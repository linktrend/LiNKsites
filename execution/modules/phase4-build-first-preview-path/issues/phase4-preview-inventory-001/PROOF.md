---
proof_id: "proof-phase4-preview-inventory-001"
subject_type: "issue"
subject_id: "phase4-preview-inventory-001"
status: "draft"
criteria_evidence:
  - criterion: "computePreviewInventorySnapshot() returns a fully-zeroed snapshot for empty pools, with reservationUtilizationRate exactly 0 (never NaN)"
    evidence: "tests/previewInventory.spec.ts 'empty inputs' block, 1 test asserting all counts/arrays are zeroed/empty and explicitly checking Number.isNaN(reservationUtilizationRate) === false -- passing"
  - criterion: "foundationCountsByStatus correctly tallies a pool spanning all 4 statuses"
    evidence: "tests/previewInventory.spec.ts 'foundationCountsByStatus' block, 1 test with 2 candidate + 1 active + 1 deprecated + 2 retired foundations, asserting the exact tally -- passing"
  - criterion: "foundationCountsByKitAndTier correctly groups multiple distinct (kitId, tierId) pairs including a shared pair"
    evidence: "tests/previewInventory.spec.ts 'foundationCountsByKitAndTier' block, 1 test with 3 distinct pairs (one shared by 2 foundations), asserting exact grouped counts and array length -- passing"
  - criterion: "reservationUtilizationRate correctly computes active-reservations-over-active-foundations, excluding a non-active reserved foundation from numerator and denominator"
    evidence: "tests/previewInventory.spec.ts 'reservationUtilizationRate' block, 2 tests: (a) 4 active foundations (2 reserved, 2 not) plus 1 candidate-but-reserved foundation, asserting rate is exactly 0.5 (proving the candidate foundation's reservation is excluded from both numerator and denominator); (b) no active foundations at all, asserting rate is exactly 0 -- both passing"
  - criterion: "adaptationCountsByStatus correctly tallies adaptations spanning all 4 statuses"
    evidence: "tests/previewInventory.spec.ts 'adaptationCountsByStatus' block, 1 test with 2 draft + 1 previewed + 1 published + 3 archived adaptations, asserting the exact tally -- passing"
  - criterion: "foundationReuseDistribution correctly groups/counts per foundationId, sorted descending by count with a deterministic ascending tie-break"
    evidence: "tests/previewInventory.spec.ts 'foundationReuseDistribution' block, 2 tests: (a) one foundation with 3 adaptations vs. one with 1, asserting descending order by count; (b) three foundations each with exactly 1 adaptation, asserting alphabetical foundationId ascending order as the deterministic tie-break -- both passing"
artifacts:
  - "packages/factory-catalog/src/previewInventory.ts"
  - "packages/factory-catalog/tests/previewInventory.spec.ts"
  - "packages/factory-catalog/src/index.ts (added export)"
verification_summary:
  - "packages/factory-catalog test run: 155/155 passing (8 new Preview Inventory tests + 147 prior tests across 14 other spec files unaffected)"
  - "packages/factory-catalog typecheck (pnpm exec tsc -p tsconfig.json): clean"
  - "Workspace-wide typecheck (pnpm run typecheck --force, 10 packages / 6 tasks with typecheck scripts): clean, 6 successful / 6 total"
optional_fields:
  commands_run:
    - "pnpm exec vitest run (packages/factory-catalog)"
    - "pnpm exec tsc -p tsconfig.json (packages/factory-catalog)"
    - "rm -rf apps/web-master/.next apps/web-company/.next && pnpm run typecheck --force (workspace root)"
  open_gaps:
    - "This Issue implements only the subset of manual §10.38's portfolio metrics that are computable from data that genuinely exists today (foundation counts by status/kit/tier, reservation utilization, adaptation-status breakdown, foundation reuse distribution). Cost per conversion, conversion rate by family, coverage rate for qualified leads, and average time to sales-ready preview all require data -- cost ledgers, Sales outcomes, readiness timestamps -- that does not exist in this repository yet."
    - "reservationUtilizationRate is a present-tense, point-in-time signal computed from FoundationReservationManager.getActiveReservation() at the moment the snapshot is taken, not a time-windowed historical rate. No reservation history/audit trail exists yet to compute a historical utilization rate."
    - "This Issue does not implement the manual's full seven-canonical-object Preview Inventory model. Reusable Site Foundation, Foundation Reservation, and Prospect Adaptation already exist from prior Issues and are the objects this snapshot aggregates over; Foundation Version and General Improvement are not touched by this Issue; Preview Deployment and Outcome Record do not exist anywhere in this repository yet (they require a real deployed-preview pipeline and a real Sales-outcome integration), and this Issue does not fabricate either object to make the snapshot look more complete than it is."
    - "foundationReuseDistribution's adaptationCount is a raw count only -- this Issue implements no saturation THRESHOLD or automatic policy action (e.g. no automatic flag-for-retirement at N adaptations). Deciding what count constitutes saturation risk under manual §10.39 is a policy decision left to a future Issue."
  notes:
    - "This module deliberately does not duplicate reservation-exclusivity or lifecycle-transition logic -- it only reads via FoundationReservationManager.getActiveReservation(), and never mutates any of its 3 input parameters."
---

# Proof

## Subject

`phase4-preview-inventory-001` -- Preview Inventory Snapshot first slice: portfolio aggregation over Foundations, live reservation state, and Prospect Adaptations, computing only the subset of manual §10.38's metrics that today's real data can honestly support.

## Criteria To Evidence Map / Artifacts / Verification Summary

See front matter.

## Failures Or Gaps

See front matter `open_gaps`. None of these are defects in this Issue's own scope; they are honestly-documented boundaries of what data this repository has today, consistent with the same honesty pattern used in the sibling `phase4-foundation-matching-001` Issue in this module.

## Gate Guidance

Non-vacuous: every criterion maps to a specific, named, passing test, including the two most important edge cases -- empty-input divide-by-zero safety (`reservationUtilizationRate` must be `0`, never `NaN`) and the reservation-utilization exclusion case (a non-active foundation's reservation must not leak into the active-foundation numerator or denominator). Doc comments in `previewInventory.ts` explicitly name what this module does and does not cover so a reviewer does not need to infer scope boundaries from the code alone.
