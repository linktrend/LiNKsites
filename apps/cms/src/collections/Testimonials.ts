import type { CollectionConfig, Field } from 'payload'
import { createAccess, updateAccess, deleteAccess } from '@/access'
import { createSlugField } from '@/fields/slugField'
import { localeField } from '@/fields/localeField'
import { siteField } from '@/fields/siteField'
import { workflowFields } from '@/fields/workflowFields'
import { triggerRebuild } from '@/hooks/triggerRebuild'
import { createSiteFilteredAccess } from '@/admin/utils/siteFilterOptions'

export const Testimonials: CollectionConfig<'testimonials'> = {
  slug: 'testimonials',
  admin: {
    useAsTitle: 'author',
    defaultColumns: ['author', 'role', 'site', 'status', 'updatedAt'],
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
      name: 'author',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'role',
      type: 'text',
      localized: true,
    },
    createSlugField('testimonials'),
    {
      name: 'quote',
      type: 'richText',
      required: true,
      localized: true,
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
    },
    siteField,
    localeField,
    ...workflowFields,
  ] satisfies Field[],
}
