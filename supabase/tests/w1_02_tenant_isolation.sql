-- W1-02 local-gate adversarial RLS probes.
--
-- This file is executed through the local Postgres container as the disposable
-- bootstrap superuser. Fixtures are inserted as that trusted role, then every
-- access assertion runs under the same runtime roles named by the migrations.
-- The fixed IDs make the probe deterministic and the pgTAP transaction rolls
-- all fixture writes back after the test file completes.

begin;
select extensions.plan(19);

-- Two tenants, one active member each, plus one principal with no membership.
insert into platform.organizations (id, name, kind, status)
values
  ('11000000-0000-0000-0000-0000000000aa', 'W1-02 Org A', 'client', 'active'),
  ('11000000-0000-0000-0000-0000000000bb', 'W1-02 Org B', 'client', 'active')
on conflict (id) do nothing;

insert into platform.org_members (org_id, user_id, role, status)
values
  ('11000000-0000-0000-0000-0000000000aa', '12000000-0000-0000-0000-0000000000aa', 'client_viewer', 'active'),
  ('11000000-0000-0000-0000-0000000000bb', '12000000-0000-0000-0000-0000000000bb', 'client_viewer', 'active')
on conflict (org_id, user_id) do nothing;

insert into lsites_sites.sites (id, org_id, name, default_locale)
values
  ('13000000-0000-0000-0000-0000000000aa', '11000000-0000-0000-0000-0000000000aa', 'W1-02 Site A', 'en'),
  ('13000000-0000-0000-0000-0000000000bb', '11000000-0000-0000-0000-0000000000bb', 'W1-02 Site B', 'en')
on conflict (id) do nothing;

insert into lsites_sites.pages (id, site_id, locale, slug, title)
values
  ('14000000-0000-0000-0000-0000000000aa', '13000000-0000-0000-0000-0000000000aa', 'en', 'w1-02-a', 'Page A'),
  ('14000000-0000-0000-0000-0000000000bb', '13000000-0000-0000-0000-0000000000bb', 'en', 'w1-02-b', 'Page B')
on conflict (id) do nothing;

insert into lsites_ledger.programs (program_id, org_id, title, state)
values
  ('w1-02-a', '11000000-0000-0000-0000-0000000000aa', 'W1-02 Program A', 'ready'),
  ('w1-02-b', '11000000-0000-0000-0000-0000000000bb', 'W1-02 Program B', 'ready')
on conflict (program_id, org_id) do nothing;

select extensions.ok(
  (select relrowsecurity from pg_class where oid = 'lsites_sites.sites'::regclass),
  'sites has RLS enabled'
);
select extensions.ok(
  (select relrowsecurity from pg_class where oid = 'lsites_ledger.programs'::regclass),
  'ledger programs have RLS enabled'
);

set role svc_linksites_runtime;
select set_config('request.jwt.claim.sub', '12000000-0000-0000-0000-0000000000aa', true);
select set_config('app.org_id', '11000000-0000-0000-0000-0000000000aa', true);

select set_config(
  'w1_02.probe',
  (select count(*)::int::text from lsites_sites.sites where id = '13000000-0000-0000-0000-0000000000aa'),
  false
);
reset role;
select extensions.is(current_setting('w1_02.probe'), '1', 'Org A member can read its own site');

set role svc_linksites_runtime;
select set_config(
  'w1_02.probe',
  (select count(*)::int::text from lsites_sites.sites where id = '13000000-0000-0000-0000-0000000000bb'),
  false
);
reset role;
select extensions.is(current_setting('w1_02.probe'), '0', 'Org A member cannot read Org B site');

set role svc_linksites_runtime;
select set_config(
  'w1_02.probe',
  (select count(*)::int::text from lsites_sites.pages where id = '14000000-0000-0000-0000-0000000000bb'),
  false
);
reset role;
select extensions.is(current_setting('w1_02.probe'), '0', 'Org A member cannot read Org B child row');

set role svc_linksites_ledger;
select set_config(
  'w1_02.probe',
  (select count(*)::int::text from lsites_ledger.programs where program_id = 'w1-02-b'),
  false
);
select set_config(
  'w1_02.probe_ledger_own',
  (select count(*)::int::text from lsites_ledger.programs where program_id = 'w1-02-a'),
  false
);
select set_config(
  'w1_02.probe',
  platform.has_org_access('11000000-0000-0000-0000-0000000000aa', 'client_viewer')::text,
  false
);
reset role;
select extensions.is(current_setting('w1_02.probe_ledger_own'), '1', 'Org A ledger role can read its own ledger row');
select extensions.is(current_setting('w1_02.probe'), 'true', 'Org A ledger role can invoke the shared Platform membership helper');

