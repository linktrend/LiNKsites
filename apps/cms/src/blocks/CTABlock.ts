import type {
  Block,
  Field,
  GroupField,
  SelectField,
  TextareaField,
  TextField,
} from 'payload'

const ctaStyleOptions = [
  { label: 'Primary', value: 'primary' },
  { label: 'Secondary', value: 'secondary' },
] as const satisfies SelectField['options']

const backgroundColorOptions = [
  { label: 'Default', value: 'default' },
  { label: 'Primary', value: 'primary' },
  { label: 'Secondary', value: 'secondary' },
  { label: 'Dark', value: 'dark' },
] as const satisfies SelectField['options']

export const CTABlock = {
  slug: 'cta',
  labels: {
    singular: 'CTA Block',
    plural: 'CTA Blocks',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    } satisfies TextField,
    {
      name: 'text',
      type: 'textarea',
      localized: true,
    } satisfies TextareaField,
    {
      name: 'button',
      type: 'group',
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
          localized: true,
        } satisfies TextField,
        {
          name: 'url',
          type: 'text',
          required: true,
        } satisfies TextField,
        {
          name: 'style',
          type: 'select',
          options: ctaStyleOptions,
          defaultValue: 'primary',
        } satisfies SelectField,
      ],
    } satisfies GroupField,
    {
      name: 'backgroundColor',
      type: 'select',
      options: backgroundColorOptions,
      defaultValue: 'default',
    } satisfies SelectField,
  ],
} satisfies Block & { slug: 'cta'; fields: Field[] }
