import type { CollectionConfig, Field } from 'payload'
import { createAccess, updateAccess, deleteAccess } from '@/access'
import { RichTextBlock } from '@/blocks/RichTextBlock'
import { localeField } from '@/fields/localeField'
import { seoFields } from '@/fields/seoFields'
import { siteField } from '@/fields/siteField'
import { createSlugField } from '@/fields/slugField'
import { workflowFields } from '@/fields/workflowFields'
import { injectDefaultSEO } from '@/hooks/injectDefaultSEO'
import { triggerRebuild } from '@/hooks/triggerRebuild'
import { createSiteFilteredAccess } from '@/admin/utils/siteFilterOptions'

export const CookiePolicyPage: CollectionConfig<'cookie-policy-pages'> = {
  slug: 'cookie-policy-pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'site', 'status', 'updatedAt'],
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
    beforeChange: [injectDefaultSEO],
    afterChange: [triggerRebuild],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    createSlugField('cookie-policy-pages'),
    {
      name: 'content',
      type: 'blocks',
      blocks: [RichTextBlock],
      localized: true,
      required: true,
    },
    {
      name: 'lastUpdated',
      type: 'date',
      admin: {
        description: 'Date this policy was last updated',
      },
    },
    ...seoFields,
    siteField,
    localeField,
    ...workflowFields,
  ] satisfies Field[],
}

