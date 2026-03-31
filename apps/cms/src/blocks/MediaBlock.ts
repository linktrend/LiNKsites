import type { Block, Field, TextField, UploadField } from 'payload'

export const MediaBlock = {
  slug: 'media',
  labels: {
    singular: 'Media Block',
    plural: 'Media Blocks',
  },
  fields: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Image or media file to display',
      },
    } satisfies UploadField,
    {
      name: 'caption',
      type: 'text',
      localized: true,
      admin: {
        description: 'Caption text displayed below the media',
      },
    } satisfies TextField,
    {
      name: 'altText',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Alternative text for accessibility',
      },
    } satisfies TextField,
  ],
} satisfies Block & { slug: 'media'; fields: Field[] }
