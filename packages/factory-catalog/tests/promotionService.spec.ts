import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  PromotionService,
  PromotionServiceError,
  type PayloadDraftTarget,
  type PromotionRequest,
  type WorkingPackageItem,
} from '../src/promotionService.js'

/**
 * A controllable in-memory PayloadDraftTarget test double. Behavior per
 * item is configured by external-key: `failUpsertFor` makes
 * `upsertDraft` throw for those keys; `failReadbackFor` makes
 * `readback` return null for the resulting document id (derived
 * deterministically from the external key so tests can name it ahead
 * of time).
 */
function buildTarget(options: { failUpsertFor?: string[]; failReadbackFor?: string[] } = {}) {
  const failUpsertFor = new Set(options.failUpsertFor ?? [])
  const failReadbackFor = new Set(options.failReadbackFor ?? [])
  const upsertDraft = vi.fn(async (_collection: string, externalKey: string, _data: Record<string, unknown>) => {
    if (failUpsertFor.has(externalKey)) {
      throw new Error(`simulated upsert failure for "${externalKey}"`)
    }
    return { payloadDocumentId: `doc-${externalKey}`, resultChecksum: `checksum-${externalKey}` }
  })
  const readback = vi.fn(async (payloadDocumentId: string) => {
    const externalKey = payloadDocumentId.replace(/^doc-/, '')
    if (failReadbackFor.has(externalKey)) {
      return null
    }
    return { payloadDocumentId }
  })
  const target: PayloadDraftTarget = { upsertDraft, readback }
  return { target, upsertDraft, readback }
}

function buildItem(overrides: Partial<WorkingPackageItem> = {}): WorkingPackageItem {
  return {
    sourceItemId: 'item-1',
    payloadCollection: 'pages',
    payloadOperation: 'create',
    targetExternalKey: 'key-1',
    data: { title: 'Home' },
    ...overrides,
  }
}

function buildRequest(overrides: Partial<PromotionRequest> = {}): PromotionRequest {
  return {
    schemaVersion: { major: 1, minor: 0 },
    promotionRequestId: 'promotion-request-1',
    idempotencyKey: 'idem-1',
    targetSiteId: 'site-1',
    targetState: 'draft',
    workingPackage: {
      workingPackageId: 'working-package-1',
      workingPackageVersion: 1,
      packageChecksum: 'checksum-a',
      items: [buildItem()],
    },
    assemblyManifestId: 'assembly-manifest-1',
    requiredGateReceiptIds: ['gate-receipt-1'],
    ...overrides,
  }
}

describe('PromotionService draft-only scope', () => {
  it('receipt is produced from a request whose targetState is always draft', async () => {
    const { target } = buildTarget()
    const service = new PromotionService(target)
    const receipt = await service.promote(buildRequest())
    expect(receipt.status).toBe('succeeded')
  })
})

describe('PromotionService happy path', () => {
  it('all items succeed and pass readback -> succeeded with non-null draftReleaseId', async () => {
    const { target } = buildTarget()
    const service = new PromotionService(target)
    const request = buildRequest({
      workingPackage: {
        workingPackageId: 'wp-1',
        workingPackageVersion: 1,
        packageChecksum: 'checksum-a',
        items: [buildItem({ sourceItemId: 'item-1', targetExternalKey: 'key-1' }), buildItem({ sourceItemId: 'item-2', targetExternalKey: 'key-2' })],
      },
    })
    const receipt = await service.promote(request)

    expect(receipt.status).toBe('succeeded')
    expect(receipt.draftReleaseId).not.toBeNull()
    expect(receipt.itemResults).toHaveLength(2)
    expect(receipt.itemResults[0]).toMatchObject({
      sourceItemId: 'item-1',
      payloadDocumentId: 'doc-key-1',
      resultChecksum: 'checksum-key-1',
      status: 'succeeded',
    })
    expect(receipt.itemResults[1]).toMatchObject({
      sourceItemId: 'item-2',
      payloadDocumentId: 'doc-key-2',
      resultChecksum: 'checksum-key-2',
      status: 'succeeded',
    })
    expect(receipt.requiredGateReceiptIds).toEqual(['gate-receipt-1'])
  })
})

describe('PromotionService partial failure (upsertDraft throws)', () => {
  it('failing item is marked failed with a failureReason, others still succeed, overall status is partial', async () => {
    const { target } = buildTarget({ failUpsertFor: ['key-bad'] })
    const service = new PromotionService(target)
    const request = buildRequest({
      workingPackage: {
        workingPackageId: 'wp-2',
        workingPackageVersion: 1,
        packageChecksum: 'checksum-a',
        items: [
          buildItem({ sourceItemId: 'item-1', targetExternalKey: 'key-1' }),
          buildItem({ sourceItemId: 'item-2', targetExternalKey: 'key-bad' }),
        ],
      },
    })
    const receipt = await service.promote(request)

    expect(receipt.status).toBe('partial')
    const failedItem = receipt.itemResults.find((r) => r.sourceItemId === 'item-2')
    expect(failedItem?.status).toBe('failed')
    expect(failedItem?.failureReason).toMatch(/simulated upsert failure/)
    expect(failedItem?.payloadDocumentId).toBeNull()
    const succeededItem = receipt.itemResults.find((r) => r.sourceItemId === 'item-1')
    expect(succeededItem?.status).toBe('succeeded')
  })
})

