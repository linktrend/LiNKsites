import type { CollectionConfig, Field } from 'payload'
import { createAccess, updateAccess, deleteAccess } from '@/access'
import { RelatedContentBlock } from '@/blocks/RelatedContentBlock'
import { RichTextBlock } from '@/blocks/RichTextBlock'
import { localeField } from '@/fields/localeField'
import { seoFields } from '@/fields/seoFields'
import { siteField } from '@/fields/siteField'
import { createSlugField } from '@/fields/slugField'
import { workflowFields } from '@/fields/workflowFields'
import { injectDefaultSEO } from '@/hooks/injectDefaultSEO'
import { triggerRebuild } from '@/hooks/triggerRebuild'
import { videoIngestion } from '@/hooks/videoIngestion'
import { createSiteFilteredAccess } from '@/admin/utils/siteFilterOptions'

export const VideoPage: CollectionConfig<'video-pages'> = {
  slug: 'video-pages',
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
    afterChange: [videoIngestion, triggerRebuild],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    createSlugField('video-pages'),
    {
      name: 'youtubeId',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'YouTube video ID or full URL',
      },
    },
    {
      name: 'autoIngest',
      type: 'checkbox',
      label: 'Auto-ingest metadata from YouTube',
      defaultValue: true,
      admin: {
        description: 'Automatically fetch video metadata from YouTube',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'video-categories',
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'thumbnail',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Auto-fetched from YouTube',
      },
    },
    {
      name: 'duration',
      type: 'number',
      admin: {
        readOnly: true,
        description: 'Duration in seconds (auto-fetched)',
      },
    },
    {
      name: 'transcript',
      type: 'richText',
      localized: true,
      admin: {
        description: 'Video transcript for accessibility and SEO',
      },
    },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      localized: true,
    },
    {
      name: 'viewCount',
      type: 'number',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'content',
      type: 'blocks',
      blocks: [RichTextBlock, RelatedContentBlock],
      localized: true,
    },
    {
      name: 'autoIngested',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        readOnly: true,
        description: 'Was this video auto-ingested from a playlist?',
        position: 'sidebar',
      },
    },
    ...seoFields,
    siteField,
    localeField,
    ...workflowFields,
  ] satisfies Field[],
}
