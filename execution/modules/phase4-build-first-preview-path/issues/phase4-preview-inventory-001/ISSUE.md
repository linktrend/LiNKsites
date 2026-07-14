---
issue_id: "phase4-preview-inventory-001"
title: "Preview Inventory Snapshot (first slice): portfolio aggregation over Foundations, reservations, and Adaptations on real data"
status: "review_ready"
parent_program: "linksites-manual-alignment"
parent_module: "phase4-build-first-preview-path"
parent_phase: ""
depends_on:
  - "phase3-reusable-foundation-001"
  - "phase3-prospect-adaptation-001"
objective: "Build a real, honestly-scoped first slice of the Preview Inventory portfolio view (manual §10.2 doctrine point 7: 'inventory is measured as a portfolio (what exists, cost, fit, usage, outcomes)') that computes a point-in-time snapshot of the subset of manual §10.38's portfolio metrics that are actually derivable from data that genuinely exists in this repository today: foundation counts by lifecycle status, foundation counts by (kitId, tierId), current reservation utilization, adaptation counts by status, and a foundation reuse distribution (a real signal for manual §10.39's similarity/saturation concern)."
scope:
  - "packages/factory-catalog/src/previewInventory.ts: FoundationCountsByStatus, FoundationCountsByKitAndTier, AdaptationCountsByStatus, FoundationReuseEntry, PreviewInventorySnapshot, computePreviewInventorySnapshot()"
  - "packages/factory-catalog/src/index.ts: export the new module"
out_of_scope:
  - "The manual's full seven-canonical-object Preview Inventory model (Reusable Site Foundation, Foundation Version, Foundation Reservation, Prospect Adaptation, Preview Deployment, General Improvement, Outcome Record). Most already exist from prior Issues; Preview Deployment and Outcome Record do not exist anywhere in this repository yet -- they require a real deployed-preview pipeline and a real Sales-outcome integration this repository does not have. This Issue does not fabricate either object."
  - "Manual §10.38 metrics that require data this repository does not have yet: coverage rate for qualified leads, % matched without new foundation work, average time to sales-ready preview, stale/suspended share (no staleness policy or suspension state exists), unused foundation age (no last-used timestamp exists), conversion rate by family, cost per conversion by family (no cost ledger or Sales-outcome data exists)"
  - "Any time-windowed historical reservation-utilization rate -- no reservation history/audit trail exists to compute one, only present-tense state via FoundationReservationManager.getActiveReservation()"
  - "Any saturation THRESHOLD or policy action on the foundation reuse distribution -- this Issue only computes the raw per-foundation adaptation count, ranked descending; deciding what count is 'too saturated' is a policy decision out of scope here"
  - "Persistence of snapshots -- this module is a pure aggregation function, no new store"
inputs:
  - "docs/specs/linksites-program-manual (manual §10.2, §10.38, §10.39)"
  - "packages/factory-catalog/src/reusableFoundation.ts (ReusableSiteFoundation, FoundationReservationManager, FoundationReservation -- prior Issue phase3-reusable-foundation-001)"
  - "packages/factory-catalog/src/prospectAdaptation.ts (ProspectAdaptation, ProspectAdaptationStatus -- prior Issue phase3-prospect-adaptation-001)"
expected_outputs:
  - "previewInventory.ts with a tested pure snapshot-computation function"
acceptance_criteria:
  - "computePreviewInventorySnapshot() returns a fully-zeroed snapshot for empty foundation/adaptation pools, with reservationUtilizationRate exactly 0 (never NaN)"
  - "foundationCountsByStatus correctly tallies a pool spanning all 4 statuses"
  - "foundationCountsByKitAndTier correctly groups a pool spanning multiple distinct (kitId, tierId) pairs, including two foundations sharing the same pair"
  - "reservationUtilizationRate correctly computes active-reservations-over-active-foundations, with a non-active foundation holding a reservation excluded from both numerator and denominator"
  - "adaptationCountsByStatus correctly tallies a set of adaptations spanning all 4 statuses"
  - "foundationReuseDistribution correctly groups and counts adaptations per foundationId, sorted descending by count with a deterministic foundationId-ascending tie-break on equal counts"
proof_requirements:
  - "Test run showing all 8 new tests passing, plus the 147 prior factory-catalog tests unaffected (155 total)"
review_requirements:
  - "Independent reviewer confirms the doc-comment scope claims in previewInventory.ts match what the code actually computes -- no overclaiming beyond the 5 real, present-tense portfolio signals this Issue implements, and no implication that this is the full seven-object inventory model or the full §10.38 metrics list"
integration_requirements:
  - "Merge via the existing draft-PR stack once reviewed"
suggested_role_types:
  - "backend-developer"
read_first:
  - "packages/factory-catalog/src/reusableFoundation.ts"
  - "packages/factory-catalog/src/prospectAdaptation.ts"
  - "packages/factory-catalog/src/previewInventory.ts"
read_forbidden:
  - "unrelated modules"
blocking_questions: []
optional_fields:
  priority: "medium"
  risk_level: "low -- additive, pure aggregation function with no persistence and no mutation of any input"
---

# Issue

## Objective

See front matter.

## Scope / Out Of Scope / Inputs / Expected Outputs / Acceptance Criteria

See front matter.

## Dependency Notes

Depends on `phase3-reusable-foundation-001` for `ReusableSiteFoundation` and `FoundationReservationManager`, and on `phase3-prospect-adaptation-001` for `ProspectAdaptation`. Does not modify either dependency's file.

## Why This Is Deliberately A Narrow Slice

Manual §10.2's doctrine point 7 requires inventory to be measured "as a portfolio (what exists, cost, fit, usage, outcomes)," and manual §10.38 lists a long list of specific portfolio metrics. This repository does not yet have a real deployed-preview pipeline (Preview Deployment object, absent) or a real Sales-outcome integration (Outcome Record object, absent), and has no cost ledger, no reservation history/audit trail, and no staleness/suspension policy. Building fake versions of any of those to produce a complete-looking metrics dashboard would be dishonest filler. Instead, this Issue computes exactly the subset of §10.38's metrics that today's real objects (`ReusableSiteFoundation`, `FoundationReservationManager`, `ProspectAdaptation`) can honestly support, and documents the excluded metrics and the data gaps that block them, in both the doc comments and `PROOF.md`'s `open_gaps`.

## Proof Requirements / Review Requirements / Integration Requirements

See front matter and `PROOF.md` in this directory.

## State Semantics

`review_ready`.

## Progressive Disclosure

Read next: `PROOF.md` in this same directory.
