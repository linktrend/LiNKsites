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

type ContractValidator = (value: unknown) => boolean

const withTopLevelField = (
  value: object,
  key: string,
  fieldValue: unknown,
): Record<string, unknown> => ({ ...value, [key]: fieldValue })

const withPathValue = (
  value: unknown,
  path: readonly (string | number)[],
  replacement: string,
): unknown => {
  if (path.length === 0) return replacement
  if (Array.isArray(value)) {
    const [head, ...tail] = path
    const next = [...value]
    next[Number(head)] = withPathValue(next[Number(head)], tail, replacement)
    return next
  }

  if (typeof value === 'object' && value !== null) {
    const [head, ...tail] = path
    return {
      ...(value as Record<string, unknown>),
      [String(head)]: withPathValue(
        (value as Record<string, unknown>)[String(head)],
        tail,
        replacement,
      ),
    }
  }

  throw new Error(`Cannot set path ${path.join('.')}`)
}

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

test('all seven validators reject unexpected top-level and schema-version keys', () => {
  const contracts: Array<[string, ContractValidator, object]> = [
    ['lead', isLeadResearchPackage, manualFirstTestLead],
    ['demo', isDemoCompletionEnvelope, validDemoCompletion],
    ['commercial', isCommercialOutcomeEnvelope, validCommercialOutcome],
    ['activation', isActivationRequest, validActivationRequest],
    ['recycling', isRecyclingRequest, validRecyclingRequest],
    ['event', isLiNKautoworkEventEnvelope, validLiNKautoworkEvent],
    ['evidence', isEvidenceReceipt, validEvidenceReceipt],
  ]

  for (const [name, validator, fixture] of contracts) {
    assert.equal(
      validator(withTopLevelField(fixture, 'unexpected', true)),
      false,
      `${name} accepts an unexpected top-level key`,
    )
    assert.equal(
      validator(
        withTopLevelField(fixture, 'schema_version', {
          major: 1,
          minor: 0,
          extra: 1,
        }),
      ),
      false,
      `${name} accepts an unexpected schema_version key`,
    )

    for (const forbiddenKey of [
      'authorization',
      'payment',
      'processor',
      'account_number',
      'secret',
      'credential',
    ]) {
      assert.equal(
        validator(
          withTopLevelField(
            fixture,
            forbiddenKey,
            forbiddenKey === 'authorization' ? 'Bearer secret' : 'redacted',
          ),
        ),
        false,
        `${name} accepts forbidden top-level key ${forbiddenKey}`,
      )
    }
  }
})

test('all nested objects use closed schemas and reject credential or payment material', () => {
  const blockedDemo = {
    ...validDemoCompletion,
    status: 'blocked',
    error: {
      code: 'preview_blocked',
      message: 'Preview is blocked pending correction.',
      retryable: true,
    },
  }

  assert.equal(
    isLeadResearchPackage({
      ...manualFirstTestLead,
      research: { ...manualFirstTestLead.research, authorization: 'Bearer secret' },
    }),
    false,
  )
  assert.equal(
    isDemoCompletionEnvelope({
      ...blockedDemo,
      error: { ...blockedDemo.error, secret: 'credential' },
    }),
    false,
  )
  assert.equal(
    isCommercialOutcomeEnvelope({
      ...validCommercialOutcome,
      replay_protection: {
        ...validCommercialOutcome.replay_protection,
        processor: 'stripe',
      },
    }),
    false,
  )
  assert.equal(
    isActivationRequest({
      ...validActivationRequest,
      publication: {
        ...validActivationRequest.publication,
        account_number: '4111111111111111',
      },
    }),
    false,
  )
  assert.equal(
    isLiNKautoworkEventEnvelope({
      ...validLiNKautoworkEvent,
      payload: {
        ...validLiNKautoworkEvent.payload,
        authorization: 'Bearer secret',
      },
    }),
    false,
  )
  assert.equal(
    isLiNKautoworkEventEnvelope({
      ...validLiNKautoworkEvent,
      signature: { ...validLiNKautoworkEvent.signature, credential: 'secret' },
    }),
    false,
  )
  assert.equal(
    isLiNKautoworkEventEnvelope({
      ...validLiNKautoworkEvent,
      acknowledgement: {
        ...validLiNKautoworkEvent.acknowledgement,
        schema_version: { major: 1, minor: 0 },
      },
    }),
    false,
  )
  assert.equal(
    isEvidenceReceipt({
      ...validEvidenceReceipt,
      subject: { ...validEvidenceReceipt.subject, account_number: '123456789' },
    }),
    false,
  )
  assert.equal(
    isEvidenceReceipt({
      ...validEvidenceReceipt,
      checksum: { ...validEvidenceReceipt.checksum, processor: 'stripe' },
    }),
    false,
  )
})

