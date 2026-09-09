# LiNKsites pre-VPS deployment bundle

This directory is the only active deployment surface. It is prepared for a
separately authorized Phase 2 VPS installation; it does not itself contact a
VPS, cloud account, DNS provider, Traefik host, or public domain.

Server03 uses the real CMS, renderer, worker and Program runtime for
infrastructure/application acceptance while native v2 template-dependent
publishing remains explicitly deferred. No legacy or quarantined template is
represented as production-ready. The unfinished `master-template-type-1`
release is not a setup prerequisite. The foundation Compose
entrypoint includes the canonical production definition and its existing
private Traefik middleware requirements. Use:

1. Generate a manifest with `--provider-state deferred`. Use `--provider-state
   ready` only with an exact native v2 provider commit/tree and passing receipt.
   Record `--platform-state pending` only for an artifact inventory while
   production migration authority is absent. A pending artifact is not
   operationally eligible and must not be passed to preflight or startup.
2. After exact Platform authority is admitted, regenerate a separate manifest
   with `--platform-state ready` and the exact migration SHA, then run
   `pnpm deploy:server03:preflight -- <runtime-env-file> <manifest>`.
3. After that preflight passes, apply migrations and start
   `deploy/docker-compose.server03-foundation.yml`. Deferred template state
   permits runtime acceptance but blocks template-dependent intake/publishing.
4. Run `pnpm deploy:server03:smoke -- <runtime-env-file>`.

Operational acceptance requires real private service runtime, health, resource,
restart, monitoring, backup/restore and rollback proof. Template-dependent
intake, rendering and publishing remain blocked until native v2 admission;
readiness probes alone do not prove production acceptance. Public release and
later template adoption remain separate approval events.

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
