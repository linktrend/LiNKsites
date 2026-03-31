import type { CollectionConfig, Field } from 'payload'
import { createAccess, updateAccess, deleteAccess } from '@/access'
import { localeField } from '@/fields/localeField'
import { createSlugField } from '@/fields/slugField'
import { siteField } from '@/fields/siteField'
import { workflowFields } from '@/fields/workflowFields'
import { triggerRebuild } from '@/hooks/triggerRebuild'
import { createSiteFilteredAccess } from '@/admin/utils/siteFilterOptions'

export const Navigation: CollectionConfig<'navigation'> = {
  slug: 'navigation',
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'navKey', 'parent', 'site', 'status'],
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
    afterChange: [triggerRebuild],
  },
  fields: [
    {
      name: 'navKey',
      type: 'select',
      required: true,
      defaultValue: 'primary',
      options: [
        { label: 'Primary', value: 'primary' },
        { label: 'Footer', value: 'footer' },
        { label: 'Secondary', value: 'secondary' },
      ],
      admin: {
        description: 'Which menu this navigation item belongs to',
        position: 'sidebar',
      },
    },
    {
      name: 'label',
      type: 'text',
      required: true,
      localized: true,
    },
    createSlugField('navigation'),
    {
      name: 'url',
      type: 'text',
      required: true,
    },
    {
      name: 'external',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Open link in a new tab',
        position: 'sidebar',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Display order',
      },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'navigation',
      admin: {
        description: 'Nest this item under another navigation entry',
      },
    },
    siteField,
    localeField,
    ...workflowFields,
  ] satisfies Field[],
}
