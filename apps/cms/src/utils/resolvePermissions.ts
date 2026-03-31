import type { PayloadRequest } from 'payload'
import type { User } from '@/payload-types'
import { PermissionFlag, type RolePermissions, defaultRolePermissions } from '@/utils/permissions'

type UserWithLocales = User & { allowedLocales?: unknown[] }
type RequestUser = User | PayloadRequest['user'] | null | undefined

export interface SitePermissionOverride {
  site: string
  permissions: Partial<RolePermissions>
}

export interface ResolvedPermissions extends RolePermissions {
  assignedSites: string[]
  allowedLocales: string[]
}

/**
 * Resolves effective permissions for a user by merging role defaults with per-site overrides
 * @param user - The user object with roles and assignedSites
 * @param siteId - Optional site ID to check site-specific permissions
 * @returns Resolved permissions object
 */
export function resolvePermissions(
  user: RequestUser,
  siteId?: string,
): ResolvedPermissions {
  if (!user) {
    return {
      [PermissionFlag.READ]: false,
      [PermissionFlag.CREATE]: false,
      [PermissionFlag.UPDATE]: false,
      [PermissionFlag.DELETE]: false,
      [PermissionFlag.PUBLISH]: false,
      [PermissionFlag.APPROVE]: false,
      [PermissionFlag.SUBMIT_FOR_REVIEW]: false,
      [PermissionFlag.MANAGE_USERS]: false,
      [PermissionFlag.MANAGE_ROLES]: false,
      [PermissionFlag.MANAGE_SITES]: false,
      assignedSites: [],
      allowedLocales: [],
    }
  }

  // Start with base permissions (all false)
  const permissions: RolePermissions = {
    [PermissionFlag.READ]: false,
    [PermissionFlag.CREATE]: false,
    [PermissionFlag.UPDATE]: false,
    [PermissionFlag.DELETE]: false,
    [PermissionFlag.PUBLISH]: false,
    [PermissionFlag.APPROVE]: false,
    [PermissionFlag.SUBMIT_FOR_REVIEW]: false,
    [PermissionFlag.MANAGE_USERS]: false,
    [PermissionFlag.MANAGE_ROLES]: false,
    [PermissionFlag.MANAGE_SITES]: false,
  }

  // Merge permissions from all assigned roles
  const userWithLocales = user as UserWithLocales
  const rolesSource = (user as { roles?: unknown[] } | null)?.roles
  const roles = Array.isArray(rolesSource) ? rolesSource : []
  roles.forEach((role: unknown) => {
    const roleName =
      typeof role === 'object' &&
      role !== null &&
      'name' in role &&
      typeof (role as { name?: unknown }).name === 'string'
        ? (role as { name: string }).name
        : typeof role === 'string'
          ? role
          : undefined
    if (roleName && defaultRolePermissions[roleName]) {
      const rolePerms = defaultRolePermissions[roleName]
      Object.keys(rolePerms).forEach((key) => {
        const permKey = key as PermissionFlag
        // Use OR logic - if any role grants permission, user has it
        permissions[permKey] = permissions[permKey] || rolePerms[permKey]
      })
    }
  })

  // Extract assigned sites
  const assignedSitesSource = (user as { assignedSites?: unknown[] } | null)?.assignedSites
  const assignedSites = Array.isArray(assignedSitesSource)
    ? assignedSitesSource
        .map((site: unknown) => {
          if (typeof site === 'string') return site
          if (typeof site === 'number') return String(site)
          if (typeof site === 'object' && site && 'id' in site && (site as { id?: unknown }).id) {
            return String((site as { id?: unknown }).id)
          }
          return null
        })
        .filter((value): value is string => Boolean(value))
    : []

  const allowedLocales = Array.isArray(userWithLocales.allowedLocales)
    ? userWithLocales.allowedLocales
        .map((locale: unknown) => {
          if (typeof locale === 'string') return locale
          if (typeof locale === 'number') return String(locale)
          if (locale && typeof locale === 'object' && 'code' in locale && typeof locale.code === 'string') {
            return locale.code
          }
          if (locale && typeof locale === 'object' && 'value' in locale && typeof locale.value === 'string') {
            return locale.value
          }
          return null
        })
        .filter((value: string | null): value is string => Boolean(value))
    : []

  // Apply site-specific permission overrides if siteId is provided
  if (siteId && Array.isArray(assignedSitesSource)) {
    assignedSitesSource.forEach((siteAssignment: unknown) => {
      const siteObject =
        typeof siteAssignment === 'object' && siteAssignment !== null
          ? (siteAssignment as { id?: unknown; permissionOverrides?: unknown })
          : null
      const siteIdMatch = siteObject?.id !== undefined && String(siteObject.id) === siteId

      if (siteIdMatch && siteObject?.permissionOverrides) {
        const overrides = Array.isArray(siteObject.permissionOverrides)
          ? siteObject.permissionOverrides
          : []
        overrides.forEach((override: unknown) => {
          if (
            override &&
            typeof override === 'object' &&
            'permissions' in override &&
            (override as { permissions?: unknown }).permissions
          ) {
            const permissionGroup = (override as { permissions: Partial<RolePermissions> }).permissions
            Object.keys(permissionGroup).forEach((key) => {
              const permKey = key as PermissionFlag
              const overrideValue = permissionGroup[permKey]
              if (overrideValue !== undefined) {
                permissions[permKey] = overrideValue
              }
            })
          }
        })
      }
    })
  }

  return {
    ...permissions,
    assignedSites,
    allowedLocales,
  }
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  user: RequestUser,
  permission: PermissionFlag,
  siteId?: string,
): boolean {
  const permissions = resolvePermissions(user, siteId)
  return permissions[permission]
}

/**
 * Check if user has access to a specific site
 */
export function hasSiteAccess(user: RequestUser, siteId: string): boolean {
  if (!user) return false
  const permissions = resolvePermissions(user)
  // Super admins have access to all sites
  if (permissions[PermissionFlag.MANAGE_SITES]) return true
  return permissions.assignedSites.includes(siteId)
}

/**
 * Check if user has access to a specific locale
 */
export function hasLocaleAccess(user: RequestUser, locale: string): boolean {
  if (!user) return false
  const permissions = resolvePermissions(user)
  if (permissions[PermissionFlag.MANAGE_SITES]) return true
  if (!locale) return false
  if (permissions.allowedLocales.length === 0) return false
  return permissions.allowedLocales.includes(locale)
}
