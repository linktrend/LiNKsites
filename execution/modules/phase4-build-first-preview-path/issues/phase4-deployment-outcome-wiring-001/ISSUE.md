---
issue_id: "phase4-deployment-outcome-wiring-001"
title: "Wire ConversionLockRegistry.assertRecycleAllowed() into archiveAndRecycleFoundation()"
status: "review_ready"
parent_program: "linksites-manual-alignment"
parent_module: "phase4-build-first-preview-path"
parent_phase: ""
depends_on:
  - "phase3-prospect-adaptation-001"
  - "phase4-conversion-lock-001"
objective: "Close the gap explicitly named in conversionLock.ts's own doc comment and PROOF.md: 'archiveAndRecycleFoundation() in prospectAdaptation.ts was deliberately NOT modified to call assertRecycleAllowed() automatically, to avoid an unreviewed edit to already-merged shared code.' Now that Conversion Lock has been merged and reviewed as part of this batch, wire the check in as a reviewed, deliberate integration: archiveAndRecycleFoundation() now refuses to recycle a Foundation that is locked for conversion (manual §10.33/§10.45), with the parameter kept optional for backward compatibility."
scope:
  - "packages/factory-catalog/src/prospectAdaptation.ts: archiveAndRecycleFoundation() gains an optional ConversionLockRegistry parameter"
  - "packages/factory-catalog/tests/prospectAdaptation.spec.ts: new tests for the wiring"
out_of_scope:
  - "Making the ConversionLockRegistry parameter mandatory -- kept optional so existing/future callers that don't yet have a lock registry in scope remain valid; this is a deliberate compatibility choice, not an oversight"
  - "Wiring OutcomeRecord's requiresConversionLock()/requiresRecycling() predicates into any real orchestrator that calls createLock()/archiveAndRecycleFoundation() automatically -- that orchestration is separate, still-open future work"
inputs:
  - "packages/factory-catalog/src/conversionLock.ts (prior Issue, this batch)"
  - "packages/factory-catalog/src/prospectAdaptation.ts (prior Issue, phase3-prospect-adaptation-001)"
expected_outputs:
  - "archiveAndRecycleFoundation() with the optional lock-check wired in, tested"
acceptance_criteria:
  - "Recycling proceeds normally when a ConversionLockRegistry is supplied but the Foundation has no active lock"
  - "Recycling throws ConversionLockError and leaves the Adaptation's status UNCHANGED (still its pre-call status, not partially archived) when the Foundation is locked for conversion"
  - "Omitting the registry parameter entirely (backward compatibility) still recycles normally, unaffected by any lock state"
proof_requirements:
  - "Test run showing 3 new tests passing, 219/219 total in packages/factory-catalog; program-ledger's own 36 tests unaffected"
review_requirements:
  - "Independent reviewer confirms the throw happens BEFORE transitionAdaptation() is called, so a locked Foundation's Adaptation is never partially archived -- the whole operation aborts cleanly, not just the reservation-release step"
integration_requirements:
  - "Merge via the existing consolidated branch/PR for this batch"
suggested_role_types:
  - "backend-developer"
read_first:
  - "packages/factory-catalog/src/prospectAdaptation.ts"
  - "packages/factory-catalog/src/conversionLock.ts"
read_forbidden: []
blocking_questions: []
optional_fields:
  priority: "high"
  risk_level: "low -- purely additive optional parameter, type-only circular import between prospectAdaptation.ts and conversionLock.ts verified to typecheck cleanly with no runtime cycle"
---

# Issue

## Objective

See front matter.

## Scope / Out Of Scope / Inputs / Expected Outputs / Acceptance Criteria

See front matter.

## Proof Requirements / Review Requirements / Integration Requirements

See front matter and `PROOF.md`.

## State Semantics

`review_ready`.

## Progressive Disclosure

Read next: `PROOF.md` in this same directory.
