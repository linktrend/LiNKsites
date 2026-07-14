import type { WorkflowRequest } from '@/types/PayloadRequestExtended'

export interface SEOData {
  title?: string
  description?: string
  keywords?: string
  /** Media collection id when stored on a document; URL when rendering meta tags. */
  ogImage?: string | number
  noIndex?: boolean
}

export interface DefaultSEOConfig {
  titleTemplate?: string
  defaultTitle?: string
  defaultDescription?: string
  defaultKeywords?: string
  defaultOgImage?: unknown
}

/**
 * Generate SEO metadata with defaults
 */
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const readMediaUrl = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (isRecord(value) && typeof value.url === 'string') return value.url
  return undefined
}

const resolveMediaId = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (isRecord(value) && typeof value.id === 'number' && Number.isFinite(value.id)) return value.id
  return undefined
}

export function generateSEO(
  data: SEOData,
  defaults: DefaultSEOConfig,
  pageTitle?: string,
): SEOData {
  const title = data.title || pageTitle || defaults.defaultTitle || ''
  const formattedTitle = defaults.titleTemplate
    ? defaults.titleTemplate.replace('%s', title)
    : title

  const ogImageId = resolveMediaId(data.ogImage) ?? resolveMediaId(defaults.defaultOgImage)

  return {
    title: formattedTitle,
    description: data.description || defaults.defaultDescription || '',
    keywords: data.keywords || defaults.defaultKeywords || '',
    ...(ogImageId != null ? { ogImage: ogImageId } : {}),
    noIndex: data.noIndex ?? false,
  }
}

/**
 * Inject default SEO values from global settings
 */
export async function injectDefaultSEO(
  doc: Record<string, unknown>,
  req: WorkflowRequest,
  _siteId?: string,
): Promise<Record<string, unknown>> {
  try {
    // Fetch SEO global settings for the site
    const seoGlobal = await req.payload.findGlobal({
      slug: 'seo',
      locale: req.locale,
    })

    const typedDoc = doc as Record<string, unknown> & { seo?: SEOData; title?: string }

    if (!typedDoc.seo) {
      typedDoc.seo = {}
    }

    const ogImageRaw = seoGlobal?.defaultOgImage

    const defaults: DefaultSEOConfig = {
      titleTemplate: seoGlobal?.titleTemplate || '%s',
      defaultTitle: seoGlobal?.defaultTitle || '',
      defaultDescription: seoGlobal?.defaultDescription || '',
      defaultKeywords: seoGlobal?.defaultKeywords || '',
      defaultOgImage: ogImageRaw as DefaultSEOConfig['defaultOgImage'],
    }

    typedDoc.seo = generateSEO(typedDoc.seo, defaults, typedDoc.title)

    return typedDoc
  } catch (_error) {
    // If global doesn't exist yet, return doc unchanged
    return doc
  }
}

/**
 * Extract text content from Lexical rich text for meta description
 */
export function extractTextFromLexical(lexicalData: unknown, maxLength: number = 160): string {
  if (!isRecord(lexicalData) || !isRecord(lexicalData.root) || !Array.isArray(lexicalData.root.children))
    return ''

  let text = ''

  const traverse = (node: unknown) => {
    if (!isRecord(node)) return
    if (typeof node.text === 'string') {
      text += `${node.text} `
    }
    if (Array.isArray(node.children)) {
      node.children.forEach(traverse)
    }
  }

  lexicalData.root.children.forEach(traverse)

  return text.trim().substring(0, maxLength)
}

/**
 * Generate meta tags for frontend rendering
 */
export function generateMetaTags(seo: SEOData): Record<string, string> {
  const tags: Record<string, string> = {}

  if (seo.title) {
    tags['title'] = seo.title
    tags['og:title'] = seo.title
    tags['twitter:title'] = seo.title
  }

  if (seo.description) {
    tags['description'] = seo.description
    tags['og:description'] = seo.description
    tags['twitter:description'] = seo.description
  }

  if (seo.keywords) {
    tags['keywords'] = seo.keywords
  }

  const ogImageUrl = readMediaUrl(seo.ogImage)
  if (ogImageUrl) {
    tags['og:image'] = ogImageUrl
    tags['twitter:image'] = ogImageUrl
  }

  if (seo.noIndex) {
    tags['robots'] = 'noindex, nofollow'
  }

  return tags
}
