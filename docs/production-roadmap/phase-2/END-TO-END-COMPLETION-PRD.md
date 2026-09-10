# LiNKsites end-to-end completion PRD

Status: correction candidate for Deployment Advisor review; not execution authority

Product: LiNKsites

Production target: exactly one installation on Server03

## 1. Outcome

Finish LiNKsites as an autonomous website factory that accepts an authorised
website facts package, selects and verifies an exact LiNKlibraries provider,
creates and promotes tenant-safe content in Payload, deterministically assembles
and renders the website, publishes it through `web-master`, integrates through
governed automation contracts, and retains exact source, provider, content,
deployment, recovery and completion evidence.

Delivery has two acceptance milestones on the same installation:

1. **Initial operational acceptance:** install the protected application once
   on Server03 and produce one real private website using the agreed legacy
   `marketing-smb-v1` provider, but only after LiNKlibraries truthfully makes an
   exact release selectable. The existing manual/file adapter may carry the
   canonical intake/completion contract while LiNKautowork is not yet live.
2. **Full product completion:** complete and prove the Profile v2 / Master
   Website Template requirements, live LiNKautowork integration and operational
   lifecycle on that same installation. This is the final DONE boundary.

The first milestone is not permission to delete or defer the second. Updating
the same `linksites-foundation` installation with later accepted immutable
releases does not create a second production installation.

## 2. Governing decisions

1. Preserve completed and partial work. Inspect each unique branch/file;
   integrate, refactor, complete, supersede with evidence or retain it. Do not
   delete work as part of this delivery.
2. Source, provider, consumer, configuration, live deployment and production
   proof are separate evidence levels.
3. Server03 production is also the operational proving environment. Git
   `development`, `staging` and `main` are source promotion stages, not servers.
4. Use one or a few substantial Phase PRs, one protected promotion sequence
   for each accepted immutable source release, and one Server03 installation.
   Later full-scope increments update that installation by immutable digest.
5. Use focused tests per packet, one complete suite on each consolidated source
   release candidate, one independent source review and one final independent
   operational review. Repeat only after a substantive correction invalidates
   prior evidence.
6. IDE Development 2.5.2 is the installed development process, not another
   LiNKsites product dependency. Do not edit its repository or managed package.
7. Implementation uses the verified Cursor REST route with Grok 4.6 Medium,
   Fast false and exact GitHub repository/ref/commit/tree binding. Independent
   review uses Luna High. Cursor desktop/CLI login is irrelevant.
8. Founder bootstrap is permitted only when the installed protected publication
   mechanism itself cannot complete after bounded repair. It may use real
   checkpoint, test, review and protection evidence; it may never manufacture
   a check, receipt, approval or PASS.
9. No proposed code, copied receipt, stale receipt, duplicate check name,
   candidate credential or self-review may authorise protected promotion.
10. Accounts, API keys, endpoints, hostnames and public consent are resolved
    just in time by their owner. Missing values remain disabled; no placeholder
    is treated as production configuration.

## 3. Existing authority and starting state

The current evidence classification is in `STARTING-POSITION.md`. Product
requirements remain governed by:

- `docs/PRD.md` for the source/configuration/production acceptance boundary;
- `docs/architecture/linksites-profile-v2/CANONICAL-PRD-ROADMAP.md` for the
  Profile v2 product and LS-FR-01 through LS-FR-25;
- `docs/LINKSITES-TECHNICAL-PRD.md` for system topology and domain context; and
- the exact upstream plans/interfaces recorded in `UPSTREAM-DEPENDENCIES.md`.

Where older status prose conflicts with current exact evidence, current
protected source and the starting-position evidence control factual status.
Older product requirements are not silently removed by that rule.

## 4. Users and workflows

### Founder/operator

The founder can identify the exact live source and image digests, access the
private CMS and private website, submit an authorised facts package, observe
progress and failure, inspect the resulting site and completion record, view
health/alerts/backups, restart the application, disable its routes and invoke a
documented rollback without unstated knowledge.

### Website factory

The factory accepts one canonical, schema-valid, idempotent input; verifies the
provider and tenant; resolves capabilities, layout, plan, routes, navigation,
content and evidence; persists before side effects; promotes through Payload;
renders/publishes; returns one completion record; and resumes without duplicate
sites or success records after retry or restart.

