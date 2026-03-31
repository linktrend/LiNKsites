import type { RelationshipField } from 'payload'

export const siteField = {
  name: 'site',
  type: 'relationship',
  relationTo: 'sites',
  required: true,
  hasMany: false,
  index: true,
  admin: {
    description: 'The site this content belongs to',
    position: 'sidebar',
  },
} satisfies RelationshipField
