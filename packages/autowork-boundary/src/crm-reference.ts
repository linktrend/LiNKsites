import { isLeadResearchPackage, isDemoCompletionEnvelope, type DemoCompletionEnvelope, type LeadResearchPackage } from '../../types/src/runtime-contracts.ts'
import type { CrmClaimPort, CrmCompletionPort, CrmPullPort } from './index.ts'

/** Reference-only mapping harness. Vendor-specific field names stop at this adapter. */
export type ReferenceCrmRecord = {
  id: string
  organizationId: string
  siteId: string
  email?: string
  customFields?: Record<string, unknown>
}

export const mapReferenceCrmLead = (record: ReferenceCrmRecord): LeadResearchPackage => {
  const envelope: LeadResearchPackage = {
    schema_version: { major: 1, minor: 0 },
    org_id: record.organizationId,
    correlation_id: `crm:${record.id}`,
    idempotency_key: `lead:${record.id}`,
    lead_id: record.id,
    research: { summary: 'Reference CRM mapping fixture', sources: ['crm:reference'] },
    requested_vertical: typeof record.customFields?.vertical === 'string' ? record.customFields.vertical : 'unknown',
    source: 'crm:reference',
  }
  if (!isLeadResearchPackage(envelope)) throw new Error('reference CRM mapping produced an invalid canonical envelope')
  return envelope
}

export type ReferenceCompletion = DemoCompletionEnvelope

/**
 * Vendor-neutral reference adapter. It deliberately exposes the same ports as
 * the production boundary: pull, idempotent claim, and canonical completion.
 * The in-memory store is only a deterministic local fixture; no vendor SDK or
 * vendor field crosses the canonical boundary.
 */
export class ReferenceCrmAdapter implements CrmPullPort, CrmClaimPort, CrmCompletionPort {
  private readonly ready: ReferenceCrmRecord[]
  private readonly claims = new Map<string, string>()
  private readonly completions = new Map<string, string>()
  constructor(records: readonly ReferenceCrmRecord[]) { this.ready = records.map((record) => ({ ...record, customFields: { ...record.customFields } })) }
  async pullReady(limit: number, _nowIso: string): Promise<readonly { itemId: string; envelope: LeadResearchPackage }[]> {
    return this.ready.filter((record) => !this.claims.has(record.id)).slice(0, limit).map((record) => ({ itemId: record.id, envelope: mapReferenceCrmLead(record) }))
  }
  async claim(itemId: string, leadId: string, idempotencyKey: string, _nowIso: string): Promise<{ itemId: string; claimId: string } | null> {
    const record = this.ready.find((candidate) => candidate.id === itemId)
    const envelope = record ? mapReferenceCrmLead(record) : null
    if (!envelope || envelope.lead_id !== leadId || envelope.idempotency_key !== idempotencyKey) return null
    const current = this.claims.get(itemId)
    if (current) return current === idempotencyKey ? { itemId, claimId: `claim:${itemId}` } : null
    this.claims.set(itemId, idempotencyKey)
    return { itemId, claimId: `claim:${itemId}` }
  }
  async write(envelope: ReferenceCompletion): Promise<void> {
    if (!isDemoCompletionEnvelope(envelope)) throw new Error('completion is not canonical')
    const prior = this.completions.get(envelope.idempotency_key)
    const serialized = JSON.stringify(envelope)
    if (prior && prior !== serialized) throw new Error('completion idempotency conflict')
    this.completions.set(envelope.idempotency_key, serialized)
  }
  completionCount(): number { return this.completions.size }
  completionBytes(idempotencyKey: string): string | undefined { return this.completions.get(idempotencyKey) }
}
