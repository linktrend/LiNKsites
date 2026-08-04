import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import type { DemoCompletionEnvelope } from '@linksites/types'
import type {
  CompletionSink,
  IntakeAcknowledgement,
  IntakeClaim,
  PulledWorkItem,
  WorkIntakePort,
} from './contracts.ts'
import type { LeadResearchPackage } from '@linksites/types'

type IntakeState = Record<string, { state: 'claimed' | 'rejected' | 'program_started' | 'program_failed'; claimId?: string; reasonCode?: string }>

const EMPTY_STATE: IntakeState = {}

/**
 * A small local adapter for the manual-first test. Each non-empty input line
 * is one JSON envelope; the sidecar stores only safe claim state, never the
 * original payload. It is intentionally an adapter, not a second workflow.
 */
export class FileWorkIntakePort implements WorkIntakePort {
  private readonly inputPath: string
  private readonly statePath: string
  private state: IntakeState | null = null
  private writeChain: Promise<void> = Promise.resolve()

  constructor(
    inputPath: string,
    statePath = `${inputPath}.state.json`,
  ) {
    this.inputPath = inputPath
    this.statePath = statePath
  }

  async pullReady(limit: number): Promise<readonly PulledWorkItem[]> {
    const state = await this.loadState()
    const contents = await readFile(this.inputPath, 'utf8').catch((error: unknown) => {
      const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined
      if (code === 'ENOENT') return ''
      throw error
    })
    const items: PulledWorkItem[] = []
    for (const [index, line] of contents.split(/\r?\n/).entries()) {
      if (items.length >= limit) break
      const trimmed = line.trim()
      if (!trimmed) continue
      const itemId = `line:${index + 1}`
      if (state[itemId]) continue
      let envelope: unknown
      try {
        envelope = JSON.parse(trimmed) as unknown
      } catch {
        envelope = null
      }
      items.push({ itemId, envelope })
    }
    return items
  }

  async claim(itemId: string, leadId: LeadResearchPackage['lead_id'], idempotencyKey: LeadResearchPackage['idempotency_key']): Promise<IntakeClaim | null> {
    const state = await this.loadState()
    if (state[itemId]) return null
    const claimId = `claim:${leadId}:${idempotencyKey}`
    state[itemId] = { state: 'claimed', claimId }
    await this.persistState()
    return { itemId, claimId }
  }

  async acknowledge(itemId: string, acknowledgement: IntakeAcknowledgement): Promise<void> {
    const state = await this.loadState()
    const current = state[itemId]
    state[itemId] = {
      state: acknowledgement.state,
      claimId: current?.claimId,
      reasonCode: acknowledgement.reasonCode,
    }
    await this.persistState()
  }

  private async loadState(): Promise<IntakeState> {
    if (this.state) return this.state
    const contents = await readFile(this.statePath, 'utf8').catch((error: unknown) => {
      const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined
      if (code === 'ENOENT') return JSON.stringify(EMPTY_STATE)
      throw error
    })
    const parsed: unknown = JSON.parse(contents)
    this.state = parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed as IntakeState
      : { ...EMPTY_STATE }
    return this.state
  }

  private async persistState(): Promise<void> {
    this.writeChain = this.writeChain.then(async () => {
      await mkdir(dirname(this.statePath), { recursive: true })
      await writeFile(this.statePath, `${JSON.stringify(this.state ?? EMPTY_STATE, null, 2)}\n`, 'utf8')
    })
    await this.writeChain
  }
}

/** Appends canonical completion envelopes and rejects duplicate idempotency keys. */
export class FileCompletionSink implements CompletionSink {
  private readonly outputPath: string
  private writeChain: Promise<void> = Promise.resolve()

  constructor(outputPath: string) {
    this.outputPath = outputPath
  }

  async write(envelope: DemoCompletionEnvelope): Promise<void> {
    this.writeChain = this.writeChain.then(async () => {
      await mkdir(dirname(this.outputPath), { recursive: true })
      const existing = await readFile(this.outputPath, 'utf8').catch((error: unknown) => {
        const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined
        if (code === 'ENOENT') return ''
        throw error
      })
      const duplicate = existing.split(/\r?\n/).some((line: string) => {
        if (!line.trim()) return false
        try {
          const parsed = JSON.parse(line) as { idempotency_key?: unknown }
          return parsed.idempotency_key === envelope.idempotency_key
        } catch {
          return false
        }
      })
      if (!duplicate) await appendFile(this.outputPath, `${JSON.stringify(envelope)}\n`, 'utf8')
    })
    await this.writeChain
  }
}
