// @ts-nocheck - Payload CMS types will be available after installation
import { CollectionConfig } from 'payload/types';
import { allBlocks } from '../blocks';

export const Videos: CollectionConfig = {
  slug: 'videos',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'youtubeId'],
    description: 'Video content and tutorials',
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
        description: 'Video title',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Video description',
      },
    },
    {
      name: 'layout',
      type: 'blocks',
      blocks: allBlocks,
      admin: {
        description: 'Page layout composed of blocks (additional content)',
      },
    },
    {
      name: 'youtubeId',
      type: 'text',
      required: true,
      admin: {
        description: 'YouTube video ID',
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Custom thumbnail (optional, falls back to YouTube)',
      },
    },
    {
      name: 'duration',
      type: 'text',
      admin: {
        description: 'Video duration (e.g., "5:30")',
      },
    },
    {
      name: 'relatedVideos',
      type: 'array',
      admin: {
        description: 'Related video slugs',
      },
      fields: [
        {
          name: 'videoSlug',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'relatedArticles',
      type: 'array',
      admin: {
        description: 'Related article slugs',
      },
      fields: [
        {
          name: 'articleSlug',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Tutorial', value: 'tutorial' },
        { label: 'Demo', value: 'demo' },
        { label: 'Webinar', value: 'webinar' },
        { label: 'Case Study', value: 'case-study' },
        { label: 'Product Update', value: 'product-update' },
      ],
      admin: {
        description: 'Video category',
      },
    },
    {
      name: 'publishedDate',
      type: 'date',
      admin: {
        description: 'Publication date',
      },
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






