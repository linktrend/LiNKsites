import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryLedgerStore, ProgramLedger, ExecutorRegistry, runIssueOnce } from '@linksites/program-ledger'
import { PROMOTE_WORKING_PACKAGE_ISSUE_TYPE, PromotionExecutor } from '../src/executors/promotionExecutor.js'
import { PromotionService, type PayloadDraftTarget, type PromotionReceipt } from '../src/promotionService.js'

function buildTarget(overrides: Partial<PayloadDraftTarget> = {}): PayloadDraftTarget {
  return {
    async upsertDraft(_collection, externalKey) {
      return { payloadDocumentId: `doc-${externalKey}`, resultChecksum: `checksum-${externalKey}` }
    },
    async readback(payloadDocumentId) {
      return { id: payloadDocumentId }
    },
    ...overrides,
  }
}

const VALID_REQUEST_INPUT = {
  schemaVersion: { major: 1, minor: 0 },
  promotionRequestId: 'promo-req-1',
  idempotencyKey: 'idem-1',
  targetSiteId: 'site-1',
  targetState: 'draft' as const,
  workingPackage: {
    workingPackageId: 'pkg-1',
    workingPackageVersion: 1,
    packageChecksum: 'checksum-1',
    items: [
      { sourceItemId: 'item-1', payloadCollection: 'pages', payloadOperation: 'create' as const, targetExternalKey: 'home', data: { title: 'Home' } },
    ],
  },
  assemblyManifestId: 'manifest-1',
  requiredGateReceiptIds: [],
}

let ledger: ProgramLedger
let registry: ExecutorRegistry
let promotionService: PromotionService

beforeEach(() => {
  ledger = new ProgramLedger(new InMemoryLedgerStore())
  registry = new ExecutorRegistry()
  promotionService = new PromotionService(buildTarget())
  registry.register(new PromotionExecutor({ promotionService }))
})

describe('PromotionExecutor, driven end-to-end through the Program Ledger', () => {
  it('succeeds when every item promotes and passes readback', async () => {
    const issue = await ledger.createIssue({
      issueType: PROMOTE_WORKING_PACKAGE_ISSUE_TYPE,
      programRef: 'linksites-manual-alignment',
      input: VALID_REQUEST_INPUT,
    })

    const run = await runIssueOnce(ledger, registry, issue.issueId)

    expect(run.state).toBe('succeeded')
    const receipt = run.output as PromotionReceipt
    expect(receipt.status).toBe('succeeded')
    expect(receipt.itemResults).toHaveLength(1)
    expect(receipt.itemResults[0].status).toBe('succeeded')
  })

  it('fails the Run as transient_infrastructure (safe to retry) when an item fails readback verification', async () => {
    promotionService = new PromotionService(buildTarget({ async readback() { return null } }))
    registry = new ExecutorRegistry()
    registry.register(new PromotionExecutor({ promotionService }))

    const issue = await ledger.createIssue({
      issueType: PROMOTE_WORKING_PACKAGE_ISSUE_TYPE,
      programRef: 'linksites-manual-alignment',
      input: VALID_REQUEST_INPUT,
    })

    const run = await runIssueOnce(ledger, registry, issue.issueId)

    expect(run.state).toBe('failed_retryable')
    expect(run.failure?.failureClass).toBe('transient_infrastructure')
    expect(run.failure?.message).toContain('readback')
  })

  it('does not re-promote on a ledger retry of the same Issue with the same idempotencyKey (Promotion Service idempotency, manual §12.23)', async () => {
    let upsertCallCount = 0
    promotionService = new PromotionService(
      buildTarget({
        async upsertDraft(_collection, externalKey) {
          upsertCallCount += 1
          return { payloadDocumentId: `doc-${externalKey}`, resultChecksum: `checksum-${externalKey}` }
        },
      }),
    )
    registry = new ExecutorRegistry()
    registry.register(new PromotionExecutor({ promotionService }))

    const issue = await ledger.createIssue({
      issueType: PROMOTE_WORKING_PACKAGE_ISSUE_TYPE,
      programRef: 'linksites-manual-alignment',
      input: VALID_REQUEST_INPUT,
    })

    await runIssueOnce(ledger, registry, issue.issueId)
    expect(upsertCallCount).toBe(1)

    // Directly re-invoke the same PromotionService (shared instance, as required) with the identical request,
    // simulating a safe retry outside the ledger -- upsertDraft must not be called again.
    await promotionService.promote(VALID_REQUEST_INPUT)
    expect(upsertCallCount).toBe(1)
  })

  it('fails with invalid_input on malformed input without throwing', async () => {
    const issue = await ledger.createIssue({
      issueType: PROMOTE_WORKING_PACKAGE_ISSUE_TYPE,
      programRef: 'linksites-manual-alignment',
      input: { promotionRequestId: 'incomplete' },
    })

    const run = await runIssueOnce(ledger, registry, issue.issueId)

    expect(run.state).toBe('failed_terminal')
    expect(run.failure?.failureClass).toBe('invalid_input')
  })
})
