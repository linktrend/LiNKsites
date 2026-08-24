const translatableSlugs = [
  'article-categories',
  'articles',
  'case-study-categories',
  'case-study-pages',
  'core-settings',
  'faq-pages',
  'help-articles',
  'help-categories',
  'navigation',
  'offer-categories',
  'offer-pages',
  'pages',
  'policies',
  'privacy-pages',
  'products',
  'results-work',
  'service-areas',
  'services',
  'site-settings',
  'terms-pages',
  'testimonials',
  'video-categories',
  'video-pages',
  'videos',
] as const

export const TRANSLATABLE_COLLECTIONS = new Set<string>(translatableSlugs)

export const SITE_SCOPED_COLLECTIONS = new Set<string>([
  'media',
  'template-adoptions',
  'entitlement-snapshots',
  'locations',
  'team-members',
  ...translatableSlugs,
])

export const PUBLISH_VALIDATED_COLLECTIONS = new Set<string>(translatableSlugs)
