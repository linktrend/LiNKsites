# LiNKsites engineering handover

**Evidence cutoff:** 9 October 2026, Asia/Taipei; Server03 readbacks recorded at 14:28–14:30.

**Audience:** the receiving engineering AI agent, after the business agent completes the requirements discussion.

**Companion:** `LiNKsites-Business-Handover-2026-10-09.md`.

**Overall state:** substantive source exists; the founder's complete input-to-Odoo workflow is not operational; no LiNKsites service is running on Server03.

## 1. Custody and use of this snapshot

Keep this report unchanged when forwarding it. The business agent may complement the business report but should not rewrite the implementation facts here. If evidence changes, supply a dated engineering addendum instead. The engineering agent's next deliverable is a technical PRD based on this snapshot plus the completed business requirements, not immediate implementation of every suggestion below.

This report separates founder requirements, verified source behavior, historical tests, fresh server observations and unresolved contracts. It contains no credentials. It is self-contained with source and evidence pointers; the previous conversation is not a prerequisite.

The primary agent authored the two reports from investigations delegated to Luna 6 High subagents. Investigation was read-only apart from small sanitized evidence notes and the separately authorized documentation checkpoint setup. No local container, database, build, application test, deployment, migration, production-record write or application repair was performed for this handover.

## 2. Founder requirements that supersede older intent

The confirmed workflow is **LiNKtarget + LiNKresearch → complete business information package → LiNKsites → QA-approved hosted website and temporary URL recorded in Odoo → LiNKsales → LiNKclient**.

LiNKsites must select a LiNKlibraries template, personalize the site, place content in Payload CMS with the intended Supabase integration, and host the site in its permanent common location. The temporary address is `https://sites.linktrend.one/<long-numeric-identifier>`; it must support thousands of prospects. The exact numeric length/allocation mechanism is not decided. Later domain connection must use the same hosted site.

Operation is automatic from valid input through creation and full QA. An optional human review/change opportunity occurs immediately before Odoo handover; mandatory human approval is not a requirement. QA includes factual business information, content, appearance, technical operation and all UI interactions, including forms, buttons, links, menus and navigation.

Unsold-site reuse must retain the existing site record, structure and hosting, apply minor business-specific names/copy/colour changes, and assign a **new** long numeric temporary URL. Major redesign is outside this reuse operation. The old URL's disposition and customer-history rules are unresolved.

Postpublication content maintenance and hosting maintenance/troubleshooting belong to separate owners. Input acquisition/research and sales/customer workflows are also external. The permanent-host/domain attachment boundary and precise Supabase/Payload synchronization agreement require final business decisions; do not infer a two-way mirror or additional maintenance ownership.

Older repository documents refer to LiNKreach and explicitly exclude direct Odoo runtime integration. Those describe the older implementation boundary. They do not override the founder's October workflow above.

## 3. Repository identities and release position

Repository: `https://github.com/linktrend/LiNKsites.git`.

Fresh GitHub API readback established the following **application/source snapshot before publication of these handover documents**. A later documentation-only main commit can advance the ref without changing the application baseline recorded here:

| Protected ref | Exact commit | Exact Git tree | Meaning |
| --- | --- | --- | --- |
| `development` | `4f6f65b392c5919e49bb3dbd93b44c489549a238` | `c897d0d03cdcc3a53c86029f62b8cb47cc21c9d5` | Latest integrated implementation audited here. |
| `staging` | `b67221f90c1eff6a96592cc7be74390c9b843da2` | `e29607c43146decdf81c2f132562745f6a911780` | Has not accepted the latest development promotion. |
| `main` | `9eb995d7c151aab6aafabd66e91893084e1acdb2` | `fa16550a8d1981a37113c4ba356cbb0ff0a369f8` | Older protected release used for the cached Server03 images. |

The source references below bind `development` to its full SHA unless another repository/ref is named. Never treat a local checkout, branch name or matching tree as sufficient evidence of protected release or live deployment.

Local paths:

