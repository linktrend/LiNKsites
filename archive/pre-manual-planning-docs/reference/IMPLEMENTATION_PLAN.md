# LiNKsites Factory Kit - Implementation Plan (Shared Platform + Optional Premium Spin-Off)

This is the concrete plan to get from “code exists in this repo” to “we can create demo sites, show them on `*.linktrend.media`, sell them, and either attach the client domain to the shared platform or spin off a premium isolated frontend”.

## What You Will End Up With

- 1 central Payload CMS (single admin panel) that stores content for every client site, separated by `siteId`.
- 1 shared Next.js frontend platform that serves many sites by hostname (multi-tenant):
  - demo: `greenturf.linktrend.media`
  - standard plan: `greenturf.com` points to the same shared platform
- Optional premium: a dedicated frontend deployment for a single client (still using the same CMS by `siteId`).
- Supabase Postgres as the database (no Postgres server needed on the VPS).
- GoDaddy DNS as the DNS provider, with wildcard `*.linktrend.media` pointing at your VPS IP.

## Phase 0: Prerequisites (You Provide These)

1. A Supabase project
   - We need the Postgres connection string for `DATABASE_URI`.
2. VPS details
   - Public IP
   - SSH access (or a way to deploy containers)
3. GoDaddy DNS change for `linktrend.media`
   - Wildcard `A` record: `*` -> VPS IP

## Phase 1: Connect CMS to Supabase (Central CMS)

1. Configure env in:
   - `/Users/linktrend/Projects/LiNKsites/apps/cms/.env`
2. Start the CMS and seed the bootstrap records:
   - languages
   - default site
   - local dev hostname mapping
   - default site settings per locale

Result: CMS is running and ready to store multiple websites.

## Phase 2: Shared Frontend Platform (Multi-Tenant Runtime)

1. The shared Next.js platform resolves the current site from the request hostname:
   - hostname -> CMS `site-domains` -> `siteId`
2. Every CMS read includes `?site=<siteId>` and `?locale=<locale>`
   - This prevents cross-tenant data leaks.

Result: one running frontend can serve many different domains safely.

## Phase 3: “Create Demo Site” Flow (Factory Script)

Using the CMS script:
- it creates a `Site`
- maps `hostname` -> `siteId` in `site-domains`
- seeds a minimum working dataset (pages, navigation, legal, offer, case study, video, FAQ)

Result: as soon as the `site-domains` record exists, the demo URL works (no repo cloning).

## Phase 4: Selling Flow

### Standard plan (most clients)

1. Client points their domain to your VPS (GoDaddy DNS update on their side).
2. You map the domain in CMS:
   - `clientdomain.com` -> `siteId`
   - `www.clientdomain.com` -> `siteId`

Result: the client’s domain serves their site from the shared platform.

### Premium plan (optional spin-off)

Goal: isolated frontend deployment (separate service/container) per client, but content remains in the central CMS by `siteId`.

Implementation approach (fast and low-maintenance):

- Run the same frontend code as a separate container/service.
- Set `SITE_ID=<siteId>` so the frontend is “locked” to that client site.
- Route the client domain to that dedicated service via Traefik/Nginx.

Result: you can spin off an isolated frontend on the same VPS quickly (target: under 1 hour).

## Phase 5: Template #1 “Superset” Hardening (Baseline)

Template #1 (`marketing-smb-v1`) is treated as the “superset baseline”.

Rule:
- If a feature is common across many SMBs, it belongs in Template #1.
- Future templates should usually be variants (style + composition), not new capabilities.

Definition of Done for Template #1:
- Demo site can be created from script with zero manual CMS clicks.
- Shared platform serves it correctly by hostname.
- Header and footer navigation work (locale-prefixed URLs).
- Pages render from CMS blocks (no fallback for the main pages).
- Legal pages render.
- Offers and case studies routes render and list seeded content.

## Phase 6: VPS Deployment (Shared Platform + CMS)

Once credentials exist, deployment becomes:
- run CMS container (connected to Supabase)
- run shared frontend container
- run reverse proxy (Traefik recommended) to route hostnames and issue TLS certs

Notes:
- `*.linktrend.media` wildcard DNS makes demo creation fast.
- TLS strategy depends on whether wildcard cert issuance is feasible (GoDaddy DNS API limits can affect this).

## Where New Work Will Happen (Repo Locations)

- CMS collections/blocks:
  - `/Users/linktrend/Projects/LiNKsites/apps/cms/src/collections`
  - `/Users/linktrend/Projects/LiNKsites/apps/cms/src/blocks`
- Factory scripts (create site, attach domain):
  - `/Users/linktrend/Projects/LiNKsites/apps/cms/scripts/factory`
- Shared platform multi-tenant logic:
  - `/Users/linktrend/Projects/LiNKsites/apps/web-master/src/lib/site-context.ts`
- Template modules (frontend “templates inside one shared platform”):
  - `/Users/linktrend/Projects/LiNKsites/apps/web-master/src/templates`

