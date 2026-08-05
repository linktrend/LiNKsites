import assert from 'node:assert/strict'
import { mkdtemp, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { isLeadResearchPackage } from '../../types/src/runtime-contracts.ts'
import { validDemoCompletion } from '../../types/fixtures/w1-01-contract-fixtures.ts'
import { FileCompletionSink } from '../../../apps/intake-orchestrator/src/file-adapters.ts'
import { mapReferenceCrmLead, ReferenceCrmAdapter } from '../src/crm-reference.ts'

test('reference CRM maps vendor fields to a canonical pull envelope byte-for-byte', () => {
  const a = mapReferenceCrmLead({ id: 'lead-1', organizationId: 'org_demo', siteId: 'site-1', customFields: { vertical: 'professional-services', vendorOnly: 'ignored' } })
  const b = mapReferenceCrmLead({ id: 'lead-1', organizationId: 'org_demo', siteId: 'site-1', email: 'redacted@example.invalid', customFields: { vertical: 'professional-services', vendorOnly: 'different' } })
  assert.ok(isLeadResearchPackage(a))
  assert.deepEqual(a, b)
  assert.equal(JSON.stringify(a), JSON.stringify(b))
})

test('reference adapter implements the actual intake port and matches FileCompletionSink bytes', async () => {
  const adapter = new ReferenceCrmAdapter([{ id: 'lead-1', organizationId: 'org_demo', siteId: 'site-1', customFields: { vertical: 'professional-services' } }])
  const pulled = await adapter.pullReady(10, '2026-08-05T00:00:00.000Z')
  assert.equal(pulled.length, 1)
  assert.deepEqual(await adapter.claim('lead-1', pulled[0].envelope.lead_id, pulled[0].envelope.idempotency_key, '2026-08-05T00:00:00.000Z'), { itemId: 'lead-1', claimId: 'claim:lead-1' })
  assert.deepEqual(await adapter.claim('lead-1', pulled[0].envelope.lead_id, pulled[0].envelope.idempotency_key, '2026-08-05T00:00:00.000Z'), { itemId: 'lead-1', claimId: 'claim:lead-1' })
  assert.deepEqual(await adapter.pullReady(10, '2026-08-05T00:00:00.000Z'), [])
  const completion = validDemoCompletion
  await adapter.write(completion)
  await adapter.write(completion)
  const directory = await mkdtemp(join(tmpdir(), 'linksites-w2-05-crm-'))
  const sink = new FileCompletionSink(join(directory, 'completion.ndjson'))
  await sink.write(completion)
  assert.equal(adapter.completionCount(), 1)
  assert.equal(adapter.completionBytes(completion.idempotency_key), (await readFile(join(directory, 'completion.ndjson'), 'utf8')).trim())
})
