import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'
import { mkdir, open, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { isLiNKautoworkEventEnvelope, type LiNKautoworkEventEnvelope, type LiNKautoworkEventName } from '../../types/src/runtime-contracts.ts'

export type GatewayEnvironment = 'development' | 'staging' | 'production'
export type GatewayPayload = LiNKautoworkEventEnvelope['payload']
export type GatewayResponse = { status: number; receiptId: string; receiptSignature: string; acknowledgedAt: string }
export type GatewayTransport = (request: GatewayRequest) => Promise<GatewayResponse>
export type GatewayRequest = { envelope: LiNKautoworkEventEnvelope; timestamp: number; nonce: string }

export type GatewayEventPolicy = {
  readonly eventName: LiNKautoworkEventName
  readonly environments: readonly GatewayEnvironment[]
  readonly orgIds: readonly string[]
}

export const PRE_INTEGRATED_EVENTS: readonly GatewayEventPolicy[] = [
  { eventName: 'contact.submitted', environments: ['development'], orgIds: ['org_demo'] },
  { eventName: 'lead.research.ready', environments: ['development'], orgIds: ['org_demo'] },
  { eventName: 'demo.completed', environments: ['development'], orgIds: ['org_demo'] },
  { eventName: 'commercial.outcome.recorded', environments: ['development'], orgIds: ['org_demo'] },
  { eventName: 'activation.requested', environments: ['development'], orgIds: ['org_demo'] },
  { eventName: 'recycling.requested', environments: ['development'], orgIds: ['org_demo'] },
]

const json = (value: unknown): string => JSON.stringify(value)
const sign = (secret: string, timestamp: number, nonce: string, envelope: Omit<LiNKautoworkEventEnvelope, 'signature'>): string =>
  createHmac('sha256', secret).update(`${timestamp}.${nonce}.${json(envelope)}`).digest('hex')
const validSignature = (provided: string, expected: string): boolean => {
  const a = Buffer.from(provided, 'utf8'); const b = Buffer.from(expected, 'utf8')
  return a.length === b.length && timingSafeEqual(a, b)
}
const receiptSignature = (secret: string, request: GatewayRequest, receiptId: string, acknowledgedAt: string): string => createHmac('sha256', secret).update(`${receiptId}.${acknowledgedAt}.${request.envelope.idempotency_key}`).digest('hex')

export type GatewayClock = { nowSeconds(): number; nowIso(): string }
const systemClock: GatewayClock = { nowSeconds: () => Math.floor(Date.now() / 1000), nowIso: () => new Date().toISOString() }

export type GatewayMetrics = {
  backlog: number; failures: number; attempts: number; acknowledged: number; acknowledgementLatencyMs: number; deadLetter: number
}
export class Metrics {
  private readonly values: GatewayMetrics = { backlog: 0, failures: 0, attempts: 0, acknowledged: 0, acknowledgementLatencyMs: 0, deadLetter: 0 }
  increment(key: keyof GatewayMetrics, amount = 1): void { this.values[key] += amount }
  snapshot(): GatewayMetrics { return { ...this.values } }
  replace(values: GatewayMetrics): void { Object.assign(this.values, values) }
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
    return Boolean(policy && policy.environments.includes(this.options.environment) && policy.orgIds.length > 0 && policy.orgIds.includes(orgId))
  }
  private assertCanonical(request: GatewayRequest): void {
    if (!isLiNKautoworkEventEnvelope(request.envelope)) throw new ReplayError('invalid_envelope')
    if (!this.authorized(request.envelope.event_name, request.envelope.org_id)) throw new ReplayError('unauthorized_event')
    const { signature, ...unsigned } = request.envelope
    if (signature.key_id !== this.options.keyId || !validSignature(signature.signature, sign(this.options.secret, request.timestamp, request.nonce, unsigned))) throw new ReplayError('invalid_signature')
  }
  buildRequest(eventName: LiNKautoworkEventName, orgId: string, correlationId: string, idempotencyKey: string, payload: GatewayPayload, attempt = 1): GatewayRequest {
    if (!this.authorized(eventName, orgId)) throw new ReplayError('unauthorized_event')
    const timestamp = this.clock.nowSeconds(); const nonce = randomUUID()
    const unsigned = { schema_version: { major: 1, minor: 0 } as const, org_id: orgId, correlation_id: correlationId, idempotency_key: idempotencyKey, event_id: `event:${idempotencyKey}`, event_name: eventName, payload, delivery_attempt: attempt, acknowledgement: { status: 'pending' as const } } satisfies Omit<LiNKautoworkEventEnvelope, 'signature'>
    const envelope: LiNKautoworkEventEnvelope = { ...unsigned, signature: { algorithm: 'hmac-sha256', key_id: this.options.keyId, signature: sign(this.options.secret, timestamp, nonce, unsigned) } }
    if (!isLiNKautoworkEventEnvelope(envelope)) throw new ReplayError('invalid_envelope')
    return { envelope, timestamp, nonce }
  }
  resignRequest(request: GatewayRequest, attempt: number): GatewayRequest {
    const { signature: _signature, ...unsignedBase } = request.envelope
    const unsigned = { ...unsignedBase, delivery_attempt: attempt, acknowledgement: { status: 'pending' as const } }
    const timestamp = this.clock.nowSeconds(); const nonce = randomUUID()
    const envelope: LiNKautoworkEventEnvelope = { ...unsigned, signature: { algorithm: 'hmac-sha256', key_id: this.options.keyId, signature: sign(this.options.secret, timestamp, nonce, unsigned) } }
    if (!isLiNKautoworkEventEnvelope(envelope)) throw new ReplayError('invalid_envelope')
    return { envelope, timestamp, nonce }
  }
  async send(eventName: LiNKautoworkEventName, orgId: string, correlationId: string, idempotencyKey: string, payload: GatewayPayload): Promise<GatewayResponse> {
    let lastError: unknown
    for (let attempt = 1; attempt <= 4; attempt += 1) {
      const request = this.buildRequest(eventName, orgId, correlationId, idempotencyKey, payload, attempt)
      const response = await this.sendRequest(request).catch((error: unknown) => { lastError = error; return null })
      if (response && response.status >= 200 && response.status < 300) return response
      if (response && response.status >= 400 && response.status < 500) return response
    }
    throw lastError instanceof Error ? lastError : new Error('gateway_retry_exhausted')
  }
  private async sendRequest(request: GatewayRequest): Promise<GatewayResponse> {
    this.assertCanonical(request)
    this.metrics.increment('attempts')
    const started = Date.now(); const response = await Promise.race([
      this.options.transport(request),
      new Promise<GatewayResponse>((_, reject) => setTimeout(() => reject(new Error('gateway_timeout')), this.options.timeoutMs ?? 3_000)),
    ])
    if (response.status >= 200 && response.status < 300) {
      this.assertAcknowledgement(request, response)
      this.metrics.increment('acknowledged'); this.metrics.increment('acknowledgementLatencyMs', Date.now() - started)
    } else this.metrics.increment('failures')
    return response
  }
  async transport(request: GatewayRequest): Promise<GatewayResponse> { return this.sendRequest(request) }
  verify(request: GatewayRequest): LiNKautoworkEventEnvelope {
    const { envelope, timestamp, nonce } = request
    this.guard.assertFresh(timestamp)
    this.assertCanonical(request)
    this.guard.accept(timestamp, nonce)
    return envelope
  }
  /** Validate a stored record before re-signing. Freshness is intentionally checked by the new signature. */
  verifyStored(request: GatewayRequest): LiNKautoworkEventEnvelope { this.assertCanonical(request); return request.envelope }
  signAcknowledgement(request: GatewayRequest, receiptId: string, acknowledgedAt: string): string { return receiptSignature(this.options.secret, request, receiptId, acknowledgedAt) }
  private assertAcknowledgement(request: GatewayRequest, response: GatewayResponse): void {
    if (!response.receiptId || response.receiptId === 'missing' || !/^[-A-Za-z0-9_.:]+$/.test(response.receiptId) || Number.isNaN(Date.parse(response.acknowledgedAt)) || !response.receiptSignature || !/^[a-f0-9]{64}$/.test(response.receiptSignature) || !validSignature(response.receiptSignature, receiptSignature(this.options.secret, request, response.receiptId, response.acknowledgedAt))) throw new Error('invalid_gateway_acknowledgement_receipt')
  }
}

