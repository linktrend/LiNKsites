import type { CollectionConfig, Field } from 'payload'
import { adminAccess } from '@/access'
import { isBootstrapMode } from '@/utils/bootstrap'

export const Languages: CollectionConfig<'languages'> = {
  slug: 'languages',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['code', 'name', 'isDefault'],
  },
  access: {
    read: async ({ req }) => {
      if (await isBootstrapMode(req)) return true
      return adminAccess({ req })
    },
    create: adminAccess,
    update: adminAccess,
    delete: adminAccess,
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'ISO 639-1 language code (e.g., en, es, fr)',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Language name (e.g., English, Spanish)',
      },
    },
    {
      name: 'isDefault',
      type: 'checkbox',
      label: 'Default Language',
      defaultValue: false,
      admin: {
        description: 'Set as default language for the CMS',
      },
    },
  ] satisfies Field[],
}
