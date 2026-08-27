---
module_id: "ls10-profile-v2-cutover"
title: "LS-10 existing-site migration, operations and cutover"
status: "in_progress"
parent_program: "linksites-profile-v2"
objective: "Delegate generic orchestrator/execution composition to one Harness + @linksites/profile pair with shadow-compare and rollback, without retiring live generic authority until H-09 rebind and Harness handoff are accepted."
scope:
  - "apps/program-orchestrator/**"
  - "execution/**"
out_of_scope:
  - "packages/program-ledger/**"
  - "deploy/**"
  - "docs/releases/**"
  - "provider bytes and LiNKharness source"
issues:
  - issue_id: "iss-32-harness-profile-delegation"
    path: "execution/modules/ls10-profile-v2-cutover/issues/iss-32-harness-profile-delegation/ISSUE.md"
---

# LS-10 ISS-32 module

ISS-32 owns only the program-orchestrator delegation adapter and this execution
package. Generic Ledger, deploy, release docs, provider, and Harness source
remain untouched.
