import { appendFile, mkdir, open, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises'
import { randomUUID, createHash } from 'node:crypto'
import { dirname } from 'node:path'
import type { DemoCompletionEnvelope } from '@linksites/types'
import type {
  Clock,
  CompletionSink,
  IntakeAcknowledgement,
  IntakeClaim,
  PulledWorkItem,
  WorkIntakePort,
} from './contracts.ts'
import type { LeadResearchPackage } from '@linksites/types'
import { isLeadResearchPackage } from '../../../packages/types/src/runtime-contracts.ts'
import { SystemClock } from './orchestrator.ts'

type IntakeState = Record<string, {
  state: 'claimed' | 'rejected' | 'program_started' | 'program_retry_scheduled' | 'program_manual_attention'
  claimId?: string
  claimExpiresAt?: string
  reasonCode?: string
  nextAttemptAt?: string
  attemptNumber?: number
}>

type ClaimMarker = {
  itemId: string
  claimId: string
  claimExpiresAt: string
}

export interface FileWorkIntakeOptions {
  readonly clock?: Clock
  readonly claimLeaseMs?: number
  readonly stateLockStaleMs?: number
  readonly stateLockRetryMs?: number
}

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
  private readonly clock: Clock
  private readonly claimLeaseMs: number
  private readonly stateLockStaleMs: number
  private readonly stateLockRetryMs: number

  constructor(
    inputPath: string,
    statePath = `${inputPath}.state.json`,
    options: FileWorkIntakeOptions = {},
  ) {
    this.inputPath = inputPath
    this.statePath = statePath
    this.claimsPath = `${statePath}.claims`
    this.clock = options.clock ?? new SystemClock()
    this.claimLeaseMs = options.claimLeaseMs ?? 30_000
    this.stateLockStaleMs = options.stateLockStaleMs ?? 30_000
    this.stateLockRetryMs = options.stateLockRetryMs ?? 1
    if (this.claimLeaseMs <= 0 || this.stateLockStaleMs <= 0 || this.stateLockRetryMs <= 0) {
      throw new Error('file intake lease, lock stale, and lock retry durations must be positive')
    }
  }

  async pullReady(limit: number, nowIso: string): Promise<readonly PulledWorkItem[]> {
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
      const itemState = state[itemId]
      const retryDue = itemState?.state === 'program_retry_scheduled' &&
        (!itemState.nextAttemptAt || itemState.nextAttemptAt <= nowIso)
      if (itemState?.state === 'claimed' && this.claimIsActive(itemState.claimExpiresAt, nowIso)) continue
      if (itemState && itemState.state !== 'claimed' && !retryDue) continue
      if (!itemState && await this.claimExists(itemId, nowIso)) continue
      let envelope: unknown
      try {
        envelope = JSON.parse(trimmed) as unknown
      } catch {
        envelope = null
      }
      items.push({ itemId, envelope, attemptNumber: itemState?.attemptNumber })
    }
    return items
  }

  async claim(itemId: string, leadId: LeadResearchPackage['lead_id'], idempotencyKey: LeadResearchPackage['idempotency_key'], nowIso: string): Promise<IntakeClaim | null> {
    return this.withStateLock(async () => {
      const state = await this.readState()
      const existing = state[itemId]
      const marker = await this.readClaimMarker(itemId)
      if (existing?.state === 'program_retry_scheduled') {
        if (existing.nextAttemptAt && existing.nextAttemptAt > nowIso) return null
      } else if (existing?.state === 'claimed') {
        if (this.claimIsActive(existing.claimExpiresAt, nowIso)) return null
      } else if (existing) {
        return null
      } else if (marker && this.claimIsActive(marker.claimExpiresAt, nowIso)) {
        return null
      }

      const claimId = existing?.claimId ?? marker?.claimId ?? `claim:${leadId}:${idempotencyKey}`
      const claimExpiresAt = this.addMilliseconds(nowIso, this.claimLeaseMs)
      const nextState: IntakeState[string] = {
        state: 'claimed',
        claimId,
        claimExpiresAt,
        attemptNumber: existing?.attemptNumber ?? 1,
      }
      await this.writeState(itemId, nextState)
      await this.writeClaimMarker({ itemId, claimId, claimExpiresAt })
      return { itemId, claimId }
    })
  }

  async acknowledge(itemId: string, acknowledgement: IntakeAcknowledgement): Promise<void> {
    await this.withStateLock(async () => {
      const state = await this.readState()
      const marker = await this.readClaimMarker(itemId)
      await this.writeState(itemId, {
        state: acknowledgement.state,
        claimId: state[itemId]?.claimId ?? marker?.claimId,
        reasonCode: acknowledgement.reasonCode,
        nextAttemptAt: acknowledgement.nextAttemptAt,
        attemptNumber: acknowledgement.attemptNumber,
      })
    })
  }

  async reject(itemId: string, reasonCode: string): Promise<void> {
    if (!reasonCode.trim()) throw new Error('intake rejection reason is required')
    await this.withStateLock(async () => {
      const state = await this.readState()
      if (state[itemId]?.state === 'claimed') return
      await this.writeState(itemId, { state: 'rejected', reasonCode })
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

  private async claimExists(itemId: string, nowIso: string): Promise<boolean> {
    const marker = await this.readClaimMarker(itemId)
    return marker !== null && this.claimIsActive(marker.claimExpiresAt, nowIso)
  }

  private async readClaimMarker(itemId: string): Promise<ClaimMarker | null> {
    const contents = await readFile(this.claimPath(itemId), 'utf8').catch((error: unknown) => {
      const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined
      if (code === 'ENOENT') return null
      throw error
    })
    if (!contents) return null
    try {
      const parsed: unknown = JSON.parse(contents)
      if (!parsed || typeof parsed !== 'object') return null
      const candidate = parsed as Partial<ClaimMarker>
      return typeof candidate.claimId === 'string' && typeof candidate.claimExpiresAt === 'string'
        ? candidate as ClaimMarker
        : null
    } catch {
      return null
    }
  }

  private claimIsActive(expiresAt: string | undefined, nowIso: string): boolean {
    if (!expiresAt) return false
    const expiry = Date.parse(expiresAt)
    const now = Date.parse(nowIso)
    return Number.isFinite(expiry) && Number.isFinite(now) && expiry > now
  }

  private addMilliseconds(nowIso: string, milliseconds: number): string {
    const now = Date.parse(nowIso)
    if (!Number.isFinite(now)) throw new Error('intake claim time must be an ISO timestamp')
    return new Date(now + milliseconds).toISOString()
  }

  private async writeClaimMarker(marker: ClaimMarker): Promise<void> {
    const claimPath = this.claimPath(marker.itemId)
    await mkdir(dirname(claimPath), { recursive: true })
    const temporaryPath = `${claimPath}.${process.pid}.${randomUUID()}.tmp`
    await writeFile(temporaryPath, `${JSON.stringify(marker)}\n`, 'utf8')
    await rename(temporaryPath, claimPath)
  }

  private async withStateLock<T>(operation: () => Promise<T>): Promise<T> {
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
        const lockAgeMs = await this.readLockAge(lockPath)
        if (lockAgeMs !== null && lockAgeMs > this.stateLockStaleMs) await unlink(lockPath).catch(() => undefined)
        else await this.clock.sleep(this.stateLockRetryMs)
      }
    }
    if (!lock) throw new Error('intake state lock was not acquired')
    try {
      await lock.writeFile(`${JSON.stringify({ createdAt: this.clock.now() })}\n`, 'utf8')
      return await operation()
    } finally {
      await lock.close()
      await unlink(lockPath).catch(() => undefined)
    }
  }

  private async readLockAge(lockPath: string): Promise<number | null> {
    const contents = await readFile(lockPath, 'utf8').catch(() => '')
    try {
      const parsed: unknown = JSON.parse(contents)
      const createdAt = parsed && typeof parsed === 'object' && 'createdAt' in parsed
        ? parsed.createdAt
        : undefined
      const created = typeof createdAt === 'string' ? Date.parse(createdAt) : Number.NaN
      const now = Date.parse(this.clock.now())
      if (Number.isFinite(created) && Number.isFinite(now)) return now - created
    } catch {
      // Fall through to the filesystem timestamp for legacy empty lock files.
    }
    const lockStat = await stat(lockPath).catch(() => null)
    const now = Date.parse(this.clock.now())
    return lockStat && Number.isFinite(now) ? now - lockStat.mtimeMs : null
  }

  private async writeState(itemId: string, entry: IntakeState[string]): Promise<void> {
    const state = await this.readState()
    state[itemId] = entry
    const temporaryPath = `${this.statePath}.${process.pid}.${randomUUID()}.tmp`
    await writeFile(temporaryPath, `${JSON.stringify(state, null, 2)}\n`, 'utf8')
    await rename(temporaryPath, this.statePath)
  }
}

/** Governed manual writer: only canonical, tenant-scoped lead packages enter NDJSON. */
export class ManualWorkIntakeWriter {
  private readonly inputPath: string
  private readonly orgId: string

  constructor(inputPath: string, orgId: string) {
    this.inputPath = inputPath
    this.orgId = orgId
  }

  async append(envelope: LeadResearchPackage): Promise<void> {
    if (!isLeadResearchPackage(envelope) || envelope.org_id !== this.orgId) throw new Error('manual intake writer rejected a non-canonical or foreign lead package')
    await mkdir(dirname(this.inputPath), { recursive: true })
    await appendFile(this.inputPath, `${JSON.stringify(envelope)}\n`, 'utf8')
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
