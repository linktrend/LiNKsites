-- migrate:up
-- Shared platform foundation: tenant identity/RBAC, capability registry,
-- and the Handoff Envelope contract.
--
-- Implements docs/specs/shared-foundation-spec.md §4-6. Mirrors the schema
-- conventions already established in LiNKsites
-- (lsites_ledger.issues, etc.): a real Postgres schema per system, plain
-- table names inside it, a dedicated least-privilege runtime role, and
-- RLS enabled on every table from the start.
--
-- Apply to linkplatform-stage first. Do not apply to linkplatform-prod
-- until verified on stage.

create schema if not exists platform;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'org_kind' and typnamespace = 'platform'::regnamespace) then
    create type platform.org_kind as enum ('internal', 'client');
  end if;
  if not exists (select 1 from pg_type where typname = 'org_status' and typnamespace = 'platform'::regnamespace) then
    create type platform.org_status as enum ('active', 'suspended', 'archived');
  end if;
  if not exists (select 1 from pg_type where typname = 'member_role' and typnamespace = 'platform'::regnamespace) then
    create type platform.member_role as enum ('owner', 'admin', 'staff', 'client_admin', 'client_viewer');
  end if;
  if not exists (select 1 from pg_type where typname = 'member_status' and typnamespace = 'platform'::regnamespace) then
    create type platform.member_status as enum ('invited', 'active', 'revoked');
  end if;
  if not exists (select 1 from pg_type where typname = 'handoff_status' and typnamespace = 'platform'::regnamespace) then
    create type platform.handoff_status as enum ('pending', 'accepted', 'rejected', 'superseded');
  end if;
end $$;

create table if not exists platform.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind platform.org_kind not null default 'client',
  status platform.org_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Seed row: LiNKtrend itself is org #1, kind = 'internal' -- not a special
-- case elsewhere in the schema, just another tenant (spec §4).
insert into platform.organizations (name, kind, status)
select 'LiNKtrend', 'internal', 'active'
where not exists (select 1 from platform.organizations where kind = 'internal');

create table if not exists platform.org_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references platform.organizations(id) on delete cascade,
  user_id uuid not null,
  role platform.member_role not null default 'staff',
  role_scope text,
  invited_by uuid,
  invited_at timestamptz,
  accepted_at timestamptz,
  status platform.member_status not null default 'invited',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, user_id)
);

create table if not exists platform.capabilities (
  id text primary key,
  display_name text not null,
  owning_system text,
  licensable boolean not null default false,
  min_contract_tier text,
  commercial_use_requires text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists platform.capability_grants (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references platform.organizations(id) on delete cascade,
  capability_id text not null references platform.capabilities(id) on delete cascade,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (org_id, capability_id)
);

create table if not exists platform.handoff_envelopes (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique,
  sender_program text not null,
  receiver_program text not null,
  contract_type text not null,
  contract_version text not null,
  org_id uuid not null references platform.organizations(id) on delete cascade,
  payload_ref jsonb not null,
  status platform.handoff_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_org_members_user on platform.org_members(user_id);
create index if not exists idx_capability_grants_org on platform.capability_grants(org_id);
create index if not exists idx_handoff_envelopes_receiver on platform.handoff_envelopes(receiver_program, status);
create index if not exists idx_handoff_envelopes_org on platform.handoff_envelopes(org_id);

-- platform.has_org_access: the one shared membership check every Program
-- schema's RLS policies call, instead of each Program duplicating
-- membership logic (spec §4).
create or replace function platform.has_org_access(target_org_id uuid, min_role platform.member_role default 'client_viewer')
returns boolean
language sql
stable
security definer
set search_path = platform, pg_catalog
as $$
  select exists (
    select 1
    from platform.org_members m
    where m.org_id = target_org_id
      and m.user_id = auth.uid()
      and m.status = 'active'
      and (
        min_role = 'client_viewer'
        or (min_role = 'client_admin' and m.role in ('owner', 'admin', 'staff', 'client_admin'))
        or (min_role = 'staff' and m.role in ('owner', 'admin', 'staff'))
        or (min_role = 'admin' and m.role in ('owner', 'admin'))
        or (min_role = 'owner' and m.role = 'owner')
      )
  );
$$;

-- Runtime role: least-privilege, matching the lsites_ledger pattern.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'svc_platform') then
    create role svc_platform nologin;
  end if;
end $$;

grant usage on schema platform to svc_platform;
grant select, insert, update on platform.organizations to svc_platform;
grant select, insert, update on platform.org_members to svc_platform;
grant select, insert, update on platform.capabilities to svc_platform;
grant select, insert, update on platform.capability_grants to svc_platform;
grant select, insert, update on platform.handoff_envelopes to svc_platform;
grant execute on function platform.has_org_access(uuid, platform.member_role) to authenticated, svc_platform;

alter table platform.organizations enable row level security;
alter table platform.org_members enable row level security;
alter table platform.capabilities enable row level security;
alter table platform.capability_grants enable row level security;
alter table platform.handoff_envelopes enable row level security;

-- Client-facing dashboards are deferred by design (Principal decision,
-- 2026-07-14) until each Program is running internally, so member-facing
-- read policies are intentionally NOT added yet -- only the runtime role
-- can touch these tables for now. Add org-scoped SELECT policies for
-- authenticated org members when a Program's client dashboard is built.
create policy platform_runtime_only on platform.organizations
  for all to svc_platform using (true) with check (true);
create policy platform_runtime_only on platform.org_members
  for all to svc_platform using (true) with check (true);
create policy platform_runtime_only on platform.capabilities
  for all to svc_platform using (true) with check (true);
create policy platform_runtime_only on platform.capability_grants
  for all to svc_platform using (true) with check (true);
create policy platform_runtime_only on platform.handoff_envelopes
  for all to svc_platform using (true) with check (true);

-- Seed the one known licensing-restricted capability discussed with the
-- Principal (spec §5): Reddit analytics is internal-only until a
-- commercial contract with Reddit exists.
insert into platform.capabilities (id, display_name, owning_system, licensable, min_contract_tier, commercial_use_requires, status)
values (
  'cap.reddit.analytics',
  'Reddit post/engagement analytics',
  'link-postiz-app',
  false,
  'none',
  'Reddit Data API Terms require a negotiated commercial contract before any client-facing/commercial use.',
  'active'
)
on conflict (id) do nothing;
