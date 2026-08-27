# LiNKsites production configuration contract

`runtime-contract.mjs` is the executable source of truth. Before a process is
started, `deploy/scripts/entrypoint.mjs` validates only configuration names,
formats, and safe redacted fingerprints. It never prints values.

| Name | Owner | Secret | Required by | Format | Rotation effect |
|---|---|---:|---|---|---|
| `LINKSITES_DEPLOYMENT_ENV` | LiNKsites operations | no | all | exact `production` | restart affected service |
| `LINKSITES_CONFIG_SCHEMA_VERSION` | LiNKsites operations | no | all | exact current schema | update manifest and restart |
| `LINKSITES_RELEASE_SHA` | release process | no | all | full Git SHA | deployment identity changes |
| `LINKSITES_ORG_ID` | LiNKsites program owner | no | all | identifier | redeploy only after tenancy review |
| `DATABASE_URI` | database owner | yes | CMS, worker, Supabase migration job | non-loopback PostgreSQL URL for CMS/worker/migration ownership | rolling restart; preserve connection compatibility |
| `PAYLOAD_SECRET` | CMS owner | yes | CMS, worker | 32+ chars | coordinated session/key rotation; restart both |
| `PAYLOAD_PUBLIC_SERVER_URL` | LiNKsites operations | no | CMS, worker | non-loopback HTTPS URL | coordinate CMS and frontend deployment |
| `LINKAUTOWORK_GATEWAY_URL` | LiNKautowork | no | CMS, worker, orchestrator | non-loopback HTTPS URL | verify signed gateway before restart |
| `LINKAUTOWORK_SIGNING_SECRET` | LiNKautowork | yes | CMS, worker, orchestrator | 32+ chars | dual-key overlap required; restart senders after gateway accepts new key |
| `LINKAUTOWORK_SIGNING_KEY_ID` | LiNKautowork | no | CMS, worker, orchestrator | identifier | must name an accepted gateway key |
| `LINKAUTOWORK_ENVIRONMENT` | LiNKautowork | no | CMS, worker, orchestrator | exact `production` | never substitute a development value |
| `LINKAUTOWORK_OUTBOX_PATH` | LiNKsites operations | no | CMS, worker | absolute path | preserve/restore durable outbox before changing |
| `LINKAUTOWORK_OUTBOX_INTEGRITY_SECRET` | LiNKsites operations | yes | CMS, worker | 32+ chars | stop/drain then rotate with verified restore |
| `LINKAUTOWORK_EVENT_GRANTS` | LiNKautowork policy owner | no | CMS, worker, orchestrator | non-empty JSON event/org/environment grant array; must authorize this tenant's `demo.completed` event for the orchestrator | policy change; drain and restart only after LiNKautowork acceptance |
| `NEXT_PUBLIC_CMS_PROVIDER` | LiNKsites operations | no | web-master | exact `payload` | build-time public value; rebuild image |
| `PAYLOAD_BASE_URL` | LiNKsites operations | no | web-master | non-loopback HTTPS URL | rebuild image when public bundle changes |
| `NEXT_PUBLIC_PAYLOAD_API_URL` | LiNKsites operations | no | web-master | non-loopback HTTPS URL | rebuild image when public bundle changes |
| `PAYLOAD_API_KEY` | CMS owner | yes | web-master | 32+ chars | rotate server process after CMS grants replacement key |
| `PREVIEW_ACCESS_TOKEN` | LiNKsites operations | yes | web-master | 32+ chars | rotate the application-level private preview token and restart web-master |
| `LINKSITES_ADMITTED_TEMPLATE_LIBRARY_PATH` | LiNKsites operations | no | web-master | read-only absolute artifact mount | remount only the manifest-bound approved LiNKlibraries checkout |
| `LINKSITES_ADMITTED_TEMPLATE_SHA` | LiNKlibraries release process | no | web-master | full SHA equal to `LINKLIBRARIES_CATALOG_SHA` | redeploy only with matching receipt/evidence |
| `LINKSITES_ADMITTED_TEMPLATE_RECEIPT_JSON` | LiNKlibraries/LiNKsites release process | no | web-master | verified non-empty library-consumption receipt JSON | replace only with evidence for the mounted approved artifact |
| `LINKSITES_ADMITTED_TEMPLATE_EVIDENCE_JSON` | LiNKlibraries/LiNKsites release process | no | web-master | verified non-empty materialization evidence JSON | replace only with the matching receipt and artifact bytes |
| `W2_02_MODE` | LiNKsites program owner | no | orchestrator | exact `production` | non-production execution is refused by the deployment contract |
| `W2_02_DATABASE_URI` | database owner | yes | orchestrator | canonical distinct non-loopback PostgreSQL URL for the least-privilege orchestrator credential; the packaged adapter may receive the same value as its `DATABASE_URI` alias; never reuse CMS `DATABASE_URI` | rolling restart; preserve adapter connection compatibility |
| `W2_02_ORG_ID` | LiNKsites program owner | no | orchestrator | UUID tenant key | stop intake and re-authorize tenancy |
| `W2_02_SITE_ID` | LiNKsites program owner | no | orchestrator | UUID site key bound to the organization | stop intake and re-authorize tenancy |
| `W2_02_DATABASE_ROLE` | database owner | no | orchestrator | pre-provisioned PostgreSQL role name | coordinate grants and restart |
| `W2_02_POSTGRES_ADAPTER_MODULE` | release process | no | orchestrator | exact `@linksites/program-orchestrator/postgres-adapter` | rebuild/redeploy with the packaged adapter |
| `W2_02_EXECUTION_REVISION` | release process | no | orchestrator | full Git SHA equal to release | rebuild/redeploy with exact release |
| `W2_02_EXECUTABLE_CHECKPOINT` | release process | no | orchestrator | SHA-256 of executable inputs | rebuild/redeploy with exact release |
| `W2_02_STATE_DIR` | LiNKsites operations | no | orchestrator | absolute durable-volume path | stop, back up and restore state before changing |
| `W2_02_APPROVED_FACTS_PATH` | LiNKsites operations | no | orchestrator | absolute path to approved-facts JSON | review source evidence then restart |
| `W2_02_MAX_ATTEMPTS` | LiNKsites operations | no | orchestrator | optional positive integer | restart after retry policy review |
| `W2_02_CONCURRENCY` | LiNKsites operations | no | orchestrator | optional positive integer | drain active leases then restart |
| `W2_02_LEASE_MS` | LiNKsites operations | no | orchestrator | optional positive integer milliseconds | drain active leases then restart |
| `W2_02_PAYLOAD_BASE_URL` | LiNKsites operations | no | orchestrator | private non-loopback HTTPS URL | prove Payload readiness before restart |
| `W2_02_PAYLOAD_API_KEY` | CMS owner | yes | orchestrator | 32+ chars | issue scoped replacement key then restart |
| `W2_02_PAYLOAD_SITE_ID` | LiNKsites program owner | no | orchestrator | scoped Payload site identifier | tenancy review then restart |
| `W2_02_WEB_MASTER_BASE_URL` | LiNKsites operations | no | orchestrator | private non-loopback HTTPS URL | prove private preview readiness before restart |
| `W2_02_PREVIEW_ACCESS_TOKEN` | LiNKsites operations | yes | orchestrator | 32+ chars | must be the same protected token supplied to web-master as `PREVIEW_ACCESS_TOKEN` |
| `W2_05_OUTCOME_GATEWAY_SECRET` | LiNKreach/LiNKautowork | yes | orchestrator | 32+ chars | dual-key overlap then restart |
| `W2_05_OUTCOME_GATEWAY_KEY_ID` | LiNKreach/LiNKautowork | no | orchestrator | identifier | must name accepted gateway key |
| `W2_02_LIBRARY_REPOSITORY_PATH` | LiNKsites operations | no | orchestrator | read-only absolute artifact mount | release only a verified immutable library artifact |
| `W2_02_LIBRARY_COMMIT_SHA` | LiNKlibraries release process | no | orchestrator | full approved LiNKlibraries Git commit SHA | redeploy only with a manifest-bound approved artifact |
| `W2_02_LIBRARY_CATALOG_SHA256` | LiNKlibraries release process | no | orchestrator | SHA-256 of the mounted catalog bytes | redeploy only with the matching manifest-bound artifact |
| `W2_02_LIBRARY_ENTRY_SHA256` | LiNKlibraries release process | no | orchestrator | SHA-256 of the mounted selected-entry bytes | redeploy only with the matching manifest-bound artifact |

