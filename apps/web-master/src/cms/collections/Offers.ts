// @ts-nocheck - Payload CMS types will be available after installation
import { CollectionConfig } from 'payload/types';
import { allBlocks } from '../blocks';

export const Offers: CollectionConfig = {
  slug: 'offers',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'status', 'sort_order'],
    description: 'Manage products and services offered by the company',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly identifier (e.g., ai-automation)',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Display title of the offer',
      },
    },
    {
      name: 'subtitle',
      type: 'text',
      admin: {
        description: 'Short tagline or subtitle',
      },
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Product', value: 'product' },
        { label: 'Service', value: 'service' },
      ],
      required: true,
      admin: {
        description: 'Classification: product or service',
      },
    },
    {
      name: 'short_description',
      type: 'textarea',
      admin: {
        description: 'Brief description for cards and previews',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Full description of the offer',
      },
    },
    {
      name: 'hero_content',
      type: 'group',
      admin: {
        description: 'Hero section content',
      },
      fields: [
        { name: 'title', type: 'text' },
        { name: 'subtitle', type: 'text' },
        { name: 'body', type: 'richText' },
        { name: 'cta_label', type: 'text' },
        { name: 'cta_url', type: 'text' },
      ],
    },
    {
      name: 'layout',
      type: 'blocks',
      blocks: allBlocks,
      admin: {
        description: 'Page layout composed of blocks (replaces body_content)',
      },
    },
    {
      name: 'body_content',
      type: 'richText',
      admin: {
        description: 'DEPRECATED: Use layout[] instead. Kept for migration.',
      },
    },
    {
      name: 'features',
      type: 'array',
      admin: {
        description: 'List of key features',
      },
      fields: [
        {
          name: 'feature',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'useCases',
      type: 'array',
      admin: {
        description: 'Use cases or applications',
      },
      fields: [
        {
          name: 'useCase',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'pricing',
      type: 'array',
      admin: {
        description: 'Pricing tiers or options',
      },
      fields: [
        {
          name: 'tier',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'testimonials',
      type: 'array',
      admin: {
        description: 'Customer testimonials',
      },
      fields: [
        {
          name: 'testimonial',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'relatedResources',
      type: 'array',
      admin: {
        description: 'Related article slugs',
      },
      fields: [
        {
          name: 'resourceSlug',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'pricing_reference',
      type: 'relationship',
      relationTo: 'pricing',
      admin: {
        description: 'Link to pricing collection (future)',
      },
    },
    {
      name: 'cta_reference',
      type: 'group',
      admin: {
        description: 'Call-to-action configuration',
      },
      fields: [
        { name: 'label', type: 'text' },
        { name: 'url', type: 'text' },
      ],
    },
    {
      name: 'seo_meta',
      type: 'group',
      admin: {
        description: 'SEO metadata',
      },
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea', maxLength: 160 },
        { name: 'keywords', type: 'text' },
        {
          name: 'og_image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'theme_variant',
      type: 'select',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Dark', value: 'dark' },
        { label: 'Accent', value: 'accent' },
      ],
      defaultValue: 'default',
      admin: {
        description: 'Theme variant for this offer page (scoped overlay, not global)',
      },
    },
    {
      name: 'sort_order',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Display order (lower numbers appear first)',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      defaultValue: 'draft',
      required: true,
      admin: {
        description: 'Publication status',
      },
    },
  ],
};






