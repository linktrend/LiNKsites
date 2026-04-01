import type { CollectionConfig } from 'payload'
import { createAccess, updateAccess, deleteAccess } from '@/access'
import { ArticlesBlock } from '@/blocks/ArticlesBlock'
import { CalloutBlock } from '@/blocks/CalloutBlock'
import { CaseStudiesBlock } from '@/blocks/CaseStudiesBlock'
import { CTABlock } from '@/blocks/CTABlock'
import { FAQBlock } from '@/blocks/FAQBlock'
import { FeaturesBlock } from '@/blocks/FeaturesBlock'
import { HeroBlock } from '@/blocks/HeroBlock'
import { MediaBlock } from '@/blocks/MediaBlock'
import { NewsletterBlock } from '@/blocks/NewsletterBlock'
import { OfferShowcaseBlock } from '@/blocks/OfferShowcaseBlock'
import { PricingTableBlock } from '@/blocks/PricingTableBlock'
import { RelatedContentBlock } from '@/blocks/RelatedContentBlock'
import { RichTextBlock } from '@/blocks/RichTextBlock'
import { TestimonialBlock } from '@/blocks/TestimonialBlock'
import { TestimonialsBlock } from '@/blocks/TestimonialsBlock'
import { VideoEmbedBlock } from '@/blocks/VideoEmbedBlock'
import { createSiteFilteredAccess } from '@/admin/utils/siteFilterOptions'
import { localeField } from '@/fields/localeField'
import { siteField } from '@/fields/siteField'
import { workflowFields } from '@/fields/workflowFields'
import { triggerRebuild } from '@/hooks/triggerRebuild'
import { LocationsBlock } from '@/blocks/LocationsBlock'
import { TeamMembersBlock } from '@/blocks/TeamMembersBlock'
import { TrustFeedBlock } from '@/blocks/TrustFeedBlock'

/**
 * Unified Pages collection - aggregates all page types
 * This provides a single /api/pages endpoint for the frontend
 */
export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'pageType', 'site', 'status'],
    description: 'Unified pages collection - aggregates all page types',
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
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'URL-friendly identifier (e.g., "home", "about", "contact")',
      },
    },
    {
      name: 'pageType',
      type: 'select',
      required: true,
      options: [
        { label: 'Home', value: 'home' },
        { label: 'About', value: 'about' },
        { label: 'Contact', value: 'contact' },
        { label: 'Pricing', value: 'pricing' },
        { label: 'Privacy', value: 'privacy' },
        { label: 'Terms', value: 'terms' },
        { label: 'FAQ', value: 'faq' },
        { label: 'Careers', value: 'careers' },
        { label: 'Landing', value: 'landing' },
        { label: 'Generic', value: 'generic' },
      ],
      admin: {
        description: 'Type of page for frontend routing',
      },
    },
    siteField,
    localeField,
    {
      name: 'content',
      type: 'blocks',
      blocks: [
        HeroBlock,
        FeaturesBlock,
        PricingTableBlock,
        TestimonialBlock,
        TestimonialsBlock,
        CTABlock,
        FAQBlock,
        RichTextBlock,
        MediaBlock,
        ArticlesBlock,
        CaseStudiesBlock,
        OfferShowcaseBlock,
        NewsletterBlock,
        CalloutBlock,
        RelatedContentBlock,
        VideoEmbedBlock,
        LocationsBlock,
        TeamMembersBlock,
        TrustFeedBlock,
      ],
      localized: true,
      admin: {
        description: 'Page content composed of blocks',
      },
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    ...workflowFields,
  ],
}
