import assert from 'node:assert/strict'
import test from 'node:test'
import { AutoworkClient, AutoworkPolicyError, AUTOWORK_CONTRACT_VERSION, type AutoworkCallback, type AutoworkDetails, type AutoworkPin, type AutoworkReceipt, type AutoworkRequest, type AutoworkSummary } from '../src/autoworkClient.ts'
import { createHash, randomUUID } from 'node:crypto'
import { providerBaseline } from '@linksites/types'

const digest = (letter: string) => `sha256:${letter.repeat(64)}` as `sha256:${string}`
const pin: AutoworkPin & { automationId: string } = { providerBaseline: providerBaseline('autowork'), contractVersion: AUTOWORK_CONTRACT_VERSION, automationId: 'site-precheck', automation: { automationId: 'site-precheck', version: '1.2.3', definitionDigest: digest('a'), configurationRef: 'lautowork://config/site-precheck', configurationDigest: digest('b') } }
const summary = (overrides: Partial<AutoworkSummary> = {}): AutoworkSummary => ({ ...pin, owner: 'linkautowork', purpose: 'bounded precheck', operationKinds: ['precheck'], capabilityRequirement: 'sites.precheck', lifecycle: 'available', contractRef: 'lautowork://contract/provider', ...overrides })
const details = (overrides: Partial<AutoworkDetails> = {}): AutoworkDetails => ({ ...summary(), inputSchemaRef: 'lautowork://schema/input', outputSchemaRef: 'lautowork://schema/output', retryPolicyRef: 'lautowork://policy/retry', cancellationPolicyRef: 'lautowork://policy/cancel', runbookRef: 'lautowork://runbook/precheck', evidenceGuideRef: 'lautowork://guide/precheck', ...overrides })
const requestBase = (): AutoworkRequest => ({ ...pin, requestId: randomUUID(), platform: { orgId: '00000000-0000-0000-0000-000000000001', actorId: 'actor-1', capability: 'sites.precheck', expiresAt: '2026-08-14T00:00:00.000Z', revocationRef: 'lautowork://revocation/active' }, scope: { orgId: '00000000-0000-0000-0000-000000000001', capability: 'sites.precheck', operationKind: 'precheck', scopes: ['precheck'] }, inputRef: { ref: 'linksites://input/1', digest: digest('c'), observedAt: '2026-08-13T00:00:00.000Z' }, correlationRefs: [{ ref: 'linksites://correlation/1', digest: digest('d'), observedAt: '2026-08-13T00:00:00.000Z' }], resultDestinationRef: 'linksites://result/1', idempotencyKey: 'test-only-test-only', expiresAt: '2026-08-14T00:00:00.000Z', policy: { sideEffectClass: 'read_only', approvalRequirement: 'none', dataClassification: 'internal' } })
const canonical = (value: unknown): unknown => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => [key, canonical(child)])) : value
const receipt = (request: AutoworkRequest, overrides: Partial<AutoworkReceipt> = {}): AutoworkReceipt => ({ providerBaseline: providerBaseline('autowork'), contractVersion: AUTOWORK_CONTRACT_VERSION, requestId: request.requestId, receiptId: randomUUID(), state: 'accepted', acceptedAt: '2026-08-13T12:00:00.000Z', updatedAt: '2026-08-13T12:00:00.000Z', attemptCount: 0, requestFingerprint: `sha256:${createHash('sha256').update(JSON.stringify(canonical(request))).digest('hex')}`, automation: { automationId: pin.automationId, version: pin.automation.version, definitionDigest: pin.automation.definitionDigest }, resultRefs: [], evidenceRefs: [], uncertainOutcome: false, ...overrides })
const transport = (overrides: Partial<{ summary: AutoworkSummary; details: AutoworkDetails; status: any; request: (request: AutoworkRequest) => Promise<AutoworkReceipt> }> = {}) => ({ summary: async (_pin: typeof pin) => overrides.summary ?? summary(), details: async (_pin: typeof pin) => overrides.details ?? details(), status: async (_request: { capability: string }) => overrides.status ?? { capability: 'sites.precheck', state: 'available', observedAt: '2026-08-13T12:00:00.000Z', doesNotProve: ['automation_run', 'consumer_outcome', 'consumer_gate', 'external_side_effect', 'e2e_readiness', 'production_readiness'] as const }, request: overrides.request ?? (async (request) => receipt(request)) })

test('summary-first and selected-details retrieval remain provider observations', async () => {
  const calls: string[] = []; const base = transport({ summary: summary() }); const client = new AutoworkClient({ ...base, summary: async (pin) => { calls.push('summary'); return base.summary(pin) }, details: async (pin) => { calls.push('details'); return base.details(pin) } }, undefined, providerBaseline('autowork'))
  const result = await client.details(pin); assert.deepEqual(calls, ['summary', 'details']); assert.equal(result.localAuthorityUnchanged, true); assert.equal(result.conflict, 'provider_observation_only')
})

