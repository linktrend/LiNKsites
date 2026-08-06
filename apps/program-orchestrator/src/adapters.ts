import { appendFile, mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { createHash, randomUUID } from 'node:crypto'
import type { DemoCompletionEnvelope, EvidenceReceipt, LeadResearchPackage } from '@linksites/types'
import type { AdapterFault, LeadInput, LocalBoundaryAdapters, RuntimeConfig } from './contracts.ts'

type EffectState = { operations: Record<string, unknown>; faults: AdapterFault[]; compensations: Array<{ issueId: string; reason: string; result: 'compensated' | 'manual_attention' }> }

const safeKey = (value: string): string => createHash('sha256').update(value).digest('hex')

export class LocalBoundaryAdaptersImpl implements LocalBoundaryAdapters {
  private state: EffectState = { operations: {}, faults: [], compensations: [] }
  private loaded = false
  private writeChain: Promise<void> = Promise.resolve()
  private readonly config: RuntimeConfig

  constructor(config: RuntimeConfig) { this.config = config }

  private async load(): Promise<void> {
    if (this.loaded) return
    const raw = await readFile(`${this.config.statePath}.adapters.json`, 'utf8').catch(() => '')
    if (raw) this.state = JSON.parse(raw) as EffectState
    this.loaded = true
  }

  private async persist(): Promise<void> {
    this.writeChain = this.writeChain.then(async () => {
      const path = `${this.config.statePath}.adapters.json`
      await mkdir(dirname(path), { recursive: true })
      const temp = `${path}.${process.pid}.${randomUUID()}.tmp`
      await writeFile(temp, `${JSON.stringify(this.state, null, 2)}\n`, 'utf8')
      await rename(temp, path)
    })
    await this.writeChain
  }

  /** Test and local-proof control; production callers cannot inject faults through configuration. */
  async injectFault(fault: AdapterFault): Promise<void> { await this.load(); this.state.faults.push({ ...fault }); await this.persist() }
  async rejectNextGate(): Promise<void> { await this.load(); this.state.operations['gate-rejection'] = true; await this.persist() }

  private async boundary<T>(operation: string, idempotencyKey: string, effect: () => Promise<T>): Promise<T> {
    await this.load()
    const key = `${operation}:${safeKey(idempotencyKey)}`
    if (key in this.state.operations) return structuredClone(this.state.operations[key]) as T
    const fault = this.state.faults.find((candidate) => candidate.operation === operation && candidate.remaining > 0)
    if (fault && fault.kind !== 'crash_after_receipt') {
      fault.remaining -= 1
      await this.persist()
      if (fault.kind === 'permanent') throw new Error(`boundary:${operation}:permanent-failure`)
      throw new Error(`boundary:${operation}:transient-failure`)
    }
    const value = await effect()
    this.state.operations[key] = structuredClone(value)
    await this.persist()
    if (fault?.kind === 'crash_after_receipt' && fault.remaining > 0) {
      fault.remaining -= 1
      await this.persist()
      throw new Error(`crash-after-receipt:${operation}`)
    }
    return structuredClone(value)
  }

  async validateLead(lead: LeadInput): Promise<{ valid: boolean; reason?: string }> {
    if (!lead.lead_id || !lead.org_id || !lead.idempotency_key || !lead.research?.summary || !Array.isArray(lead.research.sources) || lead.research.sources.length === 0) return { valid: false, reason: 'lead:missing-required-research' }
    return { valid: true }
  }

  async qualify(lead: LeadInput): Promise<{ vertical: string; tier: 'standard' }> {
    return this.boundary('qualify', lead.idempotency_key, async () => {
      const accepted = ['home_services', 'plumbing', 'hvac', 'electrical', 'landscaping', 'cleaning']
      if (!accepted.includes(lead.requested_vertical)) throw new Error('qualification:unsupported-vertical')
      return { vertical: 'home_services', tier: 'standard' as const }
    })
  }

  async reserveFoundation(siteId: string, vertical: string): Promise<Record<string, unknown>> {
    return this.boundary('foundation.reserve', siteId, async () => ({ foundationId: 'foundation:marketing-smb-v1:standard', vertical, status: 'reserved', reservationId: `reservation:${siteId}` }))
  }

  async resolveLibrary(siteId: string): Promise<Record<string, unknown>> {
    return this.boundary('library.resolve', siteId, async () => ({ entryId: 'marketing-smb-v1', revision: '39d16d37c976a2fed81eb4f22864ade44689b01f', entryChecksum: '2ea7b6f004451c9f82b74892add71ae42164f5a03c25a8f0d5afdb310107417c', status: 'approved', materialized: true }))
  }

  async buildSiteSpecification(siteId: string, dependencies: Record<string, unknown>): Promise<Record<string, unknown>> {
    return { siteSpecId: `site-spec:${siteId}`, siteId, kitId: 'home_services', tierId: 'standard', foundation: dependencies.foundation, library: dependencies.library, pages: 6 }
  }

  async produceInformationArchitecture(siteId: string, lead: LeadInput): Promise<Record<string, unknown>> {
    return this.boundary('working-content.copy', siteId, async () => ({ version: `content:${siteId}:copy:v1`, pages: ['home', 'services', 'about', 'service-area', 'reviews', 'contact'], claims: [{ value: lead.research.summary, provenance: lead.research.sources[0] }], copyKind: 'lead-specific-generated-language' }))
  }

  async processMedia(siteId: string, lead: LeadInput): Promise<Record<string, unknown>> {
    return this.boundary('working-content.media', siteId, async () => ({ version: `content:${siteId}:media:v1`, assets: [{ assetId: `asset:${siteId}:neutral-hero`, source: 'local-approved-fixture', license: 'repository-fixture', alt: `${lead.requested_vertical} service illustration` }], provenance: 'local-approved-fixture' }))
  }

  async assembleWorkingContent(siteId: string, dependencies: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.boundary('working-content.assemble', siteId, async () => ({ contentVersion: `content:${siteId}:v1`, checksum: createHash('sha256').update(JSON.stringify(dependencies)).digest('hex'), copy: dependencies.copy, media: dependencies.media, schemaVersion: '1.0', accepted: true }))
  }

  async runGates(siteId: string, workingContent: Record<string, unknown>): Promise<{ accepted: boolean; evidence: string[]; reason?: string }> {
    await this.load()
    if (this.state.operations['gate-rejection']) { delete this.state.operations['gate-rejection']; await this.persist(); return { accepted: false, evidence: [], reason: 'gate:working-content-rejected' } }
    if (workingContent.accepted !== true || !workingContent.checksum) return { accepted: false, evidence: [], reason: 'gate:working-content-incomplete' }
    return { accepted: true, evidence: [`evidence:${siteId}:content`, `evidence:${siteId}:schema`, `evidence:${siteId}:quality`, `evidence:${siteId}:security`, `evidence:${siteId}:assets`] }
  }

  async promoteDraft(siteId: string, workingContent: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.boundary('payload.promote-draft', siteId, async () => ({ payloadDocumentId: `pages:${siteId}`, revision: `payload-draft:${siteId}:v1`, checksum: String(workingContent.checksum), status: 'draft', published: false }))
  }

  async readbackDraft(siteId: string, promotion: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.boundary('payload.readback', siteId, async () => ({ parity: true, payloadDocumentId: promotion.payloadDocumentId, revision: promotion.revision, checksum: promotion.checksum }))
  }

  async createPrivatePreview(siteId: string, promotion: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.boundary('frontend.private-preview', siteId, async () => ({ previewId: `preview:${siteId}`, url: `http://127.0.0.1:3000/demo/local-${siteId}`, access: 'token_required', indexing: 'noindex', payloadDocumentId: promotion.payloadDocumentId, publicActivation: false }))
  }

  async renderPrivatePreview(siteId: string, preview: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.boundary('frontend.render', siteId, async () => ({ rendered: true, previewId: preview.previewId, routes: ['/', '/about', '/services', '/contact', '/privacy-policy', '/terms-of-use'], accessibility: true, seo: true, privacy: 'noindex,nofollow,no-store' }))
  }

  async captureEvidence(siteId: string, render: Record<string, unknown>): Promise<Record<string, unknown>> {
    return { evidenceId: `preview-evidence:${siteId}`, render, captured: true, storage: `local://w2-02/${siteId}/evidence.json` }
  }

  async emitCompletion(envelope: DemoCompletionEnvelope): Promise<void> {
    await this.load()
    const fault = this.state.faults.find((candidate) => candidate.operation === 'completion.emit' && candidate.remaining > 0)
    if (fault && fault.kind !== 'crash_after_receipt') {
      fault.remaining -= 1
      await this.persist()
      throw new Error(`boundary:completion-event:${fault.kind}-failure`)
    }
    await mkdir(dirname(this.config.completionPath), { recursive: true })
    const current = await readFile(this.config.completionPath, 'utf8').catch(() => '')
    const alreadyDelivered = current.split(/\r?\n/).some((line) => line.includes(`"idempotency_key":"${envelope.idempotency_key}"`))
    if (!alreadyDelivered) await appendFile(this.config.completionPath, `${JSON.stringify(envelope)}\n`, 'utf8')
    if (fault?.kind === 'crash_after_receipt' && fault.remaining > 0) {
      fault.remaining -= 1
      await this.persist()
      throw new Error('crash-after-receipt:completion.emit')
    }
  }

  async compensate(issueId: string, reason: string): Promise<'compensated' | 'manual_attention'> {
    await this.load()
    const result: 'compensated' | 'manual_attention' = issueId === 'private-preview-render' ? 'compensated' : 'manual_attention'
    this.state.compensations.push({ issueId, reason, result })
    await this.persist()
    return result
  }

  health(): { cms: boolean; frontend: boolean; eventBoundary: boolean } { return { cms: true, frontend: true, eventBoundary: true } }
}

export type LocalAdapters = LocalBoundaryAdaptersImpl

/** Named local equivalents used by the production composition root. They share
 * one durable effect store so a boundary cannot hide a second process-local
 * source of truth. The interfaces are deliberately the same application
 * boundary a future live adapter will implement. */
export type LocalDependencyPorts = {
  factoryCatalog: Pick<LocalBoundaryAdapters, 'reserveFoundation'>
  workingContent: Pick<LocalBoundaryAdapters, 'produceInformationArchitecture' | 'processMedia' | 'assembleWorkingContent' | 'runGates'>
  libraryClient: Pick<LocalBoundaryAdapters, 'resolveLibrary'>
  cmsAdapter: Pick<LocalBoundaryAdapters, 'promoteDraft' | 'readbackDraft'>
  frontendDeploymentAdapter: Pick<LocalBoundaryAdapters, 'createPrivatePreview' | 'renderPrivatePreview' | 'captureEvidence'>
  eventAdapter: Pick<LocalBoundaryAdapters, 'emitCompletion'>
}

export function createLocalDependencyPorts(adapter: LocalBoundaryAdaptersImpl): LocalDependencyPorts {
  return {
    factoryCatalog: adapter,
    workingContent: adapter,
    libraryClient: adapter,
    cmsAdapter: adapter,
    frontendDeploymentAdapter: adapter,
    eventAdapter: adapter,
  }
}
