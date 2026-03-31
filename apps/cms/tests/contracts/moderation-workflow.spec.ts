import { describe, expect, it } from 'vitest'
import { getSiteScopeConstraint, validateSiteAccess } from '@/utils/siteScope'
import { PermissionFlag } from '@/utils/permissions'
import { validateStatusTransition } from '@/utils/workflow'

const managerUser = {
  roles: [{ name: 'manager' }],
  assignedSites: ['site-1'],
  allowedLocales: ['en'],
}

const editorUser = {
  roles: [{ name: 'editor' }],
  assignedSites: ['site-1'],
  allowedLocales: ['en'],
}

const approveUser = {
  roles: [{ name: 'manager' }],
  assignedSites: ['site-1'],
  allowedLocales: ['en'],
  permissions: {
    [PermissionFlag.APPROVE]: true,
  },
}

describe('Moderation workflow contracts', () => {
  it('allows approve actions for users with approval permission', () => {
    const status = validateStatusTransition({
      existingStatus: 'pending',
      requestedStatus: 'published',
      user: approveUser as never,
      siteId: 'site-1',
    })
    expect(status).toBe('published')
  })

  it('blocks approve/reject actions for users without permission', () => {
    expect(() =>
      validateStatusTransition({
        existingStatus: 'pending',
        requestedStatus: 'published',
        user: editorUser as never,
        siteId: 'site-1',
      }),
    ).toThrow(/requires approval/)
  })

  it('returns queued items scope with minimal projection (site filter only)', () => {
    const where = getSiteScopeConstraint(managerUser as never)
    expect(where).toEqual({
      and: [
        {
          site: {
            equals: 'site-1',
          },
        },
        {
          locale: {
            equals: 'en',
          },
        },
      ],
    })

    const filtered = getSiteScopeConstraint(editorUser as never)
    expect(filtered).toMatchObject({
      and: expect.arrayContaining([
        expect.objectContaining({
          site: expect.anything(),
        }),
      ]),
    })
  })

  it('rejects moderation actions against unauthorized sites', () => {
    expect(() => validateSiteAccess(editorUser as never, 'site-2')).toThrow(/Access denied/)
  })
})
