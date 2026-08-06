import { appendFile, mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash, randomUUID } from 'node:crypto'
import type { DemoCompletionEnvelope, LeadResearchPackage } from '@linksites/types'
import { FileCompletionSink, type CompletionSink } from '@linksites/intake-orchestrator'
import {
  consumePinnedLibraryEntry,
  createOfflineLibraryFixtureTransport,
  OFFLINE_LIBRARY_AUTHORITY,
  createPreviewDeployment,
  type LibraryCatalog,
  type LibraryConsumptionEvidence,
  type PayloadDraftTarget,
  type WorkingContentPackage,
  type WorkingContentPromotionInput,
  type PromotionReceipt,
  produceWorkingContent,
  buildPromotionRequestFromPreparedWorkingContent,
  PromotionService,
  assertValidWorkingContentPackage,
  computeWorkingContentChecksum,
} from '@linksites/factory-catalog'
import type { AdapterFault, LeadInput, LocalBoundaryAdapters, RuntimeConfig } from './contracts.ts'

type EffectState = {
  operations: Record<string, unknown>
  faults: AdapterFault[]
  compensations: Array<{ issueId: string; reason: string; result: 'compensated' | 'manual_attention'; action: string }>
  payloadDocuments: Record<string, { id: string; data: Record<string, unknown> }>
  artifacts: Record<string, { path: string; checksum: string }>
  deliveryReceipts: Record<string, { idempotencyKey: string; deliveredAt: string }>
}

const emptyState = (): EffectState => ({ operations: {}, faults: [], compensations: [], payloadDocuments: {}, artifacts: {}, deliveryReceipts: {} })
const safeKey = (value: string): string => createHash('sha256').update(value).digest('hex')
const stable = (value: unknown): string => value === null || typeof value !== 'object' ? JSON.stringify(value) : Array.isArray(value) ? `[${value.map(stable).join(',')}]` : `{${Object.keys(value as Record<string, unknown>).sort().map((key) => `${JSON.stringify(key)}:${stable((value as Record<string, unknown>)[key])}`).join(',')}}`
const checksum = (value: unknown): string => createHash('sha256').update(stable(value)).digest('hex')
const clone = <T>(value: T): T => structuredClone(value)

class LocalPayloadDraftTarget implements PayloadDraftTarget {
  constructor(private readonly owner: LocalBoundaryAdaptersImpl) {}

  async upsertDraft(collection: string, externalKey: string, data: Record<string, unknown>): Promise<{ payloadDocumentId: string; resultChecksum: string }> {
    const key = `${collection}::${externalKey}`
    const current = this.owner.payloadDocument(key)
    const id = current?.id ?? `local-${safeKey(key).slice(0, 24)}`
    this.owner.savePayloadDocument(key, { id, data: { ...data, slug: externalKey, status: 'draft' } })
    return { payloadDocumentId: `${collection}::${id}`, resultChecksum: checksum(data) }
  }

  async readback(payloadDocumentId: string): Promise<Record<string, unknown> | null> {
    const record = this.owner.payloadDocumentById(payloadDocumentId)
    if (!record) return null
    return clone(record.data)
  }

  verifyParity(expected: Record<string, unknown>, actual: Record<string, unknown>): boolean {
    return sameFields(expected, actual)
  }
}

function sameFields(expected: unknown, actual: unknown): boolean {
  if (Array.isArray(expected)) return Array.isArray(actual) && expected.length === actual.length && expected.every((item, index) => sameFields(item, actual[index]))
  if (expected && typeof expected === 'object') return Boolean(actual && typeof actual === 'object' && !Array.isArray(actual) && Object.entries(expected as Record<string, unknown>).every(([key, value]) => sameFields(value, (actual as Record<string, unknown>)[key])))
  return String(expected) === String(actual)
}

export class LocalBoundaryAdaptersImpl implements LocalBoundaryAdapters {
  private state = emptyState()
  private loaded = false
  private writeChain: Promise<void> = Promise.resolve()
  private readonly payloadTarget = new LocalPayloadDraftTarget(this)
  private readonly config: RuntimeConfig

