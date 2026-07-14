---
module_id: "phase2-program-ledger"
title: "Phase 2 — Program core and governed execution (Program Ledger)"
status: "in_progress"
parent_program: "linksites-manual-alignment"
objective: "Build the Issue/Run/Gate/Event/Idempotency execution core the LiNKsites Program Manual requires as the foundation for almost every later Module (manual Section 20; Phase 2 per audit/14_implementation_roadmap.md)."
scope:
  - "packages/program-ledger: Issue/Run/Gate/Event/Idempotency contracts and core state machine"
  - "In-memory and Postgres-backed (pglite-tested) LedgerStore implementations"
  - "Program/Module/Stage hierarchy objects (not yet started)"
  - "Executor registry and at least one real executor exercising the ledger end to end (not yet started)"
out_of_scope:
  - "Live Supabase/Postgres connection and RLS verification (blocked on live infrastructure access, GAP-50)"
  - "The full 8-level model-routing ladder, compensation Sagas, and cross-Program outbox/inbox (later work packets)"
phases: []
read_first:
  - ".cursor/execution/INDEX.yaml"
  - ".cursor/execution/AUTONOMOUS-MODULE-EXECUTION.md"
  - "execution/PROGRAM.md"
  - "audit/14_implementation_roadmap.md (Phase 2 section)"
  - "packages/program-ledger/src/types.ts (scope note in the module doc comment)"
read_forbidden:
  - "unrelated modules not required for Program Ledger work"
module_definition_of_done:
  - "The manual §62 Phase 2 exit gate is met with verified evidence: a synthetic workflow survives duplicate dispatch, worker crash, timeout, cancellation, and replay; one Issue can be traced through accepted output and cost; no model owns workflow truth or authority."
  - "A live Postgres/Supabase connection has been used to verify the store (not just pglite) -- GAP-50."
  - "At least one real executor uses this ledger to do actual LiNKsites work end to end."
optional_fields:
  risk_summary:
    - "GAP-50: live-infrastructure verification is blocked while working remotely; pglite testing is real but not equivalent to live verification."
  notes:
    - "Issues completed so far: phase2-ledger-core (PR #47), phase2-postgres-store (PR #48), phase2-ledger-review-bugfix-001, phase2-program-hierarchy-001, phase2-executor-registry-001 (all review_ready as of this session)."
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

No formal phase-level checkpointing has been introduced yet; Issues are tracked directly under this module (see `execution/modules/phase2-program-ledger/issues/`).

## Progressive Disclosure Inputs

### Read First

- See front matter.

### Read Forbidden

- See front matter.

## Module Definition Of Done

See front matter.

## Roll-Up Semantics

- Issue completion (per PR merge) rolls into this module's progress.
- Module completion requires the module definition of done AND mandatory module review (per Canonical Law 12/13) -- this has not yet occurred; all PRs referenced here remain drafts awaiting Carlos's review and merge.

## Gate Notes

- Readiness gate: satisfied for each Issue listed below (dependencies were the prior Issue in the PR stack).
- Review gate: NOT yet satisfied at module level -- each Issue's PR is `review_ready` (draft, pushed, locally verified) but awaiting independent review/merge.
- Integration gate: NOT yet satisfied -- no PR in this stack has been merged.

## Review Requirements

Module review is mandatory before this module should be treated as complete. This has not occurred yet.

## Progressive Disclosure

Read next:

1. `execution/modules/phase2-program-ledger/issues/phase2-executor-registry-001/ISSUE.md` (most recent Issue)
2. its `PROOF.md`
3. `execution/PROGRAM.md` again only if module-level constraints are ambiguous

## Remaining Phase 2 Scope (not yet started)

- A real (non-synthetic) executor connecting this ledger to `apps/cms`/Supabase/an AI model --
  requires live infrastructure.
- Live Postgres/Supabase verification of the store (GAP-50) -- requires live infrastructure.
- Full dependency DAG, model-routing ladder, compensation Sagas, cross-Program outbox/inbox.
- A production scheduler/runner loop (runIssueOnce() is single-shot/synchronous today).

Once these are addressed (or explicitly deferred with Carlos's sign-off), Phase 2 can move to
`done` and Phase 3 (reusable asset factory) becomes the active module.
