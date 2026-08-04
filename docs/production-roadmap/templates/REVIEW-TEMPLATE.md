# Independent Review Template

```yaml
schema_version: 1
review_id: <issue-id>-review-<attempt>
subject_id: <issue-id>
subject_sha: <full 40-character SHA>
reviewer: <identity/version>
independent_of_executor: true
reviewed_at: <ISO-8601>
verdict: pass | fail | blocked
criteria_review:
  - criterion: <exact criterion>
    verdict: pass | fail | blocked
    reproduced_evidence: <command/observation/artifact>
findings:
  - severity: blocker | major | minor
    detail: <finding or none>
required_corrections: []
unproven_claims: []
initial_git_status: <exact output>
final_git_status: <exact output>
next_action: integrate | correct | resolve_blocker
```

Only `pass` permits Integration. The reviewer does not fix defects.

