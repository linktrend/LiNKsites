import type { CollectionConfig, Field } from 'payload'
import { createAccess, updateAccess, deleteAccess } from '@/access'
import { RichTextBlock } from '@/blocks/RichTextBlock'
import { CalloutBlock } from '@/blocks/CalloutBlock'
import { MediaBlock } from '@/blocks/MediaBlock'
import { RelatedContentBlock } from '@/blocks/RelatedContentBlock'
import { VideoEmbedBlock } from '@/blocks/VideoEmbedBlock'
import { localeField } from '@/fields/localeField'
import { seoFields } from '@/fields/seoFields'
import { siteField } from '@/fields/siteField'
import { createSlugField } from '@/fields/slugField'
import { workflowFields } from '@/fields/workflowFields'
import { calculateReadTime } from '@/hooks/calculateReadTime'
import { injectDefaultSEO } from '@/hooks/injectDefaultSEO'
import { triggerRebuild } from '@/hooks/triggerRebuild'
import { createSiteFilteredAccess } from '@/admin/utils/siteFilterOptions'

export const Articles: CollectionConfig<'articles'> = {
  slug: 'articles',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'site', 'status', 'publishedAt'],
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
    beforeChange: [calculateReadTime, injectDefaultSEO],
    afterChange: [triggerRebuild],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    createSlugField('articles'),
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'article-categories',
      required: true,
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      localized: true,
      admin: {
        description: 'Short summary shown in listings and previews',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'content',
      type: 'blocks',
      blocks: [RichTextBlock, MediaBlock, CalloutBlock, VideoEmbedBlock, RelatedContentBlock],
      localized: true,
      required: true,
    },
    {
      name: 'readTime',
      type: 'number',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Estimated reading time in minutes',
      },
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
