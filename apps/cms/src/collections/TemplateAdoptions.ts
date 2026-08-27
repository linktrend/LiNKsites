import type { CollectionBeforeChangeHook, CollectionConfig, Field } from 'payload'
import { createAccess } from '@/access'
import { createSiteFilteredAccess } from '@/admin/utils/siteFilterOptions'
import { localeField } from '@/fields/localeField'
import { siteField } from '@/fields/siteField'
import { LS03_ADOPTION_STATES, SHA1_IDENTITY } from '@/payload/ls03/semanticContract'
import { ImmutableRecordError, rejectImmutableDelete, rejectImmutableUpdate } from '@/hooks/enforceImmutableRecord'

const identityField = (name: string, label: string): Field => ({
  name,
  type: 'text',
  required: true,
  label,
  admin: {
    description: 'Exact lowercase 40-character SHA-1 identity',
  },
})

const assertAdoptionIdentities: CollectionBeforeChangeHook = ({ data }) => {
  const identities = data?.identities as Record<string, unknown> | undefined
  const keys = ['provider', 'layout', 'plan', 'overlay', 'config', 'content', 'adapter', 'effective'] as const
  if (!identities) {
    throw new ImmutableRecordError('Template adoption identities are required.')
  }
  for (const key of keys) {
    const value = identities[key]
    if (typeof value !== 'string' || !SHA1_IDENTITY.test(value)) {
      throw new ImmutableRecordError(`${key} must be an exact lowercase 40-character SHA-1 identity.`)
    }
  }
}

export const TemplateAdoptions: CollectionConfig = {
  slug: 'template-adoptions',
  admin: {
    useAsTitle: 'adoptionId',
    defaultColumns: ['adoptionId', 'site', 'adoptionState', 'updatedAt'],
    description: 'Immutable template adoption records. Free-text template IDs are deprecated projections only.',
  },
  access: {
    read: createSiteFilteredAccess(),
    create: createAccess,
    update: () => false,
    delete: () => false,
  },
  hooks: {
    beforeChange: [assertAdoptionIdentities, rejectImmutableUpdate],
    beforeDelete: [rejectImmutableDelete],
  },
  fields: [
    {
      name: 'adoptionId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    siteField,
    localeField,
    {
      name: 'adoptionState',
      type: 'select',
      required: true,
      options: LS03_ADOPTION_STATES.map((value) => ({ label: value, value })),
    },
    {
      name: 'identities',
      type: 'group',
      required: true,
      fields: [
        identityField('provider', 'Provider'),
        identityField('layout', 'Layout'),
        identityField('plan', 'Plan'),
        identityField('overlay', 'Overlay'),
        identityField('config', 'Config'),
        identityField('content', 'Content'),
        identityField('adapter', 'Adapter'),
        identityField('effective', 'Effective'),
      ],
    },
    {
      name: 'entitlementSnapshot',
      type: 'relationship',
      relationTo: 'entitlement-snapshots',
      required: true,
    },
    {
      name: 'beforeRecord',
      type: 'json',
      admin: { description: 'Linked before-state for replace/rollback proof' },
    },
    {
      name: 'afterRecord',
      type: 'json',
      admin: { description: 'Linked after-state for replace/rollback proof' },
    },
    {
      name: 'rollbackRecord',
      type: 'json',
      admin: { description: 'Rollback target recorded at adoption time' },
    },
    {
      name: 'actorId',
      type: 'text',
      required: true,
    },
    {
      name: 'evidenceDigest',
      type: 'text',
      required: true,
    },
    {
      name: 'deprecatedTemplateIdProjection',
      type: 'text',
      admin: {
        description: 'Deprecated free-text template ID projection. Canonical identity is identities.effective.',
        readOnly: true,
      },
    },
  ] satisfies Field[],
}
