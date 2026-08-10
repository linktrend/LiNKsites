import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import test from 'node:test'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { FileOutbox, LiNKautoworkGateway, Metrics, ReplayError, redactForLog, type GatewayRequest } from '../src/index.ts'
import { isLiNKautoworkEventEnvelope } from '../../types/src/runtime-contracts.ts'

const clock = { nowSeconds: () => 1_000, nowIso: () => '1970-01-01T00:16:40.000Z' }
const setup = (transport: (request: GatewayRequest) => Promise<{ status: number; receiptId: string; receiptSignature: string; acknowledgedAt: string }>) => new LiNKautoworkGateway({ secret: 'test-secret', keyId: 'key-1', environment: 'development', transport, clock })
const payload = { lead_id: 'lead-1', site_id: 'site-1' }

test('signed happy path, fixed allow-list, and secret redaction', async () => {
  let captured!: GatewayRequest
  let gateway!: LiNKautoworkGateway; gateway = setup(async (request) => { captured = request; return { status: 202, receiptId: 'receipt-1', receiptSignature: gateway.signAcknowledgement(request, 'receipt-1', clock.nowIso()), acknowledgedAt: clock.nowIso() } })
  await gateway.send('demo.completed', 'org_demo', 'corr-1', 'completion-1', payload)
  assert.equal(gateway.verify(captured).event_name, 'demo.completed')
  assert.equal(redactForLog(captured).signature, '[redacted]')
  await assert.rejects(() => gateway.send('unknown.event' as never, 'org_demo', 'corr-1', 'other', payload))
})

test('invalid signature, stale timestamp, nonce replay, and unauthorized event fail closed', async () => {
  let captured!: GatewayRequest
  let gateway!: LiNKautoworkGateway; gateway = setup(async (request) => { captured = request; return { status: 202, receiptId: 'r', receiptSignature: gateway.signAcknowledgement(request, 'r', clock.nowIso()), acknowledgedAt: clock.nowIso() } })
  await gateway.send('demo.completed', 'org_demo', 'corr', 'key', payload)
  assert.throws(() => gateway.verify({ ...captured, envelope: { ...captured.envelope, signature: { ...captured.envelope.signature, signature: 'bad' } } }), (error: ReplayError) => error.code === 'invalid_signature')
  assert.throws(() => gateway.verify({ ...captured, timestamp: 1 }), (error: ReplayError) => error.code === 'stale_timestamp')
  let replay!: LiNKautoworkGateway; replay = setup(async (request) => { captured = request; return { status: 202, receiptId: 'r', receiptSignature: replay.signAcknowledgement(request, 'r', clock.nowIso()), acknowledgedAt: clock.nowIso() } })
  await replay.send('demo.completed', 'org_demo', 'corr', 'replay', payload); replay.verify(captured)
  assert.throws(() => replay.verify(captured), (error: ReplayError) => error.code === 'nonce_replay')
  assert.throws(() => replay.verify({ ...captured, envelope: { ...captured.envelope, org_id: 'other-org' } }), (error: ReplayError) => error.code === 'unauthorized_event' || error.code === 'invalid_signature')
})

test('a fixed-format HMAC is not treated as submitted payment data', () => {
  const envelope = {
    schema_version: { major: 1, minor: 0 } as const,
    org_id: 'org_demo',
    correlation_id: 'corr',
    idempotency_key: 'hmac-regression',
    event_id: 'event:hmac-regression',
    event_name: 'demo.completed' as const,
    payload,
    // Begins with a well-known Luhn-valid sequence. It is still a digest,
    // never user-supplied card data.
    signature: { algorithm: 'hmac-sha256' as const, key_id: 'key-1', signature: `4111111111111111${'a'.repeat(48)}` },
    delivery_attempt: 1,
    acknowledgement: { status: 'pending' as const },
  }
  assert.equal(isLiNKautoworkEventEnvelope(envelope), true)
})

