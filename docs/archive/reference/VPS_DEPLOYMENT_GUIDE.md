# LiNKsites Factory Kit - VPS Deployment Guide (Shared Platform + Premium Spin-Offs)

This is a practical deployment outline for hosting:
- One shared multi-tenant Next.js frontend (standard plan + demos)
- Optional dedicated Next.js frontends (premium spin-offs)
- One central Payload CMS
- Database hosted on Supabase (Postgres)

## Recommended Layout (Same VPS)

- Reverse proxy: Traefik or Nginx
- Services:
  - `cms` (Payload CMS)
  - `frontend-shared` (multi-tenant Next.js)
  - `frontend-<client>` (optional per premium client)

The reverse proxy routes by hostname:
- `*.linktrend.media` -> `frontend-shared` (demos)
- Most client domains -> `frontend-shared` (standard)
- Premium client domains -> their dedicated `frontend-<client>`

## DNS Setup

Demos:
- Create a wildcard DNS record:
  - `*.linktrend.media` -> your VPS IP
  - See: `GODADDY_DNS_SETUP.md`

Client domains:
- Point `exampleclient.com` and `www.exampleclient.com` -> your VPS IP

## TLS / SSL

You need automatic certificates:
- For demos: a wildcard certificate for `*.linktrend.media` (usually easiest with DNS-01 challenge).
- For client domains: certificates per domain via ACME (HTTP-01 or DNS-01).

Important:
- Avoid manual certificate steps because you will add many domains over time.
- If DNS is hosted at GoDaddy, DNS-01 automation may require API access; if that’s not available, consider moving DNS hosting to a provider with better automation while keeping GoDaddy as registrar.

Suggested starting approach:
- Use HTTP-01 for demo subdomains (no DNS API needed) and keep demo volume under common CA rate limits.
- Upgrade to wildcard DNS-01 later if your volume requires it.

## Shared Platform Environment Variables (Concept)

The shared frontend typically needs:
- CMS base URL (Payload)
- Optional API key (or public read with strict access rules)
- No fixed `SITE_ID` (because tenant is resolved by hostname)

The shared frontend resolves:
- hostname -> `siteId` via CMS `site-domains`

## Dedicated Frontend (Premium) Environment Variables (Concept)

Dedicated frontend typically needs:
- CMS base URL
- Fixed `SITE_ID=<clientSiteId>` (locks the frontend to one tenant)

This removes the need for hostname lookup.

## Operational Notes

- Deploy shared platform updates carefully (affects many sites).
- Add basic monitoring (uptime + error tracking).
- Add rate limiting at the proxy layer to protect CMS.
- Consider caching for read-heavy endpoints once correctness is proven.
