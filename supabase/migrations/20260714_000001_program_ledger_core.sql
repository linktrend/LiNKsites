-- migrate:up
-- Program Ledger core schema (Phase 2 foundation).
--
-- Persists the Issue/Run/Gate/Event/Idempotency contracts defined in
-- packages/program-ledger/src/types.ts (schema_version 1.0), which
-- implement the LiNKsites Program Manual §20 (Issues, Runs, Executors,
-- Model Routing, Idempotency, Retry, and Compensation) doctrine.
--
-- This migration defines the target persistence shape for a future
-- Postgres-backed LedgerStore implementation (see
-- packages/program-ledger/src/store.ts's `LedgerStore` interface). As of
-- this migration, the tested, real implementation is the in-memory store
-- used by packages/program-ledger's test suite -- no application code
-- reads/writes these tables yet. This is intentional: the schema is
-- versioned and reviewable now, ahead of wiring a live database
-- connection into a follow-up work packet, per
-- docs/archive/policies/CONTRACT_AND_SCHEMA_VERSIONING_POLICY.md's requirement
-- that every contract state its own version and have one canonical
-- source of truth.
--
-- Kept in its own `lsites_ledger` schema, separate from `lsites_core`
-- (site/content working-layer domain) -- see audit/09_gap_and_risk_register.yaml
-- and the six-domain grouping recommended during the Phase 0 audit
-- (control/orchestration is this schema; product capability, preview/
-- customer production, validation/publication, economics/observability,
-- and research/evidence remain to be built in later phases).

-- Note: gen_random_uuid() is a PostgreSQL 13+ built-in (no pgcrypto
-- extension required, unlike older PG versions where it was
-- pgcrypto-only). Deliberately not requiring the pgcrypto extension here
-- keeps this migration portable to embedded/lightweight Postgres engines
-- (e.g. pglite, used to test this migration in packages/program-ledger's
-- test suite) that may not bundle every extension.

create schema if not exists lsites_ledger;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'issue_state' and typnamespace = 'lsites_ledger'::regnamespace) then
    create type lsites_ledger.issue_state as enum (
      'ready', 'dispatched', 'running', 'awaiting_gate', 'retry_scheduled',
      'repair_required', 'exception', 'cancelled', 'failed', 'completed'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'run_state' and typnamespace = 'lsites_ledger'::regnamespace) then
    create type lsites_ledger.run_state as enum (
      'created', 'queued', 'claimed', 'executing', 'checkpointed', 'succeeded',
      'failed_retryable', 'failed_terminal', 'timed_out', 'cancel_requested',
      'cancelled', 'compensating', 'compensated'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'gate_decision' and typnamespace = 'lsites_ledger'::regnamespace) then
    create type lsites_ledger.gate_decision as enum ('pending', 'accepted', 'rejected');
  end if;
  if not exists (select 1 from pg_type where typname = 'idempotency_state' and typnamespace = 'lsites_ledger'::regnamespace) then
    create type lsites_ledger.idempotency_state as enum ('reserved', 'executing', 'completed', 'failed_safe_to_retry');
  end if;
end $$;

