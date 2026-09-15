# LiNKsites open-source inventory and selection rules

Status: planning inventory plus FR-13 continuity classification; **not**
completion of LSSEC-01, LSART-01 or any live packet. Final lock/digest,
archive, licence and rollback evidence is produced by the owning packets.

Inspected writer identity for this amendment: `linktrend/LiNKsites`
`issue/540-incorporate-immutable-oss-preservation-reproduci`
commit `2829e539855006f57563d3c0aa42985897ca29ca`
tree `2deb6807587d95f0260a53b4f182dc587d6784ae`.
Live Server03, GHCR and GitHub Dependabot APIs were not queried. This
packet did not download, vendor, mirror, fork or modify external software.

The lean delivery reuses the existing LiNKsites stack and Server03 shared
services. No new SaaS, public platform or second infrastructure stack is
required to finish the agreed work. Continuity follows
`OSS-CONTINUITY-RULE.md`. Classifications below are only: completed;
completed but needs testing or fixing; missing; unknown.

| Component | Verified source identity (this commit) | Intended use | Owning packet | FR-13 classification | Required action |
| --- | --- | --- | --- | --- | --- |
| Node.js | Production Dockerfiles `FROM node:22.17.0-alpine@sha256:fc3e945f920b7e3000cd1af86c4ae406ec70c72f328b667baf0f3a8910d69eed`. CI `node-version: 22` (major only). `.nvmrc` is `22`. | build and run CMS, renderer, worker, orchestrator | LSDEP-01 (images); LSVAL-01 (CI toolchain) | completed but needs testing or fixing (production Dockerfile digest pin exists); missing archive/rollback; CI compiler unpinned | keep digest; add LiNKtrend archive of that exact image; pin CI/Node beyond major when LSDEP-01/LSTRUST-01 next edit workflows; do not treat host `v22.14.0`/`v22.22.2` as the production pin |
| pnpm | `packageManager` `pnpm@10.0.0` (no integrity hash). Dockerfiles `corepack prepare pnpm@10.0.0`. Lockfile `pnpm-lock.yaml` lockfileVersion 9.0, SHA-256 `dd59517f5cdd414fd1d3de314397178e42a14de5a536fb26c79c8948ca419175`. | frozen monorepo install/build | LSSEC-01 | completed but needs testing or fixing (version + frozen lock exist); missing hash-locked pnpm binary archive | regenerate lock only through LSSEC-01; require frozen install; archive exact pnpm 10.0.0; `apps/cms/docker-compose.yml` `pnpm@latest` is non-production and forbidden for release |
| Next.js | CMS and web-master declare `16.3.3`; lock integrity `sha512-tuRTx1nQ/yVw83cwJBo9F+njGUgMn3UHQycreWHB8XsStvvAh1AthbI8/4IpKnFaF58F+iSiHejYOlMQ/eq83g==` | CMS/admin and server-rendered websites | LSSEC-01 | missing (no LiNKtrend artifact archive; updates/rollback unproven) | archive exact tarball; reviewed updates only; LSSEC-01 still owns advisories |
| React | CMS and web-master declare `19.1.0`; lock integrity `sha512-FS+XFBNvn3GTAWq26joslQgWNoFu08F4kl0J4CgdNKADkdSGXQyTCnKteIAJy96Br6YbpEU1LSzV5dYtjMkMDg==` | website/admin rendering | LSSEC-01 | missing | same as Next.js |
| Payload CMS | CMS declares `3.87.1`; lock integrity `sha512-0dvxM5CaywBwJJBH+9a+JNIBMjUJQJEMCaxB+lkV4I0PL8rIU8tAno+i3cXS7UF7Qwcm1kpqTrxRoiA37HIOiw==` | tenant/site content and admin | LSSEC-01 | missing | archive exact artifacts; least-privilege Postgres/private admin remains architecture; advisory disposition is not continuity |
| PostgreSQL | migrations + local-proof `postgres:16.8-alpine@sha256:3b057e1c2c6dfee60a30950096f3fab33be141dbb0fdd7af3d477083de94166c`; `apps/cms/docker-compose.yml` still `postgres:16-alpine` (floating, non-production). Server03 shared service not inspected this session | Payload, Program, operational persistence | LSDEP-01 / LSVPS-03 | completed but needs testing or fixing (local-proof/migrations digest); unknown for live Server03; missing archive | reuse shared Server03 database; no competing production DB container; archive the digest; do not select the floating compose file |
| `pg` | orchestrator `8.16.3`; CMS `^8.16.3` resolved via lock; integrity `sha512-enxc1h0jA/aq5oSDMvqyW3q89ra6XIIDZgCX9vkMrnz5DFTw/Ny3Li2lFQ+pt3L6MCgm/5o2o8HW9hiJji+xvw==` | PostgreSQL client | LSSEC-01 | missing | archive locked artifact |
| Traefik | local-proof `traefik:v3.0@sha256:a208c74fd80a566d4ea376053bff73d31616d7af3f1465a7747b8b89ee34d97e`; production expected to reuse shared Server03 Traefik (live identity not inspected) | private CMS/preview routing | LSDEP-01 / LSVPS-05 | unknown (live); completed but needs testing or fixing for local-proof pin | add only LiNKsites routers; archive exact proxy image actually used in production after live identity is known |
| Redis | no production Compose service in `deploy/docker-compose.deploy.yml` | only if accepted runtime contract requires it | LSDEP-01 | unknown | do not infer use from Server03 availability |
| MinIO | not declared in production Compose inspected here | Payload/media only if selected | LSDEP-01 | unknown | same |
| Prometheus/Grafana | not declared in LiNKsites Compose inspected here | scoped metrics | LSOPS-01 | unknown | add only scoped rules; no second stack |
| Docker Engine / Compose | planning text previously recorded Server03 Docker 29.8.0; **not re-verified this session**. Production project `linksites-foundation` includes `docker-compose.deploy.yml` requiring `${LINKSITES_*_IMAGE}` digest variables | single installation | LSDEP-01 / LSVPS-04 | unknown (engine); completed but needs testing or fixing (Compose requires digest env) | render from exact release manifest; five images unpublished |
| Playwright | CMS `1.56.1`; lock integrity `sha512-aFi5B0WovBHTEvpM3DzXTUaeN6eN0qWnTkKx4NQaH4Wvcmc153PdaY2UBdSYKaGYw+UyWXSVyxDUg5DoPEttjw==` | bounded browser acceptance | LSSEC-01 / LSVAL-01 | missing | archive npm + browser bits actually used; caches are not the archive |
| TypeScript | core packages `5.7.3`; lock integrity `sha512-84MVSjMEHP+FQRPy3pX9sTVV/INIex71s9TL2Gm5FG/WG1SqXeKyZ0k7/blY/4FdOzI12CBy1vGc4og/eus0fw==` | source/type validation | LSSEC-01 | missing | archive locked compiler package; host Node is not this pin |
| Turbo | root `^2.10.5`; lock `turbo@2.10.5` integrity `sha512-07Y/C7OUp23l4P92PJoYtFNbHjLhftrZH5Ce7dbczS4kX2Re+wtbXvZLoxn/pUtzgsQaRCBaRuZPJp4zmAn0WQ==` | monorepo task runner | LSSEC-01 | missing | archive locked artifact; caret range is not the production identity |
| GitHub Actions (CI Fast/Full) | `.github/workflows/ci.yml` uses floating `actions/checkout@v4`, `pnpm/action-setup@v4`, `actions/setup-node@v4`, `docker/setup-buildx-action@v3`, `supabase/setup-cli@v1` (CLI version `2.81.3` in Full only) | hosted checks | LSTRUST-01 / LSVAL-01 | missing (floating action tags) | digest-pin actions on next allowed workflow edit; Full Suite not run here |
| Publish-image actions | `publish-server03-images.yml` commit-pins checkout/buildx/login/build-push | five-image publication | LSART-01 | completed but needs testing or fixing (action SHAs present); missing published image digests and archive | LSART-01 still unpublished |
| Alpine APK (`libc6-compat`, git, ca-certificates) | `apk add --no-cache` without package versions/digests in production Dockerfiles | image build | LSDEP-01 | missing | pin or snapshot APK inputs into the owned archive; unpinned apk is not immutable |
| Five LiNKsites service images | Compose requires digest-valued env; no published digest in this tree | production runtime | LSART-01 | missing | publish by digest; archive; tested rollback to a prior digest |
| Git/GitHub | existing protected delivery system | source authority | LSREL-01 | not an installable OSS runtime dependency | use packager/controller; no direct protected write |
| Tailscale | planning inventory only; not inspected this session | private founder access | LSVPS-05 | unknown | reuse existing private boundary after live identity is known |

