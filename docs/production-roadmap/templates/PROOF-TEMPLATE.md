# Proof Template

```yaml
schema_version: 1
proof_id: <issue-id>-proof-<attempt>
subject:
  program_id: <program-id>
  module_id: <module-id>
  phase_id: <phase-id>
  issue_id: <issue-id>
  execution_run_id: <run-id>
status: present | insufficient
repository: <absolute path>
branch: <branch>
base_sha: <full 40-character SHA>
subject_sha: <full 40-character SHA>
pushed: true | false
executor: <identity/version>
created_at: <ISO-8601>
evidence_classification: structural | local_real | external_real | production
criteria_evidence:
  - criterion: <exact acceptance criterion>
    evidence: <specific observation and artifact/receipt/trace path>
commands:
  - command: <exact command>
    exit_code: <integer>
    evidence_path: <path or durable URI>
artifacts:
  - path: <path>
    sha256: <digest or not_applicable with reason>
skipped_checks: []
external_actions: []
failures_or_gaps: []
redaction_check: pass | fail
verifier_focus: []
```

Every acceptance criterion requires its own evidence row. A general completion statement is insufficient.

