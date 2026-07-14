---
issue_id: "phase3-site-assembly-manifest-001"
title: "Site Assembly Manifest: deterministic per-site page/section resolution from Site Specification + optional Prospect Adaptation"
status: "review_ready"
parent_program: "linksites-manual-alignment"
parent_module: "phase3-reusable-asset-factory"
parent_phase: ""
depends_on:
  - "phase3-site-specification-001"
  - "phase3-prospect-adaptation-001"
objective: "Build the manual §07 Site Assembly Manifest: a versioned, reconstructable ordered list of pages, each composed of specific Component Registry instances bound to opaque content references, deterministically resolved from an already-resolved Site Specification plus an optional Prospect Adaptation, delegating every eligibility rule (Kit lifecycle, tier/component availability) to the guard functions those prior Issues already built rather than duplicating them."
scope:
  - "packages/factory-catalog/src/siteAssemblyManifest.ts: SiteAssemblyManifest/SiteAssemblyPage/SiteAssemblySection types, assembleSiteManifest()"
out_of_scope:
  - "Resolving the real information architecture (which routes/page types/component order a site should have) -- manual §09's resolver does not exist yet; the caller supplies this as pagePlan input rather than this function inventing it"
  - "Resolving contentRef values against any real content store -- no Promotion Service / Payload draft integration is wired to this manifest yet (separate, parallel work)"
  - "Persistence of Site Assembly Manifest records -- in-memory resolution only, matching this session's other Phase 3 objects"
inputs:
  - "packages/factory-catalog/src/{siteSpecification,prospectAdaptation,verticalKit,componentRegistry,tierSpecification}.ts"
expected_outputs:
  - "siteAssemblyManifest.ts with a tested, deterministic resolver producing an ordered page/section plan"
acceptance_criteria:
  - "Assembles a valid manifest for a 'preview' siteClass with an adaptation: page count matches the supplied pagePlan, each section's instanceId/componentId/contentRef are correct and deterministic, and two calls with identical inputs produce byte-identical pages arrays"
  - "Assembles a valid 'foundation'-class manifest with no adaptation, using foundation-neutral contentRefs"
  - "Independently rejects: a non-active Vertical Kit, an Adaptation whose siteSpecId does not match the Site Specification, a Site Specification whose siteRef does not match the requested siteId, a Site Specification resolved for a different Kit, and a pagePlan component not available for the tier"
proof_requirements:
  - "Test run showing 8 new tests passing, 98/98 total in packages/factory-catalog"
review_requirements:
  - "Independent reviewer confirms assembleSiteManifest() delegates to assertKitIsProductionReady() and ComponentRegistry.assertComponentAvailableForTier() rather than re-implementing either rule, and that no wall-clock or random value affects the produced pages array"
integration_requirements:
  - "Merge via the existing draft-PR stack once reviewed"
suggested_role_types:
  - "backend-developer"
read_first:
  - "packages/factory-catalog/src/siteAssemblyManifest.ts"
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
