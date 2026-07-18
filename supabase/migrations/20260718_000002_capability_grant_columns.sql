-- migrate:up
-- Capability-grant gate columns on lsites_ledger.issues (LiNKplatform §5 wiring).
-- Prerequisite: LiNKplatform/supabase/migrations/20260718_000002_platform_member_rls_and_capability_gate.sql

alter table lsites_ledger.issues
  add column if not exists org_id uuid,
  add column if not exists required_capability_id text;

comment on column lsites_ledger.issues.org_id is
  'platform.organizations id; required when required_capability_id is set or side_effect_class is external.';
comment on column lsites_ledger.issues.required_capability_id is
  'platform.capabilities id; ProgramLedger.dispatch checks platform.has_capability_grant before Run creation.';

create index if not exists idx_lsites_ledger_issues_org
  on lsites_ledger.issues(org_id)
  where org_id is not null;
