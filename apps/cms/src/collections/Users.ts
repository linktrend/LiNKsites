import type { CollectionConfig, Field } from 'payload'
import { manageUsersAccess } from '@/access'
import { isBootstrapMode } from '@/utils/bootstrap'

export const Users: CollectionConfig<'users'> = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'roles'],
    group: 'Settings',
  },
  auth: {
    useAPIKey: true,
  },
  access: {
    // Allow any authenticated admin user to see the Users collection in the UI
    read: ({ req }) => Boolean(req.user),
    create: manageUsersAccess,
    update: ({ req, id }) => {
      // Users can update their own profile
      if (req.user?.id === id) return true
      // Or have manage users permission
      return manageUsersAccess({ req })
    },
    delete: manageUsersAccess,
  },
  fields: [
    {
      name: 'firstName',
      type: 'text',
      required: false,
    },
    {
      name: 'lastName',
      type: 'text',
      required: false,
    },
    {
      name: 'roles',
      type: 'relationship',
      relationTo: 'roles',
      hasMany: true,
      required: true,
      admin: {
        description: 'Roles assigned to this user',
        // Ensure roles field is visible during bootstrap
        condition: () => true,
      },
      access: {
        read: async ({ req }) => {
          if (await isBootstrapMode(req)) return true
          const hasAccess = await manageUsersAccess({ req })
          return hasAccess ? true : false
        },
      },
      filterOptions: async ({ req }) => {
        // During bootstrap, avoid any site/user scoping filters
        if (await isBootstrapMode(req)) {
          return true
        }
        return true
      },
    },
    {
      name: 'assignedSites',
      type: 'relationship',
      relationTo: 'sites',
      hasMany: true,
      required: true,
      admin: {
        description: 'Sites this user has access to',
      },
    },
    {
      name: 'allowedLocales',
      type: 'text',
      hasMany: true,
      required: true,
      admin: {
        description: 'Locales this user can access (e.g., en, es, fr)',
      },
    },
  ] satisfies Field[],
}
