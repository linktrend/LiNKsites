# LiNKsites End-to-End Completion PRD

Status: pre-execution specification; no implementation or production change is authorized
Prepared: 2026-09-10, Asia/Taipei
Product: LiNKsites only
Target: one production installation on Server03

## 1. Purpose

Complete LiNKsites from the current protected repository state through one verified production installation and one real private website pilot. The work must preserve useful existing work, avoid duplicate engineering, use the already installed IDE Development 2.5.2 process, use the existing Cursor SDK/API route for normal Grok work, and require a separate founder approval before implementation begins.

This document is an execution specification. It is not execution approval.

## 2. Governing rules

1. Do not claim a fact unless supported by current evidence or explicitly labelled as a decision still to be resolved.
2. Never discard existing work merely because it is unmerged, stale, or untidy. Compare it to the protected source, retain useful changes, refactor or complete them, and record the disposition of every unique branch.
3. Use exactly one live installation: Server03. There is no separate staging server. The Git branches `development`, `staging`, and `main` remain source-control promotion stages only.
4. Do not change Server03 until the final source candidate, image digests, backup plan, runtime configuration, and rollback plan have passed their entry gates.
5. Use focused tests while implementing each packet, one complete source suite on the consolidated candidate, one independent source/release review, and one independent final operational review. Do not create repetitive audit loops.
6. Checkpoint engineering work with commit and push. Collate substantial compatible work into a small number of Phase PRs, then use one source promotion sequence and one production installation.
7. Normal engineering route: Cursor SDK/API, Grok 4.6 Medium, Fast off, explicit repository/ref/commit/tree binding. A named Cursor environment may be maintained for convenience but is not routing authority.
8. Founder bootstrap may be used only as an expedited, truthful recovery path when the normal protected release mechanism is technically unable to complete. It must use real commits, real test results, real review evidence, and real readback. It may waive a broken publishing mechanism; it may never invent or label missing evidence as PASS.
9. No public customer launch, customer domain activation, payment, sales workflow, or post-sales activity is included.

## 3. Verified starting state

The following facts were read back on 2026-09-10.

### 3.1 Protected repository identities

| Branch | Commit | Tree |
|---|---|---|
| `development` | `4b2dbaf5c0ce34076e5d62f8703bbda197dd8ffb` | `e29607c43146decdf81c2f132562745f6a911780` |
| `staging` | `b67221f90c1eff6a96592cc7be74390c9b843da2` | `e29607c43146decdf81c2f132562745f6a911780` |
| `main` | `9eb995d7c151aab6aafabd66e91893084e1acdb2` | `fa16550a8d1981a37113c4ba356cbb0ff0a369f8` |

Protected `development` is a verified GitHub merge commit. Its accepted parent candidate `6bf85741e9b0881e0cf0a15e14a6ef8540ce410f` passed GitHub Full Suite run `34165549526`.

### 3.2 GitHub release controls

- GitHub authentication is active for `linktrend/LiNKsites` with repository and workflow access.
- `development` requires `Linktrend Fast Checks` and `Linktrend Branch Source Policy`.
- `staging` and `main` require `Linktrend Receipt Gate` and `Linktrend Branch Source Policy`.
- The three active rulesets have no bypass actors.
- The current promotion workflows consume a transition receipt supplied through promotion PR metadata. The final repair must bind that receipt to current protected branch state and to a trusted producer; candidate code must not be able to authorize itself.
- Issue 511 contains useful adversarial tests and CI changes, but it does not by itself repair the complete trust boundary.

### 3.3 Existing source capability

Protected source contains production-oriented CMS, `web-master`, worker, Program orchestrator, PostgreSQL/Payload migrations, factory catalog, image Dockerfiles, immutable deployment-manifest tooling, Server03 Compose, runtime preflight, post-deployment smoke, monitoring rules, and restore/Compose rehearsal tooling. Repository evidence that says “complete” or “released” is historical source evidence; it is not proof of a current live LiNKsites installation.

