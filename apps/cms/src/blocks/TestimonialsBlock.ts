import type { Block, Field, RelationshipField, TextareaField, TextField } from 'payload'

export const TestimonialsBlock = {
  slug: 'testimonials',
  labels: {
    singular: 'Testimonials Block',
    plural: 'Testimonials Blocks',
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
      relationTo: 'testimonials',
      hasMany: true,
      required: true,
      minRows: 1,
      admin: {
        description: 'Select testimonials to display in this block',
      },
    } satisfies RelationshipField,
  ],
} satisfies Block & { slug: 'testimonials'; fields: Field[] }
