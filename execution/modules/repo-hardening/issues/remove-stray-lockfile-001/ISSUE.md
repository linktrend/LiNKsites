---
issue_id: "remove-stray-lockfile-001"
title: "Remove an orphaned, unused apps/web-master/pnpm-lock.yaml that GitHub was scanning as if it were live"
status: "review_ready"
parent_program: "linksites-manual-alignment"
parent_module: "repo-hardening"
parent_phase: ""
depends_on: []
objective: "Explain and close the gap between 'pnpm audit reports zero known vulnerabilities' and GitHub still reporting 26 vulnerabilities on the newly-promoted main branch: found and removed a second, orphaned pnpm-lock.yaml that this pnpm workspace never actually uses, but that GitHub's Dependabot scans independently and had never benefited from any of this session's dependency-version fixes."
scope:
  - "Deleted apps/web-master/pnpm-lock.yaml (a stray file from the original 2025-12-09 'initialize LiNKsites monorepo' commit, predating this repo's current single-lockfile pnpm workspace structure)"
out_of_scope:
  - "Auditing every other app/package directory for a similar stray lockfile -- a repo-wide search (find . -name pnpm-lock.yaml) confirmed only these two lockfiles exist (the real root one and this one), so no further search was needed"
inputs:
  - "GitHub Dependabot alerts API (gh api repos/linktrend/LiNKsites/dependabot/alerts), which specifically named apps/web-master/pnpm-lock.yaml as the manifest_path for all 26 findings"
expected_outputs:
  - "A single, real, actively-scanned pnpm-lock.yaml at the repo root; GitHub's vulnerability count should converge toward pnpm audit's own zero-vulnerability finding once it rescans"
acceptance_criteria:
  - "pnpm install, workspace-wide typecheck, both frontend builds, all test suites (factory-catalog, program-ledger, CMS), lint, and pnpm audit all remain green/zero-vulnerability after removing the file"
  - "No script, CI step, or config anywhere in the repository references apps/web-master/pnpm-lock.yaml"
proof_requirements:
  - "Full verification run showing everything green after removal"
review_requirements:
  - "Independent reviewer confirms this repository is genuinely a single-lockfile pnpm workspace (pnpm-workspace.yaml) and that removing a nested lockfile cannot affect what pnpm actually installs"
integration_requirements:
  - "Merge via the existing consolidated branch/PR for this batch, then re-promote through staging and main so GitHub rescans against the corrected tree"
suggested_role_types:
  - "backend-developer"
read_first:
  - "pnpm-workspace.yaml"
  - "audit/12_reusable_asset_register.yaml (asset-stray-web-master-lockfile)"
read_forbidden: []
blocking_questions: []
optional_fields:
  priority: "medium"
  risk_level: "very low -- deleting a file pnpm never reads cannot change install/build behavior; verified by a full green re-run of every check"
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
