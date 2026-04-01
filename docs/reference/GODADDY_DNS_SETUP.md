# GoDaddy DNS Setup (Demos + Client Domains)

Your DNS provider is GoDaddy. You need DNS records so requests reach your VPS.

## Demo Subdomains (Recommended)

Goal: any demo like `greenturf.linktrend.media` should work without creating a DNS record each time.

In GoDaddy DNS for `linktrend.media`, add:

- `A` record
  - Name/Host: `*`
  - Value: `<your VPS public IP>`
  - TTL: default (or 1 hour)

This makes `anything.linktrend.media` point to your VPS.

Optional but often useful:
- `A` record for the apex/root domain
  - Name/Host: `@`
  - Value: `<your VPS public IP>`

## Client Domains (Per Client)

When a client buys and wants to use `clientdomain.com`:

In the client’s DNS:
- Point `@` (root) to your VPS IP (A record)
- Point `www` to `@` (CNAME) or also to your VPS IP (A record)

Then in the CMS you map:
- `clientdomain.com` -> `siteId`
- `www.clientdomain.com` -> `siteId`

## SSL Certificates (Important)

Demos with `*.linktrend.media` typically need a wildcard certificate.

There are 2 practical options:

1. Automated wildcard via DNS-01 (best long-term)
   - Requires automating DNS TXT records (usually via an API key).
2. Skip wildcard and issue per-subdomain certs via HTTP-01
   - Works well to start (no DNS API needed), but can hit rate limits if you generate many demo subdomains quickly.

If GoDaddy API automation is not available on your account, the simplest long-term solution is often:
- Keep GoDaddy as the registrar
- Move DNS hosting to a provider with strong automation (Cloudflare is common)

GoDaddy DNS automation note:
- GoDaddy limits production API access for some domain-related endpoints. In practice, automated DNS-01 wildcard issuance can be blocked unless your account meets GoDaddy’s current eligibility requirements (commonly tied to having a minimum number of active domains and/or a paid plan/spend threshold). If you don’t meet the requirement, wildcard issuance via DNS-01 may be blocked.

Practical recommendation:
- Start with option (2) using HTTP-01 (Traefik/Nginx can do this automatically).
- If you later need wildcard at scale, move DNS hosting to a provider with reliable DNS API automation (keeping GoDaddy as registrar is fine).
