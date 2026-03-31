import type { CollectionBeforeChangeHook } from 'payload'
import type { WorkflowRequest } from '@/types/PayloadRequestExtended'
import { injectDefaultSEO as injectSEO } from '@/utils/seo'

/**
 * Apply SEO defaults before persisting content to avoid afterRead DB lookups.
 */
export const injectDefaultSEO: CollectionBeforeChangeHook = async ({ data, req }) => {
  if (!data) return data

  const workflowReq = req as WorkflowRequest
  const siteValue = (data as Record<string, unknown>).site as string | { id?: unknown } | undefined
  const siteId =
    typeof siteValue === 'string'
      ? siteValue
      : typeof siteValue?.id === 'string'
        ? siteValue.id
        : undefined

  const updated = await injectSEO(data, workflowReq, siteId)
  return updated
}
