import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { admitLinksitesConsumerRegistration, inspectCopiedPaciVerifierSource, parseLiveAutoworkHandoff } from '@linksites/autowork-boundary'
import { ProgramRuntime } from '../src/runtime.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..')
const autoworkCommit = 'd5c626ba7e1bdbf783dc8df1654e33e0b70b873c'
const platformCommit = '91388934b226a61cfa7be0fe5e271846ee55206f'

test('orchestrator composition keeps Autowork receipts out of Program completion against the bound PACI source', async () => {
  const paci = await readFile(join(root, 'docs/end-to-end-delivery/upstreams/linkautowork', autoworkCommit, 'gateway/src/middleware/auth.ts'), 'utf8')
  assert.equal(inspectCopiedPaciVerifierSource(paci).liveJwksCalled, false)
  assert.throws(
    () => ProgramRuntime.prototype.rejectAutoworkCompletion.call({} as ProgramRuntime, { requestId: 'receipt-protected-source' }),
    /not_linksites_completion/,
  )
})

test('orchestrator fail-closes hosted grants that are only synthetic Platform fixtures', async () => {
  const accept = JSON.parse(await readFile(join(root, 'docs/end-to-end-delivery/upstreams/linkplatform', platformCommit, 'packages/contracts/fixtures/claims/accept-valid.json'), 'utf8')) as { claims: { audience: string[]; issuer: string; claimContractVersion: string } }
  assert.throws(() => parseLiveAutoworkHandoff({
    endpoint: 'https://10.8.0.21/v1/events',
    issuer: accept.claims.issuer,
    audience: accept.claims.audience[0],
    claimContractVersion: accept.claims.claimContractVersion,
    receiptContract: '2026-08-13.v1',
    environment: 'development',
    orgId: 'org_demo',
    signingKeyRef: 'cms-test',
    grants: [{ eventName: 'demo.completed', environments: ['development'], orgIds: ['org_demo'] }],
  }), /invalid_audience/)
  const admitted = admitLinksitesConsumerRegistration({
    contract_version: 'linksites-consumer-registration.v1',
    organisation_id: '00000000-0000-4000-8000-000000000147',
    environment: 'development',
    event_grants: ['linkautowork.v1.execution.succeeded'],
    signing_key_ref: 'LINKTREND_SITES_DEV_AUTOWORK_SIGNING_KEY',
    private_endpoint: 'https://linksites.internal/v1/autowork/events',
  }, {
    organisationId: '00000000-0000-4000-8000-000000000147',
    environment: 'development',
    eventGrants: ['linkautowork.v1.execution.succeeded'],
    signingKeyRef: 'LINKTREND_SITES_DEV_AUTOWORK_SIGNING_KEY',
  })
  assert.equal(admitted.private_endpoint.host, 'linksites.internal')
})