  constructor(config: RuntimeConfig) { this.config = config }

  private async load(): Promise<void> {
    if (this.loaded) return
    const raw = await readFile(`${this.config.statePath}.adapters.json`, 'utf8').catch(() => '')
    if (raw) this.state = { ...emptyState(), ...(JSON.parse(raw) as EffectState) }
    this.loaded = true
  }

  private async persist(): Promise<void> {
    this.writeChain = this.writeChain.then(async () => {
      const path = `${this.config.statePath}.adapters.json`
      await mkdir(dirname(path), { recursive: true })
      const temporary = `${path}.${process.pid}.${randomUUID()}.tmp`
      await writeFile(temporary, `${JSON.stringify(this.state, null, 2)}\n`, 'utf8')
      await rename(temporary, path)
    })
    await this.writeChain
  }

  async injectFault(fault: AdapterFault): Promise<void> { await this.load(); this.state.faults.push({ ...fault }); await this.persist() }
  async rejectNextGate(): Promise<void> { await this.load(); this.state.operations['gate-rejection'] = true; await this.persist() }
  async tamperPayload(): Promise<void> { await this.load(); const first = Object.values(this.state.payloadDocuments)[0]; if (!first) throw new Error('no Payload draft exists to tamper'); first.data.title = 'tampered'; await this.persist() }
  async tamperEvidence(): Promise<void> { await this.load(); const first = Object.values(this.state.artifacts)[0]; if (!first) throw new Error('no evidence artifact exists to tamper'); await writeFile(first.path, '{"tampered":true}\n', 'utf8'); await this.persist() }
  async deliveryReceipts(): Promise<EffectState['deliveryReceipts']> { await this.load(); return clone(this.state.deliveryReceipts) }
  async payloadDocumentCount(): Promise<number> { await this.load(); return Object.keys(this.state.payloadDocuments).length }

  payloadDocument(key: string): { id: string; data: Record<string, unknown> } | undefined { return this.state.payloadDocuments[key] }
  payloadDocumentById(compoundId: string): { id: string; data: Record<string, unknown> } | undefined { const id = compoundId.split('::')[1]; return Object.values(this.state.payloadDocuments).find((record) => record.id === id) }
  savePayloadDocument(key: string, record: { id: string; data: Record<string, unknown> }): void { this.state.payloadDocuments[key] = clone(record) }

  private async boundary<T>(operation: string, idempotencyKey: string, effect: () => Promise<T>): Promise<T> {
    await this.load()
    const key = `${operation}:${safeKey(idempotencyKey)}`
    if (key in this.state.operations) return clone(this.state.operations[key]) as T
    const fault = this.state.faults.find((candidate) => candidate.operation === operation && candidate.remaining > 0)
    if (fault && fault.kind !== 'crash_after_receipt') { fault.remaining -= 1; await this.persist(); throw new Error(`boundary:${operation}:${fault.kind}-failure`) }
    const value = await effect()
    this.state.operations[key] = clone(value)
    await this.persist()
    if (fault?.kind === 'crash_after_receipt' && fault.remaining > 0) { fault.remaining -= 1; await this.persist(); throw new Error(`crash-after-receipt:${operation}`) }
    return clone(value)
  }

  async validateLead(lead: LeadInput): Promise<{ valid: boolean; reason?: string }> {
    if (lead.org_id !== this.config.orgId) return { valid: false, reason: 'lead:org-mismatch' }
    if (!lead.lead_id || !lead.org_id || !lead.idempotency_key || !lead.research?.summary || !Array.isArray(lead.research.sources) || lead.research.sources.length === 0) return { valid: false, reason: 'lead:missing-required-research' }
    return { valid: true }
  }

  async qualify(lead: LeadInput): Promise<{ vertical: string; tier: 'standard' }> {
    return this.boundary('qualify', lead.idempotency_key, async () => { if (!['home_services', 'home-services', 'plumbing', 'hvac', 'electrical', 'landscaping', 'cleaning'].includes(lead.requested_vertical)) throw new Error('qualification:unsupported-vertical'); return { vertical: 'home_services', tier: 'standard' as const } })
  }

