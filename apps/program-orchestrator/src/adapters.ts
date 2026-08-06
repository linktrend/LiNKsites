import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { createHash } from 'node:crypto'
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
  WorkingContentRepository,
  type WorkingContentPromotionInput,
  produceWorkingContent,
  buildPromotionRequestFromPreparedWorkingContent,
  promotePreparedWorkingContent,
  assertValidWorkingContentPackage,
  computeWorkingContentChecksum,
} from '@linksites/factory-catalog'
import { PayloadRestDraftTarget } from '@linksites/factory-catalog'
import type { AdapterFault, LeadInput, LocalBoundaryAdapters, RuntimeConfig } from './contracts.ts'
import { ensureTenantRows, type SqlDatabase } from './local-database.ts'

const stable = (value: unknown): string => value === null || typeof value !== 'object' ? JSON.stringify(value) : Array.isArray(value) ? `[${value.map(stable).join(',')}]` : `{${Object.keys(value as Record<string, unknown>).sort().map((key) => `${JSON.stringify(key)}:${stable((value as Record<string, unknown>)[key])}`).join(',')}}`
const checksum = (value: unknown): string => createHash('sha256').update(stable(value)).digest('hex')
const clone = <T>(value: T): T => structuredClone(value)
const safeKey = (value: string): string => createHash('sha256').update(value).digest('hex')

function stableUuid(value: string): string {
  const bytes = createHash('sha256').update(value).digest('hex').slice(0, 32).split('')
  bytes[12] = '4'
  bytes[16] = ['8', '9', 'a', 'b'][Number.parseInt(bytes[16], 16) % 4]
  return `${bytes.slice(0, 8).join('')}-${bytes.slice(8, 12).join('')}-${bytes.slice(12, 16).join('')}-${bytes.slice(16, 20).join('')}-${bytes.slice(20).join('')}`
}

function sameFields(expected: unknown, actual: unknown): boolean {
  if (Array.isArray(expected)) return Array.isArray(actual) && expected.length === actual.length && expected.every((item, index) => sameFields(item, actual[index]))
  if (expected && typeof expected === 'object') return Boolean(actual && typeof actual === 'object' && !Array.isArray(actual) && Object.entries(expected as Record<string, unknown>).every(([key, value]) => sameFields(value, (actual as Record<string, unknown>)[key])))
  return String(expected) === String(actual)
}

export class LocalBoundaryAdaptersImpl implements LocalBoundaryAdapters {
  private readonly faults: AdapterFault[] = []
  private readonly artifacts = new Map<string, { path: string; checksum: string }>()
  private readonly config: RuntimeConfig
  private readonly db: SqlDatabase
  private readonly workingContentRepository: WorkingContentRepository
  private readonly payloadTarget: PayloadDraftTarget

  constructor(config: RuntimeConfig, db: SqlDatabase) {
    this.config = config
    this.db = db
    this.workingContentRepository = new WorkingContentRepository(db)
    this.payloadTarget = new PayloadRestDraftTarget({ baseUrl: config.payloadBaseUrl })
  }

  async injectFault(fault: AdapterFault): Promise<void> { this.faults.push({ ...fault }) }
  async rejectNextGate(): Promise<void> { this.faults.push({ operation: 'content.gates', remaining: 1, kind: 'permanent' }) }
  async tamperPayload(): Promise<void> { await this.db.query("update lsites_sites.payload_drafts set data = jsonb_set(data, '{title}', to_jsonb('tampered'::text), true) where id = (select id from lsites_sites.payload_drafts order by id limit 1)") }
  async tamperEvidence(): Promise<void> { const first = this.artifacts.values().next().value as { path: string } | undefined; if (!first) throw new Error('no persisted evidence exists to tamper'); await writeFile(first.path, '{"tampered":true}\n', 'utf8') }
  async payloadDocumentCount(): Promise<number> {
    const response = await fetch(`${this.config.payloadBaseUrl}/api/pages`)
    if (!response.ok) throw new Error('payload:document-count-read-failed')
    const body = await response.json() as { totalDocs?: unknown; docs?: unknown[] }
    return Number(body.totalDocs ?? body.docs?.length ?? 0)
  }
  async deliveryReceipts(): Promise<Record<string, { idempotencyKey: string; deliveredAt: string }>> {
    const raw = await readFile(this.config.completionPath, 'utf8').catch(() => '')
    const result: Record<string, { idempotencyKey: string; deliveredAt: string }> = {}
    for (const line of raw.split(/\r?\n/).filter(Boolean)) { const envelope = JSON.parse(line) as DemoCompletionEnvelope; result[envelope.idempotency_key] = { idempotencyKey: envelope.idempotency_key, deliveredAt: envelope.completed_at } }
    return result
  }

