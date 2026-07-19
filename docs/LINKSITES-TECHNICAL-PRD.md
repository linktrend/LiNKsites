# LiNKsites — Technical PRD

**Status:** Technical reference for the LiNKsites Program as actually built in this repository (verified against `apps/**`, `packages/**`, `supabase/migrations/**`, `deploy/**`, `audit/`, and `docs/OPEN-ISSUES.md` through 2026-07-19).

**Ground rule:** Code is the source of truth. Where older docs (now under `docs/archive/`, including the 24-section Program Manual) disagree with code, this document follows the code and calls out the discrepancy in §12.

**Companion:** [`LINKSITES-INTENT.md`](./LINKSITES-INTENT.md) — why this Program exists.

---

## 1. System overview / architecture

LiNKsites is a monorepo website factory + managed hosting Program:

| Plane | Role | Implementation today |
|---|---|---|
| **Control / working** | Program Ledger, factory objects, working packages, provenance | `packages/program-ledger`, `packages/factory-catalog`, schemas `lsites_ledger` + `lsites_sites` on shared Supabase/Postgres (`linkplatform-*`) |
| **CMS** | Draft + published website content authority | `apps/cms` — Payload CMS 3.x on Next.js, Postgres `public` schema |
| **Serving** | Multi-tenant frontend by hostname | `apps/web-master` — shared Next.js platform; optional `apps/web-company` (smaller template; legacy/paused per audit DR-02) |
| **Edge / origin** | Public edge + VPS reverse proxy | Cloudflare (edge) + Traefik labels in `deploy/docker-compose.deploy.yml` |
| **Commercial** | Leads, payment, Odoo | **Not in this repo** — contracts defined; Sales/Stripe/Odoo integration deferred (GAP-33/34/35) |
| **Shared substrate** | Org/RBAC/capability grants | LiNKplatform `platform.*` schemas; Ledger checks `platform.capability_grants` at dispatch |

### Process topology (intended)

```
Sales Preview Request / Paid Activation
        ↓
Program Ledger (Issue → Run → Gate)
        ↓
factory-catalog executors
  (SiteSpecification → SiteAssembly → Promotion …)
        ↓
Supabase working records (lsites_sites / ledger)
        ↓ Promotion Service (draft-only)
Payload draft
        ↓ publication gates (not fully automated yet)
Payload published
        ↓
web-master (hostname → site) behind Traefik + Cloudflare
```

Today the Ledger ↔ catalog executor path is real and tested. Live Sales ingress, full publication automation, and autonomous hosting remediation are not yet end-to-end.

---

## 2. Terminology glossary

Terms match the Program Manual's vocabulary (ADR 0001: LiNKsites-internal engineering vocabulary wins over LiNKaios Suite/Project wording).

| Term | Meaning |
|---|---|
| **Program** | LiNKsites as a whole governed factory + managed service |
| **Module** | One of twenty capability divisions (M01–M20); modeled in `packages/program-ledger` hierarchy |
| **Stage** | Ordered segment inside a Module |
| **Issue** | Atomic schedulable work unit in the Program Ledger |
| **Run** | One execution attempt of an Issue |
| **Executor** | Adapter that performs a Run (`ExecutorAdapter`) |
| **Gate** | Independent acceptance check on Run/Issue/Module/handoff/publication |
| **Vertical Kit** | Reusable production kit for an SMB category |
| **Tier Specification** | Versioned paid-product contract (Standard / Premium / Enterprise) |
| **Reusable Site Foundation** | Prospect-neutral site base eligible for inventory matching |
| **Prospect Adaptation** | Prospect-specific overlay on a reserved Foundation |
| **Site Specification** | Resolved per-site contract composing Kit/Tier/Foundation/components |
| **Site Assembly Manifest** | Deterministic page/section plan from a Site Specification |
| **Proof level** | Progressive Sales Proof Levels 0–4 (investment before sale) — **separate from paid tier** |
| **Promotion Service** | Only trusted path from working package → Payload **draft** |
| **Preview Inventory** | Portfolio of foundations/adaptations/deployments as measurable sales inventory |
| **Conversion Lock** | Blocks recycle once a preview is locked for paid finalization |
| **Site Assignment** | Where/how a site is served (hostname, VPS, region, release) — doctrine; control-plane records partial |

---

## 3. The twenty-Module lifecycle (manual M01–M20)

Authoritative Module list from Program Manual §05 / `packages/program-ledger` hierarchy:

### Product & capability
| ID | Name | Code status (2026-07-19) |
|---|---|---|
| M01 | Product and Tier Governance | Tier Specification + entitlement checks in `factory-catalog` |
| M02 | Design Intelligence Operations | Design Catalog token hierarchy + accessibility-gated admission |
| M03 | Component and Frontend Platform | Component Registry + real `apps/web-master` components |
| M04 | Vertical Kit Operations | Vertical Kit schema; Home Services kit seeded `active` |
| M05 | Reusable Site Foundation Production | Foundation schema, neutrality scanner, reservations |

