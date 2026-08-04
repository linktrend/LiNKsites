import { appendFile, mkdir, open, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises'
import { randomUUID, createHash } from 'node:crypto'
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
  private readonly claimsPath: string

  constructor(
    inputPath: string,
    statePath = `${inputPath}.state.json`,
  ) {
    this.inputPath = inputPath
    this.statePath = statePath
    this.claimsPath = `${statePath}.claims`
  }

  async pullReady(limit: number): Promise<readonly PulledWorkItem[]> {
    const state = await this.readState()
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
      if (await this.claimExists(itemId)) continue
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
    const state = await this.readState()
    if (state[itemId]) return null
    const claimId = `claim:${leadId}:${idempotencyKey}`
    const claimPath = this.claimPath(itemId)
    await mkdir(dirname(claimPath), { recursive: true })
    let marker: Awaited<ReturnType<typeof open>> | undefined
    try {
      marker = await open(claimPath, 'wx')
    } catch (error: unknown) {
      const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined
      if (code === 'EEXIST') return null
      throw error
    }
    if (!marker) return null
    try {
      await marker.writeFile(JSON.stringify({ itemId, claimId }) + '\n', 'utf8')
    } finally {
      await marker.close()
    }
    await this.updateState(itemId, { state: 'claimed', claimId })
    return { itemId, claimId }
  }

  async acknowledge(itemId: string, acknowledgement: IntakeAcknowledgement): Promise<void> {
    const marker = await this.readClaimMarker(itemId)
    await this.updateState(itemId, {
      state: acknowledgement.state,
      claimId: marker?.claimId,
      reasonCode: acknowledgement.reasonCode,
    })
  }

  private async readState(): Promise<IntakeState> {
    const contents = await readFile(this.statePath, 'utf8').catch((error: unknown) => {
      const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined
      if (code === 'ENOENT') return JSON.stringify(EMPTY_STATE)
      throw error
    })
    const parsed: unknown = JSON.parse(contents)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed as IntakeState
      : { ...EMPTY_STATE }
  }

  private claimPath(itemId: string): string {
    const digest = createHash('sha256').update(itemId).digest('hex')
    return `${this.claimsPath}/${digest}.json`
  }

  private async claimExists(itemId: string): Promise<boolean> {
    return stat(this.claimPath(itemId)).then(() => true).catch((error: unknown) => {
      const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined
      if (code === 'ENOENT') return false
      throw error
    })
  }

  private async readClaimMarker(itemId: string): Promise<{ claimId?: string } | null> {
    const contents = await readFile(this.claimPath(itemId), 'utf8').catch((error: unknown) => {
      const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined
      if (code === 'ENOENT') return null
      throw error
    })
    if (!contents) return null
    try {
      const parsed: unknown = JSON.parse(contents)
      return parsed && typeof parsed === 'object' ? parsed as { claimId?: string } : null
    } catch {
      return null
    }
  }

  private async updateState(itemId: string, entry: IntakeState[string]): Promise<void> {
    const lockPath = `${this.statePath}.lock`
    await mkdir(dirname(this.statePath), { recursive: true })
    let lock: Awaited<ReturnType<typeof open>> | undefined
    for (;;) {
      try {
        lock = await open(lockPath, 'wx')
        break
      } catch (error: unknown) {
        const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined
        if (code !== 'EEXIST') throw error
        const ageMs = Date.now() - (await stat(lockPath)).mtimeMs
        if (ageMs > 30_000) await unlink(lockPath).catch(() => undefined)
        else await new Promise((resolve) => setTimeout(resolve, 1))
      }
    }
    if (!lock) throw new Error('intake state lock was not acquired')
    try {
      const state = await this.readState()
      state[itemId] = entry
      const temporaryPath = `${this.statePath}.${process.pid}.${randomUUID()}.tmp`
      await writeFile(temporaryPath, `${JSON.stringify(state, null, 2)}\n`, 'utf8')
      await rename(temporaryPath, this.statePath)
    } finally {
      await lock.close()
      await unlink(lockPath).catch(() => undefined)
    }
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
