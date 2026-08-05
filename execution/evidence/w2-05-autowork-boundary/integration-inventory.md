# W2-05 Sol correction-2 evidence

## Scope and lineage

- Immutable implementation base: `749ef8d9e831d8cde1dfa45513a1d0240dc61c45`
- Branch: `issue/w2-05-sol-correction-2`
- Scope: CMS/Payload-to-LiNKautowork composition, durable signed delivery, governed contact-form boundary, and vendor-neutral CRM reference adapter only.
- No hosted, live-deployment, live CRM, VPS, production network, or credential action was performed.

## Findings corrected

| Finding | Truthful source proof |
| --- | --- |
| R1 | `Sites` carries canonical `orgId`, `programId`, and `leadId`; the normal Payload composition fetches the Site, requires an injected Program Ledger PASS reader, rejects invented request metadata, and only builds `demo.completed` after matching PASS identity. |
| R2 | `FileOutbox` persists pending/leased/sent/dead-letter records; `apps/cms/cron/drainLiNKautowork.ts` is a recoverable startup/cron worker; gateway 2xx responses require a non-empty valid receipt; missing/invalid receipts retry and eventually dead-letter. |
| R3 | Queue records have integrity framing, stored HMAC signature verification, current explicit event/org/environment authorization, canonical envelope validation, and pre-transport validation. Cross-org/tampered records fail closed before transport. |
| R4 | Lease id, expiry, attempt, retry error, receipt, and dead-letter state are persisted before transport; expired leases are reclaimable; metrics are reconstructed from durable state after restart; ambiguous sends remain recoverable by idempotency key. |
| R5 | Active web-master contact code no longer reads `CONTACT_WEBHOOK_URL` or a raw n8n/arbitrary webhook. It enqueues signed `contact.submitted` through LiNKautowork with explicit org/site identity and durable outbox configuration. Active form docs/config were updated; archived historical material is excluded from the runtime boundary. |
| R6 | `ReferenceCrmAdapter` proves pull, idempotent claim, canonical completion write, duplicate idempotency, and byte-preserving parity with the manual canonical mapping fixture. |

## Local proof boundary

Focused tests use disposable local filesystem queues and mocked local gateway responses. They prove composition, persistence, receipt failure, Program PASS gating, restart recovery, and CRM adapter behavior; they do not prove hosted credentials, production deployment, live CRM behavior, or production observability.

Validation commands and exact results are reported only after execution from the final pushed commit. Any failure or skipped disposable dependency remains a HOLD, not a PASS.

## Executed local validation

- `pnpm typecheck`: pass, 7/7 packages.
- `pnpm lint`: pass, CMS and web-master lint targets pass.
- `pnpm build` with disposable local `DATABASE_URI`: pass for CMS, web-master, and intake-orchestrator; Turborepo reported only its existing intake build-output warning.
- `bash apps/cms/scripts/test-local.sh`: pass; disposable local Supabase CMS build, 22 passing / 1 intentionally skipped integration test, and 1/1 Chromium E2E pass.
- `bash scripts/test-supabase-local.sh`: pass; exact Platform/LiNKsites migrations and W1-02 RLS probe completed `1..19`, all assertions `ok`.
- Focused W2-05 tests: pass; autowork boundary 6/6, CRM reference pull/claim/completion parity included, and CMS composition/adversarial 4/4.
- Active runtime/docs scan: pass; no `CONTACT_WEBHOOK_URL`, `CONTACT_WEBHOOK_SECRET`, n8n, or N8N references remain under active web-master source/config/docs paths (archived history excluded).
- Diff whitespace and changed-content secret scan: pass; only test fixtures and secret-manager placeholders were present.
