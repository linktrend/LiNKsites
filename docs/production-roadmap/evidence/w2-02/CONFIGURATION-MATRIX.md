# W2-02 configuration matrix

| Setting | Local first-test value | Production/live status |
| --- | --- | --- |
| `W2_02_MODE` | `local` | Any other value fails closed |
| `W2_02_ORG_ID` | Explicit local org identifier | Required; never inferred |
| `W2_02_APPROVED_FACTS_PATH` | Explicit approved-facts JSON path | Required for content production; missing or lead-mismatched facts fail closed |
| `W2_02_EXECUTION_REVISION` | Must equal the checked-out Git SHA; it is not accepted as an arbitrary env-form revision | All evidence and irreversible receipts carry the actual executable commit |
| Executable checkpoint | SHA-256 of the checked-out orchestrator/factory/ledger source and package inputs | Exported with every run proof; build must be rerun before certification |
| State ledger | `program-ledger.json` with atomic writes; adapter effects are not stored in a JSON sidecar | Replace the local ledger with the approved durable service before VPS |
| Working content | Durable embedded PostgreSQL-compatible database using `WorkingContentRepository` | Supabase/Postgres service and RLS proof remain environment requirements |
| Intake | Manual NDJSON file through `runFirstReadyFileLead` | Future CRM adapter must use the same `LeadResearchPackage` boundary |
| Completion | Durable ledger outbox plus idempotent local NDJSON sink; attempts/failures/backlog/dead-letter/ack are observable | Future LiNKautowork/CRM-shaped delivery boundary |
| CMS | `PayloadRestDraftTarget` through `W2_02_PAYLOAD_BASE_URL`; default local proof starts a database-backed HTTP harness | Real Payload process, database, and credentials remain environment requirements |
| Frontend/deployment | Protected token-required/noindex/no-store web-master HTTP boundary | Hosted preview environment remains deferred |
| Executors | Exact `kind@version` registry plus ordered capability allowlists in `src/graph.ts` | Unknown, missing, mismatched, or over-capable executors fail closed |
| Secrets | None accepted or required in local mode | No live secret, Stripe, Odoo, n8n, DNS, or cloud mutation |

The local composition root is intentionally pre-VPS evidence. It demonstrates
composition, durable state, replay and boundary contracts; it is not proof of a
hosted database, live Payload credentials, hosted execution, or public launch.
