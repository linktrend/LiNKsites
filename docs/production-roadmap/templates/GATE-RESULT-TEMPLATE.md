# Phase, Module, and Program Gate Result Template

```yaml
schema_version: 1
gate_id: <stable-id>
subject_type: phase | module | program | release
subject_id: <id>
subject_revision: <full SHA, content checksum, or immutable composite digest>
attempt: <integer>
evaluator: <identity/version>
independent_of_authors: true | false
decision: pass | fail | blocked
decided_at: <ISO-8601>
entry_or_completion_criteria:
  - criterion: <criterion>
    verdict: pass | fail | blocked
    evidence_receipts: []
required_issue_integrations: []
required_predecessor_gates: []
negative_blocker_tests: []
findings: []
repair_budget:
  maximum: 3
  consumed: <integer>
next_transition: <state or none>
```

Every LiNKsites Phase has a mandatory recorded gate even when a separate narrative Phase review is unnecessary. Module and Program/release gates require independent evaluation.

