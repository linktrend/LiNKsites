import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { admitLinksitesConsumerRegistration, inspectCopiedPaciVerifierSource, parseLiveAutoworkHandoff, resolveLiveModeFromEnv } from '@linksites/autowork-boundary'
import { triggerLiNKautowork } from '@/payload/utils/autowork'

const root = join(dirname(fileURLToPath(import.meta.url)), '../../../..')
const platformCommit = '91388934b226a61cfa7be0fe5e271846ee55206f'
const autoworkCommit = 'd5c626ba7e1bdbf783dc8df1654e33e0b70b873c'

describe('CMS composition against protected Platform and Autowork source copies', () => {
  const original = { ...process.env }
  afterEach(() => { process.env = { ...original }; vi.restoreAllMocks() })

  it('does not treat synthetic Platform claims as a LiNKsites hosted grant', async () => {
    const accept = JSON.parse(await readFile(join(root, 'docs/end-to-end-delivery/upstreams/linkplatform', platformCommit, 'packages/contracts/fixtures/claims/accept-valid.json'), 'utf8')) as { claims: { audience: string[] } }
    expect(accept.claims.audience).toEqual(['lbrain-api'])
    expect(() => parseLiveAutoworkHandoff({
      endpoint: 'https://10.8.0.21/v1/events',
      issuer: 'linkplatform-issuer',
      audience: accept.claims.audience[0],
      claimContractVersion: 'platform.auth-claims/1.1.0',
      receiptContract: '2026-08-13.v1',
      environment: 'development',
      orgId: 'org_demo',
      signingKeyRef: 'cms-test',
      grants: [{ eventName: 'demo.completed', environments: ['development'], orgIds: ['org_demo'] }],
    })).toThrow(/invalid_audience/)
  })

  it('admits the Autowork source-only consumer fixture and fail-closes live mode without a hosted endpoint', async () => {
    const paci = await readFile(join(root, 'docs/end-to-end-delivery/upstreams/linkautowork', autoworkCommit, 'gateway/src/middleware/auth.ts'), 'utf8')
    expect(inspectCopiedPaciVerifierSource(paci).liveJwksCalled).toBe(false)
    const admitted = admitLinksitesConsumerRegistration({
      contract_version: 'linksites-consumer-registration.v1',
      organisation_id: '00000000-0000-4000-8000-000000000147',
      environment: 'development',
      event_grants: ['linkautowork.v1.execution.succeeded'],
      signing_key_ref: 'LINKTREND_SITES_DEV_AUTOWORK_SIGNING_KEY',
      private_endpoint: 'https://10.8.0.21/v1/autowork/events',
    }, {
      organisationId: '00000000-0000-4000-8000-000000000147',
      environment: 'development',
      eventGrants: ['linkautowork.v1.execution.succeeded'],
      signingKeyRef: 'LINKTREND_SITES_DEV_AUTOWORK_SIGNING_KEY',
    })
    expect(admitted.private_endpoint.host).toBe('10.8.0.21')
    expect(resolveLiveModeFromEnv({}).enabled).toBe(false)
    const fetchMock = vi.spyOn(globalThis, 'fetch')
    const req = { payload: { findByID: vi.fn().mockResolvedValue({ id: 'site-1', orgId: 'org_demo', programId: 'program-1', leadId: 'lead-1' }) } } as never
    await expect(triggerLiNKautowork({ id: 'page-1', collection: 'pages', eventType: 'content_published', site: 'site-1', req }, { readProgramPass: vi.fn().mockResolvedValue({ state: 'PASS', completionId: 'pass-1', programId: 'program-1', orgId: 'org_demo', leadId: 'lead-1', siteId: 'site-1' }) })).rejects.toThrow(/live_autowork_disabled/)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
