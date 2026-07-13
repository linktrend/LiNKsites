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
- **DONE (2026-07-13, PR #40):** Resolved GAP-43 — `apps/cms`'s `test:int` Vitest suite was
  failing at module resolution for all 6 test files (a `vite-tsconfig-paths` workspace-wide
  tsconfig discovery bug matching the wrong project); fixed via a dedicated
  `tsconfig.vitest.json` plus a scoped `projects` option, alongside two smaller related fixes
  (a `DATABASE_URI`-required-at-import-time crash, and a jsdom/Node native-webstorage
  `localStorage` conflict). Suite now passes 18/19 tests (1 correctly skipped), 0 failures, and
  runs as part of the CI gate.
- **DONE (2026-07-13, PRs #41/#42):** Triaged all 222 Dependabot findings (GAP-42) and the
  repeated Dependabot Updates workflow failures (GAP-11/GAP-48). Fixed 4 of 6 CRITICAL findings
  directly (Payload pre-auth account takeover + a more serious internal Payload package-family
  version mismatch discovered along the way -> GAP-47; Vitest UI arbitrary file read; Next.js
  middleware auth bypass, covered by GAP-44/45); the remaining 2 critical findings and 66 of
  222 total findings are scoped to the retired `sites_projects/old_linktrend` legacy app
  (residual risk, decision needed from Carlos on formal acceptance vs. retirement timing).
  Diagnosed the Dependabot Updates workflow failures as Dependabot correctly reporting
  unresolvable constraints (not a broken pipeline) and fixed the two blocking cases (js-yaml,
  @babel/core) via narrow, same-major-bounded overrides.
- **DONE (2026-07-13, PR #43):** Established `docs/policies/CONTRACT_AND_SCHEMA_VERSIONING_POLICY.md`
  — the schema/contract versioning conventions Phase 1 requires before any Program Ledger,
  Site Specification, Vertical Kit, or Tier Specification schema is built in Phase 2/3.
- **Next Phase 1 items, not yet started:** resolve GAP-46 (React 18/19 alignment, needed before
  `apps/web-master` can actually be built/deployed); re-triage the remaining ~100 medium/31 low
  Dependabot findings once PRs #38-#43 merge and Dependabot rescans; get Carlos's decision on
  `sites_projects/old_linktrend`'s disposition (accept residual risk vs. retire now).
- **This closes the batch of Phase 1 work packets started in this session.** Remaining Phase 1
  scope (per manual §61: repository ownership/contribution rules beyond branch policy, SBOM,
  dependency review automation, removing mandatory LiNKaios/OpenClaw coupling — already largely
  satisfied by ADR 0002/0001) can be picked up in a future session using this roadmap and the
  PR stack (#38 → #39 → #40 → #41 → #42 → #43) as the starting point.

## Open PRs from this session (merge in order)

| PR | Branch | Contents | Depends on |
|---|---|---|---|
| #36 | `dev/blackcursor/defactor-linkdev-embedded-framework` | DR-01: remove embedded LiNKdev/agent framework | `development` |
| #37 | `dev/blackcursor/program-manual-audit-and-decisions` | Manual ingestion + full audit deliverable set + all decisions | `development` |
| #38 | `dev/blackcursor/ci-real-build-test-gate` | Real CI gate (lint+typecheck), seo.ts fix | `development` |
| #39 | `dev/blackcursor/gap44-45-nextjs-16-migration` | GAP-44/45: Next.js 16 async API migration | #38 |
| #40 | `dev/blackcursor/gap43-cms-test-int-resolution` | GAP-43: test:int module resolution + jsdom fixes | #39 |
| #41 | `dev/blackcursor/gap47-payload-version-alignment` | GAP-47: Payload version alignment + CVE patches | #40 |
| #42 | `dev/blackcursor/gap48-jsyaml-override` | GAP-48: js-yaml/@babel/core Dependabot-blocker fixes | #41 |
| #43 | `dev/blackcursor/p1-contract-schema-versioning-policy` | Contract/schema versioning conventions (docs only) | #42 |
| #44 | `dev/blackcursor/gap46-react19-upgrade` | GAP-46: React 19 upgrade, `next build` now succeeds for both frontends | #43 |
| #45 | `dev/blackcursor/archive-legacy-old-linktrend` | Archive `sites_projects/old_linktrend` per Carlos's instruction | #44 |
| #46 | `dev/blackcursor/gap49-medium-low-security-triage` | GAP-49: remaining medium/low Dependabot findings patched | #45 |

All PRs are drafts. None have been merged. Recommend merging #36 and #37 first (independent of
the rest), then #38 through #46 in order (each depends on the previous).

## Second work batch (2026-07-14) — Carlos's explicit instructions, all executed

Carlos reviewed the Phase 1 close-out and gave three direct instructions, all executed in this
batch: (1) upgrade to React 19 to resolve GAP-46 — done, PR #44; (2) fix the remaining 100
medium/31 low security findings — done, PR #46 (GAP-49); (3) archive the legacy
`sites_projects/old_linktrend` app, taking anything genuinely useful and not using the rest —
done, PR #45 (nothing was ported forward; on review against the manual, the app's only
distinctive feature, direct Stripe checkout, is explicitly out of LiNKsites' scope per doctrine,
so nothing beyond preservation-for-reference was warranted). Combined with the first batch, all
of Phase 0 and the security/stability portion of Phase 1 are now closed. Phase 1's remaining
scope (repository ownership/contribution rules beyond branch policy, SBOM/dependency-review
automation) and all of Phases 2-10 (Program Ledger, reusable asset factory, preview pipeline,
commercial spine, customer fulfilment, autonomous hosting, observability, pilot, expansion) —
each a substantial, multi-work-packet engineering effort per the manual's own phase doctrine —
remain to be scoped and built in future sessions.
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
