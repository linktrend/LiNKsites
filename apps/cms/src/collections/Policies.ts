import type { CollectionConfig, Field } from 'payload'
import { createAccess, deleteAccess, updateAccess } from '@/access'
import { createSiteFilteredAccess } from '@/admin/utils/siteFilterOptions'
import { localeField } from '@/fields/localeField'
import { provenanceFields } from '@/fields/provenanceFields'
import { seoFields } from '@/fields/seoFields'
import { siteField } from '@/fields/siteField'
import { createSlugField } from '@/fields/slugField'
import { workflowFields } from '@/fields/workflowFields'
import { LS03_POLICY_KINDS } from '@/payload/ls03/semanticContract'
import { injectDefaultSEO } from '@/hooks/injectDefaultSEO'
import { triggerRebuild } from '@/hooks/triggerRebuild'

export const Policies: CollectionConfig = {
  slug: 'policies',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'policyKind', 'site', 'status', 'updatedAt'],
    description: 'Canonical policy records. Privacy/Terms/Cookie page collections remain compatibility projections.',
  },
  access: {
    read: createSiteFilteredAccess(),
    create: createAccess,
    update: updateAccess,
    delete: deleteAccess,
  },
  versions: { drafts: true },
  hooks: {
    beforeChange: [injectDefaultSEO],
    afterChange: [triggerRebuild],
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    createSlugField('policies'),
    {
      name: 'policyKind',
      type: 'select',
      required: true,
      options: LS03_POLICY_KINDS.map((value) => ({ label: value, value })),
    },
    { name: 'body', type: 'richText', required: true, localized: true },
    { name: 'lastReviewedAt', type: 'date' },
    ...seoFields,
    siteField,
    localeField,
    ...workflowFields,
    ...provenanceFields,
  ] satisfies Field[],
}
