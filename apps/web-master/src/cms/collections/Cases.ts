// @ts-nocheck - Payload CMS types will be available after installation
import { CollectionConfig } from 'payload/types';
import { allBlocks } from '../blocks';

export const Cases: CollectionConfig = {
  slug: 'cases',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'relatedOffers'],
    description: 'Customer case studies and success stories',
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
        description: 'URL-friendly identifier',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Case study title',
      },
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Brief summary for previews',
      },
    },
    {
      name: 'layout',
      type: 'blocks',
      blocks: allBlocks,
      admin: {
        description: 'Page layout composed of blocks (replaces challenge/solution/impact)',
      },
    },
    {
      name: 'challenge',
      type: 'richText',
      admin: {
        description: 'DEPRECATED: Use layout[] instead. Kept for migration.',
      },
    },
    {
      name: 'solution',
      type: 'richText',
      admin: {
        description: 'DEPRECATED: Use layout[] instead. Kept for migration.',
      },
    },
    {
      name: 'impact',
      type: 'richText',
      admin: {
        description: 'DEPRECATED: Use layout[] instead. Kept for migration.',
      },
    },
    {
      name: 'relatedOffers',
      type: 'array',
      admin: {
        description: 'Related offer slugs',
      },
      fields: [
        {
          name: 'offerSlug',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'customer',
      type: 'group',
      admin: {
        description: 'Customer information',
      },
      fields: [
        { name: 'name', type: 'text' },
        { name: 'industry', type: 'text' },
        { name: 'size', type: 'text' },
        { name: 'logo', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      name: 'metrics',
      type: 'array',
      admin: {
        description: 'Key metrics and results',
      },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'value', type: 'text', required: true },
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
      ],
    },
  ],
};






