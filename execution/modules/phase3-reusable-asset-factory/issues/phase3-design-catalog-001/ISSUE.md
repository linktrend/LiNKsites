---
issue_id: "phase3-design-catalog-001"
title: "Design Intelligence Catalog: token hierarchy resolution + accessibility-gated style admission"
status: "review_ready"
parent_program: "linksites-manual-alignment"
parent_module: "phase3-reusable-asset-factory"
parent_phase: ""
depends_on: []
objective: "Model the Design Intelligence Catalog's hierarchical token resolution and accessibility-gated admission rule (manual §06), with one deliberately-unreviewed placeholder StyleFamily to exercise the mechanism honestly, since the ui-ux-pro-max-skill upstream seed repo named in the manual is not reachable from this repository."
scope:
  - "packages/factory-catalog/src/designCatalog.ts: TokenLayer / resolveTokens() / resolveTokensWithProvenance(), StyleFamily type, assertStyleIsProductionReady(), SiteDesignProfile / resolveSiteDesignProfile()"
out_of_scope:
  - "Real design content sourced from ui-ux-pro-max-skill -- not reachable from this repository; PLACEHOLDER_STYLE_FAMILY is explicitly non-production content"
  - "Design Decision Record persistence, similarity/anti-repetition detection across previews, agent-judgment ranking -- future Issues once real Catalog content exists"
inputs:
  - "docs/archive/specs/linksites-program-manual/06_*.md (design intelligence catalog section)"
expected_outputs:
  - "designCatalog.ts with tested token-hierarchy resolution and an accessibility-gated production-readiness guard"
acceptance_criteria:
  - "TOKEN_LAYER_ORDER matches the manual's exact 7-layer hierarchy"
  - "resolveTokens() applies later layers' overrides over earlier ones for the same token name, regardless of caller-supplied array order"
  - "assertStyleIsProductionReady() rejects a style missing accessibility review even if lifecycle status is active, and rejects an accessibility-passed style that is still a candidate -- both conditions are independently required"
  - "resolveSiteDesignProfile() refuses to resolve from a non-production-ready style"
proof_requirements:
  - "Test run showing 11 new tests passing, 50/50 total in packages/factory-catalog"
review_requirements:
  - "Independent reviewer confirms the accessibility-gate placement (constraining ADMISSION, not just a downstream lint) matches manual §06's intent"
integration_requirements:
  - "Merge via the existing draft-PR stack once reviewed"
suggested_role_types:
  - "backend-developer"
read_first:
  - "packages/factory-catalog/src/designCatalog.ts"
read_forbidden: []
blocking_questions: []
optional_fields:
  priority: "medium"
  risk_level: "low -- additive, no real design content claimed"
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
