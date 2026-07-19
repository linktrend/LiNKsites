---
issue_id: "phase3-reusable-foundation-001"
title: "Reusable Site Foundation schema + prospect-neutrality scanner + reservation exclusivity"
status: "review_ready"
parent_program: "linksites-manual-alignment"
parent_module: "phase3-reusable-asset-factory"
parent_phase: ""
depends_on:
  - "phase3-tier-specification-001"
  - "phase3-vertical-kit-001"
objective: "Model the Reusable Site Foundation object (manual §08.2/§08.18/§08.24) as the third of the manual's three distinct reusable-asset objects, implement a mechanical first pass at the prospect-neutrality rule (manual §08.19), and enforce reservation exclusivity (manual §08.28/§10.18) using the same lease/expire pattern already proven in packages/program-ledger."
scope:
  - "packages/factory-catalog/src/reusableFoundation.ts: ReusableSiteFoundation type, lifecycle guard, Kit/tier match guard, scanForProhibitedFields()/assertProspectNeutral(), FoundationReservationManager"
out_of_scope:
  - "Real Foundation content (actual page composition, components used) -- no Site Assembly Manifest or Component Registry machine object exists yet (GAP-04/GAP-07), so this Foundation has no real content model to scan against yet, only the mechanism"
  - "Foundation Reservation persistence (Postgres-backed) -- this is an in-memory manager only, matching the pattern this session used for the Program Ledger before its Postgres store existed"
inputs:
  - "docs/archive/specs/linksites-program-manual/08_vertical_kits_tier_specifications_and_reusable_site_foundations.md"
  - "packages/factory-catalog/src/tierSpecification.ts, verticalKit.ts (prior Issues)"
expected_outputs:
  - "reusableFoundation.ts with a tested schema, neutrality scanner, and reservation manager"
acceptance_criteria:
  - "A candidate/retired Foundation is rejected as production-ready; an active one is accepted"
  - "A Foundation built for a different Kit or tier is rejected when matched against the wrong Kit/tier"
  - "scanForProhibitedFields() flags prospect names, customer contacts, credentials, analytics IDs, and domain fields, including nested ones, and finds nothing in clean generic content"
  - "FoundationReservationManager enforces exclusivity: a second concurrent reservation for the same Foundation is rejected; release or expiry frees it up again; different Foundations reserve independently"
proof_requirements:
  - "Test run showing all 17 new tests passing, plus the 22 prior Tier Specification + Vertical Kit tests unaffected"
review_requirements:
  - "Independent reviewer confirms the prohibited-field pattern list is a reasonable, real first pass at manual §08.19, not a token gesture"
integration_requirements:
  - "Merge via the existing draft-PR stack once reviewed"
suggested_role_types:
  - "backend-developer"
read_first:
  - "packages/factory-catalog/src/reusableFoundation.ts"
read_forbidden:
  - "unrelated modules"
blocking_questions: []
optional_fields:
  priority: "high"
  risk_level: "low -- additive, in-memory only, no persistence claims made"
---

# Issue

## Objective

See front matter.

## Scope / Out Of Scope / Inputs / Expected Outputs / Acceptance Criteria

See front matter.

## Dependency Notes

Depends on Tier Specification and Vertical Kit (prior Issues) for `TierId` and Kit-matching semantics.

## Proof Requirements / Review Requirements / Integration Requirements

See front matter and `PROOF.md` in this directory.

## State Semantics

`review_ready`.

## Progressive Disclosure

Read next: `PROOF.md` in this same directory.
