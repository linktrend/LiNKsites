import { writeFile } from 'node:fs/promises'
import { createLocalConfig, createProductionComposition } from '../../src/composition.ts'
import type { LeadResearchPackage } from '@linksites/types'

const input = JSON.parse(process.env.LINKSITES_TEST_CRASH_CLAIM_INPUT ?? '') as {
  directory: string
  signalPath: string
  lead: LeadResearchPackage
}
const config = createLocalConfig(input.directory, 'local-org')
const composition = await createProductionComposition({
  ...config,
  commercialOutcomeGatewaySecret: 'ltfx.auto.commercialoutcomegatewaysecret.f44ddf6202e5.v1',
  commercialOutcomeGatewayKeyId: 'test-only-outcome-gateway-key',
  payloadBaseUrl: 'http://127.0.0.1:9',
  payloadApiKey: 'ltfx.auto.payloadapikey.2ae6f483cb04.v1',
  payloadSiteId: 'test-site',
  webMasterBaseUrl: 'http://127.0.0.1:9',
  previewAccessToken: 'ltfx.auto.previewaccesstoken.66d0db4625a9.v1',
  leaseDurationMs: 50,
  workerId: 'crashed-worker',
})
await composition.ledger.createOrResume(input.lead)
const claim = await composition.ledger.claim('lead-research')
if (!claim?.run.lease) throw new Error('claim-not-acquired-or-unleased')
await composition.ledger.saveReceipt('lead-research', 'crash-boundary', { receipt: 'irreversible-before-termination' }, claim.run.runId, claim.run.lease.fencingToken)
await writeFile(input.signalPath, JSON.stringify({ runId: claim.run.runId, fencingToken: claim.run.lease.fencingToken }))
await new Promise(() => undefined)
