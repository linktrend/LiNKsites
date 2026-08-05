import assert from 'node:assert/strict'
import test from 'node:test'
import { isLeadResearchPackage } from '../../types/src/runtime-contracts.ts'
import { mapReferenceCrmLead, ReferenceCrmAdapter } from '../src/crm-reference.ts'

test('reference CRM maps vendor fields to a canonical pull envelope byte-for-byte', () => {
  const a = mapReferenceCrmLead({ id: 'lead-1', organizationId: 'org_demo', siteId: 'site-1', customFields: { vertical: 'professional-services', vendorOnly: 'ignored' } })
  const b = mapReferenceCrmLead({ id: 'lead-1', organizationId: 'org_demo', siteId: 'site-1', email: 'redacted@example.invalid', customFields: { vertical: 'professional-services', vendorOnly: 'different' } })
  assert.ok(isLeadResearchPackage(a))
  assert.deepEqual(a, b)
  assert.equal(JSON.stringify(a), JSON.stringify(b))
})

test('reference adapter pulls, idempotently claims, writes canonical completion, and preserves manual bytes', async () => {
  const adapter = new ReferenceCrmAdapter([{ id: 'lead-1', organizationId: 'org_demo', siteId: 'site-1', customFields: { vertical: 'professional-services' } }])
  const pulled = await adapter.pullReady(10)
  assert.equal(pulled.length, 1)
  assert.deepEqual(await adapter.claim('lead-1', pulled[0].envelope.idempotency_key), { claimId: 'claim:lead-1' })
  assert.deepEqual(await adapter.claim('lead-1', pulled[0].envelope.idempotency_key), { claimId: 'claim:lead-1' })
  const completion = { schema_version: { major: 1, minor: 0 } as const, org_id: 'org_demo', correlation_id: 'crm:lead-1', idempotency_key: 'demo:lead-1', lead_id: 'lead-1', site_id: 'site-1', private_preview_url: 'https://preview.example', status: 'completed' as const, artifact_revision: 'a'.repeat(40), library_revision: 'b'.repeat(40), content_revision: 'c'.repeat(40), evidence_references: ['evidence:1'], started_at: '2026-08-05T00:00:00.000Z', completed_at: '2026-08-05T00:01:00.000Z' }
  await adapter.writeCompletion(completion)
  await adapter.writeCompletion(completion)
  assert.equal(adapter.completionCount(), 1)
  assert.equal(adapter.completionBytes('demo:lead-1'), JSON.stringify(completion))
})
