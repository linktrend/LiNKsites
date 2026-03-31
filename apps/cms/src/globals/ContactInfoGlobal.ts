import type { Field, GlobalConfig } from 'payload'

export const ContactInfoGlobal: GlobalConfig<'contact-info'> = {
  slug: 'contact-info',
  label: 'Contact Information',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'address',
      type: 'group',
      fields: [
        {
          name: 'street',
          type: 'text',
          localized: true,
        },
        {
          name: 'city',
          type: 'text',
          localized: true,
        },
        {
          name: 'state',
          type: 'text',
          localized: true,
        },
        {
          name: 'zip',
          type: 'text',
        },
        {
          name: 'country',
          type: 'text',
          localized: true,
        },
      ],
    },
    {
      name: 'socialMedia',
      type: 'group',
      label: 'Social Media',
      fields: [
        {
          name: 'facebook',
          type: 'text',
        },
        {
          name: 'twitter',
          type: 'text',
        },
        {
          name: 'linkedin',
          type: 'text',
        },
        {
          name: 'instagram',
          type: 'text',
        },
        {
          name: 'youtube',
          type: 'text',
        },
      ],
    },
    {
      name: 'businessHours',
      type: 'textarea',
      localized: true,
    },
  ] satisfies Field[],
} satisfies GlobalConfig<'contact-info'>