  private fault(operation: string): AdapterFault | undefined {
    const candidate = this.faults.find((fault) => fault.operation === operation && fault.remaining > 0)
    if (candidate) candidate.remaining -= 1
    return candidate
  }

  private async boundary<T>(operation: string, effect: () => Promise<T>): Promise<T> {
    const fault = this.fault(operation)
    if (fault && fault.kind !== 'crash_after_receipt') throw new Error(`boundary:${operation}:${fault.kind}-failure`)
    const value = await effect()
    if (fault?.kind === 'crash_after_receipt') throw new Error(`crash-after-receipt:${operation}`)
    return clone(value)
  }

  async validateLead(lead: LeadInput): Promise<{ valid: boolean; reason?: string }> {
    if (lead.org_id !== this.config.orgId) return { valid: false, reason: 'lead:org-mismatch' }
    if (!lead.lead_id || !lead.org_id || !lead.idempotency_key || !lead.research?.summary || !Array.isArray(lead.research.sources) || lead.research.sources.length === 0) return { valid: false, reason: 'lead:missing-required-research' }
    return { valid: true }
  }

  async qualify(lead: LeadInput): Promise<{ vertical: string; tier: 'standard' }> {
    return this.boundary('qualify', async () => { if (!['home_services', 'home-services', 'plumbing', 'hvac', 'electrical', 'landscaping', 'cleaning'].includes(lead.requested_vertical)) throw new Error('qualification:unsupported-vertical'); return { vertical: 'home_services', tier: 'standard' as const } })
  }

  async reserveFoundation(siteId: string, vertical: string): Promise<Record<string, unknown>> { return this.boundary('foundation.reserve', async () => ({ foundationId: 'foundation:marketing-smb-v1:standard', vertical, status: 'reserved', reservationId: `reservation:${siteId}`, owner: 'M06-preview-inventory-management', dependencies: ['vertical-qualification'] })) }

  async resolveLibrary(siteId: string): Promise<Record<string, unknown>> { return this.boundary('library.verify', async () => ({ entryId: OFFLINE_LIBRARY_AUTHORITY.entryId, revision: OFFLINE_LIBRARY_AUTHORITY.commitSha, entryChecksum: OFFLINE_LIBRARY_AUTHORITY.entryChecksum, status: 'approved', materialized: true, verificationId: OFFLINE_LIBRARY_AUTHORITY.verificationId, consumption: await this.libraryEvidence(), siteId })) }

