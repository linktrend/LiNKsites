import type { Field, GlobalConfig } from 'payload'

export const LegalGlobal: GlobalConfig<'legal'> = {
  slug: 'legal',
  label: 'Legal Settings',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'termsUrl',
      type: 'text',
      label: 'Terms of Service URL',
    },
    {
      name: 'privacyUrl',
      type: 'text',
      label: 'Privacy Policy URL',
    },
    {
      name: 'cookiePolicyUrl',
      type: 'text',
      label: 'Cookie Policy URL',
    },
    {
      name: 'cookieConsent',
      type: 'group',
      label: 'Cookie Consent Banner',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'message',
          type: 'textarea',
          localized: true,
        },
        {
          name: 'acceptButtonText',
          type: 'text',
          localized: true,
          defaultValue: 'Accept',
        },
        {
          name: 'declineButtonText',
          type: 'text',
          localized: true,
          defaultValue: 'Decline',
        },
      ],
    },
  ] satisfies Field[],
} satisfies GlobalConfig<'legal'>
