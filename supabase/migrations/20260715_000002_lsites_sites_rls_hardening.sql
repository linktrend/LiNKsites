-- migrate:up
-- lsites_sites tenant-isolation hardening. Closes findings F1 and F2 surfaced
-- by the 12-vector negative matrix in
-- packages/program-ledger/tests/tenant-isolation.spec.ts (GAP-06,
-- audit/09_gap_and_risk_register.yaml).
--
-- Authority: docs/archive/adr/0003-retire-mirror-pattern-and-adopt-shared-platform-
-- org-model.md (Decision 2 -- membership via platform.has_org_access() is the
-- real trust boundary; the app.site_id session variable is a scoping
-- convenience only, never a standalone grant).
--
-- APPEND-ONLY: this migration does NOT modify
-- 20260715_000001_lsites_sites_core.sql (already applied to live databases).
-- It updates the existing policies in place via drop/create and alters the
-- sites.org_id column, so it is safe to apply on top of 000001.
--
-- F1 (V3) -- the app.site_id fast-path was a STANDALONE grant: any principal
--   who could set app.site_id to a victim site's id read/wrote that site's
--   data regardless of org membership. Fix: the site_id match no longer stands
--   alone; it is ANDed with platform.has_org_access(org_id, 'client_viewer').
--   Membership is now required on every path, so a forged app.site_id grants
--   nothing on its own. (The site_id-AND-membership clause is logically
--   subsumed by the pure-membership clause; it is retained deliberately to
--   document that the fast-path scoping convenience still exists but is now
--   gated behind a genuine membership check, per ADR 0003 Decision 2.)
-- F2 (V5) -- a sites row with org_id IS NULL was visible/writable to EVERY
--   principal. Principal-confirmed (2026-07-15): zero real rows exist in
--   lsites_sites.sites in either linkplatform-stage or linkplatform-prod, so
--   no backfill is needed. Fix: org_id is set NOT NULL directly, and every
--   now-dead `org_id is null` bypass clause is removed from the policies.
--
-- Apply to linkplatform-stage first, then linkplatform-prod after verification.

-- Fix 2: every sites row must belong to exactly one organization. No
-- global/unassigned state is permitted at the site level.
alter table lsites_sites.sites
  alter column org_id set not null;

comment on column lsites_sites.sites.org_id is
  'FK to platform.organizations(id) in the shared linkplatform-stage/-prod '
  'project. NOT NULL: every sites row belongs to exactly one organization -- '
  'there is no global/unassigned state at the site level. Global/internal '
  'null-org conventions used elsewhere (e.g. LiNKbrain) do NOT apply here; a '
  'website always belongs to exactly one tenant.';

-- Fix 1 + Fix 2 on sites itself: the app.site_id fast-path is ANDed with a
-- real membership check, and the `org_id is null` bypass is removed (org_id is
-- now NOT NULL, so that clause could never be true and was dead code).
drop policy if exists lsites_sites_access on lsites_sites.sites;
create policy lsites_sites_access on lsites_sites.sites
  for all to svc_linksites_runtime
  using (
    (id::text = current_setting('app.site_id', true)
      and platform.has_org_access(org_id, 'client_viewer'))
    or platform.has_org_access(org_id, 'client_viewer')
  )
  with check (
    (id::text = current_setting('app.site_id', true)
      and platform.has_org_access(org_id, 'client_viewer'))
    or platform.has_org_access(org_id, 'client_viewer')
  );

-- Fix 1 + Fix 2 for every site_id-scoped child table. Same do/foreach loop
-- shape as the original migration (avoids hand-repeating 23 policies). Each
-- policy: the site_id fast-path is ANDed with the join-based membership check
-- through sites, OR'd with the same pure membership check; the `s.org_id is
-- null` bypass is removed from the join condition.
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
    execute format('drop policy if exists lsites_%s_access on lsites_sites.%I', t, t);
    execute format(
      'create policy lsites_%s_access on lsites_sites.%I ' ||
      'for all to svc_linksites_runtime ' ||
      'using ((site_id::text = current_setting(''app.site_id'', true) ' ||
      'and exists (select 1 from lsites_sites.sites s where s.id = %I.site_id ' ||
      'and platform.has_org_access(s.org_id, ''client_viewer''))) ' ||
      'or exists (select 1 from lsites_sites.sites s where s.id = %I.site_id ' ||
      'and platform.has_org_access(s.org_id, ''client_viewer''))) ' ||
      'with check ((site_id::text = current_setting(''app.site_id'', true) ' ||
      'and exists (select 1 from lsites_sites.sites s where s.id = %I.site_id ' ||
      'and platform.has_org_access(s.org_id, ''client_viewer''))) ' ||
      'or exists (select 1 from lsites_sites.sites s where s.id = %I.site_id ' ||
      'and platform.has_org_access(s.org_id, ''client_viewer'')))',
      t, t, t, t, t, t
    );
  end loop;
end $$;

-- verification: confirm sites.org_id is now NOT NULL
select a.attname as column_name, a.attnotnull as is_not_null
from pg_attribute a
where a.attrelid = 'lsites_sites.sites'::regclass
  and a.attname = 'org_id';

-- migrate:down
-- Revert to the pre-hardening (000001) policies and re-allow NULL org_id.
alter table lsites_sites.sites
  alter column org_id drop not null;

comment on column lsites_sites.sites.org_id is
  'FK to platform.organizations(id) in the shared linkplatform-stage/-prod '
  'project. Nullable until every existing row is backfilled (none exist yet '
  'as of this migration, so this is precautionary, not a known gap).';

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
