import type { CollectionConfig, Field } from 'payload'
import { createAccess, updateAccess, deleteAccess } from '@/access'
import { CalloutBlock } from '@/blocks/CalloutBlock'
import { RelatedContentBlock } from '@/blocks/RelatedContentBlock'
import { RichTextBlock } from '@/blocks/RichTextBlock'
import { localeField } from '@/fields/localeField'
import { seoFields } from '@/fields/seoFields'
import { siteField } from '@/fields/siteField'
import { createSlugField } from '@/fields/slugField'
import { workflowFields } from '@/fields/workflowFields'
import { injectDefaultSEO } from '@/hooks/injectDefaultSEO'
import { triggerRebuild } from '@/hooks/triggerRebuild'
import { createSiteFilteredAccess } from '@/admin/utils/siteFilterOptions'

export const Videos: CollectionConfig<'videos'> = {
  slug: 'videos',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'youtubeId', 'category', 'site', 'status', 'publishedAt'],
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
    createSlugField('videos'),
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'video-categories',
      required: true,
    },
    {
      name: 'youtubeId',
      type: 'text',
      required: true,
      admin: {
        description: 'YouTube video ID or full URL',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      localized: true,
    },
    {
      name: 'content',
      type: 'blocks',
      blocks: [RichTextBlock, CalloutBlock, RelatedContentBlock],
      localized: true,
      required: true,
    },
    {
      name: 'transcript',
      type: 'richText',
      localized: true,
      admin: {
        description: 'Optional transcript for accessibility and SEO',
      },
    },
    {
      name: 'duration',
      type: 'number',
      admin: {
        description: 'Duration in seconds',
        position: 'sidebar',
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      localized: true,
    },
    ...seoFields,
    siteField,
    localeField,
    ...workflowFields,
  ] satisfies Field[],
}