  async reserveFoundation(siteId: string, vertical: string): Promise<Record<string, unknown>> { return this.boundary('foundation.reserve', siteId, async () => ({ foundationId: 'foundation:marketing-smb-v1:standard', vertical, status: 'reserved', reservationId: `reservation:${siteId}` })) }

  async resolveLibrary(siteId: string): Promise<Record<string, unknown>> {
    return this.boundary('library.verify', siteId, async () => ({ entryId: OFFLINE_LIBRARY_AUTHORITY.entryId, revision: OFFLINE_LIBRARY_AUTHORITY.commitSha, entryChecksum: OFFLINE_LIBRARY_AUTHORITY.entryChecksum, status: 'approved', materialized: true, verificationId: OFFLINE_LIBRARY_AUTHORITY.verificationId, consumption: await this.libraryEvidence() }))
  }

  private async libraryEvidence(): Promise<LibraryConsumptionEvidence> {
    const fixture = (path: string) => readFile(join(dirname(fileURLToPath(import.meta.url)), '../../../packages/factory-catalog/tests/fixtures/linklibraries/marketing-smb-v1', path), 'utf8')
    const sourceEntry = JSON.parse(await fixture('entry.json')) as Record<string, unknown>
    const entry = { entryId: sourceEntry.entryId, kind: sourceEntry.kind, name: sourceEntry.name, summary: sourceEntry.summary, problemDomains: sourceEntry.problemDomains, tags: sourceEntry.tags, languages: sourceEntry.languages, frameworks: sourceEntry.frameworks, status: sourceEntry.status, path: `entries/${String(sourceEntry.entryId)}` } as LibraryCatalog['entries'][number]
    const files = { 'README.md': await fixture('README.md'), 'assets/marketingSmbV1.ts': await fixture('assets/marketingSmbV1.ts'), 'tests/marketingSmbV1.fixture.ts': await fixture('tests/marketingSmbV1.fixture.ts') }
    const catalog: LibraryCatalog = { schemaVersion: 1, generatedAt: '2026-08-04T00:00:00.000Z', sourceCommitSha: OFFLINE_LIBRARY_AUTHORITY.commitSha, entries: [entry] }
    return consumePinnedLibraryEntry({ catalogReference: { repositoryUrl: OFFLINE_LIBRARY_AUTHORITY.repositoryUrl, commitSha: OFFLINE_LIBRARY_AUTHORITY.commitSha, ref: OFFLINE_LIBRARY_AUTHORITY.commitSha, catalog }, entryId: OFFLINE_LIBRARY_AUTHORITY.entryId, compatibility: { nodeMajor: 22, runtimes: ['node', 'browser'] }, executable: { entrypoint: 'assets/marketingSmbV1.ts', testFiles: ['tests/marketingSmbV1.fixture.ts'] }, transport: createOfflineLibraryFixtureTransport({ readCatalog: () => catalog, readEntryAtCommit: () => ({ entry: JSON.parse(JSON.stringify(sourceEntry)), files }) }) })
  }

  async buildSiteSpecification(siteId: string, dependencies: Record<string, unknown>): Promise<Record<string, unknown>> { return { siteSpecId: `site-spec:${siteId}`, siteId, kitId: 'home_services', tierId: 'standard', foundation: dependencies.foundation, library: dependencies.library, pages: 5 } }

