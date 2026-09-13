import { isDemoCompletionEnvelope, isLeadResearchPackage, type DemoCompletionEnvelope, type LeadResearchPackage, type LiNKautoworkEventEnvelope } from '../../types/src/runtime-contracts.ts'
import type { GatewayRequest } from './index.ts'

export type CanonicalIntakeSource = 'manual-file' | 'signed-gateway'

export type CanonicalIntakeRecord = {
  readonly itemId: string
  readonly replay: boolean
  readonly source: CanonicalIntakeSource
  readonly lead: LeadResearchPackage
  readonly correlationId: string
  readonly idempotencyKey: string
}

export type CanonicalIntakePersister = {
  persist(lead: LeadResearchPackage): Promise<{ itemId: string; replay: boolean; lead: LeadResearchPackage }>
}

export type SignedIntakeVerifier = {
  verify(request: GatewayRequest): LiNKautoworkEventEnvelope
}

export type CanonicalCompletionDecision =
  | { readonly authority: 'linksites'; readonly accepted: true; readonly envelope: DemoCompletionEnvelope; readonly replay: boolean }
  | { readonly authority: 'linksites'; readonly accepted: false; readonly reason: string }

export class CanonicalBoundaryError extends Error {
  readonly code: string
  constructor(code: string, message = code) {
    super(message)
    this.name = 'CanonicalBoundaryError'
    this.code = code
  }
}

export const assertCanonicalLead = (value: unknown, expectedOrgId?: string): LeadResearchPackage => {
  if (!isLeadResearchPackage(value)) throw new CanonicalBoundaryError('invalid_canonical_lead')
  if (expectedOrgId && value.org_id !== expectedOrgId) throw new CanonicalBoundaryError('tenant_isolation')
  return value
}

export const canonicalLeadFromSignedEvent = (event: LiNKautoworkEventEnvelope, expectedOrgId?: string): LeadResearchPackage => {
  if (event.event_name !== 'lead.research.ready' || event.acknowledgement.status !== 'pending') {
    throw new CanonicalBoundaryError('unauthorized_event', 'signed intake accepts only a pending lead.research.ready event')
  }
  const lead = event.payload.lead_research
  if (!lead || lead.org_id !== event.org_id || lead.lead_id !== event.payload.lead_id || lead.correlation_id !== event.correlation_id || lead.idempotency_key !== event.idempotency_key) {
    throw new CanonicalBoundaryError('signed_package_binding_mismatch')
  }
  return assertCanonicalLead(lead, expectedOrgId ?? event.org_id)
}

const intakeItemId = (lead: LeadResearchPackage): string => `intake:${lead.org_id}:${lead.idempotency_key}`

export class CanonicalIntakeBoundary {
  private readonly persister: CanonicalIntakePersister
  private readonly expectedOrgId?: string
  constructor(persister: CanonicalIntakePersister, expectedOrgId?: string) {
    this.persister = persister
    this.expectedOrgId = expectedOrgId
  }

  async acceptManual(lead: unknown): Promise<CanonicalIntakeRecord> {
    const canonical = assertCanonicalLead(lead, this.expectedOrgId)
    const persisted = await this.persister.persist(canonical)
    return {
      itemId: persisted.itemId || intakeItemId(canonical),
      replay: persisted.replay,
      source: 'manual-file',
      lead: persisted.lead,
      correlationId: canonical.correlation_id,
      idempotencyKey: canonical.idempotency_key,
    }
  }

  async acceptSigned(request: GatewayRequest, verifier: SignedIntakeVerifier, expectedOrgId: string): Promise<CanonicalIntakeRecord> {
    if (request.envelope.org_id !== expectedOrgId) throw new CanonicalBoundaryError('tenant_isolation')
    const event = verifier.verify(request)
    const lead = canonicalLeadFromSignedEvent(event, expectedOrgId)
    const persisted = await this.persister.persist(lead)
    return {
      itemId: persisted.itemId || intakeItemId(lead),
      replay: persisted.replay,
      source: 'signed-gateway',
      lead: persisted.lead,
      correlationId: lead.correlation_id,
      idempotencyKey: lead.idempotency_key,
    }
  }
}

export type CompletionStore = {
  read(idempotencyKey: string): Promise<DemoCompletionEnvelope | null>
  write(envelope: DemoCompletionEnvelope): Promise<void>
}

/** Only the LiNKsites completion boundary may accept a website completion. */
export class LinksitesCompletionBoundary {
  private readonly store: CompletionStore
  constructor(store: CompletionStore) {
    this.store = store
  }

  async accept(envelope: unknown): Promise<CanonicalCompletionDecision> {
    if (!isDemoCompletionEnvelope(envelope)) return { authority: 'linksites', accepted: false, reason: 'invalid_completion_envelope' }
    const existing = await this.store.read(envelope.idempotency_key)
    if (existing) {
      if (JSON.stringify(existing) !== JSON.stringify(envelope) && existing.status === 'completed') {
        return { authority: 'linksites', accepted: true, envelope: existing, replay: true }
      }
      return { authority: 'linksites', accepted: true, envelope: existing, replay: true }
    }
    await this.store.write(envelope)
    return { authority: 'linksites', accepted: true, envelope, replay: false }
  }

  rejectProviderReceipt(receipt: { requestId?: string; state?: string } | null | undefined): never {
    throw new CanonicalBoundaryError(
      'autowork_receipt_is_not_linksites_completion',
      `LiNKautowork receipt ${receipt?.requestId ?? 'unknown'} cannot mutate Program gates or claim website completion`,
    )
  }
}

export class MemoryCompletionStore implements CompletionStore {
  private readonly items = new Map<string, DemoCompletionEnvelope>()
  async read(idempotencyKey: string): Promise<DemoCompletionEnvelope | null> { return this.items.get(idempotencyKey) ?? null }
  async write(envelope: DemoCompletionEnvelope): Promise<void> { this.items.set(envelope.idempotency_key, envelope) }
}

export class MemoryLeadPersister implements CanonicalIntakePersister {
  private readonly items = new Map<string, { itemId: string; lead: LeadResearchPackage }>()
  async persist(lead: LeadResearchPackage): Promise<{ itemId: string; replay: boolean; lead: LeadResearchPackage }> {
    const itemId = intakeItemId(lead)
    const existing = this.items.get(lead.idempotency_key)
    if (existing) return { itemId: existing.itemId, replay: true, lead: existing.lead }
    this.items.set(lead.idempotency_key, { itemId, lead })
    return { itemId, replay: false, lead }
  }
}
