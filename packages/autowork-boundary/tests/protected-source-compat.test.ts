import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import {
  CanonicalIntakeBoundary,
  LiNKautoworkGateway,
  LiveModeError,
  MemoryLeadPersister,
  admitLinksitesConsumerRegistration,
  inspectCopiedPaciVerifierSource,
  parseLiveAutoworkHandoff,
  resolveLiveModeFromEnv,
} from '../src/index.ts'
import { manualFirstTestLead } from '../../types/fixtures/w1-01-contract-fixtures.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..')
const platformCommit = '91388934b226a61cfa7be0fe5e271846ee55206f'
const autoworkCommit = 'd5c626ba7e1bdbf783dc8df1654e33e0b70b873c'
const platform = (...parts: string[]) => join(root, 'docs/end-to-end-delivery/upstreams/linkplatform', platformCommit, ...parts)
const autowork = (...parts: string[]) => join(root, 'docs/end-to-end-delivery/upstreams/linkautowork', autoworkCommit, ...parts)
const clock = { nowSeconds: () => 1_000, nowIso: () => '1970-01-01T00:16:40.000Z' }
const grant = {
  organisationId: '00000000-0000-4000-8000-000000000147',
  environment: 'development' as const,
  eventGrants: ['linkautowork.v1.execution.succeeded', 'linkautowork.v1.execution.failed'] as const,
  signingKeyRef: 'LINKTREND_SITES_DEV_AUTOWORK_SIGNING_KEY',
}
const registration = {
  contract_version: 'linksites-consumer-registration.v1',
  organisation_id: grant.organisationId,
  environment: 'development',
  event_grants: ['linkautowork.v1.execution.succeeded'],
  signing_key_ref: grant.signingKeyRef,
  private_endpoint: 'https://10.8.0.21/v1/autowork/events',
}

test('protected Platform claims fixtures are synthetic and fail closed for the LiNKsites live audience', async () => {
  const accept = JSON.parse(await readFile(platform('packages/contracts/fixtures/claims/accept-valid.json'), 'utf8')) as { claims: { audience: string[]; issuer: string; claimContractVersion: string } }
  const rejectAudience = JSON.parse(await readFile(platform('packages/contracts/fixtures/claims/reject-wrong-audience.json'), 'utf8')) as { expect: string }
  assert.equal(accept.claims.claimContractVersion, 'platform.auth-claims/1.1.0')
  assert.deepEqual(accept.claims.audience, ['lbrain-api'])
  assert.equal(accept.claims.issuer, 'linkplatform-issuer')
  assert.equal(rejectAudience.expect, 'reject')
  assert.throws(
    () => parseLiveAutoworkHandoff({
      endpoint: 'https://10.8.0.21/v1/events',
      issuer: accept.claims.issuer,
      audience: accept.claims.audience[0],
      claimContractVersion: accept.claims.claimContractVersion,
      receiptContract: '2026-08-13.v1',
      environment: 'development',
      orgId: 'org_demo',
      signingKeyRef: 'cms-test',
      grants: [{ eventName: 'demo.completed', environments: ['development'], orgIds: ['org_demo'] }],
    }),
    /invalid_audience/,
  )
})

test('protected Autowork consumer-registration source admits sanitized fixtures and fail-closes public endpoints', async () => {
  const source = await readFile(autowork('packages/automation-contracts/src/linksites-consumer-registration.ts'), 'utf8')
  assert.match(source, /linksites-consumer-registration\.v1/)
  const admitted = admitLinksitesConsumerRegistration(registration, grant)
  assert.deepEqual(admitted.private_endpoint, { scheme: 'https', host: '10.8.0.21', path: '/v1/autowork/events' })
  assert.throws(() => admitLinksitesConsumerRegistration({ ...registration, organisation_id: '00000000-0000-4000-8000-000000000148' }, grant), /organisation is not granted/)
  assert.throws(() => admitLinksitesConsumerRegistration({ ...registration, environment: 'production' }, grant), /environment is not granted/)
  assert.throws(() => admitLinksitesConsumerRegistration({ ...registration, event_grants: ['linkautowork.v1.lifecycle.transition'] }, grant), /event is not granted/)
  assert.throws(() => admitLinksitesConsumerRegistration({ ...registration, private_endpoint: 'https://example.com/hooks' }, grant), /public host/)
  const { signing_key_ref: _omit, ...withoutRef } = registration
  assert.throws(() => admitLinksitesConsumerRegistration(withoutRef, grant), /signing-key reference is required/)
})

test('copied production PACI ES256/JWKS verifier is fail-closed source, not a live JWKS call', async () => {
  const source = await readFile(autowork('gateway/src/middleware/auth.ts'), 'utf8')
  const finding = inspectCopiedPaciVerifierSource(source)
  assert.equal(finding.liveJwksCalled, false)
  assert.equal(finding.productionRequiresEs256AndKid, true)
  assert.equal(finding.missingJwksFailsClosed503, true)
})

test('signed-gateway intake, scope, and fail-closed live health stay on sanitized fixtures without hosted calls', async () => {
  const persister = new MemoryLeadPersister()
  const boundary = new CanonicalIntakeBoundary(persister, 'org_demo')
  const first = await boundary.acceptManual(manualFirstTestLead)
  const gateway = new LiNKautoworkGateway({
    secret: 'ltfx.auto.secret.canonicalintake.7f3b5aabce84.v1',
    keyId: 'key-1',
    environment: 'development',
    clock,
    transport: async () => { throw new Error('intake must persist before dispatch') },
  })
  const request = gateway.buildRequest('lead.research.ready', 'org_demo', manualFirstTestLead.correlation_id, manualFirstTestLead.idempotency_key, { lead_id: manualFirstTestLead.lead_id, site_id: 'site_demo_example', lead_research: manualFirstTestLead })
  const signed = await boundary.acceptSigned(request, gateway, 'org_demo')
  assert.equal(signed.replay, true)
  assert.equal(signed.itemId, first.itemId)
  await assert.rejects(boundary.acceptSigned({ ...request, envelope: { ...request.envelope, org_id: 'other-org' } }, gateway, 'org_demo'), /tenant_isolation|unauthorized/)
  assert.equal(resolveLiveModeFromEnv({}).enabled, false)
  assert.throws(() => parseLiveAutoworkHandoff({ endpoint: '', issuer: 'linkplatform-issuer', audience: 'linksites', claimContractVersion: 'platform.auth-claims/1.1.0', receiptContract: '2026-08-13.v1', environment: 'development', orgId: 'org_demo', signingKeyRef: 'cms-test', grants: [{ eventName: 'demo.completed', environments: ['development'], orgIds: ['org_demo'] }] }), LiveModeError)
})
