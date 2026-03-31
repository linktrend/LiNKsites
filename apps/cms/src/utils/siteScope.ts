import type { Where } from 'payload'
import type { User } from '@/payload-types'
import type { WorkflowRequest } from '@/types/PayloadRequestExtended'
import { hasSiteAccess, resolvePermissions } from '@/utils/resolvePermissions'
import { PermissionFlag } from '@/utils/permissions'

/**
 * Get site context from request
 * Checks query params, headers, or session
 */
export function getSiteFromRequest(req: WorkflowRequest): string | null {
  // Check query parameter
  if (req.query?.site && typeof req.query.site === 'string') {
    return req.query.site
  }

  // Check custom header
  const siteHeader = req.headers?.get('x-site-id')
  if (siteHeader) {
    return siteHeader
  }

  // Check session/context
  if (req.context?.site) {
    return req.context.site as string
  }

  return null
}

/**
 * Filter content by user's assigned sites
 * Returns a Where query constraint
 */
export function getSiteScopeConstraint(user: User | null | undefined): Where | boolean {
  if (!user) {
    return false // No access for unauthenticated users
  }

  const permissions = resolvePermissions(user)

  // Super admins can see all sites
  if (permissions[PermissionFlag.MANAGE_SITES]) {
    return true
  }

  if (permissions.assignedSites.length === 0 || permissions.allowedLocales.length === 0) {
    return false // No sites or locales assigned
  }

  const siteFilter =
    permissions.assignedSites.length === 1
      ? { site: { equals: permissions.assignedSites[0] } }
      : {
          site: {
            in: permissions.assignedSites,
          },
        }

  const localeFilter =
    permissions.allowedLocales.length === 1
      ? { locale: { equals: permissions.allowedLocales[0] } }
      : {
          locale: {
            in: permissions.allowedLocales,
          },
        }

  return {
    and: [siteFilter, localeFilter],
  }
}

/**
 * Validate that a user has access to a specific site
 * Throws error if no access
 */
export function validateSiteAccess(
  user: User | null | undefined,
  siteId: string,
): void {
  if (!user) {
    throw new Error('Authentication required')
  }

  if (!hasSiteAccess(user, siteId)) {
    throw new Error(`Access denied to site: ${siteId}`)
  }
}

/**
 * Get all sites a user has access to
 */
export function getUserSites(user: User | null | undefined): string[] {
  if (!user) return []
  const permissions = resolvePermissions(user)
  return permissions.assignedSites
}
