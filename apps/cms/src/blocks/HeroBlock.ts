import type {
  Block,
  ArrayField,
  Field,
  GroupField,
  SelectField,
  TextareaField,
  TextField,
  UploadField,
} from 'payload'

const heroCTAStyleOptions = [
  { label: 'Primary', value: 'primary' },
  { label: 'Secondary', value: 'secondary' },
  { label: 'Outline', value: 'outline' },
] as const satisfies SelectField['options']

export const HeroBlock = {
  slug: 'hero',
  labels: {
    singular: 'Hero Block',
    plural: 'Hero Blocks',
  },
  fields: [
    {
      name: 'badge',
      type: 'text',
      localized: true,
      admin: {
        description: 'Optional small label shown above the hero title',
      },
    } satisfies TextField,
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
      name: 'body',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Optional extra text displayed under the subtitle',
      },
    } satisfies TextareaField,
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      required: false,
    } satisfies UploadField,
    {
      name: 'socialProof',
      type: 'array',
      admin: {
        description: 'Optional quotes / proof points displayed in the hero',
      },
      fields: [
        {
          name: 'publication',
          type: 'text',
          localized: true,
        } satisfies TextField,
        {
          name: 'quote',
          type: 'textarea',
          localized: true,
        } satisfies TextareaField,
        {
          name: 'author',
          type: 'text',
          localized: true,
        } satisfies TextField,
        {
          name: 'title',
          type: 'text',
          localized: true,
        } satisfies TextField,
      ],
    } satisfies ArrayField,
    {
      name: 'cta',
      type: 'group',
      label: 'Call to Action',
      fields: [
        {
          name: 'text',
          type: 'text',
          localized: true,
        } satisfies TextField,
        {
          name: 'url',
          type: 'text',
        } satisfies TextField,
        {
          name: 'style',
          type: 'select',
          options: heroCTAStyleOptions,
          defaultValue: 'primary',
        } satisfies SelectField,
      ],
    } satisfies GroupField,
  ],
} satisfies Block & { slug: 'hero'; fields: Field[] }
