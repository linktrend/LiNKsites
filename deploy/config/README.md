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
| `DATABASE_URI` | database owner | yes | CMS, worker | non-loopback PostgreSQL URL | rolling restart; preserve connection compatibility |
| `PAYLOAD_SECRET` | CMS owner | yes | CMS, worker | 32+ chars | coordinated session/key rotation; restart both |
| `PAYLOAD_PUBLIC_SERVER_URL` | LiNKsites operations | no | CMS, worker | non-loopback HTTPS URL | coordinate CMS and frontend deployment |
| `LINKAUTOWORK_GATEWAY_URL` | LiNKautowork | no | CMS, worker | non-loopback HTTPS URL | verify signed gateway before restart |
| `LINKAUTOWORK_SIGNING_SECRET` | LiNKautowork | yes | CMS, worker | 32+ chars | dual-key overlap required; restart senders after gateway accepts new key |
| `LINKAUTOWORK_SIGNING_KEY_ID` | LiNKautowork | no | CMS, worker | identifier | must name an accepted gateway key |
| `LINKAUTOWORK_ENVIRONMENT` | LiNKautowork | no | CMS, worker | exact `production` | never substitute a development value |
| `LINKAUTOWORK_OUTBOX_PATH` | LiNKsites operations | no | CMS, worker | absolute path | preserve/restore durable outbox before changing |
| `LINKAUTOWORK_OUTBOX_INTEGRITY_SECRET` | LiNKsites operations | yes | CMS, worker | 32+ chars | stop/drain then rotate with verified restore |
| `NEXT_PUBLIC_CMS_PROVIDER` | LiNKsites operations | no | web-master | exact `payload` | build-time public value; rebuild image |
| `PAYLOAD_BASE_URL` | LiNKsites operations | no | web-master | non-loopback HTTPS URL | rebuild image when public bundle changes |
| `NEXT_PUBLIC_PAYLOAD_API_URL` | LiNKsites operations | no | web-master | non-loopback HTTPS URL | rebuild image when public bundle changes |
| `PAYLOAD_API_KEY` | CMS owner | yes | web-master | 32+ chars | rotate server process after CMS grants replacement key |
| `W2_02_*` values | LiNKsites program owner | mixed | orchestrator | see `production.env.example` | stop intake, preserve ledger, rotate/restart, then verify exact state |

No default credentials, localhost URLs, fixture mode, raw webhooks, or mock
content are valid in this contract. The Phase 2 operator creates the protected
runtime file and runs `node deploy/scripts/validate-runtime-config.mjs SERVICE`
before compose can start any service.
