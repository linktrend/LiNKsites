import type { CollectionAfterChangeHook, PayloadRequest } from 'payload'
import { cacheInvalidatePattern } from '@/payload/utils/cache'
import { triggerLiNKautowork } from '@/payload/utils/autowork'
import { triggerSiteRebuild } from '@/utils/webhook'

export const triggerRebuild: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
  collection,
  previousDoc,
}: {
  doc: Record<string, unknown>
  req: PayloadRequest
  operation: string
  collection?: { slug?: string }
  previousDoc: Record<string, unknown> | null
}): Promise<Record<string, unknown>> => {
  // Only trigger on update or create
  if (operation !== 'create' && operation !== 'update') {
    return doc
  }

  // Only trigger if status changed to published
  const previousStatus = (previousDoc as Record<string, unknown> | null)?.status
  const previousStatusFallback = (previousDoc as Record<string, unknown> | null)?._status
  const currentStatus = (doc as Record<string, unknown>)?.status
  const currentStatusFallback = (doc as Record<string, unknown>)?._status
  const wasPublished = previousStatus === 'published' || previousStatusFallback === 'published'
  const isPublished = currentStatus === 'published' || currentStatusFallback === 'published'
  // A private preview is never public activation, but its publication is still
  // an operational LiNKsites event: cache invalidation, rebuild delivery, and
  // governed automation must not be silently bypassed.
  if (!wasPublished && isPublished) {
    const siteValue = (doc as Record<string, unknown>).site as
      | string
      | { id?: unknown }
      | undefined
    const siteId =
      typeof siteValue === 'string'
        ? siteValue
        : typeof siteValue?.id === 'string'
          ? siteValue.id
          : undefined

    if (siteId) {
      void cacheInvalidatePattern(`site:${siteId}`).catch((error) =>
        console.error('Cache invalidation failed during rebuild trigger', error),
      )
      // Trigger rebuild asynchronously (don't wait)
      triggerSiteRebuild(siteId, req, 'content_published').catch((error) => {
        console.error('Failed to trigger rebuild:', error)
      })
      if (collection?.slug && doc?.id) {
        await triggerLiNKautowork({
          id: doc.id as string | number,
          collection: collection.slug,
          eventType: 'content_published',
          site: siteId,
          locale: req.locale ?? undefined,
          req,
        })
      }
    }
  }

  return doc
}
