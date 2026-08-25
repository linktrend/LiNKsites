import type { CollectionConfig, Field } from 'payload'
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

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'sku', 'site', 'status', 'updatedAt'],
    description: 'Canonical sellable products. Semantically distinct from Services. Offers are a deprecated projection.',
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
    createSlugField('products'),
    {
      name: 'semanticKind',
      type: 'select',
      required: true,
      defaultValue: 'product',
      options: [{ label: 'Product', value: 'product' }],
      admin: { readOnly: true, description: 'Fixed product kind; never a service' },
    },
    { name: 'sku', type: 'text', index: true },
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
