import type { CollectionConfig, Field } from 'payload'
import { createAccess, updateAccess, deleteAccess } from '@/access'
import { localeField } from '@/fields/localeField'
import { siteField } from '@/fields/siteField'
import { workflowFields } from '@/fields/workflowFields'
import { triggerRebuild } from '@/hooks/triggerRebuild'
import { cacheInvalidatePattern } from '@/payload/utils/cache'
import { createSiteFilteredAccess } from '@/admin/utils/siteFilterOptions'

export const SiteSettings: CollectionConfig<'site-settings'> = {
  slug: 'site-settings',
  admin: {
    useAsTitle: 'site',
    defaultColumns: ['site', 'autoApprove', 'status', 'updatedAt'],
  },
  access: {
    read: createSiteFilteredAccess(),
    create: createAccess,
    update: updateAccess,
    delete: deleteAccess,
  },
  versions: {
    drafts: true,
  },
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
    {
      ...siteField,
    },
    localeField,
    {
      name: 'templateId',
      type: 'text',
      required: true,
      defaultValue: 'marketing-smb-v1',
      admin: {
        description: 'Which frontend template module should render this site',
        position: 'sidebar',
      },
    },
    {
      name: 'theme',
      type: 'group',
      label: 'Theme',
      fields: [
        {
          name: 'primaryColor',
          type: 'text',
          label: 'Primary Color Hex',
          defaultValue: '#002244',
        },
        {
          name: 'secondaryColor',
          type: 'text',
          label: 'Secondary Color Hex',
          defaultValue: '#00bcd4',
        },
        {
          name: 'accentColor',
          type: 'text',
          label: 'Accent Color Hex',
          defaultValue: '#ff5722',
        },
      ],
    },
    {
      name: 'branding',
      type: 'group',
      fields: [
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'favicon',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'metadataDefaults',
      type: 'group',
      fields: [
        {
          name: 'titleSuffix',
          type: 'text',
          defaultValue: '| LiNKtrend',
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
        },
      ],
    },
    {
      name: 'autoApprove',
      type: 'checkbox',
      label: 'Auto-approve Editor submissions',
      defaultValue: false,
    },
    ...workflowFields,
  ] satisfies Field[],
}
