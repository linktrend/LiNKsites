# 13 — Decision and Contradiction Register

> **Update, 2026-07-13 (same day, follow-up session):** Carlos reviewed DR-01 through DR-04 and the
> proposed pilot slice and made the decisions recorded inline below (search "**Carlos's decision**").
> A new item, **DR-06 (pilot slice)**, has been added for the vertical/tier decision — the original
> executive-summary "Decision 5" text used the label "DR-05" informally, but DR-05 in this register was
> already assigned to the Next.js/React version-skew item (still open, deferred to the roadmap). To
> avoid ambiguity, the pilot-slice decision is filed as **DR-06**.

Per manual §20 (contradiction handling) and the task's Step 2: both claims are recorded, dated where possible, tested against actual behavior where possible, and the manual's authority order is applied. Nothing is resolved silently in either direction — each item ends in either an applied-doctrine resolution (explicitly marked) or an open decision requiring Carlos.

---

## DR-01 — Large uncommitted working-tree restructuring (framework migration)

- **Claim A (repository evidence):** The working tree on branch `issue/wave9-linksites-prod` shows 1,314 uncommitted deletions covering the entire embedded `LiNKdev/` factory (`AGENTS.md`, `factory/`, `product/`, `skills/`), `.agent/` (agents + skills), `.codex/skills/`, and the repo-local `.cursor/{rules,skills,commands,agents}` directories, plus `.github/workflows` appearing in the deletion list. `.cursor` now appears as an untracked symlink pointing to `../IDE Development/.cursor`. 30 files are modified (mostly `apps/web-master` route/page files plus `deploy/docker-compose.deploy.yml`, `deploy/docker/cms.Dockerfile`, two docs files, root `README.md`). 4 paths are untracked (`.cursor` symlink, `apps/web-master/src/lib/route-params.ts`, `docs/policies/UI_TEMPLATE_POLICY.md`, `docs/specs/` — the last of which is this audit's own manual ingestion).
- **Claim B (workspace rules):** This session's always-applied workspace rules describe a deliberate program of sharing `.cursor/rules/05-agent-behavior.mdc` and `AGENTS.md` across LiNKtrend repos "so Cursor/Codex/Antigravity behave consistently," and describe `LiNKdev/` as a "portable install" pattern with its own bootstrap/versioning conventions — consistent with a repo moving from an embedded, per-repo agent framework to a shared one.
- **Authority order applied:** Repository evidence (git working tree) is the ground truth for *what currently exists on disk*; it cannot by itself establish *intent* or *completion state*. The workspace rules establish plausible intent but do not confirm this specific change was authorized or is finished.
- **Resolution:** **Not resolved by this audit.** This is exactly the kind of uncommitted, in-progress structural change manual §5 forbids an auditor from touching ("do not delete, move, rename, archive, or rewrite repositories or files") and §20 requires be surfaced, not silently completed or reverted.
- **Decision required of Carlos:** Confirm whether this framework-migration restructuring should be (a) committed as-is, (b) completed further before committing, or (c) reverted. Until confirmed, no future agent session should assume `.cursor/`, `.agent/`, `LiNKdev/`, or the 30 modified `apps/web-master` files are in a stable, reviewable state.
- **Severity:** Medium (operational/process risk, not a security or data-loss risk on its own).
- **Carlos's decision (2026-07-13):** Finish and commit it.
- **Resolution executed:** The framework-restructuring changes (deletion of `.agent/`, `.codex/skills/`, `LiNKdev/`, root `AGENTS.md`, `.cursor/{rules,commands,skills,agents}`, `.github/workflows/linkdev-guard.yml`; addition of the `.cursor` symlink to `../IDE Development/.cursor`) were isolated from the unrelated in-progress `apps/web-master`/`deploy`/`docs` edits, cherry-picked cleanly onto `development`'s tip on branch `dev/blackcursor/defactor-linkdev-embedded-framework`, and opened as **PR #36** (`chore(repo): defactor embedded LiNKdev factory and per-repo agent framework`), deliberately kept separate from the open Wave 9 deploy PR (#31) to avoid mixing unrelated concerns. The unrelated `apps/web-master`/`deploy`/`docs` in-progress edits remain untouched, uncommitted, on `issue/wave9-linksites-prod`, exactly as they were before this resolution — not part of this decision.
- **Follow-up:** PR #36 needs Carlos's or the Integrator's merge approval into `development` per the repo's branch policy. GitHub also reported 222 Dependabot vulnerability findings (6 critical, 85 high, 100 moderate, 31 low) on the default branch while pushing this branch — unrelated to this PR's diff, logged as a new Phase 1 finding (see `09_gap_and_risk_register.yaml`, GAP-42).
- **Status:** **Resolved and executed.**

---

## DR-02 — `apps/web-company` purpose is undefined against manual doctrine

- **Claim A (repository evidence):** `apps/web-company` exists as a second, less-mature Next.js template with no hostname-based tenant resolution and a stub content client, seemingly overlapping `apps/web-master`.
- **Claim B (manual doctrine):** Manual §07.2 favors one shared frontend runtime with tenant/site resolution over customer-specific forked apps; manual §03 mentions a "dedicated frontend runtime" specifically for the Enterprise tier as a *possible*, separately-priced/approved exception, not a default second template.
- **Claim C (workspace rule, `.cursor/rules/10-foundation.mdc`):** Describes "Shared platform (many hostnames, one runtime) vs premium dedicated frontends" as two legitimate modes.
- **Authority order applied:** The workspace rule (Claim C) plausibly reconciles Claims A and B — `web-company` may be the intended Enterprise-tier dedicated-runtime template referenced in manual §03 — but no repository evidence (docs, comments, naming convention, tier mapping) confirms this interpretation.
- **Resolution:** **Not resolved by this audit** — recorded as an open question, not guessed.
- **Decision required of Carlos:** Confirm whether `apps/web-company` is the Enterprise-tier dedicated-frontend template, an abandoned early prototype, or something else; decide whether it should continue receiving investment in Phase 3+.
- **Severity:** Medium.
- **Carlos's decision (2026-07-13):** `apps/web-company` was originally intended as a special-case build of the **LiNKtrend company's own website** (not an Enterprise-tier customer template, and not a generic factory template as its README currently implies). It may already be partially finished. It should be **set aside (paused), not deleted** — it might be completed later.
- **Resolution executed:** Added `apps/web-company/STATUS.md` documenting this special-case status and a clarifying note at the top of `apps/web-company/README.md`, so no future session mistakes it for an active customer-factory template or deletes it. No code was removed; the app is explicitly out of scope for further customer-factory investment (Vertical Kit/Tier/multi-tenancy wiring) until Carlos revisits it.
- **Status:** **Resolved.**

---

## DR-03 — LiNKaios/LiNKbrain/LinkSkills ecosystem rules vs. the LiNKsites Program Manual's independence doctrine

- **Claim A (LiNKsites Program Manual, §01/§02/§24 §4):** "LiNKaios is postponed and not a LiNKsites dependency." "OpenClaw is an external oversight adapter, not the runtime/control plane." LiNKsites must operate independently of LiNKaios.
- **Claim B (always-applied IDE Development workspace rules, e.g. `02-ecosystem-boundaries.mdc`, `04-mvo-scope-and-stubbing.mdc`):** Describe LiNKaios as the "organizational execution control plane," require "All external side effects" to be "governed through LinkSkills capability leases," and treat LiNKsites/LinkSites as a suite operating inside the broader LiNKaios/LiNKbrain/LinkSkills MVO ecosystem with mandatory Supabase/Zulip/Plane infrastructure and lease/audit/trace proof on every side-effecting step.
- **Authority order applied:** Per manual §24 §3, "Older material does not override the manual merely because it is implemented in code" — but this is not older material, it is a *concurrently applicable, always-applied workspace rule set* for a *different, sibling repository* (`IDE Development`) that this LiNKsites repo's own rules (`.cursor/rules/00-identity.mdc` in LiNKsites) partially mirror in simplified form. This is a genuine doctrine tension between two authoritative-sounding sources at different scopes, not a simple older-vs-newer conflict.
- **Resolution:** **Not resolved by this audit.** Flagged as a decision/architecture question, consistent with the Program Manual's own instruction (§02 audit item, extraction report #6 from sections 07-12) that LinkSkills capability-lease integration is not described anywhere in the LiNKsites-internal sections and needs explicit reconciliation rather than being assumed.
- **Decision required of Carlos:** Decide whether every LiNKsites external side effect (Payload publish webhooks, n8n triggers, future Stripe/Odoo calls, media-generation provider calls) must be wrapped in a LinkSkills capability lease as the IDE Development ecosystem rules require, or whether LiNKsites' documented independence from LiNKaios (manual §01/§02) exempts it, in whole or in part, from that requirement. This materially affects the shape of every Phase 2+ work packet.
- **Severity:** High (architecture-shaping; affects most future implementation work).
- **Carlos's decision (2026-07-13):** Agreed with the audit's recommendation — LiNKsites is **exempt for now**, using its own lighter-weight logging/governance instead of full LinkSkills capability leases, to be revisited once LiNKsites has built its own Program Ledger (Phase 2).
- **Resolution executed:** Recorded as `docs/adr/0002-linkskills-capability-lease-exemption.md`, including the explicit revisit trigger (Phase 2 completion of the Program Ledger).
- **Status:** **Resolved (interim; scheduled revisit at Phase 2).**

---

## DR-04 — Terminology drift: manual's Program/Module/Stage/Issue/Run vs. LiNKaios-approved Suite/Module/Project/Phase/Issue/Assignee/Run vocabulary

- **Claim A (LiNKsites Program Manual):** Uses "Program → Modules → Stages → Issues → Runs" throughout, with LiNKsites itself as one Program decomposed into 20 Modules (M01-M20).
- **Claim B (always-applied `07-suite-project-terminology.mdc`):** Establishes a Principal-approved hierarchy of "Suite → Module → Project → Phase → Issue → Assignee → Run" for LiNKaios-facing UI and explicitly forbids "Mission," "Execution," and reintroducing certain legacy terms in new user-facing copy.
- **Authority order applied:** These describe two different systems' internal vocabularies (LiNKsites' own Program-internal execution grammar vs. LiNKaios' user-facing suite/project hierarchy) and are not necessarily in direct conflict — but no mapping between them exists anywhere in either source, and one extraction report explicitly flagged this as undefined (Sections 07-12 report, item #12).
- **Resolution:** **Not resolved by this audit** — the manual's own vocabulary is used verbatim throughout this audit's deliverables, per the instruction that the manual takes precedence for LiNKsites-specific work, but this mapping gap is surfaced for the same reason as DR-03.
- **Decision required of Carlos or an approved ADR:** Whether LiNKsites Modules/Stages/Issues will ever need to be projected into LiNKaios's Suite/Project/Phase vocabulary for cross-system visibility, and if so, the exact mapping.
- **Severity:** Low-medium (does not block Phase 0/1 work, but should be settled before any LiNKaios-facing dashboard surfaces LiNKsites data).
- **Carlos's decision (2026-07-13):** Define the mapping now, and follow the manual (i.e., the LiNKsites-internal vocabulary remains authoritative for LiNKsites-internal work; the LiNKaios vocabulary is used only at a future presentation/reporting boundary).
- **Resolution executed:** Recorded as `docs/adr/0001-program-vocabulary-mapping.md`, including a full concept-by-concept mapping table and an explicit warning about the Run-granularity mismatch (LiNKsites' Issue-level Run vs. LiNKaios' Project-level Run/Cycle) that any future reporting adapter must respect.
- **Status:** **Resolved.**

---

## DR-05 — Version skew across Next.js/React in one monorepo — SUPERSEDED by a Phase 1 finding

- **Claim A (original repository evidence, based on declared `package.json` versions):** `apps/cms` runs Next.js 16.1.0/React 19.1.0; `apps/web-master` runs Next.js 14.2.33/React 18.3.1; `apps/web-company` runs Next.js 14.0.0/React 18.2.0.
- **Claim B (manual §07.10):** Recommends a consistent Next.js/React/Tailwind/shadcn-compatible stack posture "pending audit confirmation."
- **Original resolution:** Deferred to the roadmap as an unaddressed drift.
- **Superseding finding (2026-07-13, Phase 1 first work packet):** Claim A was based on *declared* versions only. The *actually-installed* Next.js version in every app is uniformly **16.2.2**, due to a dependency-override cascade bug in the root `package.json`'s `pnpm.overrides` block (full detail in `05_current_architecture.md`, "Version-skew finding — CORRECTED"). There is no real cross-major version skew today — there is a more serious, previously-hidden bug where two apps silently run a Next.js major two versions newer than what their own `package.json` declares, which already broke their lint tooling (fixed in this same Phase 1 work packet) and may have other undiscovered consequences (e.g. removed/changed APIs between Next 14 and Next 16 that `apps/web-master`/`apps/web-company` code may unknowingly depend on the *old* behavior of).
- **Decision required:** Whether to (a) rewrite the `pnpm.overrides` ranges to be same-major-scoped so each app's declared version is respected, then deliberately choose/upgrade each app's target major, or (b) accept that all apps are on Next 16 today, update their `package.json` `next` fields to reflect reality, and audit each app's code for Next-16-breaking-change exposure. Not decided here — logged as GAP-44, recommended as an early Phase 1 priority given it already broke lint tooling once.
- **Severity:** Upgraded from Medium to **High** given the confirmed real breakage already found.

---

## DR-06 — Pilot slice (SMB vertical + tier)

- **Question posed:** Manual §71 requires a deliberately narrow first pilot — one SMB vertical, one primary tier, one region, one payment path, one Odoo mapping — decided by Carlos, not guessed by an AI.
- **Carlos's decision (2026-07-13):** **Home Services** vertical, **Standard** tier.
- **Resolution executed:** Recorded in `audit/14_implementation_roadmap.md` (Proposed Pilot Slice section, now marked Approved) as the approved pilot scope. This unblocks Phase 3 (Vertical Kit/Tier Specification build for Home Services/Standard) once Phase 1/2 foundations exist. Region, payment path, and Odoo mapping remain to be chosen (simplest available option recommended, per the roadmap) — not blocking, since no Vertical Kit or commercial-spine work has started yet.
- **Status:** **Resolved (vertical + tier); region/payment-path/Odoo-mapping still to be picked at Phase 3/5, non-blocking.**

## DR-07 — Clarification: "LiNKdev" vs. "LiNKdeveloper", and a self-inflicted symlink regression

- **Clarification from Carlos (2026-07-14):** "LiNKdev" (the embedded factory removed per DR-01,
  PR #36) and "LiNKdeveloper" (the shared execution-doctrine system living in `IDE Development`,
  wired into this repo via the `repo/.cursor` symlink) are two distinct things and must not be
  conflated. LiNKsites should actively use LiNKdeveloper's rules, agents, skills, and procedures
  (`.cursor/execution/`, `.cursor/agents/`, `.cursor/commands/`, `.cursor/skills/` — all reachable
  through the symlink) for its own development work going forward.
- **Self-inflicted regression found and fixed:** during DR-01's implementation (branch-switching
  between `issue/wave9-linksites-prod` and the defactor branch inside git worktrees), a `git
  checkout` operation had inadvertently restored `.cursor` (and `.agent/`, `.codex/`, `LiNKdev/`,
  `AGENTS.md`) to their old tracked, present state in the main workspace's local working tree —
  silently undoing part of the pre-existing uncommitted LiNKdev-removal work that was already
  present before this session began, and leaving the `.cursor` symlink to `IDE Development` (the
  actual LiNKdeveloper wiring) missing from the local working tree even though PR #36 correctly
  captures the intended removal on its own branch.
