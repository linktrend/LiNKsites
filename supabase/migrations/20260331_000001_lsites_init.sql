-- migrate:up
create extension if not exists "pgcrypto";

create schema if not exists lsites_core;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'status_enum' and typnamespace = 'lsites_core'::regnamespace) then
    create type lsites_core.status_enum as enum ('draft', 'active', 'published', 'archived');
  end if;
end $$;

create table if not exists lsites_core.sites (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status lsites_core.status_enum not null default 'active',
  template_id text,
  primary_domain text,
  default_locale text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lsites_core.site_domains (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_core.sites(id) on delete cascade,
  domain text not null,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists lsites_core.languages (
  code text primary key,
  name text not null,
  is_default boolean not null default false
);

create table if not exists lsites_core.navigation (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_core.sites(id) on delete cascade,
  locale text not null,
  title text,
  data jsonb not null default '{}'::jsonb,
  status lsites_core.status_enum not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lsites_core.site_settings (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_core.sites(id) on delete cascade,
  locale text not null,
  title text,
  data jsonb not null default '{}'::jsonb,
  status lsites_core.status_enum not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lsites_core.media (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references lsites_core.sites(id) on delete cascade,
  locale text,
  title text,
  data jsonb not null default '{}'::jsonb,
  status lsites_core.status_enum not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lsites_core.pages (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_core.sites(id) on delete cascade,
  locale text not null,
  slug text not null,
  title text,
  status lsites_core.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, locale, slug)
);

create table if not exists lsites_core.offer_pages (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_core.sites(id) on delete cascade,
  locale text not null,
  slug text not null,
  title text,
  status lsites_core.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, locale, slug)
);

create table if not exists lsites_core.case_study_pages (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_core.sites(id) on delete cascade,
  locale text not null,
  slug text not null,
  title text,
  status lsites_core.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, locale, slug)
);

create table if not exists lsites_core.video_pages (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_core.sites(id) on delete cascade,
  locale text not null,
  slug text not null,
  title text,
  status lsites_core.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, locale, slug)
);

create table if not exists lsites_core.faq_pages (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_core.sites(id) on delete cascade,
  locale text not null,
  slug text not null,
  title text,
  status lsites_core.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, locale, slug)
);

create table if not exists lsites_core.terms_pages (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_core.sites(id) on delete cascade,
  locale text not null,
  slug text not null,
  title text,
  status lsites_core.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, locale, slug)
);

create table if not exists lsites_core.privacy_pages (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_core.sites(id) on delete cascade,
  locale text not null,
  slug text not null,
  title text,
  status lsites_core.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, locale, slug)
);

create table if not exists lsites_core.cookie_policy_pages (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_core.sites(id) on delete cascade,
  locale text not null,
  slug text not null,
  title text,
  status lsites_core.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, locale, slug)
);

create table if not exists lsites_core.articles (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_core.sites(id) on delete cascade,
  locale text not null,
  slug text not null,
  title text,
  status lsites_core.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, locale, slug)
);

create table if not exists lsites_core.videos (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_core.sites(id) on delete cascade,
  locale text not null,
  slug text not null,
  title text,
  status lsites_core.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, locale, slug)
);

