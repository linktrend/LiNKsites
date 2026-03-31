import type { CollectionAfterReadHook } from 'payload'
import { hasLocaleAccess, hasSiteAccess } from '@/utils/resolvePermissions'

export const enforceSiteScope: CollectionAfterReadHook = async ({ req, doc }) => {
  const siteValue = (doc as Record<string, unknown> | null)?.site as
    | string
    | { id?: unknown }
    | undefined
  const localeValue = (doc as Record<string, unknown> | null)?.locale as
    | string
    | { id?: unknown }
    | undefined

  const siteId =
    typeof siteValue === 'string'
      ? siteValue
      : typeof siteValue?.id === 'string'
        ? siteValue.id
        : null
  const locale =
    typeof localeValue === 'string'
      ? localeValue
      : typeof localeValue?.id === 'string'
        ? localeValue.id
        : null

  if (!siteId || !req.user) {
    return doc
  }

  // Check site access first
  if (!hasSiteAccess(req.user, siteId)) {
    return null
  }

  // Then check locale if present
  if (locale && !hasLocaleAccess(req.user, locale)) {
    return null
  }

  return doc
}