test('accepts exact receipt binding and status without execution claims', async () => {
  const request = requestBase(); const client = new AutoworkClient(transport({ request: async (value) => receipt(value) }), () => new Date('2026-08-13T12:00:00.000Z'), providerBaseline('autowork'))
  const result = await client.request(request); assert.equal(result.value.state, 'accepted'); assert.equal((await client.status('sites.precheck')).value.doesNotProve.includes('consumer_gate'), true)
})

for (const [name, mutate] of [
  ['contract mismatch', () => ({ ...summary(), contractVersion: 'wrong' as never })],
  ['release version mismatch', () => ({ ...summary(), automation: { ...pin.automation, version: '9.9.9' } })],
  ['digest mismatch', () => ({ ...summary(), automation: { ...pin.automation, definitionDigest: digest('e') } })],
  ['revoked', () => ({ request: { ...requestBase(), platform: { ...requestBase().platform, revocationRef: 'lautowork://revocation/revoked' } } })],
  ['unauthorized scope', () => ({ request: { ...requestBase(), scope: { ...requestBase().scope, scopes: ['status_collection'] } } })],
  ['forbidden sensitive field', () => ({ summary: { ...summary(), secret: 'private-value' } as AutoworkSummary & { secret?: string } })],
] as const) test(`fails closed for ${name}`, async () => {
  const value = mutate() as any; const client = new AutoworkClient(transport({ summary: value.summary ?? value, request: async (request) => receipt(request) }), () => new Date('2026-08-13T12:00:00.000Z'), providerBaseline('autowork'))
  if (value.request) await assert.rejects(client.request(value.request), AutoworkPolicyError); else await assert.rejects(client.summary(pin), AutoworkPolicyError)
})

test('provider absence fails closed and has no fallback call', async () => {
  let calls = 0; const client = new AutoworkClient({ ...transport(), summary: async () => { calls++; throw new Error('provider unavailable') } }, undefined, providerBaseline('autowork')); await assert.rejects(client.summary(pin), /unavailable/); assert.equal(calls, 1)
})

test('receipt mismatch and provider failure never trigger a fallback request', async () => {
  let calls = 0; const request = requestBase(); const client = new AutoworkClient({ ...transport(), request: async (value) => { calls++; return receipt(value, { requestId: randomUUID() }) } }, () => new Date('2026-08-13T12:00:00.000Z'), providerBaseline('autowork')); await assert.rejects(client.request(request), /receiptBindingMismatch/); assert.equal(calls, 1)
})

test('external assistance requires an exact Brain handoff identity', async () => {
  const request = { ...requestBase(), scope: { ...requestBase().scope, operationKind: 'external_assistance' as const, scopes: ['external_assistance'] } }
  const client = new AutoworkClient(transport(), () => new Date('2026-08-13T12:00:00.000Z'), providerBaseline('autowork'))
  await assert.rejects(client.request(request), /missingExactHandoff/)
})

test('accepts a structurally exact Autowork receipt baseline after JSON roundtrip', async () => {
  const request = requestBase()
  const roundtripped = JSON.parse(JSON.stringify(providerBaseline('autowork')))
  const client = new AutoworkClient(transport({ request: async (value) => receipt(value, { providerBaseline: roundtripped }) }), () => new Date('2026-08-13T12:00:00.000Z'), providerBaseline('autowork'))
  const result = await client.request(request)
  assert.equal(result.value.state, 'accepted')
  assert.deepEqual(result.value.providerBaseline, providerBaseline('autowork'))
})

test('rejects an Autowork receipt baseline with stale or extra fields', async () => {
  const request = requestBase()
  const stale = { ...JSON.parse(JSON.stringify(providerBaseline('autowork'))), commit: '0'.repeat(40) }
  const extra = { ...JSON.parse(JSON.stringify(providerBaseline('autowork'))), extra: true }
  const staleClient = new AutoworkClient(transport({ request: async (value) => receipt(value, { providerBaseline: stale }) }), () => new Date('2026-08-13T12:00:00.000Z'), providerBaseline('autowork'))
  const extraClient = new AutoworkClient(transport({ request: async (value) => receipt(value, { providerBaseline: extra }) }), () => new Date('2026-08-13T12:00:00.000Z'), providerBaseline('autowork'))
  await assert.rejects(staleClient.request(request), /commitMismatch/)
  await assert.rejects(extraClient.request(request), /unexpectedOrMissingKey/)
})

