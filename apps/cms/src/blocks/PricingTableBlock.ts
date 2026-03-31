import type {
  ArrayField,
  Block,
  CheckboxField,
  Field,
  GroupField,
  TextareaField,
  TextField,
} from 'payload'

export const PricingTableBlock = {
  slug: 'pricing',
  labels: {
    singular: 'Pricing Table Block',
    plural: 'Pricing Table Blocks',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
    } satisfies TextField,
    {
      name: 'subtitle',
      type: 'textarea',
      localized: true,
    } satisfies TextareaField,
    {
      name: 'monthlyLabel',
      type: 'text',
      localized: true,
      admin: {
        description: 'Optional label for monthly billing toggle (frontend may ignore)',
      },
    } satisfies TextField,
    {
      name: 'yearlyLabel',
      type: 'text',
      localized: true,
      admin: {
        description: 'Optional label for yearly billing toggle (frontend may ignore)',
      },
    } satisfies TextField,
    {
      name: 'plans',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          localized: true,
        } satisfies TextField,
        {
          name: 'price',
          type: 'text',
          required: true,
        } satisfies TextField,
        {
          name: 'period',
          type: 'text',
          localized: true,
          admin: {
            description: 'e.g., per month, per year',
          },
        } satisfies TextField,
        {
          name: 'description',
          type: 'textarea',
          localized: true,
        } satisfies TextareaField,
        {
          name: 'features',
          type: 'array',
          required: true,
          fields: [
            {
              name: 'feature',
              type: 'text',
              required: true,
              localized: true,
            } satisfies TextField,
            {
              name: 'included',
              type: 'checkbox',
              defaultValue: true,
            } satisfies CheckboxField,
          ],
        } satisfies ArrayField,
        {
          name: 'cta',
          type: 'group',
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
          ],
        } satisfies GroupField,
        {
          name: 'highlighted',
          type: 'checkbox',
          label: 'Highlight this plan',
          defaultValue: false,
        } satisfies CheckboxField,
      ],
    } satisfies ArrayField,
  ],
} satisfies Block & { slug: 'pricing'; fields: Field[] }
