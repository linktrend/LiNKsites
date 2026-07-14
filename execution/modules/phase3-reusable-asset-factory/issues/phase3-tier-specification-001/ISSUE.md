---
issue_id: "phase3-tier-specification-001"
title: "Tier Specification schema + entitlement enforcement engine (GAP-12)"
status: "review_ready"
parent_program: "linksites-manual-alignment"
parent_module: "phase3-reusable-asset-factory"
parent_phase: ""
depends_on: []
objective: "Model the Tier Specification object (manual §03/§08) as a real, versioned schema with all required dimensions, and build the entitlement-enforcement gate (manual §08.16) that returns allowed/requires_upgrade/unsupported/exception_required rather than a bare boolean."
scope:
  - "packages/factory-catalog/src/tierSpecification.ts: TierSpecification type, 3 provisional tiers, checkEntitlement()"
  - "resolveMostRestrictive() helper implementing manual §08.17's Kit-Tier-Variant-never-enlarges-entitlement rule"
  - "Relocate SchemaVersion to packages/types as the single canonical source (was duplicated in program-ledger)"
out_of_scope:
  - "Real numeric tier limits -- manual §03 explicitly defers final tier names, page/feature limits, and prices; all values here are marked PROVISIONAL placeholders, not commercial commitments"
  - "Vertical Kit and Kit Tier Variant objects themselves (separate future Issue) -- only the entitlement-resolution helper they will need is built here"
  - "Real content for the Home Services pilot vertical (Decision DR-06)"
inputs:
  - "docs/specs/linksites-program-manual/03_product_customer_outcomes_tiers_and_commercial_assumptions.md"
  - "docs/specs/linksites-program-manual/08_vertical_kits_tier_specifications_and_reusable_site_foundations.md"
expected_outputs:
  - "packages/factory-catalog with a tested Tier Specification + entitlement engine"
acceptance_criteria:
  - "Exactly 3 tiers (standard/premium/enterprise) are modeled, matching manual §03 §7's provisional set"
  - "checkEntitlement() returns the correct disposition for page-count, custom-code, locale, integration, dedicated-runtime, and base-product-custom-code requests"
  - "Base-product custom code is ALWAYS exception_required regardless of tier, per manual §03 §7.1/§7.3 -- verified for all 3 tiers"
  - "resolveMostRestrictive() never lets a Kit Tier Variant enlarge entitlement beyond the base tier, per manual §08.17"
proof_requirements:
  - "Test run showing all 14 new tests passing"
review_requirements:
  - "Independent reviewer confirms the provisional numeric values are clearly marked as such and not presented as real commercial decisions"
integration_requirements:
  - "Merge via the existing draft-PR stack once reviewed"
suggested_role_types:
  - "backend-developer"
read_first:
  - "packages/factory-catalog/src/tierSpecification.ts"
read_forbidden:
  - "unrelated modules"
blocking_questions:
  - "Real tier names, numeric limits, and prices remain Carlos's decision -- not blocking this Issue (which only builds the mechanism), but blocking any real commercial use of it."
optional_fields:
  priority: "high"
  risk_level: "low -- new, additive, isolated package"
---

# Issue

## Objective

See front matter.

## Scope / Out Of Scope / Inputs / Expected Outputs / Acceptance Criteria

See front matter.

## Dependency Notes

No dependencies -- this is the first Phase 3 Issue, buildable independently of the Program Ledger.

## Proof Requirements / Review Requirements / Integration Requirements

See front matter and `PROOF.md` in this directory.

## Blocking Questions

See front matter -- non-blocking for this Issue's own scope.

## State Semantics

`review_ready`.

## Progressive Disclosure

Read next: `PROOF.md` in this same directory.