### 3.4 Existing work that must be preserved

- The primary checkout has a pre-existing user-owned modification at `apps/cms/next-env.d.ts`. It must not be overwritten, staged, or moved without an explicit preservation procedure.
- Most remote issue branches through Issue 501 are already ancestors of protected `development` and have no unique commits.
- Unique work exists on three Issue 480 variants and Issues 490, 492, 508, and 511. Stale Phase branches also contain a small number of unique tips. Each must receive a recorded `retain`, `superseded`, `already integrated`, or `not applicable` disposition based on file-level comparison; none may be deleted as part of this delivery.
- Issue 511 head: `56125fc5e83cc0f223a085561bcadfe32e4f2652`, tree `34a42e3c3bf7ec1910df9fca8a71cb55ec979c8b`.

### 3.5 Server03

- SSH access works through `linkserver-03`.
- Docker 29.8.0 is available through non-interactive `sudo`.
- Seventeen existing containers are running and healthy, including Traefik, PostgreSQL, Redis, MinIO, monitoring, and other portfolio applications.
- Existing shared networks include `linktrend-s03-proxy`, `linktrend-s03-core-private`, and `linktrend-s03-data`.
- PostgreSQL already contains databases and roles named `linksites` and `linksites_payload_baseline`; administrative access was verified without revealing credentials.
- The PostgreSQL container contains a LiNKsites-specific database password variable.
- No `linksites-foundation` Compose project is running.
- `/srv/linktrend/apps/linksites` and `/srv/linktrend/backups/linksites` do not exist.
- `/srv/linktrend/apps/core/dynamic/linksites.yml` contains private Tailscale middlewares but no LiNKsites routers.
- Historical LiNKsites release material and Issue 470 rehearsal material exist on the server. They are inputs for reconciliation, not proof of deployment.

### 3.6 Cursor execution access

- IDE Development 2.5.2 defines direct Cursor SDK/API with explicit `repos[]` binding as the normal post-Gate-0 route.
- The running LiNKdeveloper factory on Server03 contains `@cursor/sdk` 1.0.23 and a present `CURSOR_API_KEY` environment variable. Its value was not displayed.
- The local `cursor-agent` CLI login state is irrelevant to SDK/API authority and must not be used as a blocker.
- No Cursor worker is to be dispatched before founder execution approval.

## 4. Product definition of done

LiNKsites is DONE only when every item below is supported by exact evidence.

### 4.1 Source and release

1. All retained branches and dirty work have recorded dispositions; useful work is incorporated once and nothing is silently discarded.
2. Production uses the approved legacy `marketing-smb-v1` LiNKlibraries provider for the pilot. The unfinished replacement template remains excluded from selection and does not block the pilot.
3. The production configuration, runtime contract, manifest, orchestrator, renderer, and tests agree on that provider identity. No fake receipt, fake provider, test fixture, placeholder, or deferred publishing path can be credited as the operational pilot.
4. The promotion trust boundary cannot be satisfied by candidate-authored evidence, copied evidence, stale evidence, self-consistent fabricated evidence, or duplicate check names.
5. Focused packet tests pass.
6. One consolidated exact source candidate passes the complete source suite.
7. One independent reviewer returns PASS against the exact candidate commit and tree.
8. The accepted candidate is integrated into protected `development`, then promoted through `staging` to `main` with exact tree readback. Founder bootstrap is permitted only under the truthful recovery rule in section 2.

### 4.2 Immutable release

1. Exactly five production images are built from the accepted `main` source: CMS, web-master, worker, orchestrator, and migrations.
2. Each image is published by immutable digest, not a mutable tag alone.
3. A release manifest binds repository commit/tree, five digests, migration identities, template/provider identity, configuration schema, and build provenance.
4. Manifest generation and verification pass against the actual published digests.

### 4.3 One Server03 production installation

