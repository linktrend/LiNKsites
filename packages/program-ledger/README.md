# @linksites/program-ledger

Governed, auditable execution core (Issues / Runs / Gates / Events / Idempotency)
for the LiNKsites factory — see `audit/09_gap_and_risk_register.yaml` (GAP-01,
GAP-31, GAP-50) for status.

## Tests

Run with `pnpm --filter @linksites/program-ledger test`.

| File | What it proves |
|---|---|
| `tests/exit-gate.spec.ts` | Manual §62 exit gate against the in-memory store. |
| `tests/hierarchy.spec.ts`, `tests/executor.spec.ts` | Program/Module/Phase and executor logic. |
| `tests/postgres-store.spec.ts` | The `PostgresLedgerStore` adapter against a real embedded Postgres engine (`@electric-sql/pglite`) exercising the core schema and additive W1-02 migration. |
| **`tests/tenant-isolation.spec.ts`** | **Tenant-isolation NEGATIVE test matrix (GAP-06, manual §18.84-85).** 12 cross-tenant attack vectors, each with a denied (negative) case and a paired same-org (positive) case, run against the real `lsites_sites` + `platform` RLS from `supabase/migrations/20260715_000001_lsites_sites_core.sql` and the shared platform foundation. |

W1-02 adds durable Program/Module/Phase records, the first private-demo Issue
graph, dependency-aware runnable queries, atomic lease claims, and evidence-
backed Issue/Phase/Module/Program gate records. The in-memory snapshot API is
used for deterministic restart/rebuild tests; Postgres persistence is exercised
through the additive Supabase migration and pglite tests.

### Why the tenant-isolation matrix lives in this package

It is co-located with `postgres-store.spec.ts` because this package is the repo's
only home for **real-Postgres contract tests**: it already carries a working
`@electric-sql/pglite` dev dependency and the pattern of applying `supabase/`
migration SQL to an embedded engine. `factory-catalog` is pure in-memory
domain-logic unit tests (no DB engine), so an RLS suite would not fit there. The
matrix spans two schemas (`platform` + `lsites_sites`); the shared platform
migration is vendored under `tests/fixtures/` so the suite runs in CI without the
sibling LiNKplatform repo — see `tests/fixtures/README.md`.

The spec's file-level docblock records four findings (F1–F4) about the RLS
boundary that the matrix surfaced.
