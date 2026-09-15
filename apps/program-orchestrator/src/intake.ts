import { FileWorkIntakePort } from '@linksites/intake-orchestrator'
import { CanonicalIntakeBoundary, assertCanonicalLead, type CanonicalIntakeRecord, type GatewayRequest } from '@linksites/autowork-boundary'
import { isLeadResearchPackage } from '../../../packages/types/src/runtime-contracts.ts'
import type { LeadResearchPackage } from '@linksites/types'
import type { Composition } from './composition.ts'

type DurableIntakeSubmit = {
  submit(lead: LeadResearchPackage): Promise<{ itemId: string; replay: boolean; lead: LeadResearchPackage }>
}

function hasSubmit(intake: Composition['intake']): intake is Composition['intake'] & DurableIntakeSubmit {
  return typeof (intake as unknown as DurableIntakeSubmit).submit === 'function'
}

/**
 * Manual NDJSON is an adapter for the shared WorkIntakePort. It does not
 * create a second orchestration path or bypass the durable Program runtime.
 */
export { FileWorkIntakePort }

export function templateDependentOperationsEnabled(): boolean {
  return process.env.LINKSITES_W2_04_LOCAL_PROOF === '1' ||
    process.env.LINKSITES_LOCAL_COMPOSE_PROOF === '1' ||
    process.env.LINKSITES_DEPLOYMENT_ENV !== 'production' ||
    process.env.LINKSITES_TEMPLATE_RELEASE_STATE === 'ready'
}

export async function persistCanonicalManualLead(composition: Composition, lead: LeadResearchPackage): Promise<CanonicalIntakeRecord> {
  const canonical = assertCanonicalLead(lead, composition.config.orgId)
  const boundary = new CanonicalIntakeBoundary({
    persist: async (value) => {
      if (hasSubmit(composition.intake)) {
        const result = await composition.intake.submit(value)
        return { itemId: result.itemId, replay: result.replay, lead: result.lead }
      }
      const { appendFile } = await import('node:fs/promises')
      await appendFile(composition.config.intakePath, `${JSON.stringify(value)}\n`, 'utf8')
      return { itemId: `intake:${value.org_id}:${value.idempotency_key}`, replay: false, lead: value }
    },
  }, composition.config.orgId)
  return boundary.acceptManual(canonical)
}

export async function acceptSignedGatewayIntake(composition: Composition, request: GatewayRequest): Promise<CanonicalIntakeRecord> {
  if (!composition.leadResearchIngress) throw new Error('signed gateway intake is unavailable')
  return composition.leadResearchIngress.accept(request)
}

export async function runFirstReadyLead(composition: Composition): Promise<LeadResearchPackage | null> {
  // Keep Server03 health/readiness available while a template release is
  // deferred, but do not pull or claim work that would render or publish a
  // site. The ready-state preflight is the separate admission gate.
  if (!templateDependentOperationsEnabled()) return null
  const items = await composition.intake.pullReady(1, new Date().toISOString())
  const item = items[0]
  if (!item) return null
  if (!isLeadResearchPackage(item.envelope)) {
    // A malformed legacy/CRM row must never poison the queue head forever.
    // The durable adapter records a terminal rejection before the next poll.
    await composition.intake.reject(item.itemId, 'lead:canonical-contract-invalid')
    return null
  }
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
