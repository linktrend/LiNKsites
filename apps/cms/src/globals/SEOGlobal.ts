import type { Field, GlobalConfig } from 'payload'

export const SEOGlobal: GlobalConfig<'seo'> = {
  slug: 'seo',
  label: 'SEO Settings',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'titleTemplate',
      type: 'text',
      label: 'Title Template',
      defaultValue: '%s | LiNKtrend',
      admin: {
        description: '%s is replaced with the page title when rendering',
      },
    },
    {
      name: 'defaultTitle',
      type: 'text',
      label: 'Default Title',
      localized: true,
    },
    {
      name: 'defaultDescription',
      type: 'textarea',
      label: 'Default Meta Description',
      localized: true,
    },
    {
      name: 'defaultKeywords',
      type: 'text',
      label: 'Default Keywords',
      localized: true,
    },
    {
      name: 'defaultOgImage',
      type: 'upload',
      label: 'Default Open Graph Image',
      relationTo: 'media',
      admin: {
        description: 'Default image for social media sharing (1200x630px)',
      },
    },
    {
      name: 'favicon',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'googleAnalyticsId',
      type: 'text',
      label: 'Google Analytics ID',
    },
    {
      name: 'googleTagManagerId',
      type: 'text',
      label: 'Google Tag Manager ID',
    },
  ] satisfies Field[],
} satisfies GlobalConfig<'seo'>