export type OutboxItem = { id: string; request: GatewayRequest; attempts: number; nextAttemptAt: number; state: 'pending' | 'leased' | 'sent' | 'dead_letter'; leaseId?: string; leaseExpiresAt?: number; receiptId?: string; acknowledgedAt?: string; lastError?: string }
export type OutboxResigner = (request: GatewayRequest, attempt: number) => GatewayRequest
export type OutboxValidator = (request: GatewayRequest) => void
export class FileOutbox {
  private readonly path: string; private readonly maxAttempts: number; private readonly metrics: Metrics; private readonly resigner: OutboxResigner; private readonly validator?: OutboxValidator
  constructor(path: string, maxAttempts = 4, metrics = new Metrics(), resigner: OutboxResigner = (request, attempt) => ({ ...request, envelope: { ...request.envelope, delivery_attempt: attempt } }), validator?: OutboxValidator) { this.path = path; this.maxAttempts = maxAttempts; this.metrics = metrics; this.resigner = resigner; this.validator = validator }
  private digest(items: OutboxItem[]): string { return createHmac('sha256', 'linksites-outbox-integrity-v1').update(json(items)).digest('hex') }
  private async read(): Promise<OutboxItem[]> { try { const parsed: unknown = JSON.parse(await readFile(this.path, 'utf8')); if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('outbox_corrupt'); const record = parsed as { version?: unknown; items?: unknown; digest?: unknown }; if (record.version !== 1 || !Array.isArray(record.items) || typeof record.digest !== 'string' || record.digest !== this.digest(record.items as OutboxItem[])) throw new Error('outbox_integrity_failure'); if (record.items.some((item) => !item || typeof item !== 'object')) throw new Error('outbox_corrupt'); return record.items as OutboxItem[] } catch (error: unknown) { if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') return []; throw new Error('outbox_corrupt', { cause: error }) } }
  private async write(items: OutboxItem[]): Promise<void> { await mkdir(dirname(this.path), { recursive: true }); const temp = `${this.path}.tmp`; await writeFile(temp, json({ version: 1, items, digest: this.digest(items) }), 'utf8'); await rename(temp, this.path) }
  private reconcileMetrics(items: readonly OutboxItem[]): void {
    this.metrics.replace({
      backlog: items.filter((item) => item.state === 'pending' || item.state === 'leased').length,
      failures: items.filter((item) => Boolean(item.lastError)).length,
      attempts: items.reduce((sum, item) => sum + item.attempts, 0),
      acknowledged: items.filter((item) => item.state === 'sent').length,
      acknowledgementLatencyMs: this.metrics.snapshot().acknowledgementLatencyMs,
      deadLetter: items.filter((item) => item.state === 'dead_letter').length,
    })
  }
  private async locked<T>(operation: () => Promise<T>): Promise<T> { const lockPath = `${this.path}.lock`; await mkdir(dirname(this.path), { recursive: true }); let handle: Awaited<ReturnType<typeof open>> | undefined; for (;;) { try { handle = await open(lockPath, 'wx'); break } catch (error: unknown) { if ((error as NodeJS.ErrnoException)?.code !== 'EEXIST') throw error; const lockStat = await stat(lockPath).catch(() => null); if (lockStat && Date.now() - lockStat.mtimeMs > 30_000) await unlink(lockPath).catch(() => undefined); else await new Promise((resolve) => setTimeout(resolve, 2)) } } try { return await operation() } finally { await handle?.close(); await unlink(lockPath).catch(() => undefined) } }
  async enqueue(request: GatewayRequest): Promise<string> { if (!isLiNKautoworkEventEnvelope(request.envelope)) throw new ReplayError('invalid_envelope'); this.validator?.(request); return this.locked(async () => { const items = await this.read(); const existing = items.find((item) => item.request.envelope.idempotency_key === request.envelope.idempotency_key); if (existing) return existing.id; const id = randomUUID(); items.push({ id, request, attempts: 0, nextAttemptAt: 0, state: 'pending' }); await this.write(items); this.metrics.increment('backlog'); return id }) }
  async drain(transport: GatewayTransport, now = Date.now()): Promise<readonly OutboxItem[]> {
    return this.locked(async () => { const items = await this.read(); this.reconcileMetrics(items)
    for (const item of items.filter((candidate) => (candidate.state === 'pending' || (candidate.state === 'leased' && (candidate.leaseExpiresAt ?? 0) <= now)) && candidate.nextAttemptAt <= now)) {
      item.state = 'leased'; item.leaseId = randomUUID(); item.leaseExpiresAt = now + 30_000; item.attempts += 1; await this.write(items); this.metrics.increment('attempts')
      try { this.validator?.(item.request); item.request = this.resigner(item.request, item.attempts); await this.write(items); const receipt = await transport(item.request); if (receipt.status >= 200 && receipt.status < 300) { if (!receipt.receiptId || receipt.receiptId === 'missing' || !/^[-A-Za-z0-9_.:]+$/.test(receipt.receiptId) || Number.isNaN(Date.parse(receipt.acknowledgedAt))) throw new Error('invalid_gateway_acknowledgement_receipt'); item.state = 'sent'; item.receiptId = receipt.receiptId; item.acknowledgedAt = receipt.acknowledgedAt; item.leaseId = undefined; item.leaseExpiresAt = undefined; this.metrics.increment('acknowledged'); this.metrics.increment('backlog', -1) } else if (receipt.status >= 400 && receipt.status < 500) { item.state = 'dead_letter'; item.lastError = `gateway_${receipt.status}`; item.leaseId = undefined; item.leaseExpiresAt = undefined; this.metrics.increment('deadLetter'); this.metrics.increment('backlog', -1) } else throw new Error('retryable_gateway_failure') } catch (error: unknown) { this.metrics.increment('failures'); item.lastError = error instanceof Error ? error.message : 'delivery_failed'; item.leaseId = undefined; item.leaseExpiresAt = undefined; if (item.attempts >= this.maxAttempts) { item.state = 'dead_letter'; this.metrics.increment('deadLetter'); this.metrics.increment('backlog', -1) } else { item.state = 'pending'; item.nextAttemptAt = now + 100 * 2 ** (item.attempts - 1) } }
    }
    await this.write(items); this.reconcileMetrics(items); return items })
  }
  async items(): Promise<readonly OutboxItem[]> { const items = await this.read(); this.reconcileMetrics(items); return items }
}

export const redactForLog = (request: GatewayRequest): Record<string, unknown> => ({ event_id: request.envelope.event_id, event_name: request.envelope.event_name, org_id: request.envelope.org_id, correlation_id: request.envelope.correlation_id, idempotency_key: request.envelope.idempotency_key, timestamp: request.timestamp, nonce: '[redacted]', signature: '[redacted]' })

export type CrmReadyItem<T> = { itemId: string; envelope: T }
export interface CrmPullPort<T> { pullReady(limit: number, nowIso: string): Promise<readonly CrmReadyItem<T>[]> }
export interface CrmClaimPort { claim(itemId: string, idempotencyKey: string, nowIso: string): Promise<{ claimId: string } | null> }
export interface CrmCompletionPort<T> { writeCompletion(envelope: T): Promise<void> }
