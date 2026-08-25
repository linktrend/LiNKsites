-- LS-03 rollback fixture: successor adoption records the prior snapshot as rollback_record.

insert into platform.organizations (id, name, kind, status)
values ('21000000-0000-0000-0000-0000000000ee', 'LS-03 Rollback Org', 'client', 'active')
on conflict (id) do nothing;

insert into lsites_sites.sites (id, org_id, name, default_locale)
values ('23000000-0000-0000-0000-0000000000ee', '21000000-0000-0000-0000-0000000000ee', 'LS-03 Rollback Site', 'en')
on conflict (id) do nothing;

insert into lsites_sites.entitlement_snapshots (
  snapshot_id, org_id, site_id, locale, site_ref, plan_id, granted_credits, digest, actor_id, evidence_digest
) values
  (
    'entitlement:rollback-site:C',
    '21000000-0000-0000-0000-0000000000ee',
    '23000000-0000-0000-0000-0000000000ee',
    'en',
    'rollback-site',
    'C',
    6,
    'rollback-before',
    'actor-rollback',
    'evidence-before'
  ),
  (
    'entitlement:rollback-site:B',
    '21000000-0000-0000-0000-0000000000ee',
    '23000000-0000-0000-0000-0000000000ee',
    'en',
    'rollback-site',
    'B',
    15,
    'rollback-after',
    'actor-rollback',
    'evidence-after'
  );

insert into lsites_sites.template_adoptions (
  adoption_id, org_id, site_id, locale, adoption_state,
  identity_provider, identity_layout, identity_plan, identity_overlay,
  identity_config, identity_content, identity_adapter, identity_effective,
  entitlement_snapshot_id, before_record, after_record, rollback_record, actor_id, evidence_digest
) values (
  'adopt:rollback-site',
  '21000000-0000-0000-0000-0000000000ee',
  '23000000-0000-0000-0000-0000000000ee',
  'en',
  'rolled_back',
  '0178894d6ce718bb7dff3c141892f82144e2d18c',
  '7777777777777777777777777777777777777777',
  '8888888888888888888888888888888888888888',
  '9999999999999999999999999999999999999999',
  'abababababababababababababababababababab',
  'cdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcd',
  '6cab53da19ba390d392157dbcc38979f1a6c86b5',
  'efefefefefefefefefefefefefefefefefefefef',
  'entitlement:rollback-site:C',
  '{"snapshotId":"entitlement:rollback-site:B"}'::jsonb,
  '{"snapshotId":"entitlement:rollback-site:C"}'::jsonb,
  '{"snapshotId":"entitlement:rollback-site:B"}'::jsonb,
  'actor-rollback',
  'evidence-rollback'
);
