import type { Access, CollectionConfig, Field } from 'payload'
import { manageSitesAccess } from '@/access'
import { isBootstrapMode } from '@/utils/bootstrap'
import type { WorkflowRequest } from '@/types/PayloadRequestExtended'

/**
 * Hostname -> Site mapping.
 *
 * Used by the shared platform to resolve which `siteId` (tenant) to render
 * for a request like: https://greenturf.linktrend.media
 */
export const SiteDomains: CollectionConfig<'site-domains'> = {
  slug: 'site-domains',
  admin: {
    useAsTitle: 'hostname',
    defaultColumns: ['hostname', 'site', 'primary', 'createdAt', 'updatedAt'],
    group: 'System',
  },
  access: {
    // Public read is required so websites can resolve tenant by hostname.
    // Do NOT allow anonymous listing of all hostnames.
    read: (async ({ req }) => {
      if (await isBootstrapMode(req as WorkflowRequest)) return true

      // Authenticated admin access only.
      if ((req as WorkflowRequest).user) {
        return manageSitesAccess({ req })
      }

      const url = req.url ? new URL(req.url, `http://${req.headers.get('host') || 'localhost'}`) : null
      const requestedHostname = url?.searchParams.get('where[hostname][equals]')
      if (!requestedHostname) return false

      return {
        hostname: { equals: requestedHostname.trim().toLowerCase() },
      }
    }) satisfies Access,
    create: manageSitesAccess,
    update: manageSitesAccess,
    delete: manageSitesAccess,
  },
  fields: [
    {
      name: 'hostname',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Fully qualified domain name (e.g., greenturf.linktrend.media, greenturf.com)',
      },
    },
    {
      name: 'site',
      type: 'relationship',
      relationTo: 'sites',
      required: true,
      index: true,
    },
    {
      name: 'primary',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Primary hostname for this site (used for canonical URLs)',
      },
    },
  ] satisfies Field[],
}
