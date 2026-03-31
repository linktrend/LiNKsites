import type { Block, Field, RichTextField } from 'payload'

export const RichTextBlock = {
  slug: 'richText',
  labels: {
    singular: 'Rich Text Block',
    plural: 'Rich Text Blocks',
  },
  fields: [
    {
      name: 'content',
      type: 'richText',
      required: true,
      localized: true,
    } satisfies RichTextField,
  ],
} satisfies Block & { slug: 'richText'; fields: Field[] }
