# LiNKsites Factory Kit - Workflow

This document describes how LiNKsites Factory Kit creates demo websites quickly, sells them, and (optionally) spins them off into an isolated frontend deployment.

For day-to-day GitHub and repository handling, use:
- `/Users/linktrend/Projects/LiNKsites/library/operations/REPO_OPERATOR_SOP.md`

## Key Ideas (plain English)

- You run **one shared website platform** (a single Next.js app) that can serve many sites.
- The platform decides which site to show by looking at the **domain name** the visitor used (the hostname).
  - Example: `greenturf.linktrend.media` loads the Green Turf site because the hostname maps to a specific `siteId` in the CMS.
- All content lives in **one central Payload CMS** and is separated by `siteId` (and locale). The CMS database is PostgreSQL hosted on Supabase.
- If a premium client wants isolation, you can deploy a **dedicated frontend** for just that one site, while still using the same central CMS.

## Terminology

- **Site**: one client website (one tenant), identified by `siteId` in the CMS.
- **Template**: a reusable design + layout + seed preset that can generate many sites.
- **Shared platform**: one running Next.js app serving many sites by hostname.
- **Dedicated frontend**: a separate Next.js deployment serving one site only (premium).
- **Hostname mapping**: a CMS record mapping `hostname` (domain) -> `siteId`.
  - Examples: `greenturf.linktrend.media`, `greenturf.com`

## Workflow Overview

1. Create a demo site on the shared platform (subdomain).
2. Send the live demo URL to the business owner.
3. If they buy:
   - Standard plan: attach their domain to the shared platform.
   - Premium plan: spin off a dedicated frontend and attach their domain to that dedicated deployment.

## One-Time Setup (CMS + Database)

1. Create a Supabase project (Postgres).
2. Put the connection string in `/Users/linktrend/Projects/LiNKsites/apps/cms/.env` as `DATABASE_URI=...`.
3. Start the CMS and run the bootstrap seed (creates languages/role/default site mappings):
```bash
cd apps/cms
pnpm dev
pnpm factory:bootstrap
```

## Step-by-Step: Create a Demo Site

Inputs you decide:
- Business name (example: "Green Turf Lawns")
- Demo hostname (example: `greenturf.linktrend.media`)
- Template to use (example: `marketing-smb-v1`)
- Locales to enable (example: `en`)
- The copy/content you want the demo to contain (can be minimal initially)

Suggested command (runs inside the CMS repo):
```bash
cd apps/cms
pnpm factory:create-demo-site --name="Green Turf Lawns" --hostname=greenturf.linktrend.media --templateId=marketing-smb-v1 --locales=en
```

What the system does:
1. Create a new `Site` record in Payload CMS.
2. Create a hostname mapping:
   - `greenturf.linktrend.media` -> that new `siteId`
3. Seed the CMS with a minimum working site:
   - Navigation (primary + footer)
   - Core pages (home, about, contact, locations, team)
   - Legal pages (terms, privacy, cookie policy)
   - Offers/services (1 offer page)
   - Case studies (1 case study page)
   - Videos (1 video)
   - FAQ (1 FAQ page, flattened into Q/A for offer pages)
   - Articles are supported, but not seeded by default (they require an author user + a media upload)
4. Publish seeded content.

Result:
- The site is instantly accessible at `https://greenturf.linktrend.media` from the shared platform.

## Step-by-Step: Client Buys (Standard Plan)

Goal:
- Use the shared platform, but on the client's own domain (example: `greenturf.com`).

Steps:
1. Client updates DNS to point `greenturf.com` to your platform.
2. You add a hostname mapping:
   - `greenturf.com` -> the existing `siteId`
   - Suggested command:
   ```bash
   cd apps/cms
   pnpm factory:attach-domain --siteId=<siteId> --hostname=greenturf.com --primary=true
   pnpm factory:attach-domain --siteId=<siteId> --hostname=www.greenturf.com --primary=false
   ```
3. TLS/SSL is issued automatically by the VPS router (Traefik/Nginx).

Result:
- `https://greenturf.com` serves the same site, on the shared platform.

## Step-by-Step: Client Buys (Premium Plan: Dedicated Frontend)

Goal:
- Client gets an isolated frontend deployment (separate service/container), still using the central CMS by `siteId`.

Steps:
1. Deploy a dedicated frontend instance:
   - Configure it with the same CMS URL and the same `siteId`.
   - Optionally generate a dedicated "read-only" API key scoped to that site.
2. Configure VPS routing so `greenturf.com` points to the dedicated instance.
3. Confirm TLS/SSL is issued and site loads.

Result:
- `https://greenturf.com` is now served by the dedicated frontend.

## Maintenance / Updates

- Content updates happen in one place: the central Payload CMS.
- Shared platform code updates:
  - Affect all standard-plan sites (and demos) at once.
  - Should be released carefully (staging first, then production).
- Dedicated frontend updates:
  - Can follow the shared platform version, but deployed per premium site if you choose.

## What "Custom Work" Means

To keep costs low, define two categories clearly:

- Template-level changes:
  - Improve a template for all future sites (good investment).
- Client-specific custom changes:
  - Small modifications based on a template (upsell).
  - Avoid changes that require new CMS schema unless the price and ongoing maintenance justify it.

## Capabilities Included in Template #1 (marketing-smb-v1)

Template #1 should cover the most common SMB needs so future templates are usually just "variants":

- Pages with flexible blocks (home, about, generic pages)
- Offers/services index + detail
- Articles/blog
- Case studies
- Testimonials
- Videos (YouTube embed, optional ingestion)
- FAQ/help
- Legal pages
- Contact form + webhook
- Newsletter signup
- Multi-language (locale-prefixed routes)
- Multi-location (multiple addresses and location pages)
- Team members / staff profiles page
