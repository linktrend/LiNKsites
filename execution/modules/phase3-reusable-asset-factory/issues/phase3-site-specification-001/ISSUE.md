---
issue_id: "phase3-site-specification-001"
title: "Site Specification: per-site resolved contract integrating Kit, Tier, Foundation, Design Profile, and Component selections"
status: "review_ready"
parent_program: "linksites-manual-alignment"
parent_module: "phase3-reusable-asset-factory"
parent_phase: ""
depends_on:
  - "phase3-tier-specification-001"
  - "phase3-vertical-kit-001"
  - "phase3-reusable-foundation-001"
  - "phase3-design-catalog-001"
  - "phase3-component-registry-001"
objective: "Build the integration point that resolves one per-site Site Specification from the five reusable-asset objects already built (Vertical Kit, Tier Specification, Reusable Site Foundation, Design Intelligence Catalog, Component Registry), enforcing every cross-object invariant those Issues defined rather than duplicating any rule, and refusing to resolve an invalid combination -- the closest current approximation of manual §63's 'deterministic assembly produces valid sites from versioned specifications' exit gate, though the real Site Assembly Engine (GAP-04) that turns this record into an actual site still does not exist."
scope:
  - "packages/factory-catalog/src/siteSpecification.ts: SiteSpecification type, resolveSiteSpecification()"
out_of_scope:
  - "Actually assembling/rendering a site from a resolved Site Specification -- no Site Assembly Engine exists yet (GAP-04)"
  - "Prospect Adaptation record (the prospect-specific content overlay for Preview Production, manual §09-§10) -- a related but separate future Issue"
  - "Persistence of Site Specification records -- in-memory resolution only, matching this session's other Phase 3 objects"
inputs:
  - "packages/factory-catalog/src/{tierSpecification,verticalKit,reusableFoundation,designCatalog,componentRegistry}.ts (all five prior Issues)"
expected_outputs:
  - "siteSpecification.ts with a tested resolver enforcing all five objects' invariants together"
acceptance_criteria:
  - "Resolves a valid Site Specification when the Kit is active, the Foundation is active and matches the Kit/tier, the Design Profile was resolved for the same site, every selected component is tier-available, and the page count is within the Kit+Tier effective limit"
  - "Independently rejects: an inactive Kit, an inactive Foundation, a Foundation built for the wrong Kit, a Foundation built for the wrong tier, a Design Profile resolved for a different site, a tier-unavailable component, and an over-limit page count (including an exact off-by-one boundary test)"
proof_requirements:
  - "Test run showing 10 new tests passing, 75/75 total in packages/factory-catalog"
review_requirements:
  - "Independent reviewer confirms resolveSiteSpecification() delegates to each prior Issue's own guard/check function rather than re-implementing any rule (assertKitIsProductionReady, assertFoundationIsProductionReady, assertFoundationMatchesKitAndTier, assertComponentAvailableForTier, checkEntitlement, resolveEffectiveMaxPages)"
integration_requirements:
  - "Merge via the existing draft-PR stack once reviewed"
suggested_role_types:
  - "backend-developer"
read_first:
  - "packages/factory-catalog/src/siteSpecification.ts"
read_forbidden: []
blocking_questions: []
optional_fields:
  priority: "high"
  risk_level: "low -- pure composition/validation logic over already-tested objects, no new external content"
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
