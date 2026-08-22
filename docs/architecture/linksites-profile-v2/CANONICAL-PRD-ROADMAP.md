# LiNKsites Profile v2 — canonical PRD and roadmap

**Repository:** `linktrend/LiNKsites`
**Target:** LiNKsites Profile v2 on LiNKharness `0.1.x` and Master Website
Template `master-template-type-1@2.0.0`
**Authoritative planning baseline:** commit
`e46ce0c657a7445bfb898ac208f6f5d889b550f2`, tree
`3e98a86abbdc753933e9c7238d9c29f47b03022e`
**Development system:** IDE Development `2.5.1`
**Provider planning source:** `linktrend/LiNKlibraries` commit
`f25b385c1e34d958834ce4b7e085ab454a956918`, tree
`626828346c8a4841c8ae95ac6b4fa9af4941f1fb`

## 1. Product outcome

LiNKsites is an autonomous website factory. It accepts an approved website
definition, selects an exact governed LiNKlibraries template release, creates
and promotes customer content in Payload, deterministically assembles a site,
renders and publishes it through web-master, and retains exact adoption,
evidence, upgrade and rollback history.

The rebuilt Program is:

```text
exact LiNKharness release
+ LiNKsites Profile
+ LiNKsites factory catalogue, CMS, renderer and hosting domain code
+ exact LiNKlibraries Master Website Template release
= independent LiNKsites Program
```

LiNKharness supplies universal execution machinery. The Profile and domain
packages supply website meaning. LiNKlibraries supplies immutable reusable
template semantics/assets. No component gains another owner's authority.

## 2. Ownership boundary

### LiNKharness

Owns universal contracts, Program Ledger persistence, DBOS durable execution,
dependency scheduling, executor adapters, leases/locks/heartbeat,
transactional dispatch, retry/cancel/recovery, budgets, gates, approvals,
evidence mechanics and Profile conformance.

### LiNKsites Profile and domain packages

Own site specification, customer/site/tenant data, entitlements, deterministic
assembly, adoption, content production/promotion, Payload schemas/migrations,
provider-to-runtime adapter mappings, React/Next rendering, routes, navigation,
SEO/AI projections, forms/privacy, hosting, site lifecycle and domain verdicts.

### LiNKlibraries

Owns immutable Master releases, capability/page-family/section/slot/layout/plan/
vertical/customer-boundary schemas, design tokens, variants, defaults, assets,
reference output, semantic IDs, lifecycle/admission and integrity evidence.

Cross-repository proof binds exact provider and consumer identities. Neither
repository edits the other's authoritative bytes. LiNKsites never maintains a
competing copy of the Master.

## 3. Profile contract

Create `@linksites/profile` as the single Program composition authority. It
exports Profile identity/version/Harness range, website Modules/Phases/Issues,
enabled executor lanes, provider bindings, permissions/budgets/concurrency,
domain gates/proof levels/reserved approvals, site transition/evidence mappers,
configuration/redaction/readiness, migrations/rollback and conformance fixtures.

The production orchestrator loads exactly one Profile and exact Harness pin.
Existing `packages/program-ledger`, `apps/program-orchestrator` and `execution/`
generic machinery must delegate to or be replaced by LiNKharness. Domain
catalogue, CMS, web-master and site lifecycle remain local.

### Coding-execution routing authority

Every current manifest packet/Issue uses its exact `[routing:*]` record in
`MODEL-ROUTING-AUTHORITY.json`. Auto means only SDK selector `auto-smart` with
`optimize_for=cost`; generic Auto, Balance, Intelligence, omission-based or
unverifiable Auto is forbidden. Composer 2.5 is limited to fully bounded,
simple/repetitive, objectively verified and reversible work. Cursor Grok 4.6
Medium non-Fast handles explicit complex or long-running work. A third-party
model requires a recorded capability, context, bulk-modality, independent-
review, Terra-verification or quality-recovery need and cost-pool reason.

