import { mkdir } from 'node:fs/promises'
import { createHash, randomUUID } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { OutcomeIngressDependencies, RuntimeConfig } from './contracts.ts'
import { EXECUTOR_BINDINGS, W2_02_GRAPH } from './graph.ts'
import { createLocalDependencyPorts, DurableCompletionSink, LocalBoundaryAdaptersImpl, type LocalDependencyPorts } from './adapters.ts'
import { DurableLedger } from './durable-store.ts'
import { ProgramRuntime } from './runtime.ts'
import { ExecutorRegistry } from './executors.ts'
import { FileWorkIntakePort, type CompletionSink, type WorkIntakePort } from '@linksites/intake-orchestrator'
import { closeLocalDatabase, openLocalDatabase } from './local-database.ts'
import { LiNKautoworkGateway, type GatewayTransport } from '@linksites/autowork-boundary'
import { createFileLifecycleStore, createPostgresLifecycleStore, SiteLifecycleService, type LifecycleEvidenceVerifier, type VerifiedRecycleEvidence } from '@linksites/factory-catalog'
import { CommercialOutcomeIngress } from './commercial-outcome-ingress.ts'
import { PostgresCompletionSink, PostgresRuntimeStateStore, PostgresWorkIntakePort, type PostgresRuntimeDependencies, type PostgresExecutor } from './postgres-runtime.ts'

export type Composition = { config: RuntimeConfig; ledger: DurableLedger; adapters: LocalBoundaryAdaptersImpl; dependencies: LocalDependencyPorts; executors: ExecutorRegistry; intake: WorkIntakePort; completionSink: CompletionSink; runtime: ProgramRuntime; commercialOutcomeIngress: CommercialOutcomeIngress; close: () => Promise<void> }

function repositoryRoot(): string { return process.env.LINKSITES_REPOSITORY_ROOT ?? execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim() }
function actualRevision(): string {
  const declared = process.env.W2_02_EXECUTION_REVISION
  if (declared && /^[a-f0-9]{40}$/i.test(declared)) return declared
  return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
}
function executableCheckpoint(): string {
  const declared = process.env.W2_02_EXECUTABLE_CHECKPOINT
  if (declared && /^[a-f0-9]{64}$/i.test(declared)) return declared
  const root = repositoryRoot()
  const files = execFileSync('git', ['ls-files', 'apps/program-orchestrator/src', 'apps/program-orchestrator/package.json', 'packages/factory-catalog/src', 'packages/factory-catalog/package.json', 'packages/program-ledger/src', 'packages/program-ledger/package.json'], { cwd: root, encoding: 'utf8' }).split(/\r?\n/).filter(Boolean).sort()
  const hash = createHash('sha256')
  for (const file of files) hash.update(file).update('\0').update(readFileSync(resolve(root, file))).update('\0')
  return hash.digest('hex')
}

export function validateRuntimeConfig(config: RuntimeConfig): RuntimeConfig {
  if (!/^[-_a-zA-Z0-9]{3,64}$/.test(config.orgId)) throw new Error('W2-02 orgId is invalid')
  if (config.mode === 'production' && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(config.orgId)) throw new Error('W2-02 production orgId must be a UUID tenant key')
  if (config.mode === 'production' && (!config.siteId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(config.siteId))) throw new Error('W2-02 production requires W2_02_SITE_ID as a UUID site key')
  if (config.mode === 'local' && [config.statePath, config.intakePath, config.completionPath, config.approvedFactsPath].some((path) => !path || path.includes('\0'))) throw new Error('W2-02 local path configuration is invalid')
  if (config.mode === 'production' && !config.postgresAdapterModule) throw new Error('W2-02 production requires an explicit Postgres adapter module; local adapters are not permitted')
  if (!Number.isInteger(config.maxAttempts) || config.maxAttempts < 1 || !Number.isInteger(config.concurrency) || config.concurrency < 1) throw new Error('W2-02 retry and concurrency configuration must be positive integers')
  if (!Number.isInteger(config.leaseDurationMs) || config.leaseDurationMs < 1) throw new Error('W2-02 lease duration must be a positive integer')
  if (!config.commercialOutcomeGatewaySecret.trim() || !config.commercialOutcomeGatewayKeyId.trim()) throw new Error('W2-06 requires explicit W2-05 gateway verification configuration')
  if (!/^[a-f0-9]{40}$/.test(config.executingRevision)) throw new Error('W2-02 executingRevision must be a full Git SHA')
  if (config.executingRevision !== actualRevision()) throw new Error('W2-02 executingRevision is not the checked-out executable commit')
  if (!/^[a-f0-9]{64}$/.test(config.executableCheckpoint) || config.executableCheckpoint !== executableCheckpoint()) throw new Error('W2-02 executable checkpoint does not match the checked-out source/build inputs')
  for (const issue of W2_02_GRAPH) if (config.approvedExecutors[issue.executorKind] !== issue.executorVersion) throw new Error(`W2-02 executor ${issue.executorKind}@${issue.executorVersion} is not approved`)
  const knownKinds = new Set(W2_02_GRAPH.map((issue) => issue.executorKind))
  if (Object.keys(config.approvedExecutors).length !== knownKinds.size || Object.keys(config.approvedExecutors).some((kind) => !knownKinds.has(kind))) throw new Error('W2-02 executor registry contains an unknown or missing executor kind')
  for (const [kind, binding] of Object.entries(EXECUTOR_BINDINGS)) {
    const approved = config.approvedCapabilities[kind]
    if (!approved || approved.length !== binding.capabilities.length || approved.some((capability, index) => capability !== binding.capabilities[index])) throw new Error(`W2-02 executor capabilities are not approved for ${kind}`)
  }
  return config
}