test('outbox deduplicates, retries 5xx, dead-letters 4xx, and recovers an ambiguous send idempotently', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'linksites-w2-05-')); const metrics = new Metrics(); let sends = 0
  const outbox = new FileOutbox(join(directory, 'outbox.json'), { maxAttempts: 3, metrics, integritySecret: 'queue-integrity-test', resigner: (value, attempt) => ({ ...value, envelope: { ...value.envelope, delivery_attempt: attempt } }), validator: () => undefined })
  const request: GatewayRequest = { timestamp: 1_000, nonce: 'nonce-1', envelope: { schema_version: { major: 1, minor: 0 } as const, org_id: 'org_demo', correlation_id: 'corr', idempotency_key: 'outbox-1', event_id: 'event:outbox-1', event_name: 'demo.completed', payload, signature: { algorithm: 'hmac-sha256', key_id: 'key-1', signature: 'a'.repeat(64) }, delivery_attempt: 1, acknowledgement: { status: 'pending' } } }
  assert.equal(await outbox.enqueue(request), await outbox.enqueue(request))
  await outbox.drain(async () => ({ status: 503, receiptId: 'none', receiptSignature: 'a'.repeat(64), acknowledgedAt: clock.nowIso() }), 0)
  await outbox.drain(async () => ({ status: 503, receiptId: 'none', receiptSignature: 'a'.repeat(64), acknowledgedAt: clock.nowIso() }), 200)
  await outbox.drain(async () => { sends++; return { status: 202, receiptId: 'receipt', receiptSignature: 'a'.repeat(64), acknowledgedAt: clock.nowIso() } }, 500)
  assert.equal((await outbox.items())[0]?.state, 'sent')
  const recovered = new FileOutbox(join(directory, 'recovered.json'), { maxAttempts: 2, integritySecret: 'queue-integrity-test', resigner: (value, attempt) => ({ ...value, envelope: { ...value.envelope, delivery_attempt: attempt } }), validator: () => undefined }); await recovered.enqueue({ ...request, envelope: { ...request.envelope, idempotency_key: 'crash-safe' } })
  const seen = new Set<string>(); const send = async (value: GatewayRequest) => { const key = value.envelope.idempotency_key; if (!seen.has(key)) { seen.add(key); throw new Error('crash-after-remote-accept') }; return { status: 202, receiptId: 'same-logical-receipt', receiptSignature: 'a'.repeat(64), acknowledgedAt: clock.nowIso() } }
  await recovered.drain(send, 0); await recovered.drain(send, 200); assert.equal((await recovered.items())[0]?.state, 'sent')
  const dead = new FileOutbox(join(directory, 'dead.json'), { maxAttempts: 1, integritySecret: 'queue-integrity-test', resigner: (value, attempt) => ({ ...value, envelope: { ...value.envelope, delivery_attempt: attempt } }), validator: () => undefined }); await dead.enqueue({ ...request, envelope: { ...request.envelope, idempotency_key: 'dead' } }); await dead.drain(async () => ({ status: 422, receiptId: 'none', receiptSignature: 'a'.repeat(64), acknowledgedAt: clock.nowIso() })); assert.equal((await dead.items())[0]?.state, 'dead_letter')
  assert.equal(metrics.snapshot().attempts >= 3, true); assert.equal(sends, 1)
  const deadHealth = await dead.health()
  assert.equal(deadHealth.deadLetter, 1)
  assert.equal(deadHealth.manualAttention, 1)
})

test('gateway timeout is bounded and reported as a failed delivery', async () => {
  const gateway = new LiNKautoworkGateway({ secret: 'test-secret', keyId: 'key-1', environment: 'development', timeoutMs: 5, clock, transport: async () => new Promise(() => undefined) })
  await assert.rejects(() => gateway.send('demo.completed', 'org_demo', 'corr', 'timeout', payload), /gateway_timeout/)
})

