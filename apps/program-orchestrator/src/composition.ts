import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { RuntimeConfig } from './contracts.ts'
import { W2_02_GRAPH } from './graph.ts'
import { createLocalDependencyPorts, LocalBoundaryAdaptersImpl, type LocalDependencyPorts } from './adapters.ts'
import { DurableLedger } from './durable-store.ts'
import { ProgramRuntime } from './runtime.ts'
import { ExecutorRegistry } from './executors.ts'
import { FileLeadIntakeAdapter } from './intake.ts'

export type Composition = { config: RuntimeConfig; ledger: DurableLedger; adapters: LocalBoundaryAdaptersImpl; dependencies: LocalDependencyPorts; executors: ExecutorRegistry; intake: FileLeadIntakeAdapter; runtime: ProgramRuntime }

export function validateRuntimeConfig(config: RuntimeConfig): RuntimeConfig {
  if (config.mode !== 'local') throw new Error('W2-02 refuses non-local mode until live environment approval exists')
  if (!/^[-_a-zA-Z0-9]{3,64}$/.test(config.orgId)) throw new Error('W2-02 orgId is invalid')
  for (const path of [config.statePath, config.intakePath, config.completionPath]) if (!path || path.includes('\0')) throw new Error('W2-02 path configuration is invalid')
  if (!Number.isInteger(config.maxAttempts) || config.maxAttempts < 1 || !Number.isInteger(config.concurrency) || config.concurrency < 1) throw new Error('W2-02 retry and concurrency configuration must be positive integers')
  for (const issue of W2_02_GRAPH) if (config.approvedExecutors[issue.executorKind] !== issue.executorVersion) throw new Error(`W2-02 executor ${issue.executorKind}@${issue.executorVersion} is not approved`)
  const knownKinds = new Set(W2_02_GRAPH.map((issue) => issue.executorKind))
  if (Object.keys(config.approvedExecutors).some((kind) => !knownKinds.has(kind))) throw new Error('W2-02 executor registry contains an unknown executor kind')
  return config
}

export function createLocalConfig(baseDir: string, orgId = 'local-org'): RuntimeConfig {
  const statePath = resolve(baseDir, 'program-ledger.json')
  return { mode: 'local', orgId, statePath, intakePath: resolve(baseDir, 'leads.ndjson'), completionPath: resolve(baseDir, 'completions.ndjson'), maxAttempts: 3, concurrency: 2, approvedExecutors: Object.fromEntries(W2_02_GRAPH.map((issue) => [issue.executorKind, issue.executorVersion])) }
}

export function configFromEnvironment(env: NodeJS.ProcessEnv, baseDir: string): RuntimeConfig {
  if (env.W2_02_MODE !== 'local' || !env.W2_02_ORG_ID) throw new Error('W2-02 configuration is incomplete; set W2_02_MODE=local and W2_02_ORG_ID explicitly')
  const config = createLocalConfig(env.W2_02_STATE_DIR ? resolve(baseDir, env.W2_02_STATE_DIR) : baseDir, env.W2_02_ORG_ID)
  return validateRuntimeConfig({ ...config, maxAttempts: env.W2_02_MAX_ATTEMPTS ? Number(env.W2_02_MAX_ATTEMPTS) : config.maxAttempts, concurrency: env.W2_02_CONCURRENCY ? Number(env.W2_02_CONCURRENCY) : config.concurrency })
}

export async function createProductionComposition(config: RuntimeConfig): Promise<Composition> {
  const validated = validateRuntimeConfig(config)
  await mkdir(resolve(validated.statePath, '..'), { recursive: true })
  const ledger = new DurableLedger(validated)
  const adapters = new LocalBoundaryAdaptersImpl(validated)
  const executors = new ExecutorRegistry(validated)
  const intake = new FileLeadIntakeAdapter(validated.intakePath, validated.statePath)
  if (!(await ledger.isAvailable())) throw new Error('W2-02 durable ledger is unavailable')
  return { config: validated, ledger, adapters, dependencies: createLocalDependencyPorts(adapters), executors, intake, runtime: new ProgramRuntime(validated, ledger, adapters, executors) }
}
