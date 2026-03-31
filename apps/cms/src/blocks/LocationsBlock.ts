import type { Block, Field, RelationshipField, TextareaField, TextField } from 'payload'

export const LocationsBlock = {
  slug: 'locations',
  labels: {
    singular: 'Locations Block',
    plural: 'Locations Blocks',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
      defaultValue: 'Locations',
    } satisfies TextField,
    {
      name: 'subtitle',
      type: 'textarea',
      localized: true,
    } satisfies TextareaField,
    {
      name: 'items',
      type: 'relationship',
      relationTo: 'locations',
      hasMany: true,
      required: true,
      minRows: 1,
      admin: {
        description: 'Select locations to display',
      },
    } satisfies RelationshipField,
  ] satisfies Field[],
} satisfies Block & { slug: 'locations'; fields: Field[] }

