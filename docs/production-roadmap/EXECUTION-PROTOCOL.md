# LiNKsites Delivery Phase 1 Execution Protocol

**Status:** Draft — pending Principal approval
**Applies to:** W1-01 through W2-08 and every correction Issue
**Precedent:** IDE Development proof/review/integration doctrine and LiNKdeveloper production-readiness execution protocol, adapted to LiNKsites rather than copied mechanically

### Read-first precedent

These sources explain the operating discipline behind this protocol. They are guidance, not substitutes for LiNKsites' approved packets and machine state.

- IDE Development: `/Users/linktrend/Projects/IDE Development/docs/contracts/AGENT-COMPLETION.md`, `core/templates/ISSUE.md`, `.cursor/prompts/execution/EXECUTE-ISSUE.md`, `.cursor/prompts/execution/REVIEW-ISSUE.md`, `.cursor/prompts/execution/INTEGRATE-ISSUE.md`, and the AUTH-004 evidence chain under `core/pilots/authentication-module-smoke-test/`.
- LiNKdeveloper: `/Users/linktrend/Projects/LiNKdeveloper/docs/production-readiness/EXECUTION-PROTOCOL.md`, `WAVE-PLAN.md`, `WAVE-MANIFEST.yaml`, `EXECUTION-STATE.yaml`, and the production-readiness work packets.
- If those repositories change, inspect their current accepted state rather than copying an old status or abbreviated SHA. LiNKsites always requires a full 40-character SHA.

## 1. Non-negotiable completion model

Plain English: doing the work is not the same as proving it, passing review is not the same as integrating it, and integration is not the same as releasing it.

```text
ready
  -> in_progress
  -> review_ready + PROOF
  -> independent REVIEW pass
  -> INTEGRATION
  -> done
  -> downstream readiness recomputed
```

An Issue must never jump from `in_progress` to `done`. Downstream work depends on the accepted integrated result, not an implementer's branch, report, or local test.

### Issue states

- `draft`: not sufficiently defined.
- `planned`: defined but dependencies/gates are not satisfied.
- `blocked`: a dependency, decision, authority, or required input prevents execution.
- `ready`: every dependency and entry gate is satisfied.
- `in_progress`: one authorized executor owns the current Run.
- `review_ready`: execution stopped with non-vacuous proof at an exact pushed SHA.
- `done`: independent review passed and integration recorded the accepted output/downstream effects.
- `cancelled`: explicitly terminated with reason/authority and no false completion.

## 2. Gate levels

LiNKsites requires gates at all four levels because the Principal's canonical Program definition requires them.

### Issue gate

Every Issue requires a `PROOF` artifact, independent `REVIEW`, and `INTEGRATION`. Review verdict is `pass`, `fail`, or `blocked`. Only `pass` permits integration.

### Phase gate

Every Phase has entry conditions, completion criteria, required Issue integrations, evidence roll-up, and an explicit gate result. A separate human-style narrative review may be risk-based, but the Phase gate itself is mandatory and machine-recorded. This is deliberately stricter than IDE Development's optional Phase-review default.

### Module gate

Every Module requires all required Phases integrated, its definition of done satisfied, a non-vacuous evidence roll-up, independent Module verdict, and explicit Module integration. Issue completion alone never completes a Module.

### Program/release gate

Delivery Phase 1 completes only when both waves and the exact combined release checkpoint pass, all Module/Phase/Issue evidence is traceable, full certification is reproduced, and the independent release verdict is `PASS`. Deployment remains separately authorized.

## 3. Issue artifact contract

Before execution, every atomic Issue record must contain:

- Issue ID, parent Program/Module/Phase, status, owner/executor type and version
- one objective and one observable outcome
- dependencies and exact accepted/integrated input revisions
- allowed and forbidden paths; external side-effect boundary
- inputs and expected outputs with schema versions
- acceptance criteria, each objectively testable
- proof, independent-review, and integration requirements
- focused and full validation commands
- failure classes, retry/repair limit, stop conditions
- progressive-disclosure `read_first` and `read_forbidden`
- required evidence and redaction policy