Before dispatch, live discovery must prove each exact selector and parameter.
A governed `issue/*` branch/isolated worktree and PREPARED route/mode/repository/
ref/packet/candidate/workspace/worktree/sandbox/idempotency identity are
mandatory. Request/readback must prove effective optimization mode, serving
model, non-Fast state, returned agent/run identity and same-turn Git/manifest.
One different-family fallback is allowed only after logged model-quality
failure and recomputes PREPARED/idempotency; infrastructure failure keeps the
same model. Independent review is a separate worker and Terra High checkpoint
verification remains distinct. The current shell is unauthenticated, so
dispatch remains HOLD and no agent is created here.

## 4. Deterministic site identity

Every site assembly binds:

- provider repository, entry ID, semver, commit/tree, artifact digests and
  materialization receipt;
- capability contract, layout pack A1/A2/A3 and plan A/B/C/L identities;
- optional vertical overlay identity or explicit null;
- customer configuration version/digest;
- Payload content release and entitlement snapshot;
- LiNKsites adapter revision and supported provider range;
- provider effective configuration digest;
- immutable Site Assembly Manifest ID/version/digest;
- adoption state, previous/rollback adoption and evidence references.

Identical normalized inputs produce identical semantic output. Timestamps and
operational metadata stay outside the hashed projection.

## 5. Complete Master Template consumer requirements

The following LS-FR requirements are mandatory and retain their provider /
consumer meaning.

1. **LS-FR-01 exact release selection:** validate catalogue governance,
   provider commit/tree, manifests, inventory, dependency lock, artifact
   digests, compatibility and lifecycle; draft candidate use is bounded and
   production rejects non-selectable/tampered/unsupported releases.
2. **LS-FR-02 verified local materialization:** atomically cache exact bytes,
   receipt-bind them, start/render without the provider checkout, reject
   traversal/tamper/partial installs and preserve the prior active cache.
3. **LS-FR-03 Site Specification:** store all layered identities, modes,
   entity counts, entitlement snapshot, adapter and effective digest; pageCount
   is derived reporting only.
4. **LS-FR-04 plans/entitlements:** provider plan IDs A/B/C/L, concurrent
   entity credits (defaults A=30, B=15, C=6, L=0), zero-cost core/legal/system
   pages, explicit allowed/upgrade/unsupported/exception verdicts, atomic
   publish/replace/archive and no automatic content deletion on downgrade.
5. **LS-FR-05 customer configuration:** typed/versioned provider-allowed brand,
   action, contact, modes, capabilities, labels/slugs, locale, variants and
   provenanced assets; no arbitrary CSS/scripts/secrets/fake facts or semantic
   expansion.
6. **LS-FR-06 deterministic resolver:** output capability dispositions, page
   instances/families, routes/locales, semantic sections/components, content,
   shell plans, metadata/schema plans, credits and exact digests.
7. **LS-FR-07 activation/navigation:** implement count-sensitive Products /
   Services, resource, location, service-area, pricing, team and Type L rules;
   no empty pages or doorway pages.
8. **LS-FR-08 adoption/entitlement records:** immutable linked adoption states,
   before/after/rollback and actor/evidence; free-text template IDs become
   deprecated projections only.
9. **LS-FR-09 Payload models:** tenant/locale/lifecycle/provenance-safe Products,
   Services, Results/Work, Articles, Videos, FAQ/Help, Team, Locations, Service
   Areas, Policies and typed core settings; Products and Services remain
   semantically distinct.
10. **LS-FR-10 additive migration:** never edit applied migrations; prove fresh
    install, production-shaped upgrade, Offer/Case/template compatibility,
    generated Payload types and failed-migration safety.
11. **LS-FR-11 working content:** support product/service/hybrid/neither modes,
    preserve semantic/evidence/media/config identities and reject fake or
    unsupported claims/assets/placeholders.
12. **LS-FR-12 Payload promotion:** exact semantic ID -> provider component/page
    -> Payload collection/block -> React symbol mapping; 100% required coverage,
    typed ordering and readback-bound receipts; remove all-Hero projection.
13. **LS-FR-13 versioned adapter:** testable provider range and complete mapping;
    local symbols/paths stay consumer-owned and unknown required IDs fail.
14. **LS-FR-14 layout-aware React:** real structural A1/A2/A3 differences using
    one semantic source, A/B/C/L resolver output, Type L isolation, declared
    optional fallback and no public template/error text masquerading as content.
