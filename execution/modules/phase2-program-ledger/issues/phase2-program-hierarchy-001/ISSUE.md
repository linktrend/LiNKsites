---
issue_id: "phase2-program-hierarchy-001"
title: "Program/Module hierarchy: replace opaque string refs with a real, validated registry"
status: "review_ready"
parent_program: "linksites-manual-alignment"
parent_module: "phase2-program-ledger"
parent_phase: ""
depends_on:
  - "phase2-ledger-core (PR #47)"
objective: "Model the LiNKsites Program's own 20 Modules (M01-M20, manual §05) as real, queryable data, and make Issue.programRef/moduleRef/stageRef validated references instead of opaque strings, as an opt-in capability on ProgramLedger."
scope:
  - "packages/program-ledger/src/hierarchy.ts: ProgramDefinition/ModuleDefinition/StageDefinition types, LINKSITES_PROGRAM constant, HierarchyRegistry"
  - "Optional, backward-compatible wiring into ProgramLedger.createIssue()"
out_of_scope:
  - "Stage-level decomposition within each Module (left as an empty array per Module, to be filled in when each Module's own implementation work defines its Stages)"
  - "Cross-Program Program definitions (Sales, Odoo, Stripe) -- explicitly out of this repository's ownership per manual §02/§21"
inputs:
  - "docs/archive/specs/linksites-program-manual/05_program_modules_and_major_handoffs.md (Module descriptions)"
  - "packages/program-ledger/src/ledger.ts, types.ts (PR #47/#48 state)"
expected_outputs:
  - "hierarchy.ts with all 20 Modules modeled"
  - "ProgramLedger accepts an optional HierarchyRegistry and validates refs when supplied"
acceptance_criteria:
  - "LINKSITES_PROGRAM has exactly 20 Modules, M01-M20, matching manual §05's 4 functional bands"
  - "Creating an Issue with a valid Module ref succeeds when hierarchy validation is enabled"
  - "Creating an Issue with an invalid Module ref is rejected when hierarchy validation is enabled"
  - "Existing callers that don't pass a HierarchyRegistry are unaffected (backward compatible)"
proof_requirements:
  - "Test run showing all new + existing tests passing"
review_requirements:
  - "Independent reviewer confirms the 20 Modules and their band groupings faithfully reflect manual §05, not an invented structure"
integration_requirements:
  - "Merge via the existing draft-PR stack once reviewed"
suggested_role_types:
  - "backend-developer"
read_first:
  - "packages/program-ledger/src/hierarchy.ts"
  - "docs/archive/specs/linksites-program-manual/05_program_modules_and_major_handoffs.md"
read_forbidden:
  - "unrelated modules"
blocking_questions: []
optional_fields:
  priority: "medium"
  risk_level: "low -- additive, opt-in, backward compatible"
  related_issues:
    - "phase2-executor-registry-001"
---

# Issue

## Objective

See front matter.

## Scope

### Allowed

- Modeling the Program/Module hierarchy and wiring optional validation into `createIssue()`.

### Out Of Scope

- See front matter.

## Inputs / Expected Outputs / Acceptance Criteria

See front matter.

## Dependency Notes

Builds directly on the Program Ledger core (PR #47).

## Proof Requirements / Review Requirements / Integration Requirements

See front matter and `PROOF.md` in this directory.

## Blocking Questions

None.

## State Semantics

`review_ready`: execution and proof are complete; awaiting independent review before `done`.

## Progressive Disclosure

Read next: `PROOF.md` in this same directory.
