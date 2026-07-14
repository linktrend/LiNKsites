/**
 * Promotion Service (Phase 3/4 boundary, Issue phase3-promotion-service-001).
 *
 * Manual §12 ("Supabase Working Layer, Payload Draft/Published Layers,
 * and Content Promotion"): the Promotion Service is the ONLY trusted
 * path by which approved working content -- prepared in a Supabase
 * "working layer" -- becomes a Payload CMS document. This module
 * intentionally implements a fixed, narrow slice of that doctrine:
 *
 * 1. Manual §12's draft-only scope: promotion targets a Payload
 *    **draft** only, never `published`. There is no publish operation
 *    anywhere in this file -- `PromotionRequest.targetState` is always
 *    the literal `'draft'`. Publication (draft -> published) is a
 *    separate, later authority, explicitly out of scope here.
 *
 * 2. Manual §12.23 (idempotency with checksum-conflict detection):
 *    retrying a promotion with the SAME `idempotencyKey` and the SAME
 *    `workingPackage.packageChecksum` is safe and returns the prior
 *    receipt without re-doing any write work. The SAME idempotency key
 *    reused with a DIFFERENT checksum is a contract conflict and is
 *    rejected via `PromotionServiceError` -- this is deliberately the
 *    specific, real invariant the manual calls out, not idempotency in
 *    the abstract.
 *
 * 3. Manual §12.21 step 10 / §12.51 item 11 (readback verification): a
 *    successful `upsertDraft()` write is NOT sufficient proof of
 *    success. Every item is verified by calling back into the target
 *    via `readback()` before that item may be recorded as succeeded.
 *    A write that succeeds but fails readback is recorded as failed,
 *    not succeeded, and the overall receipt status reflects that.
 *
 * 4. Manual §12.22 (item-level + package-level result ledger): the
 *    returned `PromotionReceipt` always carries per-item results
 *    (`itemResults`), and the overall `status` is mechanically derived
 *    from them (`'succeeded'` iff every item succeeded, `'failed'` iff
 *    every item failed, `'partial'` otherwise; an empty item list is
 *    `'succeeded'` with an empty ledger).
 *
 * This module only consumes the injected `PayloadDraftTarget`
 * interface (manual §12.18: no raw SQL into Payload-owned tables for
 * routine promotion) -- it never talks to a real database or a real
 * Payload instance itself. A real Payload-backed `PayloadDraftTarget`
 * implementation is future work once live infrastructure is available
 * (GAP-50); an in-memory test double is expected to be supplied by
 * callers/tests, not by this file.
 */

import type { SchemaVersion } from '@linksites/types'

export type PromotionItemOperation = 'create' | 'update'

export interface WorkingPackageItem {
  sourceItemId: string
  payloadCollection: string
  payloadOperation: PromotionItemOperation
  targetExternalKey: string
  data: Record<string, unknown>
}

export interface WorkingPackage {
  workingPackageId: string
  workingPackageVersion: number
  packageChecksum: string
  items: WorkingPackageItem[]
}

export interface PromotionRequest {
  schemaVersion: SchemaVersion
  promotionRequestId: string
  idempotencyKey: string
  targetSiteId: string
  targetState: 'draft'
  workingPackage: WorkingPackage
  /** Links this promotion back to the Site Assembly Manifest it promotes content for (manual §12.19's assembly_manifest_id coupling field). Opaque string ref -- no manifest-existence validation happens here, that is the caller's responsibility. */
  assemblyManifestId: string
  /** Opaque IDs of Gate receipts the caller asserts are satisfied. This module does NOT validate these against any real Gate store (out of scope, no Gate-receipt registry exists yet) -- it only records them on the resulting receipt for audit. */
  requiredGateReceiptIds: string[]
}

export type PromotionItemStatus = 'succeeded' | 'failed'

export interface PromotionItemResult {
  sourceItemId: string
  payloadDocumentId: string | null
  resultChecksum: string | null
  status: PromotionItemStatus
  /** Present only when status is 'failed'. */
  failureReason?: string
}

export type PromotionStatus = 'succeeded' | 'partial' | 'failed'

export interface PromotionReceipt {
  schemaVersion: SchemaVersion
  promotionReceiptId: string
  promotionRequestId: string
  status: PromotionStatus
  draftReleaseId: string | null
  itemResults: PromotionItemResult[]
  startedAt: string
  completedAt: string
  requiredGateReceiptIds: string[]
}

