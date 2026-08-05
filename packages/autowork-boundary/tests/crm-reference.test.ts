import assert from 'node:assert/strict'
import test from 'node:test'
import { isLeadResearchPackage } from '../../types/src/runtime-contracts.ts'
import { mapReferenceCrmLead } from '../src/crm-reference.ts'

test('reference CRM maps vendor fields to a canonical pull envelope byte-for-byte', () => {
  const a = mapReferenceCrmLead({ id: 'lead-1', organizationId: 'org_demo', siteId: 'site-1', customFields: { vertical: 'professional-services', vendorOnly: 'ignored' } })
  const b = mapReferenceCrmLead({ id: 'lead-1', organizationId: 'org_demo', siteId: 'site-1', email: 'redacted@example.invalid', customFields: { vertical: 'professional-services', vendorOnly: 'different' } })
  assert.ok(isLeadResearchPackage(a))
  assert.deepEqual(a, b)
  assert.equal(JSON.stringify(a), JSON.stringify(b))
})
