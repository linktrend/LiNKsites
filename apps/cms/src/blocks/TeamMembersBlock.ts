import type { Block, Field, RelationshipField, TextareaField, TextField } from 'payload'

export const TeamMembersBlock = {
  slug: 'teamMembers',
  labels: {
    singular: 'Team Members Block',
    plural: 'Team Members Blocks',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
      defaultValue: 'Team',
    } satisfies TextField,
    {
      name: 'subtitle',
      type: 'textarea',
      localized: true,
    } satisfies TextareaField,
    {
      name: 'items',
      type: 'relationship',
      relationTo: 'team-members',
      hasMany: true,
      required: true,
      minRows: 1,
      admin: {
        description: 'Select team members to display',
      },
    } satisfies RelationshipField,
  ] satisfies Field[],
} satisfies Block & { slug: 'teamMembers'; fields: Field[] }

