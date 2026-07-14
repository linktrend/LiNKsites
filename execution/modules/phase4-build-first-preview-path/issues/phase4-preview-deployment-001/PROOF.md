---
proof_id: "proof-phase4-preview-deployment-001"
subject_type: "issue"
subject_id: "phase4-preview-deployment-001"
status: "draft"
criteria_evidence:
  - criterion: "createPreviewDeployment() sets status to 'active' and forces indexingPolicy to 'noindex' unconditionally regardless of accessPolicy (explicitly proven for accessPolicy: 'public'); rejects an expiresAt in the past, and rejects an expiresAt exactly equal to now"
    evidence: "tests/previewDeployment.spec.ts 'createPreviewDeployment' block: one happy-path test asserting every PreviewDeployment field against the input; one test asserting indexingPolicy is 'noindex' with accessPolicy: 'public'; one test asserting the same for token_required and internal_only; one test asserting a past expiresAt throws PreviewDeploymentError; one test asserting an expiresAt exactly equal to now throws -- all passing"
  - criterion: "markDeploymentAsIndexable() succeeds only for accessPolicy === 'public' AND a non-null qualityReceiptRef, returning a NEW object with indexingPolicy: 'indexable'; rejects token_required, internal_only, and a public deployment with a null qualityReceiptRef"
    evidence: "tests/previewDeployment.spec.ts 'markDeploymentAsIndexable' block: one happy-path test asserting the returned object has indexingPolicy: 'indexable', is a different object reference than the input, and that the original input object is left with indexingPolicy: 'noindex' unchanged; three rejection tests (token_required, internal_only, public-with-null-receipt) -- all passing"
  - criterion: "assertNoAnalyticsIdentityCollision() does not throw for all-distinct analyticsIdentityRef values, and throws PreviewDeploymentError naming both colliding previewIds when two deployments share one"
    evidence: "tests/previewDeployment.spec.ts 'assertNoAnalyticsIdentityCollision' block: one not-throw test with two distinct analytics identities; one throw test asserting the thrown message contains both colliding previewIds -- both passing"
  - criterion: "isDeploymentServable() returns true only for status 'active' with a strictly-future expiresAt; false for active-but-past-due, and false for non-active status (locked, archived) even with a still-future expiresAt"
    evidence: "tests/previewDeployment.spec.ts 'isDeploymentServable' block: one true-case test, one false-case test for an active past-due deployment, and one false-case test constructing both a 'locked' and an 'archived' deployment with a still-future expiresAt -- all passing"
  - criterion: "expireIfPastDue() returns a NEW 'expired' object for an active, past-due deployment (original unchanged); is a no-op for a non-active deployment (locked, even past its expiresAt, proven explicitly); leaves an active-but-not-yet-due deployment as 'active'"
    evidence: "tests/previewDeployment.spec.ts 'expireIfPastDue' block: one test asserting the returned object has status 'expired', is a different object reference, and the original is unchanged at 'active'; one test asserting an active, not-yet-due deployment stays 'active'; one test constructing a 'locked', past-due deployment and asserting the SAME object reference is returned with status still 'locked' -- all passing"
artifacts:
  - "packages/factory-catalog/src/previewDeployment.ts"
  - "packages/factory-catalog/tests/previewDeployment.spec.ts"
  - "packages/factory-catalog/src/index.ts (added export)"
verification_summary:
  - "packages/factory-catalog test run: 196/196 passing (17 new Preview Deployment tests + 179 prior tests across 17 other spec files unaffected)"
  - "packages/factory-catalog typecheck (pnpm exec tsc -p tsconfig.json): clean"
  - "Workspace-wide typecheck (pnpm run typecheck --force, 10 packages / 6 tasks with typecheck scripts): clean"
optional_fields:
  commands_run:
    - "pnpm exec vitest run (packages/factory-catalog)"
    - "pnpm exec tsc -p tsconfig.json (packages/factory-catalog)"
    - "rm -rf apps/web-master/.next apps/web-company/.next && pnpm run typecheck --force (workspace root)"
  open_gaps:
    - "No live Payload/hosting deployment integration exists in this repository (GAP-50, a previously-identified blocker). payloadDraftContentRef and any URL-shaped fields are opaque, caller-supplied strings with no live verification against a real deployed site or document."
    - "No real Gate-receipt registry exists yet -- qualityReceiptRef is an opaque, unvalidated reference (same honest-scope boundary as other Issues this session referencing gate receipt ids). markDeploymentAsIndexable() only checks that a non-null value is present, not that it refers to a real, passing quality gate."
    - "This module implements only the record shape and the isolation/servability/indexing invariants that are checkable with data that exists today: it does not implement actual preview rendering, safe form/conversion-submission enforcement, or a real conversion-tracking analytics pipeline. It also does not provide or wire into any PreviewDeployment registry/store -- no such collection exists in this repository yet, so assertNoAnalyticsIdentityCollision() is a function callers must invoke themselves over whatever collection they maintain."
  notes:
    - "previewDeployment.ts deliberately mirrors conversionLock.ts's doc-comment style (explicit manual section citations, explicit honest-scope boundaries) but exposes standalone functions rather than a stateful registry class, since none of this Issue's invariants require tracking a mutable collection internally."
---

# Proof

## Subject

`phase4-preview-deployment-001` -- Preview Deployment: record shape and isolation/servability/indexing invariants for a rendered preview instance.

## Criteria To Evidence Map / Artifacts / Verification Summary

See front matter.

## Failures Or Gaps

See front matter `open_gaps`. None of these are defects in this Issue's own scope; they are honestly-documented boundaries of what integrations and objects this repository has today (no live Payload/hosting deployment, GAP-50; no real Gate-receipt registry; no PreviewDeployment registry/store).

## Gate Guidance

Non-vacuous: every criterion maps to specific, named, passing tests, including negative-path (past/equal-to-now expiresAt rejection, non-public and null-receipt rejection for indexable promotion, collision detection naming both previewIds, non-active-status servability/expiry no-ops) rather than a single happy-path assertion per function. Doc comments in `previewDeployment.ts` explicitly name what is and is not covered (no live Payload/hosting deployment, no real Gate-receipt verification, no form-safety enforcement, no real analytics pipeline, no registry/store) so a reviewer does not need to infer scope boundaries from the code alone.
