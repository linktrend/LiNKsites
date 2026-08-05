import { isLeadResearchPackage, type LeadResearchPackage } from '../../types/src/runtime-contracts.ts'

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
