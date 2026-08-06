import { createHash } from 'node:crypto'
import { PromotionService, type PayloadDraftTarget, type PromotionReceipt, type PromotionRequest } from './promotionService.js'
import type { WorkingContentPromotionInput, WorkingContentRepository } from './workingContent.js'

/** Accepted W2-03 adapter: only prepared immutable working content may reach PromotionService. */
export function buildPromotionRequestFromPreparedWorkingContent(input: WorkingContentPromotionInput, targetSiteId: string, promotionRequestId: string, assemblyManifestId: string): PromotionRequest {
  const items = input.contentPackage.content.pages.map((page) => ({
    sourceItemId: page.pageId,
    payloadCollection: 'pages',
    payloadOperation: 'update' as const,
    targetExternalKey: page.route === '/' ? 'home' : page.route.replace(/^\//, ''),
    data: {
      title: page.pageId,
      slug: page.route === '/' ? 'home' : page.route.replace(/^\//, ''),
      pageType: page.route === '/' ? 'home' : 'generic',
      site: targetSiteId,
      locale: String(page.sections[0]?.content.lang ?? 'en'),
      content: page.sections.map((section) => ({ blockType: section.componentId, ...section.content })),
      status: 'draft',
      promotionIdempotencyKey: input.promotionIdempotencyKey,
      workingPackageId: input.workingPackageId,
      workingPackageVersion: input.workingPackageVersion,
      workingContentChecksum: input.contentChecksum,
      workingContentSnapshot: page,
      workingContentRevision: computeWorkingContentRevision(page),
      previewEnvironment: 'private-preview',
      gateEvidenceReferences: [...input.gateEvidenceReferences],
    },
  }))
  return { schemaVersion: input.schemaVersion, promotionRequestId, idempotencyKey: input.promotionIdempotencyKey, targetSiteId, targetState: 'draft', workingPackage: { workingPackageId: input.workingPackageId, workingPackageVersion: input.workingPackageVersion, packageChecksum: input.contentChecksum, items }, assemblyManifestId, requiredGateReceiptIds: [...input.gateEvidenceReferences] }
}

export function computeWorkingContentRevision(snapshot: unknown): string { return createHash('sha256').update(stableStringify(snapshot)).digest('hex') }
function stableStringify(value: unknown): string { if (value === null || typeof value !== 'object') return JSON.stringify(value); if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`; return `{${Object.keys(value as Record<string, unknown>).sort().map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`).join(',')}}` }

export async function promotePreparedWorkingContent(input: { repository: Pick<WorkingContentRepository, 'recordPromotionReceipt'>; prepared: WorkingContentPromotionInput; target: PayloadDraftTarget; targetSiteId: string; promotionRequestId: string; assemblyManifestId: string }): Promise<{ receipt: PromotionReceipt; payloadReceiptId: string }> {
  const receipt = await new PromotionService(input.target).promote(buildPromotionRequestFromPreparedWorkingContent(input.prepared, input.targetSiteId, input.promotionRequestId, input.assemblyManifestId))
  if (receipt.status !== 'succeeded') throw new Error(`Payload draft promotion failed with status ${receipt.status}`)
  const first = receipt.itemResults[0]
  if (!first?.payloadDocumentId) throw new Error('Payload promotion did not return a document reference')
  await input.repository.recordPromotionReceipt({ orgId: input.prepared.orgId, workingPackageId: input.prepared.workingPackageId, versionNumber: input.prepared.workingPackageVersion, promotionIdempotencyKey: input.prepared.promotionIdempotencyKey, contentChecksum: input.prepared.contentChecksum, promotionReceiptId: receipt.promotionReceiptId, payloadTargetCollection: 'pages', payloadDocumentId: first.payloadDocumentId, payloadDraftRevision: first.resultChecksum, receipt: receipt as unknown as Record<string, unknown> })
  return { receipt, payloadReceiptId: first.payloadDocumentId }
}
