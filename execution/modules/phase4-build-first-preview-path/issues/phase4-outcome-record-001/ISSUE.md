---
issue_id: "phase4-outcome-record-001"
title: "Outcome Record: deterministic mapping from Sales-owned commercial outcome to LiNKsites-owned technical disposition"
status: "review_ready"
parent_program: "linksites-manual-alignment"
parent_module: "phase4-build-first-preview-path"
parent_phase: ""
depends_on: []
objective: "Build a real, honestly-scoped first implementation of the manual's explicit separation of authority (§10 §31): 'commercial outcome and technical disposition are separate -- Sales decides opportunity outcome; LiNKsites decides reusable asset disposition under authorized outcome instruction.' This closes the concrete part of the gap by defining the exact Sales outcome vocabulary and exact LiNKsites technical disposition vocabulary as types, implementing the single deterministic mapping function between them (mapSalesOutcomeToTechnicalDisposition()), and an OutcomeRecord type whose technicalDisposition is ALWAYS derived from that mapping -- never independently caller-supplied -- so the separation-of-authority doctrine is enforced at the type level, not just by convention."
scope:
  - "packages/factory-catalog/src/outcomeRecord.ts: SalesOutcome, TechnicalDisposition, OutcomeRecordError, mapSalesOutcomeToTechnicalDisposition(), OutcomeRecord, createOutcomeRecord(), requiresConversionLock(), requiresRecycling()"
  - "packages/factory-catalog/src/index.ts: export the new module"
out_of_scope:
  - "Any live wiring of the resulting technicalDisposition into a real downstream action -- this module does not call ConversionLockRegistry.createLock() (conversionLock.ts) or archiveAndRecycleFoundation() (prospectAdaptation.ts) itself; requiresConversionLock() and requiresRecycling() are pure predicates only, for a future orchestrator to consult"
  - "Real Sales-authority validation for salesAuthorityRef -- same honest-scope boundary as other Issues in this session that reference authority_ref/proof_authority_ref"
  - "Any live CRM integration verifying that a reported SalesOutcome actually reflects the real state of an opportunity in Sales's CRM system"
  - "Persistence -- this module exports pure functions and a plain data type only, no registry/store, matching the minimal footprint appropriate for a pure mapping utility"
  - "Treating the mapping table itself as final commercial/CRM policy -- the manual names both vocabularies but does not print one literal lookup table connecting every pair; this Issue's table is a reasonable, defensible interpretation pending real Sales/CRM review (see PROOF.md open_gaps)"
inputs:
  - "docs/archive/specs/linksites-program-manual (manual §10 §31, exact Sales outcome vocabulary: Engaged, Inactive, Follow-up scheduled, Holding, Rejected, Lost to competitor, Not currently ready, Invalid lead, Converted, Expired, Do not contact; exact LiNKsites technical disposition vocabulary: Keep current preview active within policy, Extend hold, Upgrade, Lock for conversion, Expire deployment, Cleanse and recycle, Repair, Refresh, Deprecate or retire, Preserve evidence and remove active serving; doctrine point 9 on separation of commercial outcome and technical disposition)"
  - "packages/factory-catalog/src/tierSpecification.ts (this repository's pattern for a pure mapping function that returns a structured 'decision + explanation' result -- checkEntitlement()'s {disposition, reason} shape)"
  - "packages/factory-catalog/src/conversionLock.ts (for ConversionLockError's style, and to understand what the 'lock_for_conversion' technical disposition connects to downstream, without wiring that connection in this Issue)"
expected_outputs:
  - "outcomeRecord.ts with a tested, deterministic Sales-outcome-to-technical-disposition mapping and a type-enforced OutcomeRecord constructor"
acceptance_criteria:
  - "mapSalesOutcomeToTechnicalDisposition() returns the exact documented TechnicalDisposition for each of the 11 SalesOutcome values (11 distinct, individually-named test cases)"
  - "createOutcomeRecord() always derives technicalDisposition via mapSalesOutcomeToTechnicalDisposition() rather than accepting or duplicating it -- proven by a test that calls both and asserts they match exactly -- and populates a real outcomeRecordId and decidedAt"
  - "requiresConversionLock() is true only for a 'converted'-outcome record (false for at least 2 other outcomes)"
  - "requiresRecycling() is true for 'rejected', 'expired', and 'lost_to_competitor'-outcome records (all three map to cleanse_and_recycle) and false for a 'converted'-outcome record"
proof_requirements:
  - "Test run showing all 20 new tests passing, plus the 179 prior factory-catalog tests unaffected (199 total)"
review_requirements:
  - "Independent reviewer confirms the doc comments' scope claims match what the code actually does -- no overclaiming of real CRM verification, Sales-authority validation, or downstream ConversionLock/recycling wiring beyond the pure mapping and pure predicates"
integration_requirements:
  - "Merge via the existing draft-PR stack once reviewed"
suggested_role_types:
  - "backend-developer"
read_first:
  - "packages/factory-catalog/src/tierSpecification.ts"
  - "packages/factory-catalog/src/conversionLock.ts"
  - "packages/factory-catalog/src/outcomeRecord.ts"
read_forbidden:
  - "unrelated modules"
blocking_questions: []
optional_fields:
  priority: "high"
  risk_level: "low -- additive, pure functions and a plain data type, no persistence, no edits to already-merged conversionLock.ts or prospectAdaptation.ts"
---

# Issue

## Objective

See front matter.

## Scope / Out Of Scope / Inputs / Expected Outputs / Acceptance Criteria

See front matter.

## Dependency Notes

No dependencies (`depends_on: []`). This module is intentionally decoupled from `ProspectAdaptation` -- `OutcomeRecord.adaptationId` is a plain opaque string, not an imported type, so this module can be reviewed and tested standalone.

## Why This Module, Now

The manual's Section 10 §31 names an explicit, deliberate separation of authority between Sales's commercial-outcome vocabulary and LiNKsites's technical-disposition vocabulary, but (like the Conversion Lock gap addressed in `phase4-conversion-lock-001`) does not print a literal lookup table connecting every Sales outcome to every technical disposition. This Issue is the first concrete implementation: it puts that mapping in exactly one reviewable, testable place, and makes it structurally impossible for a caller to construct an `OutcomeRecord` whose technical disposition disagrees with its Sales outcome -- without inventing the CRM verification or downstream orchestration machinery the manual and this repository's honest-scope boundaries keep separate.

## Proof Requirements / Review Requirements / Integration Requirements

See front matter and `PROOF.md` in this directory.

## State Semantics

`review_ready`.

## Progressive Disclosure

Read next: `PROOF.md` in this same directory.
