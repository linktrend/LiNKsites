import type { Block, Field, TextareaField, TextField, UploadField } from 'payload'

export const TestimonialBlock = {
  slug: 'testimonial',
  labels: {
    singular: 'Testimonial Block',
    plural: 'Testimonial Blocks',
  },
  fields: [
    {
      name: 'quote',
      type: 'textarea',
      required: true,
      localized: true,
    } satisfies TextareaField,
    {
      name: 'author',
      type: 'text',
      required: true,
    } satisfies TextField,
    {
      name: 'company',
      type: 'text',
    } satisfies TextField,
    {
      name: 'role',
      type: 'text',
    } satisfies TextField,
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Author photo',
      },
    } satisfies UploadField,
  ],
} satisfies Block & { slug: 'testimonial'; fields: Field[] }
