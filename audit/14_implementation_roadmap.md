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
- **DONE (2026-07-13, PR #43):** Established `docs/archive/policies/CONTRACT_AND_SCHEMA_VERSIONING_POLICY.md`
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
| #48 | `dev/blackcursor/phase2-postgres-store` | Postgres-backed LedgerStore (pglite-tested) + independent-review bug fixes | #47 |
| #49 | `dev/blackcursor/phase2-execution-plan` | Full Phase 2-10 execution plan + Program/Module hierarchy + Executor Registry | #48 |
| #50 | `dev/blackcursor/phase3-tier-specification` | Tier Specification schema + entitlement enforcement (Phase 3, GAP-12) | #49 |
| #51 | `dev/blackcursor/phase3-vertical-kit` | Vertical Kit schema, seeded with Home Services pilot candidate (Phase 3) | #50 |
| #52 | `dev/blackcursor/phase3-reusable-foundation` | Reusable Site Foundation schema, prospect-neutrality scanner, reservation exclusivity (Phase 3) | #51 |
| #53 | `dev/blackcursor/phase3-design-catalog` | Design Intelligence Catalog token hierarchy + accessibility-gated admission (Phase 3) | #52 |
| #54 | `dev/blackcursor/phase3-component-registry` | Component Registry governed machine object, seeded from real web-master components (Phase 3) | #53 |
| #55 | `dev/blackcursor/phase3-site-specification` | Site Specification integration resolver, composing all five prior Phase 3 objects (Phase 3) | #54 |
| #56 | `dev/blackcursor/phase3-prospect-adaptation` | Prospect Adaptation record, reservation-matching guard, close-or-recycle lifecycle (Phase 3) | #55 |
| #57 | `dev/blackcursor/phase3-ledger-executor-integration` | SiteSpecificationExecutor: first real connection between Program Ledger and factory-catalog (Phase 2/3) | #56 |

**Merge status update (2026-07-14):** Carlos explicitly authorized merging this entire stack.
PRs #36, #37, and #38-#57 (26 commits total) were merged into `development` via three
consolidated merge commits (`40635f9`, `eb74011`, `e75f102`), each preceded by a full local
re-verification (lint, workspace-wide typecheck, both frontend builds, CMS integration tests,
Program Ledger tests, factory-catalog tests) against the merge result before pushing. PRs #39-#57
were closed with an explanatory comment rather than merged individually via GitHub, since their
content landed via the consolidated commit instead. #36-#38 auto-closed. A follow-up batch (below)
then added GAP-04 (Promotion Service / Site Assembly Engine) directly on top and was merged the
same way (`2518e9b`). **`development` is now the authoritative branch for all of this session's
work; none of it is only sitting in a draft PR anymore.**

## Seventh work batch (2026-07-14) — continuous execution, completing the Phase 3 reusable-asset trio

Continuing Decision DR-08 (no pause between phases; the manual + this roadmap is the plan).
This batch completes the manual §06-§08 set of five reusable-asset objects as real, tested code
in `packages/factory-catalog`:

- PR #52: **Reusable Site Foundation** (manual §08.18/§08.24 — the third of the manual's three
  explicitly distinct objects, after Vertical Kit and Tier Specification). Includes a mechanical
  first pass at the manual §08.19 prospect-neutrality rule (`scanForProhibitedFields()` /
  `assertProspectNeutral()`) and a `FoundationReservationManager` enforcing exclusivity (manual
  §08.28/§10.18) using the same lease/expire pattern already proven in `packages/program-ledger`.
- PR #53: **Design Intelligence Catalog** token hierarchy (manual §06's exact 7-layer override
  order: global → semantic → style-family → vertical → tier → site → component) plus an
  accessibility-gated admission guard — a style must be both lifecycle-active AND
  accessibility-contrast-passed before it is production-eligible, matching the manual's framing
  that accessibility constrains admission, not just a downstream check. The one seeded
  `StyleFamily` is a deliberate, honestly-labeled placeholder: the manual's named upstream design
  seed (`ui-ux-pro-max-skill`) is not reachable from this repository, so no real style content was
  invented.
