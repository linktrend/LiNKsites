import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { CacheKeys, cacheGet, cacheSet } from '@/payload/utils/cache'

const APPROVAL_COLLECTIONS = [
  'offer-pages',
  'case-study-pages',
  'video-pages',
  'testimonials',
] as const

const PUBLISHED_COLLECTIONS = ['articles', 'help-articles', 'videos', 'testimonials'] as const

const countDocuments = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: string,
  siteId: string,
  locale: string,
  statusFilter: string | string[],
) => {
  const where =
    Array.isArray(statusFilter) && statusFilter.length > 0
      ? {
          site: { equals: siteId },
          status: { in: statusFilter },
        }
      : {
          site: { equals: siteId },
          status: { equals: statusFilter },
        }

  const result = await payload.find({
    collection: collection as never,
    where: where as never,
    limit: 1,
    depth: 0,
    locale: locale as never,
    fallbackLocale: false,
  })

  return result.totalDocs ?? result.docs.length ?? 0
}

export async function GET(
  _request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { params }: any,
) {
  const { siteId, locale } = params

  if (!siteId || !locale) {
    return NextResponse.json({ error: 'siteId and locale are required' }, { status: 400 })
  }

  const payload = await getPayload({ config })
  const cacheKey = CacheKeys.publishedList(siteId, locale, 'metrics', 'counts')
  const cached = await cacheGet(cacheKey)
  if (cached) {
    return NextResponse.json(cached)
  }

  const pendingApprovals = await Promise.all(
    APPROVAL_COLLECTIONS.map((collection) =>
      countDocuments(payload, collection, siteId, locale, 'pending'),
    ),
  )
  const pendingTranslations = await countDocuments(payload, 'translation-queue', siteId, locale, [
    'pending',
    'in_progress',
  ])
  const publishedCounts = await Promise.all(
    PUBLISHED_COLLECTIONS.map((collection) =>
      countDocuments(payload, collection, siteId, locale, 'published'),
    ),
  )
  const draftCounts = await Promise.all(
    PUBLISHED_COLLECTIONS.map((collection) => countDocuments(payload, collection, siteId, locale, 'draft')),
  )

  const responseBody = {
    siteId,
    locale,
    pendingApprovals: pendingApprovals.reduce((total, value) => total + value, 0),
    pendingTranslations,
    published: publishedCounts.reduce((total, value) => total + value, 0),
    drafts: draftCounts.reduce((total, value) => total + value, 0),
  }

  await cacheSet(cacheKey, responseBody)
  return NextResponse.json(responseBody)
}
