import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'
import { appendFile, mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import type { LiNKautoworkEventEnvelope, LiNKautoworkEventName } from '../../types/src/runtime-contracts.ts'

export type GatewayEnvironment = 'development' | 'staging' | 'production'
export type GatewayPayload = LiNKautoworkEventEnvelope['payload']
export type GatewayResponse = { status: number; receiptId: string; acknowledgedAt: string }
export type GatewayTransport = (request: GatewayRequest) => Promise<GatewayResponse>
export type GatewayRequest = { envelope: LiNKautoworkEventEnvelope; timestamp: number; nonce: string }

export type GatewayEventPolicy = {
  readonly eventName: LiNKautoworkEventName
  readonly environments: readonly GatewayEnvironment[]
  readonly orgIds: readonly string[]
}

export const PRE_INTEGRATED_EVENTS: readonly GatewayEventPolicy[] = [
  { eventName: 'lead.research.ready', environments: ['development', 'staging', 'production'], orgIds: ['*'] },
  { eventName: 'demo.completed', environments: ['development', 'staging', 'production'], orgIds: ['*'] },
  { eventName: 'commercial.outcome.recorded', environments: ['development', 'staging', 'production'], orgIds: ['*'] },
  { eventName: 'activation.requested', environments: ['development', 'staging', 'production'], orgIds: ['*'] },
  { eventName: 'recycling.requested', environments: ['development', 'staging', 'production'], orgIds: ['*'] },
]

const json = (value: unknown): string => JSON.stringify(value)
const sign = (secret: string, timestamp: number, nonce: string, envelope: Omit<LiNKautoworkEventEnvelope, 'signature'>): string =>
  createHmac('sha256', secret).update(`${timestamp}.${nonce}.${json(envelope)}`).digest('hex')
const validSignature = (provided: string, expected: string): boolean => {
  const a = Buffer.from(provided, 'utf8'); const b = Buffer.from(expected, 'utf8')
  return a.length === b.length && timingSafeEqual(a, b)
}

export type GatewayClock = { nowSeconds(): number; nowIso(): string }
const systemClock: GatewayClock = { nowSeconds: () => Math.floor(Date.now() / 1000), nowIso: () => new Date().toISOString() }

export type GatewayMetrics = {
  backlog: number; failures: number; attempts: number; acknowledged: number; acknowledgementLatencyMs: number; deadLetter: number
}
export class Metrics {
  private readonly values: GatewayMetrics = { backlog: 0, failures: 0, attempts: 0, acknowledged: 0, acknowledgementLatencyMs: 0, deadLetter: 0 }
  increment(key: keyof GatewayMetrics, amount = 1): void { this.values[key] += amount }
  snapshot(): GatewayMetrics { return { ...this.values } }
}

export class ReplayError extends Error { readonly code: 'invalid_signature' | 'stale_timestamp' | 'nonce_replay' | 'unauthorized_event' | 'invalid_envelope'; constructor(code: 'invalid_signature' | 'stale_timestamp' | 'nonce_replay' | 'unauthorized_event' | 'invalid_envelope') { super(code); this.code = code } }

export class ReplayGuard {
  private readonly nonces = new Map<string, number>()
  private readonly windowSeconds: number; private readonly clock: GatewayClock
  constructor(windowSeconds = 300, clock: GatewayClock = systemClock) { this.windowSeconds = windowSeconds; this.clock = clock }
  assertFresh(timestamp: number): void { if (Math.abs(this.clock.nowSeconds() - timestamp) > this.windowSeconds) throw new ReplayError('stale_timestamp') }
  accept(timestamp: number, nonce: string): void {
    this.assertFresh(timestamp)
    for (const [key, expires] of this.nonces) if (expires <= this.clock.nowSeconds()) this.nonces.delete(key)
    if (this.nonces.has(nonce)) throw new ReplayError('nonce_replay')
    this.nonces.set(nonce, this.clock.nowSeconds() + this.windowSeconds)
  }
}

export type GatewayClientOptions = { secret: string; keyId: string; environment: GatewayEnvironment; transport: GatewayTransport; timeoutMs?: number; policies?: readonly GatewayEventPolicy[]; clock?: GatewayClock; replayGuard?: ReplayGuard; metrics?: Metrics }
export class LiNKautoworkGateway {
  private readonly options: GatewayClientOptions
  private readonly clock: GatewayClock; private readonly policies: readonly GatewayEventPolicy[]; private readonly guard: ReplayGuard; readonly metrics: Metrics
  constructor(options: GatewayClientOptions) {
    this.options = options
    if (!options.secret || !options.keyId) throw new Error('gateway signing configuration is required')
    this.clock = options.clock ?? systemClock; this.policies = options.policies ?? PRE_INTEGRATED_EVENTS
    this.guard = options.replayGuard ?? new ReplayGuard(300, this.clock); this.metrics = options.metrics ?? new Metrics()
  }
  private authorized(eventName: LiNKautoworkEventName, orgId: string): boolean {
    const policy = this.policies.find((candidate) => candidate.eventName === eventName)
    return Boolean(policy && policy.environments.includes(this.options.environment) && (policy.orgIds.includes('*') || policy.orgIds.includes(orgId)))
  }
  async send(eventName: LiNKautoworkEventName, orgId: string, correlationId: string, idempotencyKey: string, payload: GatewayPayload): Promise<GatewayResponse> {
    if (!this.authorized(eventName, orgId)) throw new ReplayError('unauthorized_event')
    const timestamp = this.clock.nowSeconds(); const nonce = randomUUID()
    const unsigned = { schema_version: { major: 1, minor: 0 } as const, org_id: orgId, correlation_id: correlationId, idempotency_key: idempotencyKey, event_id: `event:${idempotencyKey}`, event_name: eventName, payload, delivery_attempt: 1, acknowledgement: { status: 'pending' as const } } satisfies Omit<LiNKautoworkEventEnvelope, 'signature'>
    const envelope: LiNKautoworkEventEnvelope = { ...unsigned, signature: { algorithm: 'hmac-sha256', key_id: this.options.keyId, signature: sign(this.options.secret, timestamp, nonce, unsigned) } }
    this.metrics.increment('attempts')
    const started = Date.now(); const response = await Promise.race([
      this.options.transport({ envelope, timestamp, nonce }),
      new Promise<GatewayResponse>((_, reject) => setTimeout(() => reject(new Error('gateway_timeout')), this.options.timeoutMs ?? 3_000)),
    ])
    if (response.status >= 200 && response.status < 300) { this.metrics.increment('acknowledged'); this.metrics.increment('acknowledgementLatencyMs', Date.now() - started) } else this.metrics.increment('failures')
    return response
  }
  verify(request: GatewayRequest): LiNKautoworkEventEnvelope {
    const { envelope, timestamp, nonce } = request
    this.guard.assertFresh(timestamp)
    if (!this.authorized(envelope.event_name, envelope.org_id)) throw new ReplayError('unauthorized_event')
    const { signature, ...unsigned } = envelope
    if (signature.key_id !== this.options.keyId || !validSignature(signature.signature, sign(this.options.secret, timestamp, nonce, unsigned))) throw new ReplayError('invalid_signature')
    this.guard.accept(timestamp, nonce)
    return envelope
  }
}

export type OutboxItem = { id: string; request: GatewayRequest; attempts: number; nextAttemptAt: number; state: 'pending' | 'sent' | 'dead_letter'; receiptId?: string }
export class FileOutbox {
  private readonly path: string; private readonly maxAttempts: number; private readonly metrics: Metrics
  constructor(path: string, maxAttempts = 4, metrics = new Metrics()) { this.path = path; this.maxAttempts = maxAttempts; this.metrics = metrics }
  private async read(): Promise<OutboxItem[]> { try { return JSON.parse(await readFile(this.path, 'utf8')) as OutboxItem[] } catch { return [] } }
  private async write(items: OutboxItem[]): Promise<void> { await mkdir(dirname(this.path), { recursive: true }); const temp = `${this.path}.tmp`; await writeFile(temp, json(items), 'utf8'); await rename(temp, this.path) }
  async enqueue(request: GatewayRequest): Promise<string> { const items = await this.read(); const existing = items.find((item) => item.request.envelope.idempotency_key === request.envelope.idempotency_key); if (existing) return existing.id; const id = randomUUID(); items.push({ id, request, attempts: 0, nextAttemptAt: 0, state: 'pending' }); await this.write(items); this.metrics.increment('backlog'); return id }
  async drain(transport: GatewayTransport, now = Date.now()): Promise<readonly OutboxItem[]> {
    const items = await this.read()
    for (const item of items.filter((candidate) => candidate.state === 'pending' && candidate.nextAttemptAt <= now)) {
      item.attempts += 1; this.metrics.increment('attempts')
      try { const receipt = await transport(item.request); if (receipt.status >= 200 && receipt.status < 300) { item.state = 'sent'; item.receiptId = receipt.receiptId; this.metrics.increment('acknowledged'); this.metrics.increment('backlog', -1) } else if (receipt.status >= 400 && receipt.status < 500) { item.state = 'dead_letter'; this.metrics.increment('deadLetter'); this.metrics.increment('backlog', -1) } else throw new Error('retryable_gateway_failure') } catch { this.metrics.increment('failures'); if (item.attempts >= this.maxAttempts) { item.state = 'dead_letter'; this.metrics.increment('deadLetter'); this.metrics.increment('backlog', -1) } else item.nextAttemptAt = now + 100 * 2 ** (item.attempts - 1) }
    }
    await this.write(items); return items
  }
  async items(): Promise<readonly OutboxItem[]> { return this.read() }
}

export const redactForLog = (request: GatewayRequest): Record<string, unknown> => ({ event_id: request.envelope.event_id, event_name: request.envelope.event_name, org_id: request.envelope.org_id, correlation_id: request.envelope.correlation_id, idempotency_key: request.envelope.idempotency_key, timestamp: request.timestamp, nonce: '[redacted]', signature: '[redacted]' })

export type CrmReadyItem<T> = { itemId: string; envelope: T }
export interface CrmPullPort<T> { pullReady(limit: number, nowIso: string): Promise<readonly CrmReadyItem<T>[]> }
export interface CrmClaimPort { claim(itemId: string, idempotencyKey: string, nowIso: string): Promise<{ claimId: string } | null> }
export interface CrmCompletionPort<T> { writeCompletion(envelope: T): Promise<void> }
