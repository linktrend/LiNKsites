import { CacheKeys, cacheGet, cacheSet } from '@/payload/utils/cache'
import type { User } from '@/payload-types'
import type { WorkflowRequest } from '@/types/PayloadRequestExtended'
import { hasPermission } from '@/utils/resolvePermissions'
import { PermissionFlag } from '@/utils/permissions'

export type WorkflowStatus = 'draft' | 'pending' | 'published'

type WorkflowContext = {
  siteSettingsCache?: Record<string, boolean>
}

const SITE_SETTINGS_COLLECTION = 'site-settings'

export const normalizeWorkflowStatus = (status?: string | null): WorkflowStatus => {
  if (status === 'pending') return 'pending'
  if (status === 'published') return 'published'
  if (status === 'approved') return 'published'
  return 'draft'
}

export const getAutoApproveSetting = async (
  req: WorkflowRequest,
  siteId?: string,
): Promise<boolean> => {
  if (!siteId || !req?.payload) return false

  const context = (req.context ||= {}) as WorkflowContext
  context.siteSettingsCache = context.siteSettingsCache || {}

  if (context.siteSettingsCache[siteId] !== undefined) {
    return context.siteSettingsCache[siteId]
  }

  const localization = req.payload.config.localization
  const defaultLocale =
    localization && typeof localization === 'object' && 'defaultLocale' in localization
      ? (localization as { defaultLocale?: string }).defaultLocale
      : undefined

  const activeLocale =
    typeof req.locale === 'string' && req.locale.length > 0 ? req.locale : defaultLocale || 'en'
  const cacheKey = CacheKeys.siteSettings(siteId, activeLocale)
  const cached = await cacheGet<boolean>(cacheKey)
  if (cached !== undefined) {
    context.siteSettingsCache[siteId] = cached
    return cached
  }

  const result = await req.payload.find({
    collection: SITE_SETTINGS_COLLECTION,
    where: {
      site: { equals: siteId },
    },
    limit: 1,
    depth: 0,
    locale: activeLocale as never,
    fallbackLocale: false,
  })

  const autoApprove = Boolean(result.docs[0]?.autoApprove)
  context.siteSettingsCache[siteId] = autoApprove
  await cacheSet(cacheKey, autoApprove)
  return autoApprove
}

export const validateStatusTransition = ({
  existingStatus,
  requestedStatus,
  user,
  siteId,
  allowAutoApprove = false,
}: {
  existingStatus?: string | null
  requestedStatus?: string | null
  user: User | null | undefined
  siteId?: string
  allowAutoApprove?: boolean
}): WorkflowStatus => {
  const current = normalizeWorkflowStatus(existingStatus || undefined)
  const target = normalizeWorkflowStatus(requestedStatus || undefined)

  if (current === target) {
    return target
  }

  const canSubmit = hasPermission(user, PermissionFlag.SUBMIT_FOR_REVIEW, siteId)
  const canApprove = hasPermission(user, PermissionFlag.APPROVE, siteId)
  const canPublish = hasPermission(user, PermissionFlag.PUBLISH, siteId)

  if (current === 'draft') {
    if (target === 'pending' && canSubmit) return 'pending'
    if (target === 'published' && allowAutoApprove && canSubmit) return 'published'
    throw new Error('Draft content must be submitted for review before publishing.')
  }

  if (current === 'pending') {
    if (target === 'draft' && (canApprove || canPublish)) return 'draft'
    if (target === 'published' && (canApprove || canPublish || allowAutoApprove)) return 'published'
    throw new Error('Pending content requires approval to be published.')
  }

  if (current === 'published') {
    if (target === 'draft' && canPublish) return 'draft'
    throw new Error('Only publishers can revert published content to draft.')
  }

  return target
}
