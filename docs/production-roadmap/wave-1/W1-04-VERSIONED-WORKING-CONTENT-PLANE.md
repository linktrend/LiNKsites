# W1-04 — Versioned Working-Content Plane

**Status:** Planned — pending approval and W1-01 contract freeze
**Wave:** 1
**Executor:** one Codex Luna High implementation agent
**Safe lane:** Factory Catalog persistence and Supabase schema

## Outcome

Make Supabase the private, versioned workshop where agents assemble and revise a site's working content before an explicit promotion copies one accepted version into a Payload draft.

## Read before work

- W1-01 accepted contracts
- `packages/factory-catalog/**`
- existing active and legacy `supabase/migrations/**`
- `scripts/**` related to CMS/Supabase synchronization
- promotion executor code and tests

## Owned paths

- `packages/factory-catalog/**` working-content repositories/services/tests
- one or more additive migrations created through Supabase CLI
- working-content fixtures

Do not modify Payload collections or frontend rendering here.

## Required data model

Use the existing active model where sound; extend rather than create a competing second system. The model must durably identify:

- `org_id`, lead, site, and Program/run
- immutable working-package/version identity and monotonically ordered version
- parent/base version and author/executor identity
- structured page/section/content payload
- asset and LiNKlibraries SHA references
- provenance for factual claims, template-baseline-to-prospect copy adaptations, bundled template assets, and any authorized prospect-owned brand assets
- deterministic content checksum
- lifecycle state such as `working`, `ready_for_gate`, `accepted`, `promoted`, `superseded`, `rejected`
- gate/evidence references
- Payload target, draft revision, promotion idempotency key, and receipt
- created/updated/promoted timestamps

## Required implementation

1. Add immutable version creation; never overwrite an accepted/promoted version in place.
2. Add optimistic concurrency or compare-and-swap behavior to prevent silent lost updates.
3. Validate the structured package against template/content contracts before accepting it.
4. Store checksums and verify them when reading/promotion begins.
5. Implement repository operations for create version, compare versions, mark gate outcome, select exact accepted version, record promotion receipt, and trace lineage.
6. Enforce `org_id` isolation and least-privilege RLS. Service operations must use explicit server credentials; browser/public roles must not mutate working packages.
7. Ensure repeated promotion preparation with the same idempotency key selects the same immutable version.
8. Classify old `lsites_core` mirror scripts/migrations as historical, migrate required data deliberately, and prevent them being invoked as a supported synchronization path.
9. Do not introduce scheduled or two-way Payload synchronization. Promotion remains an explicit command handled in W2-03.

## Required tests

- create/read/version lineage
- concurrent update conflict
- immutable accepted/promoted content
- checksum mismatch rejection
- schema/template incompatibility rejection
- exact version selection
- idempotent promotion receipt
- cross-organization denial through repository and RLS tests
- migration/reset from a clean database
- no legacy mirror invocation in active package scripts

## Acceptance gates

- A complete lead-specific working package can be stored, revised, accepted, and retrieved by exact version/checksum.
- The active system has one documented working-content model.
- RLS and service-role assumptions are proven locally, not only described.
- There is no cadence-based or blind two-way sync.
- Factory Catalog, migration, root typecheck, and relevant integration suites pass.

## Evidence and handoff

Provide generated migration names, schema/lineage diagram, RLS test evidence, repository API, legacy-path classification, exact SHA, and the promotion input contract for W2-03.
