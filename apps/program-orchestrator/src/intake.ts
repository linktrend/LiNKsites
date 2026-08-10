import { FileWorkIntakePort } from '@linksites/intake-orchestrator'
import { isLeadResearchPackage } from '../../../packages/types/src/runtime-contracts.ts'
import type { LeadResearchPackage } from '@linksites/types'
import type { Composition } from './composition.ts'

/**
 * Manual NDJSON is an adapter for the shared WorkIntakePort. It does not
 * create a second orchestration path or bypass the durable Program runtime.
 */
export { FileWorkIntakePort }

export async function runFirstReadyLead(composition: Composition): Promise<LeadResearchPackage | null> {
  const items = await composition.intake.pullReady(1, new Date().toISOString())
  const item = items[0]
  if (!item) return null
  if (!isLeadResearchPackage(item.envelope)) throw new Error('W2-02 manual intake item is invalid')
  const claim = await composition.intake.claim(item.itemId, item.envelope.lead_id, item.envelope.idempotency_key, new Date().toISOString())
  if (!claim) throw new Error('W2-02 manual intake claim was not acquired')
  try {
    await composition.runtime.runLead(item.envelope)
    await composition.intake.acknowledge(item.itemId, { state: 'program_started', claimId: claim.claimId })
  } catch (error) {
    const health = await composition.runtime.health()
    const reasonCode = error instanceof Error ? error.message.split(':').slice(0, 2).join(':') : 'program:retry-required'
    await composition.intake.acknowledge(item.itemId, { state: health.programState === 'manual_attention' ? 'program_manual_attention' : 'program_retry_scheduled', reasonCode, nextAttemptAt: new Date(Date.now() + 1).toISOString(), claimId: claim.claimId })
    throw error
  }
  return item.envelope
}