1. One Compose project named `linksites-foundation` is installed under `/srv/linktrend/apps/linksites` from an immutable release directory.
2. Existing portfolio services remain healthy and are not replaced.
3. Dedicated LiNKsites database roles, schemas, permissions, runtime directories, secrets, and persistent data are configured with least privilege.
4. Pre-change backup and isolated restore proof pass before migrations.
5. Migrations apply once, record exact identities, and are safe to rerun or fail closed.
6. CMS, web-master, worker, orchestrator, and migration job use the five exact digests and pass health checks after a controlled restart.
7. Private CMS and preview routes use existing Traefik/Tailscale controls; unknown hosts fail closed, unauthorised requests are denied, and preview content is `noindex,nofollow`.
8. Monitoring, logs, backup, restore, and rollback procedures work on the actual installation.

### 4.4 Real operational pilot

1. A founder-approved, legally usable, representative lead/research package is submitted through the real manual intake boundary exactly once.
2. The continuously operating Program processes it without manually inserting success records downstream.
3. It produces one complete private marketing website using `marketing-smb-v1`, real approved facts, real Payload content, and real `web-master` rendering.
4. The private site has the required routes and prospect-specific content; no mock, lorem, placeholder, unsupported claim, or fixture provider appears.
5. The result includes one traceable Program/Phase/Issue/Run/content/promotion/publication/deployment/completion chain and one CRM-shaped completion record containing the private URL and exact identities.
6. Replaying the same logical input creates no duplicate site, publication, deployment, or completion record.
7. A controlled restart or recovery test resumes safely without duplication or data corruption.
8. Functional, responsive, accessibility, metadata, privacy, tenancy, security, and practical performance acceptance pass for the pilot.
9. One independent operational reviewer returns PASS against the deployed digests and live private site.

## 5. Explicit exclusions

- A second Server03 installation or a separate staging server.
- Public launch or customer domain cutover.
- Billing, payment, sales, CRM write-back beyond the shaped completion record, or post-sales.
- Completion of the unfinished native Revision 2 replacement template.
- Changes to the IDE Development repository or installed `.ide-development` package.
- Broad refactors unrelated to the definition of done.
- Repeating tests or audits solely to create more evidence.

## 6. Required architecture

### 6.1 Source flow

`issue/* checkpoints` → `one or few Phase PRs` → protected `development` → protected `staging` → protected `main` → five immutable images → one Server03 installation.

### 6.2 Server paths

| Purpose | Required path |
|---|---|
| Canonical application control directory | `/srv/linktrend/apps/linksites` |
| Immutable release directories | `/srv/linktrend/releases/linksites/<main-sha>` |
| Protected runtime configuration | `/srv/linktrend/apps/linksites/config/production.env` |
| Evidence | `/srv/linktrend/apps/linksites/evidence/<main-sha>` |
| Backups | `/srv/linktrend/backups/linksites` |
| Shared Traefik dynamic configuration | `/srv/linktrend/apps/core/dynamic/linksites.yml` |

The implementation packet may adjust a path only if live discovery proves an existing Server03 convention requires it and the change is recorded before mutation.

### 6.3 Runtime services

- CMS/Payload
- `web-master`
- LiNKautowork-facing worker/outbox adapter
- Program orchestrator
- one-shot migrations job

The service definitions must use the existing `deploy/docker-compose.server03-foundation.yml` structure unless focused reconciliation proves that one of the retained branches contains a safer completed version.

### 6.4 Data and network boundaries

- Reuse the shared Server03 PostgreSQL service; do not start a competing PostgreSQL instance.
- Reuse existing Traefik and existing `linktrend-s03-proxy` network.
- Create only LiNKsites-specific roles, schemas, data volumes, and private routes.
- Database credentials for CMS and orchestrator must be distinct and least privilege.
- CMS/admin/database ports must not be publicly exposed.
- All sensitive values remain outside Git, issues, prompts, logs, and evidence.

## 7. Required production inputs

