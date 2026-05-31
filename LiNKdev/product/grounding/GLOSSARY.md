# Glossary

Principal-approved terms for LiNKtrend / LinkSites work. LiNKaios operator UI follows the same vocabulary as LiNKtrend-System.

| Term | Definition |
|------|------------|
| **Principal** | Human authority for the business or studio; approves protected actions, Release OK, and promotion to `staging`/`main` |
| **Suite** | Subscribed business-process package (LinkSites is one Suite) |
| **Module** | Vendor-published recipe inside a Suite (phases, issues, assignee templates) |
| **Project** | Tenant-created live work instance using one or more Modules |
| **Phase** | Stage group inside a Module (e.g. lead generation, publish, outreach) |
| **Issue** | Atomic governed task with input/output contracts |
| **Assignee** | Executor of an Issue: LiNKbot, **Automation** (LiNKautowork), or Human |
| **Run** | One pass through project modules; maps to Plane Cycle |
| **Capability** | Governed integration to external software (UI term). Code: capability connector in LinkSkills |
| **Automation** | User-facing label for LiNKautowork / n8n deterministic workflows — not "workflow" in LiNKaios UI |
| **LiNKaios** | Company operating system — control plane, Client + Admin UI, traces, approvals |
| **LiNKsites / LinkSites** | This repo — website factory (Payload, templates, publish) |
| **MVO** | Minimum viable outcome: LiNKaios Client + Admin + one LinkSites lead full E2E in LiNKtrend-System |

## Legacy terms (do not use in new copy)

| Avoid | Use instead |
|-------|-------------|
| Chairman | Principal |
| Mission | Project |
| Connector (UI) | Capability |
| Workflow (for n8n in UI) | Automation |
| Dev_Sites | LiNKsites |