  private async libraryEvidence(): Promise<LibraryConsumptionEvidence> {
    const repositoryRoot = process.cwd().endsWith('/apps/program-orchestrator') ? join(process.cwd(), '../..') : process.cwd()
    const fixture = (path: string) => readFile(join(repositoryRoot, 'packages/factory-catalog/tests/fixtures/linklibraries/marketing-smb-v1', path), 'utf8')
    const sourceEntry = JSON.parse(await fixture('entry.json')) as Record<string, unknown>
    const entry = { entryId: sourceEntry.entryId, kind: sourceEntry.kind, name: sourceEntry.name, summary: sourceEntry.summary, problemDomains: sourceEntry.problemDomains, tags: sourceEntry.tags, languages: sourceEntry.languages, frameworks: sourceEntry.frameworks, status: sourceEntry.status, path: `entries/${String(sourceEntry.entryId)}` } as LibraryCatalog['entries'][number]
    const files = { 'README.md': await fixture('README.md'), 'assets/marketingSmbV1.ts': await fixture('assets/marketingSmbV1.ts'), 'tests/marketingSmbV1.fixture.ts': await fixture('tests/marketingSmbV1.fixture.ts') }
    const catalog: LibraryCatalog = { schemaVersion: 1, generatedAt: '2026-08-04T00:00:00.000Z', sourceCommitSha: OFFLINE_LIBRARY_AUTHORITY.commitSha, entries: [entry] }
    return consumePinnedLibraryEntry({ catalogReference: { repositoryUrl: OFFLINE_LIBRARY_AUTHORITY.repositoryUrl, commitSha: OFFLINE_LIBRARY_AUTHORITY.commitSha, ref: OFFLINE_LIBRARY_AUTHORITY.commitSha, catalog }, entryId: OFFLINE_LIBRARY_AUTHORITY.entryId, compatibility: { nodeMajor: 22, runtimes: ['node', 'browser'] }, executable: { entrypoint: 'assets/marketingSmbV1.ts', testFiles: ['tests/marketingSmbV1.fixture.ts'] }, transport: createOfflineLibraryFixtureTransport({ readCatalog: () => catalog, readEntryAtCommit: () => ({ entry: clone(sourceEntry), files }) }) })
  }

  async buildSiteSpecification(siteId: string, dependencies: Record<string, unknown>): Promise<Record<string, unknown>> { return { siteSpecId: `site-spec:${siteId}`, siteId, kitId: 'home_services', tierId: 'standard', foundation: dependencies.foundation, library: dependencies.library, pages: 5, reservationOwner: 'M06' } }

  private async production(lead: LeadInput): Promise<ReturnType<typeof produceWorkingContent>> {
    const facts = JSON.parse(await readFile(this.config.approvedFactsPath, 'utf8')) as unknown
    const library = await this.libraryEvidence()
    const template = { templateId: 'marketing-smb-v1' as const, libraryAssetPath: 'assets/marketingSmbV1.ts', libraryAssetSha256: OFFLINE_LIBRARY_AUTHORITY.assetChecksums['assets/marketingSmbV1.ts'], baselinePages: [
      { pageId: 'home', route: '/', sections: [{ sectionId: 'hero', componentId: 'SignupHero', copy: { lang: 'en', headline: '{{businessName}} serving {{geography}}', body: 'Approved local service information.' } }] },
      { pageId: 'about', route: '/about', sections: [{ sectionId: 'credentials', componentId: 'CTASection', copy: { lang: 'en', headline: 'About {{businessName}}', body: '{{credentials}}' } }] },
      { pageId: 'services', route: '/services', sections: [{ sectionId: 'offers', componentId: 'OfferShowcase', copy: { lang: 'en', headline: 'Services', offers: ['{{services}}'] } }] },
      { pageId: 'contact', route: '/contact', sections: [{ sectionId: 'contact', componentId: 'CTASection', copy: { lang: 'en', phone: '{{contact.phone}}', email: '{{contact.email}}', address: '{{contact.address}}' } }] },
      { pageId: 'privacy', route: '/privacy', sections: [{ sectionId: 'legal', componentId: 'CTASection', copy: { lang: 'en', copy: '{{legalClaims}}' } }] },
    ], media: [{ assetId: 'library-neutral-mark', source: 'library://marketing-smb-v1/mark', sha256: 'a'.repeat(64), licenseSpdx: 'UNLICENSED', altText: 'Approved neutral template mark', width: 512, height: 512, format: 'webp' as const }] }
    return produceWorkingContent({ lead, facts, template, library, mediaPolicy: { allowedSourcePrefixes: ['library://'], allowedLicenseSpdx: ['UNLICENSED'], maxWidth: 2048, maxHeight: 2048, allowedFormats: ['webp', 'avif', 'jpg', 'png'], requireTemplateMedia: true } })
  }

