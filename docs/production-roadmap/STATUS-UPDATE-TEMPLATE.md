# LiNKsites Phase 1 Status Update Template

Use for concise progress updates. It never replaces Proof, Review, Integration, Handoff, Verdict, or machine state.

```text
LINKSITES_STATUS
timestamp: <ISO-8601>
overall_goal: delivery_phase_1_pre_vps
documentation_milestone: draft | awaiting_principal_approval | approved
active_wave: <1 | 2 | null>
active_work_packs:
  - <WP-ID: state>
accepted_work_packs:
  - <WP-ID: full 40-character SHA>
holds:
  - <finding/prerequisite or none>
latest_independent_verdict:
  subject: <WP/wave or none>
  verdict: PASS | HOLD | none
  verified_sha: <full SHA or null>
external_actions: <none, or approved exact action>
next_safe_action: <one action>
principal_decision_required: <decision or none>
END_LINKSITES_STATUS
```

Rules:

- Never say complete when the machine state/verdict says otherwise.
- Use full SHAs.
- Label mock/structural proof separately from external/production proof.
- State unchanged blockers without inventing progress.
- Do not include secrets, sensitive lead data, or raw credentials.