test('acknowledges a bound callback once and rejects replay, stale, or handoff mismatch', async () => {
  const request = { ...requestBase(), exactHandoffId: 'brain-handoff-1' }
  const issued = receipt(request)
  const callback = (overrides: Partial<AutoworkCallback> = {}): AutoworkCallback => ({
    providerBaseline: providerBaseline('autowork'),
    contractVersion: AUTOWORK_CONTRACT_VERSION,
    requestId: request.requestId,
    receiptId: issued.receiptId,
    callbackId: 'callback-1',
    nonce: 'nonce-1',
    timestamp: '2026-08-13T12:00:00.000Z',
    environment: 'development',
    signatureRef: 'lautowork://signature/callback-1',
    exactHandoffId: 'brain-handoff-1',
    requestFingerprint: issued.requestFingerprint,
    ...overrides,
  })
  const client = new AutoworkClient({
    ...transport(),
    callback: async (value) => ({ callbackId: value.callbackId, requestId: value.requestId, receiptId: value.receiptId, acknowledgedAt: '2026-08-13T12:00:01.000Z', exactHandoffId: value.exactHandoffId, terminal: true as const }),
  }, () => new Date('2026-08-13T12:00:00.000Z'), providerBaseline('autowork'))
  const first = await client.acknowledgeCallback(callback(), request, issued, 'development')
  assert.equal(first.value.terminal, true)
  await assert.rejects(client.acknowledgeCallback(callback(), request, issued, 'development'), /callbackReplay/)
  const fresh = new AutoworkClient({
    ...transport(),
    callback: async (value) => ({ callbackId: value.callbackId, requestId: value.requestId, receiptId: value.receiptId, acknowledgedAt: '2026-08-13T12:00:01.000Z', exactHandoffId: value.exactHandoffId, terminal: true as const }),
  }, () => new Date('2026-08-13T12:00:00.000Z'), providerBaseline('autowork'))
  await assert.rejects(fresh.acknowledgeCallback(callback({ exactHandoffId: 'other-handoff' }), request, issued, 'development'), /exactHandoffMismatch/)
  await assert.rejects(fresh.acknowledgeCallback(callback({ timestamp: '2026-08-13T11:00:00.000Z', nonce: 'nonce-2' }), request, issued, 'development'), /staleCallback/)
  await assert.rejects(fresh.acknowledgeCallback(callback({ nonce: 'nonce-3', environment: 'production' }), request, issued, 'development'), /environmentMismatch/)
})

test('accepts a structurally exact Autowork callback baseline after JSON roundtrip', async () => {
  const request = { ...requestBase(), exactHandoffId: 'brain-handoff-1' }
  const issued = receipt(request)
  const roundtripped = JSON.parse(JSON.stringify(providerBaseline('autowork')))
  const client = new AutoworkClient({
    ...transport(),
    callback: async (value) => ({ callbackId: value.callbackId, requestId: value.requestId, receiptId: value.receiptId, acknowledgedAt: '2026-08-13T12:00:01.000Z', exactHandoffId: value.exactHandoffId, terminal: true as const }),
  }, () => new Date('2026-08-13T12:00:00.000Z'), providerBaseline('autowork'))
  const result = await client.acknowledgeCallback({
    providerBaseline: roundtripped,
    contractVersion: AUTOWORK_CONTRACT_VERSION,
    requestId: request.requestId,
    receiptId: issued.receiptId,
    callbackId: 'callback-roundtrip',
    nonce: 'nonce-roundtrip',
    timestamp: '2026-08-13T12:00:00.000Z',
    environment: 'development',
    signatureRef: 'lautowork://signature/callback-roundtrip',
    exactHandoffId: 'brain-handoff-1',
    requestFingerprint: issued.requestFingerprint,
  }, request, issued, 'development')
  assert.equal(result.value.terminal, true)
})

test('rejects an Autowork callback baseline with stale or extra fields', async () => {
  const request = { ...requestBase(), exactHandoffId: 'brain-handoff-1' }
  const issued = receipt(request)
  const client = new AutoworkClient({
    ...transport(),
    callback: async (value) => ({ callbackId: value.callbackId, requestId: value.requestId, receiptId: value.receiptId, acknowledgedAt: '2026-08-13T12:00:01.000Z', exactHandoffId: value.exactHandoffId, terminal: true as const }),
  }, () => new Date('2026-08-13T12:00:00.000Z'), providerBaseline('autowork'))
  const bound = {
    contractVersion: AUTOWORK_CONTRACT_VERSION,
    requestId: request.requestId,
    receiptId: issued.receiptId,
    callbackId: 'callback-stale',
    nonce: 'nonce-stale',
    timestamp: '2026-08-13T12:00:00.000Z',
    environment: 'development' as const,
    signatureRef: 'lautowork://signature/callback-stale',
    exactHandoffId: 'brain-handoff-1',
    requestFingerprint: issued.requestFingerprint,
  }
  await assert.rejects(client.acknowledgeCallback({ ...bound, providerBaseline: { ...JSON.parse(JSON.stringify(providerBaseline('autowork'))), commit: '0'.repeat(40) } }, request, issued, 'development'), /commitMismatch/)
  await assert.rejects(client.acknowledgeCallback({ ...bound, nonce: 'nonce-extra', providerBaseline: { ...JSON.parse(JSON.stringify(providerBaseline('autowork'))), extra: true } }, request, issued, 'development'), /unexpectedOrMissingKey/)
})
