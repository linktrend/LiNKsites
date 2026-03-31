import type { Block, Field, RichTextField, SelectField, TextField } from 'payload'

const calloutTypeOptions = [
  { label: 'Info', value: 'info' },
  { label: 'Warning', value: 'warning' },
  { label: 'Success', value: 'success' },
  { label: 'Error', value: 'error' },
] as const satisfies SelectField['options']

export const CalloutBlock = {
  slug: 'callout',
  labels: {
    singular: 'Callout Block',
    plural: 'Callout Blocks',
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      options: calloutTypeOptions,
      defaultValue: 'info',
    } satisfies SelectField,
    {
      name: 'message',
      type: 'richText',
      required: true,
      localized: true,
    } satisfies RichTextField,
    {
      name: 'icon',
      type: 'text',
      admin: {
        description: 'Icon name or emoji',
      },
    } satisfies TextField,
  ],
} satisfies Block & { slug: 'callout'; fields: Field[] }
