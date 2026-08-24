import type { CollectionConfig, Field } from 'payload'
import { createAccess } from '@/access'
import { createSiteFilteredAccess } from '@/admin/utils/siteFilterOptions'
import { localeField } from '@/fields/localeField'
import { siteField } from '@/fields/siteField'
import { LS03_CAPABILITY_PLANS } from '@/payload/ls03/semanticContract'
import { rejectImmutableDelete, rejectImmutableUpdate } from '@/hooks/enforceImmutableRecord'

export const EntitlementSnapshots: CollectionConfig = {
  slug: 'entitlement-snapshots',
  admin: {
    useAsTitle: 'snapshotId',
    defaultColumns: ['snapshotId', 'planId', 'grantedCredits', 'site', 'updatedAt'],
    description: 'Immutable A/B/C/L entitlement snapshots. Mutation is rejected and rolled back to the original snapshot.',
  },
  access: {
    read: createSiteFilteredAccess(),
    create: createAccess,
    update: () => false,
    delete: () => false,
  },
  hooks: {
    beforeChange: [rejectImmutableUpdate],
    beforeDelete: [rejectImmutableDelete],
  },
  fields: [
    {
      name: 'snapshotId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    siteField,
    localeField,
    {
      name: 'siteRef',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'planId',
      type: 'select',
      required: true,
      options: LS03_CAPABILITY_PLANS.map((value) => ({ label: `Plan ${value}`, value })),
    },
    {
      name: 'grantedCredits',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'budgets',
      type: 'group',
      required: true,
      fields: [
        { name: 'A', type: 'number', required: true, defaultValue: 30 },
        { name: 'B', type: 'number', required: true, defaultValue: 15 },
        { name: 'C', type: 'number', required: true, defaultValue: 6 },
        { name: 'L', type: 'number', required: true, defaultValue: 0 },
      ],
    },
    {
      name: 'schemaVersion',
      type: 'group',
      fields: [
        { name: 'major', type: 'number', required: true, defaultValue: 1 },
        { name: 'minor', type: 'number', required: true, defaultValue: 0 },
      ],
    },
    {
      name: 'digest',
      type: 'text',
      required: true,
    },
    {
      name: 'beforeRecord',
      type: 'json',
    },
    {
      name: 'afterRecord',
      type: 'json',
    },
    {
      name: 'rollbackRecord',
      type: 'json',
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
  ] satisfies Field[],
}
