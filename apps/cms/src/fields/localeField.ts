import type { TextField } from 'payload'

export const localeField: TextField = {
  name: 'locale',
  type: 'text',
  required: true,
  index: true,
  admin: {
    description: 'Content locale code (e.g., en, es, fr)',
    position: 'sidebar',
  },
}
