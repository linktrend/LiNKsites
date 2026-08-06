/**
 * W2-06 hand-off from W2-05's governed LiNKautowork ingress.
 *
 * W2-05 verifies the signed envelope.  This module accepts only that already
 * accepted envelope, reconstructs the canonical commercial-outcome contract,
 * and persists it through the durable lifecycle store.  It deliberately does
 * not perform an outbound gateway call, commercial decision, or live action.
 */
import {
  isLiNKautoworkEventEnvelope,
  type CommercialOutcomeEnvelope,
  type LiNKautoworkEventEnvelope,
} from '@linksites/types'
import {
  LifecycleError,
  SiteLifecycleService,
  type LifecycleRecord,
} from '@linksites/factory-catalog'

export type AcceptedW2_05CommercialOutcome = {
  /** The W2-05 gateway must have verified signature/freshness before this call. */
  verifiedBy: 'w2-05-linkautowork-gateway'
  envelope: LiNKautoworkEventEnvelope
}

const required = (payload: Record<string, string | number | boolean> | undefined, key: string): string => {
  const value = payload?.[key]
  if (typeof value !== 'string' || !value.trim()) throw new LifecycleError(`W2-05 commercial outcome event is missing ${key}.`)
  return value
}

export class CommercialOutcomeIngress {
  constructor(private readonly lifecycle: SiteLifecycleService) {}

  async accept(input: AcceptedW2_05CommercialOutcome): Promise<LifecycleRecord> {
    const event = input.envelope
    if (input.verifiedBy !== 'w2-05-linkautowork-gateway' || !isLiNKautoworkEventEnvelope(event) || event.event_name !== 'commercial.outcome.recorded' || event.acknowledgement.status !== 'accepted') {
      throw new LifecycleError('Commercial outcome ingress accepts only W2-05 verified and accepted commercial.outcome.recorded events.')
    }
    const submission = event.payload.submission
    const outcome = required(submission, 'outcome')
    if (!['sold', 'no_sale', 'deferred', 'abandoned'].includes(outcome)) throw new LifecycleError('W2-05 commercial outcome has an invalid outcome.')
    const canonical: CommercialOutcomeEnvelope = {
      schema_version: event.schema_version,
      org_id: event.org_id,
      correlation_id: event.correlation_id,
      idempotency_key: event.idempotency_key,
      lead_id: event.payload.lead_id,
      site_id: event.payload.site_id,
      outcome: outcome as CommercialOutcomeEnvelope['outcome'],
      reach_authorization_reference: required(submission, 'reach_authorization_reference'),
      replay_protection: { event_id: required(submission, 'outcome_event_id'), nonce: required(submission, 'outcome_nonce') },
      recorded_at: required(submission, 'recorded_at'),
    }
    return this.lifecycle.recordOutcome(canonical)
  }
}
