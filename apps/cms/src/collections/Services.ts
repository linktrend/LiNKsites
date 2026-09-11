import type { CollectionBeforeChangeHook, CollectionConfig, Field } from 'payload'
import { createAccess, deleteAccess, updateAccess } from '@/access'
import { createSiteFilteredAccess } from '@/admin/utils/siteFilterOptions'
import { localeField } from '@/fields/localeField'
import { provenanceFields } from '@/fields/provenanceFields'
import { seoFields } from '@/fields/seoFields'
import { siteField } from '@/fields/siteField'
import { createSlugField } from '@/fields/slugField'
import { workflowFields } from '@/fields/workflowFields'
import { injectDefaultSEO } from '@/hooks/injectDefaultSEO'
import { triggerRebuild } from '@/hooks/triggerRebuild'

export const assertFixedServiceKind: CollectionBeforeChangeHook = ({ data }) => {
  if (!data) return
  if (data.semanticKind != null && data.semanticKind !== 'service') {
    throw new Error('Services remain semantically distinct from Products; incompatible kind rejected without activation.')
  }
  data.semanticKind = 'service'
}

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'serviceCode', 'site', 'status', 'updatedAt'],
    description: 'Canonical offered services. Semantically distinct from Products. Offers are a deprecated projection.',
  },
  access: {
    read: createSiteFilteredAccess(),
    create: createAccess,
    update: updateAccess,
    delete: deleteAccess,
  },
  versions: { drafts: true },
  hooks: {
    beforeChange: [assertFixedServiceKind, injectDefaultSEO],
    afterChange: [triggerRebuild],
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    createSlugField('services'),
    {
      name: 'semanticKind',
      type: 'select',
      required: true,
      defaultValue: 'service',
      options: [{ label: 'Service', value: 'service' }],
      admin: { readOnly: true, description: 'Fixed service kind; never a product' },
    },
    { name: 'serviceCode', type: 'text', index: true },
    { name: 'summary', type: 'textarea', required: true, localized: true },
    { name: 'description', type: 'richText', localized: true },
    { name: 'featuredImage', type: 'upload', relationTo: 'media' },
    ...seoFields,
    siteField,
    localeField,
    ...workflowFields,
    ...provenanceFields,
  ] satisfies Field[],
}
