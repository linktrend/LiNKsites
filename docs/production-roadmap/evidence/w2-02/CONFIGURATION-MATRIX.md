# W2-02 configuration matrix

| Setting | Local first-test value | Production/live status |
| --- | --- | --- |
| `W2_02_MODE` | `local` | Any other value fails closed |
| `W2_02_ORG_ID` | Explicit local org identifier | Required; never inferred |
| `W2_02_APPROVED_FACTS_PATH` | Explicit approved-facts JSON path | Required for content production; missing or lead-mismatched facts fail closed |
| `W2_02_EXECUTION_REVISION` | Full 40-character Git SHA | All evidence and irreversible receipts carry this revision |
| State ledger | `program-ledger.json` plus atomic sidecar | Replace with an approved durable service before VPS |
| Intake | Manual NDJSON file through `runFirstReadyFileLead` | Future CRM adapter must use the same `LeadResearchPackage` boundary |
| Completion | Idempotent local NDJSON sink | Future LiNKautowork/CRM-shaped delivery boundary |
| CMS | Local draft/read-back equivalent | Real Payload process and credentials remain environment requirements |
| Frontend/deployment | Private token-required/noindex local equivalent | Hosted preview environment remains deferred |
| Executors | Exact `kind@version` registry plus ordered capability allowlists in `src/graph.ts` | Unknown, missing, mismatched, or over-capable executors fail closed |
| Secrets | None accepted or required in local mode | No live secret, Stripe, Odoo, n8n, DNS, or cloud mutation |

The local composition root is intentionally pre-VPS evidence. It demonstrates
composition, durable state, replay and boundary contracts; it is not proof of a
hosted database, live Payload credentials, hosted execution, or public launch.
