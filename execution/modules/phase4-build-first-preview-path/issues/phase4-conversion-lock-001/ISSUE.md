---
issue_id: "phase4-conversion-lock-001"
title: "Conversion Lock: block recycling/reassignment of a Foundation once Sales converts a published preview"
status: "review_ready"
parent_program: "linksites-manual-alignment"
parent_module: "phase4-build-first-preview-path"
parent_phase: ""
depends_on:
  - "phase3-prospect-adaptation-001"
objective: "Build a real, honestly-scoped first implementation of the manual's Conversion Lock (§10 §33): 'When Sales sends a valid conversion instruction based on Stripe-confirmed payment and the corresponding Odoo commercial record, LiNKsites locks the relevant preview version and foundation relationship for customer finalization.' This closes the concrete part of the gap the manual itself names -- no dedicated ConversionLock schema exists yet -- by implementing the lock's creation, its idempotent-retry and single-active-lock-per-Foundation invariants, and the recycle-blocking gate a future recycle workflow must consult, following the same claim -> block-conflicting-operations -> release pattern this repository already uses for FoundationReservationManager (reusableFoundation.ts)."
scope:
  - "packages/factory-catalog/src/conversionLock.ts: ConversionLockError, ConversionLock, CreateConversionLockInput, ConversionLockRegistry (createLock(), getLockForFoundation(), isLocked(), assertRecycleAllowed())"
  - "packages/factory-catalog/src/index.ts: export the new module"
out_of_scope:
  - "Any live Stripe or Odoo integration -- stripePaymentConfirmationRef and odooCommercialRecordRef are opaque, caller-supplied string references, never verified against a real Stripe API call or Odoo record (GAP-33/34/35, a previously-identified blocker requiring cross-Program access this repository does not have)"
  - "Real Sales-authority validation for conversionInstructionRef -- same honest-scope boundary as other Issues in this session that reference authority_ref/proof_authority_ref"
  - "The downstream customer-finalization workflow the manual explicitly separates from the lock itself: verifying customer facts, replacing provisional assets, completing purchased scope, production integration/domain configuration, approval, and launch Gates"
  - "Wiring assertRecycleAllowed() into archiveAndRecycleFoundation() (prospectAdaptation.ts) -- that would mean editing an already-merged file from a prior Issue, kept out of scope here to avoid an unreviewed edit to shared code"
  - "Persistence -- this module is a pure in-memory registry, matching FoundationReservationManager's existing pattern; no new store"
inputs:
  - "docs/archive/specs/linksites-program-manual (manual §10 §33 'Conversion lock', §10.45 'conversion and recycling commands conflict', §10.49.13 exact-version-not-lost requirement)"
  - "packages/factory-catalog/src/prospectAdaptation.ts (ProspectAdaptation, ProspectAdaptationStatus, archiveAndRecycleFoundation() -- prior Issue phase3-prospect-adaptation-001)"
  - "packages/factory-catalog/src/reusableFoundation.ts (FoundationReservationManager -- the existing exclusive-claim pattern this module follows)"
expected_outputs:
  - "conversionLock.ts with a tested lock-creation, idempotency, conflict-detection, and recycle-blocking gate"
acceptance_criteria:
  - "createLock() succeeds only for a published-status Adaptation, populating all ConversionLock fields correctly with a real lockId/lockedAt; rejects draft/previewed/archived statuses with ConversionLockError naming the actual status found (three distinct status cases)"
  - "createLock() is idempotent for the same adaptationId (a safe retry returns the original lock unchanged, even with different ref values in the retry input) and rejects a different adaptationId targeting a Foundation that already has an active lock"
  - "getLockForFoundation()/isLocked() correctly report null/false before any lock exists and the real lock/true after one is created, scoped per-Foundation (a distinct Foundation is unaffected by another Foundation's lock)"
  - "assertRecycleAllowed() does not throw for an unlocked Foundation and throws ConversionLockError naming both the foundationId and the locking adaptationId for a locked Foundation"
proof_requirements:
  - "Test run showing all 11 new tests passing, plus the 147 prior factory-catalog tests unaffected (158 total)"
review_requirements:
  - "Independent reviewer confirms the doc comments' scope claims match what the code actually does -- no overclaiming of Stripe/Odoo verification, Sales-authority validation, or downstream finalization coverage beyond the lock and its recycle-blocking gate"
integration_requirements:
  - "Merge via the existing draft-PR stack once reviewed"
suggested_role_types:
  - "backend-developer"
read_first:
  - "packages/factory-catalog/src/prospectAdaptation.ts"
  - "packages/factory-catalog/src/reusableFoundation.ts"
  - "packages/factory-catalog/src/conversionLock.ts"
read_forbidden:
  - "unrelated modules"
blocking_questions: []
optional_fields:
  priority: "high"
  risk_level: "low -- additive, in-memory registry, no new persistence, no edits to already-merged prospectAdaptation.ts or reusableFoundation.ts"
---

# Issue

## Objective

See front matter.

## Scope / Out Of Scope / Inputs / Expected Outputs / Acceptance Criteria

See front matter.

## Dependency Notes

Depends on `phase3-prospect-adaptation-001` for `ProspectAdaptation` and its `ProspectAdaptationStatus` lifecycle. Does not modify that Issue's file (`prospectAdaptation.ts`), nor `reusableFoundation.ts` whose `FoundationReservationManager` this module's `ConversionLockRegistry` deliberately mirrors in style (claim -> block-conflicting-operations -> release), applied to a different resource (a Foundation's conversion state, not a reservation slot).

## Why This Module, Now

The manual's Section 10 §33 names the Conversion Lock as a required invariant but explicitly does not define a schema for it -- a gap the manual itself calls out. This Issue is the first concrete implementation: it locks a Foundation against recycling once a published preview converts, without inventing the Stripe/Odoo verification or downstream finalization machinery the manual deliberately keeps separate and which this repository does not yet have the objects/integrations to support.

## Proof Requirements / Review Requirements / Integration Requirements

See front matter and `PROOF.md` in this directory.

## State Semantics

`review_ready`.

## Progressive Disclosure

Read next: `PROOF.md` in this same directory.