describe('PromotionService readback failure', () => {
  it('write succeeds but readback returns null -> item is failed, not succeeded (must not regress to write-only success)', async () => {
    const { target, upsertDraft } = buildTarget({ failReadbackFor: ['key-1'] })
    const service = new PromotionService(target)
    const request = buildRequest({
      workingPackage: {
        workingPackageId: 'wp-3',
        workingPackageVersion: 1,
        packageChecksum: 'checksum-a',
        items: [buildItem({ sourceItemId: 'item-1', targetExternalKey: 'key-1' })],
      },
    })
    const receipt = await service.promote(request)

    // The write itself must have actually happened (proving this test
    // exercises the write-succeeds-but-readback-fails path, not a
    // write failure).
    expect(upsertDraft).toHaveBeenCalledTimes(1)

    expect(receipt.status).toBe('failed')
    expect(receipt.itemResults).toHaveLength(1)
    expect(receipt.itemResults[0].status).toBe('failed')
    expect(receipt.itemResults[0].failureReason).toMatch(/readback verification failed/)
    // The document id from the successful write is still recorded for
    // audit/debugging, even though the item is not considered succeeded.

    expect(receipt.itemResults[0].payloadDocumentId).toBe('doc-key-1')
  })

  it('readback() itself throwing (not just returning null) is also treated as a failed item, not an unhandled crash', async () => {
    const target: PayloadDraftTarget = {
      upsertDraft: vi.fn(async (_collection, externalKey) => ({ payloadDocumentId: `doc-${externalKey}`, resultChecksum: `checksum-${externalKey}` })),
      readback: vi.fn(async () => {
        throw new Error('simulated readback transport error')
      }),
    }
    const service = new PromotionService(target)
    const request = buildRequest({
      workingPackage: {
        workingPackageId: 'wp-readback-throws',
        workingPackageVersion: 1,
        packageChecksum: 'checksum-a',
        items: [buildItem({ sourceItemId: 'item-1', targetExternalKey: 'key-1' })],
      },
    })

    const receipt = await service.promote(request)

    expect(receipt.status).toBe('failed')
    expect(receipt.itemResults[0].status).toBe('failed')
    expect(receipt.itemResults[0].payloadDocumentId).toBe('doc-key-1')
    expect(receipt.itemResults[0].failureReason).toMatch(/readback verification failed.*simulated readback transport error/)
  })
})

describe('PromotionService full failure', () => {
  it('every item fails -> overall status failed, draftReleaseId is null', async () => {
    const { target } = buildTarget({ failUpsertFor: ['key-1', 'key-2'] })
    const service = new PromotionService(target)
    const request = buildRequest({
      workingPackage: {
        workingPackageId: 'wp-4',
        workingPackageVersion: 1,
        packageChecksum: 'checksum-a',
        items: [
          buildItem({ sourceItemId: 'item-1', targetExternalKey: 'key-1' }),
          buildItem({ sourceItemId: 'item-2', targetExternalKey: 'key-2' }),
        ],
      },
    })
    const receipt = await service.promote(request)

    expect(receipt.status).toBe('failed')
    expect(receipt.draftReleaseId).toBeNull()
    expect(receipt.itemResults.every((r) => r.status === 'failed')).toBe(true)
  })
})

describe('PromotionService idempotency (manual §12.23)', () => {
  let target: PayloadDraftTarget
  let upsertDraft: ReturnType<typeof vi.fn>

  beforeEach(() => {
    const built = buildTarget()
    target = built.target
    upsertDraft = built.upsertDraft
  })

  it('same idempotency key + same checksum returns the same receipt content and does not re-call upsertDraft', async () => {
    const service = new PromotionService(target)
    const request = buildRequest({ idempotencyKey: 'idem-same', workingPackage: { workingPackageId: 'wp-5', workingPackageVersion: 1, packageChecksum: 'checksum-a', items: [buildItem()] } })

    const first = await service.promote(request)
    expect(upsertDraft).toHaveBeenCalledTimes(1)

    const second = await service.promote(request)
    expect(upsertDraft).toHaveBeenCalledTimes(1)
    expect(second).toEqual(first)
  })

  it('same idempotency key + different checksum throws PromotionServiceError', async () => {
    const service = new PromotionService(target)
    const first = buildRequest({
      idempotencyKey: 'idem-conflict',
      workingPackage: { workingPackageId: 'wp-6', workingPackageVersion: 1, packageChecksum: 'checksum-a', items: [buildItem()] },
    })
    await service.promote(first)

    const second = buildRequest({
      idempotencyKey: 'idem-conflict',
      workingPackage: { workingPackageId: 'wp-6', workingPackageVersion: 2, packageChecksum: 'checksum-b', items: [buildItem()] },
    })
    await expect(service.promote(second)).rejects.toThrow(PromotionServiceError)
  })
})

describe('PromotionService empty items', () => {
  it('empty items array -> status succeeded with empty itemResults', async () => {
    const { target, upsertDraft } = buildTarget()
    const service = new PromotionService(target)
    const request = buildRequest({
      workingPackage: { workingPackageId: 'wp-7', workingPackageVersion: 1, packageChecksum: 'checksum-a', items: [] },
    })
    const receipt = await service.promote(request)

    expect(receipt.status).toBe('succeeded')
    expect(receipt.itemResults).toEqual([])
    expect(upsertDraft).not.toHaveBeenCalled()
  })
})
