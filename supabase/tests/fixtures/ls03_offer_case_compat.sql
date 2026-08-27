-- LS-03 Offer/Case compatibility fixture.

insert into platform.organizations (id, name, kind, status)
values ('21000000-0000-0000-0000-0000000000cc', 'LS-03 Compat Org', 'client', 'active')
on conflict (id) do nothing;

insert into lsites_sites.sites (id, org_id, name, default_locale)
values ('23000000-0000-0000-0000-0000000000cc', '21000000-0000-0000-0000-0000000000cc', 'LS-03 Compat Site', 'en')
on conflict (id) do nothing;

insert into lsites_sites.offer_case_compatibility (
  mapping_id, org_id, site_id, locale, source_collection, source_document_id, target_collection, offer_kind
) values
  (
    'map:offer-product',
    '21000000-0000-0000-0000-0000000000cc',
    '23000000-0000-0000-0000-0000000000cc',
    'en',
    'offer-pages',
    'offer-1',
    'products',
    'product'
  ),
  (
    'map:offer-service',
    '21000000-0000-0000-0000-0000000000cc',
    '23000000-0000-0000-0000-0000000000cc',
    'en',
    'offer-pages',
    'offer-2',
    'services',
    'service'
  ),
  (
    'map:case-results',
    '21000000-0000-0000-0000-0000000000cc',
    '23000000-0000-0000-0000-0000000000cc',
    'en',
    'case-study-pages',
    'case-1',
    'results-work',
    null
  );