create table if not exists lsites_core.testimonials (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_core.sites(id) on delete cascade,
  locale text,
  slug text,
  title text,
  status lsites_core.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lsites_core.locations (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_core.sites(id) on delete cascade,
  locale text,
  slug text,
  title text,
  status lsites_core.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lsites_core.team_members (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_core.sites(id) on delete cascade,
  locale text,
  slug text,
  title text,
  status lsites_core.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lsites_core.help_articles (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_core.sites(id) on delete cascade,
  locale text not null,
  slug text not null,
  title text,
  status lsites_core.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, locale, slug)
);

create table if not exists lsites_core.help_categories (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_core.sites(id) on delete cascade,
  locale text,
  slug text,
  title text,
  status lsites_core.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lsites_core.article_categories (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_core.sites(id) on delete cascade,
  locale text,
  slug text,
  title text,
  status lsites_core.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lsites_core.offer_categories (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_core.sites(id) on delete cascade,
  locale text,
  slug text,
  title text,
  status lsites_core.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lsites_core.case_study_categories (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_core.sites(id) on delete cascade,
  locale text,
  slug text,
  title text,
  status lsites_core.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lsites_core.video_categories (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_core.sites(id) on delete cascade,
  locale text,
  slug text,
  title text,
  status lsites_core.status_enum not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lsites_core.sync_ingress (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references lsites_core.sites(id) on delete cascade,
  entity text not null,
  payload jsonb not null,
  source text not null default 'lautowork',
  status lsites_core.status_enum not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lsites_core.sync_jobs (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references lsites_core.sites(id) on delete cascade,
  entity text not null,
  entity_id text,
  action text not null,
  status text not null default 'queued',
  attempts integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS: enforce site isolation for site-scoped tables
alter table lsites_core.site_domains enable row level security;
alter table lsites_core.navigation enable row level security;
alter table lsites_core.site_settings enable row level security;
alter table lsites_core.media enable row level security;
alter table lsites_core.pages enable row level security;
alter table lsites_core.offer_pages enable row level security;
alter table lsites_core.case_study_pages enable row level security;
alter table lsites_core.video_pages enable row level security;
alter table lsites_core.faq_pages enable row level security;
alter table lsites_core.terms_pages enable row level security;
alter table lsites_core.privacy_pages enable row level security;
alter table lsites_core.cookie_policy_pages enable row level security;
alter table lsites_core.articles enable row level security;
alter table lsites_core.videos enable row level security;
alter table lsites_core.testimonials enable row level security;
alter table lsites_core.locations enable row level security;
alter table lsites_core.team_members enable row level security;
alter table lsites_core.help_articles enable row level security;
alter table lsites_core.help_categories enable row level security;
alter table lsites_core.article_categories enable row level security;
alter table lsites_core.offer_categories enable row level security;
alter table lsites_core.case_study_categories enable row level security;
alter table lsites_core.video_categories enable row level security;
alter table lsites_core.sync_ingress enable row level security;
alter table lsites_core.sync_jobs enable row level security;

drop policy if exists lsites_site_isolation on lsites_core.site_domains;
create policy lsites_site_isolation on lsites_core.site_domains
  for all to svc_linksites_runtime
  using (site_id::text = current_setting('app.site_id', true))
  with check (site_id::text = current_setting('app.site_id', true));

drop policy if exists lsites_site_isolation_nav on lsites_core.navigation;
create policy lsites_site_isolation_nav on lsites_core.navigation
  for all to svc_linksites_runtime
  using (site_id::text = current_setting('app.site_id', true))
  with check (site_id::text = current_setting('app.site_id', true));

drop policy if exists lsites_site_isolation_settings on lsites_core.site_settings;
create policy lsites_site_isolation_settings on lsites_core.site_settings
  for all to svc_linksites_runtime
  using (site_id::text = current_setting('app.site_id', true))
  with check (site_id::text = current_setting('app.site_id', true));

drop policy if exists lsites_site_isolation_media on lsites_core.media;
create policy lsites_site_isolation_media on lsites_core.media
  for all to svc_linksites_runtime
  using (site_id::text = current_setting('app.site_id', true))
  with check (site_id::text = current_setting('app.site_id', true));

drop policy if exists lsites_site_isolation_pages on lsites_core.pages;
create policy lsites_site_isolation_pages on lsites_core.pages
  for all to svc_linksites_runtime
  using (site_id::text = current_setting('app.site_id', true))
  with check (site_id::text = current_setting('app.site_id', true));

drop policy if exists lsites_site_isolation_offer_pages on lsites_core.offer_pages;
create policy lsites_site_isolation_offer_pages on lsites_core.offer_pages
  for all to svc_linksites_runtime
  using (site_id::text = current_setting('app.site_id', true))
  with check (site_id::text = current_setting('app.site_id', true));

drop policy if exists lsites_site_isolation_case_study_pages on lsites_core.case_study_pages;
create policy lsites_site_isolation_case_study_pages on lsites_core.case_study_pages
  for all to svc_linksites_runtime
  using (site_id::text = current_setting('app.site_id', true))
  with check (site_id::text = current_setting('app.site_id', true));

drop policy if exists lsites_site_isolation_video_pages on lsites_core.video_pages;
create policy lsites_site_isolation_video_pages on lsites_core.video_pages
  for all to svc_linksites_runtime
  using (site_id::text = current_setting('app.site_id', true))
  with check (site_id::text = current_setting('app.site_id', true));

drop policy if exists lsites_site_isolation_faq_pages on lsites_core.faq_pages;
create policy lsites_site_isolation_faq_pages on lsites_core.faq_pages
  for all to svc_linksites_runtime
  using (site_id::text = current_setting('app.site_id', true))
  with check (site_id::text = current_setting('app.site_id', true));

drop policy if exists lsites_site_isolation_terms_pages on lsites_core.terms_pages;
create policy lsites_site_isolation_terms_pages on lsites_core.terms_pages
  for all to svc_linksites_runtime
  using (site_id::text = current_setting('app.site_id', true))
  with check (site_id::text = current_setting('app.site_id', true));

drop policy if exists lsites_site_isolation_privacy_pages on lsites_core.privacy_pages;
create policy lsites_site_isolation_privacy_pages on lsites_core.privacy_pages
  for all to svc_linksites_runtime
  using (site_id::text = current_setting('app.site_id', true))
  with check (site_id::text = current_setting('app.site_id', true));

drop policy if exists lsites_site_isolation_cookie_policy_pages on lsites_core.cookie_policy_pages;
create policy lsites_site_isolation_cookie_policy_pages on lsites_core.cookie_policy_pages
  for all to svc_linksites_runtime
  using (site_id::text = current_setting('app.site_id', true))
  with check (site_id::text = current_setting('app.site_id', true));

drop policy if exists lsites_site_isolation_articles on lsites_core.articles;
create policy lsites_site_isolation_articles on lsites_core.articles
  for all to svc_linksites_runtime
  using (site_id::text = current_setting('app.site_id', true))
  with check (site_id::text = current_setting('app.site_id', true));

drop policy if exists lsites_site_isolation_videos on lsites_core.videos;
create policy lsites_site_isolation_videos on lsites_core.videos
  for all to svc_linksites_runtime
  using (site_id::text = current_setting('app.site_id', true))
  with check (site_id::text = current_setting('app.site_id', true));

drop policy if exists lsites_site_isolation_testimonials on lsites_core.testimonials;
create policy lsites_site_isolation_testimonials on lsites_core.testimonials
  for all to svc_linksites_runtime
  using (site_id::text = current_setting('app.site_id', true))
  with check (site_id::text = current_setting('app.site_id', true));

drop policy if exists lsites_site_isolation_locations on lsites_core.locations;
create policy lsites_site_isolation_locations on lsites_core.locations
  for all to svc_linksites_runtime
  using (site_id::text = current_setting('app.site_id', true))
  with check (site_id::text = current_setting('app.site_id', true));

drop policy if exists lsites_site_isolation_team_members on lsites_core.team_members;
create policy lsites_site_isolation_team_members on lsites_core.team_members
  for all to svc_linksites_runtime
  using (site_id::text = current_setting('app.site_id', true))
  with check (site_id::text = current_setting('app.site_id', true));

drop policy if exists lsites_site_isolation_help_articles on lsites_core.help_articles;
create policy lsites_site_isolation_help_articles on lsites_core.help_articles
  for all to svc_linksites_runtime
  using (site_id::text = current_setting('app.site_id', true))
  with check (site_id::text = current_setting('app.site_id', true));

drop policy if exists lsites_site_isolation_help_categories on lsites_core.help_categories;
create policy lsites_site_isolation_help_categories on lsites_core.help_categories
  for all to svc_linksites_runtime
  using (site_id::text = current_setting('app.site_id', true))
  with check (site_id::text = current_setting('app.site_id', true));

drop policy if exists lsites_site_isolation_article_categories on lsites_core.article_categories;
create policy lsites_site_isolation_article_categories on lsites_core.article_categories
  for all to svc_linksites_runtime
  using (site_id::text = current_setting('app.site_id', true))
  with check (site_id::text = current_setting('app.site_id', true));

drop policy if exists lsites_site_isolation_offer_categories on lsites_core.offer_categories;
create policy lsites_site_isolation_offer_categories on lsites_core.offer_categories
  for all to svc_linksites_runtime
  using (site_id::text = current_setting('app.site_id', true))
  with check (site_id::text = current_setting('app.site_id', true));

drop policy if exists lsites_site_isolation_case_study_categories on lsites_core.case_study_categories;
create policy lsites_site_isolation_case_study_categories on lsites_core.case_study_categories
  for all to svc_linksites_runtime
  using (site_id::text = current_setting('app.site_id', true))
  with check (site_id::text = current_setting('app.site_id', true));

drop policy if exists lsites_site_isolation_video_categories on lsites_core.video_categories;
create policy lsites_site_isolation_video_categories on lsites_core.video_categories
  for all to svc_linksites_runtime
  using (site_id::text = current_setting('app.site_id', true))
  with check (site_id::text = current_setting('app.site_id', true));

drop policy if exists lsites_site_isolation_sync_ingress on lsites_core.sync_ingress;
create policy lsites_site_isolation_sync_ingress on lsites_core.sync_ingress
  for all to svc_lsites_cms_sync
  using (site_id::text = current_setting('app.site_id', true))
  with check (site_id::text = current_setting('app.site_id', true));

drop policy if exists lsites_site_isolation_sync_jobs on lsites_core.sync_jobs;
create policy lsites_site_isolation_sync_jobs on lsites_core.sync_jobs
  for all to svc_linksites_runtime
  using (site_id::text = current_setting('app.site_id', true))
  with check (site_id::text = current_setting('app.site_id', true));

-- grants/revokes
revoke all on schema lsites_core from public;
grant usage on schema lsites_core to svc_migrator, svc_observer, svc_linksites_runtime, svc_lsites_cms_sync;

grant select on all tables in schema lsites_core to svc_observer;
grant select, insert, update, delete on all tables in schema lsites_core to svc_linksites_runtime;
grant insert, select, update on lsites_core.sync_ingress to svc_lsites_cms_sync;

alter default privileges in schema lsites_core grant select on tables to svc_observer;
alter default privileges in schema lsites_core grant select, insert, update, delete on tables to svc_linksites_runtime;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'svc_linksites_runtime') then
    execute 'alter role svc_linksites_runtime set search_path = lsites_core,public';
  end if;
  if exists (select 1 from pg_roles where rolname = 'svc_lsites_cms_sync') then
    execute 'alter role svc_lsites_cms_sync set search_path = lsites_core,public';
  end if;
end $$;

-- verification
select n.nspname as schema_name, count(*) as tables
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'lsites_core' and c.relkind = 'r'
group by n.nspname;

-- migrate:down
drop table if exists lsites_core.sync_jobs;
drop table if exists lsites_core.sync_ingress;
drop table if exists lsites_core.video_categories;
drop table if exists lsites_core.case_study_categories;
drop table if exists lsites_core.offer_categories;
drop table if exists lsites_core.article_categories;
drop table if exists lsites_core.help_categories;
drop table if exists lsites_core.help_articles;
drop table if exists lsites_core.team_members;
drop table if exists lsites_core.locations;
drop table if exists lsites_core.testimonials;
drop table if exists lsites_core.videos;
drop table if exists lsites_core.articles;
drop table if exists lsites_core.cookie_policy_pages;
drop table if exists lsites_core.privacy_pages;
drop table if exists lsites_core.terms_pages;
drop table if exists lsites_core.faq_pages;
drop table if exists lsites_core.video_pages;
drop table if exists lsites_core.case_study_pages;
drop table if exists lsites_core.offer_pages;
drop table if exists lsites_core.pages;
drop table if exists lsites_core.media;
drop table if exists lsites_core.site_settings;
drop table if exists lsites_core.navigation;
drop table if exists lsites_core.languages;
drop table if exists lsites_core.site_domains;
drop table if exists lsites_core.sites;
drop type if exists lsites_core.status_enum;
drop schema if exists lsites_core;
