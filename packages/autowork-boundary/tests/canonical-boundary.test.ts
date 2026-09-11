import assert from 'node:assert/strict'
import test from 'node:test'
import { LiNKautoworkGateway, type GatewayRequest } from '../src/index.ts'
import {
  CanonicalIntakeBoundary,
  LinksitesCompletionBoundary,
  MemoryCompletionStore,
  MemoryLeadPersister,
} from '../src/canonical-boundary.ts'
import { validDemoCompletion, manualFirstTestLead } from '../../types/fixtures/w1-01-contract-fixtures.ts'

const clock = { nowSeconds: () => 1_000, nowIso: () => '1970-01-01T00:16:40.000Z' }

test('manual/file and signed-gateway adapters persist the same canonical lead and replay the original result', async () => {
  const persister = new MemoryLeadPersister()
  const boundary = new CanonicalIntakeBoundary(persister, 'org_demo')
  const first = await boundary.acceptManual(manualFirstTestLead)
  const replay = await boundary.acceptManual(manualFirstTestLead)
  assert.equal(first.replay, false)
  assert.equal(replay.replay, true)
  assert.equal(replay.itemId, first.itemId)
  assert.deepEqual(first.lead, replay.lead)

  const gateway = new LiNKautoworkGateway({
    secret: 'ltfx.auto.secret.canonicalintake.7f3b5aabce84.v1',
    keyId: 'key-1',
    environment: 'development',
    clock,
    transport: async () => { throw new Error('intake must persist before dispatch') },
  })
  const request: GatewayRequest = gateway.buildRequest(
    'lead.research.ready',
    'org_demo',
    manualFirstTestLead.correlation_id,
    manualFirstTestLead.idempotency_key,
    { lead_id: manualFirstTestLead.lead_id, site_id: 'site_demo_example', lead_research: manualFirstTestLead },
  )
  const signed = await boundary.acceptSigned(request, gateway, 'org_demo')
  assert.equal(signed.replay, true)
  assert.equal(signed.source, 'signed-gateway')
  assert.equal(signed.itemId, first.itemId)
  await assert.rejects(boundary.acceptSigned({ ...request, envelope: { ...request.envelope, org_id: 'other-org' } }, gateway, 'org_demo'), /tenant_isolation|unauthorized/)
})

test('only the LiNKsites completion boundary accepts CRM-shaped completion; Autowork receipts cannot', async () => {
  const store = new MemoryCompletionStore()
  const boundary = new LinksitesCompletionBoundary(store)
  const accepted = await boundary.accept(validDemoCompletion)
  assert.equal(accepted.accepted, true)
  if (!accepted.accepted) throw new Error('expected accepted completion')
  const late = await boundary.accept({ ...validDemoCompletion, completed_at: '2099-01-01T00:00:00.000Z' })
  assert.equal(late.accepted, true)
  if (!late.accepted) throw new Error('expected replay')
  assert.equal(late.replay, true)
  assert.equal(late.envelope.completed_at, validDemoCompletion.completed_at)
  assert.throws(() => boundary.rejectProviderReceipt({ requestId: 'aw-1', state: 'succeeded' }), /cannot mutate Program gates/)
})

test('unrelated workflow events cannot enter website intake', async () => {
  const gateway = new LiNKautoworkGateway({
    secret: 'ltfx.auto.secret.canonicalintake.unrelated.v1',
    keyId: 'key-1',
    environment: 'development',
    clock,
    transport: async () => { throw new Error('must not dispatch') },
  })
  const request = gateway.buildRequest('commercial.outcome.recorded', 'org_demo', 'corr', 'outcome-key', { lead_id: 'lead_demo_example', site_id: 'site_demo_example' })
  const boundary = new CanonicalIntakeBoundary(new MemoryLeadPersister(), 'org_demo')
  await assert.rejects(boundary.acceptSigned(request, gateway, 'org_demo'), /unauthorized_event|lead.research.ready/)
})