### Content/provider owners

LiNKlibraries publishes immutable selectable provider releases and reference
contracts. Research/editorial or the founder supplies legally usable approved
facts through a canonical contract. LiNKsites never changes provider authority,
fabricates facts or lets draft/quarantined assets pass production selection.

### Visitor

An authorised private visitor receives a coherent, responsive, accessible,
server-rendered site with real prospect-specific content, working intended
interactions, visible evidence-aligned structured data and no mock success.

### Automation and portfolio consumers

LiNKautowork may carry signed input/completion events and durable receipts but
does not decide that the website is complete. Console, Portal, Channel, Client,
Developer, Brain, Skills and OpenClaw consume only their explicit future ports;
none acquires source, release or deployment authority over LiNKsites.

## 5. Functional requirements

### FR-01 Exact provider selection and materialisation

Validate repository, protected commit/tree, entry/version, lifecycle,
compatibility, manifest, inventory, dependency lock, payload/artifact digests,
qualification, admission and receipt. Materialise exact bytes atomically into a
consumer-owned immutable cache. Reject draft, quarantined, non-selectable,
tampered, partial, unsupported or path-escaping inputs. Runtime must start after
the provider checkout is removed.

### FR-02 Site identity, adoption and entitlements

Every site stores provider, capability contract, A1/A2/A3 layout, A/B/C/L plan,
optional overlay or explicit null, customer configuration, content release,
adapter revision/range, effective configuration, Site Assembly Manifest,
entitlement snapshot, previous adoption and rollback identities. Defaults never
silently move an existing site.

### FR-03 Deterministic assembly

Identical normalized business inputs produce identical semantic assembly
digests. Resolve capability dispositions, credits, page families, routes,
locale, navigation, sections, content requirements, shell, metadata, schema and
actions. Products and Services remain distinct. Count, entitlement, collision,
reserved-path and downgrade rules fail closed.

### FR-04 Payload content lifecycle

Use tenant- and locale-scoped models for Products, Services, Results/Work,
Articles, Videos, FAQ/Help, Team, Locations, Service Areas, Policies and typed
core settings. Preserve provenance, evidence and semantic IDs from working
content through draft, promotion, readback and publication. Remove the all-Hero
or generic fallback projection. Additive migrations preserve existing Offer,
Case and template-pin data through explicit compatibility or migration.

### FR-05 Versioned adapter and rendering

Map every required provider semantic ID to an owned Payload block and React
symbol through a versioned adapter with an explicit provider range. Render real
structural A1/A2/A3 differences and A/B/C/L behavior from one semantic source.
Unknown required IDs, missing mappings and public error/template text fail.

### FR-06 Routes, shell and discovery

Build tenant/locale-safe canonical routes, redirects, navigation, accessible
mobile header and five-zone footer from real configuration. Server HTML, title,
one H1, landmarks, crawlable links, canonical/hreflang, JSON-LD, sitemap,
robots, `llms.txt` and AI projections must agree with visible published facts.
Private/draft/redirected content is excluded from public discovery surfaces.

### FR-07 Accessibility, privacy and performance

Target WCAG 2.2 AA with automated and bounded manual keyboard, focus, heading,
contrast, motion, touch, zoom, media, viewport and RTL-readiness evidence.
Forms/newsletter/analytics/cookies activate only with real configured hooks,
consent and failure behavior. No fake success or leaked secret. Representative
lab targets are LCP <=2.5s, INP <=200ms and CLS <=0.1; label lab evidence and do
not claim field performance without field data.

### FR-08 Program and automation lifecycle

Load one exact LiNKharness/Profile composition and delegate generic ledger,
lease, retry, lock, gate, evidence and executor behavior to it. LiNKsites owns
website Modules/Phases/Issues, domain states and verdicts. Canonical intake and
completion events include correlation and idempotency identity. Persist before
side effects; replay returns the original logical result.

The initial private website may use the production-shaped manual/file adapter.
Full completion configures the live LiNKautowork signed gateway with scoped
Platform claims, event grants, replay protection, bounded retry,
acknowledgement, durable outbox and receipt readback. A LiNKautowork receipt is
automation evidence, not a LiNKsites completion verdict.

