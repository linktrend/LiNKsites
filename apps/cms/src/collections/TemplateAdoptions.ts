import type { CollectionBeforeChangeHook, CollectionConfig, Field } from 'payload'
import { createAccess } from '@/access'
import { createSiteFilteredAccess } from '@/admin/utils/siteFilterOptions'
import { localeField } from '@/fields/localeField'
import { siteField } from '@/fields/siteField'
import { LS03_ADOPTION_STATES, SHA1_IDENTITY } from '@/payload/ls03/semanticContract'
import { ImmutableRecordError, rejectImmutableDelete, rejectImmutableUpdate } from '@/hooks/enforceImmutableRecord'

/** Frozen LSG0-02 / LS-02 pins mirrored from factory-catalog; CMS cannot depend on that package. */
export const LSDATA01_RETAINED_PROVIDER = '0178894d6ce718bb7dff3c141892f82144e2d18c'
export const LSDATA01_RETAINED_ADAPTER = '6cab53da19ba390d392157dbcc38979f1a6c86b5'
export const LSDATA01_SCHEMA_PROVIDER_TREES = [
  'e389671f1dc19f6c1e17a2fd3520f4d9e3b1c139',
  '2ce580d54ffa7abbee77fe3710130b9e37c3c31f',
  '863e6b1f40def2df99aeb748dd9be570d28b1fb2',
] as const
export const LSDATA01_SCHEMA_ADAPTER = '2ce580d54ffa7abbee77fe3710130b9e37c3c31f'
export const LSDATA01_NON_ADMITTED_FIXTURE = 'b599c0f0ee6bc2aad3484aa42ef1fd9e86a05758'

const identityField = (name: string, label: string): Field => ({
  name,
  type: 'text',
  required: true,
  label,
  admin: {
    description: 'Exact lowercase 40-character SHA-1 identity',
  },
})

export const assertLsdata01TenantBoundary: CollectionBeforeChangeHook = ({ data, req }) => {
  const tenantOrgId = typeof data?.tenantOrgId === 'string' ? data.tenantOrgId : ''
  if (!tenantOrgId) {
    throw new ImmutableRecordError('Tenant authorization denied: tenantOrgId is required.')
  }
  const user = req.user as { assignedSites?: Array<string | number | { id?: string | number }>; orgId?: unknown } | undefined
  if (!user) {
    throw new ImmutableRecordError('Tenant authorization denied: unauthenticated actor.')
  }
  const actorOrgId = typeof user.orgId === 'string' ? user.orgId : undefined
  if (actorOrgId && actorOrgId !== tenantOrgId) {
    throw new ImmutableRecordError('Tenant authorization denied: org boundary is fail-closed.')
  }
}

export const assertAdoptionIdentities: CollectionBeforeChangeHook = ({ data }) => {
  if (!data) return
  const identities = data.identities as Record<string, unknown> | undefined
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
  const provider = identities.provider as string
  if (provider === LSDATA01_NON_ADMITTED_FIXTURE) {
    throw new ImmutableRecordError('Provider fixture trees are not production admission and cannot be activated.')
  }
  if (provider === LSDATA01_RETAINED_PROVIDER) {
    if (identities.adapter !== LSDATA01_RETAINED_ADAPTER) {
      throw new ImmutableRecordError('Retained production adapter pin does not match the H-09 tree.')
    }
    data.compatibilityClass = 'retained-production-pin'
    data.activationState = data.activationState ?? 'active'
    return
  }
  if ((LSDATA01_SCHEMA_PROVIDER_TREES as readonly string[]).includes(provider)) {
    if (identities.adapter !== LSDATA01_SCHEMA_ADAPTER) {
      throw new ImmutableRecordError('Schema-compatibility adapter identity must equal the frozen LSG0-02 Harness tree.')
    }
    if (data.activationState === 'active' || data.adoptionState === 'adopted') {
      throw new ImmutableRecordError('Frozen schema identities cannot activate production; rejected without partial activation.')
    }
    data.compatibilityClass = 'schema-compatibility-copy'
    data.activationState = 'inactive'
    return
  }
  throw new ImmutableRecordError('Unknown provider identity rejected without partial activation.')
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
    beforeChange: [assertLsdata01TenantBoundary, assertAdoptionIdentities, rejectImmutableUpdate],
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
      name: 'tenantOrgId',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Fail-closed tenant org boundary copied from the owning site.',
      },
    },
    {
      name: 'compatibilityClass',
      type: 'select',
      required: true,
      defaultValue: 'retained-production-pin',
      options: [
        { label: 'Retained production pin', value: 'retained-production-pin' },
        { label: 'Schema compatibility copy', value: 'schema-compatibility-copy' },
      ],
    },
    {
      name: 'activationState',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Inactive', value: 'inactive' },
        { label: 'Active', value: 'active' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },
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