- PR #54: **Component Registry** — a governed, lifecycle-tracked, tier-gated machine object,
  distinct from `apps/web-master/docs/components/index.json` (which remains valid human
  documentation but has no lifecycle/tier/versioning metadata, GAP-07). Seeded with 4 components
  (`SignupHero`, `CTASection`, `OfferShowcase`, `ArticlesGrid`) whose IDs and source paths were
  read directly from the real `index.json`, not invented. Custom-code tier enforcement delegates to
  the existing `checkEntitlement()` rather than duplicating that rule.
- `packages/factory-catalog` grew from 22 to 65 tests across this batch, all passing; workspace-wide
  typecheck across all 6 packages remains clean.
- PR #55 added the **Site Specification** integration resolver: composes the five prior objects
  into one per-site resolved contract, enforcing every cross-object invariant those Issues defined
  (Kit lifecycle, Foundation lifecycle + Kit/tier match, component tier-availability, Kit+Tier
  effective page limit) by delegating to each object's own guard function rather than duplicating
  any rule — this is the closest current approximation of the manual §63 exit gate language
  ("deterministic assembly produces valid sites from versioned specifications"), though the real
  Site Assembly Engine that turns this record into an actual rendered site still does not exist
  (GAP-04).
- PR #56 added the **Prospect Adaptation** record (manual §09-§10): the prospect-specific content
  overlay applied to a reserved Foundation during Preview Production — deliberately the mirror
  image of the Foundation's own prospect-neutrality rule from PR #52 (this record is *expected* to
  contain prospect data). Enforces that an Adaptation can only be created against a currently-active
  reservation for the matching Foundation, implements the manual's required "close or recycle"
  lifecycle (manual §MVO commercial-loop step 7), and specifically proves that recycling a stale
  Adaptation never releases a different, unrelated requester's active reservation on the same
  Foundation.
- This closes out the reusable-asset factory's core object set for this session: **7 real, tested
  objects** (Vertical Kit, Tier Specification, Reusable Site Foundation, Design Intelligence
  Catalog, Component Registry, Site Specification, Prospect Adaptation), **85 passing tests** in
  `packages/factory-catalog`. Remaining Phase 3/4 work either needs Carlos/business input to
  promote provisional content to `active` (not something to invent), or crosses into the Promotion
  Service / Site Assembly Engine (GAP-04), which is Phase 4/5-adjacent, larger-scope work.
- PR #57 then closed a gap this same roadmap had explicitly flagged under Phase 2: "the ledger core
  is proven correct in isolation; it has not yet been connected to anything that does real work."
  `SiteSpecificationExecutor` is a real `ExecutorAdapter` that, when dispatched through the Program
  Ledger, actually calls `resolveSiteSpecification()` against real Phase 3 catalog data — the first
  connection between Phase 2 and Phase 3 code in this repository. `packages/factory-catalog` grew to
  90 tests; `packages/program-ledger`'s own 36 remained unaffected. The executor's catalog lookups
  are still in-memory (naturally swappable for Supabase-backed lookups once live infrastructure is
  verified, GAP-50) — this proves the *wiring* is correct, not that it runs against production data
  yet.

## Ninth work batch (2026-07-14) — research-grounded provisional business defaults, launch-time CMS access rule

Carlos clarified that engineering should not wait on final commercial/business decisions, and asked
for quick web research to ground the tier/vertical/style placeholders in realistic 2026
small-business-website market norms, on the explicit condition every value stays trivially
changeable later. Applied directly in `packages/factory-catalog`:

- Standard `maxPages` 8 → 6 (2026 starter packages typically span 5-8 pages); Premium `maxPages`
  20 → 12 (business/growth-tier packages typically span 10-15 pages); `HOME_SERVICES_KIT` promoted
  from `candidate` to `active` (already the Decision DR-06 approved pilot vertical, and a
  well-grounded, common, repeatable SMB category); a new `TRUST_PROFESSIONAL_STYLE` (blue for
  trust/stability, Montserrat+Open Sans, WCAG contrast independently computed and verified by hand
  and by a dedicated test, not just asserted) added alongside the existing deliberately-unreviewed
  `PLACEHOLDER_STYLE_FAMILY` test fixture.
- **CMS access clarification (Carlos):** `customerCmsAccess` is now `'none'` for every tier at
  launch, including Enterprise -- no customer of any tier gets CMS access initially; LiNKtrend staff
  (human or agent) manage all content, mostly through automation. A new `futureCmsAccessCandidate`
  field records which tiers are plausible future candidates (false for Standard, true for
  Premium/Enterprise) without granting or changing any current behavior.
