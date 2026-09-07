import type { CollectionConfig, Field, FieldAccess } from 'payload'
import { manageUsersAccess } from '@/access'
import { isBootstrapMode } from '@/utils/bootstrap'

// Self-profile access must not let callers assign their own authority. Field
// access requires a boolean, so accept only the existing explicit global grant.
// Trusted Local API bootstrap retains its explicit overrideAccess path.
const manageUserGrantsAccess: FieldAccess = async ({ req }) =>
  (await manageUsersAccess({ req })) === true

export const Users: CollectionConfig<'users'> = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'roles'],
    group: 'Settings',
  },
  auth: {
    useAPIKey: true,
    // Collection access resolves a caller's site-scoped role grants.  Payload
    // must therefore hydrate the roles and assigned-sites relationships on
    // the authenticated request instead of supplying relationship IDs only.
    depth: 1,
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
    // Account recovery is user management, not ordinary authenticated access
    // (GHSA-jg8r-5jh2-v2xj). Do not inherit Payload's permissive unlock default.
    unlock: manageUsersAccess,
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
        create: manageUserGrantsAccess,
        update: manageUserGrantsAccess,
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
      access: {
        create: manageUserGrantsAccess,
        update: manageUserGrantsAccess,
      },
      admin: {
        description: 'Sites this user has access to',
      },
    },
    {
      name: 'allowedLocales',
      type: 'text',
      hasMany: true,
      required: true,
      access: {
        create: manageUserGrantsAccess,
        update: manageUserGrantsAccess,
      },
      admin: {
        description: 'Locales this user can access (e.g., en, es, fr)',
      },
    },
  ] satisfies Field[],
}
