# 14 — Implementation Roadmap (Evidence-Driven, per manual §58-§72)

This restates the manual's own phase doctrine (§60-§70) filtered through this audit's actual findings — it does not invent new phases. Each phase lists what this audit found already true, what remains, and the exit gate from the manual verbatim-in-substance.

## Phase 0 — Audit, containment, and baseline — **substantially executed by this session**

- Done: registries, current/target architecture, traceability sample, capability status, gap/risk register, security findings, test/CI baseline, reusable-asset register, decision/contradiction register (this document set).
- Remaining before Phase 0 can formally close: (a) Carlos resolves DR-01 through DR-05; (b) a live check of the Supabase project's actual RLS/grant state and any pre-existing security findings (manual §47 presumptive-blocker rule) — not reachable in this session; (c) confirm no unresolved data exposure exists in whatever environment is used for the pilot.
- **Exit gate status:** Not yet closable — blocked on the above three items, all of which require either Carlos or live-environment access this session did not have.

## Phase 1 — Canonical contracts and repository foundations — **in progress**

- Establish repository ownership/contribution rules (partially exists via `branch-source-policy.yml` — reuse).
- **DONE (2026-07-13):** Fixed the CI placeholder (GAP-39) — `ci.yml` now runs a real
  `pnpm install` + `lint` (cms, web-master) + `typecheck` (all workspaces) gate. While doing
  this, discovered and partially fixed two related pre-existing bugs:
  - `apps/web-master`'s `next lint` script was silently broken (Next.js 16 removed that
    subcommand) because of GAP-44 below — fixed by switching to `eslint src` directly, plus
    fixing two real pre-existing lint errors it had been hiding.
  - Confirmed `apps/cms`'s `test:int` Vitest suite currently fails at module-resolution
    before any test runs (GAP-43) — intentionally left OUT of the new CI gate rather than
    included as a guaranteed-red or silently-skipped step; needs its own follow-up work packet.
  - Discovered GAP-44: a dependency-override cascade bug silently force-upgrades every app to
    Next.js 16.2.2 regardless of declared version — this is now the highest-priority Phase 1
    technical item, since it already broke tooling once and its full blast radius on
    `apps/web-master`/`apps/web-company` runtime behavior is unverified.
  - `apps/web-company`'s lint remains out of CI scope per Decision DR-02 (paused) and because
    it has no `eslint` devDependency installed at all (separate pre-existing gap, not yet filed
    as its own GAP — low priority given DR-02).
- **Also DONE (2026-07-13, same work packet, discovered via the first real GitHub Actions run):**
  fixed a genuine pre-existing `apps/cms/src/utils/seo.ts` type error (an already-written but
  unused `readMediaUrl()` helper was wired in to correctly normalize `ogImage`), and confirmed
  the new CI gate (lint: cms+web-master; typecheck: cms+types+web-company) is **actually green**
  on GitHub Actions for PR #38, not just passing locally.
- **Discovered GAP-45** while doing this: `apps/web-master`'s typecheck fails with ~13 real
  errors because its code calls Next.js's `cookies()`/`headers()` synchronously (correct for its
  declared Next 14.2.33) but the app actually runs Next 16.2.2 (GAP-44), where those APIs became
  async. `apps/web-master`'s typecheck is excluded from the CI gate until this migration is done
  — this is real, separate work, not something to rush through inside a CI-gate fix.