The executor must resolve and validate these values before live mutation. No placeholder can pass.

1. Exact accepted LiNKsites `main` commit and tree.
2. Five immutable image digests.
3. Exact `marketing-smb-v1` provider commit, tree, catalogue checksum, entry checksum, and consumer proof.
4. Production organisation UUID, site UUID, Payload site identifier, and approved-facts file checksum.
5. Private CMS and preview hostnames using the Server03 Tailscale/Traefik boundary.
6. CMS, Payload API, preview, LiNKautowork signing/outbox, outcome gateway, database, and backup credentials obtained by reference from the approved secret mechanism.
7. LiNKautowork gateway URL, key identifiers, environment, and exact event grants.
8. Database target, roles, current schema versions, migration target SHA, and rollback compatibility decision.
9. Backup retention, encryption, owner, and restore target.
10. Founder-approved pilot lead/research package and its non-sensitive checksum.

## 8. Quality and evidence model

### 8.1 Testing budget

- Per packet: only tests directly covering changed behavior plus lint/type/build checks affected by that packet.
- Before source integration: one complete source suite against the exact consolidated candidate.
- After deployment: only preflight, migration verification, service health, route/security checks, pilot acceptance, duplicate/recovery check, and backup/restore proof.
- Reviews: exactly one consolidated source/release review and one final operational review, unless a review fails and a corrected exact candidate requires re-review.

### 8.2 Evidence rules

Every PASS record must contain:

- packet ID;
- repository and exact commit/tree, or Server03 release SHA and image digests;
- command or observation performed;
- start/end timestamp;
- exit/result status;
- sanitized output or artifact checksum;
- executor identity;
- reviewer identity where applicable;
- explicit exclusions and unresolved items.

No secret value, raw lead data, authentication token, or database password may be recorded.

## 9. Rollback policy

1. Never use `docker compose down -v`, delete a database, prune images/volumes, or overwrite a backup during this delivery.
2. Before migration, capture configuration, database, persistent data, and current shared proxy state and prove a restore into an isolated target.
3. Retain the immediately previous immutable application release and runtime configuration.
4. Application rollback switches the canonical control directory to the prior verified release and starts it with its matching configuration.
5. Database rollback is allowed only when the migration-specific compatibility decision says it is safe; otherwise restore the pre-change backup to an isolated target and obtain the recorded recovery decision.
6. On tenant leakage, unauthorised public access, unknown digest, credential exposure, or data integrity loss, disable LiNKsites routes and stop LiNKsites services without affecting shared portfolio services, then enter recovery.

## 10. Execution waves

| Wave | Outcome | Safe parallel lanes |
|---|---|---|
| 0 | Exact baseline, access, branch salvage, and execution identities frozen | read-only repository, GitHub, Server03, Cursor, provider inventory |
| 1 | Source gaps repaired on governed issue branches | release trust; provider/runtime alignment; deployment/runtime reconciliation; operations evidence |
| 2 | Consolidated candidate verified | focused tests in lanes, then one full suite and one independent source review |
| 3 | Protected source promoted and five images published | sequential because every identity depends on the prior protected result |
| 4 | Server03 prepared and data layer proven | backup/restore and non-mutating config validation may overlap; migration is sequential |
| 5 | One production installation made healthy and private | services then routes then observability |
| 6 | One real site pilot and final operational review | pilot is sequential; independent observations may run after stable deployment |

The detailed dependency graph and ownership boundaries are in
`ATOMIC-WORK-PACKETS.md`. The pre-approval truth snapshot is in
`PLANNING-CONTROL-MANIFEST.json`, and the installed protocol-compatible
execution plan is in `EXECUTION-MANIFEST.json`.

## 11. Approval boundary

Pre-approval work ends when the PRD, packets, manifest, and certainty report are delivered. Implementation begins only after the founder explicitly approves the execution package. That approval authorizes the listed engineering and one production installation; it does not authorize excluded public-launch or commercial actions.
