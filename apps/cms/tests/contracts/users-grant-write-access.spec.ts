import { beforeValidateTraverseFields, executeAccess } from 'payload'
import { describe, expect, it, vi } from 'vitest'
import { Users } from '@/collections/Users'
import { hasLocaleAccess, hasSiteAccess } from '@/utils/resolvePermissions'

// Even a true bootstrap read hint must not authorize untrusted grant writes.
// Trusted bootstrap uses the server-side Local API overrideAccess option.
vi.mock('@/utils/bootstrap', () => ({ isBootstrapMode: vi.fn(async () => true) }))

const original = {
  id: 7, firstName: 'Original', lastName: 'Name',
  roles: [11], assignedSites: [21], allowedLocales: ['en'],
}
const editor = { ...original, roles: [{ id: 11, name: 'editor' }] }
const escalation = {
  firstName: 'Updated', lastName: 'Profile',
  roles: [99], assignedSites: [999], allowedLocales: ['zh-tw'],
}

async function writeFields(user: unknown, operation: 'create' | 'update', overrideAccess = false) {
  const data = structuredClone(escalation)
  const doc = operation === 'update' ? structuredClone(original) : {}
  const req = {
    user, context: { bootstrapUsersEmpty: true },
    // Client-supplied bypass and privilege claims must not become authority.
    data: { ...data, overrideAccess: true, permissions: { manage_users: true } },
    payload: { collections: {} }, t: (key: string) => key,
  }
  await beforeValidateTraverseFields({
    id: 7, collection: Users, global: null, context: req.context,
    data, doc, fields: Users.fields, operation, overrideAccess,
    parentIndexPath: '', parentPath: '', parentSchemaPath: '',
    req, siblingData: data, siblingDoc: doc,
  } as never)
  return { data, req }
}

describe('Users privilege-bearing field writes', () => {
  it.each(['roles', 'assignedSites', 'allowedLocales'])(
    'defines explicit create and update rules for %s', (name) => {
      const field = Users.fields.find((item) => 'name' in item && item.name === name)
      expect(field && 'access' in field && field.access?.create).toBeTypeOf('function')
      expect(field && 'access' in field && field.access?.update).toBeTypeOf('function')
    },
  )

  it.each([
    null, undefined, {}, { roles: [] }, { roles: [42] }, { roles: ['unknown'] },
    editor, { roles: [{ name: 'manager' }] },
    { roles: [{ name: 'service-publisher', permissions: { publish: true } }] },
    { roles: [{ name: 'custom', permissions: { manage_users: 'true' } }] },
  ])('preserves existing grants against an unauthorized update: %j', async (user) => {
    const { data } = await writeFields(user, 'update')
    expect(data).toEqual({
      firstName: 'Updated', lastName: 'Profile', roles: original.roles,
      assignedSites: original.assignedSites, allowedLocales: original.allowedLocales,
    })
  })

  it('allows a self-profile edit without role, site, locale, or unlock escalation', async () => {
    const { data, req } = await writeFields(editor, 'update')
    await expect(executeAccess({ id: 7, req } as never, Users.access?.update)).resolves.toBe(true)
    expect(data.firstName).toBe('Updated')
    expect(data.lastName).toBe('Profile')
    expect(data.roles).toEqual(original.roles)
    expect(data.assignedSites).toEqual(original.assignedSites)
    expect(data.allowedLocales).toEqual(original.allowedLocales)
    // Relationships remain unchanged, so the next hydrated user retains the
    // original role rather than acquiring the requested privileged role 99.
    const nextUser = { ...editor, ...data, roles: editor.roles }
    expect(hasSiteAccess(nextUser as never, '999')).toBe(false)
    expect(hasLocaleAccess(nextUser as never, 'zh-tw')).toBe(false)
    await expect(executeAccess({ req: { ...req, user: nextUser } } as never, Users.access?.unlock))
      .rejects.toMatchObject({ status: 403 })
  })

  it('rejects ordinary updates to another user at the collection boundary', async () => {
    const { req } = await writeFields(editor, 'update')
    await expect(executeAccess({ id: 8, req } as never, Users.access?.update))
      .rejects.toMatchObject({ status: 403 })
  })

  it.each([null, editor])('does not allow untrusted bootstrap or ordinary user creation: %j', async (user) => {
    const { data, req } = await writeFields(user, 'create')
    expect(data.roles).toBeUndefined()
    expect(data.assignedSites).toBeUndefined()
    expect(data.allowedLocales).toBeUndefined()
    await expect(executeAccess({ req } as never, Users.access?.create))
      .rejects.toMatchObject({ status: 403 })
  })

  for (const operation of ['create', 'update'] as const) {
    it.each([
      { roles: [{ name: 'admin' }] },
      { roles: [{ name: 'super-admin' }] },
      { roles: [{ name: 'governed-user-manager', permissions: { manage_users: true } }] },
    ])(`preserves trusted user-management grants during ${operation}: %j`, async (user) => {
      const { data, req } = await writeFields(user, operation)
      expect(data).toEqual(escalation)
      await expect(executeAccess({ id: 8, req } as never, Users.access?.[operation])).resolves.toBe(true)
    })

    it(`preserves explicit trusted Local API bootstrap ${operation}`, async () => {
      const { data } = await writeFields(null, operation, true)
      expect(data).toEqual(escalation)
    })
  }
})
