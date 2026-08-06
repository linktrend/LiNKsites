import { createHash } from 'node:crypto'
import type { DemoCompletionEnvelope, EvidenceReceipt, LeadResearchPackage } from '@linksites/types'
import { W2_02_GRAPH } from './graph.ts'
import { DurableLedger } from './durable-store.ts'
import type { FailureClass, IssueRecord, LocalBoundaryAdapters, RuntimeConfig } from './contracts.ts'
import type { ExecutorRegistry } from './executors.ts'

const revision = '909e3188304b20bd7a19a8e0127eea863426267f'

export type RuntimeHealth = {
  liveness: boolean
  readiness: boolean
  programState: string | null
  activeIssues: number
  retries: number
  deadLetters: number
  manualAttention: number
  completionEmits: number
}

export class ProgramRuntime {
  private lead: LeadResearchPackage | null = null
  private active = 0
  readonly config: RuntimeConfig
  readonly ledger: DurableLedger
  readonly adapters: LocalBoundaryAdapters
  readonly executors: ExecutorRegistry

  constructor(config: RuntimeConfig, ledger: DurableLedger, adapters: LocalBoundaryAdapters, executors: ExecutorRegistry) { this.config = config; this.ledger = ledger; this.adapters = adapters; this.executors = executors }

  async runLead(lead: LeadResearchPackage): Promise<void> {
    this.lead = lead
    const validation = await this.adapters.validateLead(lead)
    if (!validation.valid) throw new Error(validation.reason ?? 'lead:invalid')
    await this.ledger.createOrResume(lead)
    await this.runUntilSettled()
    await this.deliverCompletion().catch(() => undefined)
  }

  async runUntilSettled(maxCycles = 200): Promise<void> {
    for (let cycle = 0; cycle < maxCycles; cycle += 1) {
      const snapshot = await this.ledger.snapshot()
      if (['completed', 'failed', 'manual_attention'].includes(snapshot.program.state)) return
      const ready = await this.ledger.readyIssues()
      if (ready.length === 0) return
      const batch = ready.slice(0, this.config.concurrency)
      const claims = await Promise.all(batch.map((issue) => this.ledger.claim(issue.issueId)))
      await Promise.all(claims.filter((claim): claim is NonNullable<typeof claim> => claim !== null).map((claim) => this.execute(claim.issue, claim.run.runId)))
    }
    throw new Error('runtime:max-cycles-exceeded')
  }

  async health(): Promise<RuntimeHealth> {
    const state = await this.ledger.snapshot().catch(() => null)
    return {
      liveness: true,
      readiness: Boolean(state) && Object.values(this.adapters.health()).every(Boolean),
      programState: state?.program.state ?? null,
      activeIssues: this.active,
      retries: state?.metrics.retries ?? 0,
      deadLetters: state?.deadLetters.length ?? 0,
      manualAttention: state?.manualAttention.length ?? 0,
      completionEmits: state?.metrics.completionEmits ?? 0,
    }
  }

  async completion(): Promise<DemoCompletionEnvelope | null> {
    const state = await this.ledger.snapshot()
    return state.completion.envelope
  }

  async exportState(): Promise<unknown> { return this.ledger.snapshot() }

