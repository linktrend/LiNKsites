import type { CollectionAfterChangeHook, PayloadRequest } from 'payload'
import { cacheInvalidatePattern } from '@/payload/utils/cache'
import { triggerN8N } from '@/payload/utils/n8n'
import type { WorkflowRequest } from '@/types/PayloadRequestExtended'
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
  const workflowReq = req as WorkflowRequest
  const metaSource = (workflowReq as WorkflowRequest & { meta?: Record<string, unknown> }).meta?.source
  if (metaSource === 'n8n') {
    return doc
  }
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
      triggerSiteRebuild(siteId, workflowReq, 'content_published').catch((error) => {
        console.error('Failed to trigger rebuild:', error)
      })
      if (collection?.slug && doc?.id) {
        void triggerN8N({
          id: doc.id as string | number,
          collection: collection.slug,
          eventType: 'content_published',
          site: siteId,
          locale: workflowReq.locale ?? undefined,
          meta: { source: 'payload' },
          req: workflowReq,
        }).catch((error) => console.error('n8n publish trigger failed', error))
      }
    }
  }

  return doc
}
