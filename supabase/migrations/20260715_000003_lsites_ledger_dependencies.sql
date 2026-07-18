-- migrate:up
-- Program Ledger: Issue dependency relationships (append-only).
--
-- Adds a general dependency mechanism to the lsites_ledger schema: an
-- Issue can declare that it depends on one or more other Issues. A
-- dependent Issue may not be dispatched until ALL of its declared
-- dependencies have reached the `completed` state (i.e. their Gate has
-- been accepted). This is enforced at the application layer in
-- packages/program-ledger/src/ledger.ts `dispatch()` and backed by this
-- table for durable, Postgres-side storage with full FK integrity.
--
-- Design notes:
--   - A separate join table (not an array column on `issues`) is used so
--     both issue_id and depends_on_issue_id are FK-enforced at the
--     database level, consistent with how `runs`, `gate_results`,
--     `ledger_events`, and `idempotency_records` all reference `issues`
--     via FK join records rather than embedding related IDs in arrays.
--   - The composite PK (issue_id, depends_on_issue_id) makes the
--     relationship idempotent at the schema level and prevents duplicate
--     entries for the same pair.
--   - Circular dependencies (A depends on B AND B depends on A) are not
--     rejected by this schema — that is an application-layer concern.
--     The manual §20 dependency DAG doctrine (future work) is the right
--     place to enforce acyclicity.
--   - ON DELETE CASCADE on issue_id: if the dependent Issue is deleted,
--     its dependency declarations go with it. ON DELETE RESTRICT on
--     depends_on_issue_id: an Issue cannot be deleted while other Issues
--     still depend on it (prevents silent dangling dependency records that
--     would make a dependent Issue permanently un-dispatchable without any
--     obvious reason).
--
-- This migration is append-only: it does NOT modify
-- 20260714_000001_program_ledger_core.sql. Apply it AFTER the core
-- migration is in place.

create table if not exists lsites_ledger.issue_dependencies (
  issue_id            uuid not null references lsites_ledger.issues(issue_id) on delete cascade,
  -- No FK on depends_on_issue_id by design: enforcing existence at the
  -- schema level would prevent the valid scenario of storing a dependency
  -- reference whose target might not yet be in this database partition (e.g.
  -- cross-program references), and would break the consistent application-
  -- layer behaviour where `assertDependenciesSatisfied()` in ledger.ts is
  -- the single, enforced validation point for whether a dependency is met.
  -- The composite PK still prevents duplicate records; the issue_id FK still
  -- ensures dependency records are cleaned up when the dependent Issue is
  -- deleted. Existence of the dependency target is the application's
  -- responsibility, validated at dispatch time in ledger.ts.
  depends_on_issue_id uuid not null,
  created_at          timestamptz not null default now(),
  primary key (issue_id, depends_on_issue_id)
);

create index if not exists idx_ledger_issue_deps_issue_id
  on lsites_ledger.issue_dependencies(issue_id);

-- Grant the same runtime role the same least-privilege access as all
-- other lsites_ledger tables: select + insert (no update/delete -- once
-- a dependency is declared it is immutable; removal requires superuser
-- schema management, not runtime app code).
grant select, insert on lsites_ledger.issue_dependencies to svc_linksites_ledger;

alter table lsites_ledger.issue_dependencies enable row level security;

-- Access is restricted to the dedicated runtime role only, matching the
-- policy convention established in 20260714_000001_program_ledger_core.sql.
create policy lsites_ledger_runtime_only on lsites_ledger.issue_dependencies
  for all to svc_linksites_ledger using (true) with check (true);
