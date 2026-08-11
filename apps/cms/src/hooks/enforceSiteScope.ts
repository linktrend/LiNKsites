import type { CollectionAfterReadHook } from 'payload'
import { hasLocaleAccess, hasSiteAccess } from '@/utils/resolvePermissions'

export const enforceSiteScope: CollectionAfterReadHook = async ({ req, doc }) => {
  const siteValue = (doc as Record<string, unknown> | null)?.site as
    | string
    | number
    | { id?: unknown }
    | undefined
  const localeValue = (doc as Record<string, unknown> | null)?.locale as
    | string
    | number
    | { id?: unknown }
    | undefined

  const identifier = (value: unknown): string | null =>
    typeof value === 'string' || typeof value === 'number' ? String(value) : null

  const siteId =
    identifier(siteValue) ??
    (siteValue && typeof siteValue === 'object' ? identifier(siteValue.id) : null)
  const locale =
    identifier(localeValue) ??
    (localeValue && typeof localeValue === 'object' ? identifier(localeValue.id) : null)

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
