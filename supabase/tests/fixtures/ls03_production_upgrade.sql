-- LS-03 production-shaped upgrade fixture: existing working package keeps its
-- template_id as a deprecated projection and gains linked adoption/entitlement.

insert into platform.organizations (id, name, kind, status)
values ('21000000-0000-0000-0000-0000000000bb', 'LS-03 Upgrade Org', 'client', 'active')
on conflict (id) do nothing;

insert into lsites_sites.sites (id, org_id, name, default_locale)
values ('23000000-0000-0000-0000-0000000000bb', '21000000-0000-0000-0000-0000000000bb', 'LS-03 Upgrade Site', 'en')
on conflict (id) do nothing;

insert into lsites_sites.working_packages (
  working_package_id, template_id, org_id, lead_id, site_id
) values (
  'wp-upgrade-ls03', 'master-template-type-1',
  '21000000-0000-0000-0000-0000000000bb', 'lead-upgrade',
  '23000000-0000-0000-0000-0000000000bb'
) on conflict (working_package_id) do nothing;

insert into lsites_sites.entitlement_snapshots (
  snapshot_id, org_id, site_id, locale, site_ref, plan_id, granted_credits, digest, actor_id, evidence_digest
) values (
  'entitlement:upgrade-site:B',
  '21000000-0000-0000-0000-0000000000bb',
  '23000000-0000-0000-0000-0000000000bb',
  'en',
  'upgrade-site',
  'B',
  15,
  'upgrade-digest',
  'actor-upgrade',
  'evidence-upgrade'
);

insert into lsites_sites.template_adoptions (
  adoption_id, org_id, site_id, locale, adoption_state,
  identity_provider, identity_layout, identity_plan, identity_overlay,
  identity_config, identity_content, identity_adapter, identity_effective,
  entitlement_snapshot_id, actor_id, evidence_digest, deprecated_template_id_projection
) values (
  'adopt:upgrade-site',
  '21000000-0000-0000-0000-0000000000bb',
  '23000000-0000-0000-0000-0000000000bb',
  'en',
  'linked',
  '0178894d6ce718bb7dff3c141892f82144e2d18c',
  '1111111111111111111111111111111111111111',
  '2222222222222222222222222222222222222222',
  '3333333333333333333333333333333333333333',
  '4444444444444444444444444444444444444444',
  '5555555555555555555555555555555555555555',
  '6cab53da19ba390d392157dbcc38979f1a6c86b5',
  '6666666666666666666666666666666666666666',
  'entitlement:upgrade-site:B',
  'actor-upgrade',
  'evidence-upgrade',
  'master-template-type-1'
);

insert into lsites_sites.legacy_template_id_projections (
  projection_id, org_id, site_id, deprecated_template_id, adoption_id
) values (
  'proj:upgrade-site',
  '21000000-0000-0000-0000-0000000000bb',
  '23000000-0000-0000-0000-0000000000bb',
  'master-template-type-1',
  'adopt:upgrade-site'
);

update lsites_sites.working_packages
set
  deprecated_template_id_projection = template_id,
  template_adoption_id = 'adopt:upgrade-site',
  entitlement_snapshot_id = 'entitlement:upgrade-site:B'
where working_package_id = 'wp-upgrade-ls03';
