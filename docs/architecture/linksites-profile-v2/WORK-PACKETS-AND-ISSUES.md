# LiNKsites Profile v2 work packets and Issues

## Global execution rules

All Issues are atomic governed checkpoints. Packets integrate serially and may
parallelize only after accepted dependencies with disjoint writable paths.
LiNKharness, LiNKlibraries and LiNKsites identities are exact pins. Any provider
semantic, Harness contract, adapter or Profile digest change invalidates the
dependent evidence. Provider bytes are never edited here.

## LS-00 — Exact baseline and authority map

- **ISS-01:** Refresh the 2.5.1 baseline, open work, dirty worktrees, current
  Library pins, database/runtime state and baseline tests; create the
  fail-closed deterministic `scripts/validate-profile-v2-baseline.mjs`
  evidence validator.
- **ISS-02:** Inventory Ledger/orchestrator/retry/gate/evidence versus website
  domain authorities; classify preserve/refactor/replace/retire.
- **ISS-03:** Map LS-FR-01–25 to current exact code paths and snapshot external
  CMS/web-master/hosting/provider configuration; record authenticated
  `cursor-agent` status, exact default-model listing and the companion
  PREPARED-intent/dispatch/readback authority without creating an agent.

Owns `docs/evidence/profile-v2-baseline/**` and
`scripts/validate-profile-v2-baseline.mjs`; no product code. The validator must
exit nonzero and emit no PASS for absent, unreadable, malformed,
stale/mismatched or unknown baseline evidence. Acceptance also requires exact
machine-readable truth, no hidden overlap and no claim that old audit paths are
current without verification. LS-00 routing is the non-Fast default route only;
planning integration/rebaseline is the first approved action and agent dispatch
remains unauthorized.

## LS-01 — Harness pin and LiNKsites Profile

Depends on LS-00 and LiNKharness HC1-A.

- **ISS-04:** Add exact Harness dependency and supply-chain/compatibility pin.
- **ISS-05:** Implement `@linksites/profile` Modules/Phases/Issues, executor
  policy, permissions, budgets, gates, evidence mappers and configuration.
- **ISS-06:** Add deterministic Profile conformance and compatibility facades;
  keep current runtime active until LS-10 cutover.

Owns root dependency manifests and `packages/linkharness-profile/**`.
Acceptance: no copied Harness source or website fields in universal contracts.

## LS-02 — Adoption, entitlement and deterministic assembly

Depends on LS-01 and accepted provider schemas.

- **ISS-07:** Expand Site Specification and implement exact provider/layout/
  plan/overlay/config/content/adapter/effective identities.
- **ISS-08:** Implement A/B/C/L capability-credit entitlements, snapshots and
  activation/navigation rules.
- **ISS-09:** Implement deterministic Site Assembly Manifest, shell/route/schema
  plans, credit dispositions and stable digests.

Owns `packages/factory-catalog/src/siteSpecification.ts`,
`siteAssemblyManifest.ts`, `tierSpecification.ts`, `verticalKit.ts`, planned
adoption/entitlement modules and focused tests. Acceptance covers LS-FR-03–08
contract behavior with count/mode/credit matrices.

## LS-03 — Payload semantic models and migrations

Depends on LS-02.

- **ISS-10:** Add Template Adoption and Entitlement Snapshot collections /
  records plus deprecated legacy projections.
- **ISS-11:** Add tenant/locale/provenance-safe Products, Services, Results,
  Articles, Videos, FAQ, Team, Locations, Service Areas, Policies and settings.
- **ISS-12:** Add one-owner migrations, generated types, fresh/upgrade/failed
  fixtures, Offer/Case/template compatibility and rollback.

Owns `apps/cms/src/collections/**`, `apps/cms/src/globals/**`, Payload config/
generated types, `supabase/migrations/**`, `supabase/tests/**`. Applied migration
bytes are prohibited.

## LS-04 — Working content and typed promotion

Depends on LS-02, LS-03.

- **ISS-13:** Implement product/service/hybrid/neither content production with
  semantic, claim/evidence, media, locale and layered identity retention.
- **ISS-14:** Replace all-Hero promotion with complete typed semantic -> Payload
  mapping and readback-bound receipts.
- **ISS-15:** Implement false-claim, fake-review/credential, placeholder,
  unlicensed-media, missing-required and tenant-isolation rejection.

Owns `packages/factory-catalog/src/contentProduction.ts`, `workingContent.ts`,
`workingContentPayloadPromotion.ts`, `promotionService.ts`, promotion executor/
target and focused tests.

## LS-05 — Exact A1 consumption and versioned adapter

Depends on LS-02, LS-03, LS-04, Master MWT-01–07 and immutable
`2.0.0-a1.1` candidate.

- **ISS-16:** Discover/materialize/cache exact A1 bytes; prove tamper/path/
  partial-install rejection, offline restart and prior-cache preservation.
- **ISS-17:** Implement versioned provider semantic mapping with 100% required
  coverage and explicit unsupported results.
- **ISS-18:** Bind candidate/adoption/adapter/Payload/effective identities and
  emit separate materialization/compatibility/projection verdicts.

Owns Library consumer/client/persistence/compatibility, Master candidate/pin/
consumer/semantic-projection/look-and-feel/override modules and focused tests.
It must not edit LiNKlibraries or make the draft production-selectable.

## LS-06 — Layout-aware web runtime

Depends on LS-04, LS-05.

