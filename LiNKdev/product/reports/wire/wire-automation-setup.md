# Wire automation setup log

Repo: **linktrend/LiNKsites** · Branch: **development**

Codex UI agent follows: `LiNKdev/factory/install/automations/CURSOR-CREATE-AUTOMATIONS.md` and `CODEX-CREATE-AUTOMATIONS.md` (no local `.spec.md` drafts in this repo yet).

| Automation | Provider | Created | Trigger verified | Notes |
|------------|----------|---------|------------------|-------|
| LiNKdev-orchestrator | Cursor | | | Merge to `development` |
| LiNKdev-reviewer | Cursor | | | Label `linkdev:review-ready` |
| LiNKdev-integrator | Cursor | | | Label `linkdev:merge-ready` |
| LiNKdev-executor-cursor | Cursor | | | `linkdev:ready` + `runtime:cursor` |
| LiNKdev-executor-codex | Codex | | | `linkdev:ready` + `runtime:codex` |

_Update **Created** and **Trigger verified** when the Codex UI automations agent completes CHECKLIST sections 4–5._
