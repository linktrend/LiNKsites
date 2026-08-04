-- migrate:up
-- W1-02 corrective migration: tenant integrity, canonical Phase backfill,
-- immutable gate history, and conditional lease transitions.

create schema if not exists lsites_ledger;

-- The shared platform foundation is the canonical tenant registry. This
-- deterministic internal tenant owns rows created by the pre-org schema.
insert into platform.organizations (id, name, kind, status)
values ('a0000000-a000-a000-a000-a00000000001', 'LiNKsites legacy system tenant', 'internal', 'active')
on conflict (id) do nothing;

alter table lsites_ledger.issues
  add column if not exists target text,
  add column if not exists intended_effect text;
alter table lsites_ledger.runs add column if not exists org_id uuid;
alter table lsites_ledger.gate_results add column if not exists org_id uuid;
alter table lsites_ledger.ledger_events add column if not exists org_id uuid;
alter table lsites_ledger.idempotency_records add column if not exists org_id uuid;
alter table lsites_ledger.issue_dependencies add column if not exists org_id uuid;

-- Deterministic forward compatibility: preserve the populated legacy value
-- and project it once into the active Phase field. No legacy row is deleted
-- or rewritten beyond the additive Phase value.
update lsites_ledger.issues
set phase_ref = stage_ref
where phase_ref is null and stage_ref is not null;
update lsites_ledger.issues set intended_effect = issue_type where intended_effect is null;
update lsites_ledger.programs set org_id = 'a0000000-a000-a000-a000-a00000000001' where org_id is null;
update lsites_ledger.modules set org_id = 'a0000000-a000-a000-a000-a00000000001' where org_id is null;
update lsites_ledger.phases set org_id = 'a0000000-a000-a000-a000-a00000000001' where org_id is null;
update lsites_ledger.issues set org_id = 'a0000000-a000-a000-a000-a00000000001' where org_id is null;
update lsites_ledger.runs r set org_id = i.org_id from lsites_ledger.issues i where r.issue_id = i.issue_id and r.org_id is null;
update lsites_ledger.gate_results g
set org_id = coalesce(
  (select i.org_id from lsites_ledger.issues i where i.issue_id = g.issue_id),
  (select r.org_id from lsites_ledger.runs r where r.run_id = g.run_id),
  'a0000000-a000-a000-a000-a00000000001'
)
where g.org_id is null;
update lsites_ledger.ledger_events e set org_id = i.org_id from lsites_ledger.issues i where e.issue_id = i.issue_id and e.org_id is null;
update lsites_ledger.ledger_events set org_id = 'a0000000-a000-a000-a000-a00000000001' where org_id is null;
update lsites_ledger.idempotency_records r set org_id = i.org_id from lsites_ledger.issues i where r.issue_id = i.issue_id and r.org_id is null;
update lsites_ledger.issue_dependencies d set org_id = i.org_id from lsites_ledger.issues i where d.issue_id = i.issue_id and d.org_id is null;

-- Legacy issues were allowed to reference opaque program names. Materialize
-- any missing Program rows before adding the tenant-scoped foreign key so the
-- migration preserves those issues instead of failing on an orphan reference.
insert into lsites_ledger.programs (program_id, org_id, title, state)
select distinct i.program_ref, i.org_id, i.program_ref, 'ready'
from lsites_ledger.issues i
where not exists (
  select 1
  from lsites_ledger.programs p
  where p.program_id = i.program_ref and p.org_id = i.org_id
);

alter table lsites_ledger.programs alter column org_id set not null;
alter table lsites_ledger.modules alter column org_id set not null;
alter table lsites_ledger.phases alter column org_id set not null;
alter table lsites_ledger.issues alter column org_id set not null;
alter table lsites_ledger.runs alter column org_id set not null;
alter table lsites_ledger.gate_results alter column org_id set not null;
alter table lsites_ledger.ledger_events alter column org_id set not null;
alter table lsites_ledger.idempotency_records alter column org_id set not null;
alter table lsites_ledger.issue_dependencies alter column org_id set not null;
alter table lsites_ledger.ledger_events alter column issue_id drop not null;
alter table lsites_ledger.issues alter column intended_effect set not null;