  async produceInformationArchitecture(siteId: string, lead: LeadInput): Promise<Record<string, unknown>> { return this.boundary('working-content.production', async () => ({ ...await this.production(lead), siteId })) }
  async processMedia(siteId: string, lead: LeadInput): Promise<Record<string, unknown>> { return this.boundary('working-content.media', async () => { const result = await this.production(lead); return { selectedMedia: result.selectedMedia, evidence: result.evidence, siteId } }) }

  async assembleWorkingContent(siteId: string, dependencies: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.boundary('working-content.assemble', async () => {
      const production = dependencies.copy as Record<string, unknown>
      const contentPackage = production.contentPackage as WorkingContentPackage
      assertValidWorkingContentPackage(contentPackage)
      const workingPackageId = `working:${siteId}`
      const orgUuid = stableUuid(this.config.orgId)
      const siteUuid = stableUuid(siteId)
      await ensureTenantRows(this.db, orgUuid, siteUuid)
      const existing = await this.workingContentRepository.readVersion(workingPackageId, 1)
      const version = existing ?? await this.workingContentRepository.createVersion({ workingPackageId, orgId: orgUuid, leadId: siteId.replace(/^site:/, ''), siteId: siteUuid, programRef: 'linksites', runId: null, expectedCurrentVersion: 0, authorId: 'w2-02-orchestrator', executorId: 'content.working.assemble@w2-01-deterministic-adapter.v1', contentPackage })
      return { contentVersion: `${workingPackageId}:${version.versionNumber}`, workingPackageId, workingPackageVersion: version.versionNumber, checksum: version.contentChecksum, lifecycleState: version.lifecycleState, persisted: true, contentPackageReference: `lsites_sites.working_content_versions/${workingPackageId}/${version.versionNumber}` }
    })
  }

