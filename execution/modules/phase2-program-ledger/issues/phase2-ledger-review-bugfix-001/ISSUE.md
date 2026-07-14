---
issue_id: "phase2-ledger-review-bugfix-001"
title: "Independent review pass over Program Ledger core: find and fix concurrency-safety bugs"
status: "review_ready"
parent_program: "linksites-manual-alignment"
parent_module: "phase2-program-ledger"
parent_phase: ""
depends_on:
  - "phase2-ledger-core (PR #47)"
  - "phase2-postgres-store (PR #48)"
objective: "Re-read packages/program-ledger's core logic skeptically (not just re-running existing green tests) to find any remaining correctness bugs before continuing to build on top of it, per Canonical Law 12 (review is separate from execution) and Law 9 (completion requires evidence, not confidence)."
scope:
  - "Read ledger.ts and store.ts line by line for state-machine and concurrency-safety issues"
  - "Reproduce any suspected bug with a targeted test before fixing it"
  - "Fix confirmed bugs and add a regression test proving each fix"
out_of_scope:
  - "New features or scope beyond bug-fixing (Program/Module/Stage hierarchy, executor registry -- separate future Issues)"
inputs:
  - "packages/program-ledger/src/ledger.ts, store.ts, types.ts (PR #47/#48 state)"
expected_outputs:
  - "Any confirmed bugs fixed, each with a regression test"
  - "Updated audit/09_gap_and_risk_register.yaml and audit/14_implementation_roadmap.md reflecting findings"
acceptance_criteria:
  - "All existing exit-gate tests (in-memory + pglite-backed Postgres) continue to pass"
  - "Any newly-found bug has a test that fails before the fix and passes after"
  - "No regression in lint/typecheck/build for the rest of the workspace"
proof_requirements:
  - "Test run output showing before/after for each bug found"
  - "Full workspace verification (lint, typecheck, existing test suites, both frontend builds) still green"
review_requirements:
  - "An independent reviewer (Carlos or a future session) confirms the fixes are correct and the new tests are non-vacuous"
integration_requirements:
  - "Merge via the existing draft-PR stack once reviewed"
suggested_role_types:
  - "reviewer"
  - "backend-developer"
read_first:
  - "packages/program-ledger/src/types.ts"
  - "packages/program-ledger/src/ledger.ts"
  - "packages/program-ledger/src/store.ts"
  - "packages/program-ledger/tests/ledgerContract.shared.ts"
read_forbidden:
  - "unrelated modules"
blocking_questions: []
optional_fields:
  priority: "high"
  risk_level: "medium -- these are concurrency-safety bugs in code nothing depends on yet, but would have been serious once a real executor uses this ledger"
  notes:
    - "Found via manual line-by-line re-read prompted by Carlos asking to 'fix any bugs' before continuing -- not found by any automated tool."
---

# Issue

## Objective

See front matter.

## Scope

### Allowed

- Bug-finding and bug-fixing within `packages/program-ledger` only.

### Out Of Scope

- Any new feature work.

## Inputs

- See front matter.

## Expected Outputs

- See front matter.

## Acceptance Criteria

- See front matter.

## Dependency Notes

Depends on the Program Ledger core (PR #47) and Postgres store (PR #48) existing to review. Both were locally verified (18/18 tests) before this review Issue began.

## Proof Requirements

See `PROOF.md` in this Issue's directory.

## Review Requirements

Independent review required before merge, per this program's global constraint that no PR is treated as integrated without review.

## Integration Requirements

Standard draft-PR merge once reviewed.

## Blocking Questions

None.

## State Semantics

Currently `review_ready`: execution and proof are complete; awaiting independent review before this can move to `done`.

## Gate Guidance

- Proof exists (see `PROOF.md`).
- This Issue must not be marked `done` by the executing agent itself -- that would violate Canonical Law 12.

## Progressive Disclosure

Read next: `PROOF.md` in this same directory.
