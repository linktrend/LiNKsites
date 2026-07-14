---
issue_id: "phase4-preview-deployment-001"
title: "Preview Deployment: record shape and isolation/servability/indexing invariants for a rendered preview instance"
status: "review_ready"
parent_program: "linksites-manual-alignment"
parent_module: "phase4-build-first-preview-path"
parent_phase: ""
depends_on:
  - "phase3-site-assembly-manifest-001"
objective: "Build a real, honestly-scoped first implementation of the manual's Preview Deployment inventory object (§10, §10.25, doctrine point 6): a controlled, rendered website instance with a prospect adaptation, a proof version, an access policy, an expiration, a SEPARATE analytics identity, an indexing policy, and a quality receipt. This closes the record-shape and checkable-invariant part of the gap -- creation with a mandatory-'noindex'-by-default indexing policy (manual §10.3), the single narrow path (markDeploymentAsIndexable()) by which that can ever change, the cross-preview analytics-identity isolation check (assertNoAnalyticsIdentityCollision()), and servable/expiry state transitions (isDeploymentServable(), expireIfPastDue()) -- without inventing the live Payload/hosting deployment machinery (GAP-50) or a real Gate-receipt registry this repository does not yet have."
scope:
  - "packages/factory-catalog/src/previewDeployment.ts: PreviewDeploymentError, PreviewDeployment, CreatePreviewDeploymentInput, createPreviewDeployment(), markDeploymentAsIndexable(), assertNoAnalyticsIdentityCollision(), isDeploymentServable(), expireIfPastDue()"
  - "packages/factory-catalog/src/index.ts: export the new module"
out_of_scope:
  - "Any live Payload/hosting deployment integration (GAP-50, a previously-identified blocker) -- payloadDraftContentRef and any URL-shaped fields are opaque, caller-supplied string references, never verified against a real deployed site or document"
  - "A real Gate-receipt registry -- qualityReceiptRef is an opaque, unvalidated reference, same honest-scope boundary as other Issues this session referencing gate receipt ids"
  - "Actual preview rendering, safe form/conversion-submission enforcement, or a real conversion-tracking analytics pipeline -- this module only defines the record and the checkable isolation/servability/indexing invariants over it"
  - "Wiring assertNoAnalyticsIdentityCollision() into any registry/store of Preview Deployments -- no PreviewDeployment registry/store exists in this repository yet; callers are expected to invoke it themselves over whatever collection they maintain"
  - "Persistence -- these are pure functions operating on plain PreviewDeployment records; no new store"
inputs:
  - "docs/specs/linksites-program-manual (manual Section 10, §10.3 'not a live customer site', §10.25 'required deployment identity fields', doctrine point 6 'every preview is isolated')"
  - "packages/factory-catalog/src/siteAssemblyManifest.ts (SiteAssemblyManifest -- prior Issue phase3-site-assembly-manifest-001)"
  - "packages/factory-catalog/src/conversionLock.ts (this repository's most recent similar record+registry/invariant pattern, followed for style)"
expected_outputs:
  - "previewDeployment.ts with a tested creation function, a narrow indexable-promotion function, a cross-preview isolation assertion, and two servability/expiry helper functions"
acceptance_criteria:
  - "createPreviewDeployment() sets status to 'active' and forces indexingPolicy to 'noindex' unconditionally regardless of accessPolicy (explicitly proven for accessPolicy: 'public'); rejects (PreviewDeploymentError) an expiresAt that is in the past relative to now, and rejects an expiresAt exactly equal to now (must be strictly after, not equal)"
  - "markDeploymentAsIndexable() succeeds only for a deployment with accessPolicy === 'public' AND a non-null qualityReceiptRef, returning a NEW object (no mutation) with indexingPolicy: 'indexable'; rejects token_required and internal_only deployments, and rejects a public deployment with a null qualityReceiptRef"
  - "assertNoAnalyticsIdentityCollision() does not throw for deployments with all-distinct analyticsIdentityRef values, and throws PreviewDeploymentError naming both colliding previewIds when two deployments share one"
  - "isDeploymentServable() returns true only for status 'active' with expiresAt strictly after the given now; returns false for an active-but-past-due deployment and for any non-active status even with a still-future expiresAt (locked and archived both proven)"
  - "expireIfPastDue() returns a NEW object with status 'expired' for an active, past-due deployment (original left unchanged); is a no-op returning the same object for a deployment that is not currently 'active' (locked, even past its expiresAt, proven explicitly), and leaves an active-but-not-yet-due deployment as 'active'"
proof_requirements:
  - "Test run showing all 17 new tests passing, plus the 179 prior factory-catalog tests unaffected (196 total)"
review_requirements:
  - "Independent reviewer confirms the doc comments' scope claims match what the code actually does -- no overclaiming of live Payload/hosting deployment, Gate-receipt verification, form-safety enforcement, or analytics-pipeline coverage beyond the record shape and the isolation/servability/indexing invariants implemented here"
integration_requirements:
  - "Merge via the existing draft-PR stack once reviewed"
suggested_role_types:
  - "backend-developer"
read_first:
  - "packages/factory-catalog/src/siteAssemblyManifest.ts"
  - "packages/factory-catalog/src/conversionLock.ts"
  - "packages/factory-catalog/src/previewDeployment.ts"
read_forbidden:
  - "unrelated modules"
blocking_questions: []
optional_fields:
  priority: "high"
  risk_level: "low -- additive, pure functions over a plain record type, no new persistence, no edits to already-merged siteAssemblyManifest.ts"
---

# Issue

## Objective

See front matter.

## Scope / Out Of Scope / Inputs / Expected Outputs / Acceptance Criteria

See front matter.

## Dependency Notes

Depends on `phase3-site-assembly-manifest-001` for `SiteAssemblyManifest`, which a Preview Deployment references by `manifestId`/`manifestVersion` (captured here as `siteAssemblyManifestId`/`siteAssemblyManifestVersion`). Does not modify that Issue's file (`siteAssemblyManifest.ts`). Also follows `conversionLock.ts` (Issue `phase4-conversion-lock-001`) as this repository's most recent similar record + checkable-invariant style, though `previewDeployment.ts` exposes standalone functions rather than a stateful registry class, since none of its invariants (indexing default, indexable-promotion gate, analytics-identity collision, servability, expiry transition) require tracking a mutable collection internally -- callers own whatever collection of `PreviewDeployment` records they maintain.

## Why This Module, Now

The manual's Section 10 names Preview Deployment as a required inventory object with an explicit "never indexable by careless default" rule (§10.3) and an explicit per-preview isolation doctrine (no shared analytics identity). Both of those are checkable today with data this repository already has (`SiteAssemblyManifest`, caller-supplied opaque refs) even though the real deployment target (Payload/hosting, GAP-50) and a real Gate-receipt registry do not exist yet. This Issue implements exactly that checkable slice, honestly bounded.

## Proof Requirements / Review Requirements / Integration Requirements

See front matter and `PROOF.md` in this directory.

## State Semantics

`review_ready`.

## Progressive Disclosure

Read next: `PROOF.md` in this same directory.
