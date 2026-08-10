import { createLocalConfig } from '../../src/composition.ts'
import { DurableLedger } from '../../src/durable-store.ts'
import type { LeadResearchPackage } from '@linksites/types'

const input = JSON.parse(process.env.LINKSITES_TEST_RACE_CLAIM_INPUT ?? '') as {
  directory: string
  workerId: string
  lead: LeadResearchPackage
}
const config = createLocalConfig(input.directory, 'local-org')
const ledger = new DurableLedger({ ...config, workerId: input.workerId })
await ledger.createOrResume(input.lead)
const claim = await ledger.claim('lead-research')
process.stdout.write(claim ? claim.run.runId : 'none')
