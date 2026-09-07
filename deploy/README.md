# LiNKsites pre-VPS deployment bundle

This directory is the only active deployment surface. It is prepared for a
separately authorized Phase 2 VPS installation; it does not itself contact a
VPS, cloud account, DNS provider, Traefik host, or public domain.

Server03 uses the currently admitted `marketing-smb-v1` provider for real CMS,
renderer, worker, Program intake and private-preview operation. The unfinished
`master-template-type-1` replacement remains deferred in the manifest and is
not a setup or operational-acceptance prerequisite. The foundation Compose
entrypoint includes the canonical production definition and its existing
private Traefik middleware requirements. Use:

1. Generate a manifest with `--provider-state ready` and the exact admitted
   LiNKlibraries commit and artifact directory. Record `--platform-state pending`
   only for an artifact inventory while production migration authority is absent.
2. Run `pnpm deploy:server03:preflight -- <runtime-env-file> <manifest>`.
3. After exact Platform authority and preflight pass, apply migrations and start
   `deploy/docker-compose.server03-foundation.yml`. Pending authority permits
   artifact inventory and disposable rehearsal only, not operational acceptance.
4. Run `pnpm deploy:server03:smoke -- <runtime-env-file>`.

Operational acceptance requires a real private one-site run through intake,
CMS publication, admitted-template rendering, completion delivery and restore.
Readiness probes alone do not prove that run. Public release and adoption of
the deferred replacement each remain separate approval events.

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
