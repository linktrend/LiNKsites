# Archive — superseded by the current source-of-truth documents

Everything under `docs/archive/` is retained for history but is **no longer authoritative** for day-to-day engineering or Principal briefings. Some of it (mirror-pattern `lsites_core`, Nginx/Caddy-only VPS notes, README-era package layout, early “no Program Ledger” audit prose that has since been overtaken by code) is factually stale relative to the repository as it stands today.

**Current source of truth (2026-07-19):**

- [`../LINKSITES-INTENT.md`](../LINKSITES-INTENT.md) — why LiNKsites exists, scope, and what "done" means.
- [`../LINKSITES-TECHNICAL-PRD.md`](../LINKSITES-TECHNICAL-PRD.md) — the exhaustive technical reference for how the system actually works, including a §12 table of exactly where these archived documents have drifted from the real code.
- [`../LINKSITES-OPERATIONS-MANUAL.md`](../LINKSITES-OPERATIONS-MANUAL.md) — plain-English handbook for the Principal.
- [`../OPEN-ISSUES.md`](../OPEN-ISSUES.md) — the append-only engineering build log and open/deferred items.

Also still live (not under this archive): root `audit/` (Phase 0 audit deliverables) and `execution/` (ongoing Program/Module/Issue artifacts).

## What's here (2026-07-19 cleanup)

| Path | What it was |
|---|---|
| `specs/linksites-program-manual/` | Full 24-section Program Manual (ingested 2026-07-13). Still valuable doctrine history; day-to-day authority is now Intent + Technical PRD. |
| `adr/` | ADR 0001 (vocabulary), 0002 (superseded LinkSkills exemption), 0003 (platform org / retire mirror). |
| `ops/` | Environment matrix, git strategy, ops runbook, release log, repo operator SOP, VPS/Cloudflare note. |
| `business/` | Pricing/packaging SOP. |
| `policies/` | Branching/release SOP, contract/schema versioning policy, docs policy. |
| `reference/` | GoDaddy DNS, Supabase setup, VPS deployment guide, security practices report. |
| `BRANCHING_AND_DEPLOYMENT_POLICY.md` | Repo branching/promotion policy (content still accurate in spirit; cited from archive). |
| `DOCUMENTATION_GOVERNANCE.md` | Older docs governance note. |
| `README.pre-standardization-20260401.md` | Pre-existing archive marker from earlier standardization. |

## Explicitly not archived here

App-owned docs under `apps/cms/docs/` and `apps/web-master/docs/` (and their own archive folders) were **not** moved. They describe the apps as build artifacts, not the Program's self-description — same exemption LiNKdeveloper gave its Starter Kit docs.

If something here conflicts with the Intent, Technical PRD, or Operations Manual, **those three documents win.**
