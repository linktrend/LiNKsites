import type { Block, Field, TextareaField, TextField } from 'payload'

export const NewsletterBlock = {
  slug: 'newsletter',
  labels: {
    singular: 'Newsletter Block',
    plural: 'Newsletter Blocks',
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
      name: 'placeholder',
      type: 'text',
      localized: true,
      admin: {
        description: 'Placeholder text for email input field',
      },
    } satisfies TextField,
    {
      name: 'buttonLabel',
      type: 'text',
      required: true,
      localized: true,
      defaultValue: 'Subscribe',
    } satisfies TextField,
  ],
} satisfies Block & { slug: 'newsletter'; fields: Field[] }
