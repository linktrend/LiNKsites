# LiNKsites — Open Issues (append-only build log)

This file is the honest engineering build log for the LiNKsites Program. Prefer it over stale prose elsewhere when answering “what is actually true today?”

**Companion source-of-truth docs (2026-07-19):**

- [`LINKSITES-INTENT.md`](./LINKSITES-INTENT.md)
- [`LINKSITES-TECHNICAL-PRD.md`](./LINKSITES-TECHNICAL-PRD.md)
- [`LINKSITES-OPERATIONS-MANUAL.md`](./LINKSITES-OPERATIONS-MANUAL.md)

Related working sets (not archived): `audit/` (Phase 0 audit + roadmap), `execution/` (Program/Module/Issue artifacts).

---

## Seeded open / deferred items (from audit + roadmap, status as of 2026-07-19)

These were not invented for this cleanup — they are the live residual from `audit/09_gap_and_risk_register.yaml` and `audit/14_implementation_roadmap.md`, restated briefly.

### Still open (high level)

1. **GAP-33/34/35 — Sales / Stripe / Odoo spine** — No live paid-activation adapters in this repo. Phase 5 blocked on cross-Program access. **Severity: blocker for first real sale.**
2. **GAP-23/24 — Monitoring and backup/restore** — Autonomous hosting ops (M16) not built. Docker/Traefik scaffolding exists only. **Severity: critical before real customers.**
3. **GAP-50 residual — Live Payload/Postgres verification** — `PayloadRestDraftTarget` (REST) exists; CI integration tests skip without live credentials. Promotion path proven with doubles.
4. **Publication / launch certification automation (M14)** — Promotion is correctly draft-only; automated publish→launch certificate Module not built.
5. **M09 content/media production pipeline** — Governed copy/media factory workflow incomplete (CMS Media collection exists).
6. **M17–M19 managed-service Modules** — Customer change entitlement workflow, capacity planner, suspension/export/termination not built as Program Modules.
7. **Phase 8 observability / cost accounting** — No OpenTelemetry/Langfuse/dollar-cost dashboard in repo.
8. **First real customer pilot (Phase 9)** — Pilot slice approved (Home Services / Standard); not executed live end-to-end.
9. **web-company disposition (DR-02)** — Smaller template remains paused/ambiguous relative to web-master.
10. **Final commercial configuration** — Tier prices, legal packaging, exact entitlements remain Principal/business decisions (provisional placeholders only in code).

### Recently closed / substantially advanced (do not re-open casually)

- Program Ledger core + Postgres store + hierarchy + capability-grant dispatch gate.
- Factory-catalog Phase 3 objects (Kit, Tier, Foundation, Design, Components, Spec, Adaptation, Assembly, Promotion) + three Ledger executors.
- Phase 4 first slices (proof levels, inventory snapshot, foundation matching, conversion lock, preview deployment, outcome record).
- Real CI gate (lint/typecheck/test); Next 16 / React 19 alignment; Dependabot triage on `development`.
- Tenant-isolation negative matrix (GAP-06) + RLS hardening follow-ups.
- ADR 0003 platform org model; `lsites_core` mirror retired.

Full narrative: `audit/14_implementation_roadmap.md`. Gap detail: `audit/09_gap_and_risk_register.yaml`.

---

## 1. Documentation cleanup — three new source-of-truth documents, legacy top-level docs archived — 2026-07-19

Following the same Principal-requested process already completed successfully for LiNKdeveloper on 2026-07-18 (see `linktrend/LiNKdeveloper` OPEN-ISSUES item #43), performed the documentation source-of-truth cleanup for **this** repository (`linktrend/LiNKsites`).

**New source-of-truth documents created** (drafted against the real code and the ingested 24-section Program Manual, cross-checked for factual accuracy — e.g. Promotion is draft-only; Traefik is the current deploy reverse proxy; factory-catalog/program-ledger test counts verified in-session):

- `docs/LINKSITES-INTENT.md` — why this Program exists, scope, out-of-scope, success criteria.
- `docs/LINKSITES-TECHNICAL-PRD.md` — exhaustive technical reference (architecture, terminology, M01–M20 lifecycle, preview/paid/recycle flows, CMS model, Supabase/RLS, hosting topology, LiNKplatform/LiNKautowork integration, package map, and a §12 table of factual discrepancies vs older docs).
- `docs/LINKSITES-OPERATIONS-MANUAL.md` — plain-English handbook for the Principal (non-technical audience).
- `docs/OPEN-ISSUES.md` — **this file** (created fresh; no prior root `OPEN-ISSUES.md` / `NEXT-STEPS.md` existed). Seeded from real audit/roadmap residuals, then this cleanup entry.

**Legacy top-level Program documentation archived to `docs/archive/`** (moved, not deleted; `docs/archive/README.md` explains supersession and links back to the 3 new documents + this file):

- `docs/archive/specs/linksites-program-manual/` (all 24 sections + MANIFEST) → `docs/archive/specs/linksites-program-manual/`
- `docs/archive/adr/` → `docs/archive/adr/`
- `docs/archive/ops/` → `docs/archive/ops/`
- `docs/archive/business/` → `docs/archive/business/`
- `docs/archive/policies/` → `docs/archive/policies/`
- `docs/archive/reference/` → `docs/archive/reference/`
- `docs/archive/BRANCHING_AND_DEPLOYMENT_POLICY.md` → `docs/archive/BRANCHING_AND_DEPLOYMENT_POLICY.md`
- `docs/archive/DOCUMENTATION_GOVERNANCE.md` → `docs/archive/DOCUMENTATION_GOVERNANCE.md`
- Prior `docs/README.md` index content superseded by root `README.md` + the three new docs (docs index rewritten to point at SoT).

Every in-repo cross-reference to these old **top-level `docs/`** paths (README, packages comments, supabase migration comments, `execution/`, `audit/` notes that cite paths) was updated to the new `docs/archive/...` path — verified zero dangling references remain to the moved top-level docs.

**Explicitly NOT archived / NOT touched, per the same scoping distinction used for LiNKdeveloper's Starter Kit:**

- Anything under `apps/*/docs/**` (CMS and web-master app-owned artifact docs, including their own `archived/` folders) — they belong to the apps being built, not to LiNKsites' Program description of itself.
- `.cursor/` rules/skills (shared symlink; out of scope).
- `supabase/migrations/**` content (aside from comment path updates where they cited archived docs).
- Root `audit/` and `execution/` working sets (engineering process artifacts; not Program narrative docs under `docs/`).

**`README.md` rewritten** (not archived — it's the repo's live entry point) to point at the 3 new documents + this file as source of truth, and to correct stale claims (e.g. `sites_specs/`, empty shared packages, docs index as primary authority).

**Verification performed for real after structural moves:** workspace `pnpm typecheck` / `pnpm test` (and build as applicable) — this was a pure documentation/file-organization pass; no product `apps/**/src` or `packages/**/src` logic was intentionally changed beyond comment path updates.

**What this deliberately does NOT do:** delete any archived document (moved only); touch `apps/*/docs/**`; invent a fake “factory complete” claim; resolve GAP-33/23/50 by documentation alone.