- Session checkout: `/Users/linktrend/.codex/worktrees/acaa/LiNKsites`, clean detached HEAD at older commit `4b2dbaf5c0ce34076e5d62f8703bbda197dd8ffb` when inspected. This is **not** current development.
- Canonical checkout: `/Users/linktrend/Projects/LiNKsites`; preserve its unrelated changes and existing worktrees.
- This documentation package: issue [#608](https://github.com/linktrend/LiNKsites/issues/608), worktree `/Users/linktrend/Projects/LiNKsites-worktrees/issue-608-linksites-business-and-engineering-handover-repo`, branch `issue/608-linksites-business-and-engineering-handover-repo`, created by the official issue helper from current development. Its only intended changes are these two reports.

GitHub compare reports development is 90 commits ahead of and 20 behind main, with application, deployment, workflow and evidence differences. Ordinary promotion is not a documentation-only publication. No unrelated application release is authorized by the request to save these reports in main.

## 4. Relevant system map

The active project is a pnpm workspace with TypeScript components, Payload CMS and a shared Next.js renderer. Exact dependency/toolchain versions should be read from the chosen execution candidate's lockfile and configuration before installing; this report does not change dependencies.

| Component/path | Current responsibility |
| --- | --- |
| `apps/program-orchestrator/src/service.ts` | Production HTTP service: signed research ingress, polling, health/readiness/metrics and composition. |
| `apps/program-orchestrator/src/composition.ts`, `runtime.ts`, `graph.ts` | Durable runtime, dependency graph, registered execution stages and production adapter composition. |
| `apps/program-orchestrator/src/postgres-*.ts`, `durable-store.ts` | Tenant/site-scoped Postgres working state, intake, ledger and completion/outbox persistence. |
| `packages/types/src/runtime-contracts.ts` | Cross-component input, completion and lifecycle contracts/validation. |
| `packages/factory-catalog/src/` | Foundation/template selection, provider materialization/admission, deterministic content production, quality gates and lifecycle logic. |
| `packages/factory-catalog/src/targets/payloadRestDraftTarget.ts` | Payload draft upsert, field-parity readback and controlled private publication. |
| `packages/program-ledger/` | Program execution state, gates and evidence records. |
| `apps/cms/` | Payload collections, tenant/site/domain/page/media/settings records and CMS configuration. |
| `apps/web-master/` | Shared customer renderer, host/site resolution, admitted template module and private demo routes. |
| `supabase/` | SQL migrations/working-plane schema and RLS-related database assets; inspect exact migration set before planning execution. |
| `deploy/` | Server03 Compose/image definitions, production environment example, manifests, preflight/smoke/restore helpers. |
| `.github/workflows/` and `scripts/gitops/` | Hosted checks, image publication, issue/Phase delivery and protected promotion gates. |

`archive/paused-applications/web-company` is legacy/paused and should not become a second active customer platform. The retained intake/local harnesses and manual demo seeder are useful test/prototype tools; they do not establish the complete production workflow.

Representative code: [service](https://github.com/linktrend/LiNKsites/blob/4f6f65b392c5919e49bb3dbd93b44c489549a238/apps/program-orchestrator/src/service.ts), [composition](https://github.com/linktrend/LiNKsites/blob/4f6f65b392c5919e49bb3dbd93b44c489549a238/apps/program-orchestrator/src/composition.ts), [template registry](https://github.com/linktrend/LiNKsites/blob/4f6f65b392c5919e49bb3dbd93b44c489549a238/apps/web-master/src/templates/registry.ts#L11-L83).

## 5. Current input, transport and execution path

### Intake contract

`LeadResearchPackage` extends the base envelope with schema/org/correlation/idempotency metadata and includes `lead_id`, `research.summary`, `research.sources[]`, `requested_vertical` and `source`. Its validation accepts that limited shape. It does not carry the complete verified business facts required by content generation, or a complete upstream LiNKtarget/LiNKresearch package binding.

Production separately reads `approvedFactsPath`. `ApprovedLeadResearchFacts` requires matching lead/org identity plus business name, geography, services/products, credentials, reviews, contact/website, pricing, legal claims and media. The missing connection is between the accepted intake package and this separately configured facts artifact. Do not describe the existing service as doing original business research.

Sources: [contract and validation, lines 19–27 and 447–459](https://github.com/linktrend/LiNKsites/blob/4f6f65b392c5919e49bb3dbd93b44c489549a238/packages/types/src/runtime-contracts.ts), [facts loading, lines 220–233](https://github.com/linktrend/LiNKsites/blob/4f6f65b392c5919e49bb3dbd93b44c489549a238/apps/program-orchestrator/src/adapters.ts#L220-L233), [facts contract, lines 121–185](https://github.com/linktrend/LiNKsites/blob/4f6f65b392c5919e49bb3dbd93b44c489549a238/packages/factory-catalog/src/contentProduction.ts#L121-L185).

### Ingress and durable processing

The service exposes signed POST `/ingress/lead-research`. It validates the LiNKautowork `lead.research.ready` envelope before persistence. Manual NDJSON/local intake and the CRM-shaped writer are distinct adapters; they are not a verified LiNKtarget/LiNKresearch integration.

The real runtime performs durable intake/ledger processing, selects/verifies a Library package, produces an immutable working-content version, checks it, writes/readbacks Payload drafts, publishes a private preview and probes the shared renderer. Production polling and template-dependent HTTP intake fail closed unless template release state is `ready`; deferred operation returns HTTP 503.

Sources: [signed ingress](https://github.com/linktrend/LiNKsites/blob/4f6f65b392c5919e49bb3dbd93b44c489549a238/apps/program-orchestrator/src/lead-research-ingress.ts#L1-L28), [service route](https://github.com/linktrend/LiNKsites/blob/4f6f65b392c5919e49bb3dbd93b44c489549a238/apps/program-orchestrator/src/service.ts#L33-L52), [intake gate](https://github.com/linktrend/LiNKsites/blob/4f6f65b392c5919e49bb3dbd93b44c489549a238/apps/program-orchestrator/src/intake.ts#L21-L54), [runtime sequence](https://github.com/linktrend/LiNKsites/blob/4f6f65b392c5919e49bb3dbd93b44c489549a238/apps/program-orchestrator/src/runtime.ts#L141-L175).

## 6. Content authority, provisioning and personalization

Current comments/contracts distinguish Payload published content as live authority from Supabase/Postgres working versions and evidence. The Postgres adapter applies tenant/site session settings for RLS. Working content is stored in `lsites_sites.working_content_versions`, then explicitly promoted to Payload REST drafts, checked for field parity, and published with `previewEnvironment=private-preview`. CMS Postgres/Supabase connection normalization does not establish automatic bidirectional synchronization.

The retired `lsites_core` mirror and older synchronization descriptions must not be revived as current architecture without a deliberate approved decision. Reconcile the founder's intended Supabase/Payload relationship with this controlled working-content → publication model in the technical PRD.

Production composition requires fixed organization/site UUIDs and an already provisioned tenant/site; it asserts the rows exist. The production example includes configured `W2_02_SITE_ID` and `W2_02_PAYLOAD_SITE_ID`. `apps/cms/scripts/factory/create-demo-site.ts` is a manual seeded demo with generic business placeholders, not a per-lead production provisioner.

The content executor is deterministic; the production adapter assembles baseline routes/copy and a synthetic neutral media entry/hash. No actual LLM call was found in that generation path. This is a personalization/content-completeness gap, **not proof that an LLM is mandatory**. The next PRD must define what accurate, complete business-specific output requires and select an implementation accordingly.

Sources: [Postgres/RLS adapter](https://github.com/linktrend/LiNKsites/blob/4f6f65b392c5919e49bb3dbd93b44c489549a238/apps/program-orchestrator/src/postgres-adapter.ts#L6-L43), [working version and publication adapters](https://github.com/linktrend/LiNKsites/blob/4f6f65b392c5919e49bb3dbd93b44c489549a238/apps/program-orchestrator/src/adapters.ts#L239-L355), [Payload target](https://github.com/linktrend/LiNKsites/blob/4f6f65b392c5919e49bb3dbd93b44c489549a238/packages/factory-catalog/src/targets/payloadRestDraftTarget.ts#L99-L177), [production composition](https://github.com/linktrend/LiNKsites/blob/4f6f65b392c5919e49bb3dbd93b44c489549a238/apps/program-orchestrator/src/composition.ts#L38-L180).

## 7. Template dependency and admission status

LiNKlibraries owns canonical template versions, integrity and provider admission. LiNKsites owns consumption/materialization/rendering; do not modify the provider while implementing consumer work without separate scope.

Fresh provider readback:

- LiNKlibraries development: `92e0cdc5d089541b8b850ccbd13e0d2ffd603b74`, tree `ada1900badb1cec5216b12c4870dddc87c746037`.
- LiNKlibraries main: `6da7c9f0fa092199a817c9363987799aa360e73e`, same tree.
- Current catalogue lists `master-template-type-1@1.0.0` and `@2.0.0`; both are draft/non-selectable with unknown compatibility.
- The newer 2.0.0 candidate includes A1/A2/A3 layouts and A/B/C/L plans. Its handoff status is `FINAL_PROVIDER_CANDIDATE_EXTERNAL_CONSUMER_GATE_PENDING`; external consumer parity/admission remains pending and there is no production pointer.
- LiNKsites still pins older A1.1 provider commit `998c02c29fae5acc429804d7e03dcc74df7e7a52`, tree `63c7f6f8811b93f90a1dcc101cdeea94bdc6d4b3`, marked catalogue-unbound, draft, non-selectable and unknown compatibility.

The consumer renderer/materializer exists. Production admission requires state `ready`, Revision 2, exact template identity and a matching mounted provider receipt/bundle. The checked-in production example remains `LINKSITES_TEMPLATE_RELEASE_STATE=deferred`, with provider bundle/receipt inputs unset and Platform acceptance pending. Example configuration is source evidence, not proof of live environment values; Server03 currently has no deployed LiNKsites runtime to read them from.

Sources: [provider catalogue](https://github.com/linktrend/LiNKlibraries/blob/92e0cdc5d089541b8b850ccbd13e0d2ffd603b74/indexes/v2/catalog.json#L90-L133), [provider handoff](https://github.com/linktrend/LiNKlibraries/blob/92e0cdc5d089541b8b850ccbd13e0d2ffd603b74/docs/evidence/master-website-template-v2/final-linksites-handoff-addendum.md), [consumer pin](https://github.com/linktrend/LiNKsites/blob/4f6f65b392c5919e49bb3dbd93b44c489549a238/packages/factory-catalog/src/masterTemplatePin.ts#L4-L48), [production admission](https://github.com/linktrend/LiNKsites/blob/4f6f65b392c5919e49bb3dbd93b44c489549a238/apps/web-master/src/lib/template-admission.ts#L93-L170), [configuration example](https://github.com/linktrend/LiNKsites/blob/4f6f65b392c5919e49bb3dbd93b44c489549a238/deploy/config/production.env.example).

## 8. URLs, site identity and unsold reuse

The current completion adapter always constructs `webMasterBaseUrl + /en/demo`. Completion validation rejects any pathname other than `/en/demo`. Site resolution uses hostname mappings, while locale/demo route slugs refer to pages. `SiteDomains` maps hostname → site and has no temporary numeric-path identity field.

Consequently, the required numeric temporary-path allocator, path-to-site lookup, uniqueness rules and per-business rendering are missing from the current completion flow. One global preview token and configured private preview host are not a substitute for per-business numeric site routing. Existing private previews also carry noindex/no-store expectations; the next PRD must reconcile any shareability/access decisions with those safeguards.

Existing no-sale lifecycle behavior validates evidence, quarantines/removes lead content, releases the foundation and creates a `ready_for_review` refactoring request. It is not the confirmed same-record, same-host, minor-rebranding operation with a new URL. Reuse must reconcile historical customer associations and quarantine/isolation rules rather than simply renaming the old demo.

Sources: [URL generation](https://github.com/linktrend/LiNKsites/blob/4f6f65b392c5919e49bb3dbd93b44c489549a238/apps/program-orchestrator/src/adapters.ts#L358-L397), [completion URL restriction](https://github.com/linktrend/LiNKsites/blob/4f6f65b392c5919e49bb3dbd93b44c489549a238/apps/program-orchestrator/src/durable-store.ts#L260-L273), [host/site resolution](https://github.com/linktrend/LiNKsites/blob/4f6f65b392c5919e49bb3dbd93b44c489549a238/apps/web-master/src/lib/site-context.ts#L78-L166), [SiteDomains](https://github.com/linktrend/LiNKsites/blob/4f6f65b392c5919e49bb3dbd93b44c489549a238/apps/cms/src/collections/SiteDomains.ts), [no-sale lifecycle](https://github.com/linktrend/LiNKsites/blob/4f6f65b392c5919e49bb3dbd93b44c489549a238/packages/factory-catalog/src/siteLifecycle.ts#L540-L580).

## 9. QA, optional human review and Odoo handover

The working-content quality gate checks persisted checksums and structural rules such as routes, required sections, contact, claims/secrets and assets. The renderer probe fetches one protected `/en/demo` URL and checks HTTP success, a private-preview marker, noindex/no-store and an `<h1>`. This is useful but does not prove factual completeness, appearance across supported viewports or every route/button/menu/form interaction on the generated customer's website.

No integrated optional human review/change window was found before completion delivery. Do not replace the founder's optional review with an unconditional manual-approval blocker. Review timing, revision handling and automatic release from the review opportunity need business decisions.

Completion persists a `DemoCompletionEnvelope` and delivery outbox. Optional LiNKautowork `demo.completed` emission carries only `lead_id` and `site_id` in its event body. No direct Odoo company/lead writeback or completed-site URL handoff to LiNKsales was found. Signed `CommercialOutcomeIngress` is a lifecycle/outcome boundary, not the requested Odoo completion adapter.

The final technical PRD needs a cross-program input/output schema, stable target/site associations, authorized Odoo writeback, delivery acknowledgement/retry behavior and evidence that QA/review state governs the correct handover. It must not assume the old outbox event already supplies that contract.

Sources: [current QA gates](https://github.com/linktrend/LiNKsites/blob/4f6f65b392c5919e49bb3dbd93b44c489549a238/apps/program-orchestrator/src/adapters.ts#L262-L397), [completion/outbound event](https://github.com/linktrend/LiNKsites/blob/4f6f65b392c5919e49bb3dbd93b44c489549a238/apps/program-orchestrator/src/postgres-runtime.ts#L166-L181), [commercial outcome ingress](https://github.com/linktrend/LiNKsites/blob/4f6f65b392c5919e49bb3dbd93b44c489549a238/apps/program-orchestrator/src/commercial-outcome-ingress.ts#L47-L80), [older Odoo boundary](https://github.com/linktrend/LiNKsites/blob/4f6f65b392c5919e49bb3dbd93b44c489549a238/docs/OPEN-ISSUES.md#L83-L85).

## 10. Server03 access and fresh operating evidence

Access was obtained from the existing Codex task **Server03 Production Owner**, ID `01a0a309-815b-7ee3-90a3-067c8ba79f91`; its local workspace is `/Users/linktrend/Documents/Codex/2026-09-15/server03-production-owner`. Read its current accepted handoff before new server work.

Established access for this Mac:

- SSH alias `linkserver-03`, principal `linktrend@100.113.81.46` over Tailscale.
- Key **location only:** `/Users/linktrend/.ssh/linkserver-03_ed25519`. Never copy its contents into reports, repositories or receiving-agent prompts.
- Server03 public origin recorded by the owner: `78.46.77.112`.
- `sudo -n` permits the owner's privileged inspections. This is broad host authority, not a newly granted scoped runtime identity for business/engineering agents. Use it only within separately authorized execution scope.
- Read-only `sudo docker` is needed for an accurate inventory; an unprivileged Docker permission failure must not be interpreted as zero containers.

Fresh observations on 9 October at 14:28 Asia/Taipei:

| Observation | Verified result |
| --- | --- |
| LiNKsites service | `sudo docker ps -a` shows no LiNKsites containers; no LiNKsites network or matching service unit. A stale issue470 node-modules volume is not a running application. |
| Separate Payload service | A host baseline Payload container is a separate service, not evidence of the LiNKsites stack. |
| Release images | Five immutable images for main `9eb995…` are cached on the host and match the release manifest. Cached images do not establish deployment. |
| DNS | Server query to resolver `1.1.1.1` for `sites.linktrend.one` returns NXDOMAIN. |
| Ingress | Request forced to local ingress with that hostname/SNI receives HTTP 418 default deny. |
| HTTPS | Current Let's Encrypt certificate SANs do not include `sites.linktrend.one`. |
| Preparation receipts | `deploymentEligible=false`; prepared/HOLD; `activeComposeProject=false`, `activeContainer=false`, `migrationsApplied=false`, `routesChanged=false`. |
| Application recovery | Only preparation metadata restore evidence was found; it explicitly disclaims application backup proof. No current LiNKsites application backup/restore/rollback receipt was established. |

Server evidence locations:

- Release directory: `/srv/linktrend/releases/linksites/9eb995d7c151aab6aafabd66e91893084e1acdb2/`.
- Exact manifest: `server03-release-manifest.json` in that release directory. `server03-release.env` exists but was not read or copied.
- Preparation: `/srv/linktrend/evidence/server03/linksites/preparation/PREPARED-HOLD.json` and `SERVER03-PREPARATION-RECEIPT.json` in that directory.
- Application root reserved for this service: `/srv/linktrend/apps/linksites/`; inspect actual contents/permissions before planning activation.
- Prepared Compose: `/srv/linktrend/apps/linksites/candidate/docker-compose.deploy.yml`; foundation template: `compose.server03-foundation.template.yml` in the same candidate directory. The config directory contains `runtime.env.example` and `render-only.invalid.env`; their values were not read. Do not treat a render-only invalid configuration as a deployable environment.
- Preserved manifest cache: `/srv/linktrend/apps/linksites/rollback/protected-main-9eb995d7-manifest.json`; it is inactive and does not prove rollback.
- Release manifest records `generatedAt=2026-09-07T19:42:22Z`, release tree `fa16550a8d1981a37113c4ba356cbb0ff0a369f8` and `publication.publicRoutes=false`.

Exact cached release image references, copied from that manifest:

```text
ghcr.io/linktrend/linksites-cms@sha256:a0ea24d28f7d21adc3bd1433aeb03f4c8a41491ff7fc26904da1ca1354909bb5
ghcr.io/linktrend/linksites-web-master@sha256:1fc74473175a2b63597e110ef86c54b78d5afec895d6a614674c8385754778af
ghcr.io/linktrend/linksites-autowork-worker@sha256:c3db6d079e4ee651d1ba2fc28cb273f32c33e786ab120b3521cc365dffeb8ea3
ghcr.io/linktrend/linksites-program-orchestrator@sha256:7d8625bbb8b3ce463d7dd1ed5dd314c631996fcec2ce90418ca3c435f4d5a000
ghcr.io/linktrend/linksites-migrations@sha256:4cd228f67a4293ce62cf5d398930ceae301e3924075952a9815f6f66eca4064d
```

The preparation HOLD explicitly asks for accepted protected-main release evidence binding these five images together with SBOM, vulnerability-scan, provenance and archival evidence. The observed publication run does not supply those additional evidence artifacts. This is an existing owner acceptance blocker, not a new requirement introduced by this report.

The owner's October backup-policy change disabled local full-host backup timers and removed older backup payloads. Do not claim September backups or generic host snapshots prove current application rollback. Ongoing backup policy belongs to the server owner; resolve deployment/recovery prerequisites with that owner without expanding this website-factory assignment into general maintenance.

Safe refresh examples, subject to continuing authorized access:

```bash
ssh -G linkserver-03
ssh linkserver-03 'sudo -n docker ps -a --format "{{.Names}} {{.Image}} {{.Status}}"'
ssh linkserver-03 'dig @1.1.1.1 sites.linktrend.one A'
ssh linkserver-03 'sudo -n cat /srv/linktrend/evidence/server03/linksites/preparation/PREPARED-HOLD.json'
```

Inspect only needed fields; do not dump container environment, credentials or full private business data. No new server access bridge was installed for this handover.

## 11. Hosted tests, publication and protected-release blockers

### What the existing checks establish

Hosted [run `34965461338`](https://github.com/linktrend/LiNKsites/actions/runs/34965461338) completed successfully with `full-production-suite` on Phase head `1ceed1616eb1e6fce086360b9f0d10094ca5a9b9`. Its tree `c897d0d03cdcc3a53c86029f62b8cb47cc21c9d5` exactly matches current development, but its commit differs. Record this as historical hosted same-tree source evidence, not a new test of the current commit and not live Server03 or real-customer UI/Odoo proof.

The local W2-02 [proof packet](https://github.com/linktrend/LiNKsites/blob/4f6f65b392c5919e49bb3dbd93b44c489549a238/docs/production-roadmap/evidence/w2-02/PROOF.md) explicitly says local only, no VPS/cloud/live credentials and not a W2-02 PASS. It includes disposable local Postgres, local Payload and the optimized renderer; it is not hosted runtime acceptance.

Protected-main image-publication [run `34156159639`](https://github.com/linktrend/LiNKsites/actions/runs/34156159639) succeeded for main `9eb995…` and uploaded `linksites-server03-release-9eb995d7c151aab6aafabd66e91893084e1acdb2`. The five images are CMS, web-master, worker, program-orchestrator and migrations. The workflow publishes images/manifest; it does not activate the service or its public route. See [publication workflow](https://github.com/linktrend/LiNKsites/blob/9eb995d7c151aab6aafabd66e91893084e1acdb2/.github/workflows/publish-server03-images.yml).

### Current promotion blocker

[PR #603](https://github.com/linktrend/LiNKsites/pull/603) remains open, from `promote/staging/4f6f65b392c5` at development commit `4f6f65b…` into staging. Hosted [run `34967482928`](https://github.com/linktrend/LiNKsites/actions/runs/34967482928), job `104375338712`, fails `Linktrend Receipt Gate` with:

```json
{"accepted":false,"code":"transition_invalid","message":"transition receipt fields are incomplete or unknown"}
```

The newer transition receipt is being evaluated through older trusted protected-main verifier/workflow code. This is a release-system compatibility problem, not failure of the full application suite and not evidence that product changes were deployed. It was not repaired during this handover.

Source Phase [PR #602](https://github.com/linktrend/LiNKsites/pull/602) merged to development. Its exact reviewed head was `1ceed1616eb1e6fce086360b9f0d10094ca5a9b9`. Fresh review readback contains Cursor Bugbot `COMMENTED` with a clean result, but no GitHub `APPROVED` record. The hardened promotion evidence requires a current separate-identity approval bound to the exact source candidate. Do not translate `COMMENTED`, a source audit PASS or a founder's general authorization into a fabricated GitHub approval.

### Relevant validation entrypoints

Root `package.json` contains `ci:required`, `test:w2-04` and deployment config/preflight/smoke/restore/Compose helper entrypoints. Read the scripts before execution: some invoke containers/databases and therefore cannot be run on this Mac under the existing constraint. `bash scripts/ci-required.sh` is the hosted full-application path, not a command authorized for local use by this handover. Choose focused validation for the eventual approved candidate; do not rerun expensive suites merely to refresh the report.

## 12. Required technical work, after business decisions and PRD approval

This table identifies gaps; it is not an implementation dispatch or approved architecture amendment.

| Gap | Required result/evidence |
| --- | --- |
| Upstream input | One complete, validated LiNKtarget/LiNKresearch contract bound to business/lead/org identity, with a defined response to missing data. |
| Template provider | Current provider admission and consumer parity/receipt, pinned usable package, correct production configuration and demonstrated selection. |
| Provisioning/content | Per-business site/content provisioning and personalization, correct working-to-Payload ownership, no placeholders misrepresented as real business assets. |
| Numeric temporary routing | Collision-safe allocation, path-to-site mapping, isolated rendering, valid DNS/HTTPS and completed URL in the output contract. |
| Full QA | Recorded factual/content/visual/technical and interaction results for the actual generated site; controlled form-test destinations and failure handling. |
| Optional review | Review/change states that offer human intervention without requiring it; business-approved continuation rule. |
| Odoo handover | Authorized record update with correct URL/site/lead association and acknowledged delivery; retry/idempotency behavior demonstrated. |
| Unsold rebrand | Same site/layout/host, minor customer replacement, new URL, former association/history behavior and QA rerun defined and proved. |
| Release/deployment | Trusted receipt compatibility and independent approval resolved through the owning governance lane; exact protected release, immutable image activation, migrations and runtime evidence. |
| Complete acceptance | A real-business input produces the correct hosted site and Odoo handover; a second site proves isolation and a reuse run proves rebranding. Later domain readiness uses the same hosted artifact. |

Nonbinding engineering recommendations: preserve existing modular boundaries where they meet the requirement; avoid adding an LLM merely because the product is agent-driven; use opaque numeric URL identifiers with explicit privacy/access rules; and retain evidence separately for source integration, provider admission, runtime deployment and end-to-end product acceptance.

## 13. Decisions and authority still missing

The business agent must settle input completeness/approval, template-selection fallback, QA acceptance and pre-sale form behavior, optional-review timing, former URL/customer-history treatment, Odoo fields/acknowledgement and the precise content-maintenance/domain boundary. The engineering agent must not silently choose those commercial behaviors while writing the PRD.

Technical facts needing fresh owner receipts before execution include current Platform tenant/schema acceptance, provider selectability/consumer readiness, actual secret references and grants, production configuration, migration prerequisites, authorized Odoo identity and the final hosting activation plan. Example env files and historical approval statements are not live credential/grant receipts.

The prior September work had scoped founder approval for exact governed release/deployment prerequisites; it did not establish successful promotion or activation. Do not reuse historical candidate-specific approvals for a newly written PRD or changed deployment. The current request authorizes investigation, writing and documentation delivery. The founder additionally authorized bootstrap as needed for that delivery; this report confines its use to the exact two-document publication, not application rollout or a new technical PRD.

## 14. Continuation safeguards and documentation delivery

Read root `AGENTS.md`, applicable directory instructions and physical `.agents/skills/` before work. Installed `.ide-development/` is managed/read-only except through its official installer. The current routing request is Luna 6 High delegation for execution/investigation; do not silently revert to earlier Grok/Luna versions or dispatch duplicate workers.

Preserve these constraints:

- No Docker, Docker Desktop, Colima, Podman, local container CLI/build/test or local database execution on the Mac mini. Hosted CI and scoped remote Server03 inspection were allowed; deployment requires its own exact authorization/evidence.
- No broad cleanup, destructive Git reset or removal of unrelated user files/worktrees. Check checkout/remote/branch identity before staging or pushing; stage only task files.
- In ordinary application delivery, no self-review, implementer-opened PR, direct protected push, self-merge, rule bypass or implicit staging/main promotion. Use the governed issue helper, Phase Packager/Coordinator and delivery controller in their proper roles. The separate founder-authorized documentation bootstrap must be recorded as an exact, narrow exception with independent review and protection restoration/readback where applicable; it does not waive product-release proof or turn a waived gate into PASS.
- Keep source/provider/consumer/live proof separate. Do not credit tests, cached images, PREPARED/HOLD receipts or an unintegrated branch as a working website factory.
- Do not print/copy keys, tokens, connection strings or private business data. An existing broad SSH identity is not a portable delegated credential for another agent.

Governed issue setup is `PYTHONPATH=. python3 scripts/gitops/create_issue_branch.py "<task>" --prefer-worktree`. Checkpoint/completion evidence is handled by `scripts/gitops/completion_gate.py` (`write-evidence`, `review-ready`, `blocked`, `status`). A reviewer must be independent of report authorship; the official Phase Packager, not the implementer, owns the Phase PR.

The requested report destinations are `docs/` on protected main and matching Markdown copies in `/Users/linktrend/Downloads`. These reports are prepared as a documentation-only package on issue #608. The installed ordinary issue/Phase route targets development; only `promote/main/*` reaches main. No predefined documentation-only main route was found. Carrying the divergent application release merely to store two reports would exceed this assignment. The founder-authorized bootstrap is therefore being evaluated only for a frozen candidate based on current main with these two documentation files and no application differences. Actual publication must be independently read back; if unavailable, main delivery remains HOLD. Never disguise issue-branch publication as main integration. The delivery outcome/commit is reported separately so this source-and-server snapshot stays unchanged.

## 15. Evidence navigation and document freshness

Begin with the current source pointers in this report. Then inspect `docs/LINKSITES-INTENT.md`, the canonical Profile v2 roadmap and the production evidence packets for original intent/acceptance criteria. `docs/LINKSITES-TECHNICAL-PRD.md` says its baseline is through 19 July 2026; some missing-runtime statements are stale against the current signed service and real Payload publication adapters. The production-readiness roadmap is also a draft with an older baseline. Use these as history, not a substitute for current source and runtime verification.

Server owner context comes from **Server03 Production Owner** and its accepted evidence directory. Small investigation notes retained on this Mac are `/tmp/linksites-handover-build-evidence-20261009.md` and, where present, `/tmp/linksites-handover-server-evidence-20261009.md`; they are convenience notes, not required durable inputs for a receiving agent. All substantive findings needed for continuation are captured above or in the exact linked source/receipts.

Before implementation, refresh the protected commits/trees, provider catalogue/handoff, PR checks/reviews, and Server03 activation state. Preserve this snapshot and append the new evidence rather than editing it into a claim that was not true at the cutoff.
