import type { FieldHook } from 'payload'
import type { WorkflowRequest } from '@/types/PayloadRequestExtended'
import { generateSlug, generateUniqueSlug } from '@/utils/slug'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const resolveSiteId = (data: unknown, originalDoc: unknown): string | undefined => {
  const read = (value: unknown): string | undefined => {
    if (typeof value === 'string') {
      return value
    }

    if (isRecord(value)) {
      if (typeof value.site === 'string') return value.site
      if (isRecord(value.site) && typeof value.site.id === 'string') return value.site.id
      if (typeof value.id === 'string') return value.id
    }

    return undefined
  }

  return read(data) ?? read(originalDoc)
}

export const autoGenerateSlug =
  (collectionSlug: string): FieldHook =>
  async ({ data, operation, value, originalDoc, req }) => {
    const workflowReq = req as WorkflowRequest
    const siteId = resolveSiteId(data, originalDoc)
    const docId = typeof originalDoc?.id === 'string' ? originalDoc.id : undefined
    const localizationConfig = workflowReq.payload?.config.localization
    const defaultLocaleFromConfig =
      localizationConfig && typeof localizationConfig === 'object'
        ? localizationConfig.defaultLocale
        : undefined
    const workingLocale: WorkflowRequest['locale'] =
      workflowReq.locale || (defaultLocaleFromConfig as WorkflowRequest['locale']) || 'en'

    if (!value && !data?.title && !data?.name) {
      return value
    }

    const rawValue = value || data?.title || data?.name
    const normalized = typeof rawValue === 'string' ? rawValue : ''

    if (!normalized) {
      return value
    }

    if (operation === 'update' && value === originalDoc?.slug?.[workingLocale]) {
      return value
    }

    if (!workflowReq.payload) {
      return generateSlug(normalized)
    }

    return generateUniqueSlug(normalized, collectionSlug, workflowReq, {
      docId,
      siteId,
      locale: workingLocale,
    })
  }