### Preview production
| ID | Name | Code status |
|---|---|---|
| M06 | Preview Inventory Management | Portfolio snapshot + foundation matching (first slices) |
| M07 | Preview Request Intake and Planning | Site Specification resolver + executor |
| M08 | Prospect Site Adaptation | Prospect Adaptation + close/recycle lifecycle |
| M09 | Content and Media Production | **Not built** as a governed pipeline (CMS media collections exist) |
| M10 | Working-to-Payload Promotion | Promotion Service + `PromotionExecutor` + `PayloadRestDraftTarget` |
| M11 | Preview Deployment and Validation | Preview Deployment record type; live deploy/QA automation partial |
| M12 | Preview Outcome, Upgrade, Recycling | Outcome Record + Conversion Lock wiring |

### Paid fulfilment
| ID | Name | Code status |
|---|---|---|
| M13 | Paid-Order Intake and Customer Finalization | Conversion Lock only; no Stripe/Odoo spine |
| M14 | Production Publication and Launch Certification | **Not built** as automated Module |
| M15 | Domain, DNS, TLS, Hosting Provisioning | Docker/Traefik scaffolding; not Program-controlled |

### Managed service & control
| ID | Name | Code status |
|---|---|---|
| M16 | Site Operations, Monitoring, Recovery | **Not built** (GAP-23/24) |
| M17 | Customer Changes and Service Evolution | **Not built** as Module |
| M18 | Capacity, Regional Placement, Scaling | Doctrine only; no capacity logic hard-coded |
| M19 | Suspension, Export, Termination | **Not built** |
| M20 | Quality, Cost, Performance, Improvement | Test/CI coverage improving; cost accounting absent |

### Primary flows (doctrine)

```
Capability:     M01→M02→M03→M04→M05→M06
Preview:        Sales request → M07→M06→M08↔M09→M10→M11 → Sales package → M12
Paid customer:  Activation → M13→M10→M14↔M15 → active site
Managed:        Active → M16 ↔ M17 ↔ M18 → M19 when instructed
```

---

## 4. Site-generation lifecycle (lead → recycle / launch)

### 4.1 Progressive Sales Proof Levels (≠ paid tier)

| Level | Use | Website proof |
|---|---|---|
| 0 | Weak/unqualified | Research only |
| 1–4 | Increasing investment | Real website preview of increasing completeness |

Code: `packages/factory-catalog/src/proofLevel.ts` — versioned `ProofSpecification`, budget disposition, history-preserving escalation.

### 4.2 Preview path (as implemented)

1. **Site Specification** — `resolveSiteSpecification()` composes Kit/Tier/Foundation/components (`siteSpecification.ts` + `SiteSpecificationExecutor`).
2. **Foundation match** — hard filters + recency ranking + auto-reserve (`foundationMatching.ts`).
3. **Prospect Adaptation** — prospect overlay; recycle must not release unrelated reservations (`prospectAdaptation.ts`).
4. **Site Assembly Manifest** — deterministic page/section plan (`siteAssemblyManifest.ts` + `SiteAssemblyExecutor`).
5. **Promotion** — working package → Payload draft only; checksum idempotency + readback (`promotionService.ts` + `PromotionExecutor`).
6. **Preview Deployment record** — isolated analytics identity; `noindex` by default (`previewDeployment.ts`).
7. **Outcome / Conversion Lock** — Sales outcome → technical disposition; lock blocks recycle (`outcomeRecord.ts`, `conversionLock.ts`).

Pipeline chaining helpers exist (`pipelineChaining.ts`, `pipelineAutoChaining.ts`) but full autonomous Sales→preview→hosting orchestration is not claimed complete.

### 4.3 Paid path (doctrine vs code)

Manual requires: verified Paid Website Activation Package → finalization → publication → domain/TLS → launch certificate. **Code today:** Conversion Lock accepts opaque Stripe/Odoo refs; no live payment/Odoo adapters in this repo.

### 4.4 Recycle

`archiveAndRecycleFoundation()` cleanses adaptations and can consult `ConversionLockRegistry.assertRecycleAllowed()` when a registry is supplied.

---

## 5. CMS content model (`apps/cms`)

Payload collections (verified under `apps/cms/src/collections/`):

