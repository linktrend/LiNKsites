import type { ArrayField, Block, Field, RichTextField, TextField } from 'payload'

export const FAQBlock = {
  slug: 'faq',
  labels: {
    singular: 'FAQ Block',
    plural: 'FAQ Blocks',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      defaultValue: 'Frequently Asked Questions',
    } satisfies TextField,
    {
      name: 'questions',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
          localized: true,
        } satisfies TextField,
        {
          name: 'answer',
          type: 'richText',
          required: true,
          localized: true,
        } satisfies RichTextField,
      ],
    } satisfies ArrayField,
  ],
} satisfies Block & { slug: 'faq'; fields: Field[] }
