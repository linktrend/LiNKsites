# W2-05 integration inventory and local proof

## Active inventory after implementation

| Surface | Classification | Result |
| --- | --- | --- |
| `apps/cms/src/payload/utils/autowork.ts` | active adapter | Uses `LiNKautoworkGateway`, signed canonical envelope, fixed `demo.completed` event, org/environment configuration, acknowledgement receipt. |
| `packages/autowork-boundary/src/index.ts` | active gateway boundary | HMAC-SHA256 signing/verification, timestamp window, nonce replay guard, idempotency-key outbox deduplication, bounded retry, 4xx dead-letter, timeout, redacted metrics. |
| `apps/intake-orchestrator/src/contracts.ts` and file adapters | active CRM/manual ports | Vendor-neutral pull/claim/completion ports; existing NDJSON adapter remains the manual/file reference path and emits the same canonical completion envelope. |
| `apps/cms/.env.example`, `apps/cms/deploy/prod/.env.example` | active configuration | `LINKAUTOWORK_GATEWAY_*` names only; no raw n8n URL or secret. |

## Historical inventory retained without rewrite

| Reference | Classification | Reason retained |
| --- | --- | --- |
| `docs/archive/**`, `archive/**` | historical | Append-only or archived material documenting former boundaries. |
| `apps/cms/src/payload-types.ts`, CMS site rebuild fields | existing rebuild compatibility surface | Separate site rebuild webhook configuration; not an n8n/LiNKautowork event boundary and not changed by W2-05. |
| `apps/cms/src/payload/endpoints/webhooks/**`, YouTube webhook route | inbound signed webhooks | Independent CMS/YouTube HTTP authentication surface; not outbound LiNKautowork coupling. |

## Local evidence classification

- `packages/autowork-boundary/tests/boundary.test.ts`: local-real filesystem/outbox and deterministic transport harness.
- `apps/intake-orchestrator/tests/*.test.ts`: existing local-real manual/file and durable orchestration tests.
- No live CRM, LiNKautowork, hosting, deployment, secret, or external configuration mutation was performed.
- A real gateway URL, credential, network delivery, and production receipt remain deferred to Phase 2.
