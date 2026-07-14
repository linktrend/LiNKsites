---
proof_id: "proof-phase3-pipeline-chaining-001"
subject_type: "issue"
subject_id: "phase3-pipeline-chaining-001"
status: "draft"
criteria_evidence:
  - criterion: "buildSiteAssemblyInputFromSiteSpecification() happy path maps every field correctly, including adaptationId supplied and omitted"
    evidence: "tests/pipelineChaining.spec.ts, 'buildSiteAssemblyInputFromSiteSpecification' describe block, first two tests -- passing"
  - criterion: "buildSiteAssemblyInputFromSiteSpecification() throws PipelineChainingError with a clear message on an empty pagePlan"
    evidence: "tests/pipelineChaining.spec.ts, 'buildSiteAssemblyInputFromSiteSpecification' describe block, third test -- passing"
  - criterion: "buildPromotionRequestFromManifest() happy path maps every field correctly, including requiredGateReceiptIds supplied and defaulted to []"
    evidence: "tests/pipelineChaining.spec.ts, 'buildPromotionRequestFromManifest' describe block, first two tests -- passing"
  - criterion: "buildPromotionRequestFromManifest() throws PipelineChainingError with a clear message on an empty workingPackage.items"
    evidence: "tests/pipelineChaining.spec.ts, 'buildPromotionRequestFromManifest' describe block, third test -- passing"
  - criterion: "End-to-end-shaped chaining test proves the two functions' outputs/inputs actually compose, tracing targetSiteId back to the original siteRef"
    evidence: "tests/pipelineChaining.spec.ts, final describe block -- passing"
artifacts:
  - "packages/factory-catalog/src/pipelineChaining.ts"
  - "packages/factory-catalog/tests/pipelineChaining.spec.ts"
  - "packages/factory-catalog/src/index.ts (added export * from './pipelineChaining.js')"
verification_summary:
  - "packages/factory-catalog test run: 135/135 passing (128 prior + 7 new in pipelineChaining.spec.ts)"
  - "packages/factory-catalog typecheck (tsc -p tsconfig.json): clean"
  - "Workspace-wide typecheck (turbo run typecheck --force, 6 packages typechecked: types, cms, program-ledger, web-master, web-company, factory-catalog): all 6 successful"
optional_fields:
  commands_run:
    - "pnpm exec vitest run (packages/factory-catalog)"
    - "pnpm exec tsc -p tsconfig.json (packages/factory-catalog)"
    - "pnpm run typecheck --force (workspace root, after clearing apps/web-master/.next and apps/web-company/.next)"
  open_gaps:
    - "This is NOT a fully autonomous, auto-triggering pipeline. It does not decide WHEN to advance from Site Specification to Site Assembly to Promotion -- that decision remains a distinct Gate-acceptance authority per manual doctrine, which these functions never touch. Building an orchestrator that dispatches the next Issue automatically on Gate acceptance is separate, still-open future work; these functions are the mapping primitives such an orchestrator would call, not the orchestrator itself."
    - "These functions do NOT fabricate pagePlan (the manual's 'resolved information architecture,' §09) or WorkingPackage content (real prospect/customer content items). Both remain caller-supplied real data because no automated information-architecture resolver and no content-production pipeline exist yet in this repository. Manufacturing fake versions of either would be dishonest filler, not real engineering progress -- consistent with the same boundary already stated in siteAssemblyManifest.ts's PagePlanEntry doc comment and promotionService.ts's module doc comment."
    - "These are pure mapping/validation functions only, with no side effects and no ledger interaction themselves -- they do not create, dispatch, or complete any Issue; a caller (today, a human or test; eventually an orchestrator) still has to actually create the next Issue using the object these functions return."
  notes:
    - "Follows the same fixture-construction style as tests/siteSpecificationExecutor.spec.ts and tests/siteAssemblyExecutor.spec.ts. No existing files were modified except packages/factory-catalog/src/index.ts (one appended export line); execution/modules/phase3-reusable-asset-factory/MODULE.md was intentionally left untouched per instruction, since another parallel task may also be touching files in this area."
---

# Proof

## Subject

`phase3-pipeline-chaining-001` -- pipeline-chaining mapping/builder helper functions between the three Program Ledger executor stages (Site Specification -> Site Assembly -> Promotion).

## Criteria To Evidence Map / Artifacts / Verification Summary

See front matter.

## Failures Or Gaps

See front matter `open_gaps`. None of these are defects; they are the deliberate, explicitly-scoped boundary of what this Issue set out to build.

## Gate Guidance

Non-vacuous: the end-to-end-shaped chaining test does not merely call each function in isolation with independently-constructed fixtures -- it threads the actual return value of `buildSiteAssemblyInputFromSiteSpecification()` into the constructed `SiteAssemblyManifest` fixture, then threads that manifest's own fields through `buildPromotionRequestFromManifest()`, and asserts the final `targetSiteId` traces back to the original `SiteSpecification.siteRef`, proving the two functions' contracts genuinely compose rather than merely type-checking independently.
