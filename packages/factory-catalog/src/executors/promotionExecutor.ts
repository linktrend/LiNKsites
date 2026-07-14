/**
 * Promotion Executor (Phase 3/4 integration, Issue
 * phase3-assembly-and-promotion-ledger-integration-001).
 *
 * Connects the Program Ledger to `PromotionService.promote()`
 * (promotionService.ts): a real `ExecutorAdapter` that, when dispatched
 * through the Ledger, actually promotes a working package into Payload
 * drafts (through whichever `PayloadDraftTarget` the shared
 * `PromotionService` instance was constructed with) -- not a synthetic
 * echo.
 *
 * Unlike `SiteSpecificationExecutor`/`SiteAssemblyExecutor`, a
 * `PromotionRequest` is ALREADY a fully serializable business contract
 * per the manual's own design (manual §12.19) -- there is no live
 * object graph to resolve identifiers against here. `Issue.input` is
 * therefore the `PromotionRequest` itself, not a set of identifiers
 * pointing at injected catalog data.
 *
 * The injected `PromotionService` MUST be a single shared, long-lived
 * instance across every dispatch of this executor (not one constructed
 * per call) -- its idempotency-conflict detection (manual §12.23) only
 * works correctly if the same instance's internal receipt store is
 * reused across retries of the same `idempotencyKey`.
 */

import type { ExecutorAdapter, ExecutorResult, Issue, Run } from '@linksites/program-ledger'
import { PromotionService, PromotionServiceError, type PromotionRequest } from '../promotionService.js'

export const PROMOTE_WORKING_PACKAGE_ISSUE_TYPE = 'linksites.factory.promote_working_package'

export interface PromotionExecutorDeps {
  promotionService: PromotionService
}

function isValidPromotionRequestInput(input: Record<string, unknown>): input is PromotionRequest & Record<string, unknown> {
  if (
    typeof input.promotionRequestId !== 'string' ||
    typeof input.idempotencyKey !== 'string' ||
    typeof input.targetSiteId !== 'string' ||
    input.targetState !== 'draft' ||
    typeof input.assemblyManifestId !== 'string' ||
    !Array.isArray(input.requiredGateReceiptIds) ||
    typeof input.workingPackage !== 'object' ||
    input.workingPackage === null
  ) {
    return false
  }
  const pkg = input.workingPackage as Record<string, unknown>
  return (
    typeof pkg.workingPackageId === 'string' &&
    typeof pkg.workingPackageVersion === 'number' &&
    typeof pkg.packageChecksum === 'string' &&
    Array.isArray(pkg.items)
  )
}

export class PromotionExecutor implements ExecutorAdapter {
  readonly executorId = 'linksites-promotion-executor'

  constructor(private readonly deps: PromotionExecutorDeps) {}

  canHandle(issueType: string): boolean {
    return issueType === PROMOTE_WORKING_PACKAGE_ISSUE_TYPE
  }

  async execute(issue: Issue, _run: Run): Promise<ExecutorResult> {
    if (!isValidPromotionRequestInput(issue.input)) {
      return { kind: 'failure', failureClass: 'invalid_input', message: 'Issue input is not a well-formed Promotion Request.' }
    }

    try {
      const receipt = await this.deps.promotionService.promote(issue.input)

      if (receipt.status === 'succeeded') {
        return { kind: 'success', output: receipt }
      }

      const failedItems = receipt.itemResults
        .filter((item) => item.status === 'failed')
        .map((item) => `${item.sourceItemId}: ${item.failureReason ?? 'unknown failure'}`)
        .join('; ')
      return {
        kind: 'failure',
        failureClass: 'transient_infrastructure',
        message: `Promotion "${receipt.promotionReceiptId}" ended with status "${receipt.status}" (safe to retry -- promotion is idempotent per manual §12.23): ${failedItems}`,
      }
    } catch (error) {
      if (error instanceof PromotionServiceError) {
        return { kind: 'failure', failureClass: 'invalid_input', message: error.message }
      }
      throw error
    }
  }
}
