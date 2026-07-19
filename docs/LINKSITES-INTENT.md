# LiNKsites — Intent

**Status:** Confirmed Intent for the LiNKsites Program itself (this repository), written in the same spirit as LiNKdeveloper's Intent artifact — a plain-English statement of what is being built, why, for whom, and what "done" means. Grounded in what the code, `audit/`, and `docs/OPEN-ISSUES.md` actually deliver today (through 2026-07-19), not in aspirational roadmap language alone.

**Audience:** The Principal (sole human authority) and any agent or Integrator that needs to understand *why this Program exists* before reading the Technical PRD.

**Companion document:** [`LINKSITES-TECHNICAL-PRD.md`](./LINKSITES-TECHNICAL-PRD.md) — exhaustive how-it-works reference.

---

## 1. Problem

Many SMBs have no independent website, an outdated or ineffective one, or only a social-media / marketplace presence. Traditional custom agency work is too expensive and too dependent on individual developers. Unconstrained one-prompt AI generation can produce code quickly but does not solve the full problem: what the site should say, which design and conversion structure fit the business, media rights, quality gates, domain/TLS, hosting, maintenance, recovery, and future changes.

LiNKtrend needs to sell and operate **managed SMB websites** at scale with near-zero day-to-day human technical involvement. Doing that as ad-hoc builds (or as a generic website builder the customer must operate) does not fit the studio model.

The problem LiNKsites solves is: **repeatedly produce, validate, sell-from-proof, launch, host, and maintain customer-appropriate SMB websites from governed reusable foundations — with human involvement limited to product strategy, commercial decisions, and exceptional escalation.**

---

## 2. Who it is for

| Role | Relationship to LiNKsites |
|---|---|
| **Principal (Carlos)** | Sole human authority. Approves product strategy, material pricing/architecture, destructive or high-spend exceptions, and security/legal matters. Does not write code or manage day-to-day hosting. |
| **SMB prospects** | Receive a real website preview (build-first, sell-later) before purchase where Sales authorizes the investment. |
| **SMB customers** | Purchase a managed website outcome: hosted, maintained, recoverable site — not a code dump or DIY builder. |
| **LiNKtrend Sales Program** | Discovers leads, sells, processes Stripe payment, owns Odoo commercial records; requests previews and sends paid activation packages. |
| **LiNKtrend studio (agent roles)** | Planners, executors, graders, and operators work under this Program's Modules, Ledger, and gates. |
| **OpenClaw** | Optional external operations overseer for exceptions. Not required for normal production or hosting. |

LiNKsites is **both** a customer-facing managed-website product **and** LiNKtrend's internal website factory Program. It is not a sales CRM, payment processor, or general automation factory.

---

## 3. What "done" looks like (Program-level)

A healthy LiNKsites production path is done when:

1. A governed **Reusable Site Foundation** exists for a supported Vertical Kit and tier.
2. Sales can request a **Progressive Sales Proof Level** preview; LiNKsites produces, validates, and returns a Preview Ready Package.
3. Unsold previews can be **recycled** (prospect identity removed) and the foundation returned to inventory without leakage.
4. After verified payment (Sales → Paid Website Activation Package), LiNKsites **finalizes, publishes, launches, and certifies** a customer site.
5. The site is **hosted** on LiNKtrend-managed infrastructure (shared Next.js frontend + central Payload CMS), monitored, backed up, and updatable through governed change workflows.
6. Every material step leaves **Ledger / Gate / cost evidence** — completion is never "an agent said it was done."

**Studio-level "coding done" bar (as of 2026-07-19):** the CMS (`apps/cms`), multi-tenant frontend (`apps/web-master`), Program Ledger (`packages/program-ledger`), factory-catalog objects and executors (`packages/factory-catalog`), and Supabase working/ledger schemas build, typecheck, and pass their automated tests. That is **not** the same as "a real paying customer has been sold, launched, and operated end-to-end in production." Live Stripe/Odoo integration, full autonomous hosting ops (monitoring/backup), and the first real customer pilot remain open (see Technical PRD § deferred / `docs/OPEN-ISSUES.md`).

---

## 4. Scope — inputs and outputs

### Inputs (what LiNKsites takes)

- Versioned **Product / Tier Specifications** and Vertical Kits (factory capability definitions).
- **Lead Research Packages** and **Preview Production Requests** from the Sales Program.
- **Paid Website Activation Packages** after verified Stripe + Odoo state (via Sales).
- Customer-supplied facts, logos, media, domain authorization, and approvals where required.
- Credentials and environment for runtime: Payload, Supabase/Postgres (shared `linkplatform-*` projects), Cloudflare/Traefik/VPS, GSM secrets — see app `.env.example` files and ops notes.

### Outputs (what LiNKsites produces)