  private async production(lead: LeadInput): Promise<ReturnType<typeof produceWorkingContent>> {
    const facts = JSON.parse(await readFile(this.config.approvedFactsPath, 'utf8')) as unknown
    const library = await this.libraryEvidence()
    const template = { templateId: 'marketing-smb-v1' as const, libraryAssetPath: 'assets/marketingSmbV1.ts', libraryAssetSha256: OFFLINE_LIBRARY_AUTHORITY.assetChecksums['assets/marketingSmbV1.ts'], baselinePages: [
      { pageId: 'home', route: '/', sections: [{ sectionId: 'hero', componentId: 'SignupHero', copy: { lang: 'en', headline: '{{businessName}} serving {{geography}}', body: 'Approved local service information.' } }] },
      { pageId: 'about', route: '/about', sections: [{ sectionId: 'credentials', componentId: 'CTASection', copy: { lang: 'en', headline: 'About {{businessName}}', body: '{{credentials}}' } }] },
      { pageId: 'services', route: '/services', sections: [{ sectionId: 'offers', componentId: 'OfferShowcase', copy: { lang: 'en', headline: 'Services', offers: ['{{services}}'] } }] },
      { pageId: 'contact', route: '/contact', sections: [{ sectionId: 'contact', componentId: 'CTASection', copy: { lang: 'en', phone: '{{contact.phone}}', email: '{{contact.email}}', address: '{{contact.address}}' } }] },
      { pageId: 'privacy', route: '/privacy', sections: [{ sectionId: 'legal', componentId: 'CTASection', copy: { lang: 'en', copy: '{{legalClaims}}' } }] },
    ], media: [{ assetId: 'library-neutral-mark', source: 'library://marketing-smb-v1/mark', sha256: 'a'.repeat(64), licenseSpdx: 'UNLICENSED', altText: 'Approved neutral template mark', width: 512, height: 512, format: 'webp' as const }], }
    return produceWorkingContent({ lead, facts, template, library, mediaPolicy: { allowedSourcePrefixes: ['library://'], allowedLicenseSpdx: ['UNLICENSED'], maxWidth: 2048, maxHeight: 2048, allowedFormats: ['webp', 'avif', 'jpg', 'png'], requireTemplateMedia: true } })
  }

  async produceInformationArchitecture(siteId: string, lead: LeadInput): Promise<Record<string, unknown>> { return this.boundary('working-content.production', siteId, async () => ({ ...await this.production(lead) })) }
  async processMedia(siteId: string, lead: LeadInput): Promise<Record<string, unknown>> { return this.boundary('working-content.media', siteId, async () => { const result = await this.production(lead); return { selectedMedia: result.selectedMedia, evidence: result.evidence } }) }
  async assembleWorkingContent(siteId: string, dependencies: Record<string, unknown>): Promise<Record<string, unknown>> { return this.boundary('working-content.assemble', siteId, async () => { const production = dependencies.copy as Record<string, unknown>; const contentPackage = production.contentPackage as WorkingContentPackage; assertValidWorkingContentPackage(contentPackage); return { contentVersion: `content:${siteId}:1`, contentPackage, checksum: computeWorkingContentChecksum(contentPackage), evidence: production.evidence, accepted: true } }) }

  async runGates(siteId: string, workingContent: Record<string, unknown>): Promise<{ accepted: boolean; evidence: string[]; reason?: string; artifactPath?: string; artifactChecksum?: string }> {
    await this.load()
    if (this.state.operations['gate-rejection']) { delete this.state.operations['gate-rejection']; await this.persist(); return { accepted: false, evidence: [], reason: 'gate:working-content-rejected' } }
    const contentPackage = workingContent.contentPackage
    if (workingContent.accepted !== true || !contentPackage || typeof workingContent.checksum !== 'string') return { accepted: false, evidence: [], reason: 'gate:working-content-incomplete' }
    assertValidWorkingContentPackage(contentPackage)
    if (computeWorkingContentChecksum(contentPackage) !== workingContent.checksum) return { accepted: false, evidence: [], reason: 'gate:working-content-tampered' }
    const artifact = await this.writeArtifact('working-content', siteId, workingContent)
    const gateArtifacts = await Promise.all(['schema', 'quality', 'security', 'privacy', 'assets'].map((gate) => this.writeArtifact(`working-content-gate-${gate}`, siteId, { siteId, gate, accepted: true, sourceArtifact: artifact.path, sourceChecksum: artifact.checksum })))
    return { accepted: true, evidence: [artifact.path, ...gateArtifacts.map((item) => item.path)], artifactPath: artifact.path, artifactChecksum: artifact.checksum }
  }