| Collection | Role |
|---|---|
| `Sites`, `SiteDomains`, `SiteSettings` | Multi-site tenancy |
| `Pages`, `Navigation` | Primary page graph |
| `Articles`, `ArticleCategories`, `HelpArticles`, `HelpCategories` | Content |
| `Offers` / `OfferPage`, `OfferCategories` | Commercial offers |
| `CaseStudyPage`, `CaseStudyCategories` | Case studies |
| `Videos`, `VideoPage`, `VideoCategories` | Video |
| `TeamMembers`, `Testimonials`, `Locations`, `Languages` | Business identity |
| `FAQPage`, `PrivacyPage`, `TermsPage`, `CookiePolicyPage` | Policy pages |
| `Media` | Media library |
| `Users`, `Roles`, `APIKeys`, `TranslationQueue` | Access / i18n ops |

**Doctrine:** Payload owns draft/publish for website content. Frontends consume **published** content. Promotion Service writes **draft** via API (`PayloadRestDraftTarget`), not raw SQL into Payload tables.

---

## 6. Supabase schema and RLS

### Schemas

| Schema | Purpose | Key migration |
|---|---|---|
| `platform.*` | Shared org/members/capabilities/grants (LiNKplatform) | Prerequisite from sibling repo (vendored in ledger tests) |
| `lsites_ledger` | Program Ledger tables | `20260714_000001_program_ledger_core.sql` (+ deps, capability columns) |
| `lsites_sites` | Working-layer site/content scaffolding | `20260715_000001_lsites_sites_core.sql` + RLS hardening |
| `public` | Payload-managed CMS tables | Via Payload migrations / `DATABASE_URI` |

**Retired:** `lsites_core` mirror-pattern schema — archived under `supabase/migrations/archive/` (ADR 0003). Never applied to live `linkplatform-stage/prod` with customer data.

### RLS posture

- `sites.org_id` → `platform.organizations`; child tables join through `site_id`.
- Policies combine `platform.has_org_access()` with optional `app.site_id` session fast-path.
- Tenant-isolation negative matrix: `packages/program-ledger/tests/tenant-isolation.spec.ts` (12 vectors on pglite).
- Hardening (2026-07-18): `app.site_id` fast-path gated behind membership; `org_id` NOT NULL intent (F1/F2 follow-ups from GAP-06).

### Program Ledger (package)

`@linksites/program-ledger` — Issue/Run/Gate/Event/idempotency, hierarchy (20 Modules), executor registry, dependency DAG, Postgres store (`PostgresLedgerStore` + pglite tests), capability-grant gate at dispatch (`capability-gate.ts`).

---

## 7. Hosting topology (Cloudflare / Traefik / VPS)

### Doctrine (manual §15 + ops notes)

```
Visitor → Cloudflare (DNS/proxy/WAF) → VPS origin → Traefik → shared Next.js runtime
                                                              → Payload CMS (separate host/route)
```

- **Shared code, scoped data** — one frontend platform release serves many hostnames.
- **Central content, regional delivery** — one Payload/DB control plane; frontends may scale by VPS/region later.
- **Hostname is identity** — unknown hosts fail closed.
- Capacity thresholds are **measured**, not a fixed "20 sites per VPS" rule (that figure was an AI estimate; not doctrine).

### What exists in repo

- `deploy/docker-compose.deploy.yml` — Traefik-labeled `payload` + `frontend-shared` services; internal host patterns (`*.linktrend.internal`).
- Dockerfiles under `deploy/docker/`.
- Older ops note `docs/archive/ops/VPS_REVERSE_PROXY_AND_CLOUDFLARE.md` recommended Nginx/Caddy; **current deploy path uses Traefik** (drift noted in §12).

### What does not exist yet

Program-controlled Site Assignment registry, automated DNS/TLS issuance, monitoring/backup/restore automation, regional placement planner (M15–M18 largely scaffolding + doctrine).

---

## 8. Integration with LiNKplatform and LiNKautowork

### LiNKplatform

- Shared Postgres projects (`linkplatform-stage` / `linkplatform-prod`).
- `platform.organizations`, `org_members`, `capabilities`, `capability_grants`, `handoff_envelopes`, `has_org_access()`.
- LiNKsites Ledger **checks grants before dispatch** (not LinkSkills leases — ADR 0003 supersedes ADR 0002 interim exemption).
- Tenant tables use `org_id` on `lsites_sites.sites` only (children via join).

### LiNKautowork

- Separate automation factory. LiNKsites may **consume** approved automation products or hand off form events; it does **not** use LiNKautowork as universal executor.
- Cross-Program handoffs should use versioned envelopes (`platform.handoff_envelopes` doctrine); full Sales/Autowork contract implementations are deferred.

### LiNKtrend Sales / Stripe / Odoo

- Required contracts (manual §02/§21): Preview Request/Ready, Paid Activation, Fulfilment Status, Launch Completion, etc.
- **Zero live adapters in this repo** for Stripe/Odoo as of 2026-07-19 (GAP-33/34/35).

---

