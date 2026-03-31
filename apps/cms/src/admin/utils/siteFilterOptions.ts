import type { Access, Where } from 'payload'
import type { User } from '@/payload-types'
import { hasPermission, resolvePermissions } from '@/utils/resolvePermissions'
import { PermissionFlag } from '@/utils/permissions'
import { isBootstrapMode } from '@/utils/bootstrap'
import type { WorkflowRequest } from '@/types/PayloadRequestExtended'

/**
 * createSiteFilteredAccess - URL-based site filtering for collection read access
 * 
 * This utility creates an access control function that reads the selected site
 * from the URL query parameter and applies it as a filter to collection queries.
 * 
 * Usage:
 * ```typescript
 * import { createSiteFilteredAccess } from '@/admin/utils/siteFilterOptions'
 * 
 * export const MyCollection: CollectionConfig = {
 *   slug: 'my-collection',
 *   access: {
 *     read: createSiteFilteredAccess(),
 *     // ... other access controls
 *   },
 *   // ... rest of config
 * }
 * ```
 * 
 * URL Parameter Strategy:
 * - ?site=<siteId> - Filter by specific site
 * - ?site=__all__ - Show all sites (admin only)
 * - No parameter - Show sites based on user's assigned sites
 */
export const createSiteFilteredAccess = (): Access => {
  return async ({ req }) => {
    // During bootstrap (no users), allow full read access
    if (await isBootstrapMode(req as WorkflowRequest)) {
      return true
    }

    const { user } = req as WorkflowRequest

    // Extract site parameter from request URL
    const url = req.url ? new URL(req.url, `http://${req.headers.get('host') || 'localhost'}`) : null
    const selectedSite = url?.searchParams.get('site')
    const requestedLocale = url?.searchParams.get('locale') ?? undefined

    const pathname = url?.pathname ?? ''
    const collectionSlug = pathname.startsWith('/api/') ? pathname.split('/')[2] : undefined

    // Only these collections are intended to be readable by public websites.
    // Everything else should require authentication.
    const PUBLIC_COLLECTIONS = new Set<string>([
      'pages',
      'navigation',
      'offers',
      'offer-pages',
      'case-studies',
      'case-study-pages',
      'articles',
      'videos',
      'video-pages',
      'testimonials',
      'locations',
      'team-members',
      'site-settings',
      'media',
      'article-categories',
      'offer-categories',
      'case-study-categories',
      'video-categories',
      'help',
      'help-articles',
      'help-categories',
      'terms-pages',
      'privacy-pages',
      'cookie-policy-pages',
      'legal',
      'faq',
      'faq-pages',
    ])

    // Collections that have a workflow/status field and must only expose published docs publicly.
    // (Media does not have a status field, and is safe to expose when site-scoped.)
    const REQUIRE_PUBLISHED_STATUS = new Set<string>([
      'pages',
      'navigation',
      'offers',
      'offer-pages',
      'case-studies',
      'case-study-pages',
      'articles',
      'videos',
      'video-pages',
      'testimonials',
      'locations',
      'team-members',
      'site-settings',
      'article-categories',
      'offer-categories',
      'case-study-categories',
      'video-categories',
      'help',
      'help-articles',
      'help-categories',
      'terms-pages',
      'privacy-pages',
      'cookie-policy-pages',
      'faq',
      'faq-pages',
    ])

    // PUBLIC WEBSITE READS (no auth): allow published reads only when a site is explicitly selected.
    // This supports the shared platform which always calls the CMS with `?site=<siteId>`.
    if (!user) {
      if (!selectedSite || selectedSite === '__all__') return false
      if (!collectionSlug || !PUBLIC_COLLECTIONS.has(collectionSlug)) return false

      const and: Where[] = [{ site: { equals: selectedSite } }]
      if (requestedLocale) and.push({ locale: { equals: requestedLocale } })
      if (REQUIRE_PUBLISHED_STATUS.has(collectionSlug)) and.push({ status: { equals: 'published' } })

      return { and }
    }

    const typedUser = user as User

    // Check if user has MANAGE_SITES permission (super admin)
    const canManageAllSites = hasPermission(typedUser, PermissionFlag.MANAGE_SITES)

    // If "All Sites" selected and user is admin, show everything
    if (selectedSite === '__all__' && canManageAllSites) {
      return true
    }

    // If a specific site is selected in URL
    if (selectedSite && selectedSite !== '__all__') {
      const permissions = resolvePermissions(typedUser)
      const { assignedSites, allowedLocales } = permissions

      // Check if user has access to the selected site
      if (!canManageAllSites && !assignedSites.includes(selectedSite)) {
        return false
      }

      // Filter by selected site and user's allowed locales
      const localeFilter =
        allowedLocales.length === 1
          ? { locale: { equals: allowedLocales[0] } }
          : {
              locale: {
                in: allowedLocales,
              },
            }

      return {
        and: [
          { site: { equals: selectedSite } },
          localeFilter,
        ],
      }
    }

    // No site parameter - use default site-scoped access
    // Super admins can see everything
    if (canManageAllSites) {
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
}