  async promoteDraft(siteId: string, workingContent: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.boundary('payload.promote-draft', siteId, async () => {
      const prepared: WorkingContentPromotionInput = { schemaVersion: { major: 1, minor: 0 }, orgId: this.config.orgId, workingPackageId: String(workingContent.contentVersion), workingPackageVersion: 1, contentChecksum: String(workingContent.checksum), promotionIdempotencyKey: `promotion:${siteId}`, contentPackage: workingContent.contentPackage as WorkingContentPackage, gateEvidenceReferences: ['gate:content-quality'] }
      const request = buildPromotionRequestFromPreparedWorkingContent(prepared, siteId, `promotion-request:${siteId}`, `manifest:${siteId}`)
      const receipt = await new PromotionService(this.payloadTarget).promote(request)
      if (receipt.status !== 'succeeded') throw new Error(`payload:promotion:${receipt.status}`)
      return { receipt, payloadDocumentIds: receipt.itemResults.map((item) => item.payloadDocumentId).filter(Boolean), checksum: prepared.contentChecksum, status: 'draft', published: false }
    })
  }

  async readbackDraft(siteId: string, promotion: Record<string, unknown>): Promise<Record<string, unknown>> { return this.boundary('payload.readback', siteId, async () => { const ids = Array.isArray(promotion.payloadDocumentIds) ? promotion.payloadDocumentIds : []; const docs = ids.map((id) => this.payloadDocumentById(String(id))).filter(Boolean); const receipt = promotion.receipt as { itemResults?: Array<{ status?: string }> } | undefined; const parity = docs.length === ids.length && docs.every((doc) => doc?.data.previewEnvironment === 'private-preview') && (!receipt?.itemResults || receipt.itemResults.every((item) => item.status === 'succeeded')); const result = { parity, documentCount: docs.length, expectedCount: ids.length, checksum: promotion.checksum, payloadDocumentIds: ids }; const artifact = await this.writeArtifact('payload-readback-parity', siteId, result); return { ...result, evidencePath: artifact.path, artifactPath: artifact.path, artifactChecksum: artifact.checksum } }) }

  async createPrivatePreview(siteId: string, promotion: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.boundary('frontend.private-preview', siteId, async () => { const manifest = { schemaVersion: { major: 1, minor: 0 }, manifestId: `manifest:${siteId}`, manifestVersion: 1, siteId, siteClass: 'preview' as const, kitId: 'home_services', tierId: 'standard', platformReleaseRef: this.config.executingRevision, designProfileRef: 'design:local', contentReleaseRef: String(promotion.checksum), pages: [], lineage: {}, resolvedAt: new Date().toISOString() }; const deployment = createPreviewDeployment({ previewId: `preview:${siteId}`, prospectId: siteId, manifest, payloadDraftContentRef: `payload:${siteId}`, analyticsIdentityRef: `analytics:${siteId}`, accessPolicy: 'token_required', expiresAt: new Date(Date.now() + 86_400_000).toISOString(), qualityReceiptRef: null }); const result = { ...deployment, payloadDocumentIds: promotion.payloadDocumentIds, publicActivation: false }; const artifact = await this.writeArtifact('frontend-private-preview', siteId, result); return { ...result, artifactPath: artifact.path, artifactChecksum: artifact.checksum } })
  }

  async renderPrivatePreview(siteId: string, preview: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.boundary('frontend.render', siteId, async () => { const ids = Array.isArray(preview.payloadDocumentIds) ? preview.payloadDocumentIds : []; const pages = ids.map((id) => this.payloadDocumentById(String(id))).filter(Boolean).map((doc) => ({ route: `/${String(doc?.data.slug ?? '')}`.replace('/home', '/'), title: String(doc?.data.title ?? ''), content: doc?.data.content })); const routes = pages.map((page) => page.route); if (pages.length === 0 || routes.length !== new Set(routes).size || preview.indexingPolicy !== 'noindex' || preview.accessPolicy !== 'token_required') throw new Error('frontend:private-preview-validation-failed'); const result = { html: pages.map((page) => `<main data-route="${page.route}"><h1>${page.title}</h1></main>`).join(''), routes, pages, accessibility: pages.every((page) => page.title.length > 0), seo: true, privacy: 'noindex,nofollow,no-store' }; const artifact = await this.writeArtifact('frontend-render-gate', siteId, result); return { ...result, artifactPath: artifact.path, artifactChecksum: artifact.checksum } })
  }

