import { createHash } from 'node:crypto'
import { SEMANTIC_COMPONENT_MAP } from './masterTemplateSemanticProjection.ts'
import {
  PromotionService,
  type Ls04PromotionBindings,
  type Ls04PromotionMapping,
  type PayloadDraftTarget,
  type PromotionReceipt,
  type PromotionRequest,
  type WorkingPackageItem,
} from './promotionService.ts'
import {
  readLs04LayeredIdentities,
  type WorkingContentPage,
  type WorkingContentPromotionInput,
  type WorkingContentRepository,
  type WorkingContentSection,
} from './workingContent.ts'

const WORKING_COMPONENT_TO_LIBRARY: Readonly<Record<string, string>> = Object.freeze({
  SignupHero: 'hero-banner',
  CTASection: 'cta-section',
  OfferShowcase: 'offer-collection',
  ArticlesGrid: 'article-collection',
})

export class WorkingContentPromotionError extends Error {
  constructor(message: string, public readonly code: 'unmapped_component' | 'all_sections_to_hero' | 'tenant_isolation' | 'invalid_input') {
    super(message)
    this.name = 'WorkingContentPromotionError'
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function contentText(content: Record<string, unknown>): string {
  const { ls04: _retained, ...copy } = content
  const candidate = copy.body ?? copy.credentials ?? copy.copy ?? copy.services ?? copy.offers ?? copy.articles ?? ''
  return Array.isArray(candidate) ? candidate.map(String).join(', ') : String(candidate)
}

export function resolveWorkingComponentProjection(componentId: string): { libraryComponentId: string; payloadBlockType: string; reactSymbol: string; sourceFile: string } {
  const libraryComponentId = WORKING_COMPONENT_TO_LIBRARY[componentId]
  const projection = libraryComponentId ? SEMANTIC_COMPONENT_MAP[libraryComponentId] : undefined
  if (!libraryComponentId || !projection) {
    throw new WorkingContentPromotionError(
      `Unmapped working-content component "${componentId}"; refusing all-sections-to-hero fallback.`,
      'unmapped_component',
    )
  }
  return { libraryComponentId, payloadBlockType: projection.payloadBlockType, reactSymbol: projection.reactSymbol, sourceFile: projection.sourceFile }
}

export function mapWorkingSectionToPayloadBlock(page: WorkingContentPage, section: WorkingContentSection): Record<string, unknown> {
  const projection = resolveWorkingComponentProjection(section.componentId)
  const ls04 = isRecord(section.content.ls04) && isRecord(section.content.ls04.semantic) ? section.content.ls04.semantic : null
  const title = String(section.content.headline ?? page.pageId)
  const text = contentText(section.content)
  const semanticId = typeof ls04?.semanticId === 'string' ? ls04.semanticId : `${page.pageId}:${section.sectionId}:${projection.libraryComponentId}`
  const shared = {
    blockType: projection.payloadBlockType,
    reactSymbol: projection.reactSymbol,
    libraryComponentId: projection.libraryComponentId,
    semanticId,
    workingSectionId: section.sectionId,
  }
  if (projection.payloadBlockType === 'cta') return { ...shared, title, text }
  if (projection.payloadBlockType === 'offerShowcase') {
    return { ...shared, title, subtitle: text, offers: Array.isArray(section.content.offers) ? section.content.offers : [] }
  }
  if (projection.payloadBlockType === 'articles') {
    return { ...shared, title, subtitle: text, items: Array.isArray(section.content.articles) ? section.content.articles : [] }
  }
  return { ...shared, title, subtitle: text }
}

function assertDistinctTypedBlocks(pages: WorkingContentPage[], blocks: Array<Record<string, unknown>>): void {
  const componentIds = [...new Set(pages.flatMap((page) => page.sections.map((section) => section.componentId)))]
  const blockTypes = [...new Set(blocks.map((block) => String(block.blockType)))]
  if (componentIds.length > 1 && blockTypes.length === 1 && blockTypes[0] === 'hero') {
    throw new WorkingContentPromotionError(
      'Distinct working-content sections collapsed to hero; typed semantic mapping is required.',
      'all_sections_to_hero',
    )
  }
}

function pageSlug(route: string): string {
  return route === '/' ? 'home' : route.replace(/^\//, '')
}

function catalogRecords(content: Record<string, unknown>, key: 'products' | 'services'): Array<Record<string, unknown>> {
  const ls04 = content.ls04
  if (!isRecord(ls04) || !isRecord(ls04.catalog) || !Array.isArray(ls04.catalog[key])) return []
  return ls04.catalog[key].filter(isRecord)
}

/** Accepted W2-03 adapter: only prepared immutable working content may reach PromotionService. */
export function buildPromotionRequestFromPreparedWorkingContent(
  input: WorkingContentPromotionInput,
  targetSiteId: string,
  promotionRequestId: string,
  assemblyManifestId: string,
  promotionRunMarker?: string,
): PromotionRequest {
  const identities = readLs04LayeredIdentities(input.contentPackage)
  if (identities && identities.siteId !== targetSiteId) {
    throw new WorkingContentPromotionError('promotion target site is not the working-content tenant site', 'tenant_isolation')
  }
  if (identities && identities.orgId !== input.orgId) {
    throw new WorkingContentPromotionError('promotion org is not the working-content tenant', 'tenant_isolation')
  }

  const pageItems: WorkingPackageItem[] = input.contentPackage.content.pages.map((page) => {
    const blocks = page.sections.map((section) => mapWorkingSectionToPayloadBlock(page, section))
    assertDistinctTypedBlocks([page], blocks)
    return {
      sourceItemId: page.pageId,
      payloadCollection: 'pages',
      payloadOperation: 'update' as const,
      targetExternalKey: pageSlug(page.route),
      data: {
        title: page.pageId,
        slug: pageSlug(page.route),
        pageType: page.route === '/' ? 'home' : 'generic',
        site: targetSiteId,
        locale: String(page.sections[0]?.content.lang ?? identities?.locale ?? 'en'),
        content: blocks,
        status: 'draft',
        previewEnvironment: 'private-preview',
        ...(promotionRunMarker ? { promotionRunMarker } : {}),
      },
    }
  })
  assertDistinctTypedBlocks(input.contentPackage.content.pages, pageItems.flatMap((item) => Array.isArray(item.data.content) ? item.data.content as Array<Record<string, unknown>> : []))

  const extraItems: WorkingPackageItem[] = []
  const mappings: Ls04PromotionMapping[] = []
  for (const page of input.contentPackage.content.pages) {
    for (const section of page.sections) {
      const projection = resolveWorkingComponentProjection(section.componentId)
      const block = mapWorkingSectionToPayloadBlock(page, section)
      mappings.push({
        semanticId: String(block.semanticId),
        sourceItemId: page.pageId,
        workingSectionId: section.sectionId,
        providerComponentId: projection.libraryComponentId,
        pageFamily: isRecord(section.content.ls04) && isRecord(section.content.ls04.semantic) ? String(section.content.ls04.semantic.pageFamily ?? '') : undefined,
        payloadCollection: 'pages',
        payloadBlockType: projection.payloadBlockType,
        reactSymbol: projection.reactSymbol,
        targetExternalKey: pageSlug(page.route),
      })
    }
  }

  const firstContent = input.contentPackage.content.pages[0]?.sections[0]?.content ?? {}
  if (identities) {
    extraItems.push({
      sourceItemId: `core-settings:${identities.siteId}`,
      payloadCollection: 'core-settings',
      payloadOperation: 'update',
      targetExternalKey: `core-settings:${identities.siteId}`,
      data: {
        site: targetSiteId,
        locale: identities.locale,
        contentMode: identities.contentMode,
        capabilityPlanId: identities.capabilityPlanId,
        templateAdoption: identities.templateAdoptionId,
        entitlementSnapshot: identities.entitlementSnapshotId,
        status: 'draft',
        ...(promotionRunMarker ? { promotionRunMarker } : {}),
      },
    })
    mappings.push({
      semanticId: `core-settings:${identities.siteId}:${identities.contentMode}`,
      sourceItemId: `core-settings:${identities.siteId}`,
      providerComponentId: 'core-settings',
      payloadCollection: 'core-settings',
      reactSymbol: 'CoreSettings',
      targetExternalKey: `core-settings:${identities.siteId}`,
    })
  }

  for (const record of catalogRecords(firstContent, 'products')) {
    const slug = String(record.slug)
    extraItems.push({
      sourceItemId: `product:${slug}`,
      payloadCollection: 'products',
      payloadOperation: 'update',
      targetExternalKey: slug,
      data: {
        title: String(record.title),
        slug,
        semanticKind: 'product',
        sku: record.code ? String(record.code) : slug,
        summary: String(record.summary),
        site: targetSiteId,
        locale: identities?.locale ?? 'en',
        status: 'draft',
        ...(promotionRunMarker ? { promotionRunMarker } : {}),
      },
    })
    mappings.push({
      semanticId: `product:${slug}`,
      sourceItemId: `product:${slug}`,
      providerComponentId: 'product-record',
      payloadCollection: 'products',
      reactSymbol: 'Product',
      targetExternalKey: slug,
    })
  }

  for (const record of catalogRecords(firstContent, 'services')) {
    const slug = String(record.slug)
    extraItems.push({
      sourceItemId: `service:${slug}`,
      payloadCollection: 'services',
      payloadOperation: 'update',
      targetExternalKey: slug,
      data: {
        title: String(record.title),
        slug,
        semanticKind: 'service',
        serviceCode: record.code ? String(record.code) : slug,
        summary: String(record.summary),
        site: targetSiteId,
        locale: identities?.locale ?? 'en',
        status: 'draft',
        ...(promotionRunMarker ? { promotionRunMarker } : {}),
      },
    })
    mappings.push({
      semanticId: `service:${slug}`,
      sourceItemId: `service:${slug}`,
      providerComponentId: 'service-record',
      payloadCollection: 'services',
      reactSymbol: 'Service',
      targetExternalKey: slug,
    })
  }

  const bindings: Ls04PromotionBindings | undefined = identities
    ? {
        workingPackageId: input.workingPackageId,
        workingPackageChecksum: input.contentChecksum,
        assemblyManifestId,
        entitlementSnapshotId: identities.entitlementSnapshotId,
        templateAdoptionId: identities.templateAdoptionId,
        mappings,
      }
    : undefined

  return {
    schemaVersion: input.schemaVersion,
    promotionRequestId,
    idempotencyKey: input.promotionIdempotencyKey,
    targetSiteId,
    targetState: 'draft',
    workingPackage: {
      workingPackageId: input.workingPackageId,
      workingPackageVersion: input.workingPackageVersion,
      packageChecksum: input.contentChecksum,
      items: [...pageItems, ...extraItems],
    },
    assemblyManifestId,
    requiredGateReceiptIds: [...input.gateEvidenceReferences],
    ...(bindings ? { bindings } : {}),
  }
}

export function computeWorkingContentRevision(snapshot: unknown): string {
  return createHash('sha256').update(stableStringify(snapshot)).digest('hex')
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  return `{${Object.keys(value as Record<string, unknown>).sort().map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`).join(',')}}`
}

export async function promotePreparedWorkingContent(input: {
  repository: Pick<WorkingContentRepository, 'recordPromotionReceipt'>
  prepared: WorkingContentPromotionInput
  target: PayloadDraftTarget
  targetSiteId: string
  promotionRequestId: string
  assemblyManifestId: string
  promotionRunMarker?: string
}): Promise<{ receipt: PromotionReceipt; payloadReceiptId: string }> {
  const receipt = await new PromotionService(input.target).promote(
    buildPromotionRequestFromPreparedWorkingContent(
      input.prepared,
      input.targetSiteId,
      input.promotionRequestId,
      input.assemblyManifestId,
      input.promotionRunMarker,
    ),
  )
  if (receipt.status !== 'succeeded') {
    const failures = receipt.itemResults
      .filter((item) => item.status === 'failed')
      .map((item) => `${item.sourceItemId}:${item.failureReason ?? 'unknown'}`)
      .join(',')
    throw new Error(`Payload draft promotion failed with status ${receipt.status}${failures ? ` (${failures})` : ''}`)
  }
  const first = receipt.itemResults[0]
  if (!first?.payloadDocumentId) throw new Error('Payload promotion did not return a document reference')
  await input.repository.recordPromotionReceipt({
    orgId: input.prepared.orgId,
    workingPackageId: input.prepared.workingPackageId,
    versionNumber: input.prepared.workingPackageVersion,
    promotionIdempotencyKey: input.prepared.promotionIdempotencyKey,
    contentChecksum: input.prepared.contentChecksum,
    promotionReceiptId: receipt.promotionReceiptId,
    payloadTargetCollection: 'pages',
    payloadDocumentId: first.payloadDocumentId,
    payloadDraftRevision: first.resultChecksum,
    receipt: receipt as unknown as Record<string, unknown>,
  })
  return { receipt, payloadReceiptId: first.payloadDocumentId }
}
