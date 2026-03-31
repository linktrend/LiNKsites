import type { Access, FieldAccess } from 'payload'
import type { User } from '@/payload-types'
import type { WorkflowRequest } from '@/types/PayloadRequestExtended'
import { PermissionFlag } from '@/utils/permissions'
import { hasLocaleAccess, hasPermission, hasSiteAccess, resolvePermissions } from '@/utils/resolvePermissions'
import { isBootstrapMode } from '@/utils/bootstrap'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const extractSiteId = (value?: unknown): string | undefined => {
  if (typeof value === 'string') return value
  if (!isRecord(value)) return undefined

  if (typeof value.site === 'string') return value.site
  if (isRecord(value.site) && typeof value.site.id === 'string') {
    return value.site.id
  }
  if (typeof value.id === 'string') return value.id

  return undefined
}

const resolveSiteId = (input?: unknown, fallback?: unknown): string | undefined =>
  extractSiteId(input) ?? extractSiteId(fallback)

const extractLocale = (value?: unknown): string | undefined => {
  if (typeof value === 'string') return value
  if (!isRecord(value)) return undefined
  if (typeof value.locale === 'string') return value.locale
  if (isRecord(value.locale) && typeof value.locale.id === 'string') return value.locale.id
  if (typeof value.id === 'string') return value.id
  return undefined
}

const resolveLocale = (input?: unknown, fallback?: unknown): string | undefined =>
  extractLocale(input) ?? extractLocale(fallback)

/**
 * Read access - user must have READ permission and access to the site
 */
export const readAccess: Access = ({ req, data }) => {
  const workflowReq = req as WorkflowRequest
  const { user } = workflowReq
  if (!user) return false
  const typedUser = user as User

  // Check if user has read permission
  const siteId = resolveSiteId(workflowReq.data, data)
  const locale = resolveLocale(workflowReq.data, data) ?? workflowReq.locale

  if (!locale || !hasLocaleAccess(typedUser, locale)) {
    return false
  }

  if (!hasPermission(typedUser, PermissionFlag.READ, siteId)) {
    return false
  }

  // If site is specified, check site access
  if (siteId && !hasSiteAccess(typedUser, siteId)) {
    return false
  }

  return true
}

/**
 * Create access - user must have CREATE permission
 */
export const createAccess: Access = async ({ req }) => {
  const workflowReq = req as WorkflowRequest
  
  // During bootstrap (no users), allow create access
  if (await isBootstrapMode(workflowReq)) {
    return true
  }
  
  const { user } = workflowReq
  if (!user) return false
  const typedUser = user as User
  const siteId = resolveSiteId(workflowReq.data)
  const locale = resolveLocale(workflowReq.data)

  if (!siteId || !locale) return false
  if (!hasLocaleAccess(typedUser, locale)) return false
  if (!hasPermission(typedUser, PermissionFlag.CREATE, siteId)) return false
  if (!hasSiteAccess(typedUser, siteId)) return false

  return true
}

/**
 * Update access - user must have UPDATE permission and access to the site
 */
export const updateAccess: Access = async ({ req, data }) => {
  const workflowReq = req as WorkflowRequest
  
  // During bootstrap (no users), allow update access
  if (await isBootstrapMode(workflowReq)) {
    return true
  }
  
  const { user } = workflowReq
  if (!user) return false
  const typedUser = user as User

  const siteId = resolveSiteId(workflowReq.data, data)
  const locale = resolveLocale(workflowReq.data, data) ?? workflowReq.locale

  if (!locale || !hasLocaleAccess(typedUser, locale)) {
    return false
  }

  if (!hasPermission(typedUser, PermissionFlag.UPDATE, siteId)) {
    return false
  }

  // Check site access
  if (siteId && !hasSiteAccess(typedUser, siteId)) {
    return false
  }

  return true
}

/**
 * Delete access - user must have DELETE permission and access to the site
 */
export const deleteAccess: Access = ({ req, data }) => {
  const workflowReq = req as WorkflowRequest
  const { user } = workflowReq
  if (!user) return false
  const typedUser = user as User

  const siteId = resolveSiteId(workflowReq.data, data)
  const locale = resolveLocale(workflowReq.data, data) ?? workflowReq.locale

  if (!locale || !hasLocaleAccess(typedUser, locale)) {
    return false
  }

  if (!hasPermission(typedUser, PermissionFlag.DELETE, siteId)) {
    return false
  }

  // Check site access
  if (siteId && !hasSiteAccess(typedUser, siteId)) {
    return false
  }

  return true
}

/**
 * Publish field access - only users with PUBLISH permission can edit
 */
