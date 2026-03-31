// @ts-nocheck - Payload CMS types will be available after installation
import { CollectionConfig } from 'payload/types';
import { allBlocks } from '../blocks';

export const FAQ: CollectionConfig = {
  slug: 'faq',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'sort_order'],
    description: 'FAQ pages with flexible layout',
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
        description: 'FAQ page title',
      },
    },
    {
      name: 'layout',
      type: 'blocks',
      blocks: allBlocks,
      admin: {
        description: 'Page layout composed of blocks',
      },
    },
    {
      name: 'question',
      type: 'text',
      admin: {
        description: 'DEPRECATED: Individual FAQ item. Use layout[] with FAQ block instead.',
      },
    },
    {
      name: 'answer',
      type: 'richText',
      admin: {
        description: 'DEPRECATED: Use layout[] with FAQ block instead.',
      },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Getting Started', value: 'getting-started' },
        { label: 'Billing', value: 'billing' },
        { label: 'Technical', value: 'technical' },
        { label: 'Account', value: 'account' },
        { label: 'Features', value: 'features' },
        { label: 'Integration', value: 'integration' },
        { label: 'Security', value: 'security' },
        { label: 'General', value: 'general' },
      ],
      admin: {
        description: 'FAQ category',
      },
    },
    {
      name: 'offerSlug',
      type: 'text',
      admin: {
        description: 'Related offer slug (optional, for offer-specific FAQs)',
      },
    },
    {
      name: 'sort_order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Display order within category',
      },
    },
    {
      name: 'tags',
      type: 'array',
      admin: {
        description: 'Tags for search and filtering',
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'helpful_count',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Number of "helpful" votes',
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Published', value: 'published' },
        { label: 'Draft', value: 'draft' },
      ],
      defaultValue: 'published',
      admin: {
        description: 'Publication status',
      },
    },
  ],
};






