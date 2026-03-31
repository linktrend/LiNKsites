import type { CollectionConfig, Field } from 'payload'
import { createAccess, updateAccess, deleteAccess } from '@/access'
import { localeField } from '@/fields/localeField'
import { siteField } from '@/fields/siteField'
import { createSlugField } from '@/fields/slugField'
import { workflowFields } from '@/fields/workflowFields'
import { createSiteFilteredAccess } from '@/admin/utils/siteFilterOptions'

export const VideoCategories: CollectionConfig<'video-categories'> = {
  slug: 'video-categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'parent', 'site'],
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
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    createSlugField('video-categories'),
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'video-categories',
      admin: {
        description: 'Parent category for hierarchical organization',
      },
    },
    siteField,
    localeField,
    ...workflowFields,
  ] satisfies Field[],
}
