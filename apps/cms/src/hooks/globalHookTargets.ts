const translatableSlugs = [
  'article-categories',
  'articles',
  'case-study-categories',
  'case-study-pages',
  'faq-pages',
  'help-articles',
  'help-categories',
  'navigation',
  'offer-categories',
  'offer-pages',
  'pages',
  'privacy-pages',
  'site-settings',
  'terms-pages',
  'testimonials',
  'video-categories',
  'video-pages',
  'videos',
] as const

export const TRANSLATABLE_COLLECTIONS = new Set<string>(translatableSlugs)

export const SITE_SCOPED_COLLECTIONS = new Set<string>(['media', ...translatableSlugs])

export const PUBLISH_VALIDATED_COLLECTIONS = new Set<string>(translatableSlugs)
