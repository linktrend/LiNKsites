import type { WorkflowRequest } from '@/types/PayloadRequestExtended'

export interface SEOData {
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  noIndex?: boolean
}

export interface DefaultSEOConfig {
  titleTemplate?: string
  defaultTitle?: string
  defaultDescription?: string
  defaultKeywords?: string
  defaultOgImage?: string
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

export function generateSEO(
  data: SEOData,
  defaults: DefaultSEOConfig,
  pageTitle?: string,
): SEOData {
  const title = data.title || pageTitle || defaults.defaultTitle || ''
  const formattedTitle = defaults.titleTemplate
    ? defaults.titleTemplate.replace('%s', title)
    : title

  const ogImageValue = readMediaUrl(data.ogImage) || defaults.defaultOgImage || ''

  return {
    title: formattedTitle,
    description: data.description || defaults.defaultDescription || '',
    keywords: data.keywords || defaults.defaultKeywords || '',
    ogImage: ogImageValue,
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
    const ogImage = readMediaUrl(ogImageRaw) || ''

    const defaults: DefaultSEOConfig = {
      titleTemplate: seoGlobal?.titleTemplate || '%s',
      defaultTitle: seoGlobal?.defaultTitle || '',
      defaultDescription: seoGlobal?.defaultDescription || '',
      defaultKeywords: seoGlobal?.defaultKeywords || '',
      defaultOgImage: ogImage,
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

  if (seo.ogImage) {
    tags['og:image'] = seo.ogImage
    tags['twitter:image'] = seo.ogImage
  }

  if (seo.noIndex) {
    tags['robots'] = 'noindex, nofollow'
  }

  return tags
}
