import { describe, expect, it, vi, beforeEach } from 'vitest'
import { validatePublishPermissions } from '@/hooks/validatePublishPermissions'
import { triggerRebuild } from '@/hooks/triggerRebuild'

const mocks = vi.hoisted(() => ({
  cacheInvalidatePattern: vi.fn(async () => 1),
  triggerSiteRebuild: vi.fn(async () => {}),
  triggerN8N: vi.fn(async () => {}),
}))

vi.mock('@/payload/utils/cache', () => ({
  cacheInvalidatePattern: mocks.cacheInvalidatePattern,
}))

vi.mock('@/utils/webhook', () => ({
  triggerSiteRebuild: mocks.triggerSiteRebuild,
}))

vi.mock('@/payload/utils/n8n', () => ({
  triggerN8N: mocks.triggerN8N,
}))

const publisherUser = {
  roles: [{ name: 'admin' }],
  assignedSites: ['site-1'],
  allowedLocales: ['en'],
}

const editorUser = {
  roles: [{ name: 'editor' }],
  assignedSites: ['site-1'],
  allowedLocales: ['en'],
}

const buildReq = (user: unknown, data: Record<string, unknown>) =>
  ({
    user,
    data,
    context: {},
    payload: {
      config: {
        localization: { defaultLocale: 'en' },
      },
      findByID: vi.fn(),
    },
  } as unknown)

describe('Publish permissions workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('allows draft → published for permitted roles', async () => {
    const data = { status: 'published', site: 'site-1', locale: 'en' }
    const updated = await validatePublishPermissions({
      collection: { slug: 'articles' } as never,
      context: {},
      operation: 'update',
      data,
      req: buildReq(publisherUser, data) as never,
      originalDoc: { status: 'pending', site: 'site-1', locale: 'en' },
    })

    expect(updated.status).toBe('published')
  })

  it('blocks published → draft for users without publish permission', async () => {
    const data = { status: 'draft', site: 'site-1', locale: 'en' }
    await expect(
      validatePublishPermissions({
        collection: { slug: 'articles' } as never,
        context: {},
        operation: 'update',
        data,
        req: buildReq(editorUser, data) as never,
        originalDoc: { status: 'published', site: 'site-1', locale: 'en' },
      }),
    ).rejects.toThrow(/Only publishers can revert/)
  })

  it('triggers rebuild, cache invalidation, and optional n8n hooks on publish', async () => {
    const data = { status: 'published', site: 'site-1', id: 'doc-1', locale: 'en' }
    const req = buildReq(publisherUser, data)
    await validatePublishPermissions({
      collection: { slug: 'articles' } as never,
      context: {},
      operation: 'update',
      data,
      req: req as never,
      originalDoc: { status: 'pending', site: 'site-1', id: 'doc-1', locale: 'en' },
    })

    await triggerRebuild({
      collection: { slug: 'articles' } as never,
      context: {},
      data,
      doc: data as never,
      req: req as never,
      operation: 'update',
      previousDoc: { status: 'pending', site: 'site-1', id: 'doc-1', locale: 'en' } as never,
    })

    expect(mocks.cacheInvalidatePattern).toHaveBeenCalledWith('site:site-1')
    expect(mocks.triggerSiteRebuild).toHaveBeenCalled()
    expect(mocks.triggerN8N).toHaveBeenCalled()
  })
})