create table if not exists lsites_ledger.issues (
  issue_id uuid primary key default gen_random_uuid(),
  schema_version_major smallint not null default 1,
  schema_version_minor smallint not null default 0,
  issue_type text not null,
  program_ref text not null,
  module_ref text,
  stage_ref text,
  state lsites_ledger.issue_state not null default 'ready',
  input jsonb not null,
  input_digest text not null,
  side_effect_class text not null default 'none',
  retry_max_attempts int not null default 3,
  retry_backoff_base_ms int not null default 1000,
  retry_backoff_max_ms int not null default 30000,
  timeout_ms int not null default 60000,
  attempt_count int not null default 0,
  cancel_requested boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lsites_ledger.runs (
  run_id uuid primary key default gen_random_uuid(),
  schema_version_major smallint not null default 1,
  schema_version_minor smallint not null default 0,
  issue_id uuid not null references lsites_ledger.issues(issue_id) on delete cascade,
  attempt_number int not null,
  state lsites_ledger.run_state not null default 'created',
  input_snapshot jsonb not null,
  lease_id uuid,
  lease_fencing_token bigint,
  lease_executor_id text,
  lease_expires_at timestamptz,
  output jsonb,
  failure_class text,
  failure_message text,
  created_at timestamptz not null default now(),
  claimed_at timestamptz,
  last_heartbeat_at timestamptz,
  completed_at timestamptz,
  unique (issue_id, attempt_number)
);

create table if not exists lsites_ledger.gate_results (
  gate_id uuid primary key default gen_random_uuid(),
  schema_version_major smallint not null default 1,
  schema_version_minor smallint not null default 0,
  issue_id uuid not null references lsites_ledger.issues(issue_id) on delete cascade,
  run_id uuid not null references lsites_ledger.runs(run_id) on delete cascade,
  decision lsites_ledger.gate_decision not null default 'pending',
  evidence jsonb not null default '{}'::jsonb,
  decided_by text,
  decided_at timestamptz
);

create table if not exists lsites_ledger.ledger_events (
  event_id uuid primary key default gen_random_uuid(),
  schema_version_major smallint not null default 1,
  schema_version_minor smallint not null default 0,
  issue_id uuid not null references lsites_ledger.issues(issue_id) on delete cascade,
  run_id uuid references lsites_ledger.runs(run_id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);
-- Append-only by convention: no update/delete grants are issued to the
-- runtime role below. Manual §20 requires the event trail never be
-- collapsed or rewritten.

create table if not exists lsites_ledger.idempotency_records (
  idempotency_key text primary key,
  schema_version_major smallint not null default 1,
  schema_version_minor smallint not null default 0,
  issue_id uuid not null references lsites_ledger.issues(issue_id) on delete cascade,
  run_id uuid references lsites_ledger.runs(run_id) on delete set null,
  state lsites_ledger.idempotency_state not null default 'reserved',
  created_at timestamptz not null default now()
);

create index if not exists idx_ledger_runs_issue_id on lsites_ledger.runs(issue_id);
create index if not exists idx_ledger_runs_lease_expiry on lsites_ledger.runs(lease_expires_at) where state in ('claimed', 'executing');
create index if not exists idx_ledger_events_issue_id on lsites_ledger.ledger_events(issue_id, occurred_at);
create index if not exists idx_ledger_gate_results_issue_id on lsites_ledger.gate_results(issue_id);

-- Runtime role: least-privilege, matching the lsites_core pattern in
-- 20260331_000001_lsites_init.sql. No delete/update grant on
-- ledger_events (append-only) or issues.created_at (immutable history).
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'svc_linksites_ledger') then
    create role svc_linksites_ledger nologin;
  end if;
end $$;

grant usage on schema lsites_ledger to svc_linksites_ledger;
grant select, insert, update on lsites_ledger.issues to svc_linksites_ledger;
grant select, insert, update on lsites_ledger.runs to svc_linksites_ledger;
grant select, insert, update on lsites_ledger.gate_results to svc_linksites_ledger;
grant select, insert on lsites_ledger.ledger_events to svc_linksites_ledger; -- no update/delete: append-only
grant select, insert, update on lsites_ledger.idempotency_records to svc_linksites_ledger;

alter table lsites_ledger.issues enable row level security;
alter table lsites_ledger.runs enable row level security;
alter table lsites_ledger.gate_results enable row level security;
alter table lsites_ledger.ledger_events enable row level security;
alter table lsites_ledger.idempotency_records enable row level security;

-- Program Ledger rows are not yet site-scoped (Program/Module/Stage
-- objects are opaque string refs in this schema_version 1.0 slice, not
-- foreign-keyed to lsites_core.sites) -- RLS here restricts access to
-- the dedicated runtime role only, pending a future schema_version 2.0
-- that ties program_ref to a real tenant/site scope per manual §18.10-11.
create policy lsites_ledger_runtime_only on lsites_ledger.issues
  for all to svc_linksites_ledger using (true) with check (true);
create policy lsites_ledger_runtime_only on lsites_ledger.runs
  for all to svc_linksites_ledger using (true) with check (true);
create policy lsites_ledger_runtime_only on lsites_ledger.gate_results
  for all to svc_linksites_ledger using (true) with check (true);
create policy lsites_ledger_runtime_only on lsites_ledger.ledger_events
  for all to svc_linksites_ledger using (true) with check (true);
create policy lsites_ledger_runtime_only on lsites_ledger.idempotency_records
  for all to svc_linksites_ledger using (true) with check (true);
