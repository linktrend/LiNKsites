# LiNKsites pre-VPS deployment bundle

This directory is the only active deployment surface. It is prepared for a
separately authorized Phase 2 VPS installation; it does not itself contact a
VPS, cloud account, DNS provider, Traefik host, or public domain.

Server03 has a provider-independent foundation path. It installs and starts
the exact CMS, renderer, worker, orchestrator and migration images without
public ingress while the selected Master Website Template release is pending.
The renderer proves CMS-backed readiness; the orchestrator runs its explicit
staged service and refuses intake. Use:

1. Generate a manifest with `--provider-state pending`; also use
   `--platform-state pending` until an exact production migration receipt is
   admitted.
2. Run `pnpm deploy:server03:preflight -- <runtime-env-file> <manifest>`.
3. If Platform authority is ready, apply migrations and start
   `deploy/docker-compose.server03-foundation.yml`. Otherwise install the
   artifacts and run only the disposable rehearsal; production data-plane
   startup remains blocked independently of the template.
4. Run `pnpm deploy:server03:smoke -- <runtime-env-file>`.

This may earn Server03 software/infrastructure acceptance, but never template
admission, a completed site pilot, or public-release acceptance.

For the full provider-bound pilot:

1. Build exact images and record immutable digests.
2. Generate `deploy/manifests/<release-sha>.json`.
3. Create the protected runtime file from `config/production.env.example`.
4. Run `pnpm deploy:preflight -- <runtime-env-file> <release-manifest>`.
5. Follow [OPERATIONS.md](./OPERATIONS.md) for ordered migration, private
   startup, internal-topology smoke checks, backup verification, incidents, and rollback.

The Compose file fails closed on absent values. It has an internal service
network and an existing external Traefik edge network; its routers name
preconfigured privacy middleware, and no public DNS/domain operation occurs in
this repository.
