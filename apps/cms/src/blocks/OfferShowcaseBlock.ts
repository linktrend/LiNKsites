import type { Block, Field, TextareaField, TextField } from 'payload'
import { ls04SemanticFields } from './ls04SemanticFields'

export const OfferShowcaseBlock = {
  slug: 'offerShowcase',
  labels: {
    singular: 'Offer Showcase Block',
    plural: 'Offer Showcase Blocks',
  },
  fields: [
    ...ls04SemanticFields,
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
      // Working-content production supplies approved offer/service labels.
      // This projection is intentionally content, not an OfferPage
      // relationship: the deprecated OfferPage collection is not the
      // canonical product/service source and label values are not Payload
      // integer IDs.
      type: 'text',
      hasMany: true,
      required: true,
      minRows: 1,
      localized: true,
      admin: {
        description: 'Approved offer labels to display in this showcase',
      },
    } satisfies TextField,
  ],
} satisfies Block & { slug: 'offerShowcase'; fields: Field[] }
