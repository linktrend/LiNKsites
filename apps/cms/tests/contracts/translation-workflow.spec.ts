import { beforeEach, describe, expect, it, vi } from 'vitest'
import { syncTranslationsAfterChange } from '@/hooks/syncTranslations'
import { processTranslationQueueAction } from '@/hooks/translationQueueActions'

const mocks = vi.hoisted(() => ({
  cacheInvalidatePattern: vi.fn(async () => 1),
  applyTranslation: vi.fn(async () => {}),
  detectMissingLocales: vi.fn(() => ['es']),
}))

vi.mock('@/payload/utils/cache', () => ({
  cacheInvalidatePattern: mocks.cacheInvalidatePattern,
}))

vi.mock('@/utils/translation', () => ({
  detectMissingLocales: mocks.detectMissingLocales,
  applyTranslation: mocks.applyTranslation,
}))

const baseReq = () =>
  ({
    locale: 'en',
    payload: {
      config: {
        localization: { locales: [{ code: 'en' }, { code: 'es' }], defaultLocale: 'en' },
        collections: [{ slug: 'articles', fields: [] }],
      },
      find: vi.fn(async () => ({ docs: [] })),
      findByID: vi.fn(async () => ({ id: 'doc-1', site: { id: 'site-1' } })),
      create: vi.fn(async (input: unknown) => input),
      delete: vi.fn(),
      update: vi.fn(),
    },
    context: {},
  } as unknown)

describe('Translation workflow contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates translation queue entry and links to source document', async () => {
    const req = baseReq()
    const doc = { id: 'doc-1', site: { id: 'site-1' }, title: 'Hello' }

    await syncTranslationsAfterChange({
      doc,
      req: req as never,
      collection: { slug: 'articles' } as never,
      context: {},
      operation: 'update',
      data: doc as never,
      previousDoc: null as never,
    })

    expect(mocks.detectMissingLocales).toHaveBeenCalled()
    const createCalls = (req as { payload: { create: ReturnType<typeof vi.fn> } }).payload.create.mock
      .calls
    expect(createCalls.length).toBeGreaterThan(0)
    expect(createCalls[0]?.[0]).toMatchObject({
      collection: 'translation-queue',
      data: expect.objectContaining({
        documentId: 'doc-1',
        collectionSlug: 'articles',
        targetLocale: 'es',
        site: 'site-1',
      }),
    })
    expect(mocks.cacheInvalidatePattern).toHaveBeenCalledWith('site:site-1')
  })

  it('completing a translation only updates localized fields and does not touch other locales', async () => {
    const doc = {
      id: 'queue-1',
      collectionSlug: 'articles',
      documentId: 'doc-1',
      sourceLocale: 'en',
      targetLocale: 'es',
      status: 'completed',
    }
    const req = {
      payload: {
        update: vi.fn(),
        delete: vi.fn(),
      },
      data: { status: 'completed', action: 'manual_complete' },
      context: {},
    }

    await processTranslationQueueAction({
      doc: doc as never,
      previousDoc: { ...doc, status: 'pending' } as never,
      req: req as never,
      operation: 'update',
      collection: { slug: 'translation-queue' } as never,
      context: {},
      data: { status: 'completed', action: 'manual_complete' } as never,
    })

    expect(mocks.applyTranslation).toHaveBeenCalledWith(
      req.payload,
      'articles',
      'doc-1',
      'en',
      'es',
      expect.objectContaining({
        context: expect.objectContaining({ skipTranslationSync: true }),
        queueId: 'queue-1',
      }),
    )
  })
})
