import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { createHash, randomUUID } from 'node:crypto'
import type { DemoCompletionEnvelope, LeadResearchPackage } from '@linksites/types'
import { FileCompletionSink, type CompletionSink } from '@linksites/intake-orchestrator'
import {
  createPreviewDeployment,
  type LibraryConsumptionEvidence,
  type PayloadDraftTarget,
  type WorkingContentPackage,
  WorkingContentRepository,
  type WorkingContentPromotionInput,
  produceWorkingContent,
  buildPromotionRequestFromPreparedWorkingContent,
  canonicalJsonChecksum,
  MASTER_TEMPLATE_ID,
  MARKETING_SMB_V1_CATALOG_AUTHORITY,
  promotePreparedWorkingContent,
  assertValidWorkingContentPackage,
  computeWorkingContentChecksum,
} from '@linksites/factory-catalog'
import { PayloadRestDraftTarget } from '@linksites/factory-catalog'
import type { AdapterFault, ExternalFence, LeadInput, LocalBoundaryAdapters, RuntimeConfig } from './contracts.ts'
import { ensureTenantRows, type SqlDatabase, type SqlQueryExecutor } from './local-database.ts'

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
  if (typeof expected === 'string' && (typeof actual === 'number' || typeof actual === 'string')) return expected === String(actual)
  if (typeof expected === 'string' && actual && typeof actual === 'object' && !Array.isArray(actual) && ['number', 'string'].includes(typeof (actual as Record<string, unknown>).id)) return expected === String((actual as Record<string, unknown>).id)
  if (Array.isArray(expected)) return Array.isArray(actual) && expected.length === actual.length && expected.every((item, index) => sameFields(item, actual[index]))
  if (expected && typeof expected === 'object') return Boolean(actual && typeof actual === 'object' && !Array.isArray(actual) && Object.entries(expected as Record<string, unknown>).every(([key, value]) => sameFields(value, (actual as Record<string, unknown>)[key])))
  return String(expected) === String(actual)
}

export class LocalBoundaryAdaptersImpl implements LocalBoundaryAdapters {
  private readonly faults: AdapterFault[] = []
  private readonly artifacts = new Map<string, { path: string; checksum: string }>()
  private readonly config: RuntimeConfig
  private readonly db: SqlQueryExecutor
  private readonly workingContentRepository: WorkingContentRepository
  private readonly payloadTarget: PayloadDraftTarget
  private leaseVerifier: ((fence: ExternalFence) => Promise<void>) | null = null
  private payloadDiagnostic = 'not-attempted'

  constructor(config: RuntimeConfig, db: SqlQueryExecutor) {
    this.config = config
    this.db = db
    this.workingContentRepository = new WorkingContentRepository(db)
    this.payloadTarget = new PayloadRestDraftTarget({ baseUrl: config.payloadBaseUrl, credential: { collectionSlug: 'users', apiKey: config.payloadApiKey } })
  }

  async injectFault(fault: AdapterFault): Promise<void> { this.faults.push({ ...fault }) }
  bindLeaseVerifier(verifier: (fence: ExternalFence) => Promise<void>): void { this.leaseVerifier = verifier }
  lastPayloadDiagnostic(): string { return this.payloadDiagnostic }
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

