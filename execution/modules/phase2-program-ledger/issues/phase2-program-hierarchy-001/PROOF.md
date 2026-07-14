---
proof_id: "proof-phase2-program-hierarchy-001"
subject_type: "issue"
subject_id: "phase2-program-hierarchy-001"
status: "draft"
criteria_evidence:
  - criterion: "LINKSITES_PROGRAM has exactly 20 Modules, M01-M20, matching manual §05's 4 functional bands"
    evidence: "tests/hierarchy.spec.ts: 'defines exactly 20 Modules (M01-M20) per manual §05' and 'groups Modules into the 4 functional bands the manual describes' -- both passing"
  - criterion: "Creating an Issue with a valid Module ref succeeds when hierarchy validation is enabled"
    evidence: "tests/hierarchy.spec.ts: 'creates an Issue against a real Module ref (M07, Preview Intake & Planning)' -- passing"
  - criterion: "Creating an Issue with an invalid Module ref is rejected when hierarchy validation is enabled"
    evidence: "tests/hierarchy.spec.ts: 'rejects creating an Issue against an unknown Module when hierarchy validation is enabled' -- passing"
  - criterion: "Existing callers that don't pass a HierarchyRegistry are unaffected"
    evidence: "tests/hierarchy.spec.ts: 'still allows Issue creation without hierarchy validation when no registry is supplied (backward compatible)' -- passing; all prior test suites (exit-gate, postgres-store) unaffected"
artifacts:
  - "packages/program-ledger/src/hierarchy.ts"
  - "packages/program-ledger/tests/hierarchy.spec.ts"
verification_summary:
  - "packages/program-ledger full test run: 33/33 tests passing (11 hierarchy + 11 in-memory exit-gate + 11 pglite-backed Postgres exit-gate)"
  - "packages/program-ledger typecheck: clean"
  - "Workspace-wide lint (cms, web-master) and typecheck (all 5 packages): clean"
optional_fields:
  commands_run:
    - "pnpm exec vitest run (packages/program-ledger)"
    - "pnpm exec tsc -p tsconfig.json (packages/program-ledger)"
    - "pnpm exec turbo run lint --filter=@linksites/cms --filter=@linksites/web-master"
    - "pnpm run typecheck (workspace-wide)"
  open_gaps:
    - "Stage-level decomposition is not modeled (empty array per Module) -- any stageRef is currently rejected. This is intentional per the Issue's out-of-scope note, not an oversight."
  notes:
    - "The Module list and one-line purposes were transcribed directly from manual §05's Module descriptions (via this session's earlier extraction pass), not invented."
---

# Proof

## Subject

`phase2-program-hierarchy-001` -- Program/Module hierarchy registry.

## Criteria To Evidence Map / Artifacts / Verification Summary

See front matter.

## Failures Or Gaps

See front matter `open_gaps`.

## Gate Guidance

Non-vacuous: every criterion maps to a specific named, passing test.
