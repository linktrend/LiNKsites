/**
 * Production research intake is accepted only as a LiNKautowork-signed
 * `lead.research.ready` event.  The full canonical package is inside that
 * signed envelope, so a valid signature cannot be paired with substituted
 * lead research over HTTP. Duplicate and late deliveries return the original
 * durable intake result.
 */
import type { GatewayRequest } from '@linksites/autowork-boundary'
import { CanonicalIntakeBoundary, type CanonicalIntakeRecord } from '@linksites/autowork-boundary'
import { LiNKautoworkGateway } from '@linksites/autowork-boundary'
import { PostgresWorkIntakePort } from './postgres-runtime.ts'

export class LeadResearchIngress {
  private readonly boundary: CanonicalIntakeBoundary
  private readonly expectedOrgId: string
  constructor(private readonly gateway: LiNKautoworkGateway, intake: PostgresWorkIntakePort, expectedOrgId: string) {
    this.expectedOrgId = expectedOrgId
    this.boundary = new CanonicalIntakeBoundary({
      persist: async (lead) => {
        const result = await intake.submit(lead)
        return { itemId: result.itemId, replay: result.replay, lead: result.lead }
      },
    }, expectedOrgId)
  }

  async accept(request: GatewayRequest): Promise<CanonicalIntakeRecord> {
    return this.boundary.acceptSigned(request, this.gateway, this.expectedOrgId)
  }
}