  private async execute(issue: IssueRecord, runId: string): Promise<void> {
    this.active += 1
    try {
      if (!this.executors.resolve(issue.executorKind, issue.executorVersion)) throw new Error(`executor:unapproved:${issue.executorKind}@${issue.executorVersion}`)
      const output = await this.executeIssue(issue)
      const evidence = [this.evidence(issue, output)]
      if (issue.externalBoundary) await this.ledger.saveReceipt(issue.issueId, issue.externalBoundary, output)
      await this.ledger.succeed(runId, output, evidence)
      if (issue.issueId === 'crm-completion-emit') {
        await this.deliverCompletion().catch(() => undefined)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown'
      const crashAfterReceipt = message.startsWith('crash-after-receipt:')
      if (crashAfterReceipt && issue.externalBoundary) await this.ledger.saveReceipt(issue.issueId, issue.externalBoundary, { recovered: true, safeCode: 'boundary:recovered-after-receipt' })
      const issueBoundary = Boolean(issue.externalBoundary)
      const permanentBoundary = message.includes(':permanent-failure')
      const failure: { class: FailureClass; safeCode: string } = {
        class: message.startsWith('gate:') ? 'gate_rejected' : message.startsWith('qualification:') ? 'invalid_input' : permanentBoundary && issue.irreversible ? 'partial_mutation' : crashAfterReceipt ? 'transient_boundary' : issueBoundary ? 'transient_boundary' : 'unknown',
        safeCode: message.startsWith('gate:') ? 'gate:rejected' : message.startsWith('qualification:') ? 'qualification:unsupported-vertical' : permanentBoundary ? `boundary:${issue.externalBoundary ?? issue.issueId}:permanent-failure` : crashAfterReceipt ? 'boundary:recovered-after-receipt' : issueBoundary ? `boundary:${issue.externalBoundary}:failed` : `issue:${issue.issueId}:failed`,
      }
      const retryable = failure.class === 'transient_boundary'
      const result = await this.ledger.fail(runId, failure, retryable)
      if (result === 'manual_attention' || result === 'dead_letter') await this.adapters.compensate(issue.issueId, failure.safeCode)
    } finally {
      this.active -= 1
    }
  }

  private async executeIssue(issue: IssueRecord): Promise<unknown> {
    const output = (await this.ledger.snapshot()).issues.reduce<Record<string, unknown>>((all, candidate) => { if (candidate.output !== null) all[candidate.issueId] = candidate.output; return all }, {})
    const lead = this.lead ?? this.leadFromSnapshot(await this.ledger.snapshot())
    switch (issue.issueId) {
      case 'lead-pull-validate': return { leadId: lead.lead_id, validated: true, researchSources: lead.research.sources.length }
      case 'program-claim-create': return { programId: (await this.ledger.snapshot()).program.programId, claimed: true, idempotent: true }
      case 'package-qualify': return this.adapters.qualify(lead)
      case 'foundation-reserve': return this.adapters.reserveFoundation(`site:${lead.lead_id}`, String((output['package-qualify'] as { vertical: string }).vertical))
      case 'library-resolve': return this.adapters.resolveLibrary(`site:${lead.lead_id}`)
      case 'site-spec-manifest': return this.adapters.buildSiteSpecification(`site:${lead.lead_id}`, { foundation: output['foundation-reserve'], library: output['library-resolve'] })
      case 'information-architecture-copy': return this.adapters.produceInformationArchitecture(`site:${lead.lead_id}`, lead)
      case 'media-provenance': return this.adapters.processMedia(`site:${lead.lead_id}`, lead)
      case 'working-content-assemble': return this.adapters.assembleWorkingContent(`site:${lead.lead_id}`, { copy: output['information-architecture-copy'], media: output['media-provenance'], manifest: output['site-spec-manifest'] })
      case 'content-quality-gates': {
        const gates = await this.adapters.runGates(`site:${lead.lead_id}`, output['working-content-assemble'] as Record<string, unknown>)
        if (!gates.accepted) throw new Error(gates.reason ?? 'gate:working-content-rejected')
        return gates
      }
      case 'payload-draft-promote': return this.adapters.promoteDraft(`site:${lead.lead_id}`, output['working-content-assemble'] as Record<string, unknown>)
      case 'payload-readback-parity': {
        const result = await this.adapters.readbackDraft(`site:${lead.lead_id}`, output['payload-draft-promote'] as Record<string, unknown>)
        if (result.parity !== true) throw new Error('gate:payload-readback-parity')
        return result
      }
      case 'private-preview-create': return this.adapters.createPrivatePreview(`site:${lead.lead_id}`, output['payload-readback-parity'] as Record<string, unknown>)
      case 'private-preview-render': return this.adapters.renderPrivatePreview(`site:${lead.lead_id}`, output['private-preview-create'] as Record<string, unknown>)
      case 'preview-evidence-capture': return this.adapters.captureEvidence(`site:${lead.lead_id}`, output['private-preview-render'] as Record<string, unknown>)
      case 'crm-completion-emit': return { completionBoundary: 'crm-shaped', exactlyOnce: true, evidence: output['preview-evidence-capture'] }
      default: throw new Error(`executor:unknown:${issue.executorKind}`)
    }
  }

  private evidence(issue: IssueRecord, output: unknown): EvidenceReceipt {
    const checksum = createHash('sha256').update(JSON.stringify(output)).digest('hex')
    return { schema_version: { major: 1, minor: 0 }, org_id: this.config.orgId, correlation_id: `program:${this.config.orgId}`, idempotency_key: `evidence:${issue.issueId}`, receipt_id: `evidence:${issue.issueId}:${checksum.slice(0, 12)}`, producer: `@linksites/program-orchestrator/${issue.executorKind}@${issue.executorVersion}`, subject: { type: 'issue', id: issue.issueId }, checksum: { algorithm: 'sha256', value: checksum }, revision_sha: revision, storage_location: `local://w2-02/${issue.issueId}/${checksum}.json`, gate_association: issue.issueId, timestamp: new Date().toISOString() }
  }

  private async deliverCompletion(): Promise<void> {
    const envelope = await this.ledger.reserveCompletion()
    if (!envelope) return
    await this.adapters.emitCompletion(envelope)
    await this.ledger.markCompletionEmitted()
  }

  private leadFromSnapshot(state: Awaited<ReturnType<DurableLedger['snapshot']>>): LeadResearchPackage {
    return { schema_version: { major: 1, minor: 0 }, org_id: state.program.orgId, correlation_id: `program:${state.program.programId}`, idempotency_key: state.program.idempotencyKey, lead_id: state.program.leadId, requested_vertical: 'home_services', source: 'manual-file', research: { summary: 'recovered local lead', sources: ['local://recovered'] } }
  }
}