If an item in a work packet cannot satisfy this shape as one Issue, split it into dependency-ordered Issues before editing. The Terra master approves the Issue manifest, then dispatches the approved implementation or correction Issue through Codex CLI to a Luna High agent.

## 4. Executor procedure

1. Verify the approved packet, Issue status, dependencies, entry gates, exact base SHA, worktree, branch, owned paths, and clean state.
2. Read repository instructions, the Issue's `read_first`, interfaces, and relevant tests. Do not scan or edit unrelated areas.
3. Change only the approved scope. Missing cross-owner contract changes go to the integrator; do not edit another lane.
4. Run focused validation continuously. Do not weaken gates/tests/security or convert real proof requirements into mocks.
5. Create frequent checkpoint commits after coherent milestones, before handoff/long operations, and before session loss.
6. Push every checkpoint and record full 40-character SHA, branch, scope, and validation.
7. When implementation appears complete, run every packet-required command and required negative case.
8. Produce criterion-by-criterion proof tied to the exact pushed SHA and material artifact hashes/receipts.
9. Transition only to `review_ready` and return `WP_HANDOFF`. Do not integrate, open/merge the normal Phase PR, approve, deploy, or self-review.

Checkpoint means recoverable progress only. It is not review readiness, acceptance, integration, or completion.

## 5. Proof standard

Proof must answer: what exact outcome was required, what exact artifact/state was observed, how was it independently reproducible, and which immutable revision produced it?

Every Issue proof contains:

- schema version; proof ID; subject Program/Module/Phase/Issue/Run IDs
- repository, branch, full base SHA, full subject SHA, and clean/pushed state
- executor/model/tool/version and timestamp
- one row per acceptance criterion with evidence path/receipt/command
- commands, exit codes, relevant counts, skipped checks and blocking classification
- changed files and artifact SHA256/digests where material
- real/structural/mock/live evidence classification
- external action identifiers or explicit `none`
- failures/gaps, secret/PII redaction result, and recommended verifier probes

Acceptable proof includes tests, build/typecheck output, real service boot/health, database migration/read-back, curl/API output, browser/Playwright trace, screenshots, logs/metrics tied to correlation IDs, durable Ledger records, artifact/container digests, backup/restore results, or verified external state.

These are not sufficient alone:

- “done,” “implemented,” confidence, a summary, or a screenshot without traceable state
- a test that never reaches the production composition root
- a mock presented as live proof
- a stale/wrong/abbreviated SHA or moving branch name
- zero/empty health/evidence treated as success
- cached output with no reproducible command
- documentation describing behavior that runtime does not perform

## 6. Independent review and correction

The reviewer/auditor did not implement the subject. It works from a fresh clean context at the exact full pushed SHA, inspects the diff and surrounding behavior, reproduces required commands, maps every criterion to evidence, and probes important negative paths. It never repairs its own findings.

- `pass`: proof and behavior satisfy the Issue criterion set.
- `fail`: correction is required.
- `blocked`: the review cannot be completed because its inputs/criteria/evidence are genuinely unavailable or ambiguous.

For work-pack and wave audits, these map to `PASS` or `HOLD` only. `fail`, `blocked`, missing proof, skipped mandatory validation, or an unproven claim all produce `HOLD`.

On failure/HOLD:

1. The master converts findings into bounded correction Issues against the owning worktree/packet.
2. A Luna High implementer fixes only the proven defects and produces a new pushed SHA/proof.
3. A fresh independent reviewer rechecks the whole corrected acceptance surface, not only the diff.
4. Repeat for at most three ordinary correction cycles. After three unsuccessful cycles, record a precise durable blocker and request Principal direction rather than retrying forever.

## 7. Integration

Only passing independent review permits integration. The integrator:

1. verifies the accepted exact SHA and ancestry were not rewritten;
2. integrates only reviewed outputs into the approved Phase/integration branch;
3. resolves shared lockfiles, workspace registration, migrations, generated files, and cross-lane contracts centrally;
4. records base/head/merge or integration SHAs and checks;
5. reruns integration-level validation;
6. writes `INTEGRATION` with accepted outputs and downstream effects;
7. transitions the Issue to `done` and recomputes readiness.

