# W2-02 configuration matrix

| Setting | Local first-test value | Production/live status |
| --- | --- | --- |
| `W2_02_MODE` | `local` | Production requires `production`; `W2_02_DATABASE_URI` is canonical and the adapter-facing `DATABASE_URI` alias must match when supplied |
| `W2_02_ORG_ID` | Explicit local org identifier | Required; never inferred |
| `W2_02_APPROVED_FACTS_PATH` | Explicit approved-facts JSON path | Required for content production; missing or lead-mismatched facts fail closed |
| `W2_02_EXECUTION_REVISION` | Must equal the checked-out Git SHA; it is not accepted as an arbitrary env-form revision | All evidence and irreversible receipts carry the actual executable commit |
| LiNKlibraries authority | The same release contract supplies one immutable `W2_02_LIBRARY_COMMIT_SHA`, catalog-byte SHA-256, and entry-byte SHA-256. | The orchestrator reads only that commit from the mounted checkout; it rejects a catalog/entry checksum mismatch. Deployment manifest, preflight, Compose, and runtime must all bind the same exact commit and bytes. |
| Executable checkpoint | SHA-256 of the checked-out orchestrator/factory/ledger source and package inputs | Exported with every run proof; build must be rerun before certification |
| State ledger | `program-ledger.json` remains a local-only adapter. | Production composition uses `PostgresRuntimeStateStore` and the migration-owned `lsites_ledger` tables with tenant RLS; VPS execution must prove the live credentials and migration application. |
| Working content | Durable embedded PostgreSQL-compatible database using `WorkingContentRepository` | Supabase/Postgres service and RLS proof remain environment requirements |
| Intake | Governed manual NDJSON adapter through the shared `LeadResearchPackage` boundary. | `PostgresWorkIntakePort.submit` is the production manual/CRM-shaped writer. It validates the canonical package before insert, and a malformed picked legacy row is durably rejected so it cannot block the queue head. |
| Completion | Durable ledger outbox plus idempotent local NDJSON sink; attempts/failures/backlog/dead-letter/ack are observable | Future LiNKautowork/CRM-shaped delivery boundary |
| CMS | `PayloadRestDraftTarget` through `W2_02_PAYLOAD_BASE_URL`; real local proof uses the disposable authenticated Payload process from W2-03/W2-04 | Hosted credentials remain environment requirements |
| Frontend/deployment | Protected secret-free `/en/demo` completion URL with an out-of-band preview header, noindex/no-store `apps/web-master` HTTP boundary | Hosted preview environment remains deferred |
| Executors | Exact `kind@version` registry plus ordered capability allowlists in `src/graph.ts` | Unknown, missing, mismatched, or over-capable executors fail closed |
| Secrets | None accepted or required in local mode | No live secret, Stripe, Odoo, n8n, DNS, or cloud mutation |

The local composition root is intentionally pre-VPS evidence. It demonstrates
composition, durable state, replay and boundary contracts; it is not proof of a
hosted database, live Payload credentials, hosted execution, or public launch.
