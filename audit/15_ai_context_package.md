# 15 — AI Context Package (per manual §55)

This package is written so a future implementation AI (with no access to this chat) can resume work correctly.

## What this package contains, and where to find the rest

- **The complete manual:** `docs/archive/specs/linksites-program-manual/01_*.md` through `24_*.md`, verbatim, in order, with `MANIFEST.md`/`MANIFEST.csv` for integrity verification.
- **Audit snapshot and registries:** `audit/01_scope_snapshot_and_method.md` through `audit/04_data_and_storage_registry.yaml`.
- **Current and target architecture:** `audit/05_current_architecture.md`, `audit/06_target_architecture.md`.
- **Traceability Matrix (representative, not exhaustive — see caveat below):** `audit/07_requirements_traceability.csv`.
- **Decision/contradiction register:** `audit/13_decision_and_contradiction_register.md` — **read this before writing any code**; DR-01 through DR-05 are unresolved and materially affect what is safe to touch.
- **Gap/risk register:** `audit/09_gap_and_risk_register.yaml`.
- **Repository-specific instructions:** see "Repository-specific notes" below.
- **Approved roadmap and pilot scope:** `audit/14_implementation_roadmap.md` — pilot scope is *proposed*, not yet Carlos-approved as of this writing.
- **Test/CI baseline:** `audit/11_test_ci_and_release_baseline.md`.
- **Environment and secret-reference map without values:** see "Secrets" below — no values are anywhere in this package.
- **Known blockers and approvals needed:** see "Blockers requiring Carlos" below.
- **Definition of Ready and Done:** verbatim in manual §75-§76 (`docs/archive/specs/linksites-program-manual/24_*.md`); do not paraphrase or weaken these when writing work packets.

## Traceability Matrix caveat

`audit/07_requirements_traceability.csv` is a **representative sample** covering every Module and every audit domain named in the manual, not an exhaustive row-per-acceptance-criterion matrix (which would run to several hundred rows across Sections 1-23). The four section-group extraction reports produced during this audit (referenced in `evidence_manifest.yaml`, EV-06 through EV-09) contain much more granular capability_id lists, object schemas, and section-level citations than made it into the CSV. A future audit pass should expand the CSV using those extraction reports as raw material before treating manual §98 checklist item 5 ("All Sections 1-23 acceptance criteria appear in the Traceability Matrix") as fully satisfied.

## Repository-specific notes

- **Monorepo:** pnpm workspace, Turbo build graph, workspaces = `apps/*`, `packages/*`.
- **Do not treat `sites_specs/` or `sites_projects/` as authoritative production data** — they are narrative/legacy, per `audit/12_reusable_asset_register.yaml`.
- **`apps/cms`** is the most mature asset — read `apps/cms/src/payload.config.ts`, `apps/cms/src/access/index.ts`, and `apps/cms/src/collections/` before touching anything there.
- **`apps/web-master`** is the primary shared frontend — `src/lib/site-context.ts` is the hostname→Site-ID resolution logic; `src/templates/registry.ts` is the (currently single-entry) template registry; `src/components/page-renderer.tsx` + `src/cms/blocks/index.ts` is the closest existing thing to a Site Assembly Engine.
- **`apps/web-company`'s** purpose is unresolved (DR-02) — do not invest further in it until that decision is made.
- **The working tree is not clean** (DR-01) — before running any tooling that assumes a clean tree (rebase, certain codegen, certain linters with auto-fix), check `git status` again, since this audit's snapshot may be stale by the time you read this.

## Secrets (references only, no values, per manual §9/§55)

- Intended mechanism: Google Secret Manager, rendered to runtime env via `apps/cms/ops/render-runtime-env-from-gsm.sh`. Naming convention per always-applied workspace rule: `LINKTREND_[SERVICE]_[ENV]_[RESOURCE]_[IDENTIFIER]`.
- Local dev/deploy uses `.env`/`.env.example` files; only `.env.example` (placeholder-only) files are tracked in git.
- Do not add any real secret value to any file under `docs/specs/`, `audit/`, or any Markdown/YAML deliverable.

## Blockers requiring Carlos (explicit, per manual §55/§6.14)

1. **DR-01:** Resolve the uncommitted framework-migration restructuring (commit and finish, or revert).
2. **DR-02:** Clarify `apps/web-company`'s intended role.
3. **DR-03:** Decide whether LiNKsites' external side effects must route through LinkSkills capability leases, given the manual's stated independence from LiNKaios.
4. **DR-04:** (Lower urgency) Decide if/when LiNKsites' Program/Module vocabulary needs a mapping to LiNKaios's Suite/Project vocabulary.
5. **GAP-33/34/35 (blocker):** Provide access to (or a coordinated audit of) the LiNKtrend Sales and Odoo-adapter repositories before Phase 5 can be scoped with confidence.
6. **Pilot slice:** Approve or redirect the proposed pilot slice in `audit/14_implementation_roadmap.md` (vertical, tier, region, payment path).
7. **Live environment check:** Grant access (or perform personally) a live check of the actual Supabase project's RLS/grant state, per manual §47's presumptive-release-blocker rule — this audit had no live database connection.

## Definition of Ready / Done reminder

Per manual §75-§76: no Issue is Ready without clear acceptance criteria, known target paths, available/mocked dependencies, security/tenant classification, a defined test method, and no unresolved blocker that would make implementation speculative. No Issue is Done merely because an agent says it is complete — CI must pass at the snapshot commit, tenant-negative tests must pass, and Traceability Matrix/evidence must be updated. Apply this literally to every future work packet derived from this audit.
