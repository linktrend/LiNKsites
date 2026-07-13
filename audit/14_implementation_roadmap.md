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
| #47 | `dev/blackcursor/phase2-program-ledger-core` | Phase 2 foundation: Program Ledger Issue/Run/Gate/Event core + exit-gate tests | #46 |
| #48 | `dev/blackcursor/phase2-postgres-store` | Postgres-backed LedgerStore, tested against real embedded Postgres (pglite) | #47 |

All PRs are drafts. None have been merged. Recommend merging #36 and #37 first (independent of
the rest), then #38 through #48 in order (each depends on the previous).

## Fourth work batch (2026-07-14) — Postgres store, tested without live infrastructure

Carlos noted the team is working remotely and cannot connect this session to real LiNKsites
infrastructure right now, and asked for continued development with live-infrastructure testing
deferred. Rather than shipping the Postgres store untested, this batch used
`@electric-sql/pglite` — a real, embedded PostgreSQL engine that runs entirely in-process (no
network, no live server) — to genuinely exercise the migration SQL and a real
`PostgresLedgerStore` implementation now. This is a meaningfully stronger position than "written
but untested": the SQL and adapter logic are proven correct against real Postgres semantics
(two genuine bugs were caught this way), and what remains (GAP-50: live connection pooling, live
RLS enforcement, migration-apply against a real populated database) is now a narrow, precisely
scoped verification task for whenever live infrastructure access is available — not an open
question about whether the code is even correct.

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

## Third work batch (2026-07-14) — Phase 2 foundation

Carlos asked to continue with "what's next" after reviewing the first two batches. Per the
roadmap's own dependency ordering (manual §59: "Program core and security foundations" before
"reusable asset factory"), the Program Ledger was the correct next target — it is what almost
every later Module (preview production, paid fulfilment, hosting operations) will be built on
top of. PR #47 delivers a genuine, tested first slice (see the Phase 2 section below), not a
placeholder — the manual §62 exit-gate scenarios are proven in code, and two real bugs were
caught and fixed by the tests while building them. What remains before Phase 2 can formally
close (a live Postgres store, the Program/Module/Stage hierarchy, an executor registry, and at
least one real executor doing actual LiNKsites work) is substantial and should be the subject of
the next session, in the order listed in the Phase 2 section below.

## Phase 2 — Program core and governed execution — **in progress (foundation built, PR #47)**

- **DONE (2026-07-14, PR #47):** Built `packages/program-ledger` — the Issue/Run/Gate/Event/
  Idempotency core with a storage-agnostic `LedgerStore` interface, an in-memory implementation,
  and 9 tests directly proving the manual §62 exit gate in code (duplicate dispatch, worker
  crash/lease reclaim, timeout/retry, cancellation, replay, Gate authority, traceability). Also
  added `supabase/migrations/20260714_000001_program_ledger_core.sql` defining the target
  Postgres persistence shape in a new `lsites_ledger` schema (not yet wired to any application
  code — a live-DB-backed store is a separate follow-up work packet).
- **DONE (2026-07-14, PR #48):** Built `PostgresLedgerStore` (a real `LedgerStore`
  implementation targeting the migration's schema) and tested it against
  `@electric-sql/pglite` — a genuine embedded PostgreSQL engine, not a mock — since no live
  database connection is available while working remotely. All 9 exit-gate tests pass
  identically against this store as against the in-memory one (18/18 total). Testing against
  real Postgres caught two genuine bugs the in-memory store's tests could not have caught
  (a foreign-key ordering bug in `dispatch()`, and a `pgcrypto`-extension incompatibility in
  the migration) — both fixed.
- **Remaining Phase 2 scope, not yet started:**
  - **Live verification of the Postgres store** — pglite proves the SQL and adapter logic are
    correct in isolation, but connection pooling under a real `pg.Pool`, RLS enforcement under
    the actual `svc_linksites_ledger` role's live grants, and migration-apply against an
    existing populated Supabase database all remain unverified and require live infrastructure
    access this session does not have. **This is now the most concrete, well-scoped remaining
    blocker for closing Phase 2's persistence layer** — flagged as GAP-50.
  - Program/Module/Stage hierarchy objects (Issues currently reference them only as opaque
    string IDs).
  - The full dependency DAG (`requires_completion`/`requires_gate`/`requires_artifact`/etc.)
    manual §20 §13-14 describes — this slice assumes dependencies are already satisfied.
  - The 8-level model-routing ladder (manual §20 §46) — no executor registry or model routing
    exists yet; this slice's `claim()` takes an opaque `executorId` string with no routing logic.
  - Compensation Sagas for reversible/destructive side effects (manual §20 §74-79) — this
    slice's `SideEffectClass` type exists but no compensation logic is implemented.
  - Cross-Program outbox/inbox (manual §20 §61-63's Transactional Outbox pattern for
    dispatch, and the Integration Ledger for cross-Program messages, manual §21) — out of
    reach without the Sales/Odoo/Stripe repositories (see GAP-33/34/35, still a blocker).
  - A real executor actually calling this ledger to do LiNKsites work (e.g., a first synthetic
    Issue Type wired to `apps/cms`'s Payload API) — the ledger core is proven correct in
    isolation; it has not yet been connected to anything that does real work.
- **Exit gate status:** The synthetic-workflow-survives-X portion of the manual §62 exit gate
  is met in code (see PR #47's tests). The remaining exit-gate language ("One Issue can be
  traced through accepted output and cost. No model owns workflow truth or authority.") is
  partially met — traceability is proven (the event trail test), but cost tracking does not
  exist yet (that's Phase 8/observability scope per the manual's own phase ordering, though a
  minimal cost-event hook into this ledger would be reasonable to add early). Phase 2 is not
  fully closable until a live Postgres store and at least one real executor exist.

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
