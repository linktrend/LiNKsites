import type { CollectionBeforeChangeHook, CollectionBeforeDeleteHook } from 'payload'
import type { User } from '@/payload-types'
import type { WorkflowRequest } from '@/types/PayloadRequestExtended'
import { hasLocaleAccess } from '@/utils/resolvePermissions'
import { validateSiteAccess as validateAccess } from '@/utils/siteScope'
import { isBootstrapMode } from '@/utils/bootstrap'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const resolveSiteId = (data: unknown, originalDoc: unknown): string | null => {
  const read = (value: unknown): string | null => {
    if (typeof value === 'string') {
      return value
    }

    if (isRecord(value)) {
      if (typeof value.site === 'string') return value.site
      if (isRecord(value.site) && typeof value.site.id === 'string') return value.site.id
      if (typeof value.id === 'string') return value.id
    }

    return null
  }

  return read(data) ?? read(originalDoc)
}

const resolveLocale = (data: unknown, originalDoc: unknown): string | null => {
  const read = (value: unknown): string | null => {
    if (typeof value === 'string') {
      return value
    }

    if (isRecord(value) && typeof value.locale === 'string') {
      return value.locale
    }

    if (isRecord(value) && isRecord(value.locale) && typeof value.locale.id === 'string') {
      return value.locale.id
    }

    return null
  }

  return read(data) ?? read(originalDoc)
}

export const validateSiteAccess: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation: _operation,
  originalDoc,
}) => {
  const workflowReq = req as WorkflowRequest
  
  // During bootstrap (no users), skip validation
  if (await isBootstrapMode(workflowReq)) {
    return data
  }
  
  const typedUser = workflowReq.user as User | null | undefined
  if (!typedUser) {
    return data
  }

  const siteId = resolveSiteId(data, originalDoc)
  const locale = resolveLocale(data, originalDoc)

  if (!siteId) {
    throw new Error('Site is required')
  }

  validateAccess(typedUser, siteId)

  if (locale && !hasLocaleAccess(typedUser, locale)) {
    throw new Error('Locale is not permitted for this user')
  }

  return data
}

export const validateSiteAccessBeforeDelete: CollectionBeforeDeleteHook = async ({
  req,
  id,
  collection,
}) => {
  const workflowReq = req as WorkflowRequest
  
  // During bootstrap (no users), skip validation
  if (await isBootstrapMode(workflowReq)) {
    return
  }
  
  const typedUser = workflowReq.user as User | null | undefined
  if (!typedUser) {
    return
  }

  const existing = await workflowReq.payload.findByID({
    collection: collection.slug,
    id,
    depth: 0,
  } as unknown as Parameters<typeof workflowReq.payload.findByID>[0])

  const siteId = resolveSiteId(existing, existing)
  const locale = resolveLocale(existing, existing)

  if (!siteId) {
    throw new Error('Site is required')
  }

  validateAccess(typedUser, siteId)

  if (locale && !hasLocaleAccess(typedUser, locale)) {
    throw new Error('Locale is not permitted for this user')
  }
}