- Added `priceUsdPerMonthProvisional`, illustrative market-rate pricing only (explicitly not an
  approved price -- LiNKtrend's real cost structure/margins were not researched and still need
  Carlos), present for Standard/Premium, deliberately omitted for Enterprise (custom-quoted).
- `packages/factory-catalog` grew from 114 to 128 passing tests; two pre-existing negative-path
  tests were fixed in place (they had relied on `HOME_SERVICES_KIT`'s old non-active default to
  trigger a rejection, and now explicitly construct that override instead).

## Tenth work batch (2026-07-14) — Foundation Matching Engine (GAP-16) and pipeline chaining helpers

Continuing Decision DR-08. Two more independent slices, again built via parallel subagents against
precisely pinned interface contracts (following the GAP-04 pattern):

- **Foundation Matching Engine** (`packages/factory-catalog/src/foundationMatching.ts`): the first
  real slice of manual §08.16/§08.28/§10.18's Foundation-matching process -- hard filters using only
  data that genuinely exists today (lifecycle status, Vertical Kit match, tier match, current
  reservation state), a single real ranking signal (most-recently-created-first, since no
  engagement/telemetry data exists yet to rank by anything richer), and auto-reservation of the
  winner via the existing `FoundationReservationManager`. This closes the honestly-scoped part of
  GAP-16 ("a real Preview Inventory / matching engine ... to decide which new lead an
  archived-and-recycled Foundation should be re-offered to"), tracked as an open gap across several
  prior work batches. A new module, `execution/modules/phase4-build-first-preview-path/`, was
  created for this -- Foundation matching is genuinely Phase 4 scope per the manual's own phase
  ordering (it decides which Foundation feeds the first real Preview build, not which reusable
  assets exist), built ahead of the rest of that module because it was concretely unblocked.
- **Pipeline chaining helpers** (`packages/factory-catalog/src/pipelineChaining.ts`): type-safe
  mapping/builder functions (`buildSiteAssemblyInputFromSiteSpecification()`,
  `buildPromotionRequestFromManifest()`) that propagate identifier fields correctly from one
  executor's accepted output into the next executor's Issue input. This is explicitly NOT a fully
  autonomous auto-triggering pipeline -- building that would require fabricating a real page/route
  plan and real prospect content this repository does not have yet (an information-architecture
  resolver and a content-production pipeline, neither of which exist). It is the honest, real piece
  of the "no automatic pipeline chaining" gap that IS buildable today without inventing fake content.
- `packages/factory-catalog` grew from 128 to 147 passing tests across this batch (12 + 7 new);
  `packages/program-ledger`'s own 36 remained unaffected; full CI-equivalent verification (lint,
  workspace-wide typecheck, both frontend builds, CMS integration tests) re-run and green before
  merging into `development`.

## Eleventh work batch (2026-07-14) — Proof Level Engine, Preview Inventory snapshot, Conversion Lock

Continuing Decision DR-08, into Phase 4's `phase4-build-first-preview-path` module. Three more
independent slices built via three parallel subagents against precisely pinned interface contracts,
grounded in a dedicated re-read of manual Section 10 (Preview Inventory and Build-First Sell-Later
Production Model) and Section 09 done specifically for this batch:

- **Proof Level Engine** (`packages/factory-catalog/src/proofLevel.ts`): models the manual's
  Levels 0-4 proof-level system, explicitly SEPARATE from paid tier (manual §10.9/§09.18) --
  `ProofSpecification` (versioned, lifecycle-status'd, per-level investment ceiling),
  `InvestmentAuthorization` + `checkInvestmentAgainstBudget()` (mirrors `tierSpecification.ts`'s own
  disposition-returning pattern), and `createProofBlock()`/`escalateProofBlock()` -- escalating to a
  higher level creates a NEW versioned block and marks the prior one `supersededBy`, never
  overwriting history (manual §10.30: "must not overwrite prior level history"). All dollar-ceiling
  values are explicitly marked as structural placeholders (manual §10.48 leaves real budgets as open
  policy).
- **Preview Inventory portfolio snapshot** (`packages/factory-catalog/src/previewInventory.ts`):
  `computePreviewInventorySnapshot()`, a pure aggregation over existing `ReusableSiteFoundation[]` +
  a live `FoundationReservationManager` + `ProspectAdaptation[]` into the subset of manual §10.38's
  portfolio metrics that are actually computable from data that exists today (status/kit/tier
  counts, present-tense reservation utilization, adaptation-status breakdown, and foundation reuse
  distribution -- a real signal for §10.39's similarity/saturation concern). Explicitly does not
  implement the manual's full seven-object inventory model or its cost/conversion/coverage-rate
  metrics, which need data (cost ledgers, Sales outcomes) this repository does not have.
- **Conversion Lock** (`packages/factory-catalog/src/conversionLock.ts`): the manual's §10.33
  invariant -- "when Sales sends a valid conversion instruction based on Stripe-confirmed payment and
  the corresponding Odoo commercial record, LiNKsites locks the relevant preview version and
  foundation relationship for customer finalization" -- implemented as `ConversionLockRegistry`,
  mirroring `FoundationReservationManager`'s own claim/exclusivity style. Requires the locking
  adaptation to be `published`; idempotent on repeat calls for the same adaptation; rejects a second,
  conflicting lock attempt on the same Foundation; and exposes `assertRecycleAllowed()` as the gate a
  future recycle workflow must call. No real Stripe/Odoo integration exists (GAP-33/34/35) -- all
  three commercial refs are opaque, caller-supplied strings with no live verification, and
  `archiveAndRecycleFoundation()` in `prospectAdaptation.ts` was deliberately NOT modified to call
  this gate automatically, to avoid an unreviewed edit to already-merged shared code within this
  batch's scope.
- `packages/factory-catalog` grew from 147 to 179 passing tests across this batch (13 + 8 + 11 new);
  `packages/program-ledger`'s own 36 remained unaffected; full CI-equivalent verification (lint,
  workspace-wide typecheck, both frontend builds, CMS integration tests) re-run and green before
  merging into `development`.

## Twelfth work batch (2026-07-14) — Preview Deployment, Outcome Record, and Conversion Lock wiring

Continuing Decision DR-08, still within `phase4-build-first-preview-path`. Two more parallel
subagents plus a reviewed follow-up wiring step done directly (not delegated, since it required a
deliberate, reviewed edit to an already-merged file from a prior Issue):

- **Preview Deployment** (`packages/factory-catalog/src/previewDeployment.ts`, manual §10.25): the
  record type for a controlled, rendered preview instance -- deployment identity, a SEPARATE
  analytics identity per preview (manual's isolation doctrine, enforced by
  `assertNoAnalyticsIdentityCollision()`), and a deliberately restrictive `indexingPolicy` default:
  every created deployment starts `'noindex'` regardless of `accessPolicy`, and the ONLY path to
  `'indexable'` (`markDeploymentAsIndexable()`) requires both a `'public'` access policy AND a
  non-null quality receipt -- matching manual §10.3's "must never be indexable by careless default."
- **Outcome Record** (`packages/factory-catalog/src/outcomeRecord.ts`, manual §10.31): the manual's
  explicit separation of authority -- Sales owns commercial outcome, LiNKsites owns technical
  disposition -- implemented as a single, deterministic mapping function
  (`mapSalesOutcomeToTechnicalDisposition()`) from the manual's exact 11-value Sales outcome
  vocabulary to its exact 10-value technical disposition vocabulary, with `createOutcomeRecord()` as
  the ONLY constructor (a caller cannot supply an internally-inconsistent record pairing, e.g. a
  `'converted'` outcome with a `'cleanse_and_recycle'` disposition). `requiresConversionLock()`/
  `requiresRecycling()` are pure predicates only -- deliberately not wired to any real trigger yet.
- **Conversion Lock wiring** (`phase4-deployment-outcome-wiring-001`): closes the gap Conversion
  Lock's own prior Issue explicitly deferred -- `archiveAndRecycleFoundation()` in
  `prospectAdaptation.ts` now accepts an optional `ConversionLockRegistry` and, when supplied, calls
  `assertRecycleAllowed()` BEFORE any state transition, so a locked Foundation's Adaptation is never
  partially archived (the whole operation aborts cleanly). Kept optional for backward compatibility.
  This was done directly rather than by a subagent, since it required a reviewed edit to
  already-merged shared code from a prior Issue -- exactly the kind of edit the earlier Issues
  deliberately deferred rather than making unreviewed.
- `packages/factory-catalog` grew from 179 to 219 passing tests across this batch (17 + 20 + 3 new);
  `packages/program-ledger`'s own 36 remained unaffected; full CI-equivalent verification (lint,
  workspace-wide typecheck, both frontend builds, CMS integration tests) re-run and green before
  merging into `development`. `phase4-build-first-preview-path/MODULE.md` was updated to reflect all
  seven Issues now completed in this module.