  async runGates(siteId: string, workingContent: Record<string, unknown>): Promise<{ accepted: boolean; evidence: string[]; reason?: string; artifactPath?: string; artifactChecksum?: string }> {
    const packageId = String(workingContent.workingPackageId)
    const versionNumber = Number(workingContent.workingPackageVersion)
    const expectedChecksum = String(workingContent.checksum)
    const current = await this.workingContentRepository.readVersion(packageId, versionNumber)
    if (!current || current.contentChecksum !== expectedChecksum) return { accepted: false, evidence: [], reason: 'gate:working-content-not-persisted' }
    if (current.lifecycleState === 'working') await this.workingContentRepository.markReadyForGate(packageId, versionNumber, expectedChecksum)
    const fault = this.fault('content.gates')
    if (fault) {
      const artifact = await this.writeArtifact('working-content-gates-rejected', siteId, { siteId, packageId, versionNumber, checks: { persisted: true, checksum: true, substantiveQuality: false }, accepted: false })
      await this.workingContentRepository.markGateOutcome({ workingPackageId: packageId, versionNumber, expectedChecksum, outcome: 'rejected', gateReference: 'w2-02-content-gates', evidenceReferences: [artifact.path] })
      return { accepted: false, evidence: [artifact.path], reason: 'gate:working-content-rejected', artifactPath: artifact.path, artifactChecksum: artifact.checksum }
    }
    const pages = current.contentPackage.content.pages
    const rendered = JSON.stringify(current.contentPackage.content)
    const routes = new Set(pages.map((page) => page.route))
    const hasRoute = (route: string) => routes.has(route)
    const pageSections = pages.flatMap((page) => page.sections)
    // Each named gate has an independently persisted result.  Do not collapse
    // these into a generic "quality" boolean: downstream promotion relies on
    // the evidence to explain a rejection to the manual review boundary.
    const checks = {
      persisted: true,
      checksum: computeWorkingContentChecksum(current.contentPackage) === expectedChecksum,
      security: !/<script\b|javascript:/i.test(rendered),
      privacy: hasRoute('/privacy') && !/\b(?:password|api[_-]?key|secret)\b/i.test(rendered),
      contact: hasRoute('/contact') && /@|\+\d/.test(rendered),
      link: !/\b(?:javascript:|data:text\/html)/i.test(rendered),
      accessibility: pageSections.every((section) => Boolean(section.componentId) && Object.values(section.content).every((value) => typeof value !== 'string' || !/<img\b(?![^>]*\balt=)/i.test(value))),
      brand: pages.every((page) => page.sections.length > 0) && current.contentPackage.provenance.length > 0,
      vertical: hasRoute('/services') && hasRoute('/contact'),
      requiredSection: pages.every((page) => page.sections.length > 0) && pageSections.some((section) => section.sectionId === 'hero'),
      assets: current.contentPackage.assetRefs.length > 0 && current.contentPackage.assetRefs.every((asset) => Boolean(asset.source) && /^[a-f0-9]{64}$/i.test(asset.sha256)),
      pageCount: pages.length >= 5,
      uniqueRoutes: routes.size === pages.length,
      provenance: current.contentPackage.provenance.length > 0,
    }
    const accepted = Object.values(checks).every(Boolean)
    const artifact = await this.writeArtifact('working-content-gates', siteId, { siteId, packageId, versionNumber, checks, accepted })
    if (!accepted) { await this.workingContentRepository.markGateOutcome({ workingPackageId: packageId, versionNumber, expectedChecksum, outcome: 'rejected', gateReference: 'w2-02-content-gates', evidenceReferences: [artifact.path] }); return { accepted: false, evidence: [artifact.path], reason: 'gate:working-content-quality-failed', artifactPath: artifact.path, artifactChecksum: artifact.checksum } }
    await this.workingContentRepository.markGateOutcome({ workingPackageId: packageId, versionNumber, expectedChecksum, outcome: 'accepted', gateReference: 'w2-02-content-gates', evidenceReferences: [artifact.path] })
    return { accepted: true, evidence: [artifact.path], artifactPath: artifact.path, artifactChecksum: artifact.checksum }
  }

  async promoteDraft(siteId: string, _workingContent: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.boundary('payload.promote-draft', async () => {
      const packageId = `working:${siteId}`
      const version = await this.workingContentRepository.selectExactAcceptedVersion({ workingPackageId: packageId, versionNumber: 1, contentChecksum: String((await this.workingContentRepository.readVersion(packageId, 1))?.contentChecksum) })
      const prepared: WorkingContentPromotionInput = await this.workingContentRepository.preparePromotion({ orgId: version.orgId, workingPackageId: packageId, versionNumber: version.versionNumber, contentChecksum: version.contentChecksum, promotionIdempotencyKey: `promotion:${siteId}` })
      const promotion = await promotePreparedWorkingContent({ repository: this.workingContentRepository, prepared, target: this.payloadTarget, targetSiteId: siteId, promotionRequestId: `promotion-request:${siteId}`, assemblyManifestId: `manifest:${siteId}` })
      return { receipt: promotion.receipt, payloadReceiptId: promotion.payloadReceiptId, payloadDocumentIds: promotion.receipt.itemResults.map((item) => item.payloadDocumentId).filter((id): id is string => Boolean(id)), checksum: prepared.contentChecksum, status: 'draft', published: false, serviceProof: { adapter: 'PayloadRestDraftTarget', baseUrl: this.config.payloadBaseUrl, readbackVerified: true, repositoryReceiptId: promotion.receipt.promotionReceiptId } }
    })
  }

