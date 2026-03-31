import type { CollectionBeforeChangeHook } from 'payload'
import type { User } from '@/payload-types'
import type { WorkflowRequest } from '@/types/PayloadRequestExtended'
import { cacheInvalidatePattern } from '@/payload/utils/cache'
import { hasLocaleAccess } from '@/utils/resolvePermissions'
import { getAutoApproveSetting, normalizeWorkflowStatus, validateStatusTransition } from '@/utils/workflow'
import { isBootstrapMode } from '@/utils/bootstrap'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const resolveSiteId = (data?: unknown, fallback?: unknown): string | undefined => {
  const read = (value?: unknown): string | undefined => {
    if (!value) return undefined
    if (typeof value === 'string') return value
    if (isRecord(value)) {
      if (typeof value.site === 'string') return value.site
      if (isRecord(value.site) && typeof value.site.id === 'string') return value.site.id
      if (typeof value.id === 'string') return value.id
    }
    return undefined
  }

  return read(data) ?? read(fallback)
}

const resolveLocale = (data?: unknown, fallback?: unknown): string | undefined => {
  const read = (value?: unknown): string | undefined => {
    if (!value) return undefined
    if (typeof value === 'string') return value
    if (isRecord(value)) {
      if (typeof value.locale === 'string') return value.locale
      if (isRecord(value.locale) && typeof value.locale.id === 'string') return value.locale.id
      if (typeof value.id === 'string') return value.id
    }
    return undefined
  }

  return read(data) ?? read(fallback)
}

const resolveStatus = (value?: unknown): string | undefined => {
  if (typeof value === 'string') return value
  if (isRecord(value) && typeof value.status === 'string') {
    return value.status
  }
  return undefined
}

export const validatePublishPermissions: CollectionBeforeChangeHook = async ({
  data,
  req,
  originalDoc,
}) => {
  const workflowReq = req as WorkflowRequest
  
  // During bootstrap (no users), skip validation
  if (await isBootstrapMode(workflowReq)) {
    return data
  }
  
  const typedUser = workflowReq.user as User | null | undefined
  if (!data) return data

  const locale = resolveLocale(workflowReq?.data, data) ?? undefined

  if (!locale || !hasLocaleAccess(typedUser, locale)) {
    throw new Error('Locale is not permitted for this user')
  }

  const previousStatus = normalizeWorkflowStatus(resolveStatus(originalDoc) ?? 'draft')
  const requestedStatus =
    resolveStatus(workflowReq?.data) ?? resolveStatus(data) ?? previousStatus ?? 'draft'
  const normalizedRequested = normalizeWorkflowStatus(requestedStatus)

  if (normalizedRequested === previousStatus) {
    return data
  }

  const siteId = resolveSiteId(data, originalDoc)
  const autoApproveEnabled =
    normalizedRequested === 'pending' && (await getAutoApproveSetting(workflowReq, siteId))

  const validatedStatus = validateStatusTransition({
    existingStatus: previousStatus,
    requestedStatus:
      normalizedRequested === 'pending' && autoApproveEnabled ? 'published' : normalizedRequested,
    user: typedUser,
    siteId,
    allowAutoApprove: autoApproveEnabled,
  })

  data.status = validatedStatus

  if (siteId && validatedStatus !== previousStatus) {
    void cacheInvalidatePattern(`site:${siteId}`)
  }
  return data
}
