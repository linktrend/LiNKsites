import type { CollectionConfig, Field } from 'payload'
import { manageRolesAccess } from '@/access'
import { isBootstrapMode } from '@/utils/bootstrap'

export const Roles: CollectionConfig<'roles'> = {
  slug: 'roles',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'description', 'isDefault'],
  },
  access: {
    read: async ({ req }) => {
      if (await isBootstrapMode(req)) return true
      return manageRolesAccess({ req })
    },
    create: async ({ req }) => {
      if (await isBootstrapMode(req)) return true
      return manageRolesAccess({ req })
    },
    update: async ({ req }) => {
      if (await isBootstrapMode(req)) return true
      return manageRolesAccess({ req })
    },
    delete: manageRolesAccess,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique role name (e.g., super-admin, editor)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Description of this role and its permissions',
      },
    },
    {
      name: 'permissions',
      type: 'group',
      label: 'Permissions',
      fields: [
        {
          name: 'read',
          type: 'checkbox',
          label: 'Read',
          defaultValue: true,
        },
        {
          name: 'create',
          type: 'checkbox',
          label: 'Create',
          defaultValue: false,
        },
        {
          name: 'update',
          type: 'checkbox',
          label: 'Update',
          defaultValue: false,
        },
        {
          name: 'delete',
          type: 'checkbox',
          label: 'Delete',
          defaultValue: false,
        },
        {
          name: 'publish',
          type: 'checkbox',
          label: 'Publish',
          defaultValue: false,
        },
        {
          name: 'approve',
          type: 'checkbox',
          label: 'Approve',
          defaultValue: false,
        },
        {
          name: 'submit_for_review',
          type: 'checkbox',
          label: 'Submit for Review',
          defaultValue: false,
        },
        {
          name: 'manage_users',
          type: 'checkbox',
          label: 'Manage Users',
          defaultValue: false,
        },
        {
          name: 'manage_roles',
          type: 'checkbox',
          label: 'Manage Roles',
          defaultValue: false,
        },
        {
          name: 'manage_sites',
          type: 'checkbox',
          label: 'Manage Sites',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'isDefault',
      type: 'checkbox',
      label: 'Default Role',
      defaultValue: false,
      admin: {
        description: 'Assign this role to new users by default',
      },
    },
  ] satisfies Field[],
}
