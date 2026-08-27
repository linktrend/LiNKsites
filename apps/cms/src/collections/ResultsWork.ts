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

export const ResultsWork: CollectionConfig = {
  slug: 'results-work',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'client', 'site', 'status', 'updatedAt'],
    description: 'Canonical Results/Work records. Case study pages remain a deprecated compatibility projection.',
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
    createSlugField('results-work'),
    { name: 'client', type: 'text', required: true },
    { name: 'industry', type: 'text', localized: true },
    { name: 'summary', type: 'textarea', localized: true },
    { name: 'outcome', type: 'richText', localized: true },
    { name: 'featuredImage', type: 'upload', relationTo: 'media' },
    {
      name: 'metrics',
      type: 'array',
      fields: [
        { name: 'metric', type: 'text', required: true, localized: true },
        { name: 'value', type: 'text', required: true },
      ],
    },
    ...seoFields,
    siteField,
    localeField,
    ...workflowFields,
    ...provenanceFields,
  ] satisfies Field[],
}
