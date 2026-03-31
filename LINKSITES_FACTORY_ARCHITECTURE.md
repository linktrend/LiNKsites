# LiNKsites Factory Kit - Architecture Notes (Shared Platform + Optional Spin-Off)

## What You Get With This Architecture

1. One shared Next.js “platform” serves many sites (many domains).
2. Each request is mapped to a `siteId` (tenant) based on the hostname.
3. Payload CMS stores content for all sites, separated by `siteId`.
   - Database: PostgreSQL hosted on Supabase.
4. Standard customers stay on the shared platform (lowest cost).
5. Premium customers can be “spun off” to an isolated frontend (separate deploy) while still using the same CMS by `siteId`.

This matches the “build first, sell later” approach because demos are cheap and instant.

## How Multi-Tenant Routing Works (Plain English)

When someone visits `greenturf.linktrend.media`:

1. The shared Next.js server reads the hostname from the request.
2. It looks up that hostname in the CMS collection `site-domains`.
3. The CMS returns which `siteId` that hostname belongs to.
4. The Next.js app loads pages/content from Payload CMS, always scoped to that `siteId`.

So one running app can serve thousands of different sites, without cloning repos.

## VPS Routing (High Level)

On your VPS you typically run a reverse proxy (Nginx or Traefik):

- All “standard” sites point at the shared platform service.
- Any “premium” spun-off sites point at their dedicated frontend service.

The proxy decides where to route based on the hostname (domain name).

## Data Isolation Rules (Critical)

The shared platform must always do reads like:

- `siteId = <resolved tenant>`
- `locale = <requested locale>`
- `status = published` for public traffic

And the CMS must enforce those rules server-side (not just in frontend code).

In this repo we’re using:

- A `site-domains` collection to map `hostname -> site`
- Access control that only allows unauthenticated reads when `?site=<siteId>` is present and the collection is on the public allowlist

## Template Modules (How You Add More Templates)

Templates are modules inside the shared platform:

- `marketing-smb-v1` is the initial baseline/superset.
- Future templates should be variants: theme + layout defaults + seed preset.

The CMS stores `templateId` in `site-settings` (and also in `sites` for admin visibility).
The shared platform reads `templateId` for the current `siteId`, then picks the right template module to render.

## Spin-Off (Premium) Model

Premium spin-off is “isolated frontend only”:

- Separate repo/deploy/service (per client) for the frontend
- Still reads from the same central Payload CMS
- Uses a fixed env var like `SITE_ID=<clientSiteId>` so it never needs hostname lookup

This is usually doable within an hour once automated, because the CMS and content are already ready.

## Tradeoffs (Why This Is Usually Best)

Pros:
- Fast demos (no per-site build pipeline)
- Low hosting cost for most customers
- One place to maintain the CMS and shared platform

Cons:
- Shared platform deployments affect many sites at once (need cautious releases)
- “Noisy neighbor” risk (one heavy site can affect others if not controlled)
- Requires careful caching, rate limiting, and monitoring

For your business model (low price, high volume, outreach), shared platform first is typically the lowest-cost path.
