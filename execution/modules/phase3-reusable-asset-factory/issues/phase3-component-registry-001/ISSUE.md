---
issue_id: "phase3-component-registry-001"
title: "Component Registry: governed, tier-gated machine object seeded from real web-master components"
status: "review_ready"
parent_program: "linksites-manual-alignment"
parent_module: "phase3-reusable-asset-factory"
parent_phase: ""
depends_on:
  - "phase3-tier-specification-001"
objective: "Replace docs/components/index.json's role as the only consultable component inventory with a governed, lifecycle-tracked, tier-gated ComponentRegistry machine object, seeded with real components verified present in apps/web-master today, and wired directly into the existing Tier Specification entitlement engine rather than duplicating its rules."
scope:
  - "packages/factory-catalog/src/componentRegistry.ts: ComponentDefinition, ComponentRegistry (register/get/listByCategory/listActive/assertComponentAvailableForTier), SEED_COMPONENTS, buildSeededComponentRegistry()"
out_of_scope:
  - "Migrating or replacing apps/web-master/docs/components/index.json itself -- that file remains valid human-readable documentation; this Issue adds the governed machine object the manual requires alongside it, not a replacement"
  - "A real propsSchema/contract validation engine -- out of scope until the Site Assembly Engine exists (GAP-04)"
  - "Registering every component in index.json -- only 4 representative, verified-real components are seeded; expanding full coverage is future work, explicitly not claimed as complete here"
inputs:
  - "apps/web-master/docs/components/index.json (verified source of the 4 seeded components' real names, file paths, and descriptions)"
  - "packages/factory-catalog/src/tierSpecification.ts (checkEntitlement(), reused not duplicated)"
expected_outputs:
  - "componentRegistry.ts with a tested governed registry seeded from 4 real, verified components"
acceptance_criteria:
  - "register()/get() round-trip correctly; duplicate registration and unknown-id lookups are rejected"
  - "listByCategory() and listActive() filter correctly"
  - "assertComponentAvailableForTier() rejects non-active components, tier-restricted components for the wrong tier, and custom-code components for tiers that do not permit custom code -- and accepts the inverse cases, delegating custom-code checks to the existing checkEntitlement() rather than re-implementing the rule"
  - "SEED_COMPONENTS contains SignupHero, CTASection, OfferShowcase, and ArticlesGrid, matching real entries in apps/web-master/docs/components/index.json, none flagged as requiring custom code"
proof_requirements:
  - "Test run showing 15 new tests passing, 65/65 total in packages/factory-catalog"
review_requirements:
  - "Independent reviewer spot-checks that the 4 seeded componentIds and sourceFile paths genuinely match apps/web-master/docs/components/index.json"
integration_requirements:
  - "Merge via the existing draft-PR stack once reviewed"
suggested_role_types:
  - "backend-developer"
read_first:
  - "packages/factory-catalog/src/componentRegistry.ts"
  - "apps/web-master/docs/components/index.json"
read_forbidden: []
blocking_questions: []
optional_fields:
  priority: "medium"
  risk_level: "low -- additive; seed data verified against real source file"
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
