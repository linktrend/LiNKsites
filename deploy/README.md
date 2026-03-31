# Deployment (Skeleton)

This folder contains optional deployment scaffolding for running LiNKsites Factory Kit on a VPS.

It is intentionally provider-agnostic and uses placeholders because:
- DNS provider (for wildcard certs) is not specified
- Ports/domains will differ per VPS

Recommended next step is to choose:
- Traefik (Docker labels + ACME)
- or Nginx (manual config + Certbot)

If you want Traefik + Docker, add a compose file here that routes:
- `*.linktrend.media` -> shared frontend
- `cms.<your-domain>` -> Payload CMS admin/API

