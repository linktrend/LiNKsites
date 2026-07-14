-- migrate:up
-- LiNKsites working-layer content schema, written fresh against the shared
-- platform foundation (org identity, RLS helper) rather than as a retrofit
-- of the old mirror-pattern migration.
--
-- Context/authority: docs/adr/0003-retire-mirror-pattern-and-adopt-shared-
-- platform-org-model.md. This migration supersedes and replaces
-- 20260331_000001_lsites_init.sql (archived, not applied to
-- linkplatform-stage/-prod -- see supabase/migrations/archive/README.md).
--
-- Differences from the archived original:
--   1. Schema renamed lsites_core -> lsites_sites (a bare "core" name no
--      longer distinguishes anything once there's no core-vs-ledger split
--      left -- see ADR 0003 Decision 2).
--   2. sync_ingress / sync_jobs tables dropped entirely -- those existed
--      only to support the old Payload<->Supabase mirror-sync pattern,
--      which this architecture retires (ADR 0003 Decision 1).
--   3. sites gains org_id (nullable FK to platform.organizations, per the
--      shared foundation in the sibling LiNKplatform repo) and its own RLS
--      policy -- the original migration had no RLS on sites itself.
--   4. Every table's RLS policy now OR's two independent checks: the
--      original app.site_id session-variable path (kept as a fast-path
--      scoping convenience, per ADR 0003 Decision 2) and a real
--      platform.has_org_access() membership check via a join back to
--      sites.org_id. Either one passing is sufficient (Postgres RLS
--      policies are OR'd), so this is a strict widening of the trust
--      boundary's *definition of who's allowed in*, not a narrowing.
--
-- Prerequisite: LiNKplatform/supabase/migrations/20260714_000001_
-- platform_foundation.sql must already be applied to this same database
-- (creates the platform schema and platform.has_org_access()).
--
-- Confirmed before writing this migration (this session): no live LiNKsites
-- data exists in any Supabase project to migrate -- per
-- audit/04_data_and_storage_registry.yaml and the ADR 0003 investigation,
-- lsites_core was dormant scaffolding, never wired into running app code.
-- This is therefore a fresh CREATE, not a data-preserving ALTER.

create extension if not exists "pgcrypto";

create schema if not exists lsites_sites;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'status_enum' and typnamespace = 'lsites_sites'::regnamespace) then
    create type lsites_sites.status_enum as enum ('draft', 'active', 'published', 'archived');
  end if;
end $$;

create table if not exists lsites_sites.sites (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references platform.organizations(id),
  name text not null,
  status lsites_sites.status_enum not null default 'active',
  template_id text,
  primary_domain text,
  default_locale text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column lsites_sites.sites.org_id is
  'FK to platform.organizations(id) in the shared linkplatform-stage/-prod '
  'project. Nullable until every existing row is backfilled (none exist yet '
  'as of this migration, so this is precautionary, not a known gap).';

create table if not exists lsites_sites.site_domains (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_sites.sites(id) on delete cascade,
  domain text not null,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists lsites_sites.languages (
  code text primary key,
  name text not null,
  is_default boolean not null default false
);

create table if not exists lsites_sites.navigation (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_sites.sites(id) on delete cascade,
  locale text not null,
  title text,
  data jsonb not null default '{}'::jsonb,
  status lsites_sites.status_enum not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lsites_sites.site_settings (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_sites.sites(id) on delete cascade,
  locale text not null,
  title text,
  data jsonb not null default '{}'::jsonb,
  status lsites_sites.status_enum not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lsites_sites.media (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references lsites_sites.sites(id) on delete cascade,
  locale text,
  title text,
  data jsonb not null default '{}'::jsonb,
  status lsites_sites.status_enum not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lsites_sites.pages (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_sites.sites(id) on delete cascade,
  locale text not null,
  slug text not null,
  title text,
  status lsites_sites.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, locale, slug)
);

create table if not exists lsites_sites.offer_pages (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_sites.sites(id) on delete cascade,
  locale text not null,
  slug text not null,
  title text,
  status lsites_sites.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, locale, slug)
);

create table if not exists lsites_sites.case_study_pages (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_sites.sites(id) on delete cascade,
  locale text not null,
  slug text not null,
  title text,
  status lsites_sites.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, locale, slug)
);

create table if not exists lsites_sites.video_pages (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_sites.sites(id) on delete cascade,
  locale text not null,
  slug text not null,
  title text,
  status lsites_sites.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, locale, slug)
);

create table if not exists lsites_sites.faq_pages (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_sites.sites(id) on delete cascade,
  locale text not null,
  slug text not null,
  title text,
  status lsites_sites.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, locale, slug)
);

create table if not exists lsites_sites.terms_pages (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_sites.sites(id) on delete cascade,
  locale text not null,
  slug text not null,
  title text,
  status lsites_sites.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, locale, slug)
);

create table if not exists lsites_sites.privacy_pages (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_sites.sites(id) on delete cascade,
  locale text not null,
  slug text not null,
  title text,
  status lsites_sites.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, locale, slug)
);

create table if not exists lsites_sites.cookie_policy_pages (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_sites.sites(id) on delete cascade,
  locale text not null,
  slug text not null,
  title text,
  status lsites_sites.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, locale, slug)
);