- **ISS-19:** Implement structurally distinct A1 and architecture-ready A2/A3
  PageRenderer compositions from provider semantics/tokens.
- **ISS-20:** Implement resolved Header/Footer/mobile/locale/action behavior and
  Type L shell isolation with no placeholders.
- **ISS-21:** Implement every active family route/detail/locale/redirect/
  collision/retirement rule with tenant-safe queries and failure states.

Owns `apps/web-master/src/components/**`, page renderer/layout modules,
`apps/web-master/src/lib/routes.ts`, public route guards and family routes.

## LS-07 — SSR, discoverability, accessibility and side effects

Depends on LS-06.

- **ISS-22:** Implement pre-hydration semantic HTML, visible-fact JSON-LD,
  metadata/canonical/hreflang, sitemap, robots, `llms.txt` and AI projections.
- **ISS-23:** Implement real form/newsletter/booking/analytics/ecommerce hooks
  with consent/privacy/abuse/failure policy; reject fake success.
- **ISS-24:** Implement automated/manual accessibility matrix, representative
  performance budgets and responsive/visual regression fixtures.

Owns web-master SEO/AI/form modules and tests, `scripts/profile-v2-quality/**`.
Acceptance labels lab/manual/legal limitations truthfully.

## LS-08 — A1 paired consumer proof

Depends on LS-05, LS-06, LS-07 and exact provider A1 receipt.

- **ISS-25:** Run A1 x A/B/C/L plus product/service/hybrid/local/resources/
  trust/failure/lifecycle server and browser fixtures.
- **ISS-26:** Perform independent visual/accessibility/privacy/tenant review and
  exact cache restart/tamper/rollback proof.
- **ISS-27:** Return exact consumer receipt/verdicts to LiNKlibraries and freeze
  accepted A1 semantics; domain defects return to owning packets.

Owns `tests/master-template-v2/a1/**`, `docs/evidence/master-v2/a1/**` and
bounded fixture scripts. No broad product code repairs inside proof packet.

## LS-09 — A2/A3 and complete provider proof

Depends on LS-08 and approved/rebaselined LiNKlibraries post-A1 amendment and
exact A2/A3/final candidate.

- **ISS-28:** Integrate A2/A3 additive layout mappings without changing accepted
  A1 or plan semantics.
- **ISS-29:** Run A2/A3 x A/B/C/L paired semantic/functional/visual/
  accessibility/performance fixtures.
- **ISS-30:** Produce all-layout adapter/browser verdicts and coordinate final
  provider admission evidence; keep production selection gated.

Owns `tests/master-template-v2/a2-a3/**`,
`docs/evidence/master-v2/a2-a3/**` and additive layout adapter modules explicitly
declared after the provider amendment.

## LS-10 — Existing-site migration, operations and cutover

Depends on LS-08, LS-09 and Harness consumer-conformance candidate.

- **ISS-31:** Plan/apply/verify copied existing-site migration, pin stability,
  compatible/incompatible upgrades, retirement and rollback readback.
- **ISS-32:** Replace/delegate current generic Ledger/orchestrator/execution to
  one Harness + Profile composition; shadow compare and preserve rollback.
- **ISS-33:** Migrate/read back CMS, web-master, provider, hosting, database,
  queue, secrets, monitoring and deployment configuration; run non-customer
  canary and permanent drift checks.

Owns `packages/program-ledger/**`, `apps/program-orchestrator/**`, `execution/**`,
`deploy/**`, `docs/evidence/profile-v2-cutover/**`. No duplicate generic
authority may remain active after acceptance.

## LS-11 — Exact final release proof

Depends on LS-10.

- **ISS-34:** Independent exact-head architecture/security/tenant/migration/
  accessibility/visual/evidence review; repair through owning packets.
- **ISS-35:** Run one final exact-tree Full, migration/rollback rehearsal and
  bind Harness/Profile/provider/consumer/configuration receipts.
- **ISS-36:** Prepare admission, release, rollback, handoff and founder-reserved
  main/publish/deploy decisions without promoting lower proof.

Owns `docs/evidence/profile-v2-release/**`, `docs/releases/**`.

## Dependency and cross-repository sequence

```text
LiNKharness HC1-A -> LS-01 -> LS-02 -> LS-03 -> LS-04
                                      \          \
LiNKlibraries MWT-01..07 -> A1 ----------> LS-05 -> LS-06 -> LS-07
                                                       \       /
                                                        LS-08
                                                          |
            A1 receipt -> LiNKlibraries amendment -> A2/A3 -> LS-09
                                                                  |
                                      exact Profile candidate
                                                                  |
                                      LiNKharness H-09 conformance
                                                                  |
                                                                LS-10 -> LS-11
```

LS-03 and selected LS-04 groundwork may parallelize after stable contracts.
CMS migrations have one writer. Renderer, routes, SEO and shared fixtures must
have explicit non-overlapping file ownership. Master implementation may run in
parallel with LiNKharness, but paired proof waits for both exact dependencies.

## Executable-manifest segmentation

The initial manifest contains LS-00 only and may run while LiNKharness and the
Master Template provider execute. LS-01–04 require an approved rebaselined
manifest binding the exact Harness contract/runtime checkpoints. LS-05–08 also
require the exact immutable A1 candidate. LS-09 cannot appear in an executable
manifest until the accepted A1 consumer receipt and the approved LiNKlibraries
post-proof amendment exist. LS-10/11 require all-layout and Harness conformance
receipts. Narrative external dependencies never unlock packets.