- **DONE (2026-07-13, PR #39):** Resolved GAP-44/GAP-45 together — accepted Next.js 16.2.2 as
  the real target for every app (rather than fighting the override cascade to force a
  downgrade), migrated `apps/web-master`'s `cookies()`/`headers()`/`params` call sites to the
  async App Router API, updated declared `next` versions in all three apps' `package.json` to
  match reality, and re-included `apps/web-master` in the CI typecheck gate (verified green
  locally with a clean `.next`, matching a fresh CI checkout).
- **Discovered GAP-46** while doing this: `next build` for `apps/web-master` still fails on a
  React 18 vs React 19 `@types/react` mismatch surfaced by Next 16's internal route-type
  checking (not caught by plain `tsc --noEmit`). This is a real, separate version-alignment
  decision (React 19 upgrade vs. pinning Next to a React-18-compatible release) — intentionally
  not forced through inside the GAP-44/45 fix. `next build` remains out of the CI gate.
- **Next Phase 1 items, not yet started:** resolve GAP-46 (React 18/19 alignment, needed before
  `apps/web-master` can actually be built/deployed); resolve GAP-43 (test:int module
  resolution); diagnose/fix the Dependabot failure pattern and the 222-vulnerability finding
  (GAP-42, GAP-11); establish schema/contract versioning conventions.
- Define versioned schemas/generated types for Site Specification, Vertical Kit, Tier Specification (currently absent) before any code is written against them.
- Resolve DR-03 (LinkSkills capability-lease boundary) — this materially changes how every subsequent Phase's work packets must be scoped.

## Phase 2 — Program core and governed execution — **not started (largest single gap: GAP-01, GAP-31)**

- No Program Ledger, Issue/Run/Gate model, executor registry, or idempotency/outbox pattern exists. This is genuinely greenfield work inside this repository, even though it is not a greenfield *product* (the CMS and frontend already have real value).
- Recommended: build this as its own package/service (e.g. `packages/program-ledger` or a new `apps/ledger`), backed by the Supabase working layer, rather than scattering Issue/Run state across Payload hooks or n8n.

## Phase 3 — Reusable asset and assembly foundation — **partially seeded**

- Component documentation (`apps/web-master/docs/components/index.json`) and design tokens (`tokens.css`) are real seeds — adapt, don't rebuild.
- Vertical Kit, Tier Specification, Design Intelligence Catalog, Reusable Site Foundation objects are all absent as machine objects and must be built (GAP-11, GAP-12, GAP-09/10, GAP-13).
- Promotion Service (GAP-04) must be built before this phase's exit gate ("deterministic assembly produces valid sites from versioned specifications") can be met.

## Phase 4 — Build-first preview path — **not started**

- Depends entirely on Phase 2 (Program Ledger) and Phase 3 (Vertical Kit/Tier/Foundation) being real. No Preview Inventory, Proof Level engine, or conversion-lock mechanism exists today (GAP-16, GAP-17).

## Phase 5 — Commercial and paid-activation spine — **blocked on cross-Program access (GAP-33/34/35, blocker)**

- Zero Stripe/Odoo/Integration Ledger code exists in this repo (the only Stripe code found is in the retired `sites_projects/old_linktrend`). This phase cannot be estimated with confidence until the Sales/Odoo repositories are reachable for a coordinated audit — flagged explicitly as a blocker requiring Carlos, per manual §6.14.

## Phase 6 — Customer finalization and production launch — **not started**, depends on Phase 5.

## Phase 7 — Autonomous hosting and lifecycle operations — **not started**; Traefik/Docker scaffolding (Wave 9) is a real, adaptable seed, but monitoring/backup/restore/incident machinery is entirely absent (GAP-23, GAP-24, both Critical).

## Phase 8 — Observability, economics, and OpenClaw oversight — **not started**; no OpenTelemetry/Langfuse/cost-accounting code found anywhere.

## Phase 9 — Controlled pilot and stabilization — **not reachable** until Phases 0-8 close their exit gates.

## Phase 10 — Expansion and regional scaling — **not reachable** yet; correctly, no premature capacity/regional commitments (e.g. "20 sites per VPS") were found hard-coded anywhere as binding logic — the manual's own warning about this figure is respected by omission (there is no capacity logic at all yet).

---

## Approved pilot slice (manual §71 — Decision DR-06, approved by Carlos, 2026-07-13)

- **SMB vertical: Home Services** (e.g. plumbing, HVAC, electrical, landscaping, cleaning — exact sub-vertical boundary to be defined when the Home Services Vertical Kit is built in Phase 3).
- **Primary tier: Standard** — the most constrained/deterministic tier, requiring the least new capability-building (no dedicated frontend runtime, no custom component variation).
- **One hosting region / one payment path / one Odoo mapping:** Not yet chosen — deliberately deferred, non-blocking. Recommend the *simplest possible* single choice for each when Phases 3/5 are reached, so the pilot proves the pipeline, not infrastructure breadth.
- **Recommended first concrete milestone (not a phase, a checkpoint):** get one synthetic (non-real-customer) Home Services / Standard Site Specification through Foundation → Preview → (simulated) Activation → Launch Certificate end-to-end using `apps/cms` + `apps/web-master` as they exist today, with a minimal (not full) Program Ledger — this would validate the two most mature existing assets while building only the minimum new governance scaffolding needed to prove the pipeline shape, ahead of investing in the full Program Ledger.

## What the implementation AI should do next (manual §54's required content)

1. Wait for Carlos's decisions on DR-01 through DR-05 and on the pilot-slice questions above — do not guess these.
2. Once decided, start with the smallest, highest-value Phase 1 items (fix `ci.yml`, resolve DR-05, establish schema/contract versioning conventions) — these are safe, bounded, and improve every subsequent phase's velocity.
3. Do not begin Phase 2 (Program Ledger) or any customer-facing feature work until Phase 0's remaining blockers (live Supabase security check, DR resolutions) are closed.
4. Treat GAP-33/34/35 (Sales/Odoo/Stripe integration) as explicitly deferred until those repositories are reachable for a coordinated audit — do not build a guessed Odoo Adapter against assumed schemas.
