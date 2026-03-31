import type { CollectionConfig, Field } from 'payload'
import { createAccess, updateAccess, deleteAccess } from '@/access'
import { CalloutBlock } from '@/blocks/CalloutBlock'
import { FAQBlock } from '@/blocks/FAQBlock'
import { MediaBlock } from '@/blocks/MediaBlock'
import { RichTextBlock } from '@/blocks/RichTextBlock'
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

export const HelpArticles: CollectionConfig<'help-articles'> = {
  slug: 'help-articles',
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
    createSlugField('help-articles'),
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'help-categories',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      localized: true,
      admin: {
        description: 'Short summary used in search and list views',
      },
    },
    {
      name: 'content',
      type: 'blocks',
      blocks: [RichTextBlock, MediaBlock, CalloutBlock, FAQBlock, VideoEmbedBlock],
      localized: true,
      required: true,
    },
    {
      name: 'relatedArticles',
      type: 'relationship',
      relationTo: 'help-articles',
      hasMany: true,
      admin: {
        description: 'Optional related help topics for cross-linking',
      },
    },
    {
      name: 'keywords',
      type: 'text',
      hasMany: true,
      localized: true,
    },
    {
      name: 'popularity',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Internal counter used to sort related/helpful content (updated on view)',
        position: 'sidebar',
      },
      index: true,
    },
    {
      name: 'lastViewedAt',
      type: 'date',
      admin: {
        description: 'Internal timestamp updated when this article is viewed',
        position: 'sidebar',
      },
      index: true,
    },
    ...seoFields,
    siteField,
    localeField,
    ...workflowFields,
  ] satisfies Field[],
}
