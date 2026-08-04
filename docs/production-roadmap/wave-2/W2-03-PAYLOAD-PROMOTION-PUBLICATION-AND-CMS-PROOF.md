# W2-03 — Payload Promotion, Publication, and CMS Proof

**Status:** Planned — requires Wave 1 PASS
**Wave:** 2
**Executor:** one Codex Luna High implementation agent
**Safe lane:** CMS collections/adapters and promotion executor

## Outcome

Promote one exact accepted Supabase working version into a Payload draft, verify read-back parity, and keep publication as a separate authorized action. Prove the path against a real local Payload instance and database.

## Authority model

- Supabase: versioned private working content and evidence.
- Payload draft: explicitly promoted candidate under final CMS validation/review.
- Payload published: live authority read by `web-master`.
- Promotion and publication are separate gates and separate idempotent commands.

## Required implementation

1. Reconcile Payload collections with the canonical content/template schema, organization/site identity, revisions/drafts, access rules, and required media relationships.
2. Implement a server-side CMS adapter with least-privilege credentials, timeouts, bounded retries, stable idempotency keys, and sanitized error reporting.
3. Promotion must read an exact accepted working version/checksum, reject mutated/unaccepted input, upsert/create the correct Payload draft, and record a receipt containing IDs/revisions/checksums.
4. Read the draft back, normalize deterministic differences, and compare it field-by-field to the promoted package. Parity failure rejects the gate.
5. Publication must be a separate method requiring an accepted publication authorization and gate evidence. A promotion call must never implicitly publish.
6. For the first private-demo test, publication targets the private preview site/environment only; no public customer domain activation is authorized.
7. Make replay safe: repeated promotion or publication with the same key returns/verifies the same logical result.
8. Disable or archive retired Supabase-to-Payload mirror scripts so they cannot bypass promotion.
9. Implement collection/access tests showing drafts and private tenant data are not anonymously exposed.

## Required proof

Use a real local Payload process and configured database. Mocks may remain for unit tests but cannot satisfy the packet gate. Prove:

- accepted working version -> Payload draft
- draft read-back parity
- unaccepted/mutated version rejection
- anonymous draft denial
- explicit private publication
- `web-master` reads the resulting published CMS data
- replay/restart behavior

## Acceptance gates

- The CMS starts from documented configuration and migrations/schema state.
- Draft promotion and publication are technically and evidentially separate.
- Real CMS integration proof passes; previously skipped CMS tests are either enabled and passing or have a Phase 1 blocking disposition.
- No supported blind/timed/two-way sync remains.
- Secrets are absent from client bundles, logs, fixtures, and evidence.

## Evidence and handoff

Provide redacted CMS IDs/revisions, checksums and parity report, access-control results, command output, exact SHA, configuration/secrets names (never values), and the frontend query contract for W2-04.

