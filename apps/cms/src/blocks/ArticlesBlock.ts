import type { Block, Field, RelationshipField, TextareaField, TextField } from 'payload'

export const ArticlesBlock = {
  slug: 'articles',
  labels: {
    singular: 'Articles Block',
    plural: 'Articles Blocks',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    } satisfies TextField,
    {
      name: 'subtitle',
      type: 'textarea',
      localized: true,
    } satisfies TextareaField,
    {
      name: 'items',
      type: 'relationship',
      relationTo: 'articles',
      hasMany: true,
      required: true,
      minRows: 1,
      admin: {
        description: 'Select articles to display in this block',
      },
    } satisfies RelationshipField,
  ],
} satisfies Block & { slug: 'articles'; fields: Field[] }