The Compose host inputs are also part of the one configuration reference. They
are evaluated before a service starts, are never copied into a browser bundle,
and must be supplied by the Phase 2 protected deployment environment.

| Name | Owner | Secret | Required by | Format | Rotation effect |
|---|---|---:|---|---|---|
| `LINKSITES_RUNTIME_ENV_FILE` | LiNKsites operations | yes | Compose host | protected absolute env-file path | validate then recreate affected services |
| `LINKSITES_CMS_IMAGE` | release process | no | Compose CMS | exact immutable `name@sha256:` reference from the release manifest | new release deployment |
| `LINKSITES_WEB_MASTER_IMAGE` | release process | no | Compose web-master | exact immutable `name@sha256:` reference from the release manifest | new release deployment |
| `LINKSITES_WORKER_IMAGE` | release process | no | Compose worker and Payload migration | exact immutable `name@sha256:` reference from the release manifest | new release deployment |
| `LINKSITES_ORCHESTRATOR_IMAGE` | release process | no | Compose orchestrator | exact immutable `name@sha256:` reference from the release manifest | new release deployment |
| `LINKSITES_MIGRATIONS_IMAGE` | release process | no | Compose Supabase migration | exact immutable `name@sha256:` reference from the release manifest | one-shot, exact release only |
| `LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA` | LiNKplatform release authority | no | migration job and manifest | authoritative full 40-character Git SHA | external governed admission required |
| `LINKLIBRARIES_ARTIFACT_PATH` | LiNKlibraries release process | no | preflight and orchestrator mount | read-only absolute Git checkout containing the exact approved catalog/entry commit and evidence | remount only an approved immutable artifact |
| `LINKLIBRARIES_CATALOG_SHA` / `LINKLIBRARIES_ENTRY_SHA` | LiNKlibraries release process | no | manifest and preflight | same exact full Git commit SHA; catalog entry must be approved | release only after ref review |
| `TRAEFIK_NETWORK` | infrastructure operator | no | Compose edge | existing external Docker network name | coordinated proxy maintenance |
| `TRAEFIK_ENTRYPOINT` | infrastructure operator | no | Traefik routers | existing TLS entrypoint name | coordinated proxy maintenance |
| `TRAEFIK_CMS_HOST` | infrastructure operator | no | private CMS router | private DNS hostname | Phase 2 DNS/TLS operation only |
| `TRAEFIK_PREVIEW_HOST` | infrastructure operator | no | private preview router | private DNS hostname | Phase 2 DNS/TLS operation only |
| `TRAEFIK_CMS_PRIVATE_MIDDLEWARE` | infrastructure operator | no | CMS router | existing privacy middleware name | verify access wall before restart |
| `TRAEFIK_PREVIEW_PRIVATE_MIDDLEWARE` | infrastructure operator | no | preview router | existing privacy middleware name | verify noindex/privacy wall before restart |
| `NEXT_PUBLIC_PAYLOAD_API_URL` | LiNKsites operations | no | web-master build | private non-loopback HTTPS URL | rebuild web-master image |
| `PAYLOAD_PUBLIC_SERVER_URL` | LiNKsites operations | no | web-master build | private non-loopback HTTPS URL | rebuild web-master image |

ISS-33 name-only cutover templates, isolated migrate/readback/rollback, and
permanent drift checks live in [`cutover/`](./cutover/README.md). They reuse
these names and never store credential values or perform live/VPS mutation.

No default credentials, localhost URLs, fixture mode, raw webhooks, or mock
content are valid in this contract. The Phase 2 operator creates the protected
runtime file and runs `node deploy/scripts/validate-runtime-config.mjs SERVICE`
before compose can start any service. `deploy/scripts/preflight.sh` also compares
all five `LINKSITES_*_IMAGE` values byte-for-byte with the corresponding
manifest digest, verifies the mounted LiNKlibraries Git commit/catalog/entry
content and approval status, and rejects tags, placeholders, missing paths, and
missing Traefik inputs before invoking Compose. The packaged adapter receives
the distinct `W2_02_DATABASE_URI` as its adapter-facing `DATABASE_URI` only in
the orchestrator container.
