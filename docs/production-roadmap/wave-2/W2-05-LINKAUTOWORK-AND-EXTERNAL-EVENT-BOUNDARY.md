# W2-05 — LiNKautowork and External Event Boundary

**Status:** Planned — requires Wave 1 PASS
**Wave:** 2
**Executor:** one Codex Luna High implementation agent
**Safe lane:** governed event adapters and integration contracts

## Outcome

Replace direct raw-n8n coupling with the intended LiNKautowork gateway/event boundary and provide production-shaped, replay-safe adapters for CRM intake/completion without making a specific CRM a prerequisite for the first test.

## Required implementation

1. Inventory every direct `N8N_WEBHOOK_URL`, raw webhook, and integration call. Classify and replace active calls; historical documents may retain labeled evidence.
2. Implement the canonical `LiNKautoworkEventEnvelope` adapter using the approved signed gateway/event contract: authentication/signature, timestamp/nonce or replay protection, correlation/idempotency key, timeout, bounded retry, acknowledgement, and delivery receipt.
3. LiNKsites may invoke only pre-integrated LiNKautowork automations/events authorized for its organization and environment. It must not discover or run arbitrary n8n workflows.
4. Define production-ready CRM pull/claim/completion ports and one reference adapter or contract-test harness. The concrete CRM vendor may remain configurable/undecided; business logic must not depend on vendor fields.
5. Maintain the manual/file adapter for the first production test. It must enter/exit at the same canonical contract boundary and generate a CRM-shaped completion artifact. In production, the `lead.research.ready` package is carried inside the signed LiNKautowork event and accepted only by the internal orchestrator ingress; the package metadata must equal the signed event metadata.
6. Implement outbound queue/outbox or equivalent durable delivery so a process crash cannot lose or duplicate logical events.
7. Redact/sign safely: secrets never enter payload logs/evidence; invalid signatures and stale/replayed messages fail closed.
8. Remove Stripe and Odoo direct client assumptions from LiNKsites active runtime/configuration. Commercial systems remain behind LiNKreach authorization contracts.
9. Add health/metrics for backlog, failures, attempts, acknowledgement latency, and dead-letter/manual-attention state.

## Required tests

- signed happy-path request/acknowledgement
- invalid signature, stale timestamp, nonce replay
- duplicate idempotency key
- timeout/5xx retry then success
- permanent 4xx/contract failure dead-letter
- crash between send and receipt persistence
- outbox recovery and exactly-once logical completion
- vendor CRM mapping contract tests
- manual adapter parity with CRM-shaped envelopes
- secret redaction

## Acceptance gates

- Active code/configuration contains no direct raw-n8n webhook coupling.
- LiNKautowork is treated as the governed gateway, not a marketplace/discovery service.
- First test works without a live CRM while proving the exact future boundary.
- Durable delivery/replay behavior is proven locally.
- No direct Stripe/Odoo integration remains.

## Evidence and handoff

Provide integration inventory before/after, event contract version, redacted signed examples, failure/replay test results, exact SHA, external configuration names, and any live credential/network proof deferred explicitly to Phase 2.
