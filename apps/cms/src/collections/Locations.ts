import type { CollectionConfig, Field } from 'payload'
import { createAccess, deleteAccess, updateAccess } from '@/access'
import { createSiteFilteredAccess } from '@/admin/utils/siteFilterOptions'
import { createSlugField } from '@/fields/slugField'
import { localeField } from '@/fields/localeField'
import { siteField } from '@/fields/siteField'
import { workflowFields } from '@/fields/workflowFields'
import { triggerRebuild } from '@/hooks/triggerRebuild'

export const Locations: CollectionConfig<'locations'> = {
  slug: 'locations',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'city', 'state', 'site', 'status', 'updatedAt'],
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
    createSlugField('locations'),
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'street',
      type: 'text',
      localized: true,
    },
    {
      name: 'city',
      type: 'text',
      localized: true,
    },
    {
      name: 'state',
      type: 'text',
      localized: true,
    },
    {
      name: 'zip',
      type: 'text',
    },
    {
      name: 'country',
      type: 'text',
      localized: true,
    },
    {
      name: 'mapUrl',
      type: 'text',
      admin: {
        description: 'Optional Google Maps URL',
      },
    },
    {
      name: 'businessHours',
      type: 'textarea',
      localized: true,
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

