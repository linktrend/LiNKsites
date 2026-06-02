import type {
  ArrayField,
  Block,
  CheckboxField,
  Field,
  NumberField,
  TextareaField,
  TextField,
} from 'payload'

export const TrustFeedBlock = {
  slug: 'trustFeed',
  labels: {
    singular: 'Trust Feed',
    plural: 'Trust Feeds',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: false,
    } satisfies TextField,
    {
      name: 'minRating',
      type: 'number',
      defaultValue: 4,
      min: 1,
      max: 5,
      admin: {
        description: 'Minimum rating to display (default 4)',
      },
    } satisfies NumberField,
    {
      name: 'allowPositiveOnly',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Only show reviews at or above the minimum rating',
      },
    } satisfies CheckboxField,
    {
      name: 'reviews',
      type: 'array',
      fields: [
        { name: 'platform', type: 'text' } satisfies TextField,
        { name: 'rating', type: 'number', min: 1, max: 5 } satisfies NumberField,
        { name: 'quote', type: 'textarea' } satisfies TextareaField,
        { name: 'author', type: 'text' } satisfies TextField,
        { name: 'url', type: 'text' } satisfies TextField,
      ],
    } satisfies ArrayField,
  ] satisfies Field[],
} satisfies Block & { slug: 'trustFeed'; fields: Field[] }
