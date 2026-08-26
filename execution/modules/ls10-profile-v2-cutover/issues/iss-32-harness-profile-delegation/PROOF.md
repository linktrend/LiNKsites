---
proof_id: "proof-ls10-iss-32-harness-profile-delegation"
subject_type: "issue"
subject_id: "iss-32-harness-profile-delegation"
status: "local"
parent_commit: "02ebf5d8710c50c1f2c390989239f0baf916ba97"
parent_tree: "fb427d30ea7c3e7060fc9cc1a63a1110266dd755"
criteria_evidence:
  - criterion: "Harness + @linksites/profile delegation adapter exists"
    evidence: "apps/program-orchestrator/src/profile-delegation.ts and contract test"
  - criterion: "Live authority remains generic"
    evidence: "compose() reports liveAuthority generic-runtime and genericRuntimeActive true"
  - criterion: "Shadow-compare and rollback preserve generic authority"
    evidence: "shadow-compare mismatch test rolls back to generic-runtime"
  - criterion: "Generic retirement and Harness conformance stay fail-closed"
    evidence: "activateDelegatedLive, retireGenericAuthority, and claimHarnessConformance throw until H-09 rebind and Harness handoff are accepted, and still refuse cutover as ISS-32"
  - criterion: "Scope stays in orchestrator and execution"
    evidence: "scopedDiff test plus git diff --name-only against protected development"
verification_summary:
  - "tsx --test tests/profile-delegation.test.ts: 6/6 pass"
  - "git diff --check: pass"
  - "owned-path and secret-like scans: pass"
optional_fields:
  commands_run:
    - "tsx --test tests/profile-delegation.test.ts"
    - "git diff --check"
    - "git diff --name-only 02ebf5d8710c50c1f2c390989239f0baf916ba97"
  notes:
    - "This is local ISS-32 composition engineering proof. It is not H-09, H-10, provider, deploy, or generic-authority retirement proof."
---

# Proof

ISS-32 adds a Harness + `@linksites/profile` delegation adapter in
`apps/program-orchestrator` with shadow-compare and rollback controls. The live
runtime remains `program-ledger+program-orchestrator+execution`. Generic
authority retirement and Harness conformance stay fail-closed until the current
H-09 rebind and Harness handoff are accepted, and this issue still does not
perform cutover.

Protected parent: commit `02ebf5d8710c50c1f2c390989239f0baf916ba97`, tree
`fb427d30ea7c3e7060fc9cc1a63a1110266dd755`.