test('queue integrity secret is mandatory, stored records are untrusted, grants are rechecked, and metrics survive restart', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'linksites-w2-05-security-'))
  assert.throws(() => new FileOutbox(join(directory, 'missing-secret.json'), { resigner: (value) => value, validator: () => undefined, integritySecret: '' }), /integrity secret/)

  const policies = [{ eventName: 'demo.completed' as const, environments: ['development' as const], orgIds: ['org_demo'] }]
  let gateway!: LiNKautoworkGateway
  gateway = new LiNKautoworkGateway({ secret: 'signing-secret', keyId: 'key-1', environment: 'development', policies, clock, transport: async (request) => ({ status: 202, receiptId: 'receipt-1', receiptSignature: gateway.signAcknowledgement(request, 'receipt-1', clock.nowIso()), acknowledgedAt: clock.nowIso() }) })
  const path = join(directory, 'queue.json')
  const options = { integritySecret: 'queue-integrity-test', resigner: (request: GatewayRequest, attempt: number) => gateway.resignRequest(request, attempt), validator: (request: GatewayRequest) => gateway.verifyStored(request) }
  const outbox = new FileOutbox(path, options)
  await outbox.enqueue(gateway.buildRequest('demo.completed', 'org_demo', 'corr', 'security-1', payload))
  const tampered = JSON.parse(await readFile(path, 'utf8')) as { items: Array<{ request: GatewayRequest }> }
  tampered.items[0]!.request.envelope.org_id = 'other-org'
  await writeFile(path, JSON.stringify({ ...tampered, digest: JSON.parse(await readFile(path, 'utf8')).digest }), 'utf8')
  await assert.rejects(() => outbox.items(), /outbox_(corrupt|integrity)/)

  const grantPath = join(directory, 'grant-queue.json')
  const grants = policies[0]!.orgIds
  const clean = new FileOutbox(grantPath, options)
  await clean.enqueue(gateway.buildRequest('demo.completed', 'org_demo', 'corr', 'security-2', payload))
  grants.splice(0, grants.length)
  let transported = false
  await clean.drain(async () => { transported = true; throw new Error('transport must not run') }, 0)
  assert.equal(transported, false)
  assert.match((await clean.items())[0]!.lastError!, /unauthorized_event/)

  grants.push('org_demo')
  const replayable = new FileOutbox(grantPath, options)
  await replayable.drain(async (request) => ({ status: 202, receiptId: 'receipt-2', receiptSignature: gateway.signAcknowledgement(request, 'receipt-2', clock.nowIso()), acknowledgedAt: clock.nowIso() }), 1_000)
  const healthyGateway = new LiNKautoworkGateway({ secret: 'signing-secret', keyId: 'key-1', environment: 'development', policies: [{ eventName: 'demo.completed', environments: ['development'], orgIds: ['org_demo'] }], clock, transport: async () => { throw new Error('outbox transport is injected per drain') } })
  const healthyOptions = { integritySecret: 'queue-integrity-test', resigner: (request: GatewayRequest, attempt: number) => healthyGateway.resignRequest(request, attempt), validator: (request: GatewayRequest) => healthyGateway.verifyStored(request) }
  const healthyPath = join(directory, 'healthy-queue.json')
  const healthy = new FileOutbox(healthyPath, healthyOptions)
  await healthy.enqueue(healthyGateway.buildRequest('demo.completed', 'org_demo', 'corr', 'healthy-1', payload))
  await healthy.drain(async (request) => ({ status: 202, receiptId: 'receipt-healthy', receiptSignature: healthyGateway.signAcknowledgement(request, 'receipt-healthy', clock.nowIso()), acknowledgedAt: clock.nowIso() }), 1_000)
  const restarted = new FileOutbox(healthyPath, healthyOptions)
  const health = await restarted.health()
  assert.equal(health.acknowledged, 1)
  assert.equal(health.backlog, 0)
  assert.equal(health.acknowledgementLatencyMs >= 0, true)
})

test('a child-process crash after lease persistence is recovered by a fresh worker', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'linksites-w2-05-crash-'))
  const path = join(directory, 'queue.json')
  const request = { timestamp: 1_000, nonce: 'crash-nonce', envelope: { schema_version: { major: 1, minor: 0 } as const, org_id: 'org_demo', correlation_id: 'crash', idempotency_key: 'crash-restart', event_id: 'event:crash-restart' as const, payload, signature: { algorithm: 'hmac-sha256' as const, key_id: 'key-1', signature: 'a'.repeat(64) }, delivery_attempt: 1, acknowledgement: { status: 'pending' as const } } }
  const workerPath = new URL('./fixtures/outbox-crash-worker.ts', import.meta.url).pathname
  const child = spawn(process.execPath, ['--experimental-strip-types', workerPath], {
    stdio: 'ignore',
    env: { ...process.env, LINKSITES_TEST_OUTBOX_CRASH_INPUT: JSON.stringify({ path, request }) },
  })
  const exitCode = await new Promise<number | null>((resolve) => child.once('exit', (code) => resolve(code)))
  assert.equal(exitCode, 42)
  await new Promise((resolve) => setTimeout(resolve, 10))
  const recovered = new FileOutbox(path, { integritySecret: 'queue-integrity-test', leaseMs: 30, lockStaleMs: 1, resigner: (value, attempt) => ({ ...value, envelope: { ...value.envelope, delivery_attempt: attempt } }), validator: () => undefined })
  await recovered.drain(async () => ({ status: 202, receiptId: 'crash-receipt', receiptSignature: 'a'.repeat(64), acknowledgedAt: clock.nowIso() }), 31)
  const item = (await recovered.items())[0]!
  assert.equal(item.state, 'sent')
  assert.equal(item.attempts, 2)
  assert.equal((await recovered.health()).manualAttention, 0)
})
