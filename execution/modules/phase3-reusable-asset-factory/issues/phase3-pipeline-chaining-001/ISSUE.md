---
issue_id: "phase3-pipeline-chaining-001"
title: "Pipeline chaining mapping helpers: Site Specification -> Site Assembly input, Site Assembly Manifest -> Promotion Request"
status: "review_ready"
parent_program: "linksites-manual-alignment"
parent_module: "phase3-reusable-asset-factory"
parent_phase: ""
depends_on:
  - "phase3-site-specification-001"
  - "phase3-site-assembly-manifest-001"
  - "phase3-promotion-service-001"
  - "phase3-assembly-and-promotion-ledger-integration-001"
objective: "Address the open gap named in both execution/modules/phase3-reusable-asset-factory/MODULE.md and audit/14_implementation_roadmap.md -- 'Automatic pipeline chaining (Site Specification -> Site Assembly -> Promotion as one flow) -- each remains an independently dispatchable Issue type for now.' -- with the real, honest, buildable slice of that gap: type-safe mapping/builder functions that take one stage's accepted output plus the caller-supplied real data the next stage genuinely needs, and construct the next stage's Issue input with all identifier-propagation fields (siteSpecId, siteId, kitId, manifestId, assemblyManifestId, targetSiteId, etc.) copied correctly and validated for basic sanity."
scope:
  - "packages/factory-catalog/src/pipelineChaining.ts: PipelineChainingError, buildSiteAssemblyInputFromSiteSpecification(), buildPromotionRequestFromManifest()"
out_of_scope:
  - "A fully autonomous, auto-triggering pipeline that decides WHEN to advance from one stage to the next -- that remains a distinct Gate-acceptance authority (manual doctrine) these functions do not touch"
  - "Fabricating pagePlan (the manual's 'resolved information architecture,' §09) -- no automated information-architecture resolver exists yet in this repository; pagePlan must be caller-supplied real data"
  - "Fabricating WorkingPackage.items (real prospect/customer content) -- no content-production pipeline exists yet in this repository; workingPackage must be caller-supplied real data"
  - "Wiring these functions into an actual 'on Gate acceptance, dispatch the next Issue' orchestrator -- that orchestration layer is separate, still-open future work; this Issue only builds the mapping primitives it would call"
  - "Any change to SiteSpecification, SiteAssemblyExecutorInput, SiteAssemblyManifest, or PromotionRequest themselves -- this Issue only maps between the existing shapes, unmodified"
inputs:
  - "packages/factory-catalog/src/siteSpecification.ts (SiteSpecification output shape, unmodified)"
  - "packages/factory-catalog/src/executors/siteAssemblyExecutor.ts (SiteAssemblyExecutorInput shape, unmodified)"
  - "packages/factory-catalog/src/siteAssemblyManifest.ts (SiteAssemblyManifest output shape and PagePlanEntry, unmodified)"
  - "packages/factory-catalog/src/promotionService.ts (PromotionRequest/WorkingPackage shapes, unmodified)"
expected_outputs:
  - "One new module, packages/factory-catalog/src/pipelineChaining.ts, exporting PipelineChainingError, buildSiteAssemblyInputFromSiteSpecification(), and buildPromotionRequestFromManifest()"
  - "Real, meaningful tests covering happy paths, negative paths, and an end-to-end-shaped chaining test proving the two functions' outputs/inputs actually compose"
acceptance_criteria:
  - "buildSiteAssemblyInputFromSiteSpecification(): given a real SiteSpecification fixture and valid extras, every field in the returned SiteAssemblyExecutorInput is correct (siteSpecId, siteId derived from siteRef, kitId, plus every extras field passed through unchanged, including adaptationId when supplied and when omitted); an empty pagePlan throws PipelineChainingError with a clear message"
  - "buildPromotionRequestFromManifest(): given a real SiteAssemblyManifest fixture and valid extras, every field in the returned PromotionRequest is correct (targetSiteId from manifest.siteId, assemblyManifestId from manifest.manifestId, targetState is the literal 'draft', schemaVersion propagated from the manifest, requiredGateReceiptIds defaults to [] when omitted and is passed through when supplied); an empty workingPackage.items throws PipelineChainingError with a clear message"
  - "An end-to-end-shaped test chains a Site Specification fixture through buildSiteAssemblyInputFromSiteSpecification(), constructs a resulting Site Assembly Manifest fixture using the IDs that came out of that call, feeds it through buildPromotionRequestFromManifest(), and asserts the final PromotionRequest.targetSiteId traces all the way back to the original Site Specification's siteRef"
proof_requirements:
  - "Test run showing all new pipelineChaining.spec.ts tests passing, and the full packages/factory-catalog suite passing with no regressions"
review_requirements:
  - "Independent reviewer confirms the module's doc comments and this Issue's own scope note are explicit that this is NOT a fully autonomous pipeline, and do not overstate what was built"
integration_requirements:
  - "Merge into development via the branch this Issue was implemented on (dev/blackcursor/phase3-pipeline-chaining)"
suggested_role_types:
  - "backend-developer"
read_first:
  - "packages/factory-catalog/src/siteSpecification.ts"
  - "packages/factory-catalog/src/executors/siteAssemblyExecutor.ts"
  - "packages/factory-catalog/src/siteAssemblyManifest.ts"
  - "packages/factory-catalog/src/promotionService.ts"
read_forbidden: []
blocking_questions: []
optional_fields:
  priority: "medium"
  risk_level: "low -- additive, pure functions, no side effects, no ledger interaction"
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