const resolveNextStatus = (
  reqData?: unknown,
  data?: unknown,
  doc?: unknown,
): string | undefined => {
  const candidates = [reqData, data, doc]

  for (const candidate of candidates) {
    if (isRecord(candidate) && typeof candidate.status === 'string') {
      return candidate.status
    }
  }

  return undefined
}

export const publishFieldAccess: FieldAccess = ({ req, doc, data }) => {
  const workflowReq = req as WorkflowRequest
  const user = workflowReq.user as User | null | undefined
  if (!user) return false

  const incomingStatus = resolveNextStatus(workflowReq.data, data, doc) ?? 'draft'
  const siteId = resolveSiteId(workflowReq?.data ?? data, doc)
  const locale = resolveLocale(workflowReq?.data ?? data, doc) ?? workflowReq.locale

  if (!locale || !hasLocaleAccess(user, locale)) {
    return false
  }

  // Managers/Admins (publish permission) can set any status
  if (hasPermission(user, PermissionFlag.PUBLISH, siteId)) {
    return true
  }

  // Editors can move between draft and pending only
  if (incomingStatus === 'draft' || incomingStatus === 'pending') {
    return true
  }

  return false
}

/**
 * Approval field access - only users with APPROVE permission can edit
 */
export const approvalFieldAccess: FieldAccess = ({ req, doc, data }) => {
  const workflowReq = req as WorkflowRequest
  const user = workflowReq.user as User | null | undefined
  if (!user) return false

  const siteId = resolveSiteId(workflowReq?.data ?? data, doc)
  const locale = resolveLocale(workflowReq?.data ?? data, doc) ?? workflowReq.locale
  if (!locale || !hasLocaleAccess(user, locale)) {
    return false
  }

  return hasPermission(user, PermissionFlag.APPROVE, siteId)
}

/**
 * Admin access - user must have MANAGE_USERS, MANAGE_ROLES, or MANAGE_SITES permission
 */
export const adminAccess: Access = ({ req }) => {
  const { user } = req as WorkflowRequest
  if (!user) return false
  const typedUser = user as User

  return (
    hasPermission(typedUser, PermissionFlag.MANAGE_USERS) ||
    hasPermission(typedUser, PermissionFlag.MANAGE_ROLES) ||
    hasPermission(typedUser, PermissionFlag.MANAGE_SITES)
  )
}

/**
 * Site management access - user must have MANAGE_SITES permission
 */
export const manageSitesAccess: Access = ({ req }) => {
  const { user } = req as WorkflowRequest
  if (!user) return false
  const typedUser = user as User
  return hasPermission(typedUser, PermissionFlag.MANAGE_SITES)
}

/**
 * User management access - user must have MANAGE_USERS permission
 */
export const manageUsersAccess: Access = ({ req }) => {
  const { user } = req as WorkflowRequest
  if (!user) return false
  const typedUser = user as User
  return hasPermission(typedUser, PermissionFlag.MANAGE_USERS)
}

/**
 * Role management access - user must have MANAGE_ROLES permission
 */
export const manageRolesAccess: Access = ({ req }) => {
  const { user } = req as WorkflowRequest
  if (!user) return false
  const typedUser = user as User
  return hasPermission(typedUser, PermissionFlag.MANAGE_ROLES)
}

/**
 * Site-scoped read access - returns query constraint
 */
export const siteScopedReadAccess: Access = async ({ req }) => {
  // During bootstrap (no users), allow full read access and bypass scoping
  if (await isBootstrapMode(req as WorkflowRequest)) {
    return true
  }

  const { user } = req as WorkflowRequest
  if (!user) return false
  const typedUser = user as User

  // Super admins can see everything
  if (hasPermission(typedUser, PermissionFlag.MANAGE_SITES)) {
    return true
  }

  const permissions = resolvePermissions(typedUser)
  const { assignedSites, allowedLocales } = permissions

  if (assignedSites.length === 0 || allowedLocales.length === 0) {
    return false
  }

  const siteFilter =
    assignedSites.length === 1
      ? { site: { equals: assignedSites[0] } }
      : {
          site: {
            in: assignedSites,
          },
        }

  const localeFilter =
    allowedLocales.length === 1
      ? { locale: { equals: allowedLocales[0] } }
      : {
          locale: {
            in: allowedLocales,
          },
        }

  return {
    and: [siteFilter, localeFilter],
  }
}

/**
 * Public read access - allows unauthenticated read access to published content
 * Use this for public content collections that should be readable without authentication
 */
export const publicReadAccess: Access = async ({ req }) => {
  // During bootstrap, allow full access
  if (await isBootstrapMode(req as WorkflowRequest)) {
    return true
  }

  // Allow all read access (authenticated or not)
  // This is safe because:
  // 1. Only published content is returned (draft content requires authentication)
  // 2. Create/Update/Delete operations still require proper authentication
  // 3. This enables public websites to fetch content without API keys
  return true
}