  private async boundary<T>(operation: string, effect: () => Promise<T>, fence?: ExternalFence): Promise<T> {
    if (fence) {
      if (!this.leaseVerifier) throw new Error('boundary:lease-verifier-unbound')
      await this.leaseVerifier(fence)
    }
    const fault = this.fault(operation)
    if (fault && fault.kind !== 'crash_after_receipt') throw new Error(`boundary:${operation}:${fault.kind}-failure`)
    const value = await effect()
    if (fence) await this.leaseVerifier!(fence)
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

  async reserveFoundation(siteId: string, vertical: string): Promise<Record<string, unknown>> { return this.boundary('foundation.reserve', async () => ({ foundationId: `foundation:${MASTER_TEMPLATE_ID}:standard`, templateId: MASTER_TEMPLATE_ID, vertical, status: 'reserved', reservationId: `reservation:${siteId}`, owner: 'M06-preview-inventory-management', dependencies: ['vertical-qualification'] })) }

  async resolveLibrary(siteId: string): Promise<Record<string, unknown>> { return this.boundary('library.verify', async () => { const consumption = await this.libraryEvidence(); return { entryId: consumption.entry.entryId, revision: this.config.libraryCommitSha, catalogChecksum: this.config.libraryCatalogChecksum, entryChecksum: this.config.libraryEntryChecksum, status: 'approved', materialized: true, verificationId: consumption.receipt.verificationId, consumption, siteId } }) }

  private async libraryEvidence(): Promise<LibraryConsumptionEvidence> {
    const authority = {
      commitSha: this.config.libraryCommitSha,
      catalogChecksum: this.config.libraryCatalogChecksum,
      entryChecksum: this.config.libraryEntryChecksum,
      entryId: 'marketing-smb-v1',
      entryPath: 'entries/marketing-smb-v1',
      verificationId: MARKETING_SMB_V1_CATALOG_AUTHORITY.verificationId,
    }
    const git = (...args: string[]) => execFileSync('git', ['-C', this.config.libraryRepositoryPath, ...args], { encoding: 'utf8' })
    git('cat-file', '-e', `${authority.commitSha}^{commit}`)
    const catalogRaw = git('show', `${authority.commitSha}:indexes/catalog.json`)
    if (createHash('sha256').update(catalogRaw, 'utf8').digest('hex') !== authority.catalogChecksum) throw new Error('library:catalog-checksum-mismatch')
    const catalog = JSON.parse(catalogRaw) as { entries?: Array<{ entryId?: string; status?: string }> }
    if (!catalog.entries?.some((row) => row.entryId === authority.entryId && row.status === 'approved')) throw new Error('library:approved-entry-missing')
    const entryRaw = git('show', `${authority.commitSha}:${authority.entryPath}/entry.json`)
    if (createHash('sha256').update(entryRaw, 'utf8').digest('hex') !== authority.entryChecksum) throw new Error('library:entry-checksum-mismatch')
    const entry = JSON.parse(entryRaw) as LibraryConsumptionEvidence['entry']
    const files = Object.fromEntries(entry.files.map((asset) => [asset.path, git('show', `${authority.commitSha}:${authority.entryPath}/${asset.path}`)]))
    for (const asset of entry.files) if (createHash('sha256').update(files[asset.path] ?? '', 'utf8').digest('hex') !== asset.sha256) throw new Error(`library:asset-checksum-mismatch:${asset.path}`)
    // The deployment manifest pins the raw entry.json bytes above. The
    // Factory Catalog evidence contract separately records the canonical
    // entry-object digest, so consumers can verify the parsed metadata and
    // every materialized asset independent of JSON whitespace/order.
    const entryChecksum = canonicalJsonChecksum(entry)
    const assetChecksums = Object.fromEntries(entry.files.map((asset) => [asset.path, asset.sha256]))
    return { entry, files, receipt: { schemaVersion: { major: 1, minor: 0 }, receiptId: `library-consumption:${authority.entryId}:${authority.commitSha}`, consumer: 'linksites', entryId: authority.entryId, catalogCommitSha: authority.commitSha, libraryCommitSha: authority.commitSha, entryChecksum, assetChecksums, entrypoint: 'src/index.mjs', testFiles: ['tests/marketing-smb-v1.test.mjs'], verificationId: authority.verificationId, compatibility: { compatible: true, consumer: 'linksites', nodeMajor: 22, runtimes: ['node', 'browser'] }, recordedAt: new Date().toISOString() }, verification: { ...MARKETING_SMB_V1_CATALOG_AUTHORITY, assetChecksums } } as LibraryConsumptionEvidence
  }

  async buildSiteSpecification(siteId: string, dependencies: Record<string, unknown>): Promise<Record<string, unknown>> { return { siteSpecId: `site-spec:${siteId}`, siteId, kitId: 'home_services', tierId: 'standard', foundation: dependencies.foundation, library: dependencies.library, pages: 5, reservationOwner: 'M06' } }

  private async production(lead: LeadInput): Promise<ReturnType<typeof produceWorkingContent>> {
    const facts = JSON.parse(await readFile(this.config.approvedFactsPath, 'utf8')) as unknown
    const library = await this.libraryEvidence()
    const template = { templateId: library.entry.entryId, libraryAssetPath: 'src/index.mjs', libraryAssetSha256: library.receipt.assetChecksums['src/index.mjs'], baselinePages: [
      { pageId: 'home', route: '/', sections: [{ sectionId: 'hero', componentId: 'SignupHero', copy: { lang: 'en', headline: '{{businessName}} serving {{geography}}', body: 'Approved local service information.' } }] },
      { pageId: 'about', route: '/about', sections: [{ sectionId: 'credentials', componentId: 'CTASection', copy: { lang: 'en', headline: 'About {{businessName}}', body: '{{credentials}}' } }] },
      { pageId: 'services', route: '/services', sections: [{ sectionId: 'offers', componentId: 'OfferShowcase', copy: { lang: 'en', headline: 'Services', offers: ['{{services}}'] } }] },
      { pageId: 'contact', route: '/contact', sections: [{ sectionId: 'contact', componentId: 'CTASection', copy: { lang: 'en', phone: '{{contact.phone}}', email: '{{contact.email}}', address: '{{contact.address}}' } }] },
      { pageId: 'privacy', route: '/privacy', sections: [{ sectionId: 'legal', componentId: 'CTASection', copy: { lang: 'en', copy: '{{legalClaims}}' } }] },
    ], media: [{ assetId: 'library-neutral-mark', source: `library://${library.entry.entryId}/mark`, sha256: 'a'.repeat(64), licenseSpdx: 'UNLICENSED', altText: 'Approved neutral template mark', width: 512, height: 512, format: 'webp' as const }] }
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
      const orgUuid = this.config.mode === 'production' ? this.config.orgId : stableUuid(this.config.orgId)
      const siteUuid = this.config.mode === 'production' ? this.config.siteId! : stableUuid(siteId)
      if (this.config.mode === 'production') {
        const tenant = await this.db.query(
          `select s.id from lsites_sites.sites s where s.id = $1 and s.org_id = $2`,
          [siteUuid, orgUuid],
        )
        if (tenant.rows.length !== 1) throw new Error('working-content:production-tenant-site-absent-or-unauthorized')
      } else {
        await ensureTenantRows(this.db as SqlDatabase, orgUuid, siteUuid)
      }
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

  async promoteDraft(siteId: string, _workingContent: Record<string, unknown>, fence: ExternalFence): Promise<Record<string, unknown>> {
    return this.boundary('payload.promote-draft', async () => {
      try {
        const packageId = `working:${siteId}`
        const version = await this.workingContentRepository.selectExactAcceptedVersion({ workingPackageId: packageId, versionNumber: 1, contentChecksum: String((await this.workingContentRepository.readVersion(packageId, 1))?.contentChecksum) })
        const prepared: WorkingContentPromotionInput = await this.workingContentRepository.preparePromotion({ orgId: version.orgId, workingPackageId: packageId, versionNumber: version.versionNumber, contentChecksum: version.contentChecksum, promotionIdempotencyKey: `promotion:${siteId}` })
        // The durable working-package key remains lead-specific, while the REST
        // mutation is constrained to the authenticated, seeded Payload site.
        const promotionRunMarker = siteId.replace(/^site:/, '')
        const promotion = await promotePreparedWorkingContent({ repository: this.workingContentRepository, prepared, target: this.payloadTarget, targetSiteId: this.config.payloadSiteId, promotionRequestId: `promotion-request:${siteId}`, assemblyManifestId: `manifest:${siteId}`, promotionRunMarker })
        this.payloadDiagnostic = 'succeeded'
        return { receipt: promotion.receipt, payloadReceiptId: promotion.payloadReceiptId, payloadDocumentIds: promotion.receipt.itemResults.map((item) => item.payloadDocumentId).filter((id): id is string => Boolean(id)), checksum: prepared.contentChecksum, status: 'draft', published: false, serviceProof: { adapter: 'PayloadRestDraftTarget', baseUrl: this.config.payloadBaseUrl, readbackVerified: true, repositoryReceiptId: promotion.receipt.promotionReceiptId } }
      } catch (error) {
        this.payloadDiagnostic = safePayloadDiagnostic(error)
        throw error
      }
    }, fence)
  }

  async readbackDraft(siteId: string, promotion: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.boundary('payload.readback', async () => {
      const ids = Array.isArray(promotion.payloadDocumentIds) ? promotion.payloadDocumentIds.map(String) : []
      const docs = await Promise.all(ids.map((id) => this.payloadTarget.readback(id)))
      const workingPackageId = `working:${siteId}`
      const version = await this.workingContentRepository.readVersion(workingPackageId, 1)
      if (!version || !['accepted', 'promoted'].includes(version.lifecycleState) || version.contentChecksum !== String(promotion.checksum)) throw new Error('gate:payload-readback-source-version-missing')
      const prepared = await this.workingContentRepository.preparePromotion({ orgId: version.orgId, workingPackageId, versionNumber: version.versionNumber, contentChecksum: version.contentChecksum, promotionIdempotencyKey: `promotion:${siteId}` })
      const expectedItems = buildPromotionRequestFromPreparedWorkingContent(prepared, this.config.payloadSiteId, `promotion-request:${siteId}`, `manifest:${siteId}`, siteId.replace(/^site:/, '')).workingPackage.items
      const parity = docs.length === ids.length && docs.every((doc, index) => Boolean(doc && expectedItems[index] && sameFields(expectedItems[index].data, doc)))
      const result = { parity, documentCount: docs.filter(Boolean).length, expectedCount: ids.length, checksum: promotion.checksum, payloadDocumentIds: ids, serviceReadback: true, siteId }
      const artifact = await this.writeArtifact('payload-readback-parity', siteId, result)
      return { ...result, evidencePath: artifact.path, artifactPath: artifact.path, artifactChecksum: artifact.checksum }
    })
  }

  async publishPrivatePayload(siteId: string, promotion: Record<string, unknown>, fence: ExternalFence): Promise<Record<string, unknown>> {
    return this.boundary('payload.publish-private', async () => {
      if (!this.payloadTarget.publishPrivate) throw new Error('payload:private-publication-adapter-unavailable')
      const ids = Array.isArray(promotion.payloadDocumentIds) ? promotion.payloadDocumentIds.map(String) : []
      if (ids.length === 0 || promotion.parity !== true) throw new Error('payload:private-publication-requires-verified-draft')
      const publicationMarker = siteId.replace(/^site:/, '')
      const publications = await Promise.all(ids.map((id) => this.payloadTarget.publishPrivate!(id, publicationMarker, this.config.payloadSiteId)))
      const owningSite = (readback: Record<string, unknown>) => readback.site && typeof readback.site === 'object' ? String((readback.site as Record<string, unknown>).id) : String(readback.site)
      if (!publications.every((item) => item.published && item.readback.status === 'published' && item.readback.previewEnvironment === 'private-preview' && item.readback.promotionRunMarker === publicationMarker && owningSite(item.readback) === this.config.payloadSiteId)) throw new Error('payload:private-publication-readback-failed')
      const result = { siteId, payloadDocumentIds: ids, status: 'published', audience: 'private-preview', publicActivation: false, publicationReadback: publications.map((item) => ({ published: item.published, status: item.readback.status, previewEnvironment: item.readback.previewEnvironment, promotionRunMarker: item.readback.promotionRunMarker, owningSite: owningSite(item.readback), publicActivation: item.readback.publicActivation })) }
      const artifact = await this.writeArtifact('payload-private-publication', siteId, result)
      return { ...result, artifactPath: artifact.path, artifactChecksum: artifact.checksum }
    }, fence)
  }

  async createPrivatePreview(siteId: string, promotion: Record<string, unknown>, fence: ExternalFence): Promise<Record<string, unknown>> {
    return this.boundary('frontend.private-preview', async () => {
      const ids = Array.isArray(promotion.payloadDocumentIds) ? promotion.payloadDocumentIds.map(String) : []
      // The authenticated Payload publication has already read back published
      // private-preview records. The stable completion URL is protected by the
      // external privacy middleware, not by a secret in the URL.
      if (ids.length === 0 || promotion.parity !== true) throw new Error('payload:private-preview-requires-verified-draft-receipt')
      const manifest = { schemaVersion: { major: 1, minor: 0 }, manifestId: `manifest:${siteId}`, manifestVersion: 1, siteId, siteClass: 'preview' as const, kitId: 'home_services', tierId: 'standard', platformReleaseRef: this.config.executingRevision, designProfileRef: 'design:local', contentReleaseRef: String(promotion.checksum), pages: [], lineage: {}, resolvedAt: new Date().toISOString() }
      const deployment = createPreviewDeployment({ previewId: `preview:${siteId}`, prospectId: siteId, manifest, payloadDraftContentRef: `payload:${siteId}`, analyticsIdentityRef: `analytics:${siteId}`, accessPolicy: 'token_required', expiresAt: new Date(Date.now() + 86_400_000).toISOString(), qualityReceiptRef: null })
      // Tokens and token-bearing URLs are transport credentials. They must
      // never enter the ledger, evidence, receipt, or completion envelope.
      const protectedBase = new URL(this.config.webMasterBaseUrl)
      if (protectedBase.username || protectedBase.password || protectedBase.search || protectedBase.hash || (this.config.mode === 'production' && ['localhost', '127.0.0.1', '::1'].includes(protectedBase.hostname))) throw new Error('frontend:protected-web-master-url-is-invalid')
      const privatePreviewUrl = new URL('/en/demo', protectedBase).toString()
      const result = { ...deployment, privatePreviewUrl, payloadDocumentIds: ids, cmsPublication: { audience: 'private-preview', authenticated: true, status: 'published', publicActivation: false }, publicActivation: false, protectedRoute: '/en/demo', secretFreeUrl: true }
      const artifact = await this.writeArtifact('frontend-private-preview', siteId, result)
      return { ...result, artifactPath: artifact.path, artifactChecksum: artifact.checksum }
    }, fence)
  }

  async renderPrivatePreview(siteId: string, preview: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.boundary('frontend.render', async () => {
      const response = await fetch(`${this.config.webMasterBaseUrl}/en/demo`, { headers: { 'X-LiNKsites-Preview-Key': this.config.previewAccessToken } })
      const html = await response.text()
      const robots = response.headers.get('x-robots-tag') ?? ''
      const cache = response.headers.get('cache-control') ?? ''
      if (!response.ok || !html.includes('data-private-preview="true"') || !robots.includes('noindex') || !cache.includes('no-store')) throw new Error('frontend:protected-web-master-render-failed')
      // The response body can legitimately contain a token-bearing navigation
      // link. It is evaluated in-memory, then represented by a checksum and
      // boolean gates only; durable evidence must never retain that credential.
      const result = { htmlChecksum: checksum(html), routes: (Array.from(html.matchAll(/data-route="([^"]+)"/g)).map((match) => match[1])), pages: String(preview.payloadDocumentIds).split(','), accessibility: html.includes('<h1>'), seo: robots.includes('noindex'), privacy: cache, protectedServiceProof: { status: response.status, tokenRequired: true, noPublicActivation: true }, siteId }
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
  async health(): Promise<{ cms: boolean; frontend: boolean; library: boolean; eventBoundary: boolean }> {
    const cms = await fetch(`${this.config.payloadBaseUrl}/api/pages?site=${encodeURIComponent(this.config.payloadSiteId)}&limit=1`, { headers: { Authorization: `users API-Key ${this.config.payloadApiKey}` } }).then((response) => response.ok).catch(() => false)
    const frontend = await fetch(`${this.config.webMasterBaseUrl}/api/healthz`).then(async (response) => response.ok && (await response.json() as { service?: unknown }).service === 'web-master').catch(() => false)
    const library = await Promise.resolve().then(() => {
      execFileSync('git', ['-C', this.config.libraryRepositoryPath, 'cat-file', '-e', `${this.config.libraryCommitSha}^{commit}`], { stdio: 'ignore' })
      return true
    }).catch(() => false)
    // Exercise the actual durable boundary with a reversible write/read/delete,
    // not merely a directory creation check.
    const probePath = `${this.config.completionPath}.health-${process.pid}-${randomUUID()}`
    const eventBoundary = this.config.mode === 'production'
      ? await this.db.query('select 1 from lsites_ledger.program_completion_deliveries limit 1').then(() => true).catch(() => false)
      : await mkdir(dirname(probePath), { recursive: true }).then(async () => {
      const marker = `health:${randomUUID()}`
      await writeFile(probePath, marker, { flag: 'wx' })
      const readback = await readFile(probePath, 'utf8')
      await import('node:fs/promises').then(({ unlink }) => unlink(probePath))
      return readback === marker
    }).catch(async () => {
      await import('node:fs/promises').then(({ unlink }) => unlink(probePath)).catch(() => undefined)
      return false
    })
    return { cms, frontend, library, eventBoundary }
  }
}

function safePayloadDiagnostic(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  const exactBoundary = message.match(/payload-rest:(?:POST|PATCH):[^:]+:http-\d{3}:[A-Za-z0-9 ._-]+/u)?.[0]
  if (exactBoundary) return exactBoundary
  const parityPaths = message.match(/payload-parity-mismatch:([A-Za-z0-9_.\[\],-]+)/u)?.[1]
  if (parityPaths) return `payload-readback:field-parity-mismatch:${parityPaths}`
  if (message.includes('readback verification failed: promoted fields do not match the source package')) return 'payload-readback:field-parity-mismatch'
  if (message.includes('readback verification failed: document not retrievable after write')) return 'payload-readback:not-retrievable'
  return `non-http-error-sha256:${createHash('sha256').update(message).digest('hex')}`
}

export class DurableCompletionSink implements CompletionSink {
  private readonly sink: FileCompletionSink
  constructor(private readonly config: RuntimeConfig, private readonly adapters: LocalBoundaryAdaptersImpl) { this.sink = new FileCompletionSink(config.completionPath) }
  async write(envelope: DemoCompletionEnvelope): Promise<void> { await this.adapters.recordCompletionDelivery(envelope, () => this.sink.write(envelope)) }
}

export type LocalDependencyPorts = { factoryCatalog: Pick<LocalBoundaryAdapters, 'reserveFoundation'>; workingContent: Pick<LocalBoundaryAdapters, 'produceInformationArchitecture' | 'processMedia' | 'assembleWorkingContent' | 'runGates'>; libraryClient: Pick<LocalBoundaryAdapters, 'resolveLibrary'>; cmsAdapter: Pick<LocalBoundaryAdapters, 'promoteDraft' | 'readbackDraft' | 'publishPrivatePayload'>; frontendDeploymentAdapter: Pick<LocalBoundaryAdapters, 'createPrivatePreview' | 'renderPrivatePreview' | 'captureEvidence'>; eventAdapter: CompletionSink }
export function createLocalDependencyPorts(adapter: LocalBoundaryAdaptersImpl, completionSink: CompletionSink): LocalDependencyPorts { return { factoryCatalog: adapter, workingContent: adapter, libraryClient: adapter, cmsAdapter: adapter, frontendDeploymentAdapter: adapter, eventAdapter: completionSink } }
