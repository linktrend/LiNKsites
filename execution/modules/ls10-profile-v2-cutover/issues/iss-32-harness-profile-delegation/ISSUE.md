---
issue_id: "iss-32-harness-profile-delegation"
title: "LS-10 ISS-32 dependency-safe composition engineering"
status: "in_progress"
parent_program: "linksites-profile-v2"
parent_module: "ls10-profile-v2-cutover"
depends_on:
  - "LS-08"
  - "LS-09"
  - "current H-09 rebind / Harness handoff (fail-closed until accepted)"
objective: "Replace/delegate current generic orchestrator/execution composition to one Harness + @linksites/profile pair, shadow-compare it against the live generic runtime, and preserve rollback without retiring generic authority."
scope:
  - "apps/program-orchestrator/src/profile-delegation.ts"
  - "apps/program-orchestrator/tests/profile-delegation.test.ts"
  - "execution/modules/ls10-profile-v2-cutover/**"
out_of_scope:
  - "packages/program-ledger/**"
  - "deploy/**"
  - "docs/releases/**"
  - "provider or Harness source"
  - "generic authority retirement"
  - "H-09/H-10 conformance admission"
inputs:
  - "protected development commit 02ebf5d8710c50c1f2c390989239f0baf916ba97"
  - "protected development tree fb427d30ea7c3e7060fc9cc1a63a1110266dd755"
  - "packages/linkharness-profile @linksites/profile pin and ProfilePort"
acceptance_criteria:
  - "Harness + @linksites/profile delegation adapter exists in program-orchestrator"
  - "Live authority remains the generic runtime"
  - "Shadow-compare detects premature live switch and rolls back"
  - "Generic authority retirement and Harness conformance remain fail-closed until current H-09 rebind and Harness handoff are accepted"
  - "Diff stays inside apps/program-orchestrator/** and execution/**"
proof_requirements:
  - "Focused contract, shadow-compare, rollback, fail-closed, and scope tests"
suggested_role_types:
  - "backend-developer"
---

# Issue

ISS-32 implements dependency-safe composition engineering only. It delegates
generic orchestrator/execution control-plane identity to the existing
`@linksites/profile` composition and the HC1-A Harness pin, while the live
runtime remains `program-ledger+program-orchestrator+execution`.

H-09 remains `rebind-required` against the protected development
commit/tree above. This issue does not admit conformance, copy Harness or
provider bytes, or retire generic authority.