- Governed reusable assets: Design Intelligence Catalog entries, Component Registry, Vertical Kits, Reusable Site Foundations, Site Specifications, Prospect Adaptations, Site Assembly Manifests.
- Private/controlled **previews** with quality evidence, cost, analytics refs, and expiration.
- **Payload draft → published** website content (via Promotion Service; public frontends read published only).
- Launched **Customer Site Instances** with hosting assignment, domain/TLS, launch manifest.
- Fulfilment, launch, and service-health packages back to Sales/Odoo.
- Durable Program Ledger audit trail (Issues, Runs, Gates, Events) for factory work.

### Explicit out of scope (deliberate — not forgotten)

| Out of scope | Why / status |
|---|---|
| General SMB discovery, outreach, CRM, quotations | Belongs to LiNKtrend Sales / Odoo. |
| Payment processing | Stripe via Sales; LiNKsites activates only on verified packages. |
| General managed business automation | Belongs to LiNKautowork (may be sold as add-on; not absorbed). |
| Unrestricted custom app development per customer | Productized tiers; Enterprise requires explicit approval. |
| Dependence on postponed LiNKaios | Manual doctrine: operate independently. |
| OpenClaw as required runtime | Overseer only; normal work continues without it. |
| Customer self-service CMS at launch | All tiers: managed-only CMS access initially (`customerCmsAccess: 'none'`). |
| Inventing final prices / legal terms | Commercial configuration; provisional placeholders only in code. |

---

## 5. Guiding governance principles

These are the operational principles this Program is built around. Full doctrine lived in the archived Program Manual (24 sections); the Technical PRD maps each to code.

1. **Factory doctrine** — LiNKsites is the complete production + managed-hosting Program, not merely templates or a CMS.
2. **Independent operation** — Integrates with Sales, LiNKplatform, and LiNKautowork via contracts; does not require LiNKaios or OpenClaw to run.
3. **Reuse-first / thin custom layer** — Prefer governed foundations and open-source over one-off codebases.
4. **AI-assisted deterministic assembly** — Agents select/adapt/evaluate; they do not invent a new React app per customer by default.
5. **Build-first proof** — Qualified prospects see a real website; speculative cost is inventory investment.
6. **Working vs live** — Supabase working layer → validated Promotion → Payload draft → gates → Payload published → frontend. Executors never write live content directly.
7. **Published-content doctrine** — Public frontends consume published Payload content only.
8. **Evidence doctrine** — Runs and Gates preserve proof; silence is never acceptance.
9. **Safe autonomy** — Reversible work is automatic; material/destructive/high-spend decisions follow an authority model (Program → OpenClaw delegated → Principal).
10. **Shared platform org model** — Tenant identity via LiNKplatform `platform.organizations` / RLS; LiNKsites Program Ledger owns governance leases (ADR 0003).

---

## 6. Success criteria

| Criterion | Evidence that counts |
|---|---|
| Factory code is structurally progressing | Workspace packages build/typecheck/test; CMS + web-master are real apps (verified continuously on `development`). |
| Reusable asset objects exist | Vertical Kit, Tier Spec, Foundation, Design Catalog, Component Registry, Site Spec, Prospect Adaptation, Assembly Manifest, Promotion Service — in `packages/factory-catalog` with tests. |
| Ledger is real | `packages/program-ledger` Issue/Run/Gate/Event + Postgres store + capability-grant checks; migrations under `supabase/migrations/`. |
| Preview path objects exist | Proof levels, inventory snapshot, foundation matching, conversion lock, preview deployment, outcome record — code objects; live Sales/hosting wiring still partial. |
| Live commercial + ops proof | **Not yet a claimed success.** Stripe/Odoo spine, monitoring/backup, and first real customer pilot remain open. |

---

## 7. Relationship to other documents

| Document | Role |
|---|---|
| `docs/OPEN-ISSUES.md` | Append-only build log — what was built, deferred, and limited. Prefer over stale prose elsewhere. |
| `docs/LINKSITES-TECHNICAL-PRD.md` | Exhaustive technical reference for how the system works. |
| `docs/LINKSITES-OPERATIONS-MANUAL.md` | Plain-English handbook for the Principal. |
| `docs/archive/specs/linksites-program-manual/` | Original 24-section Program Manual (ingested 2026-07-13); **superseded as day-to-day authority** by Intent + Technical PRD, retained for history. |
| `docs/archive/adr/` | Architecture decision records — historical rationale; consult Technical PRD for current state. |
| `audit/` | Phase 0 audit deliverables and roadmap evidence (not archived; engineering working set). |
| `execution/` | LiNKdeveloper-style Program/Module/Issue artifacts for ongoing implementation. |

---

## 8. One-sentence Intent

**LiNKsites is LiNKtrend's autonomous website factory and managed SMB website service: it assembles governed reusable foundations into real prospect previews and paying-customer sites, promotes content through a trusted Payload path, hosts them on a shared Next.js/Cloudflare/Traefik platform, and operates them as a continuing service — with Sales owning commercial lifecycle and human day-to-day involvement limited to strategy and exceptional escalation.**
