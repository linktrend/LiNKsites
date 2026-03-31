import type { Field, TextareaField, TextField } from 'payload'

export const mediaFields = [
  {
    name: 'alt',
    type: 'text',
    label: 'Alt Text',
    required: true,
    admin: {
      description: 'Alternative text for accessibility and SEO',
    },
  } satisfies TextField,
  {
    name: 'caption',
    type: 'textarea',
    label: 'Caption',
    admin: {
      description: 'Optional caption to display with the image',
    },
  } satisfies TextareaField,
  {
    name: 'credit',
    type: 'text',
    label: 'Credit',
    admin: {
      description: 'Photo credit or attribution',
    },
  } satisfies TextField,
] satisfies Field[]
