---
proof_id: "proof-repo-cleanup-001"
subject_type: "issue"
subject_id: "repo-cleanup-001"
status: "draft"
criteria_evidence:
  - criterion: "Every removal/archival traceable via git history except genuinely empty/broken content"
    evidence: "git status showed R (rename) for every archived doc; only the 4 empty scaffold packages and library/README.md were hard-deleted, both confirmed content-free/broken before deletion"
  - criterion: "Every archive directory has its own explanatory doc"
    evidence: "archive/pre-manual-planning-docs/ARCHIVED.md, apps/web-master/docs/archive/agent-session-reports/MANIFEST.md, apps/cms/docs/archive/agent-session-reports/MANIFEST.md all present"
  - criterion: "Full workspace verification passes after cleanup"
    evidence: "typecheck (6 packages), factory-catalog (219 tests), program-ledger (36 tests), CMS integration tests (18 tests), both frontend builds, and lint all green -- re-run and confirmed after each merge in this batch"
artifacts:
  - "archive/pre-manual-planning-docs/ (ARCHIVED.md + 3 subfolders)"
  - "apps/web-master/docs/archive/agent-session-reports/ (8 files + MANIFEST.md)"
  - "apps/cms/docs/archive/agent-session-reports/ (3 files + MANIFEST.md)"
  - "audit/12_reusable_asset_register.yaml (updated with 2 new asset entries, 1 updated disposition)"
  - "audit/13_decision_and_contradiction_register.md (new DR-09)"
verification_summary:
  - "Full CI-equivalent gate green: lint, workspace-wide typecheck (6 packages), factory-catalog tests, program-ledger tests, CMS integration tests, both frontend builds"
optional_fields:
  commands_run:
    - "pnpm install"
    - "pnpm run typecheck (workspace-wide)"
    - "pnpm --filter @linksites/factory-catalog run test"
    - "pnpm --filter @linksites/program-ledger run test"
    - "pnpm --filter @linksites/cms run test:int"
    - "pnpm exec turbo run lint --filter=@linksites/cms --filter=@linksites/web-master"
    - "pnpm --filter @linksites/web-master run build"
    - "pnpm --filter @linksites/web-company run build"
  open_gaps:
    - "apps/web-master/docs/ and apps/cms/docs/ still contain many files not individually re-verified beyond the dedicated subagent's classification pass -- the subagent deliberately erred on the side of keeping ambiguous files in place rather than over-archiving, per its own detailed report."
  notes:
    - "This Issue retroactively documents work done via direct action plus one dedicated subagent, both already merged into development before this ISSUE.md/PROOF.md pair was written -- recorded for completeness and audit-trail consistency with this session's execution-artifact convention."
---

# Proof

## Subject

`repo-cleanup-001` -- repository cleanup batch.

## Criteria To Evidence Map / Artifacts / Verification Summary

See front matter.

## Failures Or Gaps

See front matter `open_gaps`.

## Gate Guidance

Non-vacuous: every archived item has a named, specific reason (not a generic "cleanup"), and the app-docs subagent's report included specific "kept despite similar naming" judgment calls proving deliberate, not mechanical, classification.
