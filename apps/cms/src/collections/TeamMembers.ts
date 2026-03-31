import type { CollectionConfig, Field } from 'payload'
import { createAccess, deleteAccess, updateAccess } from '@/access'
import { createSiteFilteredAccess } from '@/admin/utils/siteFilterOptions'
import { localeField } from '@/fields/localeField'
import { siteField } from '@/fields/siteField'
import { workflowFields } from '@/fields/workflowFields'
import { triggerRebuild } from '@/hooks/triggerRebuild'
import { createSlugField } from '@/fields/slugField'

export const TeamMembers: CollectionConfig<'team-members'> = {
  slug: 'team-members',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'site', 'status', 'updatedAt'],
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
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    createSlugField('team-members'),
    {
      name: 'role',
      type: 'text',
      localized: true,
    },
    {
      name: 'bio',
      type: 'richText',
      localized: true,
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'social',
      type: 'group',
      fields: [
        { name: 'linkedin', type: 'text' },
        { name: 'twitter', type: 'text' },
        { name: 'website', type: 'text' },
      ],
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