15. **LS-FR-15 header/footer:** resolved real brand/navigation/action/contact/
    locale/social/policy information, accessible mobile behavior and five-zone
    footer; remove placeholders and uncontracted controls.
16. **LS-FR-16 routes/redirects:** all active families, canonical dynamic
    tenant/locale-safe routes, collision/reserved/locale/stale redirect checks
    and explicit retirement.
17. **LS-FR-17 SSR/AI-first HTML:** meaningful pre-hydration title, answer,
    content, one H1, headings/landmarks, crawlable links, trust fields and
    tenant/language metadata.
18. **LS-FR-18 structured data:** emit only visible published facts for the
    applicable Organization/LocalBusiness/WebSite/Service/Product/Article/
    Video/FAQ/Breadcrumb/Person/location types; test visible/schema consistency.
19. **LS-FR-19 sitemap/robots/AI:** one published authority for sitemap,
    canonical/hreflang, robots, `llms.txt` and AI projections; drafts/private/
    redirects excluded and tenant/locale/entitlement boundaries identical.
20. **LS-FR-20 accessibility:** WCAG 2.2 AA target with automated component/page
    proof plus manual keyboard, focus, headings, contrast, motion, touch, zoom,
    media, viewport, expansion and RTL-readiness checks; no legal-certification
    overclaim.
21. **LS-FR-21 performance:** repeatable representative heavy-fixture evidence
    with provisional LCP <=2.5s, INP <=200ms and CLS <=0.1; label lab versus
    field data.
22. **LS-FR-22 forms/privacy:** activate modules only with real hooks, consent,
    privacy, abuse/failure behavior; no fake success, leaked secrets or
    unconditional policy/cookie controls.
23. **LS-FR-23 existing-site pinning:** defaults never move existing sites;
    migrate invalid legacy pins deliberately and preserve exact adoption.
24. **LS-FR-24 migration/rollback/retirement:** plan/apply/verify copied data,
    compatible/incompatible fixtures, replay configuration/content, before/
    after digests, failed-upgrade preservation, rollback readback and historic
    retrieval after new-selection retirement.
25. **LS-FR-25 execution evidence:** emit exact domain identities/verdicts for
    adoption, entitlement, assembly, promotion, Payload, SSR, browser,
    migration and rollback through LiNKharness; no parallel Ledger/orchestrator/
    retry/gate/lock/cost/evidence implementation.

## 6. Harness-candidate adjudication

The H? items require no new website-specific Harness subsystem:

- release discovery/materialization executes through the generic tool/provider
  adapter, transactional dispatch and evidence contracts; Library validation,
  cache layout and adoption semantics remain LiNKsites/LiNKlibraries;
- migration plan/apply/verify uses generic Run/Issue/gate/receipt mechanics;
  site-data compatibility and rollback remain LiNKsites;
- domain receipts use generic exact evidence storage, while verdict names and
  required fields remain the Profile.

If implementation reveals a missing universal port, stop and amend LiNKharness
first. Do not create a private generic controller in LiNKsites.

## 7. Content and runtime architecture

```text
LiNKharness Program Run
  -> LiNKsites Profile website Modules
  -> exact LiNKlibraries candidate/release materialized locally
  -> Site Specification + entitlement + customer configuration
  -> deterministic Site Assembly Manifest
  -> working content with evidence/provenance
  -> typed Payload draft promotion + readback
  -> adapter revision -> React/Next SSR + hydrated behavior
  -> preview/publication -> web-master hosting
  -> adoption/evidence/upgrade/rollback lifecycle
```

Payload remains content authority for customer site data and draft/published
state. Provider reference output remains design/semantic authority. React/Next
is the public renderer. Public requests never fetch live Library bytes.

## 8. Data and migration

All new collections are tenant-scoped, locale-aware, lifecycle-controlled and
relation-safe. Additive migrations introduce adoption, entitlement, semantic
entities, constraints and compatibility projections. Already-applied migration
bytes never change. Existing Offers, Cases and template ID records are either
explicitly migrated or read through a versioned compatibility path until a
later governed removal.

Migration rehearsals use copied production-shaped data. Failure leaves the
prior active adoption/cache/site usable and records sanitized evidence. One
packet owns new migrations and generated Payload types.

## 9. Provider/consumer delivery protocol

