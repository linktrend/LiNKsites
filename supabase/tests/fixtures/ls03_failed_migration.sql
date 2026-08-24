-- LS-03 failed-migration safety fixture: invalid SHA-1 identity must not commit.

insert into platform.organizations (id, name, kind, status)
values ('21000000-0000-0000-0000-0000000000dd', 'LS-03 Fail Org', 'client', 'active')
on conflict (id) do nothing;

insert into lsites_sites.sites (id, org_id, name, default_locale)
values ('23000000-0000-0000-0000-0000000000dd', '21000000-0000-0000-0000-0000000000dd', 'LS-03 Fail Site', 'en')
on conflict (id) do nothing;

-- This statement is expected to fail closed (identity_provider check).
insert into lsites_sites.entitlement_snapshots (
  snapshot_id, org_id, site_id, locale, site_ref, plan_id, granted_credits, digest, actor_id, evidence_digest
) values (
  'entitlement:fail-site:A',
  '21000000-0000-0000-0000-0000000000dd',
  '23000000-0000-0000-0000-0000000000dd',
  'en',
  'fail-site',
  'A',
  30,
  'fail-digest',
  'actor-fail',
  'evidence-fail'
);

insert into lsites_sites.template_adoptions (
  adoption_id, org_id, site_id, locale, adoption_state,
  identity_provider, identity_layout, identity_plan, identity_overlay,
  identity_config, identity_content, identity_adapter, identity_effective,
  entitlement_snapshot_id, actor_id, evidence_digest
) values (
  'adopt:fail-site',
  '21000000-0000-0000-0000-0000000000dd',
  '23000000-0000-0000-0000-0000000000dd',
  'en',
  'adopted',
  'not-a-sha1',
  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  'cccccccccccccccccccccccccccccccccccccccc',
  'dddddddddddddddddddddddddddddddddddddddd',
  'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  '6cab53da19ba390d392157dbcc38979f1a6c86b5',
  'ffffffffffffffffffffffffffffffffffffffff',
  'entitlement:fail-site:A',
  'actor-fail',
  'evidence-fail'
);