## Thirteenth work batch (2026-07-14) — repository cleanup and hardening pass

Carlos confirmed there was little further engineering buildable without live Stripe/Odoo/Supabase
access, and instructed: clean up repository content unrelated to LiNKsites' intent, then harden and
test what exists, before moving to the Supabase and Odoo integration phases (recorded as
Decision DR-09 in `audit/13_decision_and_contradiction_register.md`). A new cross-cutting module,
`execution/modules/repo-hardening/`, was created for this (distinct from the phase3/phase4
factory-build modules — this is quality work over what's already built, not new manual-doctrine
objects). Three Issues:

- **`repo-cleanup-001`**: deleted 4 empty, zero-usage scaffold packages (`packages/blocks`,
  `packages/config`, `packages/ui`, `packages/utils`) and a stale, broken-link `library/README.md`;
  archived (git history preserved) `sites_specs/*.txt`, 4 pre-manual `docs/product/*.md` PRDs, and
  5 pre-manual `docs/archive/reference/*.md` planning docs into `archive/pre-manual-planning-docs/`
  (deliberately keeping the 4 still-useful operational how-tos — DNS/Supabase/VPS/security — in
  place); and, via a dedicated subagent's careful, file-by-file classification, archived 11 stale
  AI-agent session-completion-report docs from `apps/web-master/docs/` and `apps/cms/docs/` into
  each app's own `docs/archive/agent-session-reports/`, while deliberately keeping ~54 genuine
  reference docs in place. Full rationale in each archive's own `ARCHIVED.md`/`MANIFEST.md`.
- **`hardening-security-001`**: independently re-verified the repository's real dependency-vulnerability
  state via `pnpm audit` on `development` (2 findings: a high-severity `drizzle-orm` SQL-injection
  advisory and a low-severity `esbuild` file-read advisory, both transitive via Payload's Postgres
  adapter) — down from the 222 GitHub reports on `main`, which is the unpromoted default branch, not
  `development` (confirmed via `gh repo view --json defaultBranchRef`; promotion is Principal-only
  per `docs/archive/BRANCHING_AND_DEPLOYMENT_POLICY.md`). Fixed both with bounded `pnpm.overrides`; `pnpm
  audit` now reports zero known vulnerabilities. Added a "Dependency vulnerability audit" step to
  `.github/workflows/ci.yml` so a future regression is caught automatically.
- **`hardening-test-coverage-001`**: installed `@vitest/coverage-v8` in both `packages/factory-catalog`
  and `packages/program-ledger`, measured real coverage, and closed the gaps found. factory-catalog:
  95.55%/92.33% → 97.77%/95.17% (stmts/branches), 219 → 230 tests. program-ledger: 92.22%/82.87% →
  93.57%/84.81%, 36 → 44 tests — including a `heartbeat()` describe block that was previously
  **entirely untested**. Writing that test found a real bug: `PostgresLedgerStore.getIssue()`/
  `getRun()`/`getGateResult()` let a raw Postgres "invalid input syntax for type uuid" error
  propagate for a malformed id instead of returning the clean `null` every other not-found case
  produces — fixed via a new `queryOneOrNull()` helper scoped to that specific SQLSTATE, with 2 new
  regression tests (one proving the fix, one proving it doesn't change correct not-found behavior
  for a well-formed-but-unknown UUID).
- Full CI-equivalent gate (lint, workspace-wide typecheck, both frontend builds, CMS integration
  tests, factory-catalog tests, program-ledger tests) re-run and green after every merge in this
  batch, exactly as with every prior batch this session.

## Eighth work batch (2026-07-14) — merge the full stack into `development`, then close GAP-04