## Current dependency advisory baseline

Planning text on 2026-09-10 recorded 33 open Dependabot alerts. Coordinator
observation on 2026-09-12 recorded 48 default-branch alerts
(`SECURITY-DISPOSITIONS.json`). This session did **not** query the GitHub
alert API and does **not** close or refresh that inventory. LSSEC-01 remains
the owner. An unresolved exploitable critical/high finding in the
build-to-deploy closure still blocks Full acceptance. Continuity is a
separate bar: patched lock bytes without an owned archive still fail FR-13.

## Selection and continuity rules

1. Prefer existing locked dependencies and shared Server03 services except
   where exact security evidence requires a compatible upgrade.
2. A new dependency is allowed only when an atomic requirement cannot be met by
   current code or a small repository-owned implementation, and the packet
   records purpose, licence, maintenance, security, size, rollback **and**
   FR-13 archive identity.
3. Production images and external binaries are immutable by digest. Package
   manager ranges are accepted only through the checked-in lockfile. The
   lockfile is the resolution record, not the LiNKtrend archive.
4. No component is called operational because it exists on Server03. It must
   be configured, scoped, healthy and proven through the LiNKsites release.
5. No paid product or extra server is required by this plan. Any newly
   discovered spend or account creation is a genuine founder gate.
6. LSSEC-01 owns dependency remediation/disposition once after the main source
   lanes. Licence and vulnerability validation then runs on the consolidated
   final source/dependency identity (LSVAL-01) and is rerun only after
   dependency bytes change.
7. Active forks of upstream OSS are prohibited unless the founder separately
   approves a confirmed unmet need. A read-only archive is not a fork.
8. This inventory does not claim any installation, release or packet complete.
