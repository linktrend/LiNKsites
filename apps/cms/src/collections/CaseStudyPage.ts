import type { CollectionConfig, Field } from 'payload'
import { createAccess, updateAccess, deleteAccess } from '@/access'
import { CalloutBlock } from '@/blocks/CalloutBlock'
import { HeroBlock } from '@/blocks/HeroBlock'
import { MediaBlock } from '@/blocks/MediaBlock'
import { RichTextBlock } from '@/blocks/RichTextBlock'
import { localeField } from '@/fields/localeField'
import { seoFields } from '@/fields/seoFields'
import { siteField } from '@/fields/siteField'
import { createSlugField } from '@/fields/slugField'
import { workflowFields } from '@/fields/workflowFields'
import { injectDefaultSEO } from '@/hooks/injectDefaultSEO'
import { triggerRebuild } from '@/hooks/triggerRebuild'
import { createSiteFilteredAccess } from '@/admin/utils/siteFilterOptions'

export const CaseStudyPage: CollectionConfig<'case-study-pages'> = {
  slug: 'case-study-pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'client', 'category', 'site', 'status', 'updatedAt'],
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
    createSlugField('case-study-pages'),
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'case-study-categories',
      required: true,
    },
    {
      name: 'client',
      type: 'text',
      required: true,
    },
    {
      name: 'industry',
      type: 'text',
      localized: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'challenge',
      type: 'richText',
      localized: true,
    },
    {
      name: 'solution',
      type: 'richText',
      localized: true,
    },
    {
      name: 'results',
      type: 'array',
      fields: [
        {
          name: 'metric',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'value',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'content',
      type: 'blocks',
      blocks: [HeroBlock, RichTextBlock, MediaBlock, CalloutBlock],
      localized: true,
    },
    ...seoFields,
    siteField,
    localeField,
    ...workflowFields,
  ] satisfies Field[],
}
