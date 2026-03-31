import type { Block, Field, RelationshipField, TextareaField, TextField } from 'payload'

export const OfferShowcaseBlock = {
  slug: 'offerShowcase',
  labels: {
    singular: 'Offer Showcase Block',
    plural: 'Offer Showcase Blocks',
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
      name: 'offers',
      type: 'relationship',
      relationTo: 'offer-pages',
      hasMany: true,
      required: true,
      minRows: 1,
      admin: {
        description: 'Select offers to display in this showcase',
      },
    } satisfies RelationshipField,
  ],
} satisfies Block & { slug: 'offerShowcase'; fields: Field[] }
