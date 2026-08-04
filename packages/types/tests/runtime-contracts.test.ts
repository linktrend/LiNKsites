import assert from 'node:assert/strict'
import test from 'node:test'
import {
  isActivationRequest,
  isCommercialOutcomeEnvelope,
  isDemoCompletionEnvelope,
  isEvidenceReceipt,
  isLeadResearchPackage,
  isLiNKautoworkEventEnvelope,
  isRecyclingRequest,
} from '../src/runtime-contracts.ts'
import {
  crmPortLead,
  invalidFixtures,
  manualFirstTestLead,
  validActivationRequest,
  validCommercialOutcome,
  validDemoCompletion,
  validEvidenceReceipt,
  validLiNKautoworkEvent,
  validRecyclingRequest,
} from '../fixtures/w1-01-contract-fixtures.ts'

test('the seven canonical envelopes accept their valid fixtures', () => {
  assert.equal(isLeadResearchPackage(manualFirstTestLead), true)
  assert.equal(isDemoCompletionEnvelope(validDemoCompletion), true)
  assert.equal(isCommercialOutcomeEnvelope(validCommercialOutcome), true)
  assert.equal(isActivationRequest(validActivationRequest), true)
  assert.equal(isRecyclingRequest(validRecyclingRequest), true)
  assert.equal(isLiNKautoworkEventEnvelope(validLiNKautoworkEvent), true)
  assert.equal(isEvidenceReceipt(validEvidenceReceipt), true)
})

test('the manual and CRM-port lead boundaries are byte-compatible', () => {
  assert.equal(JSON.stringify(manualFirstTestLead), JSON.stringify(crmPortLead))
})

test('invalid fixtures fail closed', () => {
  assert.equal(isLeadResearchPackage(invalidFixtures.leadMissingOrg), false)
  assert.equal(isDemoCompletionEnvelope(invalidFixtures.demoWithoutEvidence), false)
  assert.equal(isCommercialOutcomeEnvelope(invalidFixtures.commercialUnknownOutcome), false)
  assert.equal(isActivationRequest(invalidFixtures.activationWithPayment), false)
  assert.equal(isRecyclingRequest(invalidFixtures.recyclingUnknownReason), false)
  assert.equal(isLiNKautoworkEventEnvelope(invalidFixtures.eventUnknownName), false)
  assert.equal(isEvidenceReceipt(invalidFixtures.evidenceBadChecksum), false)
})

