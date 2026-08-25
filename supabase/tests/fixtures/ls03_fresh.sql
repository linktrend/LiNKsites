-- LS-03 fresh-install fixture. Safe to apply after 20260824_000001.

insert into platform.organizations (id, name, kind, status)
values ('21000000-0000-0000-0000-0000000000aa', 'LS-03 Fresh Org', 'client', 'active')
on conflict (id) do nothing;

insert into lsites_sites.sites (id, org_id, name, default_locale)
values ('23000000-0000-0000-0000-0000000000aa', '21000000-0000-0000-0000-0000000000aa', 'LS-03 Fresh Site', 'en')
on conflict (id) do nothing;

insert into lsites_sites.entitlement_snapshots (
  snapshot_id, org_id, site_id, locale, site_ref, plan_id, granted_credits, digest, actor_id, evidence_digest
) values (
  'entitlement:fresh-site:A',
  '21000000-0000-0000-0000-0000000000aa',
  '23000000-0000-0000-0000-0000000000aa',
  'en',
  'fresh-site',
  'A',
  30,
  'fresh-digest',
  'actor-fresh',
  'evidence-fresh'
);

insert into lsites_sites.template_adoptions (
  adoption_id, org_id, site_id, locale, adoption_state,
  identity_provider, identity_layout, identity_plan, identity_overlay,
  identity_config, identity_content, identity_adapter, identity_effective,
  entitlement_snapshot_id, actor_id, evidence_digest, deprecated_template_id_projection
) values (
  'adopt:fresh-site',
  '21000000-0000-0000-0000-0000000000aa',
  '23000000-0000-0000-0000-0000000000aa',
  'en',
  'adopted',
  '0178894d6ce718bb7dff3c141892f82144e2d18c',
  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  'cccccccccccccccccccccccccccccccccccccccc',
  'dddddddddddddddddddddddddddddddddddddddd',
  'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  '6cab53da19ba390d392157dbcc38979f1a6c86b5',
  'ffffffffffffffffffffffffffffffffffffffff',
  'entitlement:fresh-site:A',
  'actor-fresh',
  'evidence-fresh',
  'master-template-type-1'
);
