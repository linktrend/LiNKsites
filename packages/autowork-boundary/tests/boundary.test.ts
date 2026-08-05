import assert from 'node:assert/strict'
import { mkdtemp } from 'node:fs/promises'
import test from 'node:test'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { FileOutbox, LiNKautoworkGateway, Metrics, ReplayError, redactForLog, type GatewayRequest } from '../src/index.ts'

const clock = { nowSeconds: () => 1_000, nowIso: () => '1970-01-01T00:16:40.000Z' }
const setup = (transport: (request: GatewayRequest) => Promise<{ status: number; receiptId: string; acknowledgedAt: string }>) => new LiNKautoworkGateway({ secret: 'test-secret', keyId: 'key-1', environment: 'development', transport, clock })
const payload = { lead_id: 'lead-1', site_id: 'site-1' }

test('signed happy path, fixed allow-list, and secret redaction', async () => {
  let captured!: GatewayRequest
  const gateway = setup(async (request) => { captured = request; return { status: 202, receiptId: 'receipt-1', acknowledgedAt: clock.nowIso() } })
  await gateway.send('demo.completed', 'org_demo', 'corr-1', 'completion-1', payload)
  assert.equal(gateway.verify(captured).event_name, 'demo.completed')
  assert.equal(redactForLog(captured).signature, '[redacted]')
  await assert.rejects(() => gateway.send('unknown.event' as never, 'org_demo', 'corr-1', 'other', payload))
})

test('invalid signature, stale timestamp, nonce replay, and unauthorized event fail closed', async () => {
  let captured!: GatewayRequest
  const gateway = setup(async (request) => { captured = request; return { status: 202, receiptId: 'r', acknowledgedAt: clock.nowIso() } })
  await gateway.send('demo.completed', 'org_demo', 'corr', 'key', payload)
  assert.throws(() => gateway.verify({ ...captured, envelope: { ...captured.envelope, signature: { ...captured.envelope.signature, signature: 'bad' } } }), (error: ReplayError) => error.code === 'invalid_signature')
  assert.throws(() => gateway.verify({ ...captured, timestamp: 1 }), (error: ReplayError) => error.code === 'stale_timestamp')
  const replay = setup(async (request) => { captured = request; return { status: 202, receiptId: 'r', acknowledgedAt: clock.nowIso() } })
  await replay.send('demo.completed', 'org_demo', 'corr', 'replay', payload); replay.verify(captured)
  assert.throws(() => replay.verify(captured), (error: ReplayError) => error.code === 'nonce_replay')
  assert.throws(() => replay.verify({ ...captured, envelope: { ...captured.envelope, org_id: 'other-org' } }), (error: ReplayError) => error.code === 'unauthorized_event' || error.code === 'invalid_signature')
})

test('outbox deduplicates, retries 5xx, dead-letters 4xx, and recovers an ambiguous send idempotently', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'linksites-w2-05-')); const metrics = new Metrics(); let sends = 0
  const outbox = new FileOutbox(join(directory, 'outbox.json'), 3, metrics)
  const request: GatewayRequest = { timestamp: 1_000, nonce: 'nonce-1', envelope: { schema_version: { major: 1, minor: 0 } as const, org_id: 'org_demo', correlation_id: 'corr', idempotency_key: 'outbox-1', event_id: 'event:outbox-1', event_name: 'demo.completed', payload, signature: { algorithm: 'hmac-sha256', key_id: 'key-1', signature: 'signature' }, delivery_attempt: 1, acknowledgement: { status: 'pending' } } }
  assert.equal(await outbox.enqueue(request), await outbox.enqueue(request))
  await outbox.drain(async () => ({ status: 503, receiptId: 'none', acknowledgedAt: clock.nowIso() }), 0)
  await outbox.drain(async () => ({ status: 503, receiptId: 'none', acknowledgedAt: clock.nowIso() }), 200)
  await outbox.drain(async () => { sends++; return { status: 202, receiptId: 'receipt', acknowledgedAt: clock.nowIso() } }, 500)
  assert.equal((await outbox.items())[0]?.state, 'sent')
  const recovered = new FileOutbox(join(directory, 'recovered.json'), 2); await recovered.enqueue({ ...request, envelope: { ...request.envelope, idempotency_key: 'crash-safe' } })
  const seen = new Set<string>(); const send = async (value: GatewayRequest) => { const key = value.envelope.idempotency_key; if (!seen.has(key)) { seen.add(key); throw new Error('crash-after-remote-accept') }; return { status: 202, receiptId: 'same-logical-receipt', acknowledgedAt: clock.nowIso() } }
  await recovered.drain(send, 0); await recovered.drain(send, 200); assert.equal((await recovered.items())[0]?.state, 'sent')
  const dead = new FileOutbox(join(directory, 'dead.json'), 1); await dead.enqueue({ ...request, envelope: { ...request.envelope, idempotency_key: 'dead' } }); await dead.drain(async () => ({ status: 422, receiptId: 'none', acknowledgedAt: clock.nowIso() })); assert.equal((await dead.items())[0]?.state, 'dead_letter')
  assert.equal(metrics.snapshot().attempts >= 3, true); assert.equal(sends, 1)
})

test('gateway timeout is bounded and reported as a failed delivery', async () => {
  const gateway = new LiNKautoworkGateway({ secret: 'test-secret', keyId: 'key-1', environment: 'development', timeoutMs: 5, clock, transport: async () => new Promise(() => undefined) })
  await assert.rejects(() => gateway.send('demo.completed', 'org_demo', 'corr', 'timeout', payload), /gateway_timeout/)
})