export function createLocalConfig(baseDir: string, orgId = 'local-org'): RuntimeConfig {
  const statePath = resolve(baseDir, 'program-ledger.json')
  // No signing material or key identifier may be embedded as a runtime
  // fallback. Test callers must inject their own non-secret fixture values;
  // a real composition fails closed until configuration is supplied.
  return { mode: 'local', orgId, statePath, intakePath: resolve(baseDir, 'leads.ndjson'), completionPath: resolve(baseDir, 'completions.ndjson'), approvedFactsPath: resolve(baseDir, 'approved-facts.json'), maxAttempts: 3, concurrency: 2, leaseDurationMs: 30_000, executingRevision: actualRevision(), executableCheckpoint: executableCheckpoint(), workerId: `w2-02:${process.pid}:${randomUUID()}`, payloadBaseUrl: '', payloadApiKey: '', payloadSiteId: '', webMasterBaseUrl: '', previewAccessToken: '', commercialOutcomeGatewaySecret: '', commercialOutcomeGatewayKeyId: '', libraryRepositoryPath: process.env.W2_02_LIBRARY_REPOSITORY_PATH ?? '/Users/linktrend/Projects/LiNKlibraries', approvedExecutors: Object.fromEntries(W2_02_GRAPH.map((issue) => [issue.executorKind, issue.executorVersion])), approvedCapabilities: Object.fromEntries(Object.entries(EXECUTOR_BINDINGS).map(([kind, binding]) => [kind, [...binding.capabilities]])) }
}

export function configFromEnvironment(env: NodeJS.ProcessEnv, baseDir: string): RuntimeConfig {
  if (!env.W2_02_MODE || !['local', 'production'].includes(env.W2_02_MODE) || !env.W2_02_ORG_ID) throw new Error('W2-02 configuration is incomplete; set W2_02_MODE and W2_02_ORG_ID explicitly')
  const config = { ...createLocalConfig(env.W2_02_STATE_DIR ? resolve(baseDir, env.W2_02_STATE_DIR) : baseDir, env.W2_02_ORG_ID), mode: env.W2_02_MODE as RuntimeConfig['mode'], siteId: env.W2_02_SITE_ID, postgresAdapterModule: env.W2_02_POSTGRES_ADAPTER_MODULE }
  if (env.W2_02_EXECUTION_REVISION && env.W2_02_EXECUTION_REVISION !== config.executingRevision) throw new Error('W2-02 refuses an execution revision that is not the checked-out commit')
  if (env.LINKSITES_DEPLOYMENT_ENV === 'production' && env.LINKSITES_RELEASE_SHA !== config.executingRevision) throw new Error('W2-02 production execution identity must equal the release SHA')
  return validateRuntimeConfig({ ...config, approvedFactsPath: env.W2_02_APPROVED_FACTS_PATH ? resolve(baseDir, env.W2_02_APPROVED_FACTS_PATH) : config.approvedFactsPath, maxAttempts: env.W2_02_MAX_ATTEMPTS ? Number(env.W2_02_MAX_ATTEMPTS) : config.maxAttempts, concurrency: env.W2_02_CONCURRENCY ? Number(env.W2_02_CONCURRENCY) : config.concurrency, leaseDurationMs: env.W2_02_LEASE_MS ? Number(env.W2_02_LEASE_MS) : config.leaseDurationMs, payloadBaseUrl: env.W2_02_PAYLOAD_BASE_URL ?? config.payloadBaseUrl, payloadApiKey: env.W2_02_PAYLOAD_API_KEY ?? config.payloadApiKey, payloadSiteId: env.W2_02_PAYLOAD_SITE_ID ?? config.payloadSiteId, webMasterBaseUrl: env.W2_02_WEB_MASTER_BASE_URL ?? config.webMasterBaseUrl, previewAccessToken: env.W2_02_PREVIEW_ACCESS_TOKEN ?? config.previewAccessToken, commercialOutcomeGatewaySecret: env.W2_05_OUTCOME_GATEWAY_SECRET ?? config.commercialOutcomeGatewaySecret, commercialOutcomeGatewayKeyId: env.W2_05_OUTCOME_GATEWAY_KEY_ID ?? config.commercialOutcomeGatewayKeyId, libraryRepositoryPath: env.W2_02_LIBRARY_REPOSITORY_PATH ?? config.libraryRepositoryPath })
}

