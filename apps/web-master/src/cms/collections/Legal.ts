// @ts-nocheck - Payload CMS types will be available after installation
import { CollectionConfig } from 'payload/types';
import { allBlocks } from '../blocks';

export const Legal: CollectionConfig = {
  slug: 'legal',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'lastUpdated'],
    description: 'Legal documents and policies',
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
        description: 'URL-friendly identifier (e.g., privacy-policy)',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Document title',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Brief excerpt for SEO meta description (optional)',
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
      name: 'document_type',
      type: 'select',
      options: [
        { label: 'Privacy Policy', value: 'privacy-policy' },
        { label: 'Terms of Use', value: 'terms-of-use' },
        { label: 'Cookie Policy', value: 'cookie-policy' },
        { label: 'GDPR', value: 'gdpr' },
        { label: 'Disclaimer', value: 'disclaimer' },
        { label: 'Acceptable Use', value: 'acceptable-use' },
        { label: 'SLA', value: 'sla' },
        { label: 'Other', value: 'other' },
      ],
      required: true,
      admin: {
        description: 'Type of legal document',
      },
    },
    {
      name: 'version',
      type: 'text',
      admin: {
        description: 'Document version (e.g., "2.1")',
      },
    },
    {
      name: 'effectiveDate',
      type: 'date',
      required: true,
      admin: {
        description: 'Date this version becomes effective',
      },
    },
    {
      name: 'lastUpdated',
      type: 'date',
      required: true,
      admin: {
        description: 'Last update date',
      },
    },
    {
      name: 'summary',
      type: 'textarea',
      admin: {
        description: 'Plain-language summary (optional)',
      },
    },
    {
      name: 'jurisdiction',
      type: 'text',
      admin: {
        description: 'Legal jurisdiction (e.g., "United States, California")',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Draft', value: 'draft' },
        { label: 'Archived', value: 'archived' },
      ],
      defaultValue: 'active',
      required: true,
      admin: {
        description: 'Document status',
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
      ],
    },
  ],
};




