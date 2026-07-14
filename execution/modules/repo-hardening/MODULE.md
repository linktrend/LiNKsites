---
module_id: "repo-hardening"
title: "Repository hardening and test-coverage pass"
status: "in_progress"
parent_program: "linksites-manual-alignment"
objective: "Per Carlos's explicit instruction (2026-07-14, after confirming little further engineering was buildable without live Stripe/Odoo/Supabase access): clean up repository content unrelated to LiNKsites' intent (see audit/13_decision_and_contradiction_register.md, DR-09), then harden and increase test coverage of everything built this session, before moving to the Supabase and Odoo integration phases."
scope:
  - "Dependency vulnerability remediation, re-verified independently of GitHub's default-branch (main) Dependabot count (done: hardening-security-001)"
  - "CI: add an automated dependency-audit gate so future vulnerabilities are caught, not just fixed reactively (done: hardening-security-001)"
  - "Test coverage measurement and gap-filling for packages/factory-catalog and packages/program-ledger (done: hardening-test-coverage-001)"
  - "App-level documentation cleanup (apps/web-master/docs, apps/cms/docs) -- see the separate repo-cleanup batch (DR-09), not tracked as its own Issue in this module"
out_of_scope:
  - "Live Supabase/Postgres verification -- still blocked on live infrastructure access (GAP-50), explicitly deferred to the next phase per Carlos's own sequencing instruction"
  - "Live Stripe/Odoo integration -- still blocked on cross-Program access (GAP-33/34/35), explicitly deferred to the phase after Supabase"
  - "Rewriting or removing any already-reviewed Issue's PROOF.md open_gaps -- hardening documents and closes gaps where genuinely closable, it does not retroactively mark unclosable gaps as closed"
phases: []
read_first:
  - ".cursor/execution/INDEX.yaml"
  - "execution/PROGRAM.md"
  - "audit/13_decision_and_contradiction_register.md (DR-09)"
  - "audit/14_implementation_roadmap.md"
read_forbidden:
  - "unrelated modules"
module_definition_of_done:
  - "pnpm audit reports zero known vulnerabilities on the development branch, with an automated CI gate to catch regressions."
  - "packages/factory-catalog and packages/program-ledger both have measured test coverage above 90% statements/branches, with any newly-found real bugs fixed, not just covered."
  - "Repository content unrelated to LiNKsites' current intent is archived (not deleted, per manual §5) with a clear, reviewable rationale."
optional_fields:
  risk_summary:
    - "GitHub's push-time 'X vulnerabilities' message reflects the default branch (main), not development -- this repeatedly caused confusion this session. It is NOT evidence of a regression in this session's own security fixes, which live on development and have not yet been promoted through staging->main per the branching policy (Principal-only promotion)."
  notes:
    - "Issues completed so far: hardening-security-001, hardening-test-coverage-001. This module was created directly from Carlos's explicit instruction, distinct from the phase3/phase4 factory-build modules -- it is cross-cutting quality work over everything already built, not a new manual-doctrine object."
---

# Module

## Objective

See front matter.

## Scope

### In Scope

- See front matter.

### Out Of Scope

- See front matter.

## Phases

No formal phase-level checkpointing has been introduced yet; Issues are tracked directly under this module (see `execution/modules/repo-hardening/issues/`).

## Module Definition Of Done

See front matter.

## Roll-Up Semantics

Same as every other module this session -- Issue completion rolls into module progress; module completion requires the module definition of done AND mandatory module review, which has not occurred yet for any Issue in this module.

## Progressive Disclosure

Read next:

1. `execution/modules/repo-hardening/issues/hardening-security-001/ISSUE.md`
2. `execution/modules/repo-hardening/issues/hardening-test-coverage-001/ISSUE.md`
3. their respective `PROOF.md` files
