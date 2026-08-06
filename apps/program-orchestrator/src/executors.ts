import { EXECUTOR_BINDINGS, W2_02_GRAPH } from './graph.ts'
import type { RuntimeConfig } from './contracts.ts'

export type ExecutorMetadata = { kind: string; version: string; capabilities: string[] }

export class ExecutorRegistry {
  private readonly entries: Map<string, ExecutorMetadata>

  constructor(config: RuntimeConfig) {
    this.entries = new Map(W2_02_GRAPH.map((issue) => {
      const binding = EXECUTOR_BINDINGS[issue.executorKind]
      return [issue.executorKind, { kind: issue.executorKind, version: issue.executorVersion, capabilities: [...(binding?.capabilities ?? [])] }] as const
    }))
    const configuredKinds = Object.keys(config.approvedExecutors).sort()
    const knownKinds = [...this.entries.keys()].sort()
    if (configuredKinds.length !== knownKinds.length || configuredKinds.some((kind, index) => kind !== knownKinds[index])) throw new Error('W2-02 executor registry contains an unknown or missing executor kind')
    for (const entry of this.entries.values()) {
      const approved = config.approvedCapabilities[entry.kind]
      if (!approved || approved.length !== entry.capabilities.length || approved.some((capability, index) => capability !== entry.capabilities[index])) throw new Error(`W2-02 executor capabilities are not approved for ${entry.kind}`)
    }
  }

  resolve(kind: string, version: string): ExecutorMetadata | null {
    const entry = this.entries.get(kind)
    return entry && entry.version === version ? { ...entry, capabilities: [...entry.capabilities] } : null
  }

  list(): ExecutorMetadata[] { return [...this.entries.values()].map((entry) => ({ ...entry, capabilities: [...entry.capabilities] })) }
}
