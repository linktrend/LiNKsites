# 01 — Scope, Snapshot, and Method

**Audit type:** Combined Trigger 2 (PRD-clarification) + Trigger 3 (existing-repository assessment), executed per LiNKsites Program Manual Section 24 (§§2–53).
**Auditor:** Cursor agent session (LiNKdeveloper system only), read-only.
**Date:** 2026-07-13.
**Authority order applied:** Carlos's explicit decisions → LiNKsites Program Manual (this ingested copy) → approved ADRs post-dating it (none found) → verified repo/deployment evidence → older PRDs/notes as historical evidence only.

## Scope actually covered

- **In scope, fully inspected:** `/Users/linktrend/Projects/LiNKsites` monorepo — `apps/cms`, `apps/web-master`, `apps/web-company`, `packages/*`, `supabase/`, `deploy/`, `tooling/`, `scripts/`, `sites_specs/`, `sites_projects/`, `docs/`, `.github/workflows/`, root config.
- **In scope, partially inspected (network-available, read-only):** GitHub Actions run history via `gh run list` (available — authenticated as `linktrend`), repository branches/remotes.
- **Noted but not reachable (cross-Program repos):** LiNKtrend Sales repo, Odoo adapter repo(s), LiNKautowork/n8n deployment, OpenClaw deployment, GSM secret contents, live Supabase project, live VPS/Cloudflare/Traefik state, Payload production database. These are recorded as `unknown` / `configured-unverified` in the registries — not assumed working or absent.
- **Explicitly out of scope for this pass:** IDE Development workspace's own LiNKaios/LiNKbrain/LinkSkills repos (referenced only where LiNKsites doctrine touches them).

## Method

1. Ingested the 24-section Program Manual verbatim into `docs/specs/linksites-program-manual/` (Step 0), verified byte-identical via `diff`, recorded SHA-256 digests in `MANIFEST.csv`/`MANIFEST.md`.
2. Read manual Section 24 (repository-audit doctrine itself) in full directly.
3. Delegated full-text extraction of Sections 01–23 to four parallel read-only sub-agents (grouped 01–06, 07–12, 13–18, 19–23), each instructed to cite section numbers for every claim and flag repo-reconciliation risks. Outputs retained as source evidence for this audit (§53 traceability inputs).
4. Delegated a fifth read-only sub-agent to perform an exhaustive repository walk (directory inventory, package/dependency inventory, Payload/Supabase/frontend audit, docs audit, test audit, secrets-pattern scan, cross-program grep) under Ask-mode (no write, no destructive shell).
5. Personally ran additional read-only shell diagnostics the sub-agent could not run in Ask mode: `git status --short --branch`, `git log --oneline`, `git ls-files | grep -i env`, `gh auth status`, `gh run list`.
6. No file was deleted, renamed, moved, or rewritten. No branch was merged. No credential was rotated. No production system was queried or changed. This document set is the only new material added to the repository (under `docs/specs/` and `audit/`).

## Snapshot (reproducible baseline)

| Field | Value |
|---|---|
| Repository | `github.com/linktrend/LiNKsites` |
| Current branch at audit time | `issue/wave9-linksites-prod` |
| Current branch HEAD | `81ca516` — "feat(deploy): Wave 9 CMS Docker and wildcard preview routing" |
| `development` HEAD | `08a1719c0db7233339ec35e79a1526fcaa83be2d` |
| `staging` HEAD | `e7336be0a44267d24c16f3fd44298ea87e8eef21` |
| `main` HEAD | `e7336be0a44267d24c16f3fd44298ea87e8eef21` (same as staging) |
| Working tree | **NOT clean** — 1,314 deleted paths, 30 modified paths, 4 untracked paths (uncommitted). See §13 Decision/Contradiction Register, item DR-01. |
| Tracked `.env`-pattern files | Only `*.env.example` files (6 total); no real `.env` tracked in git history at HEAD. |
| Local untracked `apps/cms/deploy/prod/.env` | Present on disk, gitignored — not inspected for contents (secret-value handling rule). |
| CI (`gh run list`, last 15) | "CI" workflow on `development` = placeholder step only, passing trivially. CodeQL scheduled scans on `main` = passing. Dependabot update PRs = repeatedly failing (js-yaml, @babel/core, ws, undici). |
| pnpm / Node toolchain | `pnpm@10.0.0`, Turbo `^2.5.6`, workspaces `apps/*`, `packages/*` |
| Manual version audited against | LiNKsites Program Manual, ingested copy at `docs/specs/linksites-program-manual/`, manifest SHA-256 digests in `MANIFEST.csv` (this session, 2026-07-13) |

## Explicit limitations of this audit pass

- No access to LiNKtrend Sales, Odoo, Stripe (live), n8n runtime, OpenClaw, or any production VPS/Cloudflare/Traefik console — all cross-Program and hosting-runtime findings are therefore `configured-unverified` or `unknown`, never asserted as `verified-working`.
- GitHub Actions history for `main`/`development` was inspected via `gh run list`; individual failing-workflow root-cause logs were not deep-dived line-by-line (time-boxed) — flagged as a Phase 0 follow-up, not a blocker.
- Supabase and Payload were inspected via repository code/migrations/schema only — no live database connection was opened. Live RLS enforcement, actual row counts, and live secret rotation state are unverified.
- Read-only Ask-mode sub-agent could not run `git status`/`git log`; those checks were completed directly by the primary agent afterward (see snapshot table above) and are authoritative for this report.
