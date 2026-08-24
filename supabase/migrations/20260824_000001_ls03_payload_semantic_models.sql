-- migrate:up
-- LS-03 one-owner additive records for template adoption, entitlement
-- snapshots, deprecated template-id projections, and Offer/Case compatibility.
-- Payload collection tables in public.* are owned by the Payload migration of
-- the same name. This file owns lsites_sites LS-03 records only.
-- Do not edit previously applied migration bytes.

create schema if not exists lsites_sites;

do $$
begin
  if not exists (
    select 1 from pg_type
    where typname = 'ls03_adoption_state' and typnamespace = 'lsites_sites'::regnamespace
  ) then
    create type lsites_sites.ls03_adoption_state as enum (
      'linked', 'adopted', 'replaced', 'rolled_back'
    );
  end if;
  if not exists (
    select 1 from pg_type
    where typname = 'ls03_capability_plan' and typnamespace = 'lsites_sites'::regnamespace
  ) then
    create type lsites_sites.ls03_capability_plan as enum ('A', 'B', 'C', 'L');
  end if;
  if not exists (
    select 1 from pg_type
    where typname = 'ls03_offer_kind' and typnamespace = 'lsites_sites'::regnamespace
  ) then
    create type lsites_sites.ls03_offer_kind as enum ('product', 'service');
  end if;
end $$;

create table if not exists lsites_sites.entitlement_snapshots (
  snapshot_id text primary key,
  org_id uuid not null references platform.organizations(id),
  site_id uuid not null references lsites_sites.sites(id),
  locale text not null default 'en',
  site_ref text not null,
  plan_id lsites_sites.ls03_capability_plan not null,
  granted_credits integer not null check (granted_credits >= 0),
  budget_a integer not null default 30 check (budget_a = 30),
  budget_b integer not null default 15 check (budget_b = 15),
  budget_c integer not null default 6 check (budget_c = 6),
  budget_l integer not null default 0 check (budget_l = 0),
  schema_version_major smallint not null default 1,
  schema_version_minor smallint not null default 0,
  digest text not null,
  before_record jsonb,
  after_record jsonb,
  rollback_record jsonb,
  actor_id text not null,
  evidence_digest text not null,
  created_at timestamptz not null default now(),
  check (schema_version_major = 1 and schema_version_minor = 0),
  unique (org_id, site_id, snapshot_id)
);

comment on table lsites_sites.entitlement_snapshots is
  'Immutable LS-03 entitlement snapshots. Updates are rejected; successors carry rollback proof.';

create table if not exists lsites_sites.template_adoptions (
  adoption_id text primary key,
  org_id uuid not null references platform.organizations(id),
  site_id uuid not null references lsites_sites.sites(id),
  locale text not null default 'en',
  adoption_state lsites_sites.ls03_adoption_state not null,
  identity_provider text not null check (identity_provider ~ '^[a-f0-9]{40}$'),
  identity_layout text not null check (identity_layout ~ '^[a-f0-9]{40}$'),
  identity_plan text not null check (identity_plan ~ '^[a-f0-9]{40}$'),
  identity_overlay text not null check (identity_overlay ~ '^[a-f0-9]{40}$'),
  identity_config text not null check (identity_config ~ '^[a-f0-9]{40}$'),
  identity_content text not null check (identity_content ~ '^[a-f0-9]{40}$'),
  identity_adapter text not null check (identity_adapter ~ '^[a-f0-9]{40}$'),
  identity_effective text not null check (identity_effective ~ '^[a-f0-9]{40}$'),
  entitlement_snapshot_id text not null references lsites_sites.entitlement_snapshots(snapshot_id),
  before_record jsonb,
  after_record jsonb,
  rollback_record jsonb,
  actor_id text not null,
  evidence_digest text not null,
  deprecated_template_id_projection text,
  created_at timestamptz not null default now(),
  unique (org_id, site_id, adoption_id)
);

comment on table lsites_sites.template_adoptions is
  'Immutable LS-03 template adoption records. Free-text template IDs are deprecated projections only.';

create table if not exists lsites_sites.legacy_template_id_projections (
  projection_id text primary key,
  org_id uuid not null references platform.organizations(id),
  site_id uuid not null references lsites_sites.sites(id),
  deprecated_template_id text not null,
  adoption_id text references lsites_sites.template_adoptions(adoption_id),
  created_at timestamptz not null default now(),
  unique (org_id, site_id, deprecated_template_id)
);

comment on table lsites_sites.legacy_template_id_projections is
  'Deprecated free-text template ID projections. Canonical identity is template_adoptions.';

create table if not exists lsites_sites.offer_case_compatibility (
  mapping_id text primary key,
  org_id uuid not null references platform.organizations(id),
  site_id uuid not null references lsites_sites.sites(id),
  locale text not null default 'en',
  source_collection text not null,
  source_document_id text not null,
  target_collection text not null,
  offer_kind lsites_sites.ls03_offer_kind,
  created_at timestamptz not null default now(),
  check (
    (source_collection = 'offer-pages' and target_collection in ('products', 'services') and offer_kind is not null)
    or (source_collection = 'case-study-pages' and target_collection = 'results-work' and offer_kind is null)
  ),
  unique (org_id, site_id, source_collection, source_document_id)
);

alter table lsites_sites.working_packages
  add column if not exists deprecated_template_id_projection text,
  add column if not exists template_adoption_id text,
  add column if not exists entitlement_snapshot_id text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'working_packages_template_adoption_fk'
  ) then
    alter table lsites_sites.working_packages
      add constraint working_packages_template_adoption_fk
      foreign key (template_adoption_id) references lsites_sites.template_adoptions(adoption_id);
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'working_packages_entitlement_snapshot_fk'
  ) then
    alter table lsites_sites.working_packages
      add constraint working_packages_entitlement_snapshot_fk
      foreign key (entitlement_snapshot_id) references lsites_sites.entitlement_snapshots(snapshot_id);
  end if;
end $$;

create or replace function lsites_sites.reject_ls03_immutable_update()
returns trigger
language plpgsql
as $$
begin
  raise exception 'LS-03 immutable record mutation rejected; create a successor or rollback record instead.';
end;
$$;

drop trigger if exists trg_ls03_entitlement_snapshots_immutable on lsites_sites.entitlement_snapshots;
create trigger trg_ls03_entitlement_snapshots_immutable
  before update or delete on lsites_sites.entitlement_snapshots
  for each row execute function lsites_sites.reject_ls03_immutable_update();

drop trigger if exists trg_ls03_template_adoptions_immutable on lsites_sites.template_adoptions;
create trigger trg_ls03_template_adoptions_immutable
  before update or delete on lsites_sites.template_adoptions
  for each row execute function lsites_sites.reject_ls03_immutable_update();

alter table lsites_sites.entitlement_snapshots enable row level security;
alter table lsites_sites.template_adoptions enable row level security;
alter table lsites_sites.legacy_template_id_projections enable row level security;
alter table lsites_sites.offer_case_compatibility enable row level security;

grant select, insert on lsites_sites.entitlement_snapshots to svc_linksites_runtime;
grant select, insert on lsites_sites.template_adoptions to svc_linksites_runtime;
grant select, insert, update on lsites_sites.legacy_template_id_projections to svc_linksites_runtime;
grant select, insert, update on lsites_sites.offer_case_compatibility to svc_linksites_runtime;
