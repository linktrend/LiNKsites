import type { CollectionSlug, Where } from 'payload'
import type { WorkflowRequest } from '@/types/PayloadRequestExtended'

/**
 * Generate a URL-friendly slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

interface UniqueSlugArgs {
  slug: string
  collectionSlug: string
  req: WorkflowRequest
  docId?: string
  siteId?: string
  locale?: WorkflowRequest['locale']
}

async function isSlugUnique(args: UniqueSlugArgs): Promise<boolean> {
  const { slug, collectionSlug, req, docId, siteId, locale } = args

  const where: Where = {
    slug: {
      equals: slug,
    },
  }

  if (docId) {
    where.id = { not_equals: docId }
  }

  if (siteId) {
    where.site = { equals: siteId }
  }

  const queryOptions: Parameters<typeof req.payload.find>[0] = {
    collection: collectionSlug as CollectionSlug,
    where,
    limit: 1,
  }

  if (locale) {
    queryOptions.locale = locale
  }

  const existing = await req.payload.find(queryOptions)

  return existing.docs.length === 0
}

export async function generateUniqueSlug(
  text: string,
  collectionSlug: string,
  req: WorkflowRequest,
  options: { docId?: string; siteId?: string; locale?: WorkflowRequest['locale'] } = {},
): Promise<string> {
  const baseSlug = generateSlug(text)
  let slug = baseSlug
  let counter = 1
  let unique = await isSlugUnique({
    slug,
    collectionSlug,
    req,
    docId: options.docId,
    siteId: options.siteId,
    locale: options.locale,
  })

  while (!unique) {
    slug = `${baseSlug}-${counter}`
    counter++
    unique = await isSlugUnique({
      slug,
      collectionSlug,
      req,
      docId: options.docId,
      siteId: options.siteId,
      locale: options.locale,
    })
  }

  return slug
}

export function getLocalizedSlug(slug: string, locale: string, defaultLocale: string): string {
  if (locale === defaultLocale) {
    return slug
  }
  return `${locale}/${slug}`
}
