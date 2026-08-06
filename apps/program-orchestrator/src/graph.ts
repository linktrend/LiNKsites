import { LINKSITES_PROGRAM, type IssueDefinition as CanonicalIssue, type ModuleDefinition } from '@linksites/program-ledger'
import type { IssueDefinition } from './contracts.ts'

export { LINKSITES_PROGRAM }

export const PROGRAM_ID = LINKSITES_PROGRAM.programId
export const PROGRAM_MODULE_IDS = ['M06', 'M07', 'M08', 'M09', 'M10', 'M11', 'M12'] as const

type ExecutorBinding = {
  version: string
  capabilities: string[]
  externalBoundary?: string
  irreversible?: boolean
}

export const EXECUTOR_BINDINGS: Readonly<Record<string, ExecutorBinding>> = {
  'lead.research.validate': { version: 'w1-01-contract.v1', capabilities: ['deterministic', 'evidence-producing'] },
  'program.claim': { version: 'w1-02-ledger.v1', capabilities: ['durable-ledger', 'idempotent', 'evidence-producing'] },
  'lead.vertical.qualify': { version: 'w1-02-ledger.v1', capabilities: ['deterministic', 'evidence-producing'] },
  'foundation.reserve': { version: 'w1-04-factory-catalog.v1', capabilities: ['factory-catalog', 'idempotent', 'receipt-producing'], externalBoundary: 'factory-catalog' },
  'library.verify': { version: 'w1-05-library-consumer.v1', capabilities: ['library-consumer', 'sha-bound', 'receipt-producing'], externalBoundary: 'library-consumer' },
  'site.plan': { version: 'w1-04-factory-catalog.v1', capabilities: ['factory-catalog', 'deterministic', 'evidence-producing'] },
  'content.information_architecture': { version: 'w2-01-deterministic-adapter.v1', capabilities: ['w2-01-content-production', 'provenance', 'deterministic'], externalBoundary: 'working-content' },
  'content.media.provenance': { version: 'w2-01-deterministic-adapter.v1', capabilities: ['w2-01-content-production', 'media-provenance', 'deterministic'], externalBoundary: 'working-content' },
  'content.working.assemble': { version: 'w2-01-deterministic-adapter.v1', capabilities: ['w2-01-content-production', 'immutable-working-content', 'receipt-producing'], externalBoundary: 'working-content', irreversible: true },
  'content.gates': { version: 'w2-01-deterministic-adapter.v1', capabilities: ['w2-01-content-production', 'evidence-producing', 'fail-closed'] },
  'payload.draft.promote': { version: 'w2-03-promotion-service.v1', capabilities: ['w2-03-payload-promotion', 'readback-parity', 'idempotent', 'receipt-producing'], externalBoundary: 'payload-cms', irreversible: true },
  'payload.readback.gate': { version: 'w2-03-promotion-service.v1', capabilities: ['w2-03-payload-promotion', 'readback-parity', 'evidence-producing'], externalBoundary: 'payload-cms' },
  'preview.private.publish': { version: 'w2-04-private-preview.v1', capabilities: ['private-preview', 'noindex', 'idempotent'], externalBoundary: 'frontend', irreversible: true },
  'preview.render.validate': { version: 'w2-04-private-preview.v1', capabilities: ['frontend-render', 'route-validation', 'fail-closed'], externalBoundary: 'frontend' },
  'preview.evidence.capture': { version: 'w2-04-private-preview.v1', capabilities: ['evidence-producing', 'persisted-artifact', 'tamper-detecting'] },
  'completion.emit': { version: 'w2-05-completion-sink.v1', capabilities: ['shared-completion-sink', 'durable-delivery', 'idempotent'], externalBoundary: 'completion-sink', irreversible: true },
}

const activeModules = (): ModuleDefinition[] => PROGRAM_MODULE_IDS.map((id) => {
  const module = LINKSITES_PROGRAM.modules.find((candidate) => candidate.moduleId === id)
  if (!module) throw new Error(`canonical LiNKsites Program is missing module ${id}`)
  return module
})

const toIssue = (module: ModuleDefinition, phaseId: string, canonical: CanonicalIssue): IssueDefinition => {
  const binding = EXECUTOR_BINDINGS[canonical.issueType]
  if (!binding) throw new Error(`no W2-02 executor binding for canonical issue type ${canonical.issueType}`)
  return {
    issueId: canonical.issueKey,
    moduleId: module.moduleId,
    phaseId,
    title: canonical.title,
    objective: canonical.objective,
    issueType: canonical.issueType,
    executorKind: canonical.issueType,
    executorVersion: binding.version,
    capabilities: [...binding.capabilities],
    dependsOn: [...canonical.dependsOnIssueKeys],
    externalBoundary: binding.externalBoundary,
    irreversible: binding.irreversible,
  }
}

export const W2_02_MODULES = activeModules()
export const W2_02_GRAPH: readonly IssueDefinition[] = W2_02_MODULES.flatMap((module) => module.phases.flatMap((phase) => phase.issues.map((issue) => toIssue(module, phase.phaseId, issue))))

/** The persisted Program identity is the canonical catalog object. W2-02 only
 * schedules the populated private-preview subset of its Issues. */
export const PERSISTED_PROGRAM_GRAPH = LINKSITES_PROGRAM

export const GRAPH_EXPORT = {
  program: PERSISTED_PROGRAM_GRAPH,
  hierarchy: 'Module > Phase > Issue > Run',
  issues: W2_02_GRAPH,
  capabilities: EXECUTOR_BINDINGS,
  scheduledModules: [...PROGRAM_MODULE_IDS],
  excluded: ['M01-M05 canonical modules not scheduled by W2-02 (including M03 Component and Frontend Platform)', 'M13-M20 paid fulfilment and managed-service modules', 'sold-site-public-activation', 'commercial-payment', 'commercial-erp', 'raw-n8n', 'VPS', 'cloud', 'live-credentials'],
}
