import type { CollectionBeforeChangeHook } from 'payload'
import type { User } from '@/payload-types'
import type { WorkflowRequest } from '@/types/PayloadRequestExtended'
import { cacheInvalidatePattern } from '@/payload/utils/cache'
import { hasLocaleAccess } from '@/utils/resolvePermissions'
import { getAutoApproveSetting, normalizeWorkflowStatus, validateStatusTransition } from '@/utils/workflow'
import { isBootstrapMode } from '@/utils/bootstrap'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const identifier = (value: unknown): string | undefined =>
  typeof value === 'string' || typeof value === 'number' ? String(value) : undefined

const resolveSiteId = (data?: unknown, fallback?: unknown): string | undefined => {
  const read = (value?: unknown): string | undefined => {
    if (!value) return undefined
    const direct = identifier(value)
    if (direct) return direct
    if (isRecord(value)) {
      const site = identifier(value.site)
      if (site) return site
      if (isRecord(value.site)) return identifier(value.site.id)
      return identifier(value.id)
    }
    return undefined
  }

  return read(data) ?? read(fallback)
}

const resolveLocale = (data?: unknown, fallback?: unknown): string | undefined => {
  const read = (value?: unknown): string | undefined => {
    if (!value) return undefined
    const direct = identifier(value)
    if (direct) return direct
    if (isRecord(value)) {
      const locale = identifier(value.locale)
      if (locale) return locale
      if (isRecord(value.locale)) return identifier(value.locale.id)
      return identifier(value.id)
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

const isPrivatePreviewPublication = (data?: unknown): boolean =>
  isRecord(data) && data.previewEnvironment === 'private-preview' && data.publicActivation === false

export const validatePublishPermissions: CollectionBeforeChangeHook = async ({
  data,
  req,
  originalDoc,
}) => {
  const workflowReq = req as WorkflowRequest

  // During bootstrap (no users) or governed factory scripts, skip validation
  if (await isBootstrapMode(workflowReq) || process.env.LINKSITES_FACTORY_MODE === '1') {
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
    // This narrow exception is valid only for the private-preview publication
    // boundary. Public activation is structurally false and the ordinary
    // customer-content workflow remains unchanged.
    allowPrivatePreviewPublication: isPrivatePreviewPublication(data),
  })

  data.status = validatedStatus

  if (siteId && validatedStatus !== previousStatus) {
    void cacheInvalidatePattern(`site:${siteId}`)
  }
  return data
}
