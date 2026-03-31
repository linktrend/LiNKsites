import type { TextField } from 'payload'
import { autoGenerateSlug } from '@/hooks/autoGenerateSlug'

export const createSlugField = (collectionSlug: string): TextField =>
  ({
    name: 'slug',
    type: 'text',
    label: 'Slug',
    required: true,
    localized: true,
    index: true,
    admin: {
      description: 'URL-friendly identifier generated per locale and site',
      position: 'sidebar',
    },
    hooks: {
      beforeValidate: [autoGenerateSlug(collectionSlug)],
    },
  } satisfies TextField)
