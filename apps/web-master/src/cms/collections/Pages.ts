// @ts-nocheck - Payload CMS types will be available after installation
import { CollectionConfig } from 'payload/types';
import { allBlocks } from '../blocks';

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    description: 'Flexible page builder with unified block system',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'site',
      type: 'text',
      required: true,
      admin: {
        description: 'Site identifier (e.g., main, subdomain)',
      },
    },
    {
      name: 'locale',
      type: 'text',
      required: true,
      admin: {
        description: 'Locale code (e.g., en, es, fr)',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      admin: {
        description: 'URL slug (e.g., "home", "about", "contact")',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Page title',
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
      name: 'seo',
      type: 'group',
      admin: {
        description: 'SEO metadata for this page',
      },
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea', maxLength: 160 },
        { name: 'ogImage', type: 'upload', relationTo: 'media' },
        { name: 'canonicalUrl', type: 'text' },
      ],
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
    },
  ],
};






