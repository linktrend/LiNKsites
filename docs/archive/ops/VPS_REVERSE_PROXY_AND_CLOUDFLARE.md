# VPS Reverse Proxy + Cloudflare Plan (LiNKsites)

## Objective
Host CMS and frontend on a single droplet while keeping clean domains, TLS, and isolation. Hide origin IP with Cloudflare.

## Recommended stack
- **Reverse proxy:** Nginx or Caddy (Caddy is simplest for auto‑TLS; Nginx is standard).
- **Process manager:** systemd or PM2 for each service.
- **DNS + CDN:** Cloudflare proxy (orange cloud).

## Domains (example)
- `cms.yourdomain.com` → Payload CMS
- `www.yourdomain.com` → Frontend

## Steps
1. **Provision droplet** with Ubuntu LTS.
2. **Install Node + pnpm**, and system dependencies.
3. **Set up services**:
   - `linksites-cms` on port `3001`
   - `linksites-web` on port `3000`
4. **Configure reverse proxy**:
   - Route `/` for `www` → `localhost:3000`
   - Route `/` for `cms` → `localhost:3001`
5. **TLS**:
   - If using Cloudflare, set SSL mode to **Full (strict)**.
   - Use origin certs or Let’s Encrypt.
6. **Firewall**:
   - Allow only ports 80/443.
   - (Optional) restrict origin access to Cloudflare IP ranges.

## Cloudflare requirements
- Proxy records enabled (orange cloud).
- Set `A` records to droplet IP.
- Use **WAF** for basic protections.
- Set `cache bypass` rules for CMS admin and API routes.

## Why this is best practice
- One droplet, two isolated services.
- Clean domain separation.
- Cloudflare hides origin IP and adds security.

## Notes
- Do **not** expose CMS on the same domain/path as frontend.
- Keep CMS admin behind stronger auth or IP allowlist.
