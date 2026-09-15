import assert from 'node:assert/strict'
import test from 'node:test'
import { CanonicalIntakeBoundary, MemoryLeadPersister, LiNKautoworkGateway } from '@linksites/autowork-boundary'
import { ProgramRuntime } from '../src/runtime.ts'

test('manual and signed adapters share correlation and idempotency identities', async () => {
  const lead = {
    schema_version: { major: 1, minor: 0 } as const,
    org_id: 'org_demo',
    correlation_id: 'corr_lead_001',
    idempotency_key: 'lead:demo-example:research:v1',
    lead_id: 'lead_demo_example',
    research: { summary: 'A local service business that needs a clearer conversion path.', sources: ['https://example.test/research/demo-example'] },
    requested_vertical: 'professional-services',
    source: 'manual-first-test',
  }
  const boundary = new CanonicalIntakeBoundary(new MemoryLeadPersister(), 'org_demo')
  const manual = await boundary.acceptManual(lead)
  const gateway = new LiNKautoworkGateway({
    secret: 'ltfx.auto.secret.orch.canonical.v1',
    keyId: 'key-1',
    environment: 'development',
    clock: { nowSeconds: () => 1_000, nowIso: () => '1970-01-01T00:16:40.000Z' },
    transport: async () => { throw new Error('persist before dispatch') },
  })
  const signed = await boundary.acceptSigned(
    gateway.buildRequest('lead.research.ready', 'org_demo', lead.correlation_id, lead.idempotency_key, { lead_id: lead.lead_id, site_id: 'site_demo_example', lead_research: lead }),
    gateway,
    'org_demo',
  )
  assert.equal(manual.correlationId, signed.correlationId)
  assert.equal(manual.idempotencyKey, signed.idempotencyKey)
  assert.equal(signed.replay, true)
})

test('a downstream Autowork receipt cannot mark the Program complete', () => {
  assert.throws(
    () => ProgramRuntime.prototype.rejectAutoworkCompletion.call({} as ProgramRuntime, { requestId: 'receipt-1' }),
    /not_linksites_completion/,
  )
})