  async captureEvidence(siteId: string, render: Record<string, unknown>): Promise<Record<string, unknown>> { const artifact = await this.writeArtifact('preview-evidence', siteId, render); return { evidenceId: `preview-evidence:${siteId}`, artifactPath: artifact.path, artifactChecksum: artifact.checksum, render, captured: true } }

  private async writeArtifact(kind: string, siteId: string, value: unknown): Promise<{ path: string; checksum: string }> { await this.load(); const path = join(dirname(this.config.statePath), 'evidence', `${kind}-${safeKey(siteId)}.json`); const valueChecksum = checksum(value); await mkdir(dirname(path), { recursive: true }); await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8'); this.state.artifacts[`${kind}:${siteId}`] = { path, checksum: valueChecksum }; await this.persist(); const stored = JSON.parse(await readFile(path, 'utf8')) as unknown; if (checksum(stored) !== valueChecksum) throw new Error(`evidence:${kind}:readback-failed`); return { path, checksum: valueChecksum } }

  async recordCompletionDelivery(envelope: DemoCompletionEnvelope, write: () => Promise<void>): Promise<void> {
    await this.load()
    const prior = this.state.deliveryReceipts[envelope.idempotency_key]
    if (prior) return
    const fault = this.state.faults.find((candidate) => candidate.operation === 'completion.emit' && candidate.remaining > 0)
    if (fault && fault.kind !== 'crash_after_receipt') { fault.remaining -= 1; await this.persist(); throw new Error(`boundary:completion-sink:${fault.kind}-failure`) }
    await write()
    this.state.deliveryReceipts[envelope.idempotency_key] = { idempotencyKey: envelope.idempotency_key, deliveredAt: new Date().toISOString() }
    await this.persist()
    if (fault?.kind === 'crash_after_receipt' && fault.remaining > 0) { fault.remaining -= 1; await this.persist(); throw new Error('crash-after-receipt:completion-sink') }
  }

  async emitCompletion(_envelope: DemoCompletionEnvelope): Promise<void> { throw new Error('completion delivery must use the shared CompletionSink') }
  async compensate(issueId: string, reason: string): Promise<'compensated' | 'manual_attention'> { await this.load(); this.state.compensations.push({ issueId, reason, result: 'manual_attention', action: 'retain-payload-draft-and-create-manual-review' }); await this.persist(); return 'manual_attention' }
  health(): { cms: boolean; frontend: boolean; eventBoundary: boolean } { return { cms: true, frontend: true, eventBoundary: true } }
}

export class DurableCompletionSink implements CompletionSink {
  private readonly sink: FileCompletionSink
  constructor(private readonly config: RuntimeConfig, private readonly adapters: LocalBoundaryAdaptersImpl) { this.sink = new FileCompletionSink(config.completionPath) }
  async write(envelope: DemoCompletionEnvelope): Promise<void> {
    await this.adapters.recordCompletionDelivery(envelope, () => this.sink.write(envelope))
  }
}

export type LocalDependencyPorts = { factoryCatalog: Pick<LocalBoundaryAdapters, 'reserveFoundation'>; workingContent: Pick<LocalBoundaryAdapters, 'produceInformationArchitecture' | 'processMedia' | 'assembleWorkingContent' | 'runGates'>; libraryClient: Pick<LocalBoundaryAdapters, 'resolveLibrary'>; cmsAdapter: Pick<LocalBoundaryAdapters, 'promoteDraft' | 'readbackDraft'>; frontendDeploymentAdapter: Pick<LocalBoundaryAdapters, 'createPrivatePreview' | 'renderPrivatePreview' | 'captureEvidence'>; eventAdapter: CompletionSink }
export function createLocalDependencyPorts(adapter: LocalBoundaryAdaptersImpl, completionSink: CompletionSink): LocalDependencyPorts { return { factoryCatalog: adapter, workingContent: adapter, libraryClient: adapter, cmsAdapter: adapter, frontendDeploymentAdapter: adapter, eventAdapter: completionSink } }