### FR-09 Release integrity

Build exactly five production image entries—CMS, web-master, worker,
orchestrator and migrations—from accepted protected `main`. Every image is
selected by immutable digest. One release manifest binds repository commit/tree,
provider identities, Harness/Profile, migrations, configuration schema,
toolchain, image digests, provenance and checksums.

### FR-10 One Server03 installation

Install one Compose project `linksites-foundation` under
`/srv/linktrend/apps/linksites` from commit-addressed release material. Reuse
Server03 PostgreSQL, Traefik and approved shared services. Configure distinct
least-privilege identities, private routes, persistent data, health, limits,
logs, monitoring and backups. Do not expose CMS/admin/database ports publicly or
replace any shared portfolio service.

### FR-11 Migration, recovery and rollback

Before mutation, inventory existing LiNKsites database/release/proxy state,
create an encrypted backup and prove isolated restore. Migrations bind exact
source/checksums, record receipts and are safe to no-op/reconcile or fail closed.
A failed application/provider/site upgrade retains the prior active release,
cache, adoption and data. Application rollback, route disable and database
restore are separate procedures; no volume deletion is permitted.

### FR-12 Operational evidence

Correlate intake, Program, Phase, Issue, Run, provider, content, promotion,
publication, deployment, automation and completion identities. Expose health,
backlog, retries/dead letters, completion, certificate, backup age, storage,
resource and restart signals. Evidence is sanitized, checksum-bound and states
its exact source/live level.

## 6. Definition of done

LiNKsites is DONE only when all of the following are true.

### Preservation and source

1. Every identified unique issue/Phase branch and the user-owned dirty file has
   a recorded disposition; all useful work is incorporated exactly once or
   deliberately retained with reason.
2. The final source satisfies FR-01 through FR-12 and LS-FR-01 through LS-FR-25,
   or an explicit founder product decision identifies a superseded requirement.
3. Sanitized upstream contracts used by workers are committed with exact
   provenance and compatibility; no local-only input is required.
4. Focused packet checks pass, followed by one Full Suite on each consolidated
   release candidate and one independent Luna High source review on its exact
   commit/tree.
5. The final dependency and image closure has an exact current advisory
   inventory. No unresolved exploitable critical/high finding reaches release;
   every non-applicable or deferred alert has evidence, an owner and an
   acceptance threshold, and every security exception has founder authority.
6. The promotion trust boundary rejects candidate-authored, copied, stale,
   duplicate-name and wrong-base evidence.
7. Accepted source is integrated to protected `development` and promoted
   through `staging` to `main` with exact readback and no invented check.

### Provider and full website product

8. The first operational provider is an exact currently selectable
   `marketing-smb-v1` LiNKlibraries release; if LiNKlibraries has not admitted
   it, the initial website cannot claim PASS.
9. Full completion uses exact admitted `master-template-type-1` provider inputs
   and passes A1/A2/A3 x A/B/C/L paired proof at the claimed levels.
10. Every site has exact layered identity/adoption/entitlement/rollback records;
   Products/Services, semantic content, routes, shell, SSR, structured data,
   discovery and AI projections agree.
11. Existing-site migration, failed-upgrade preservation, provider-cache
    restart, retirement and rollback pass against production-shaped data.

### Release and installation

12. Five immutable image digests and one verified release manifest are built
    from exact accepted protected `main`.
13. One and only one `linksites-foundation` production installation exists on
    Server03. All intended services run the exact digests and existing portfolio
    services remain healthy.
14. Existing data is inventoried; pre-change backup and isolated restore pass;
    migrations and least-privilege grants have exact receipts.
15. Private CMS/preview routes authenticate correctly; unauthorized and unknown
    hosts fail; private content is `noindex,nofollow`; no direct sensitive port
    is exposed.
16. Monitoring, logs, alert, scheduled backup, isolated restore, restart,
    route-disable and rollback procedures work on the actual installation.

### Initial operational website

17. One founder-approved, legally usable representative facts package enters
    once through the real canonical manual boundary and produces one complete
    private prospect-specific website using real Payload content and
    `web-master` rendering.
