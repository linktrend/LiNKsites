import type { CheckboxField, Field, GroupField, TextareaField, TextField, UploadField } from 'payload'

export const seoFields = [
  {
    name: 'seo',
    type: 'group',
    label: 'SEO',
    fields: [
      {
        name: 'title',
        type: 'text',
        label: 'Meta Title',
        localized: true,
        admin: {
          description: 'Override the page title for search engines (leave empty to use page title)',
        },
      } satisfies TextField,
      {
        name: 'description',
        type: 'textarea',
        label: 'Meta Description',
        maxLength: 160,
        localized: true,
        admin: {
          description: 'Brief description for search engine results (max 160 characters)',
        },
      } satisfies TextareaField,
      {
        name: 'keywords',
        type: 'text',
        label: 'Keywords',
        localized: true,
        admin: {
          description: 'Comma-separated keywords for SEO',
        },
      } satisfies TextField,
      {
        name: 'ogImage',
        type: 'upload',
        label: 'Open Graph Image',
        relationTo: 'media',
        admin: {
          description: 'Image for social media sharing (1200x630px recommended)',
        },
      } satisfies UploadField,
      {
        name: 'noIndex',
        type: 'checkbox',
        label: 'No Index',
        defaultValue: false,
        admin: {
          description: 'Prevent search engines from indexing this page',
        },
      } satisfies CheckboxField,
    ],
  } satisfies GroupField,
] satisfies Field[]