create unique index if not exists uq_ledger_program_org on lsites_ledger.programs(program_id, org_id);
create unique index if not exists uq_ledger_module_org on lsites_ledger.modules(program_id, module_id, org_id);
create unique index if not exists uq_ledger_phase_org on lsites_ledger.phases(program_id, module_id, phase_id, org_id);
create unique index if not exists uq_ledger_issue_org on lsites_ledger.issues(issue_id, org_id);
create unique index if not exists uq_ledger_run_org on lsites_ledger.runs(run_id, org_id);

do $$ begin
  execute 'alter table lsites_ledger.phases drop constraint if exists phases_program_id_module_id_fkey';
  execute 'alter table lsites_ledger.modules drop constraint if exists modules_program_id_fkey';
  execute 'alter table lsites_ledger.programs drop constraint if exists programs_pkey';
  execute 'alter table lsites_ledger.modules drop constraint if exists modules_pkey';
  execute 'alter table lsites_ledger.phases drop constraint if exists phases_pkey';
  execute 'alter table lsites_ledger.programs add primary key (program_id, org_id)';
  execute 'alter table lsites_ledger.modules add primary key (program_id, module_id, org_id)';
  execute 'alter table lsites_ledger.phases add primary key (program_id, module_id, phase_id, org_id)';
  if not exists (select 1 from pg_constraint where conname = 'fk_ledger_program_org') then
    alter table lsites_ledger.programs add constraint fk_ledger_program_org foreign key (org_id) references platform.organizations(id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'fk_ledger_module_program_org') then
    alter table lsites_ledger.modules add constraint fk_ledger_module_program_org foreign key (program_id, org_id) references lsites_ledger.programs(program_id, org_id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'fk_ledger_phase_module_org') then
    alter table lsites_ledger.phases add constraint fk_ledger_phase_module_org foreign key (program_id, module_id, org_id) references lsites_ledger.modules(program_id, module_id, org_id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'fk_ledger_issue_program_org') then
    alter table lsites_ledger.issues add constraint fk_ledger_issue_program_org foreign key (program_ref, org_id) references lsites_ledger.programs(program_id, org_id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'fk_ledger_issue_platform_org') then
    alter table lsites_ledger.issues add constraint fk_ledger_issue_platform_org foreign key (org_id) references platform.organizations(id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'fk_ledger_run_issue_org') then
    alter table lsites_ledger.runs add constraint fk_ledger_run_issue_org foreign key (issue_id, org_id) references lsites_ledger.issues(issue_id, org_id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'fk_ledger_run_platform_org') then
    alter table lsites_ledger.runs add constraint fk_ledger_run_platform_org foreign key (org_id) references platform.organizations(id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'fk_ledger_gate_platform_org') then
    alter table lsites_ledger.gate_results add constraint fk_ledger_gate_platform_org foreign key (org_id) references platform.organizations(id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'fk_ledger_event_platform_org') then
    alter table lsites_ledger.ledger_events add constraint fk_ledger_event_platform_org foreign key (org_id) references platform.organizations(id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'fk_ledger_idempotency_platform_org') then
    alter table lsites_ledger.idempotency_records add constraint fk_ledger_idempotency_platform_org foreign key (org_id) references platform.organizations(id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'fk_ledger_dependency_org') then
    alter table lsites_ledger.issue_dependencies add constraint fk_ledger_dependency_org foreign key (issue_id, org_id) references lsites_ledger.issues(issue_id, org_id);
  end if;
end $$;

-- Compatibility is read-only and names the old column only at this
-- persistence boundary. Active TypeScript APIs expose Phase exclusively.
create or replace view lsites_ledger.issue_phase_compatibility as
select issue_id, org_id, stage_ref, phase_ref from lsites_ledger.issues;

