import type { Block, CheckboxField, Field, SelectField, TextField } from 'payload'

const aspectRatioOptions = [
  { label: '16:9', value: '16:9' },
  { label: '4:3', value: '4:3' },
  { label: '1:1', value: '1:1' },
] as const satisfies SelectField['options']

export const VideoEmbedBlock = {
  slug: 'videoEmbed',
  labels: {
    singular: 'Video Embed Block',
    plural: 'Video Embed Blocks',
  },
  fields: [
    {
      name: 'youtubeId',
      type: 'text',
      required: true,
      admin: {
        description: 'YouTube video ID or full URL',
      },
    } satisfies TextField,
    {
      name: 'caption',
      type: 'text',
      localized: true,
    } satisfies TextField,
    {
      name: 'autoplay',
      type: 'checkbox',
      defaultValue: false,
    } satisfies CheckboxField,
    {
      name: 'controls',
      type: 'checkbox',
      defaultValue: true,
    } satisfies CheckboxField,
    {
      name: 'aspectRatio',
      type: 'select',
      options: aspectRatioOptions,
      defaultValue: '16:9',
    } satisfies SelectField,
  ],
} satisfies Block & { slug: 'videoEmbed'; fields: Field[] }
