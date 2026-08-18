/**
 * W2-06 ingress is deliberately downstream of the W2-05 gateway verifier.
 * It accepts a signed transport request, verifies it itself, then persists
 * only the verifier-returned envelope.  A caller cannot forge trust with a
 * `verifiedBy` string or a structurally plausible signature field.
 */
import type { CommercialOutcomeEnvelope, LiNKautoworkEventEnvelope } from '@linksites/types'
import type { GatewayRequest } from '@linksites/autowork-boundary'
import { LifecycleError, SiteLifecycleService, type LifecycleRecord } from '@linksites/factory-catalog'
import type { LiNKreachAuthorizationVerifier } from '@linksites/factory-catalog'

export interface CommercialOutcomeAuthenticityVerifier {
  verify(request: GatewayRequest): LiNKautoworkEventEnvelope
}

/**
 * Bridges a just-verified W2-05 signature to the lifecycle's existing
 * LiNKreach authorization port.  A grant is scoped to one canonical outcome,
 * never supplied by HTTP input, and is removed after persistence.  Activation
 * remains delegated to an explicitly supplied LiNKreach verifier.
 */
export class VerifiedGatewayOutcomeAuthorization implements LiNKreachAuthorizationVerifier {
  private readonly grants = new Set<string>()
  constructor(private readonly activationAuthorization?: LiNKreachAuthorizationVerifier) {}

  private key(input: { orgId: string; leadId: string; siteId: string; reference: string }): string {
    return `${input.orgId}\u0000${input.leadId}\u0000${input.siteId}\u0000${input.reference}`
  }
  grant(envelope: CommercialOutcomeEnvelope): void {
    this.grants.add(this.key({ orgId: envelope.org_id, leadId: envelope.lead_id, siteId: envelope.site_id, reference: envelope.reach_authorization_reference }))
  }
  revoke(envelope: CommercialOutcomeEnvelope): void {
    this.grants.delete(this.key({ orgId: envelope.org_id, leadId: envelope.lead_id, siteId: envelope.site_id, reference: envelope.reach_authorization_reference }))
  }
  async verify(input: { orgId: string; leadId: string; siteId: string; reference: string; capability: 'outcome' | 'activation' }): Promise<boolean> {
    if (input.capability === 'outcome') return this.grants.has(this.key(input))
    return this.activationAuthorization?.verify(input) ?? false
  }
}

const required = (payload: Record<string, string | number | boolean> | undefined, fieldName: string): string => {
  const value = payload?.[fieldName]
  if (typeof value !== 'string' || !value.trim()) throw new LifecycleError(`W2-05 commercial outcome event is missing ${fieldName}.`)
  return value
}

export class CommercialOutcomeIngress {
  constructor(private readonly lifecycle: SiteLifecycleService, private readonly verifier: CommercialOutcomeAuthenticityVerifier, private readonly authorization: VerifiedGatewayOutcomeAuthorization) {}

  async accept(request: GatewayRequest): Promise<LifecycleRecord> {
    // This call performs the actual HMAC, key-id, freshness, nonce replay and
    // event-grant checks supplied by W2-05. Do not replace it with a marker.
    const verified = this.verifier.verify(request)
    // The external transport may only submit a signed *pending* event.  This
    // boundary owns the transition to accepted after W2-05 verification; a
    // caller-supplied acknowledgement is never treated as authority.
    if (verified.event_name !== 'commercial.outcome.recorded' || verified.acknowledgement.status !== 'pending') {
      throw new LifecycleError('Commercial outcome ingress accepts only a W2-05 verified pending commercial.outcome.recorded event.')
    }
    const event: LiNKautoworkEventEnvelope = {
      ...verified,
      acknowledgement: { status: 'accepted', acknowledged_at: new Date().toISOString() },
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
    this.authorization.grant(canonical)
    try {
      return await this.lifecycle.recordOutcome(canonical)
    } finally {
      this.authorization.revoke(canonical)
    }
  }
}