test('all recursively reachable allowed strings reject embedded sensitive material', () => {
  const blockedDemo = {
    ...validDemoCompletion,
    status: 'blocked',
    error: {
      code: 'preview_blocked',
      message: 'Preview is blocked pending correction.',
      retryable: true,
    },
  }

  const cases: Array<[
    string,
    ContractValidator,
    object,
    readonly (string | number)[],
    string,
  ]> = [
    ['lead summary bearer', isLeadResearchPackage, manualFirstTestLead, ['research', 'summary'], 'Bearer raw-secret'],
    ['lead source query credential', isLeadResearchPackage, manualFirstTestLead, ['research', 'sources', 0], 'https://example.test/?api_key=raw-secret'],
    ['lead id account material', isLeadResearchPackage, manualFirstTestLead, ['lead_id'], 'customer-account-123456789'],
    ['demo preview auth query', isDemoCompletionEnvelope, validDemoCompletion, ['private_preview_url'], 'https://preview.example.test/?authorization=raw-secret'],
    ['demo error code private key', isDemoCompletionEnvelope, blockedDemo, ['error', 'code'], 'private_key=raw-secret'],
    ['demo error message PEM', isDemoCompletionEnvelope, blockedDemo, ['error', 'message'], '-----BEGIN PRIVATE KEY----- raw-secret'],
    ['commercial authorization reference', isCommercialOutcomeEnvelope, validCommercialOutcome, ['reach_authorization_reference'], 'auth_token=raw-secret'],
    ['commercial nonce token', isCommercialOutcomeEnvelope, validCommercialOutcome, ['replay_protection', 'nonce'], 'token: raw-secret'],
    ['activation domain card', isActivationRequest, validActivationRequest, ['publication', 'domain'], 'pay-4111111111111111.example.com'],
    ['activation site id URL credentials', isActivationRequest, validActivationRequest, ['site_id'], 'https://user:password@example.com'],
    ['recycling inventory account', isRecyclingRequest, validRecyclingRequest, ['template_inventory_id'], 'account_number=123456789'],
    ['event payload JWT', isLiNKautoworkEventEnvelope, validLiNKautoworkEvent, ['payload', 'lead_id'], 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.signature'],
    ['event acknowledgement password', isLiNKautoworkEventEnvelope, validLiNKautoworkEvent, ['acknowledgement', 'reason'], 'password=hunter2'],
    ['event signature known token', isLiNKautoworkEventEnvelope, validLiNKautoworkEvent, ['signature', 'signature'], 'ghp_1234567890abcdefghij'],
    ['evidence storage query credential', isEvidenceReceipt, validEvidenceReceipt, ['storage_location'], 'evidence://run/receipt?access_token=raw-secret'],
    ['evidence producer bearer', isEvidenceReceipt, validEvidenceReceipt, ['producer'], 'Bearer raw-secret'],
    ['evidence gate payment reference', isEvidenceReceipt, validEvidenceReceipt, ['gate_association'], 'payment_intent=pi_secret'],
    ['evidence subject card', isEvidenceReceipt, validEvidenceReceipt, ['subject', 'id'], 'card-4111-1111-1111-1111'],
  ]

  for (const [name, validator, fixture, path, sensitiveValue] of cases) {
    assert.equal(
      validator(withPathValue(fixture, path, sensitiveValue)),
      false,
      `${name} was accepted at ${path.join('.')}`,
    )
  }
})

test('ordinary descriptive strings remain valid', () => {
  assert.equal(
    isLeadResearchPackage({
      ...manualFirstTestLead,
      research: {
        ...manualFirstTestLead.research,
        summary: 'The account team reviewed the private preview and payment workflow.',
        sources: ['https://example.test/research?topic=payments'],
      },
      source: 'manual-first-test',
    }),
    true,
  )
  assert.equal(
    isDemoCompletionEnvelope({
      ...validDemoCompletion,
      evidence_references: ['evidence://run/demo-complete'],
    }),
    true,
  )
})

test('every unknown enum value fails closed', () => {
  assert.equal(isDemoCompletionEnvelope({ ...validDemoCompletion, status: 'unknown' }), false)
  assert.equal(
    isCommercialOutcomeEnvelope({ ...validCommercialOutcome, outcome: 'unknown' }),
    false,
  )
  assert.equal(
    isActivationRequest({
      ...validActivationRequest,
      publication: { ...validActivationRequest.publication, environment: 'preview' },
    }),
    false,
  )
  assert.equal(isRecyclingRequest({ ...validRecyclingRequest, reason: 'sold' }), false)
  assert.equal(
    isLiNKautoworkEventEnvelope({ ...validLiNKautoworkEvent, event_name: 'unknown.event' }),
    false,
  )
  assert.equal(
    isLiNKautoworkEventEnvelope({
      ...validLiNKautoworkEvent,
      acknowledgement: { status: 'unknown' },
    }),
    false,
  )
  assert.equal(
    isLiNKautoworkEventEnvelope({
      ...validLiNKautoworkEvent,
      signature: { ...validLiNKautoworkEvent.signature, algorithm: 'rsa' },
    }),
    false,
  )
  assert.equal(
    isEvidenceReceipt({
      ...validEvidenceReceipt,
      subject: { ...validEvidenceReceipt.subject, type: 'organization' },
    }),
    false,
  )
  assert.equal(
    isEvidenceReceipt({
      ...validEvidenceReceipt,
      checksum: { ...validEvidenceReceipt.checksum, algorithm: 'md5' },
    }),
    false,
  )
})

test('every required identifier, organization, and idempotency field is enforced', () => {
  const topLevelRequired: Array<[string, ContractValidator, object, string]> = [
    ['lead_id', isLeadResearchPackage, manualFirstTestLead, 'lead_id'],
    ['demo lead_id', isDemoCompletionEnvelope, validDemoCompletion, 'lead_id'],
    ['demo site_id', isDemoCompletionEnvelope, validDemoCompletion, 'site_id'],
    ['commercial lead_id', isCommercialOutcomeEnvelope, validCommercialOutcome, 'lead_id'],
    ['commercial site_id', isCommercialOutcomeEnvelope, validCommercialOutcome, 'site_id'],
    ['activation lead_id', isActivationRequest, validActivationRequest, 'lead_id'],
    ['activation site_id', isActivationRequest, validActivationRequest, 'site_id'],
    ['recycling lead_id', isRecyclingRequest, validRecyclingRequest, 'lead_id'],
    ['recycling site_id', isRecyclingRequest, validRecyclingRequest, 'site_id'],
    ['event event_id', isLiNKautoworkEventEnvelope, validLiNKautoworkEvent, 'event_id'],
    ['evidence receipt_id', isEvidenceReceipt, validEvidenceReceipt, 'receipt_id'],
  ]

  for (const [name, validator, fixture, field] of topLevelRequired) {
    assert.equal(validator(withTopLevelField(fixture, field, '')), false, `${name} is optional`)
  }

  const metadataRequired: Array<[string, ContractValidator, object]> = [
    ['lead', isLeadResearchPackage, manualFirstTestLead],
    ['demo', isDemoCompletionEnvelope, validDemoCompletion],
    ['commercial', isCommercialOutcomeEnvelope, validCommercialOutcome],
    ['activation', isActivationRequest, validActivationRequest],
    ['recycling', isRecyclingRequest, validRecyclingRequest],
    ['event', isLiNKautoworkEventEnvelope, validLiNKautoworkEvent],
    ['evidence', isEvidenceReceipt, validEvidenceReceipt],
  ]

  for (const [name, validator, fixture] of metadataRequired) {
    for (const field of ['org_id', 'idempotency_key']) {
      assert.equal(
        validator(withTopLevelField(fixture, field, '')),
        false,
        `${name} accepts an empty ${field}`,
      )
    }
  }

  assert.equal(
    isCommercialOutcomeEnvelope({
      ...validCommercialOutcome,
      replay_protection: { ...validCommercialOutcome.replay_protection, event_id: '' },
    }),
    false,
  )
  assert.equal(
    isActivationRequest({
      ...validActivationRequest,
      reach_authorization_reference: '',
    }),
    false,
  )
  assert.equal(
    isRecyclingRequest({ ...validRecyclingRequest, template_inventory_id: '' }),
    false,
  )
  assert.equal(
    isLiNKautoworkEventEnvelope({
      ...validLiNKautoworkEvent,
      payload: { ...validLiNKautoworkEvent.payload, lead_id: '' },
    }),
    false,
  )
  assert.equal(
    isEvidenceReceipt({
      ...validEvidenceReceipt,
      subject: { ...validEvidenceReceipt.subject, id: '' },
    }),
    false,
  )
})

test('revision fields require exact lowercase 40-character Git SHAs', () => {
  for (const field of ['artifact_revision', 'library_revision', 'content_revision']) {
    assert.equal(
      isDemoCompletionEnvelope({ ...validDemoCompletion, [field]: 'a'.repeat(39) }),
      false,
      `${field} accepts a short SHA`,
    )
    assert.equal(
      isDemoCompletionEnvelope({ ...validDemoCompletion, [field]: 'A'.repeat(40) }),
      false,
      `${field} accepts an uppercase SHA`,
    )
    assert.equal(
      isDemoCompletionEnvelope({ ...validDemoCompletion, [field]: 'g'.repeat(40) }),
      false,
      `${field} accepts a non-hex SHA`,
    )
  }

  assert.equal(
    isEvidenceReceipt({ ...validEvidenceReceipt, revision_sha: 'd'.repeat(39) }),
    false,
  )
  assert.equal(
    isEvidenceReceipt({ ...validEvidenceReceipt, revision_sha: 'D'.repeat(40) }),
    false,
  )
  assert.equal(
    isEvidenceReceipt({ ...validEvidenceReceipt, revision_sha: 'g'.repeat(40) }),
    false,
  )
})

test('delivery_attempt is a positive integer, not an arbitrary unknown value', () => {
  assert.equal(
    isLiNKautoworkEventEnvelope({ ...validLiNKautoworkEvent, delivery_attempt: '1' }),
    false,
  )
  assert.equal(
    isLiNKautoworkEventEnvelope({ ...validLiNKautoworkEvent, delivery_attempt: 0 }),
    false,
  )
  assert.equal(
    isLiNKautoworkEventEnvelope({ ...validLiNKautoworkEvent, delivery_attempt: 1.5 }),
    false,
  )
})
