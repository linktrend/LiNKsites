---
issue_id: "phase3-prospect-adaptation-001"
title: "Prospect Adaptation record: prospect-specific overlay, reservation-matching guard, and close-or-recycle lifecycle"
status: "review_ready"
parent_program: "linksites-manual-alignment"
parent_module: "phase3-reusable-asset-factory"
parent_phase: ""
depends_on:
  - "phase3-reusable-foundation-001"
  - "phase3-site-specification-001"
objective: "Model the Prospect Adaptation record (manual §09-§10): the prospect-specific content overlay applied to a reserved Reusable Site Foundation during Preview Production, deliberately the mirror image of the Foundation's own prospect-neutrality rule. Enforce that an Adaptation can only be created against a currently-active reservation for the exact Foundation its Site Specification resolved against, and implement the manual's required close-or-recycle lifecycle (manual §MVO commercial loop step 7), including the reservation-release side effect of archiving."
scope:
  - "packages/factory-catalog/src/prospectAdaptation.ts: ProspectAdaptation type, createProspectAdaptation(), transitionAdaptation()/assertTransitionAllowed(), archiveAndRecycleFoundation()"
out_of_scope:
  - "A real Preview Inventory / matching engine that decides WHICH new lead an archived-and-recycled Foundation should be offered to next (GAP-16) -- only the release side effect is implemented, not re-matching"
  - "Validating the shape/rights-clearance of prospectContent itself -- deferred to the still-absent Site Assembly Manifest (GAP-04)"
  - "Persistence of Adaptation records -- in-memory objects only, matching this session's other Phase 3 objects"
inputs:
  - "packages/factory-catalog/src/reusableFoundation.ts (FoundationReservation / FoundationReservationManager, prior Issue)"
  - "packages/factory-catalog/src/siteSpecification.ts (SiteSpecification, prior Issue)"
expected_outputs:
  - "prospectAdaptation.ts with a tested reservation-matching guard and lifecycle state machine"
acceptance_criteria:
  - "createProspectAdaptation() succeeds only when the reservation is active AND for the same Foundation the Site Specification resolved against; rejects a foundation mismatch and a released reservation independently"
  - "transitionAdaptation() permits draft->previewed->published->archived and the direct draft->archived shortcut, but rejects any transition skipping a required state or leaving the terminal archived state"
  - "archiveAndRecycleFoundation() archives the Adaptation and releases its Foundation reservation, but does NOT release a reservation that has since moved on to a different, unrelated requester (stale-adaptation safety)"
proof_requirements:
  - "Test run showing 10 new tests passing, 85/85 total in packages/factory-catalog"
review_requirements:
  - "Independent reviewer confirms the stale-reservation-safety test (archiving an old Adaptation must not release someone else's newer reservation) is a real, meaningful check, not incidental"
integration_requirements:
  - "Merge via the existing draft-PR stack once reviewed"
suggested_role_types:
  - "backend-developer"
read_first:
  - "packages/factory-catalog/src/prospectAdaptation.ts"
read_forbidden: []
blocking_questions: []
optional_fields:
  priority: "medium"
  risk_level: "low -- in-memory, no persistence or matching-engine claims"
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