## 9. Out of scope for this version / deliberately deferred

1. **Live Sales/Stripe/Odoo spine** — blocked on cross-Program access (Phase 5).
2. **Full autonomous hosting ops** — monitoring, backup, restore, incident runbooks (Phase 7; GAP-23/24).
3. **First real paying customer pilot** — Phase 9; not reached.
4. **Customer CMS self-service** — intentionally `none` at launch for all tiers.
5. **Final commercial prices / legal terms** — provisional placeholders only.
6. **Regional multi-VPS capacity automation** — doctrine ready; no premature hard-coded limits.
7. **OpenClaw as required control plane** — overseer only; not built as dependency.
8. **Full M09 content/media production pipeline** — CMS media exists; governed factory media workflow incomplete.
9. **Publication Module (draft→published→launch certificate) as automated Ledger path** — Promotion is draft-only by design; publication automation remains later.
10. **Live Payload integration tests in CI** — `PayloadRestDraftTarget` exists; integration suite skips without env credentials (GAP-50 residual).

---

## 10. Package / app map appendix

| Path | Package / app | One-line description |
|---|---|---|
| `apps/cms` | Payload CMS | Central draft/published content app (~25 collections) |
| `apps/web-master` | Next.js frontend | Primary multi-tenant shared platform (hostname → site) |
| `apps/web-company` | Next.js frontend | Smaller starter template; investment paused (DR-02) |
| `packages/types` | `@linksites/types` | Shared types / `SchemaVersion` / data-contract exports |
| `packages/program-ledger` | `@linksites/program-ledger` | Issue/Run/Gate/Event, hierarchy, Postgres store, capability gate |
| `packages/factory-catalog` | `@linksites/factory-catalog` | Vertical Kit, Tier, Foundation, Design, Components, Spec, Adaptation, Assembly, Promotion, preview path objects, executors |
| `supabase/migrations` | — | `lsites_ledger`, `lsites_sites`, capability columns; archive of retired `lsites_core` |
| `deploy/` | — | Docker + Traefik compose for CMS + shared frontend |
| `audit/` | — | Phase 0 audit set + living roadmap notes |
| `execution/` | — | Program/Module/Issue execution artifacts |

---

## 11. Cross-references into `docs/OPEN-ISSUES.md` and `audit/`

| Topic | Where |
|---|---|
| Program Manual ingestion + audit | `audit/00_executive_summary.md`, `docs/archive/specs/…` |
| Implementation phases 0–10 | `audit/14_implementation_roadmap.md` |
| Gap/risk register | `audit/09_gap_and_risk_register.yaml` |
| Decisions DR-01… | `audit/13_decision_and_contradiction_register.md` |
| ADR vocabulary / platform org | `docs/archive/adr/0001…`, `0003…` |
| Day-to-day build log | `docs/OPEN-ISSUES.md` |

---

## 12. Known doc drift (for reviewers)

| Claim in older docs | Actual code / deploy today |
|---|---|
| Program Manual is day-to-day engineering authority | **Superseded** for day-to-day by Intent + this Technical PRD + OPEN-ISSUES; manual retained under `docs/archive/specs/` |
| `lsites_core` mirror sync is the working content path | **Retired** (ADR 0003); `lsites_sites` + Payload `public` |
| VPS reverse proxy = Nginx/Caddy (`docs/archive/ops/VPS_…`) | **Traefik** labels in `deploy/docker-compose.deploy.yml` |
| README "sites_specs/" + packages blocks/ui/config/utils | **Stale** — `sites_specs` archived; empty scaffold packages removed |
| LinkSkills capability leases required for LiNKsites side effects | **Superseded** — Program Ledger + `platform.capability_grants` (ADR 0003) |
| GAP-04 "Promotion Service missing" | **Closed** at code+ledger level; live Payload target residual under GAP-50 |
| GAP-16 "no foundation matching" | **First slice closed** (`foundationMatching.ts`) |
| Fake-always-green CI | **Fixed** — real lint/typecheck/test gate in `.github/workflows/ci.yml` |
| "No Program Ledger" (early audit prose) | **Built** — packages + migrations; still maturing toward full Module automation |
| web-company as equal primary template | **Paused/ambiguous** per DR-02; web-master is primary |

---

## 13. How to run (structural)

- Install: `pnpm install` (workspace root)
- Build: `pnpm build` (turbo)
- Typecheck: `pnpm typecheck`
- Test: `pnpm test` (includes `@linksites/factory-catalog` and `@linksites/program-ledger`)
- Dev: `pnpm dev` / per-app scripts under `apps/*`

Live credentials (Payload DB, Supabase, Cloudflare, GSM) are required for non-mocked operation; absence must fail loud for production paths — factory unit tests use in-memory / pglite doubles by design.
