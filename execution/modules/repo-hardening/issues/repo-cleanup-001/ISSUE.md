---
issue_id: "repo-cleanup-001"
title: "Repository cleanup: remove dead scaffolding, archive pre-manual planning docs and stale agent-session-report artifacts"
status: "review_ready"
parent_program: "linksites-manual-alignment"
parent_module: "repo-hardening"
parent_phase: ""
depends_on: []
objective: "Execute Carlos's explicit instruction (2026-07-14) to clean up repository content unrelated to LiNKsites' current intent before the hardening/testing pass. Full rationale recorded in audit/13_decision_and_contradiction_register.md (DR-09) and audit/12_reusable_asset_register.yaml."
scope:
  - "Deleted 4 empty scaffold packages (packages/blocks, packages/config, packages/ui, packages/utils) and a stale, broken-link library/README.md index"
  - "Archived (git mv, history preserved) sites_specs/*.txt, docs/product/*.md, and 5 pre-manual docs/reference/*.md files into archive/pre-manual-planning-docs/"
  - "Archived (via a dedicated subagent's careful, file-by-file classification) 11 stale AI-agent session-completion-report docs from apps/web-master/docs/ and apps/cms/docs/ into each app's own docs/archive/agent-session-reports/"
out_of_scope:
  - "apps/web-company (Carlos's DR-02 decision: paused, not deleted)"
  - "The 4 still-useful docs/reference/*.md operational how-tos (GODADDY_DNS_SETUP, SUPABASE_SETUP, VPS_DEPLOYMENT_GUIDE, security_best_practices_report)"
  - "Any code under apps/ (besides the doc moves), packages/program-ledger, packages/factory-catalog, supabase/, execution/, or audit/"
inputs:
  - "audit/12_reusable_asset_register.yaml (existing sites_specs disposition, previously recorded but not executed)"
  - "audit/13_decision_and_contradiction_register.md DR-02 (apps/web-company disposition)"
expected_outputs:
  - "A cleaner repository tree with clear, reviewable archival rationale for everything moved"
acceptance_criteria:
  - "Every removal/archival is traceable via git history (git mv, not raw delete-and-recreate) except for genuinely empty/broken content (the 4 scaffold packages and library/README.md)"
  - "Every archive directory has its own ARCHIVED.md or MANIFEST.md explaining what's there and why"
  - "Full workspace verification (typecheck, all test suites, both builds, lint) passes after the cleanup"
proof_requirements:
  - "Verification run showing lint, typecheck, factory-catalog (219 tests at the time), program-ledger (36 tests), CMS integration tests, and both frontend builds all green after the cleanup"
review_requirements:
  - "Independent reviewer confirms nothing archived is actually still referenced by code/config (verified via repo-wide grep before archiving)"
integration_requirements:
  - "Merge via the existing consolidated branch/PR for this batch"
suggested_role_types:
  - "backend-developer"
read_first:
  - "archive/pre-manual-planning-docs/ARCHIVED.md"
  - "apps/web-master/docs/archive/agent-session-reports/MANIFEST.md"
  - "apps/cms/docs/archive/agent-session-reports/MANIFEST.md"
read_forbidden: []
blocking_questions: []
optional_fields:
  priority: "medium"
  risk_level: "low -- archival, not deletion, for everything with real content; verified no code/config references broken"
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
