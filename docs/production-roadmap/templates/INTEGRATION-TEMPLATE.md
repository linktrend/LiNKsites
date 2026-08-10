# Integration Template

```yaml
schema_version: 1
integration_id: <issue-id>-integration
subject_id: <issue-id>
accepted_subject_sha: <full 40-character SHA>
passing_review_id: <review-id>
integrator: <identity>
integration_status: integrated | blocked
phase_branch: <branch>
base_sha: <full 40-character SHA>
head_sha: <full 40-character SHA>
merge_or_integration_sha: <full 40-character SHA>
required_checks:
  - name: <check>
    result: pass | fail
integrated_outputs: []
downstream_effects:
  newly_ready_issues: []
  still_blocked_issues: []
final_issue_state: done | review_ready | blocked
integrated_at: <ISO-8601>
```

Integration records what downstream work may now rely on. A passing review without this artifact does not make the Issue `done`.