  async readbackDraft(siteId: string, promotion: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.boundary('payload.readback', async () => {
      const ids = Array.isArray(promotion.payloadDocumentIds) ? promotion.payloadDocumentIds.map(String) : []
      const docs = await Promise.all(ids.map((id) => this.payloadTarget.readback(id)))
      const workingPackageId = `working:${siteId}`
      const version = await this.workingContentRepository.readVersion(workingPackageId, 1)
      if (!version || !['accepted', 'promoted'].includes(version.lifecycleState) || version.contentChecksum !== String(promotion.checksum)) throw new Error('gate:payload-readback-source-version-missing')
      const prepared = await this.workingContentRepository.preparePromotion({ orgId: version.orgId, workingPackageId, versionNumber: version.versionNumber, contentChecksum: version.contentChecksum, promotionIdempotencyKey: `promotion:${siteId}` })
      const expectedItems = buildPromotionRequestFromPreparedWorkingContent(prepared, siteId, `promotion-request:${siteId}`, `manifest:${siteId}`).workingPackage.items
      const parity = docs.length === ids.length && docs.every((doc, index) => Boolean(doc && expectedItems[index] && sameFields(expectedItems[index].data, doc)))
      const result = { parity, documentCount: docs.filter(Boolean).length, expectedCount: ids.length, checksum: promotion.checksum, payloadDocumentIds: ids, serviceReadback: true, siteId }
      const artifact = await this.writeArtifact('payload-readback-parity', siteId, result)
      return { ...result, evidencePath: artifact.path, artifactPath: artifact.path, artifactChecksum: artifact.checksum }
    })
  }

  async createPrivatePreview(siteId: string, promotion: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.boundary('frontend.private-preview', async () => { const manifest = { schemaVersion: { major: 1, minor: 0 }, manifestId: `manifest:${siteId}`, manifestVersion: 1, siteId, siteClass: 'preview' as const, kitId: 'home_services', tierId: 'standard', platformReleaseRef: this.config.executingRevision, designProfileRef: 'design:local', contentReleaseRef: String(promotion.checksum), pages: [], lineage: {}, resolvedAt: new Date().toISOString() }; const deployment = createPreviewDeployment({ previewId: `preview:${siteId}`, prospectId: siteId, manifest, payloadDraftContentRef: `payload:${siteId}`, analyticsIdentityRef: `analytics:${siteId}`, accessPolicy: 'token_required', expiresAt: new Date(Date.now() + 86_400_000).toISOString(), qualityReceiptRef: null }); const result = { ...deployment, payloadDocumentIds: promotion.payloadDocumentIds, publicActivation: false, protectedRenderUrl: `${this.config.webMasterBaseUrl}/en/demo/${encodeURIComponent(siteId)}`, previewToken: 'w2-02-private-preview' }; const artifact = await this.writeArtifact('frontend-private-preview', siteId, result); return { ...result, artifactPath: artifact.path, artifactChecksum: artifact.checksum } })
  }