create table if not exists lsites_sites.articles (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_sites.sites(id) on delete cascade,
  locale text not null,
  slug text not null,
  title text,
  status lsites_sites.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, locale, slug)
);

create table if not exists lsites_sites.videos (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_sites.sites(id) on delete cascade,
  locale text not null,
  slug text not null,
  title text,
  status lsites_sites.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, locale, slug)
);

create table if not exists lsites_sites.testimonials (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_sites.sites(id) on delete cascade,
  locale text,
  slug text,
  title text,
  status lsites_sites.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lsites_sites.locations (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_sites.sites(id) on delete cascade,
  locale text,
  slug text,
  title text,
  status lsites_sites.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lsites_sites.team_members (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_sites.sites(id) on delete cascade,
  locale text,
  slug text,
  title text,
  status lsites_sites.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lsites_sites.help_articles (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_sites.sites(id) on delete cascade,
  locale text not null,
  slug text not null,
  title text,
  status lsites_sites.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, locale, slug)
);

create table if not exists lsites_sites.help_categories (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_sites.sites(id) on delete cascade,
  locale text,
  slug text,
  title text,
  status lsites_sites.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lsites_sites.article_categories (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_sites.sites(id) on delete cascade,
  locale text,
  slug text,
  title text,
  status lsites_sites.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lsites_sites.offer_categories (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_sites.sites(id) on delete cascade,
  locale text,
  slug text,
  title text,
  status lsites_sites.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lsites_sites.case_study_categories (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_sites.sites(id) on delete cascade,
  locale text,
  slug text,
  title text,
  status lsites_sites.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lsites_sites.video_categories (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_sites.sites(id) on delete cascade,
  locale text,
  slug text,
  title text,
  status lsites_sites.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_lsites_sites_org_id on lsites_sites.sites(org_id);

-- Runtime roles: least-privilege, matching the lsites_ledger pattern
-- (program_ledger_core.sql). svc_lsites_cms_sync is intentionally NOT
-- recreated here -- it existed only to write sync_ingress/sync_jobs, both
-- retired.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'svc_linksites_runtime') then
    create role svc_linksites_runtime nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'svc_observer') then
    create role svc_observer nologin;
  end if;
end $$;

revoke all on schema lsites_sites from public;
grant usage on schema lsites_sites to svc_linksites_runtime, svc_observer;
grant select on all tables in schema lsites_sites to svc_observer;
grant select, insert, update, delete on all tables in schema lsites_sites to svc_linksites_runtime;
alter default privileges in schema lsites_sites grant select on tables to svc_observer;
alter default privileges in schema lsites_sites grant select, insert, update, delete on tables to svc_linksites_runtime;
grant execute on function platform.has_org_access(uuid, platform.member_role) to svc_linksites_runtime;

do $$
begin
  execute 'alter role svc_linksites_runtime set search_path = lsites_sites,public';
end $$;

-- RLS: every table gets BOTH the original app.site_id fast-path AND a real
-- org-membership check (OR'd -- either passing is sufficient). sites itself
-- did not have RLS in the archived original; it does now.
alter table lsites_sites.sites enable row level security;

drop policy if exists lsites_sites_access on lsites_sites.sites;
create policy lsites_sites_access on lsites_sites.sites
  for all to svc_linksites_runtime
  using (
    id::text = current_setting('app.site_id', true)
    or org_id is null
    or platform.has_org_access(org_id, 'client_viewer')
  )
  with check (
    id::text = current_setting('app.site_id', true)
    or org_id is null
    or platform.has_org_access(org_id, 'client_viewer')
  );

-- One loop for every site_id-scoped child table -- identical shape, so
-- generated once instead of repeated 23 times (matches the join-based
-- pattern illustrated in the now-superseded DRAFT_platform_org_retrofit.sql).
do $$
declare
  t text;
  child_tables text[] := array[
    'site_domains', 'navigation', 'site_settings', 'media', 'pages',
    'offer_pages', 'case_study_pages', 'video_pages', 'faq_pages',
    'terms_pages', 'privacy_pages', 'cookie_policy_pages', 'articles',
    'videos', 'testimonials', 'locations', 'team_members', 'help_articles',
    'help_categories', 'article_categories', 'offer_categories',
    'case_study_categories', 'video_categories'
  ];
begin
  foreach t in array child_tables loop
    execute format('alter table lsites_sites.%I enable row level security', t);
    execute format('drop policy if exists lsites_%s_access on lsites_sites.%I', t, t);
    execute format(
      'create policy lsites_%s_access on lsites_sites.%I ' ||
      'for all to svc_linksites_runtime ' ||
      'using (site_id::text = current_setting(''app.site_id'', true) ' ||
      'or exists (select 1 from lsites_sites.sites s where s.id = %I.site_id ' ||
      'and (s.org_id is null or platform.has_org_access(s.org_id, ''client_viewer'')))) ' ||
      'with check (site_id::text = current_setting(''app.site_id'', true) ' ||
      'or exists (select 1 from lsites_sites.sites s where s.id = %I.site_id ' ||
      'and (s.org_id is null or platform.has_org_access(s.org_id, ''client_viewer''))))',
      t, t, t, t
    );
  end loop;
end $$;

-- verification
select n.nspname as schema_name, count(*) as tables
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'lsites_sites' and c.relkind = 'r'
group by n.nspname;

-- migrate:down
drop schema if exists lsites_sites cascade;
