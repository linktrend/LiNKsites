# W2-05 correction evidence

## Exact inventory

Before (base `28cf47236fa81e87c606e9633a24af7cf1db16b3`):

| Active path | Finding |
| --- | --- |
| `apps/cms/src/hooks/triggerRebuild.ts` | Fire-and-forget adapter; hook returned before delivery was durably recorded. |
| `apps/cms/src/payload/utils/autowork.ts` | Missing lead/org/site fail-closed handling; active n8n provenance/skip coupling. |
| `packages/autowork-boundary/src/index.ts` | Wildcard org grants; no canonical pre-transport validation; incomplete retry and process-local replay state; no durable lease/receipt state. |
| `apps/intake-orchestrator/src/contracts.ts` | Ports existed, but no reference vendor-field mapping harness. |
| `apps/cms/.env.example`, `apps/cms/deploy/prod/.env.example` | No durable queue/grant configuration. |

After (candidate correction SHA `c04f8cb6662bf6c47acdfe5cb55a3c666fa837a2`):

| Active path | Correction |
| --- | --- |
| `apps/cms/src/hooks/triggerRebuild.ts` | Awaits canonical enqueue before hook return. |
| `apps/cms/src/payload/utils/autowork.ts` | Requires explicit lead/org/site, configured event grants, gateway URL, signing key, environment, and durable outbox path; exports recoverable drain worker. |
| `packages/autowork-boundary/src/index.ts` | Validates canonical envelope before transport and enqueue; explicit org/environment/event grants; bounded 5xx/timeout retry; locked durable state; corruption fail-closed; durable sent/dead-letter receipt; retry attempt increment with re-sign hook; restart-safe metrics. |
| `packages/autowork-boundary/src/crm-reference.ts` | Vendor-neutral reference mapping harness; vendor fields do not cross canonical boundary. |
| `apps/cms/tests/contracts/autowork-composition.spec.ts` | Actual CMS adapter composition proves enqueue-before-return, restart drain, receipt persistence, and invalid identity/missing grant transport suppression. |
| `apps/cms/.env.example`, `apps/cms/deploy/prod/.env.example` | Explicit grant and outbox configuration names; production grant intentionally blank. |

## Contract and redacted example

Canonical contract version: `{ "major": 1, "minor": 0 }`.

Redacted signed request shape (signature and nonce are never logged):

```json
{"envelope":{"schema_version":{"major":1,"minor":0},"org_id":"org_demo","correlation_id":"cms:page-1","idempotency_key":"cms:pages:page-1:content_published","event_id":"event:cms:pages:page-1:content_published","event_name":"demo.completed","payload":{"lead_id":"lead-1","site_id":"site-1"},"signature":{"algorithm":"hmac-sha256","key_id":"cms-test","signature":"[redacted]"},"delivery_attempt":1,"acknowledgement":{"status":"pending"}},"timestamp":1700000000,"nonce":"[redacted]"}
```

Configured names/counts: `LINKAUTOWORK_GATEWAY_URL` 1, `LINKAUTOWORK_SIGNING_SECRET` 1, `LINKAUTOWORK_SIGNING_KEY_ID` 1, `LINKAUTOWORK_ENVIRONMENT` 1, `LINKAUTOWORK_OUTBOX_PATH` 1, `LINKAUTOWORK_EVENT_GRANTS` 1. No wildcard grant is permitted.

## Proof and limitations

- Focused adversarial boundary tests and actual CMS composition tests are local-real; tests use a disposable filesystem queue and mocked local transport.
- The root build/typecheck/test and CMS prebuild are required validation; their exact result is recorded in the handoff, not implied by this document.
- No live CRM, LiNKautowork credential, hosted CRM, deployment, VPS, or production network receipt was used. This correction proves the boundary and local recovery behavior only.
- A filesystem queue is suitable for the local/manual proof, not production multi-process operation without a database/object-store implementation and operational backup/alerting policy.