Normal GitHub unit is one Phase PR into `development` after its Issues are independently accepted and integrated into the Phase branch. An Issue-level PR is reserved for an explicit risk exception such as security/authentication, database migration, infrastructure, major shared API, unusually large work, or cross-Phase impact. Implementers do not open or merge their own PRs.

## 8. Wave gate

Each work pack receives independent `PASS` at its full SHA before dependent work consumes it. At the end of a wave, the Terra master composes accepted packets, runs full validation, freezes the combined full SHA, and dispatches a fresh read-only Sol Medium subagent to perform the integration audit. The Sol auditor neither implements nor repairs the subject.

Wave PASS requires:

- every included packet has a full-SHA independent PASS;
- combined build/typecheck/tests/migrations/integration checks pass;
- cross-packet contracts and lockfiles agree;
- source ownership and ancestry are intact;
- no secret, unapproved external mutation, or hidden mock/live substitution exists;
- negative completion blockers fail closed;
- next-wave prerequisites are actually present;
- the combined exact SHA receives independent PASS.

Machine state changes to accepted/PASS only after the verdict, never from an implementer report.

## 9. External action gate

Any VPS, paid service, GitHub setting, live database, secret, DNS, Cloudflare, public visibility, or real external-system mutation follows:

```text
read-only audit
  -> machine-readable plan with exact targets/cost/side effects
  -> explicit Principal apply authorization
  -> apply only the approved change
  -> independent read-back/functional verification
  -> rollback or recovery proof
```

The first private-site certification cannot opportunistically fix production code. A discovered software defect pauses the pilot, returns to the owning Phase 1 packet/correction Issue, passes fresh review/integration/certification, then resumes from a new exact release.

## 10. Handoff format

The implementation lead returns exactly:

```text
WP_HANDOFF
wp_id: <WP-ID>
status: ready_for_independent_verification | blocked
repository: <absolute path>
worktree: <absolute path>
branch: <branch>
base_commit: <full 40-character SHA>
latest_commit: <full 40-character SHA>
pushed: yes | no
summary: <2-5 plain-English sentences>
owned_files_changed:
  - <path>
issue_proofs:
  - issue_id: <ID>
    proof_path: <path or durable URI>
    subject_sha: <full SHA>
key_design_decisions:
  - <decision and reason, or none>
validation:
  - command: <command>
    result: pass | fail | not_run
    evidence: <specific result/path>
evidence_classification:
  - structural | local_real | external_real | production
external_actions:
  - <none, or exact approved action and identifier>
known_risks_or_limits:
  - <item or none>
blocked_by:
  - <item or none>
verifier_focus:
  - <specific risk or behavior>
END_WP_HANDOFF
```

## 11. Verifier format

The independent verifier returns exactly:

```text
WP_VERDICT
wp_id: <WP-ID or wave-id>
verdict: PASS | HOLD
repository: <absolute path>
verified_commit: <full 40-character SHA>
branch: <branch>
scope_check: pass | hold
acceptance_criteria:
  - criterion: <criterion>
    verdict: pass | hold
    evidence: <specific reproduced evidence>
fresh_validation:
  - command: <command>
    result: pass | fail | not_run
    evidence: <specific result>
security_and_credential_check: pass | hold
external_state_check: pass | hold | not_applicable
findings:
  - severity: blocker | major | minor
    detail: <finding, or none>
required_corrections:
  - <bounded correction, or none>
unproven_claims:
  - <claim, or none>
blocked_by:
  - <prerequisite, or none>
initial_git_status: <exact output>
final_git_status: <exact output>
final_rationale: <short plain-English explanation>
END_WP_VERDICT
```

`PASS WITH LIMITS` is forbidden. A lower-severity future improvement may be logged separately, but any unmet approved acceptance criterion is HOLD.

## 12. Session continuity

Agent transcripts and chat summaries are useful context, not canonical completion evidence. At each stop/handoff, record date/time, repository/worktree/branch, active Program/Module/Phase/Issue, full checkpoint SHA, completed and remaining work, pending proof/review/integration gate, blockers, next action, and commands likely needed. Reference canonical artifacts rather than duplicating them. A new agent must be able to resume without hidden chat memory.
