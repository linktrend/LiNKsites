---
issue_id: "hardening-security-001"
title: "Patch remaining dependency vulnerabilities on development; add automated audit gate to CI"
status: "review_ready"
parent_program: "linksites-manual-alignment"
parent_module: "repo-hardening"
parent_phase: ""
depends_on: []
objective: "Independently re-verify the repository's real current dependency-vulnerability state (distinct from GitHub's push-time message, which reflects the unpromoted main/default branch, not development), patch what pnpm audit finds, and add an automated CI gate so future regressions are caught immediately rather than discovered later."
scope:
  - "package.json: two new bounded pnpm.overrides entries (drizzle-orm, esbuild)"
  - ".github/workflows/ci.yml: new 'Dependency vulnerability audit' step"
out_of_scope:
  - "Promoting these fixes (or any other development-branch change) to main -- that promotion is Principal-only per docs/BRANCHING_AND_DEPLOYMENT_POLICY.md, not something an agent session does"
  - "Investigating GitHub's specific default-branch Dependabot count further -- confirmed to be a main-branch, not development-branch, figure via `gh repo view --json defaultBranchRef`"
inputs:
  - "pnpm audit (run directly against packages/factory-catalog + workspace root on development)"
expected_outputs:
  - "Zero known vulnerabilities per pnpm audit on development, with a CI gate to keep it that way"
acceptance_criteria:
  - "pnpm audit reports zero known vulnerabilities after the two new overrides are applied"
  - "Full workspace verification (typecheck, all test suites, both builds, lint) remains green after the overrides"
  - "CI's new audit step exits 0 given the current, patched dependency tree"
proof_requirements:
  - "pnpm audit output showing 'No known vulnerabilities found', both before/after comparison recorded"
review_requirements:
  - "Independent reviewer confirms both overrides are same-minor-bounded (not open-ended), consistent with this repo's existing pnpm.overrides convention"
integration_requirements:
  - "Merge via the existing consolidated branch/PR for this batch"
suggested_role_types:
  - "backend-developer"
read_first:
  - "package.json (pnpm.overrides section)"
  - ".github/workflows/ci.yml"
read_forbidden: []
blocking_questions: []
optional_fields:
  priority: "high"
  risk_level: "low -- both overrides are minor version bumps of transitive dependencies, verified against the full test/build/lint suite"
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