18. There is one traceable Program/Phase/Issue/Run/provider/content/promotion/
    publication/deployment/completion chain and one CRM-shaped completion record
    containing the private URL and exact identities.
19. No mock, lorem, placeholder, unsupported claim, fixture provider or manual
    downstream success insertion appears.
20. Replaying the same logical input and performing a controlled restart creates
    no second logical site, publication, deployment or completion record and
    causes no corruption.

### Full operation and final acceptance

21. The same installation consumes live scoped Platform and LiNKautowork
    handoffs, submits/receives one exact signed automation request/receipt and
    preserves LiNKsites as completion authority.
22. Functional, responsive, accessibility, metadata, privacy, tenancy,
    security, practical performance and recovery acceptance pass on the final
    live private site/release.
23. One independent Luna High operational review returns PASS against the exact
    deployed source, five image digests, provider identities and live evidence.
24. The founder handoff contains access, identity, health, logs, backup,
    restore, restart, route-disable and rollback instructions. No required
    knowledge remains only in chat or on the coordinator's Mac.

## 7. Production layout and configuration

| Purpose | Path |
| --- | --- |
| control directory | `/srv/linktrend/apps/linksites` |
| immutable release | `/srv/linktrend/releases/linksites/<main-sha>` |
| protected configuration | `/srv/linktrend/apps/linksites/config/production.env` |
| evidence | `/srv/linktrend/apps/linksites/evidence/<main-sha>` |
| backups | `/srv/linktrend/backups/linksites` |
| scoped Traefik configuration | `/srv/linktrend/apps/core/dynamic/linksites.yml` |

Required production inputs include exact source/tree, five image digests,
provider receipts/digests, Harness/Profile identity, Platform contract and live
receipt identity, LiNKautowork endpoint/grants/key references, tenant/site IDs,
approved facts checksum, private hostnames, database/migration state, backup
policy and secret references. Secret values never enter source, packets, logs or
evidence.

## 8. Delivery sequence

```text
planning accepted + founder APPROVE
-> current-state/queue/branch refresh and work preservation
-> publish exact upstream contract inputs
-> additive data compatibility freeze
-> four parallel source lanes
-> exclusive dependency security/remediation and disposition
-> deployment and operations source
-> consolidation + Full + independent source review
-> protected development/staging/main + five immutable images
-> backup/restore + one Server03 installation
-> first real private marketing-smb-v1 website
-> exact MWT v2 and live LiNKautowork increments on same installation
-> full live acceptance + independent operational review + handoff
```

`ATOMIC-WORK-PACKETS.md` is the executable dependency breakdown.

## 9. Test and evidence budget

- Each implementation packet runs only its direct unit/integration/static checks
  and affected build/type checks.
- One exclusive dependency-security packet refreshes and owns the alert/deployed
  closure, performs required compatible repairs, and records evidence-backed
  dispositions before deployment source and Full acceptance.
- Consolidation runs one complete source suite on the exact candidate.
- Provider/browser matrices run when the exact provider/adapter identity changes,
  not for unrelated deployment edits.
- Live checks are limited to preflight, backup/restore, migration/grant denial,
  service/route health, one first-site acceptance, duplicate/restart, one live
  automation acceptance and final review.
- A failure produces the smallest corrective packet and invalidates only evidence
  affected by changed bytes/identity.
- Every PASS names exact commit/tree or deployed digests, command/observation,
  timestamps, result, executor, reviewer where applicable, sanitized evidence
  checksum, exclusions and unresolved items.

## 10. Exclusions

- a second production installation or separate staging server;
- public/customer domain cutover or an unapproved public launch;
- billing/payment/sales/post-sales behavior not already required by LS-FR;
- mutation of upstream repositories from the LiNKsites task;
- completing unrelated portfolio programs;
- editing IDE Development or its installed managed package;
- broad unrelated refactors, new audit frameworks or repetitive proof loops;
- destructive database/volume cleanup or protected history rewrite.

## 11. Approval boundary

Planning publication and Deployment Advisor review do not authorise execution.
Implementation begins only after the founder explicitly approves the exact
advisor-accepted package. That approval covers the listed LiNKsites work and one
Server03 installation; a materially new product, public action, paid account,
destructive recovery, security exception or upstream-repository mutation needs
its own authority.
