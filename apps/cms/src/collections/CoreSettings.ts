import type { CollectionConfig, Field } from 'payload'
import { createAccess, deleteAccess, updateAccess } from '@/access'
import { createSiteFilteredAccess } from '@/admin/utils/siteFilterOptions'
import { localeField } from '@/fields/localeField'
import { provenanceFields } from '@/fields/provenanceFields'
import { siteField } from '@/fields/siteField'
import { workflowFields } from '@/fields/workflowFields'
import { LS03_CAPABILITY_PLANS, LS03_CONTENT_MODES } from '@/payload/ls03/semanticContract'
import { triggerRebuild } from '@/hooks/triggerRebuild'
import { cacheInvalidatePattern } from '@/payload/utils/cache'

export const CoreSettings: CollectionConfig = {
  slug: 'core-settings',
  admin: {
    useAsTitle: 'site',
    defaultColumns: ['site', 'contentMode', 'capabilityPlanId', 'status', 'updatedAt'],
    description: 'Typed per-site core settings. Free-text template IDs are deprecated projections only.',
  },
  access: {
    read: createSiteFilteredAccess(),
    create: createAccess,
    update: updateAccess,
    delete: deleteAccess,
  },
  versions: { drafts: true },
  hooks: {
    afterChange: [
      async ({ doc }) => {
        const siteValue = (doc as Record<string, unknown>).site as string | { id?: string } | undefined
        const siteId =
          typeof siteValue === 'string'
            ? siteValue
            : typeof siteValue?.id === 'string'
              ? siteValue.id
              : undefined
        if (siteId) {
          await cacheInvalidatePattern(`site:${siteId}`)
        }
        return doc
      },
      triggerRebuild,
    ],
  },
  fields: [
    siteField,
    localeField,
    {
      name: 'contentMode',
      type: 'select',
      required: true,
      options: LS03_CONTENT_MODES.map((value) => ({ label: value, value })),
      admin: {
        description: 'Product/service/hybrid/neither production mode. Products and Services collections stay distinct.',
      },
    },
    {
      name: 'capabilityPlanId',
      type: 'select',
      required: true,
      options: LS03_CAPABILITY_PLANS.map((value) => ({ label: `Plan ${value}`, value })),
    },
    {
      name: 'templateAdoption',
      type: 'relationship',
      relationTo: 'template-adoptions',
    },
    {
      name: 'entitlementSnapshot',
      type: 'relationship',
      relationTo: 'entitlement-snapshots',
    },
    {
      name: 'deprecatedTemplateIdProjection',
      type: 'text',
      admin: {
        description: 'Deprecated free-text template ID projection. Do not treat as canonical adoption identity.',
        readOnly: true,
      },
    },
    {
      name: 'brand',
      type: 'group',
      fields: [
        { name: 'legalName', type: 'text', required: true, localized: true },
        { name: 'shortName', type: 'text', localized: true },
        { name: 'primaryActionLabel', type: 'text', localized: true },
        { name: 'primaryActionHref', type: 'text' },
      ],
    },
    ...workflowFields,
    ...provenanceFields,
  ] satisfies Field[],
}
