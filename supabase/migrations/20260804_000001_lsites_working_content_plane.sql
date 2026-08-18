-- migrate:up
-- LiNKsites versioned working-content plane (W1-04).
--
-- This is the active private workshop model. It is deliberately additive to
-- lsites_sites: the older mutable CMS-shaped tables remain available for the
-- existing site schema, while working packages are stored as immutable,
-- versioned source records until an explicit W2-03 promotion copies one
-- accepted version into a Payload draft. The retired lsites_core mirror,
-- sync_ingress, and sync_jobs path is historical and is not recreated here.
-- This Supabase migration is forward-only. Do not add or execute a rollback
-- section: `supabase db reset` reapplies this complete file from a clean DB.

create schema if not exists lsites_sites;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'working_content_state' and typnamespace = 'lsites_sites'::regnamespace) then
    create type lsites_sites.working_content_state as enum (
      'working', 'ready_for_gate', 'accepted', 'promoted', 'superseded', 'rejected'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'working_gate_outcome' and typnamespace = 'lsites_sites'::regnamespace) then
    create type lsites_sites.working_gate_outcome as enum ('pending', 'accepted', 'rejected');
  end if;
end $$;

create table if not exists lsites_sites.working_packages (
  working_package_id text primary key,
  template_id text not null default 'master-template-type-1',
  schema_version_major smallint not null default 1,
  schema_version_minor smallint not null default 0,
  org_id uuid not null references platform.organizations(id),
  lead_id text not null,
  site_id uuid not null references lsites_sites.sites(id),
  current_version integer not null default 0 check (current_version >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (schema_version_major = 1 and schema_version_minor = 0),
  check (template_id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  unique (org_id, lead_id, site_id)
);

comment on table lsites_sites.working_packages is
  'One lead/site working package identity. Content is held in append-only version rows; Payload is not synchronized here.';

create table if not exists lsites_sites.working_content_versions (
  working_package_id text not null references lsites_sites.working_packages(working_package_id) on delete restrict,
  version_number integer not null check (version_number > 0),
  schema_version_major smallint not null default 1,
  schema_version_minor smallint not null default 0,
  template_id text not null default 'master-template-type-1',
  org_id uuid not null references platform.organizations(id),
  lead_id text not null,
  site_id uuid not null references lsites_sites.sites(id),
  program_ref text not null,
  run_id text,
  parent_version_number integer,
  author_id text not null,
  executor_id text not null,
  content_payload jsonb not null,
  asset_refs jsonb not null default '[]'::jsonb,
  library_refs jsonb not null default '[]'::jsonb,
  provenance jsonb not null default '[]'::jsonb,
  content_checksum text not null check (content_checksum ~ '^[0-9a-f]{64}$'),
  lifecycle_state lsites_sites.working_content_state not null default 'working',
  gate_outcome lsites_sites.working_gate_outcome not null default 'pending',
  gate_reference text,
  gate_evidence_refs jsonb not null default '[]'::jsonb,
  promotion_idempotency_key text,
  payload_target_collection text,
  payload_document_id text,
  payload_draft_revision text,
  promotion_receipt_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (working_package_id, version_number),
  check (schema_version_major = 1 and schema_version_minor = 0),
  check (template_id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  check (parent_version_number is null or parent_version_number < version_number),
  check (jsonb_typeof(content_payload) = 'object'),
  check (jsonb_typeof(asset_refs) = 'array'),
  check (jsonb_typeof(library_refs) = 'array'),
  check (jsonb_typeof(provenance) = 'array'),
  check (jsonb_typeof(gate_evidence_refs) = 'array'),
  unique (org_id, promotion_idempotency_key)
);

comment on table lsites_sites.working_content_versions is
  'Immutable content/provenance snapshots. Only lifecycle, gate, and promotion receipt fields may advance after insertion.';

create table if not exists lsites_sites.working_content_promotion_receipts (
  promotion_receipt_id text primary key,
  schema_version_major smallint not null default 1,
  schema_version_minor smallint not null default 0,
  org_id uuid not null references platform.organizations(id),
  working_package_id text not null,
  version_number integer not null,
  promotion_idempotency_key text not null,
  content_checksum text not null check (content_checksum ~ '^[0-9a-f]{64}$'),
  payload_target_collection text not null,
  payload_document_id text,
  payload_draft_revision text,
  receipt jsonb not null,
  created_at timestamptz not null default now(),
  check (schema_version_major = 1 and schema_version_minor = 0),
  unique (org_id, promotion_idempotency_key),
  foreign key (working_package_id, version_number)
    references lsites_sites.working_content_versions(working_package_id, version_number)
    on delete restrict,
  check (jsonb_typeof(receipt) = 'object')
);

comment on table lsites_sites.working_content_promotion_receipts is
  'Append-only W2-03 promotion receipts. The idempotency key is bound to one exact immutable version.';

create index if not exists idx_working_packages_org_site
  on lsites_sites.working_packages(org_id, site_id);
create index if not exists idx_working_versions_org_lead
  on lsites_sites.working_content_versions(org_id, lead_id, created_at);
create index if not exists idx_working_versions_package_state
  on lsites_sites.working_content_versions(working_package_id, lifecycle_state, version_number);
create index if not exists idx_working_receipts_package
  on lsites_sites.working_content_promotion_receipts(working_package_id, version_number);

create or replace function lsites_sites.assert_working_content_contract()
returns trigger
language plpgsql
security invoker
set search_path = lsites_sites, public
as $$
begin
  if coalesce(jsonb_typeof(new.content_payload), '') <> 'object'
    or coalesce(jsonb_typeof(new.content_payload->'pages'), '') <> 'array'
    or coalesce(jsonb_array_length(new.content_payload->'pages'), 0) = 0
  then
    raise exception 'working content payload must contain at least one page';
  end if;

  if exists (
    select 1
      from jsonb_array_elements(new.content_payload->'pages') as page(value)
     where coalesce(jsonb_typeof(page.value), '') <> 'object'
        or case
             when jsonb_typeof(page.value) = 'object'
             then (select count(*) from jsonb_object_keys(page.value)) <> 3
             else true
           end
        or not (page.value ?& array['pageId', 'route', 'sections'])
        or coalesce(jsonb_typeof(page.value->'pageId'), '') <> 'string'
        or coalesce(page.value->>'pageId', '') = ''
        or coalesce(jsonb_typeof(page.value->'route'), '') <> 'string'
        or coalesce(page.value->>'route', '') = ''
        or coalesce(jsonb_typeof(page.value->'sections'), '') <> 'array'
  ) then
    raise exception 'working content page does not satisfy the selected template contract';
  end if;

  if exists (
    select 1
      from jsonb_array_elements(new.content_payload->'pages') as page(value)
      cross join lateral jsonb_array_elements(page.value->'sections') as section(value)
     where coalesce(jsonb_typeof(section.value), '') <> 'object'
        or case
             when jsonb_typeof(section.value) = 'object'
             then (select count(*) from jsonb_object_keys(section.value)) <> 3
             else true
           end
        or not (section.value ?& array['sectionId', 'componentId', 'content'])
        or coalesce(jsonb_typeof(section.value->'sectionId'), '') <> 'string'
        or coalesce(section.value->>'sectionId', '') = ''
        or coalesce(jsonb_typeof(section.value->'componentId'), '') <> 'string'
        or coalesce(section.value->>'componentId', '') not in ('SignupHero', 'CTASection', 'OfferShowcase', 'ArticlesGrid')
        or coalesce(jsonb_typeof(section.value->'content'), '') <> 'object'
        or coalesce(jsonb_typeof(section.value->'content'->'lang'), '') <> 'string'
        or coalesce(section.value->'content'->>'lang', '') = ''
        or (section.value->>'componentId' = 'OfferShowcase' and coalesce(jsonb_typeof(section.value->'content'->'offers'), '') <> 'array')
        or (section.value->>'componentId' = 'ArticlesGrid' and coalesce(jsonb_typeof(section.value->'content'->'articles'), '') <> 'array')
  ) then
    raise exception 'working content section does not satisfy the accepted component contract';
  end if;

  if exists (
    select 1
      from jsonb_array_elements(new.library_refs) as library(value)
     where coalesce(jsonb_typeof(library.value), '') <> 'object'
        or case
             when jsonb_typeof(library.value) = 'object'
             then (select count(*) from jsonb_object_keys(library.value)) <> 2
             else true
           end
        or not (library.value ?& array['libraryId', 'sha'])
        or coalesce(jsonb_typeof(library.value->'libraryId'), '') <> 'string'
        or coalesce(library.value->>'libraryId', '') = ''
        or coalesce(jsonb_typeof(library.value->'sha'), '') <> 'string'
        or case
             when jsonb_typeof(library.value->'sha') = 'string'
             then coalesce(library.value->>'sha', '') !~ '^[a-f0-9]{40}$'
             else true
           end
  ) then
    raise exception 'working content LiNKlibraries references require canonical 40-character Git SHAs';
  end if;
  return new;
end;
$$;

drop trigger if exists working_versions_contract on lsites_sites.working_content_versions;
create trigger working_versions_contract
before insert on lsites_sites.working_content_versions
for each row execute function lsites_sites.assert_working_content_contract();

-- A package and every version must use the organization that owns its site.
create or replace function lsites_sites.assert_working_content_org_consistency()
returns trigger
language plpgsql
security invoker
set search_path = lsites_sites, public
as $$
declare
  site_org_id uuid;
  package_org_id uuid;
  package_lead_id text;
  package_site_id uuid;
begin
  if tg_table_name = 'working_packages' then
    select s.org_id into site_org_id from lsites_sites.sites s where s.id = new.site_id;
    if site_org_id is null or site_org_id <> new.org_id then
      raise exception 'working package organization does not match site organization';
    end if;
  elsif tg_table_name = 'working_content_versions' then
    select p.org_id, p.lead_id, p.site_id into package_org_id, package_lead_id, package_site_id
      from lsites_sites.working_packages p
      where p.working_package_id = new.working_package_id;
    if package_org_id is null or package_org_id <> new.org_id or package_lead_id <> new.lead_id or package_site_id <> new.site_id then
      raise exception 'working content version identity does not match package identity';
    end if;
    if (select p.template_id from lsites_sites.working_packages p where p.working_package_id = new.working_package_id) <> new.template_id then
      raise exception 'working content version template does not match package template';
    end if;
    if new.parent_version_number is not null and new.parent_version_number >= new.version_number then
      raise exception 'working content version parent must be older than the new version';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists working_packages_org_consistency on lsites_sites.working_packages;
create trigger working_packages_org_consistency
before insert or update on lsites_sites.working_packages
for each row execute function lsites_sites.assert_working_content_org_consistency();

create or replace function lsites_sites.enforce_working_package_cursor()
returns trigger
language plpgsql
security invoker
set search_path = lsites_sites, public
as $$
begin
  if old.working_package_id <> new.working_package_id
    or old.template_id <> new.template_id
    or old.org_id <> new.org_id
    or old.lead_id <> new.lead_id
    or old.site_id <> new.site_id
    or new.created_at <> old.created_at
    or new.current_version < old.current_version
    or new.current_version > old.current_version + 1
  then
    raise exception 'working package identity/cursor is immutable or advanced by more than one version';
  end if;
  return new;
end;
$$;

drop trigger if exists working_packages_cursor on lsites_sites.working_packages;
create trigger working_packages_cursor
before update on lsites_sites.working_packages
for each row execute function lsites_sites.enforce_working_package_cursor();

drop trigger if exists working_versions_org_consistency on lsites_sites.working_content_versions;
create trigger working_versions_org_consistency
before insert on lsites_sites.working_content_versions
for each row execute function lsites_sites.assert_working_content_org_consistency();

-- Version content and identity are immutable. State/gate/promotion fields
-- advance through the repository methods, while direct content rewrites fail
-- closed even for a caller that has UPDATE on the table.
create or replace function lsites_sites.enforce_working_content_version_immutability()
returns trigger
language plpgsql
security invoker
set search_path = lsites_sites, public
as $$
begin
  if old.working_package_id <> new.working_package_id
    or old.version_number <> new.version_number
    or old.schema_version_major <> new.schema_version_major
    or old.schema_version_minor <> new.schema_version_minor
    or old.template_id <> new.template_id
    or old.org_id <> new.org_id
    or old.lead_id <> new.lead_id
    or old.site_id <> new.site_id
    or old.program_ref <> new.program_ref
    or old.run_id is distinct from new.run_id
    or old.parent_version_number is distinct from new.parent_version_number
    or old.author_id <> new.author_id
    or old.executor_id <> new.executor_id
    or old.content_payload <> new.content_payload
    or old.asset_refs <> new.asset_refs
    or old.library_refs <> new.library_refs
    or old.provenance <> new.provenance
    or old.content_checksum <> new.content_checksum
    or new.created_at <> old.created_at
  then
    raise exception 'working content version is immutable; create a new version instead';
  end if;

  if old.promotion_idempotency_key is not null
    and old.promotion_idempotency_key is distinct from new.promotion_idempotency_key
  then
    raise exception 'promotion idempotency key is immutable once bound';
  end if;

  if old.lifecycle_state = 'promoted'
    and (
      old.lifecycle_state is distinct from new.lifecycle_state
      or old.gate_outcome is distinct from new.gate_outcome
      or old.gate_reference is distinct from new.gate_reference
      or old.gate_evidence_refs is distinct from new.gate_evidence_refs
      or old.promotion_idempotency_key is distinct from new.promotion_idempotency_key
      or old.payload_target_collection is distinct from new.payload_target_collection
      or old.payload_document_id is distinct from new.payload_document_id
      or old.payload_draft_revision is distinct from new.payload_draft_revision
      or old.promotion_receipt_id is distinct from new.promotion_receipt_id
      or old.updated_at is distinct from new.updated_at
    )
  then
    raise exception 'promoted working content is immutable';
  end if;

  if not (
    (old.lifecycle_state = 'working' and new.lifecycle_state in ('working', 'ready_for_gate', 'rejected'))
    or (old.lifecycle_state = 'ready_for_gate' and new.lifecycle_state in ('ready_for_gate', 'accepted', 'rejected'))
    or (old.lifecycle_state = 'accepted' and new.lifecycle_state in ('accepted', 'promoted', 'superseded'))
    or (old.lifecycle_state = 'promoted' and new.lifecycle_state = 'promoted')
    or (old.lifecycle_state = 'superseded' and new.lifecycle_state = 'superseded')
    or (old.lifecycle_state = 'rejected' and new.lifecycle_state = 'rejected')
  ) then
    raise exception 'invalid working content lifecycle transition from % to %', old.lifecycle_state, new.lifecycle_state;
  end if;
  if new.lifecycle_state = 'accepted' and jsonb_array_length(new.gate_evidence_refs) = 0 then
    raise exception 'accepted working content requires gate evidence';
  end if;
  if new.promotion_idempotency_key is not null and new.lifecycle_state not in ('accepted', 'promoted') then
    raise exception 'promotion idempotency key requires accepted or promoted working content';
  end if;
  return new;
end;
$$;

drop trigger if exists working_versions_immutable on lsites_sites.working_content_versions;
create trigger working_versions_immutable
before update on lsites_sites.working_content_versions
for each row execute function lsites_sites.enforce_working_content_version_immutability();

-- Dedicated runtime role only. No browser/public role receives grants or a
-- policy, so client-side Supabase credentials cannot mutate the workshop.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'svc_linksites_runtime') then
    create role svc_linksites_runtime nologin;
  end if;
end $$;

grant usage on schema lsites_sites to svc_linksites_runtime;
grant select, insert, update on lsites_sites.working_packages to svc_linksites_runtime;
grant select, insert, update on lsites_sites.working_content_versions to svc_linksites_runtime;
grant select, insert on lsites_sites.working_content_promotion_receipts to svc_linksites_runtime;
grant execute on function platform.has_org_access(uuid, platform.member_role) to svc_linksites_runtime;

alter table lsites_sites.working_packages enable row level security;
alter table lsites_sites.working_content_versions enable row level security;
alter table lsites_sites.working_content_promotion_receipts enable row level security;

create policy working_packages_runtime_org_access
  on lsites_sites.working_packages for all to svc_linksites_runtime
  using (platform.has_org_access(org_id, 'client_viewer'))
  with check (platform.has_org_access(org_id, 'client_viewer'));

create policy working_versions_runtime_org_access
  on lsites_sites.working_content_versions for all to svc_linksites_runtime
  using (platform.has_org_access(org_id, 'client_viewer'))
  with check (platform.has_org_access(org_id, 'client_viewer'));

create policy working_receipts_runtime_org_access
  on lsites_sites.working_content_promotion_receipts for all to svc_linksites_runtime
  using (platform.has_org_access(org_id, 'client_viewer'))
  with check (platform.has_org_access(org_id, 'client_viewer'));

create or replace function lsites_sites.assert_working_receipt_consistency()
returns trigger
language plpgsql
security invoker
set search_path = lsites_sites, public
as $$
declare
  version_org_id uuid;
  version_checksum text;
  version_key text;
begin
  select v.org_id, v.content_checksum, v.promotion_idempotency_key
    into version_org_id, version_checksum, version_key
    from lsites_sites.working_content_versions v
   where v.working_package_id = new.working_package_id
     and v.version_number = new.version_number;
  if version_org_id is null
    or version_org_id <> new.org_id
    or version_checksum is distinct from new.content_checksum
    or version_key is distinct from new.promotion_idempotency_key
  then
    raise exception 'promotion receipt does not match the prepared immutable version';
  end if;
  return new;
end;
$$;

drop trigger if exists working_receipts_consistency on lsites_sites.working_content_promotion_receipts;
create trigger working_receipts_consistency
before insert on lsites_sites.working_content_promotion_receipts
for each row execute function lsites_sites.assert_working_receipt_consistency();
