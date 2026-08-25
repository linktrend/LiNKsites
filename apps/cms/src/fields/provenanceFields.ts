import type { Field } from 'payload'

export const provenanceFields = [
  {
    name: 'provenance',
    type: 'group',
    label: 'Provenance',
    admin: {
      description: 'Tenant/locale-bound source, actor, and evidence identity',
    },
    fields: [
      {
        name: 'sourceIdentity',
        type: 'text',
        index: true,
        admin: {
          description: 'Exact source identity (SHA-1 or content checksum)',
        },
      },
      {
        name: 'evidenceDigest',
        type: 'text',
        admin: {
          description: 'Evidence digest for the recorded fact',
        },
      },
      {
        name: 'actorId',
        type: 'text',
        admin: {
          description: 'Actor that recorded this document',
        },
      },
      {
        name: 'recordedAt',
        type: 'date',
        admin: {
          date: { pickerAppearance: 'dayAndTime' },
        },
      },
      {
        name: 'localeBound',
        type: 'checkbox',
        defaultValue: true,
        admin: {
          description: 'When set, this record is bound to its locale and must not leak across locales',
        },
      },
    ],
  },
] satisfies Field[]
