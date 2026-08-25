import type { CollectionConfig, Field } from 'payload'
import { createAccess, deleteAccess, updateAccess } from '@/access'
import { createSiteFilteredAccess } from '@/admin/utils/siteFilterOptions'
import { localeField } from '@/fields/localeField'
import { provenanceFields } from '@/fields/provenanceFields'
import { siteField } from '@/fields/siteField'
import { createSlugField } from '@/fields/slugField'
import { workflowFields } from '@/fields/workflowFields'
import { triggerRebuild } from '@/hooks/triggerRebuild'

export const ServiceAreas: CollectionConfig = {
  slug: 'service-areas',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'region', 'site', 'status', 'updatedAt'],
    description: 'Tenant/locale-safe geographic service areas. Distinct from Locations.',
  },
  access: {
    read: createSiteFilteredAccess(),
    create: createAccess,
    update: updateAccess,
    delete: deleteAccess,
  },
  versions: { drafts: true },
  hooks: {
    afterChange: [triggerRebuild],
  },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    createSlugField('service-areas'),
    { name: 'region', type: 'text', localized: true },
    { name: 'coverageSummary', type: 'textarea', localized: true },
    {
      name: 'servedLocations',
      type: 'relationship',
      relationTo: 'locations',
      hasMany: true,
    },
    siteField,
    localeField,
    ...workflowFields,
    ...provenanceFields,
  ] satisfies Field[],
}
