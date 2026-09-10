# LiNKsites open-source inventory and selection rules

Status: planning inventory; final lock/digest and licence evidence is produced
by the owning implementation/release packet

The lean delivery reuses the existing LiNKsites stack and Server03 shared
services. No new SaaS, public platform or second infrastructure stack is
required to finish the agreed work.

| Component | Current repository/runtime evidence | Intended use | Required action |
| --- | --- | --- | --- |
| Node.js | production Dockerfiles use 22.17.0 Alpine; most are digest-pinned | build and run CMS, renderer, worker and orchestrator | make every production Dockerfile use the same immutable digest; the current CMS Dockerfile tag-only base must be repaired |
| pnpm | root declares `pnpm@10.0.0` | locked monorepo install/build | regenerate the exact lock only through LSSEC-01 after the smallest compatible manifest/override change; require frozen install |
| Next.js | CMS and web-master declare 16.2.10 | CMS/admin and server-rendered websites | current high/medium alerts require LSSEC-01 remediation to at least the patched compatible release before release |
| React | CMS and web-master declare 19.1.0 | website/admin rendering | preserve exact lock resolution |
| Payload CMS | CMS declares 3.87.1 | tenant/site content, draft/published lifecycle and admin | current medium advisory requires exact remediation or evidence-backed disposition; preserve architecture and configure least-privilege PostgreSQL/private admin routing |
| PostgreSQL | migrations/local proof use 16.8 Alpine digest; Server03 shared service exists | Payload, Program and operational persistence | reuse shared Server03 database; no competing database container in production |
| `pg` | CMS/orchestrator use 8.16.x | PostgreSQL client | retain locked compatible version |
| Traefik | shared Server03 Traefik exists; local proof pins v3.0 digest | private CMS/preview routing | add only LiNKsites routers/middleware references; do not install a second proxy |
| Redis | shared Server03 service exists | only if current accepted LiNKsites runtime contract actually requires it | connect through scoped configuration or omit; do not infer use from availability |
| MinIO | shared Server03 service exists | Payload/media storage only if selected by the accepted runtime contract | configure scoped bucket/identity and backup or leave unused |
| Prometheus/Grafana stack | shared observability exists | LiNKsites metrics, alerts and dashboards | add only scoped rules/scrape/dashboard material; no second stack |
| Docker Compose | Server03 Docker 29.8.0 | single `linksites-foundation` installation | render from exact release manifest and digest-pinned images |
| Playwright | CMS declares 1.56.1 | bounded real browser acceptance | use for the final changed flows and live private site; do not create repetitive visual audits |
| TypeScript | core packages use 5.7.3 | source/type validation | retain current locked toolchain |
| Git/GitHub | existing protected delivery system | source authority, review, promotion and immutable identity | use issue checkpoints, Phase Packager and controller; no direct protected write |
| Tailscale | Server03 machine identity and private middleware observed | private founder access | reuse existing private boundary; validate exact hostname before build/deploy |

## Current dependency advisory baseline

The GitHub Dependabot API was refreshed on 2026-09-10 against the repository
and returned 33 open alerts: 13 high and 20 medium. Package counts are Next.js
27, Payload 2, `qs` 2, `sharp` 1 and `@vitest/mocker` 1. Manifest locations are
`apps/cms/package.json` (11), `apps/web-master/package.json` (9),
`archive/paused-applications/web-company/package.json` (9) and
`pnpm-lock.yaml` (4). This is an alert inventory, not an exploitability finding
and not proof that archived code is deployed.

LSSEC-01 refreshes these exact records after source integration, maps them to
the build and deployed image closure, and either performs the smallest
compatible remediation or records a specific non-applicable/deferred
disposition with evidence, owner and acceptance threshold. An unresolved
exploitable critical/high finding in the build-to-deploy closure blocks Full
acceptance and release. A security exception is founder-reserved.

## Selection rules

1. Prefer existing locked dependencies and shared Server03 services except
   where exact security evidence requires a compatible upgrade.
2. A new dependency is allowed only when an atomic requirement cannot be met by
   current code or a small repository-owned implementation, and the packet
   records purpose, licence, maintenance, security, size and rollback.
3. Production images and external binaries are immutable by digest. Package
   manager ranges are accepted only through the checked-in lockfile.
4. No component is called operational because it exists on Server03. It must be
   configured, scoped, healthy and proven through the LiNKsites release.
5. No paid product or extra server is required by this plan. Any newly
   discovered spend or account creation is a genuine founder gate.
6. LSSEC-01 owns dependency remediation/disposition once after the main source
   lanes. Licence and vulnerability validation then runs on the consolidated
   final source/dependency identity and is rerun only after dependency bytes
   change.