LiNKlibraries first freezes immutable A1 prerelease `2.0.0-a1.1` through its
MWT-01–07 manifest. LiNKsites may develop Profile/contracts against accepted
schemas, but paired proof begins only on the exact prerelease candidate.

LiNKsites returns separate exact verdicts: `candidate_materialized`,
`adapter_compatible`, `payload_projection_valid`, `server_render_valid`,
`browser_fixture_valid`, and `migration_rollback_valid`. LiNKlibraries retains
`provider_contract_valid`. `production_selectable` occurs only after governed
provider/consumer admission. `production_observed` requires separately
authorized live deployment.

A2/A3 provider work and final `2.0.0` require the approved post-A1 amendment in
the Master plan. Any provider semantic change invalidates adapter/browser proof.

## 10. Tests and fixtures

Required matrices include exact selection/tamper/cache; provider mapping;
layering/digests; A/B/C/L credits; product/service counts 0/1/2/6/7; commerce,
local/resources/Type L; route/locale/redirect collisions; existing pins;
fresh/upgrade/failed Payload migrations; promotion/readback; provider cache
restart; SSR/HTML/schema/sitemap/AI consistency; privacy/forms; accessibility,
performance and visual review.

Paired browser fixtures cover A1/A2/A3 x A/B/C/L plus services-only,
products-only, hybrid, local, resources, trust/AI, failure and lifecycle. Each
claims only the evidence actually run: server HTML, hydrated behavior,
desktop/mobile, keyboard, automated accessibility, links, SEO/AI, privacy and
independent visual review as applicable.

## 11. Migration from current LiNKsites

1. inventory current Program Ledger/orchestrator/evidence and domain behavior;
2. pin LiNKharness HC1 contract and implement `@linksites/profile`;
3. migrate current generic execution to Harness behind disabled flags;
4. implement exact adoption/entitlement/assembly contracts and additive data;
5. consume A1 candidate, implement adapter/projection/renderer/routes/shell;
6. prove A1 locally and in paired browser fixtures;
7. return the exact receipt to LiNKlibraries; await A2/A3 amendment/delivery;
8. complete all-layout proof and existing-site migration/rollback;
9. shadow current/new site lifecycle and cut a non-customer cohort;
10. remove/deactivate superseded generic authorities after rollback proof;
11. complete admission/release/deployment only through reserved gates.

## 12. Roadmap

### LS0 — truth, Harness and Profile

LS-00 exact baseline/authority map; LS-01 Harness pin/Profile; LS-02 adoption,
entitlement, specification and deterministic assembly contracts.

### LS1 — CMS and semantic pipeline

LS-03 additive Payload migrations/models; LS-04 working content/promotion;
LS-05 versioned adapter and A1 materialization.

### LS2 — web runtime

LS-06 layouts/rendering/shell/routes; LS-07 SSR/SEO/AI/forms/privacy;
LS-08 A1 paired proof and provider handoff.

### LS3 — complete template and lifecycle

After provider amendment: LS-09 A2/A3 proof; LS-10 existing-site migration,
rollback, operations and cutover; LS-11 final independent review/Full/release.

## 13. Definition of done

LiNKsites Profile v2 is done only when:

1. LS-FR-01 through LS-FR-25 pass or are explicitly superseded by an authorized
   product decision;
2. one exact Harness/Profile pair runs the website lifecycle and no active
   duplicate generic authority remains;
3. every site stores exact provider/layout/plan/overlay/config/content/adapter/
   entitlement/assembly/adoption/rollback identities;
4. Products/Services remain distinct across CMS, routes, schema and rendering;
5. semantic IDs survive content production, Payload promotion and React output;
6. A1/A2/A3 x A/B/C/L paired fixtures pass against exact provider candidates;
7. SSR, visible content, JSON-LD, sitemap, robots and AI projections agree;
8. runtime restarts from verified local bytes without provider checkout;
9. existing sites remain pinned and failed upgrades preserve active state;
10. tenant, locale, privacy, accessibility, performance and security gates pass
    at their declared proof levels;
11. independent review and final exact-tree Full have no unresolved blocker;
12. admission, main, publish and production deployment remain exact recorded
    approvals and no local result is called production proof.