export async function createProductionComposition(config: RuntimeConfig, outcomeDependencies?: OutcomeIngressDependencies, productionDependencies?: PostgresRuntimeDependencies): Promise<Composition> {
  const validated = validateRuntimeConfig(config)
  if (validated.mode === 'local') await mkdir(resolve(validated.statePath, '..'), { recursive: true })
  const production = validated.mode === 'production'
  const postgres = production ? productionDependencies ?? await loadPostgresDependencies(validated.postgresAdapterModule as string) : null
  const orgUuid = production ? validated.orgId : '00000000-0000-4000-8000-000000000001'
  const siteUuid = production ? validated.siteId! : '00000000-0000-4000-8000-000000000002'
  const db = production ? postgres!.db : await openLocalDatabase(`${validated.statePath}.db`, orgUuid, siteUuid)
  // W2-02 is a composition root, not an HTTP emulator.  The caller must bind
  // it to the separately started local Payload schema and real web-master
  // process (the W2-04 proof harness supplies these URLs).
  if (!validated.payloadBaseUrl || !validated.payloadApiKey || !validated.payloadSiteId || !validated.webMasterBaseUrl || !validated.previewAccessToken) throw new Error('W2-02 requires explicit authenticated local Payload, scoped site, and protected web-master service configuration')
  if (!validated.commercialOutcomeGatewaySecret || !validated.commercialOutcomeGatewayKeyId) throw new Error('W2-06 requires explicit W2-05 gateway verification configuration')
  if (production) await assertProvisionedTenant(postgres!.db, validated.orgId, validated.siteId!)
  const runtimeConfig = validated
  const ledger = new DurableLedger(validated, production ? new PostgresRuntimeStateStore(postgres!.db) : undefined)
  const adapters = new LocalBoundaryAdaptersImpl(runtimeConfig, db)
  adapters.bindLeaseVerifier(({ runId, fencingToken }) => ledger.assertLeaseActive(runId, fencingToken))
  const executors = new ExecutorRegistry(runtimeConfig)
  const completionSink = production ? new PostgresCompletionSink(postgres!.db, runtimeConfig.orgId) : new DurableCompletionSink(runtimeConfig, adapters)
  const intake = production ? new PostgresWorkIntakePort(postgres!.db, runtimeConfig.orgId, runtimeConfig.leaseDurationMs) : new FileWorkIntakePort(runtimeConfig.intakePath, `${runtimeConfig.statePath}.intake.json`, { claimLeaseMs: runtimeConfig.leaseDurationMs })
  const dependencies = createLocalDependencyPorts(adapters, completionSink)
  const noOutboundTransport: GatewayTransport = async () => { throw new Error('W2-06 inbound verifier does not send gateway events') }
  const environment = validated.mode === 'production' ? 'production' : 'development' as const
  const gateway = new LiNKautoworkGateway({ secret: validated.commercialOutcomeGatewaySecret, keyId: validated.commercialOutcomeGatewayKeyId, environment, transport: noOutboundTransport, policies: [{ eventName: 'commercial.outcome.recorded', orgIds: [validated.orgId], environments: [environment] }] })
  // A composition without a real LiNKreach authorization port is safely
  // runnable for the W2-02 preview graph, but can never persist an outcome.
  const lifecycleEvidence: LifecycleEvidenceVerifier = {
    async resolveCompletedRecycleEvidence(input): Promise<VerifiedRecycleEvidence | null> {
      const state = await ledger.snapshot()
      // W2-02 uses a deterministic preview-site identity. Do not allow an
      // outcome for another site to borrow evidence from this completed run.
      if (state.program.orgId !== input.orgId || state.program.state !== 'completed' || input.siteId !== `site:${state.program.leadId}`) return null
      const source = state.runs.find((run) => run.runId === input.sourceRunId && run.state === 'succeeded')
      const quality = state.runs.find((run) => run.issueId === 'content-gates' && run.state === 'succeeded' && run.evidence.some((evidence) => evidence.storage_location === input.qualityEvidenceReference && evidence.subject.type === 'issue' && evidence.subject.id === 'content-gates' && evidence.gate_association === 'content-gates'))
      const test = state.runs.find((run) => run.issueId === 'site-render-validation' && run.state === 'succeeded' && run.evidence.some((evidence) => evidence.storage_location === input.passingTestEvidenceReference && evidence.subject.type === 'issue' && evidence.subject.id === 'site-render-validation' && evidence.gate_association === 'site-render-validation'))
      const sourceEvidenceReference = source?.evidence.find((evidence) => evidence.subject.type === 'issue' && evidence.subject.id === source.issueId)?.storage_location
      if (!source || !quality || !test || !sourceEvidenceReference) return null
      // These values come from the completed, durable program state and its
      // approved-facts input, never from the Architect proposal request.
      const facts = JSON.parse(await import('node:fs/promises').then(({ readFile }) => readFile(validated.approvedFactsPath, 'utf8'))) as Record<string, unknown>
      const privacyScanValues = collectStrings({ leadId: state.program.leadId, siteId: input.siteId, facts })
      if (privacyScanValues.length === 0) return null
      return { sourceRunId: source.runId, sourceEvidenceReference, qualityEvidenceReference: input.qualityEvidenceReference, passingTestEvidenceReference: input.passingTestEvidenceReference, privacyScanValues }
    },
  }
  const lifecycleStore = production ? createPostgresLifecycleStore(postgres!.db) : createFileLifecycleStore(`${validated.statePath}.lifecycle`)
  const lifecycle = new SiteLifecycleService(lifecycleStore, outcomeDependencies?.outcomeAuthorization ?? { verify: async () => false }, undefined, lifecycleEvidence)
  const commercialOutcomeIngress = new CommercialOutcomeIngress(lifecycle, gateway)
  const runtime = new ProgramRuntime(runtimeConfig, ledger, adapters, executors, dependencies)
  runtime.bindCommercialOutcomeIngress(commercialOutcomeIngress)
  if (!(await ledger.isAvailable())) throw new Error('W2-02 durable ledger is unavailable')
  let closed = false
  return { config: runtimeConfig, ledger, adapters, dependencies, executors, intake, completionSink, runtime, commercialOutcomeIngress, close: async () => {
    if (closed) return
    closed = true
    if (production) await postgres?.close?.()
    else await closeLocalDatabase(`${validated.statePath}.db`, db)
  } }
}

async function assertProvisionedTenant(db: PostgresExecutor, orgId: string, siteId: string): Promise<void> {
  const result = await db.query(
    `select s.id from lsites_sites.sites s where s.id = $1 and s.org_id = $2`,
    [siteId, orgId],
  )
  if (result.rows.length !== 1) throw new Error('W2-02 production tenant/site is absent or unauthorized')
}

async function loadPostgresDependencies(modulePath: string): Promise<PostgresRuntimeDependencies> {
  const loaded = await import(modulePath) as { createPostgresRuntimeDependencies?: () => Promise<PostgresRuntimeDependencies> }
  if (typeof loaded.createPostgresRuntimeDependencies !== 'function') throw new Error('W2-02 Postgres adapter module must export createPostgresRuntimeDependencies')
  return loaded.createPostgresRuntimeDependencies()
}

function collectStrings(value: unknown): string[] {
  if (typeof value === 'string') return value.trim() ? [value.trim()] : []
  if (Array.isArray(value)) return value.flatMap(collectStrings)
  if (!value || typeof value !== 'object') return []
  return Object.values(value as Record<string, unknown>).flatMap(collectStrings)
}
