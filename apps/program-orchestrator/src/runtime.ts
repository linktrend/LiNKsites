import { createHash } from 'node:crypto'
import type { DemoCompletionEnvelope, EvidenceReceipt, LeadResearchPackage } from '@linksites/types'
import { W2_02_GRAPH } from './graph.ts'
import { DurableLedger } from './durable-store.ts'
import type { FailureClass, IssueRecord, LocalBoundaryAdapters, RuntimeConfig } from './contracts.ts'
import type { ExecutorRegistry } from './executors.ts'
import type { LocalDependencyPorts } from './adapters.ts'

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

  readonly dependencies: LocalDependencyPorts

  constructor(config: RuntimeConfig, ledger: DurableLedger, adapters: LocalBoundaryAdapters, executors: ExecutorRegistry, dependencies: LocalDependencyPorts) { this.config = config; this.ledger = ledger; this.adapters = adapters; this.executors = executors; this.dependencies = dependencies }

  async runLead(lead: LeadResearchPackage): Promise<void> {
    this.lead = lead
    const validation = await this.adapters.validateLead(lead)
    if (!validation.valid) throw new Error(validation.reason ?? 'lead:invalid')
    await this.ledger.createOrResume(lead)
    await this.ledger.reclaimExpiredLeases()
    await this.runUntilSettled()
    await this.deliverCompletion()
  }

  async runUntilSettled(maxCycles = 200): Promise<void> {
    for (let cycle = 0; cycle < maxCycles; cycle += 1) {
      const snapshot = await this.ledger.snapshot()
      if (['completed', 'failed', 'manual_attention'].includes(snapshot.program.state)) return
      const ready = await this.ledger.readyIssues()
      if (ready.length === 0) return
      const batch = ready.slice(0, this.config.concurrency)
      const claims = await Promise.all(batch.map((issue) => this.ledger.claim(issue.issueId)))
      await Promise.all(claims.filter((claim): claim is NonNullable<typeof claim> => claim !== null).map((claim) => this.execute(claim.issue, claim.run.runId, claim.run.lease?.fencingToken ?? 0)))
    }
    const exhausted = await this.ledger.snapshot()
    throw new Error(`runtime:max-cycles-exceeded:${exhausted.issues.filter((issue) => issue.state !== 'completed').map((issue) => `${issue.issueId}:${issue.state}`).join(',')}`)
  }

  async health(): Promise<RuntimeHealth> {
    const state = await this.ledger.snapshot().catch(() => null)
    return {
      liveness: true,
      readiness: Boolean(state) && Object.values(this.adapters.health()).every(Boolean),
      programState: state?.program.state ?? null,
      activeIssues: this.active,
      retries: state?.metrics.retries ?? 0,
      deadLetters: (state?.deadLetters.length ?? 0) + (state?.metrics.outboxDeadLetters ?? 0),
      manualAttention: state?.manualAttention.length ?? 0,
      completionEmits: state?.metrics.completionEmits ?? 0,
    }
  }

  async completion(): Promise<DemoCompletionEnvelope | null> {
    const state = await this.ledger.snapshot()
    return state.completion.envelope
  }

  async exportState(): Promise<unknown> { const state = await this.ledger.snapshot(); return { ...(sanitize(state) as Record<string, unknown>), executionRevision: this.config.executingRevision, executableCheckpoint: this.config.executableCheckpoint, canonicalGraph: sanitize(state.program.graph), executorRegistry: this.executors.list(), persistedEvidence: state.runs.flatMap((run) => run.evidence).map((evidence) => ({ receiptId: evidence.receipt_id, storageLocation: evidence.storage_location, revisionSha: evidence.revision_sha, checksum: evidence.checksum })) } }

  private async execute(issue: IssueRecord, runId: string, fencingToken: number): Promise<void> {
    this.active += 1
    try {
      if (!this.executors.resolve(issue.executorKind, issue.executorVersion)) throw new Error(`executor:unapproved:${issue.executorKind}@${issue.executorVersion}`)
      await this.ledger.assertLeaseActive(runId, fencingToken)
      const output = await this.executeIssue(issue)
      await this.ledger.assertLeaseActive(runId, fencingToken)
      const evidence = [this.evidence(issue, output)]
      if (issue.externalBoundary) await this.ledger.saveReceipt(issue.issueId, issue.externalBoundary, output)
      await this.ledger.succeed(runId, fencingToken, output, evidence)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown'
      const crashAfterReceipt = message.startsWith('crash-after-receipt:')
      if (crashAfterReceipt && issue.externalBoundary) await this.ledger.saveReceipt(issue.issueId, issue.externalBoundary, { recovered: true, safeCode: 'boundary:recovered-after-receipt' })
      const issueBoundary = Boolean(issue.externalBoundary)
      const permanentBoundary = message.includes(':permanent-failure')
      const priorIrreversibleEffect = (await this.ledger.snapshot()).issues.some((candidate) => candidate.irreversible && candidate.state === 'completed')
      const failure: { class: FailureClass; safeCode: string } = {
        class: message.startsWith('gate:') ? 'gate_rejected' : message.startsWith('qualification:') ? 'invalid_input' : permanentBoundary && issue.irreversible ? 'partial_mutation' : crashAfterReceipt ? 'transient_boundary' : issueBoundary ? 'transient_boundary' : 'unknown',
        safeCode: message.startsWith('gate:') ? 'gate:rejected' : message.startsWith('qualification:') ? 'qualification:unsupported-vertical' : permanentBoundary ? `boundary:${issue.externalBoundary ?? issue.issueId}:permanent-failure` : crashAfterReceipt ? 'boundary:recovered-after-receipt' : issueBoundary ? `boundary:${issue.externalBoundary}:failed` : `issue:${issue.issueId}:failed`,
      }
      if (permanentBoundary && priorIrreversibleEffect && failure.class !== 'gate_rejected') failure.class = 'partial_mutation'
      const retryable = failure.class === 'transient_boundary'
      const result = await this.ledger.fail(runId, fencingToken, failure, retryable)
      if (result === 'manual_attention' || result === 'dead_letter') await this.adapters.compensate(issue.issueId, failure.safeCode)
    } finally {
      this.active -= 1
    }
  }

  private async executeIssue(issue: IssueRecord): Promise<unknown> {
    const output = (await this.ledger.snapshot()).issues.reduce<Record<string, unknown>>((all, candidate) => { if (candidate.output !== null) all[candidate.issueId] = candidate.output; return all }, {})
    const lead = this.lead ?? this.leadFromSnapshot(await this.ledger.snapshot())
    switch (issue.issueId) {
      case 'lead-research': return { leadId: lead.lead_id, validated: true, researchSources: lead.research.sources.length }
      case 'program-claim': return { programId: (await this.ledger.snapshot()).program.programId, claimed: true, idempotent: true, graphPersisted: true }
      case 'vertical-qualification': return this.adapters.qualify(lead)
      case 'foundation-reservation': return this.dependencies.factoryCatalog.reserveFoundation(`site:${lead.lead_id}`, String((output['vertical-qualification'] as { vertical: string }).vertical))
      case 'library-verification': return this.dependencies.libraryClient.resolveLibrary(`site:${lead.lead_id}`)
      case 'site-specification': return this.adapters.buildSiteSpecification(`site:${lead.lead_id}`, { foundation: output['foundation-reservation'], library: output['library-verification'] })
      case 'information-architecture': return this.dependencies.workingContent.produceInformationArchitecture(`site:${lead.lead_id}`, lead)
      case 'media-provenance': return this.dependencies.workingContent.processMedia(`site:${lead.lead_id}`, lead)
      case 'working-content-assembly': return this.dependencies.workingContent.assembleWorkingContent(`site:${lead.lead_id}`, { copy: output['information-architecture'], media: output['media-provenance'], manifest: output['site-specification'] })
      case 'content-gates': {
        const gates = await this.dependencies.workingContent.runGates(`site:${lead.lead_id}`, output['working-content-assembly'] as Record<string, unknown>)
        if (!gates.accepted) throw new Error(gates.reason ?? 'gate:working-content-rejected')
        return gates
      }
      case 'payload-draft': return this.dependencies.cmsAdapter.promoteDraft(`site:${lead.lead_id}`, output['working-content-assembly'] as Record<string, unknown>)
      case 'payload-parity': {
        const result = await this.dependencies.cmsAdapter.readbackDraft(`site:${lead.lead_id}`, output['payload-draft'] as Record<string, unknown>)
        if (result.parity !== true) throw new Error('gate:payload-readback-parity')
        return result
      }
      case 'private-publication': return this.dependencies.frontendDeploymentAdapter.createPrivatePreview(`site:${lead.lead_id}`, output['payload-parity'] as Record<string, unknown>)
      case 'site-render-validation': return this.dependencies.frontendDeploymentAdapter.renderPrivatePreview(`site:${lead.lead_id}`, output['private-publication'] as Record<string, unknown>)
      case 'final-evidence': return this.dependencies.frontendDeploymentAdapter.captureEvidence(`site:${lead.lead_id}`, output['site-render-validation'] as Record<string, unknown>)
      case 'completion-record': return { completionBoundary: 'shared-completion-sink', exactlyOnce: true, evidence: output['final-evidence'], executionRevision: this.config.executingRevision, executableCheckpoint: this.config.executableCheckpoint }
      default: throw new Error(`executor:unknown:${issue.executorKind}`)
    }
  }

  private evidence(issue: IssueRecord, output: unknown): EvidenceReceipt {
    const checksum = createHash('sha256').update(JSON.stringify(output)).digest('hex')
    const artifactPath = output && typeof output === 'object' && 'artifactPath' in output && typeof output.artifactPath === 'string' ? output.artifactPath : output && typeof output === 'object' && 'evidence' in output && Array.isArray(output.evidence) && typeof output.evidence[0] === 'string' ? output.evidence[0] : `local://w2-02/${issue.issueId}/${checksum}.json`
    return { schema_version: { major: 1, minor: 0 }, org_id: this.config.orgId, correlation_id: `program:${this.config.orgId}`, idempotency_key: `evidence:${issue.issueId}`, receipt_id: `evidence:${issue.issueId}:${checksum.slice(0, 12)}`, producer: `@linksites/program-orchestrator/${issue.executorKind}@${issue.executorVersion}`, subject: { type: 'issue', id: issue.issueId }, checksum: { algorithm: 'sha256', value: checksum }, revision_sha: this.config.executingRevision, storage_location: artifactPath, gate_association: issue.issueId, timestamp: new Date().toISOString() }
  }

  private async deliverCompletion(): Promise<void> {
    const envelope = await this.ledger.reserveCompletion()
    if (!envelope) return
    const key = envelope.idempotency_key
    // A reserved completion is intentionally not delivery-ready until the
    // durable outbox says its retry time has arrived.  This prevents a caller
    // from bypassing nextAttemptAt or resurrecting a dead-lettered event.
    if (!(await this.ledger.outboxReady(key))) return
    if (!(await this.ledger.outboxAttempt(key))) return
    try {
      await this.dependencies.eventAdapter.write(envelope)
      await this.ledger.markCompletionEmitted()
    } catch (error) {
      await this.ledger.outboxFailure(key, error instanceof Error ? error.message : String(error))
      throw error
    }
  }

  private leadFromSnapshot(state: Awaited<ReturnType<DurableLedger['snapshot']>>): LeadResearchPackage {
    return { schema_version: { major: 1, minor: 0 }, org_id: state.program.orgId, correlation_id: `program:${state.program.programId}`, idempotency_key: state.program.idempotencyKey, lead_id: state.program.leadId, requested_vertical: 'home_services', source: 'manual-file', research: { summary: 'recovered local lead', sources: ['local://recovered'] } }
  }
}

function sanitize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitize)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, child]) => {
    if (/token|secret|password|credential|authorization|api.?key/i.test(key)) return [key, '[REDACTED]']
    return [key, sanitize(child)]
  }))
}
