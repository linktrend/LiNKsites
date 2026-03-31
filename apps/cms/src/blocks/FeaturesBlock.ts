import type { Block, Field, TextareaField, TextField } from 'payload'

export const FeaturesBlock = {
  slug: 'features',
  labels: {
    singular: 'Features Block',
    plural: 'Features Blocks',
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
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'icon',
          type: 'text',
          required: true,
          admin: {
            description: 'Icon name or identifier',
          },
        } satisfies TextField,
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
        } satisfies TextField,
        {
          name: 'description',
          type: 'textarea',
          required: true,
          localized: true,
        } satisfies TextareaField,
        {
          name: 'linkText',
          type: 'text',
          localized: true,
          admin: {
            description: 'Optional link label for this feature',
          },
        } satisfies TextField,
        {
          name: 'linkUrl',
          type: 'text',
          admin: {
            description: 'Optional link URL for this feature',
          },
        } satisfies TextField,
      ],
    },
  ],
} satisfies Block & { slug: 'features'; fields: Field[] }
