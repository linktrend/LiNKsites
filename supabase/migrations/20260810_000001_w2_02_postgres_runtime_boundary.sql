-- migrate:up
-- W2-02 production runtime boundary.
--
-- Forward-only persistence for the orchestrator's production state, intake
-- claim, evidence, completion, and site-lifecycle contracts. Tenant keys use
-- the same platform.organizations UUID authority as the established
-- lsites_ledger and lsites_sites schemas. RLS requires the runtime connection
-- to set app.org_id; the production pg adapter does this at connection time.

create schema if not exists lsites_ledger;
create schema if not exists lsites_sites;

create table if not exists lsites_ledger.program_runtime_states (
  org_id uuid not null references platform.organizations(id),
  program_id text not null,
  state jsonb not null,
  state_checksum text not null check (state_checksum ~ '^[0-9a-f]{64}$'),
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now(),
  primary key (org_id, program_id),
  check (jsonb_typeof(state) = 'object')
);

create table if not exists lsites_ledger.program_intake (
  org_id uuid not null references platform.organizations(id),
  item_id text not null,
  lead_id text not null,
  idempotency_key text not null,
  envelope jsonb not null,
  state text not null default 'ready' check (state in ('ready', 'claimed', 'rejected', 'program_started', 'program_retry_scheduled', 'program_manual_attention')),
  claim_id text,
  claim_expires_at timestamptz,
  attempt_number integer not null default 0 check (attempt_number >= 0),
  reason_code text,
  next_attempt_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (org_id, item_id),
  unique (org_id, idempotency_key),
  check (jsonb_typeof(envelope) in ('object', 'array'))
);

create table if not exists lsites_ledger.program_completion_deliveries (
  org_id uuid not null references platform.organizations(id),
  idempotency_key text not null,
  envelope jsonb not null,
  envelope_checksum text not null check (envelope_checksum ~ '^[0-9a-f]{64}$'),
  delivered_at timestamptz not null default now(),
  primary key (org_id, idempotency_key),
  check (jsonb_typeof(envelope) = 'object')
);

create table if not exists lsites_ledger.evidence_receipts (
  org_id uuid not null references platform.organizations(id),
  receipt_id text not null,
  program_id text not null,
  issue_id text not null,
  run_id text,
  idempotency_key text not null,
  revision_sha text not null check (revision_sha ~ '^[0-9a-f]{40}$'),
  checksum text not null check (checksum ~ '^[0-9a-f]{64}$'),
  storage_location text not null,
  gate_association text not null,
  receipt jsonb not null,
  recorded_at timestamptz not null default now(),
  primary key (org_id, receipt_id),
  unique (org_id, idempotency_key),
  check (jsonb_typeof(receipt) = 'object')
);

create table if not exists lsites_sites.lifecycle_records (
  org_id uuid not null references platform.organizations(id),
  lifecycle_id text not null,
  site_id text not null,
  outcome_event_id text not null,
  record jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (org_id, lifecycle_id),
  unique (org_id, site_id),
  unique (org_id, outcome_event_id),
  check (jsonb_typeof(record) = 'object')
);

create index if not exists idx_runtime_states_org_updated
  on lsites_ledger.program_runtime_states(org_id, updated_at desc);
create index if not exists idx_program_intake_ready
  on lsites_ledger.program_intake(org_id, state, next_attempt_at, created_at);
create index if not exists idx_program_intake_claim_expiry
  on lsites_ledger.program_intake(org_id, claim_expires_at)
  where state = 'claimed';
create index if not exists idx_completion_deliveries_org_time
  on lsites_ledger.program_completion_deliveries(org_id, delivered_at desc);
create index if not exists idx_evidence_receipts_program_issue
  on lsites_ledger.evidence_receipts(org_id, program_id, issue_id, recorded_at);
create index if not exists idx_lifecycle_records_org_updated
  on lsites_sites.lifecycle_records(org_id, updated_at desc);

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'svc_linksites_ledger') then
    create role svc_linksites_ledger nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'svc_linksites_runtime') then
    create role svc_linksites_runtime nologin;
  end if;
end $$;

grant usage on schema lsites_ledger to svc_linksites_ledger;
grant select, insert, update on lsites_ledger.program_runtime_states to svc_linksites_ledger;
grant select, insert, update on lsites_ledger.program_intake to svc_linksites_ledger;
grant select, insert on lsites_ledger.program_completion_deliveries to svc_linksites_ledger;
grant select, insert on lsites_ledger.evidence_receipts to svc_linksites_ledger;
grant usage on schema lsites_sites to svc_linksites_runtime;
grant select, insert, update on lsites_sites.lifecycle_records to svc_linksites_runtime;
grant usage on schema lsites_sites to svc_linksites_ledger;
grant select, insert, update on lsites_sites.lifecycle_records to svc_linksites_ledger;

alter table lsites_ledger.program_runtime_states enable row level security;
alter table lsites_ledger.program_intake enable row level security;
alter table lsites_ledger.program_completion_deliveries enable row level security;
alter table lsites_ledger.evidence_receipts enable row level security;
alter table lsites_sites.lifecycle_records enable row level security;

create policy lsites_runtime_org_boundary on lsites_ledger.program_runtime_states
  for all to svc_linksites_ledger
  using (org_id = nullif(current_setting('app.org_id', true), '')::uuid)
  with check (org_id = nullif(current_setting('app.org_id', true), '')::uuid);
create policy lsites_runtime_org_boundary on lsites_ledger.program_intake
  for all to svc_linksites_ledger
  using (org_id = nullif(current_setting('app.org_id', true), '')::uuid)
  with check (org_id = nullif(current_setting('app.org_id', true), '')::uuid);
create policy lsites_runtime_org_boundary on lsites_ledger.program_completion_deliveries
  for all to svc_linksites_ledger
  using (org_id = nullif(current_setting('app.org_id', true), '')::uuid)
  with check (org_id = nullif(current_setting('app.org_id', true), '')::uuid);
create policy lsites_runtime_org_boundary on lsites_ledger.evidence_receipts
  for all to svc_linksites_ledger
  using (org_id = nullif(current_setting('app.org_id', true), '')::uuid)
  with check (org_id = nullif(current_setting('app.org_id', true), '')::uuid);
create policy lsites_runtime_org_boundary on lsites_sites.lifecycle_records
  for all to svc_linksites_runtime, svc_linksites_ledger
  using (org_id = nullif(current_setting('app.org_id', true), '')::uuid)
  with check (org_id = nullif(current_setting('app.org_id', true), '')::uuid);

-- migrate:down intentionally omitted; this production boundary is
-- forward-only and must not be removed by application rollback code.