set role svc_linksites_ledger;
select set_config(
  'w1_02.probe',
  (select count(*)::int::text from lsites_ledger.programs where program_id = 'w1-02-b'),
  false
);
reset role;
select extensions.is(current_setting('w1_02.probe'), '0', 'Org A ledger role cannot read Org B ledger row');

set role svc_linksites_runtime;
select set_config(
  'w1_02.probe',
  (select count(*)::int::text from lsites_sites.sites where id = '13000000-0000-0000-0000-0000000000bb'),
  false
);
update lsites_sites.sites set name = 'hijacked' where id = '13000000-0000-0000-0000-0000000000bb';
reset role;
select extensions.is(current_setting('w1_02.probe'), '0', 'Org A cannot read Org B even with no site fast-path match');
select extensions.is(
  (select name from lsites_sites.sites where id = '13000000-0000-0000-0000-0000000000bb'),
  'W1-02 Site B',
  'cross-tenant site update leaves Org B unchanged'
);
set role svc_linksites_runtime;
update lsites_sites.sites set name = 'W1-02 Site A updated' where id = '13000000-0000-0000-0000-0000000000aa';
reset role;
select extensions.is(
  (select name from lsites_sites.sites where id = '13000000-0000-0000-0000-0000000000aa'),
  'W1-02 Site A updated',
  'same-tenant site update changes the row'
);
set role svc_linksites_runtime;
do $$
begin
  begin
    insert into lsites_sites.pages (site_id, locale, slug, title)
      values ('13000000-0000-0000-0000-0000000000bb', 'en', 'cross-tenant', 'must fail');
    perform set_config('w1_02.probe', 'unexpected-success', false);
  exception when others then
    perform set_config('w1_02.probe', SQLSTATE || ':' || SQLERRM, false);
  end;
end $$;
reset role;
select extensions.is(
  current_setting('w1_02.probe'),
  '42501:new row violates row-level security policy for table "pages"',
  'cross-tenant child insert is rejected by WITH CHECK'
);

set role svc_linksites_ledger;
update lsites_ledger.programs set title = 'hijacked' where program_id = 'w1-02-b';
reset role;
select extensions.is(
  (select title from lsites_ledger.programs where program_id = 'w1-02-b'),
  'W1-02 Program B',
  'cross-tenant ledger update leaves Org B unchanged'
);
set role svc_linksites_ledger;
update lsites_ledger.programs set title = 'W1-02 Program A updated' where program_id = 'w1-02-a';
reset role;
select extensions.is(
  (select title from lsites_ledger.programs where program_id = 'w1-02-a'),
  'W1-02 Program A updated',
  'same-tenant ledger update changes the row'
);
set role svc_linksites_ledger;
do $$
begin
  begin
    insert into lsites_ledger.programs (program_id, org_id, title, state)
      values ('w1-02-forged', '11000000-0000-0000-0000-0000000000bb', 'must fail', 'ready');
    perform set_config('w1_02.probe', 'unexpected-success', false);
  exception when others then
    perform set_config('w1_02.probe', SQLSTATE || ':' || SQLERRM, false);
  end;
end $$;
reset role;
select extensions.is(
  current_setting('w1_02.probe'),
  '42501:new row violates row-level security policy for table "programs"',
  'cross-tenant ledger insert is rejected by WITH CHECK'
);
select extensions.ok(
  platform.has_org_access('11000000-0000-0000-0000-0000000000aa', 'client_viewer'),
  'platform membership check allows the active Org A member'
);
select extensions.ok(
  not platform.has_org_access('11000000-0000-0000-0000-0000000000bb', 'client_viewer'),
  'platform membership check denies the other tenant'
);

reset role;
select set_config('request.jwt.claim.sub', '12000000-0000-0000-0000-0000000000ff', true);
select set_config('app.org_id', '', true);
set role svc_linksites_runtime;
select set_config('app.site_id', '13000000-0000-0000-0000-0000000000bb', true);
select set_config(
  'w1_02.probe',
  (select count(*)::int::text from lsites_sites.sites where id = '13000000-0000-0000-0000-0000000000bb'),
  false
);
reset role;
select extensions.is(current_setting('w1_02.probe'), '0', 'unaffiliated principal cannot forge app.site_id to read Org B');

set role svc_observer;
select set_config('w1_02.probe', (select count(*)::int::text from lsites_sites.sites), false);
reset role;
select extensions.is(current_setting('w1_02.probe'), '0', 'observer role has no RLS policy and sees no tenant rows');

select * from extensions.finish();
rollback;
