import type { Block, Field, RelationshipField, TextareaField, TextField } from 'payload'

export const CaseStudiesBlock = {
  slug: 'caseStudies',
  labels: {
    singular: 'Case Studies Block',
    plural: 'Case Studies Blocks',
  },
  fields: [
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
      name: 'items',
      type: 'relationship',
      relationTo: 'case-study-pages',
      hasMany: true,
      required: true,
      minRows: 1,
      admin: {
        description: 'Select case studies to display in this block',
      },
    } satisfies RelationshipField,
  ],
} satisfies Block & { slug: 'caseStudies'; fields: Field[] }
