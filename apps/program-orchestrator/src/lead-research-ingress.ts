/**
 * Production research intake is accepted only as a LiNKautowork-signed
 * `lead.research.ready` event.  The full canonical package is inside that
 * signed envelope, so a valid signature cannot be paired with substituted
 * lead research over HTTP.
 */
import type { LeadResearchPackage } from '@linksites/types'
import type { GatewayRequest } from '@linksites/autowork-boundary'
import { LiNKautoworkGateway } from '@linksites/autowork-boundary'
import { PostgresWorkIntakePort } from './postgres-runtime.ts'

export class LeadResearchIngress {
  constructor(private readonly gateway: LiNKautoworkGateway, private readonly intake: PostgresWorkIntakePort) {}

  async accept(request: GatewayRequest): Promise<{ itemId: string; accepted: boolean }> {
    const event = this.gateway.verify(request)
    if (event.event_name !== 'lead.research.ready' || event.acknowledgement.status !== 'pending') {
      throw new Error('lead research ingress accepts only a verified pending lead.research.ready event')
    }
    const lead = event.payload.lead_research
    if (!lead || lead.org_id !== event.org_id || lead.lead_id !== event.payload.lead_id || lead.correlation_id !== event.correlation_id || lead.idempotency_key !== event.idempotency_key) {
      throw new Error('lead research intake event does not bind its canonical package to the signed event')
    }
    return this.intake.submit(lead as LeadResearchPackage)
  }
}