- **Resolution executed (2026-07-14):** re-ran the sanctioned `IDE Development/scripts/wire-repo.sh`
  wiring script (not a manual `ln -s`) against the LiNKsites repo; it reported `PASS` on every
  check (symlink resolution, `.cursor/README.md`, `.cursor/execution/INDEX.yaml`,
  `.cursor/templates/INDEX.yaml`, `.cursor/commands/INDEX.yaml` all reachable). Also found and
  reverted two small stray edits that had leaked into the main workspace early in this session
  (duplicates of fixes already correctly committed on PR #38's branch) during initial local
  testing before this session had adopted the worktree-per-branch discipline used for the rest of
  the session.
- **Status:** **Resolved.** The main workspace's `.cursor` now correctly resolves through the
  symlink chain (`LiNKsites/.cursor -> IDE Development/.cursor -> IDE Development/core`), verified
  by the wiring script.

## DR-09 — Repository cleanup: removing/archiving content unrelated to LiNKsites' intent

- **Instruction from Carlos (2026-07-14):** After confirming there was little further engineering
  buildable without live Stripe/Odoo/Supabase access, Carlos instructed: clean up the repository
  of content that does not relate to the LiNKsites Program Manual's intent, then do a
  hardening/testing pass, before moving to the Supabase and Odoo integration work.
- **Scope of this cleanup batch (2026-07-14):**
  1. Deleted four empty, zero-usage scaffold packages (`packages/blocks`, `packages/config`,
     `packages/ui`, `packages/utils` — see `audit/12_reusable_asset_register.yaml`,
     `asset-empty-scaffold-packages`).
  2. Deleted `library/README.md`, a documentation index whose links were already broken/pointing
     at nonexistent paths (see `asset-stale-library-index`).
  3. Archived (not deleted) `sites_specs/*.txt`, `docs/product/*.md` (4 files), and 5 of the 9
     `docs/reference/*.md` files into `archive/pre-manual-planning-docs/`, per the rationale and
     full accounting in that archive's own `ARCHIVED.md`. This executes the disposition already
     recorded (but not yet acted on) for `sites_specs` in the original Phase 0 audit
     (`asset-sites-specs-narrative-docs`).
  4. Deliberately did NOT archive or remove: `apps/web-company` (Carlos's DR-02 decision: paused,
     not deleted), the 4 still-useful `docs/reference/*.md` operational how-tos (DNS/Supabase/VPS/
     security), or any code under `apps/`, `packages/program-ledger`, `packages/factory-catalog`,
     `supabase/`, `execution/`, or `audit/`.
- **Deferred to a follow-up Issue, not done in this pass:** `apps/web-master/docs/` and
  `apps/cms/docs/` contain a large number of files matching an "agent session completion report"
  naming pattern (`AGENT_*_COMPLETE.md`, `WAVE_*_COMPLETION_REPORT.md`, `*_AUDIT_COMPLETE.md`,
  `FIXES_COMPLETED.md`, etc.) that appear to be stale build-process logs from whatever process
  originally built those apps, mixed in with genuine ongoing reference documentation
  (`ARCHITECTURE.md`, `CMS_SCHEMA.md`, `COMPONENT_LIBRARY.md`, etc.) in the same directories.
  Classifying which of ~90 files in each are process artifacts versus living reference requires
  reading each one individually — delegated to a dedicated subagent as a separate, careful pass
  (see `execution/modules/repo-hardening/issues/app-docs-cleanup-001/` once complete) rather than
  rushed in this same batch.
- **Status:** **Resolved for repo-root-level content; app-level `docs/` cleanup deliberately
  deferred to its own careful, separately-reviewed pass.**

## Summary table

| ID | Topic | Severity | Resolved? | Decision owner |
|---|---|---|---|---|
| DR-01 | Uncommitted framework-migration restructuring | Medium | **Yes — executed (PR #36)** | Carlos |
| DR-02 | `apps/web-company` purpose | Medium | **Yes — executed** | Carlos |
| DR-03 | LiNKaios/LinkSkills governance vs. LiNKsites independence doctrine | High | **Yes — interim (ADR 0002)** | Carlos |
| DR-04 | Program/Module vocabulary vs. Suite/Project vocabulary | Low-medium | **Yes (ADR 0001)** | Carlos |
| DR-05 | Next.js/React version skew | Medium | No — deferred | Implementation roadmap (Phase 1/3) |
| DR-06 | Pilot slice (vertical + tier) | High | **Yes — Home Services / Standard** | Carlos |
| DR-07 | LiNKdev vs. LiNKdeveloper clarification + symlink regression fix | Medium | **Yes — executed** | Carlos |
| DR-09 | Repository cleanup of content unrelated to LiNKsites' intent | Medium | **Partial — repo-root-level done; app-level docs deferred** | Carlos |
