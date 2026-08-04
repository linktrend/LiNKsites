import type {
  ActivationRequest,
  CommercialOutcomeEnvelope,
  DemoCompletionEnvelope,
  EvidenceReceipt,
  LeadResearchPackage,
  LiNKautoworkEventEnvelope,
  RecyclingRequest,
} from '../src/runtime-contracts'

export const manualFirstTestLead: LeadResearchPackage = {
  schema_version: { major: 1, minor: 0 },
  org_id: 'org_demo',
  correlation_id: 'corr_lead_001',
  idempotency_key: 'lead:demo-example:research:v1',
  lead_id: 'lead_demo_example',
  research: {
    summary: 'A local service business that needs a clearer conversion path.',
    sources: ['https://example.test/research/demo-example'],
  },
  requested_vertical: 'professional-services',
  source: 'manual-first-test',
}

export const crmPortLead: LeadResearchPackage = {
  schema_version: { major: 1, minor: 0 },
  org_id: 'org_demo',
  correlation_id: 'corr_lead_001',
  idempotency_key: 'lead:demo-example:research:v1',
  lead_id: 'lead_demo_example',
  research: {
    summary: 'A local service business that needs a clearer conversion path.',
    sources: ['https://example.test/research/demo-example'],
  },
  requested_vertical: 'professional-services',
  source: 'manual-first-test',
}

export const validDemoCompletion: DemoCompletionEnvelope = {
  ...manualFirstTestLead,
  site_id: 'site_demo_example',
  private_preview_url: 'https://preview.example.test/site_demo_example',
  status: 'completed',
  artifact_revision: 'artifact-sha-001',
  library_revision: 'library-sha-001',
  content_revision: 'content-sha-001',
  evidence_references: ['evidence://run/demo-complete'],
  started_at: '2026-08-04T00:00:00.000Z',
  completed_at: '2026-08-04T00:05:00.000Z',
}

export const validCommercialOutcome: CommercialOutcomeEnvelope = {
  ...manualFirstTestLead,
  site_id: 'site_demo_example',
  outcome: 'sold',
  reach_authorization_reference: 'reach-auth-001',
  replay_protection: { event_id: 'commercial-event-001', nonce: 'nonce-001' },
  recorded_at: '2026-08-04T00:10:00.000Z',
}

export const validActivationRequest: ActivationRequest = {
  ...manualFirstTestLead,
  site_id: 'site_demo_example',
  reach_authorization_reference: 'reach-auth-001',
  publication: {
    domain: 'customer.example.com',
    environment: 'production',
    requested_at: '2026-08-04T00:15:00.000Z',
  },
}

export const validRecyclingRequest: RecyclingRequest = {
  ...manualFirstTestLead,
  site_id: 'site_demo_example',
  template_inventory_id: 'template-inventory-001',
  reason: 'no_sale',
  requested_at: '2026-08-04T00:20:00.000Z',
}

export const validLiNKautoworkEvent: LiNKautoworkEventEnvelope = {
  ...manualFirstTestLead,
  event_id: 'event-001',
  event_name: 'demo.completed',
  payload: { lead_id: 'lead_demo_example', site_id: 'site_demo_example' },
  signature: {
    algorithm: 'hmac-sha256',
    key_id: 'key-001',
    signature: 'signature-001',
  },
  delivery_attempt: 1,
  acknowledgement: { status: 'accepted', acknowledged_at: '2026-08-04T00:21:00.000Z' },
}

export const validEvidenceReceipt: EvidenceReceipt = {
  ...manualFirstTestLead,
  receipt_id: 'receipt-001',
  producer: 'linksites.executor',
  subject: { type: 'site', id: 'site_demo_example' },
  checksum: {
    algorithm: 'sha256',
    value: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  },
  revision_sha: 'commit-sha-001',
  storage_location: 'evidence://run/demo-complete/receipt.json',
  gate_association: 'W1-01-001',
  timestamp: '2026-08-04T00:22:00.000Z',
}

export const invalidFixtures: Record<string, unknown> = {
  leadMissingOrg: { ...manualFirstTestLead, org_id: '' },
  demoWithoutEvidence: { ...validDemoCompletion, evidence_references: [] },
  commercialUnknownOutcome: { ...validCommercialOutcome, outcome: 'pending' },
  activationWithPayment: { ...validActivationRequest, payment_intent: 'pi_secret' },
  recyclingUnknownReason: { ...validRecyclingRequest, reason: 'sold' },
  eventUnknownName: { ...validLiNKautoworkEvent, event_name: 'unknown.event' },
  evidenceBadChecksum: {
    ...validEvidenceReceipt,
    checksum: { ...validEvidenceReceipt.checksum, value: 'not-a-sha256' },
  },
}
