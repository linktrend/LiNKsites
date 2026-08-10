# `@linksites/types`

This package is the canonical, dependency-free contract boundary for the
LiNKsites Program. Its runtime validators reject unsupported schema versions,
missing organization or stable identifiers, invalid idempotency data, unknown
enum values, unsafe completion records, payment-processing fields on technical
activation requests, and secret-shaped payload keys before side effects occur.

The public execution hierarchy is `Program -> Module -> Phase -> Issue -> Run`.
LiNKreach owns commercial authorization; LiNKsites owns technical website
operations; Payload published content is live authority; Supabase holds working
versions and workflow evidence; LiNKlibraries owns reusable implementations;
and the Factory Catalog owns selection/lifecycle metadata and SHA receipts.

The seven canonical envelopes and their validators are exported from
`src/index.ts`:

- `LeadResearchPackage` / `isLeadResearchPackage`
- `DemoCompletionEnvelope` / `isDemoCompletionEnvelope`
- `CommercialOutcomeEnvelope` / `isCommercialOutcomeEnvelope`
- `ActivationRequest` / `isActivationRequest`
- `RecyclingRequest` / `isRecyclingRequest`
- `LiNKautoworkEventEnvelope` / `isLiNKautoworkEventEnvelope`
- `EvidenceReceipt` / `isEvidenceReceipt`

Fixtures and dependency-free runtime tests are under `fixtures/` and `tests/`.
