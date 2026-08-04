-- migrate:up
-- W1-02 additive hierarchy/gate extension.
--
-- Existing rows and the legacy stage_ref column are preserved. New runtime
-- code reads/writes phase_ref and the durable Program/Module/Phase tables;
-- stage_ref is a read-only compatibility field until the W1-06 legacy-boundary
-- packet removes it after all consumers have migrated.

alter type lsites_ledger.issue_state add value if not exists 'blocked';

create table if not exists lsites_ledger.programs (
  program_id text primary key,
  schema_version_major smallint not null default 1,
  schema_version_minor smallint not null default 0,
  org_id uuid,
  title text not null,
  state text not null default 'planned' check (state in ('planned','ready','in_progress','awaiting_gate','completed','failed','blocked')),
  revision bigint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lsites_ledger.modules (
  program_id text not null references lsites_ledger.programs(program_id) on delete cascade,
  module_id text not null,
  schema_version_major smallint not null default 1,
  schema_version_minor smallint not null default 0,
  org_id uuid,
  title text not null,
  purpose text not null,
  state text not null default 'planned' check (state in ('planned','ready','in_progress','awaiting_gate','completed','failed','blocked')),
  revision bigint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (program_id, module_id)
);

create table if not exists lsites_ledger.phases (
  program_id text not null,
  module_id text not null,
  phase_id text not null,
  schema_version_major smallint not null default 1,
  schema_version_minor smallint not null default 0,
  org_id uuid,
  title text not null,
  objective text not null,
  state text not null default 'planned' check (state in ('planned','ready','in_progress','awaiting_gate','completed','failed','blocked')),
  revision bigint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (program_id, module_id, phase_id),
  foreign key (program_id, module_id) references lsites_ledger.modules(program_id, module_id) on delete cascade
);

alter table lsites_ledger.issues
  add column if not exists phase_ref text,
  add column if not exists issue_key text,
  add column if not exists correlation_id text,
  add column if not exists retry_at timestamptz;

drop index if exists lsites_ledger.idx_lsites_ledger_issue_key;
create unique index if not exists idx_lsites_ledger_issue_key_org on lsites_ledger.issues(coalesce(org_id, '00000000-0000-0000-0000-000000000000'::uuid), issue_key) where issue_key is not null;
create index if not exists idx_lsites_ledger_issues_hierarchy on lsites_ledger.issues(program_ref, module_ref, phase_ref);

alter table lsites_ledger.runs
  add column if not exists executor_type text,
  add column if not exists executor_version text,
  add column if not exists correlation_id text,
  add column if not exists idempotency_key text,
  add column if not exists started_at timestamptz,
  add column if not exists terminal_state text;

alter table lsites_ledger.gate_results
  alter column issue_id drop not null,
  alter column run_id drop not null,
  add column if not exists subject_type text,
  add column if not exists subject_id text,
  add column if not exists subject_revision text,
  add column if not exists attempt integer not null default 1,
  add column if not exists evaluator text,
  add column if not exists evaluator_version text,
  add column if not exists inputs jsonb not null default '{}'::jsonb,
  add column if not exists reasons jsonb not null default '[]'::jsonb,
  add column if not exists evidence_receipts jsonb not null default '[]'::jsonb;

update lsites_ledger.gate_results
set subject_type = 'issue', subject_id = issue_id::text, subject_revision = coalesce(decided_at::text, now()::text), evaluator = coalesce(decided_by, 'legacy'), evaluator_version = '1', inputs = evidence
where subject_type is null;

alter table lsites_ledger.gate_results
  alter column subject_type set not null,
  alter column subject_id set not null,
  alter column subject_revision set not null,
  alter column evaluator set not null,
  alter column evaluator_version set not null;

create index if not exists idx_lsites_ledger_gate_subject on lsites_ledger.gate_results(subject_type, subject_id, decided_at);

grant select, insert, update on lsites_ledger.programs to svc_linksites_ledger;
grant select, insert, update on lsites_ledger.modules to svc_linksites_ledger;
grant select, insert, update on lsites_ledger.phases to svc_linksites_ledger;
grant select, insert, update on lsites_ledger.issues to svc_linksites_ledger;
grant select, insert, update on lsites_ledger.runs to svc_linksites_ledger;
grant select, insert, update on lsites_ledger.gate_results to svc_linksites_ledger;

alter table lsites_ledger.programs enable row level security;
alter table lsites_ledger.modules enable row level security;
alter table lsites_ledger.phases enable row level security;

create policy lsites_ledger_runtime_only on lsites_ledger.programs for all to svc_linksites_ledger using (true) with check (true);
create policy lsites_ledger_runtime_only on lsites_ledger.modules for all to svc_linksites_ledger using (true) with check (true);
create policy lsites_ledger_runtime_only on lsites_ledger.phases for all to svc_linksites_ledger using (true) with check (true);

-- Canonical seed records for the first private-demo path. Issue rows are
-- created idempotently by ProgramLedger.seedProgramGraph so UUID ownership
-- and dependency edges remain in one application transaction boundary.
insert into lsites_ledger.programs (program_id, title, state)
values ('linksites', 'LiNKsites — autonomous website factory and managed-website business', 'ready')
on conflict (program_id) do nothing;

insert into lsites_ledger.modules (program_id, module_id, title, purpose, state)
values
  ('linksites', 'M07', 'Preview Intake & Planning', 'Validates preview requests and produces site specifications.', 'ready'),
  ('linksites', 'M08', 'Prospect Site Adaptation', 'Applies the prospect adaptation contract atop a reserved foundation.', 'ready'),
  ('linksites', 'M09', 'Content & Media Production', 'Produces grounded copy, media plans, and provenance manifests.', 'ready'),
  ('linksites', 'M10', 'Working-to-Payload Promotion', 'Operates the trusted path from working records to Payload drafts.', 'ready'),
  ('linksites', 'M11', 'Preview Deployment & Validation', 'Builds, tests, and validates private preview releases.', 'ready'),
  ('linksites', 'M12', 'Preview Outcome, Upgrade & Recycling', 'Handles preview completion, outcome, and recycling records.', 'ready')
on conflict (program_id, module_id) do nothing;

insert into lsites_ledger.phases (program_id, module_id, phase_id, title, objective, state)
values
  ('linksites', 'M07', 'intake', 'Lead intake and qualification', 'Accept and qualify one canonical lead package for the private demo.', 'ready'),
  ('linksites', 'M08', 'planning', 'Foundation and site planning', 'Reserve the correct reusable foundation and create deterministic site plans.', 'ready'),
  ('linksites', 'M09', 'content', 'Lead-specific content and media', 'Produce grounded copy and provenance-bearing media inputs.', 'ready'),
  ('linksites', 'M10', 'working-content', 'Working-content assembly and gates', 'Assemble and accept a versioned working-content package.', 'ready'),
  ('linksites', 'M11', 'private-preview', 'Private Payload preview', 'Promote an accepted version to a private preview and verify it.', 'ready'),
  ('linksites', 'M12', 'completion', 'Evidence and completion', 'Capture final evidence and emit one replay-safe completion record.', 'ready')
on conflict (program_id, module_id, phase_id) do nothing;

-- migrate:down is intentionally omitted: W1-02 is additive and historical
-- data must not be destructively rolled back by application code.