do $$ begin
  execute 'drop policy if exists lsites_ledger_runtime_only on lsites_ledger.programs';
  execute 'drop policy if exists lsites_ledger_runtime_only on lsites_ledger.modules';
  execute 'drop policy if exists lsites_ledger_runtime_only on lsites_ledger.phases';
  execute 'drop policy if exists lsites_ledger_runtime_only on lsites_ledger.issues';
  execute 'drop policy if exists lsites_ledger_runtime_only on lsites_ledger.runs';
  execute 'drop policy if exists lsites_ledger_runtime_only on lsites_ledger.gate_results';
  execute 'drop policy if exists lsites_ledger_runtime_only on lsites_ledger.ledger_events';
  execute 'drop policy if exists lsites_ledger_runtime_only on lsites_ledger.idempotency_records';
  execute 'drop policy if exists lsites_ledger_runtime_only on lsites_ledger.issue_dependencies';
end $$;

create policy lsites_ledger_runtime_only on lsites_ledger.programs for all to svc_linksites_ledger using (org_id = nullif(current_setting('app.org_id', true), '')::uuid) with check (org_id = nullif(current_setting('app.org_id', true), '')::uuid);
create policy lsites_ledger_runtime_only on lsites_ledger.modules for all to svc_linksites_ledger using (org_id = nullif(current_setting('app.org_id', true), '')::uuid) with check (org_id = nullif(current_setting('app.org_id', true), '')::uuid);
create policy lsites_ledger_runtime_only on lsites_ledger.phases for all to svc_linksites_ledger using (org_id = nullif(current_setting('app.org_id', true), '')::uuid) with check (org_id = nullif(current_setting('app.org_id', true), '')::uuid);
create policy lsites_ledger_runtime_only on lsites_ledger.issues for all to svc_linksites_ledger using (org_id = nullif(current_setting('app.org_id', true), '')::uuid) with check (org_id = nullif(current_setting('app.org_id', true), '')::uuid);
create policy lsites_ledger_runtime_only on lsites_ledger.runs for all to svc_linksites_ledger using (org_id = nullif(current_setting('app.org_id', true), '')::uuid) with check (org_id = nullif(current_setting('app.org_id', true), '')::uuid);
create policy lsites_ledger_runtime_only on lsites_ledger.gate_results for all to svc_linksites_ledger using (org_id = nullif(current_setting('app.org_id', true), '')::uuid) with check (org_id = nullif(current_setting('app.org_id', true), '')::uuid);
create policy lsites_ledger_runtime_only on lsites_ledger.ledger_events for all to svc_linksites_ledger using (org_id = nullif(current_setting('app.org_id', true), '')::uuid) with check (org_id = nullif(current_setting('app.org_id', true), '')::uuid);
create policy lsites_ledger_runtime_only on lsites_ledger.idempotency_records for all to svc_linksites_ledger using (org_id = nullif(current_setting('app.org_id', true), '')::uuid) with check (org_id = nullif(current_setting('app.org_id', true), '')::uuid);
create policy lsites_ledger_runtime_only on lsites_ledger.issue_dependencies for all to svc_linksites_ledger using (org_id = nullif(current_setting('app.org_id', true), '')::uuid) with check (org_id = nullif(current_setting('app.org_id', true), '')::uuid);

create or replace function lsites_ledger.reject_gate_history_mutation() returns trigger language plpgsql as $$ begin raise exception 'gate history is append-only'; end $$;
drop trigger if exists gate_results_immutable on lsites_ledger.gate_results;
create trigger gate_results_immutable before update or delete on lsites_ledger.gate_results for each row execute function lsites_ledger.reject_gate_history_mutation();
revoke update, delete on lsites_ledger.gate_results from svc_linksites_ledger;

-- migrate:down intentionally omitted: this migration preserves history and
-- cannot safely be rolled back by application code.
