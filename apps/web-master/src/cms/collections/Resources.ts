// @ts-nocheck - Payload CMS types will be available after installation
import { CollectionConfig } from 'payload/types';
import { allBlocks } from '../blocks';

export const Resources: CollectionConfig = {
  slug: 'resources',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'date', 'offerSlug'],
    description: 'Articles and blog posts',
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
        description: 'Article title',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Short summary for previews',
      },
    },
    {
      name: 'layout',
      type: 'blocks',
      blocks: allBlocks,
      admin: {
        description: 'Page layout composed of blocks (replaces body)',
      },
    },
    {
      name: 'body',
      type: 'richText',
      admin: {
        description: 'DEPRECATED: Use layout[] instead. Kept for migration.',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Featured image',
      },
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: {
        description: 'Publication date',
      },
    },
    {
      name: 'offerSlug',
      type: 'text',
      admin: {
        description: 'Related offer slug (for filtering)',
      },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Automation', value: 'automation' },
        { label: 'Analytics', value: 'analytics' },
        { label: 'AI', value: 'ai' },
        { label: 'Data', value: 'data' },
        { label: 'General', value: 'general' },
      ],
      admin: {
        description: 'Article category',
      },
    },
    {
      name: 'author',
      type: 'group',
      admin: {
        description: 'Author information',
      },
      fields: [
        { name: 'name', type: 'text' },
        { name: 'bio', type: 'textarea' },
        { name: 'avatar', type: 'upload', relationTo: 'media' },
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






