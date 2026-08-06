# LiNKsites pre-VPS deployment bundle

This directory is the only active deployment surface. It is prepared for a
separately authorized Phase 2 VPS installation; it does not itself contact a
VPS, cloud account, DNS provider, Traefik host, or public domain.

1. Build exact images and record immutable digests.
2. Generate `deploy/manifests/<release-sha>.json`.
3. Create the protected runtime file from `config/production.env.example`.
4. Run `pnpm deploy:preflight -- <runtime-env-file> <release-manifest>`.
5. Follow [OPERATIONS.md](./OPERATIONS.md) for ordered migration, private
   startup, smoke checks, backup verification, incidents, and rollback.

The Compose file fails closed on absent values. It has an internal service
network and an existing external Traefik edge network; its routers name
preconfigured privacy middleware, and no public DNS/domain operation occurs in
this repository.
