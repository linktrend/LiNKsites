import { mkdir } from 'node:fs/promises'
import { createHash, randomUUID } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { RuntimeConfig } from './contracts.ts'
import { EXECUTOR_BINDINGS, W2_02_GRAPH } from './graph.ts'
import { createLocalDependencyPorts, DurableCompletionSink, LocalBoundaryAdaptersImpl, type LocalDependencyPorts } from './adapters.ts'
import { DurableLedger } from './durable-store.ts'
import { ProgramRuntime } from './runtime.ts'
import { ExecutorRegistry } from './executors.ts'
import { FileWorkIntakePort, type CompletionSink, type WorkIntakePort } from '@linksites/intake-orchestrator'
import { closeLocalDatabase, openLocalDatabase } from './local-database.ts'

export type Composition = { config: RuntimeConfig; ledger: DurableLedger; adapters: LocalBoundaryAdaptersImpl; dependencies: LocalDependencyPorts; executors: ExecutorRegistry; intake: WorkIntakePort; completionSink: CompletionSink; runtime: ProgramRuntime; close: () => Promise<void> }

function repositoryRoot(): string { return execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim() }
function actualRevision(): string { return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim() }
function executableCheckpoint(): string {
  const root = repositoryRoot()
  const files = execFileSync('git', ['ls-files', 'apps/program-orchestrator/src', 'apps/program-orchestrator/package.json', 'packages/factory-catalog/src', 'packages/factory-catalog/package.json', 'packages/program-ledger/src', 'packages/program-ledger/package.json'], { cwd: root, encoding: 'utf8' }).split(/\r?\n/).filter(Boolean).sort()
  const hash = createHash('sha256')
  for (const file of files) hash.update(file).update('\0').update(readFileSync(resolve(root, file))).update('\0')
  return hash.digest('hex')
}

export function validateRuntimeConfig(config: RuntimeConfig): RuntimeConfig {
  if (config.mode !== 'local') throw new Error('W2-02 refuses non-local mode until live environment approval exists')
  if (!/^[-_a-zA-Z0-9]{3,64}$/.test(config.orgId)) throw new Error('W2-02 orgId is invalid')
  for (const path of [config.statePath, config.intakePath, config.completionPath, config.approvedFactsPath]) if (!path || path.includes('\0')) throw new Error('W2-02 path configuration is invalid')
  if (!Number.isInteger(config.maxAttempts) || config.maxAttempts < 1 || !Number.isInteger(config.concurrency) || config.concurrency < 1) throw new Error('W2-02 retry and concurrency configuration must be positive integers')
  if (!Number.isInteger(config.leaseDurationMs) || config.leaseDurationMs < 1) throw new Error('W2-02 lease duration must be a positive integer')
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
  return { mode: 'local', orgId, statePath, intakePath: resolve(baseDir, 'leads.ndjson'), completionPath: resolve(baseDir, 'completions.ndjson'), approvedFactsPath: resolve(baseDir, 'approved-facts.json'), maxAttempts: 3, concurrency: 2, leaseDurationMs: 30_000, executingRevision: actualRevision(), executableCheckpoint: executableCheckpoint(), workerId: `w2-02:${process.pid}:${randomUUID()}`, payloadBaseUrl: '', webMasterBaseUrl: '', libraryRepositoryPath: process.env.W2_02_LIBRARY_REPOSITORY_PATH ?? '/Users/linktrend/Projects/LiNKlibraries', approvedExecutors: Object.fromEntries(W2_02_GRAPH.map((issue) => [issue.executorKind, issue.executorVersion])), approvedCapabilities: Object.fromEntries(Object.entries(EXECUTOR_BINDINGS).map(([kind, binding]) => [kind, [...binding.capabilities]])) }
}

export function configFromEnvironment(env: NodeJS.ProcessEnv, baseDir: string): RuntimeConfig {
  if (env.W2_02_MODE !== 'local' || !env.W2_02_ORG_ID) throw new Error('W2-02 configuration is incomplete; set W2_02_MODE=local and W2_02_ORG_ID explicitly')
  const config = createLocalConfig(env.W2_02_STATE_DIR ? resolve(baseDir, env.W2_02_STATE_DIR) : baseDir, env.W2_02_ORG_ID)
  if (env.W2_02_EXECUTION_REVISION && env.W2_02_EXECUTION_REVISION !== config.executingRevision) throw new Error('W2-02 refuses an execution revision that is not the checked-out commit')
  return validateRuntimeConfig({ ...config, approvedFactsPath: env.W2_02_APPROVED_FACTS_PATH ? resolve(baseDir, env.W2_02_APPROVED_FACTS_PATH) : config.approvedFactsPath, maxAttempts: env.W2_02_MAX_ATTEMPTS ? Number(env.W2_02_MAX_ATTEMPTS) : config.maxAttempts, concurrency: env.W2_02_CONCURRENCY ? Number(env.W2_02_CONCURRENCY) : config.concurrency, leaseDurationMs: env.W2_02_LEASE_MS ? Number(env.W2_02_LEASE_MS) : config.leaseDurationMs, payloadBaseUrl: env.W2_02_PAYLOAD_BASE_URL ?? config.payloadBaseUrl, webMasterBaseUrl: env.W2_02_WEB_MASTER_BASE_URL ?? config.webMasterBaseUrl, libraryRepositoryPath: env.W2_02_LIBRARY_REPOSITORY_PATH ?? config.libraryRepositoryPath })
}

export async function createProductionComposition(config: RuntimeConfig): Promise<Composition> {
  const validated = validateRuntimeConfig(config)
  await mkdir(resolve(validated.statePath, '..'), { recursive: true })
  const orgUuid = '00000000-0000-4000-8000-000000000001'
  const siteUuid = '00000000-0000-4000-8000-000000000002'
  const db = await openLocalDatabase(`${validated.statePath}.db`, orgUuid, siteUuid)
  // W2-02 is a composition root, not an HTTP emulator.  The caller must bind
  // it to the separately started local Payload schema and real web-master
  // process (the W2-04 proof harness supplies these URLs).
  if (!validated.payloadBaseUrl || !validated.webMasterBaseUrl) throw new Error('W2-02 requires explicit real local Payload and protected web-master service URLs')
  const runtimeConfig = validated
  const ledger = new DurableLedger(validated)
  const adapters = new LocalBoundaryAdaptersImpl(runtimeConfig, db)
  const executors = new ExecutorRegistry(runtimeConfig)
  const completionSink = new DurableCompletionSink(runtimeConfig, adapters)
  const intake = new FileWorkIntakePort(runtimeConfig.intakePath, `${runtimeConfig.statePath}.intake.json`, { claimLeaseMs: runtimeConfig.leaseDurationMs })
  const dependencies = createLocalDependencyPorts(adapters, completionSink)
  if (!(await ledger.isAvailable())) throw new Error('W2-02 durable ledger is unavailable')
  let closed = false
  return { config: runtimeConfig, ledger, adapters, dependencies, executors, intake, completionSink, runtime: new ProgramRuntime(runtimeConfig, ledger, adapters, executors, dependencies), close: async () => {
    if (closed) return
    closed = true
    await closeLocalDatabase(`${validated.statePath}.db`, db)
  } }
}