  async renderPrivatePreview(siteId: string, preview: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.boundary('frontend.render', async () => {
      const response = await fetch(String(preview.protectedRenderUrl), { headers: { 'x-preview-token': String(preview.previewToken) } })
      const html = await response.text()
      const robots = response.headers.get('x-robots-tag') ?? ''
      const cache = response.headers.get('cache-control') ?? ''
      if (!response.ok || !html.includes('data-private-preview="true"') || !robots.includes('noindex') || !cache.includes('no-store')) throw new Error('frontend:protected-web-master-render-failed')
      const result = { html, routes: (Array.from(html.matchAll(/data-route="([^"]+)"/g)).map((match) => match[1])), pages: String(preview.payloadDocumentIds).split(','), accessibility: html.includes('<h1>'), seo: robots.includes('noindex'), privacy: cache, protectedServiceProof: { status: response.status, tokenRequired: true, noPublicActivation: true }, siteId }
      const artifact = await this.writeArtifact('frontend-render-gate', siteId, result)
      return { ...result, artifactPath: artifact.path, artifactChecksum: artifact.checksum }
    })
  }

  async captureEvidence(siteId: string, render: Record<string, unknown>): Promise<Record<string, unknown>> { const artifact = await this.writeArtifact('preview-evidence', siteId, render); return { evidenceId: `preview-evidence:${siteId}`, artifactPath: artifact.path, artifactChecksum: artifact.checksum, render, captured: true, persisted: true } }

  private async writeArtifact(kind: string, siteId: string, value: unknown): Promise<{ path: string; checksum: string }> { const path = join(dirname(this.config.statePath), 'evidence', `${kind}-${safeKey(siteId)}.json`); const valueChecksum = checksum(value); await mkdir(dirname(path), { recursive: true }); await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8'); this.artifacts.set(`${kind}:${siteId}`, { path, checksum: valueChecksum }); const stored = JSON.parse(await readFile(path, 'utf8')) as unknown; if (checksum(stored) !== valueChecksum) throw new Error(`evidence:${kind}:readback-failed`); return { path, checksum: valueChecksum } }

  async recordCompletionDelivery(envelope: DemoCompletionEnvelope, write: () => Promise<void>): Promise<void> {
    const fault = this.fault('completion.emit')
    if (fault && fault.kind !== 'crash_after_receipt') throw new Error(`boundary:completion-sink:${fault.kind}-failure`)
    const current = await readFile(this.config.completionPath, 'utf8').catch(() => '')
    if (!current.split(/\r?\n/).some((line) => line.includes(`"idempotency_key":"${envelope.idempotency_key}"`))) await write()
    if (fault?.kind === 'crash_after_receipt') throw new Error('crash-after-receipt:completion-sink')
  }

  async emitCompletion(_envelope: DemoCompletionEnvelope): Promise<void> { throw new Error('completion delivery must use the durable outbox sink') }

  async compensate(issueId: string, reason: string): Promise<'compensated' | 'manual_attention'> { const artifact = await this.writeArtifact('manual-attention-compensation', issueId, { issueId, reason, postMutation: issueId === 'site-render-validation', action: 'retain-payload-draft-and-create-manual-review', publicActivation: false }); return artifact.path ? 'manual_attention' : 'manual_attention' }
  health(): { cms: boolean; frontend: boolean; eventBoundary: boolean } { return { cms: Boolean(this.config.payloadBaseUrl), frontend: Boolean(this.config.webMasterBaseUrl), eventBoundary: true } }
}

export class DurableCompletionSink implements CompletionSink {
  private readonly sink: FileCompletionSink
  constructor(private readonly config: RuntimeConfig, private readonly adapters: LocalBoundaryAdaptersImpl) { this.sink = new FileCompletionSink(config.completionPath) }
  async write(envelope: DemoCompletionEnvelope): Promise<void> { await this.adapters.recordCompletionDelivery(envelope, () => this.sink.write(envelope)) }
}

export type LocalDependencyPorts = { factoryCatalog: Pick<LocalBoundaryAdapters, 'reserveFoundation'>; workingContent: Pick<LocalBoundaryAdapters, 'produceInformationArchitecture' | 'processMedia' | 'assembleWorkingContent' | 'runGates'>; libraryClient: Pick<LocalBoundaryAdapters, 'resolveLibrary'>; cmsAdapter: Pick<LocalBoundaryAdapters, 'promoteDraft' | 'readbackDraft'>; frontendDeploymentAdapter: Pick<LocalBoundaryAdapters, 'createPrivatePreview' | 'renderPrivatePreview' | 'captureEvidence'>; eventAdapter: CompletionSink }
export function createLocalDependencyPorts(adapter: LocalBoundaryAdaptersImpl, completionSink: CompletionSink): LocalDependencyPorts { return { factoryCatalog: adapter, workingContent: adapter, libraryClient: adapter, cmsAdapter: adapter, frontendDeploymentAdapter: adapter, eventAdapter: completionSink } }
