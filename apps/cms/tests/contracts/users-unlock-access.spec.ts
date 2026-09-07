import { executeAccess, unlockOperation } from 'payload'
import { describe, expect, it, vi } from 'vitest'
import { Users } from '@/collections/Users'
import { manageUsersAccess } from '@/access'

// Bootstrap is not authority to unlock accounts. Keep this unrelated helper
// isolated so these access tests never connect to a database.
vi.mock('@/utils/bootstrap', () => ({ isBootstrapMode: vi.fn(async () => true) }))

const request = (user: unknown, extra: Record<string, unknown> = {}) => ({
  user,
  t: (key: string) => key,
  context: { bootstrapUsersEmpty: true },
  data: { email: 'target@example.invalid' },
  ...extra,
})

const authorize = (user: unknown, extra: Record<string, unknown> = {}) =>
  executeAccess({ req: request(user, extra) as never }, Users.access?.unlock)

describe('Users account unlock authorization (GHSA-jg8r-5jh2-v2xj)', () => {
  it('explicitly uses the existing user-management permission boundary', () => {
    expect(Users.access?.unlock).toBe(manageUsersAccess)
  })

  it.each([null, undefined, {}, { roles: [] }, { roles: [42] }, { roles: ['unknown'] }])(
    'denies absent or unresolved authority: %j', async (user) => {
      await expect(authorize(user)).rejects.toMatchObject({ status: 403 })
    },
  )

  it.each(['manager', 'editor', 'viewer', 'translator', 'publisher'])(
    'denies authenticated %s even for its own email or assigned site', async (name) => {
      await expect(authorize({
        id: 1, email: 'target@example.invalid', roles: [{ name }],
        assignedSites: [1], allowedLocales: ['en'],
      })).rejects.toMatchObject({ status: 403 })
    },
  )

  it('does not elevate site-scoped publisher grants or a request-body role claim', async () => {
    const user = { roles: [{ name: 'service-publisher', permissions: { publish: true, manage_users: false } }] }
    await expect(authorize(user, {
      data: { email: 'target@example.invalid', roles: [{ name: 'super-admin' }] },
      meta: { org_id: 'another-org' },
    })).rejects.toMatchObject({ status: 403 })
    await expect(authorize({ roles: [{ name: 'custom', permissions: { manage_users: 'true' } }] }))
      .rejects.toMatchObject({ status: 403 })
  })

  it.each(['admin', 'super-admin'])('allows the existing privileged %s role', async (name) => {
    await expect(authorize({ roles: [{ name }] })).resolves.toBe(true)
  })

  it('allows an explicit boolean user-management grant from a trusted role', async () => {
    await expect(authorize({ roles: [{ name: 'governed-user-manager', permissions: { manage_users: true } }] }))
      .resolves.toBe(true)
  })

  it('blocks the real Payload unlock operation before target lookup or mutation', async () => {
    const db = { findOne: vi.fn(), updateOne: vi.fn() }
    await expect(unlockOperation({
      collection: { config: Users }, overrideAccess: false,
      data: { email: 'another-user@example.invalid' },
      req: request({ roles: [{ name: 'editor' }] }, { payload: { db } }),
    } as never)).rejects.toMatchObject({ status: 403 })
    expect(db.findOne).not.toHaveBeenCalled()
    expect(db.updateOne).not.toHaveBeenCalled()
  })

  it('lets a privileged caller reset the selected account through Payload', async () => {
    const db = {
      findOne: vi.fn(async () => ({ id: 2, loginAttempts: 5, lockUntil: '2099-01-01T00:00:00Z' })),
      updateOne: vi.fn(async () => ({})),
    }
    await expect(unlockOperation({
      collection: { config: Users }, overrideAccess: false,
      data: { email: 'another-user@example.invalid' },
      req: request({ roles: [{ name: 'admin' }] }, { payload: { db } }),
    } as never)).resolves.toBe(true)
    expect(db.findOne).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'users', where: { and: [{}, { email: { equals: 'another-user@example.invalid' } }] },
    }))
    expect(db.updateOne).toHaveBeenCalledWith(expect.objectContaining({
      id: 2, collection: 'users', data: { lockUntil: null, loginAttempts: 0 },
    }))
  })
})
