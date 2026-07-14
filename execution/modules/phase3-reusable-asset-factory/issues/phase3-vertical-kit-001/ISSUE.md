---
issue_id: "phase3-vertical-kit-001"
title: "Vertical Kit schema + Kit Tier Variant resolution, seeded with the Home Services pilot Kit"
status: "review_ready"
parent_program: "linksites-manual-alignment"
parent_module: "phase3-reusable-asset-factory"
parent_phase: ""
depends_on:
  - "phase3-tier-specification-001"
objective: "Model the Vertical Kit object (manual §08.8) as a real, versioned schema distinct from Tier Specification, with Kit Tier Variants that resolve against the base Tier Specification without ever enlarging entitlement (manual §08.17), seeded with the Decision DR-06 pilot vertical (Home Services) as a non-production candidate."
scope:
  - "packages/factory-catalog/src/verticalKit.ts: VerticalKit, KitTierVariant types, HOME_SERVICES_KIT candidate, resolveEffectiveMaxPages(), assertKitIsProductionReady()"
out_of_scope:
  - "Real Home Services content (page copy, media, conversion objectives) -- requires business/vertical research this repository does not have access to"
  - "Promoting HOME_SERVICES_KIT to active -- requires Carlos's or a delegated reviewer's content approval, not something to self-approve"
  - "Additional Vertical Kits beyond the one pilot vertical"
inputs:
  - "docs/specs/linksites-program-manual/08_vertical_kits_tier_specifications_and_reusable_site_foundations.md"
  - "packages/factory-catalog/src/tierSpecification.ts (prior Issue)"
  - "audit/13_decision_and_contradiction_register.md (Decision DR-06: Home Services / Standard)"
expected_outputs:
  - "verticalKit.ts with a tested schema and the seeded candidate Kit"
acceptance_criteria:
  - "HOME_SERVICES_KIT is status 'candidate', not 'active', and assertKitIsProductionReady() rejects it as-is"
  - "A Kit Tier Variant's page limit never overrides a more restrictive base Tier Specification limit, and vice versa (manual §08.17)"
  - "getKitTierVariant() throws a clear, typed error for an undefined tier variant rather than returning undefined silently"
proof_requirements:
  - "Test run showing all 8 new tests passing, plus the 14 prior Tier Specification tests unaffected"
review_requirements:
  - "Independent reviewer confirms HOME_SERVICES_KIT's placeholder page types are clearly structural (not real content) and its candidate status is correctly enforced"
integration_requirements:
  - "Merge via the existing draft-PR stack once reviewed"
suggested_role_types:
  - "backend-developer"
read_first:
  - "packages/factory-catalog/src/verticalKit.ts"
read_forbidden:
  - "unrelated modules"
blocking_questions:
  - "Real Home Services page structure, copy patterns, and conversion objectives -- not blocking this Issue's mechanism, but blocking promotion to active."
optional_fields:
  priority: "high"
  risk_level: "low -- additive; explicit candidate/production-ready guard prevents accidental use"
---

# Issue

## Objective

See front matter.

## Scope / Out Of Scope / Inputs / Expected Outputs / Acceptance Criteria

See front matter.

## Dependency Notes

Depends on Tier Specification (prior Issue) for `resolveMostRestrictive()` and `TierId`.

## Proof Requirements / Review Requirements / Integration Requirements

See front matter and `PROOF.md` in this directory.

## Blocking Questions

See front matter -- non-blocking for this Issue's own mechanism.

## State Semantics

`review_ready`.

## Progressive Disclosure

Read next: `PROOF.md` in this same directory.