export class PromotionServiceError extends Error {}

/**
 * The trusted write+readback interface a real implementation would call
 * through Payload's Local API/REST (manual §12.18: no raw SQL into
 * Payload-owned tables for routine promotion). This module only
 * consumes this interface -- it never talks to a real database itself.
 * An in-memory implementation for tests is expected to be supplied by
 * callers/tests, not by this file. A real Payload-backed implementation
 * is future work once live infrastructure is available (GAP-50).
 */
export interface PayloadDraftTarget {
  upsertDraft(
    collection: string,
    externalKey: string,
    data: Record<string, unknown>,
  ): Promise<{ payloadDocumentId: string; resultChecksum: string }>
  readback(payloadDocumentId: string): Promise<Record<string, unknown> | null>
}

interface StoredReceipt {
  packageChecksum: string
  receipt: PromotionReceipt
}

function deriveStatus(itemResults: PromotionItemResult[]): PromotionStatus {
  if (itemResults.length === 0) return 'succeeded'
  const succeededCount = itemResults.filter((r) => r.status === 'succeeded').length
  if (succeededCount === itemResults.length) return 'succeeded'
  if (succeededCount === 0) return 'failed'
  return 'partial'
}

export class PromotionService {
  private readonly receiptsByIdempotencyKey = new Map<string, StoredReceipt>()

  constructor(private readonly target: PayloadDraftTarget) {}

  /**
   * Promotes one Promotion Request's working package into Payload
   * drafts, one item at a time, verifying readback per item, and
   * returns a receipt. Must be idempotent per the doctrine above.
   */
  async promote(request: PromotionRequest): Promise<PromotionReceipt> {
    const prior = this.receiptsByIdempotencyKey.get(request.idempotencyKey)
    if (prior) {
      if (prior.packageChecksum === request.workingPackage.packageChecksum) {
        return prior.receipt
      }
      throw new PromotionServiceError(
        `Idempotency key "${request.idempotencyKey}" was already used for a working package with checksum "${prior.packageChecksum}", but this request carries a different checksum ("${request.workingPackage.packageChecksum}") -- this is a contract conflict per manual §12.23, not a safe retry.`,
      )
    }

    const startedAt = new Date().toISOString()
    const itemResults: PromotionItemResult[] = []

    for (const item of request.workingPackage.items) {
      itemResults.push(await this.promoteItem(item))
    }

    const status = deriveStatus(itemResults)
    const completedAt = new Date().toISOString()

    const receipt: PromotionReceipt = {
      schemaVersion: request.schemaVersion,
      promotionReceiptId: crypto.randomUUID(),
      promotionRequestId: request.promotionRequestId,
      status,
      draftReleaseId: status !== 'failed' ? crypto.randomUUID() : null,
      itemResults,
      startedAt,
      completedAt,
      requiredGateReceiptIds: request.requiredGateReceiptIds,
    }

    this.receiptsByIdempotencyKey.set(request.idempotencyKey, {
      packageChecksum: request.workingPackage.packageChecksum,
      receipt,
    })

    return receipt
  }

  private async promoteItem(item: WorkingPackageItem): Promise<PromotionItemResult> {
    let write: { payloadDocumentId: string; resultChecksum: string }
    try {
      write = await this.target.upsertDraft(item.payloadCollection, item.targetExternalKey, item.data)
    } catch (error) {
      return {
        sourceItemId: item.sourceItemId,
        payloadDocumentId: null,
        resultChecksum: null,
        status: 'failed',
        failureReason: error instanceof Error ? error.message : String(error),
      }
    }

    let readback: Record<string, unknown> | null
    try {
      readback = await this.target.readback(write.payloadDocumentId)
    } catch (error) {
      return {
        sourceItemId: item.sourceItemId,
        payloadDocumentId: write.payloadDocumentId,
        resultChecksum: null,
        status: 'failed',
        failureReason: `readback verification failed: ${error instanceof Error ? error.message : String(error)}`,
      }
    }

    if (readback === null) {
      return {
        sourceItemId: item.sourceItemId,
        payloadDocumentId: write.payloadDocumentId,
        resultChecksum: null,
        status: 'failed',
        failureReason: 'readback verification failed: document not retrievable after write',
      }
    }

    return {
      sourceItemId: item.sourceItemId,
      payloadDocumentId: write.payloadDocumentId,
      resultChecksum: write.resultChecksum,
      status: 'succeeded',
    }
  }
}
