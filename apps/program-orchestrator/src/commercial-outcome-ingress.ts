/**
 * W2-06 ingress is deliberately downstream of the W2-05 gateway verifier.
 * It accepts a signed transport request, verifies it itself, then persists
 * only the verifier-returned envelope.  A caller cannot forge trust with a
 * `verifiedBy` string or a structurally plausible signature field.
 */
import type { CommercialOutcomeEnvelope, LiNKautoworkEventEnvelope } from '@linksites/types'
import type { GatewayRequest } from '@linksites/autowork-boundary'
import { LifecycleError, SiteLifecycleService, type LifecycleRecord } from '@linksites/factory-catalog'

export interface CommercialOutcomeAuthenticityVerifier {
  verify(request: GatewayRequest): LiNKautoworkEventEnvelope
}

const required = (payload: Record<string, string | number | boolean> | undefined, key: string): string => {
  const value = payload?.[key]
  if (typeof value !== 'string' || !value.trim()) throw new LifecycleError(`W2-05 commercial outcome event is missing ${key}.`)
  return value
}

export class CommercialOutcomeIngress {
  constructor(private readonly lifecycle: SiteLifecycleService, private readonly verifier: CommercialOutcomeAuthenticityVerifier) {}

  async accept(request: GatewayRequest): Promise<LifecycleRecord> {
    // This call performs the actual HMAC, key-id, freshness, nonce replay and
    // event-grant checks supplied by W2-05. Do not replace it with a marker.
    const event = this.verifier.verify(request)
    if (event.event_name !== 'commercial.outcome.recorded' || event.acknowledgement.status !== 'accepted') {
      throw new LifecycleError('Commercial outcome ingress accepts only W2-05 verified and accepted commercial.outcome.recorded events.')
    }
    const submission = event.payload.submission
    const outcome = required(submission, 'outcome')
    if (!['sold', 'no_sale', 'deferred', 'abandoned'].includes(outcome)) throw new LifecycleError('W2-05 commercial outcome has an invalid outcome.')
    const canonical: CommercialOutcomeEnvelope = {
      schema_version: event.schema_version, org_id: event.org_id, correlation_id: event.correlation_id, idempotency_key: event.idempotency_key,
      lead_id: event.payload.lead_id, site_id: event.payload.site_id, outcome: outcome as CommercialOutcomeEnvelope['outcome'],
      reach_authorization_reference: required(submission, 'reach_authorization_reference'),
      replay_protection: { event_id: required(submission, 'outcome_event_id'), nonce: required(submission, 'outcome_nonce') },
      recorded_at: required(submission, 'recorded_at'),
    }
    return this.lifecycle.recordOutcome(canonical)
  }
}