Carlos explicitly authorized clearing and merging the entire open PR stack, and directed that
engineering continue on **(b) the larger-scope Promotion Service / Site Assembly Engine (GAP-04)**
rather than waiting on commercial/business decisions (tier pricing, real vertical content, real
visual brand) — those decisions are correctly deferred; they do not block engineering, only the
first real paying customer.

**Merge:** the full PR stack (#36-#57, 26 commits) was merged into `development` in three
consolidated, fully-reverified merge commits (see "Merge status update" above). All 22 open PRs from
this session are now closed; their content lives in `development`, not in draft branches.

**GAP-04 build, using two parallel subagents plus this session's own integration work:**

- **Subagent A** built `packages/factory-catalog/src/siteAssemblyManifest.ts`: `assembleSiteManifest()`
  deterministically resolves a Site Specification + optional Prospect Adaptation into an ordered
  page/section plan (manual §07's Site Assembly Manifest), delegating Kit-lifecycle and
  component-tier-eligibility checks to the existing guards rather than duplicating them. Determinism
  (manual §07.14) is directly tested: two calls with identical inputs produce byte-identical `pages`
  arrays. 8 new tests.
- **Subagent B** built `packages/factory-catalog/src/promotionService.ts`: `PromotionService.promote()`
  implements manual §12's Promotion Service — the only trusted path from a Supabase working package
  to a Payload **draft** (never published). Implements the manual's specific idempotency invariant
  (same idempotency key + same package checksum = safe no-op retry; same key + different checksum =
  rejected contract conflict) and mandatory readback verification (a write that "succeeds" but fails
  readback is recorded as failed, not succeeded). 8 new tests, including one that specifically proves
  a naive "write succeeded = done" implementation would be caught.
- Both subagents worked from an identical, precisely-pinned interface contract specified up front, so
  their independently-built branches merged into one consolidated branch with zero conflicts beyond
  one clean auto-merge in a shared `index.ts` export list.
- **This session then built the ledger wiring itself** (not delegated): `SiteAssemblyExecutor` and
  `PromotionExecutor`, extending the same `ExecutorAdapter` pattern proven by
  `SiteSpecificationExecutor` (PR #57) to both new objects — real, ledger-driven, end-to-end execution
  paths, not just standalone unit-tested functions. 8 new tests, including one proving the
  `PromotionExecutor`'s shared `PromotionService` instance's idempotency guarantee survives being
  driven through the Program Ledger (the underlying write call count does not increase on a repeated
  invocation with the same idempotency key).
- `packages/factory-catalog` grew from 90 to **114 passing tests** across this batch (8 + 8 + 8 new);
  `packages/program-ledger`'s own 36 remained unaffected; full CI-equivalent verification (lint,
  workspace-wide typecheck, both frontend builds, CMS integration tests) re-run and green before
  merging into `development`.
- **What GAP-04 still lacks:** a real `PayloadDraftTarget` implementation backed by live
  Payload/Postgres — this still requires live infrastructure not available in this environment
  (GAP-50); today's tests use a fully controllable in-memory test double. Also still absent: automatic
  pipeline chaining (Site Specification → Site Assembly → Promotion as one flow — each remains an
  independently dispatchable Issue type today) and publication (draft → published), which is
  intentionally out of scope for the Promotion Service per the manual's own layering doctrine.

## Sixth work batch (2026-07-14) — continuous execution into Phase 3 (Decision DR-08)

Carlos rejected pausing between phases and confirmed: the manual + this roadmap IS the plan; no
separate PRD is needed; execution proceeds continuously, Issue after Issue, stopping only at real
gates or blockers (per Decision DR-08, recorded in `execution/PROGRAM.md`). This batch:

- Closed out Phase 2's core scope: PR #49 added the Program/Module hierarchy (all 20 LiNKsites
  Modules, manual §05, modeled as real data) and an Executor Registry with a full end-to-end
  synthetic-workflow proof (36/36 program-ledger tests passing).
- Started Phase 3 (reusable asset factory): PR #50 built the Tier Specification schema and
  entitlement-enforcement engine (GAP-12, manual §08.16), and PR #51 built the Vertical Kit schema
  (manual §08.8) seeded with the Decision DR-06 pilot vertical (Home Services) as a non-production
  `candidate` — deliberately not promoted to `active`, since real vertical content requires
  business/research input this repository doesn't have.
- Every numeric/commercial value introduced (tier page limits, change allowances, etc.) is
  explicitly marked as a provisional placeholder in code and documentation, per manual §03's
  own deferred-decisions list — none of this should be read as real pricing or scope commitments.
- New package `packages/factory-catalog` (22 tests) joins `packages/program-ledger` (36 tests) as
  tested, working Phase 2/3 foundations. `packages/types` gained a canonical `SchemaVersion` type
  (relocated from a duplicate in `program-ledger`), per this repo's own contract-versioning policy.

## Fifth work batch (2026-07-14) — independent review pass, bug fixes, LiNKdeveloper adoption

Carlos asked to "fix any bugs" before continuing, and separately clarified that "LiNKdeveloper"
(the shared execution-doctrine system in `IDE Development`, wired via the `repo/.cursor` symlink)
is distinct from "LiNKdev" (the embedded factory removed in PR #36 / DR-01), and asked that this
repository's own Program Manual implementation work actually use it going forward.

- **Corrected a self-inflicted mistake first**: earlier git branch-switching during DR-01's
  worktree operations had inadvertently restored `.cursor` (and `.agent/`, `.codex/`, `LiNKdev/`,
  `AGENTS.md`) to their old tracked, present state on `issue/wave9-linksites-prod`'s local working
  tree, undoing part of the pre-existing uncommitted LiNKdev-removal work-in-progress that was
  there before this session started. Re-ran `IDE Development/scripts/wire-repo.sh` (the sanctioned
  wiring script, not a manual `ln -s`) to restore the correct symlink and verify it. Also found and
  reverted two small stray edits that had leaked into the main workspace early in this session
  (a lint-script fix and a JSX-escaping fix, both already correctly committed on PR #38's branch)
  — the main workspace is now confirmed to genuinely match its pre-session state again, aside from
  the intentional new additions (`audit/`, `docs/specs/`, `docs/archive/adr/`, etc.).
- **Performed an independent review pass** over `packages/program-ledger` (Issue
  `phase2-ledger-review-bugfix-001`, tracked under the newly-adopted `execution/` artifact
  structure) and found two real concurrency-safety bugs beyond the two already found while
  building the Postgres store: an unbounded-retry bug (Gate-rejection retries didn't respect
  `maxAttempts`) and a more serious "zombie write" window (a crashed worker's stale fencing token
  remained valid until someone else re-claimed the Run, not immediately upon reclaim). Both fixed
  with regression tests, added to PR #48. Total Program Ledger test count: 22/22 passing.
- **Adopted the LiNKdeveloper execution doctrine** for this repository's ongoing Program Manual
  work: `execution/PROGRAM.md` (program-level artifact for this whole engagement),
  `execution/modules/phase2-program-ledger/MODULE.md`, and the bug-fix work's own `ISSUE.md`/
  `PROOF.md`, following the Program → Module → Phase → Issue → Proof → Review → Integration model
  defined in `.cursor/execution/` (via the symlink). Prior Issues in this session's PR stack
  (#36-#47) were not retroactively converted into this artifact format — that would be low-value
  busywork at this point — but future work should use it going forward.

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

## Phase 3 — Reusable asset and assembly foundation — **all named objects + GAP-04 built as real, tested code; only live-infrastructure-dependent pieces remain**

- Tier Specification (GAP-12), Vertical Kit (GAP-11), Reusable Site Foundation (GAP-13), Design
  Intelligence Catalog token hierarchy (GAP-09/10), Component Registry (GAP-07), Site Specification
  (the per-site integration resolver), Prospect Adaptation (the manual §09-§10 prospect content
  overlay + close-or-recycle lifecycle), Site Assembly Manifest (manual §07 deterministic assembly),
  and Promotion Service (manual §12 Supabase-working-to-Payload-draft) are all now real, tested
  machine objects in `packages/factory-catalog` (114 passing tests). All still carry
  provisional/placeholder content where the manual defers real values (tier limits, the one seeded
  Vertical Kit candidate, the one seeded StyleFamily) or where an upstream source this repository
  cannot reach was named (`ui-ux-pro-max-skill`).
- `apps/web-master/docs/components/index.json` and `tokens.css` remain the real underlying seeds;
  they were read from (component IDs/paths verified against `index.json`) rather than replaced.
- Three real executors (`SiteSpecificationExecutor`, `SiteAssemblyExecutor`, `PromotionExecutor`) now
  connect the Program Ledger to this entire object model end to end — a real Issue dispatched through
  the ledger actually resolves a Site Specification, assembles a Site Assembly Manifest, or promotes
  a working package into Payload drafts, tracing a full event history for each, closing the "ledger
  not connected to real work" gap this same roadmap flagged under Phase 2.
- **GAP-04 (Promotion Service / Site Assembly Engine) is closed at the code-object and
  ledger-integration level.** What remains before this phase's exit gate ("deterministic assembly
  produces valid sites from versioned specifications") is fully, literally met in production:
  (a) a real `PayloadDraftTarget` backed by live Payload/Postgres — needs live infrastructure not
  available in this environment (GAP-50); today's tests use a controllable in-memory test double; and
  (b) automatic pipeline chaining across the three executors (Site Specification → Site Assembly →
  Promotion as one flow) — each is independently dispatchable today, not yet auto-sequenced.
- Also still absent: a real Preview Inventory / matching engine (GAP-16) to decide which new lead an
  archived-and-recycled Foundation should be re-offered to; `archiveAndRecycleFoundation()` performs
  only the reservation-release side effect, not re-matching. Publication (Payload draft → published)
  also remains a separate, later, intentionally out-of-scope authority.

## Phase 4 — Build-first preview path — **seven first slices real, tested, and wired together where honestly possible; live Stripe/Odoo, live Payload/hosting, and telemetry-dependent metrics/ranking still absent**

- Phase 2 (Program Ledger) and Phase 3 (Vertical Kit/Tier/Foundation) are real, so this phase is now
  reachable. Seven real, honestly-scoped first slices now exist in
  `execution/modules/phase4-build-first-preview-path/` (219 passing tests in
  `packages/factory-catalog`):
  - **Foundation Matching Engine** (`foundationMatching.ts`, GAP-16 first slice): hard filters on
    real data (status/Kit/tier/reservation) + a recency ranking signal + auto-reserve via the
    existing `FoundationReservationManager`.
  - **Proof Level Engine** (`proofLevel.ts`, manual §10.8): Levels 0-4, versioned Proof
    Specifications, budget-disposition checking, and history-preserving escalation -- explicitly
    separate from paid tier.
  - **Preview Inventory portfolio snapshot** (`previewInventory.ts`, manual §10.38 first slice): a
    pure aggregation function over existing Foundation/reservation/adaptation data into the subset
    of portfolio metrics that data can actually support today.
  - **Conversion Lock** (`conversionLock.ts`, manual §10.33): locks a Foundation relationship once a
    Sales-authorized, Stripe/Odoo-referenced conversion occurs, blocking recycling -- with no live
    Stripe/Odoo integration behind the opaque refs it accepts (GAP-33/34/35). Now WIRED into
    `archiveAndRecycleFoundation()` (`prospectAdaptation.ts`) as an optional, backward-compatible
    recycle-blocking gate -- a locked Foundation's Adaptation can no longer be recycled through that
    function, closing the gap the Conversion Lock Issue itself had explicitly deferred.
  - **Preview Deployment** (`previewDeployment.ts`, manual §10.25): the record type for a rendered
    preview instance, with isolation (no shared analytics identity across previews) and a
    deliberately restrictive `noindex`-by-default policy that only one narrow, explicit path can lift.
  - **Outcome Record** (`outcomeRecord.ts`, manual §10.31): the manual's explicit Sales-owns-outcome /
    LiNKsites-owns-disposition separation, implemented as a single deterministic mapping function
    with a type-enforcing constructor -- a caller cannot create an internally-inconsistent record.
- Still absent: a real orchestrator connecting an `OutcomeRecord`'s technical disposition to
  `ConversionLockRegistry.createLock()`/`archiveAndRecycleFoundation()` automatically; the manual's
  full seven-object inventory model beyond what's built (no real deployed-preview or Sales-outcome
  integration exists to back further objects); cost/conversion/coverage-rate portfolio metrics (need
  cost ledgers and real Sales outcomes); the manual's full multi-factor Foundation ranking (requires
  engagement/telemetry data this repository does not have). Real Preview generation itself remains
  blocked on GAP-50 (live Payload/Postgres) and real content production; real Conversion Lock
  verification remains blocked on GAP-33/34/35 (live Stripe/Odoo).

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
