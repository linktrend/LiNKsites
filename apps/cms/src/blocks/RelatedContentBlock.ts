import type { Block, Field, SelectField, TextField } from 'payload'

const displayStyleOptions = [
  { label: 'Grid', value: 'grid' },
  { label: 'List', value: 'list' },
  { label: 'Carousel', value: 'carousel' },
] as const satisfies SelectField['options']

export const RelatedContentBlock = {
  slug: 'relatedContent',
  labels: {
    singular: 'Related Content Block',
    plural: 'Related Content Blocks',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      defaultValue: 'Related Content',
    } satisfies TextField,
    {
      name: 'content',
      type: 'relationship',
      relationTo: [
        'articles',
        'case-study-pages',
        'videos',
        'video-pages',
      ],
      hasMany: true,
      required: true,
      admin: {
        description: 'Select related articles, case studies, or videos',
      },
    } as unknown as Field,
    {
      name: 'displayStyle',
      type: 'select',
      options: displayStyleOptions,
      defaultValue: 'grid',
    } satisfies SelectField,
  ],
} satisfies Block & { slug: 'relatedContent'; fields: Field[] }
