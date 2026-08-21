import type { PayloadRequest } from 'payload'
import { FileOutbox, LiNKautoworkGateway, parseGatewayEventPolicies, type GatewayEnvironment, type GatewayMetrics, type GatewayRequest } from '@linksites/autowork-boundary'
import { readProgramPassFromLedger } from './programLedger.ts'

export type ProgramPass = { programId: string; orgId: string; leadId: string; siteId: string; state: 'PASS'; completionId: string }
export type ProgramPassReader = (input: { req: PayloadRequest; programId: string; orgId: string; leadId: string; siteId: string }) => Promise<ProgramPass | null>
export type AutoworkEvent = { id: string | number; collection: string; eventType: string; site?: string; locale?: string; req?: PayloadRequest | null }

const environmentNames = new Set<GatewayEnvironment>(['development', 'staging', 'production'])

const gatewayAndQueue = (): { gateway: LiNKautoworkGateway; outbox: FileOutbox } => {
  const gatewayUrl = process.env.LINKAUTOWORK_GATEWAY_URL
  const secret = process.env.LINKAUTOWORK_SIGNING_SECRET
  const keyId = process.env.LINKAUTOWORK_SIGNING_KEY_ID
  const environment = process.env.LINKAUTOWORK_ENVIRONMENT as GatewayEnvironment
  const queuePath = process.env.LINKAUTOWORK_OUTBOX_PATH
  const integrityMaterial = process.env.LINKAUTOWORK_OUTBOX_INTEGRITY_SECRET
  if (!gatewayUrl || !secret || !keyId || !environmentNames.has(environment) || !queuePath || !integrityMaterial) throw new Error('LiNKautowork durable delivery configuration is incomplete')
  const gateway = new LiNKautoworkGateway({ secret, keyId, environment, policies: parseGatewayEventPolicies(process.env.LINKAUTOWORK_EVENT_GRANTS!), transport: async (request) => {
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 3_000)
    try { const response = await fetch(gatewayUrl, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(request), signal: controller.signal }); const acknowledgedAt = response.headers.get('x-linkautowork-acknowledged-at') ?? new Date().toISOString(); return { status: response.status, receiptId: response.headers.get('x-linkautowork-receipt') ?? 'missing', receiptSignature: response.headers.get('x-linkautowork-receipt-signature') ?? 'missing', acknowledgedAt } } finally { clearTimeout(timer) }
  } })
  return { gateway, outbox: new FileOutbox(queuePath, { maxAttempts: 5, metrics: gateway.metrics, integritySecret: integrityMaterial, resigner: (request, attempt) => gateway.resignRequest(request, attempt), validator: (request) => gateway.verifyStored(request) }) }
}

export const triggerLiNKautowork = async (event: AutoworkEvent, dependencies: { readProgramPass?: ProgramPassReader } = {}): Promise<void> => {
  const siteId = typeof event.site === 'string' ? event.site : undefined
  const req = event.req as PayloadRequest | null | undefined
  if (!req || !siteId || !req.payload?.findByID) throw new Error('Payload request, site relationship, and Program PASS reader are required')
  const site = await req.payload.findByID({ collection: 'sites', id: siteId, depth: 0, overrideAccess: false }) as unknown as { id: string | number; orgId?: unknown; programId?: unknown; leadId?: unknown }
  const orgId = typeof site.orgId === 'string' ? site.orgId : undefined
  const programId = typeof site.programId === 'string' ? site.programId : undefined
  const leadId = typeof site.leadId === 'string' ? site.leadId : undefined
  if (!orgId || !programId || !leadId || String(site.id) !== siteId) throw new Error('site must carry canonical org, Program, and lead relationships')
  const pass = await (dependencies.readProgramPass ?? readProgramPassFromLedger)({ req, programId, orgId, leadId, siteId })
  if (!pass || pass.state !== 'PASS' || pass.programId !== programId || pass.orgId !== orgId || pass.leadId !== leadId || pass.siteId !== siteId) throw new Error('linked Program has no canonical PASS completion')
  const { gateway, outbox } = gatewayAndQueue()
  const request = gateway.buildRequest('demo.completed', orgId, `cms:${event.id}`, `cms:${event.collection}:${event.id}:${event.eventType}`, { lead_id: leadId, site_id: siteId })
  await outbox.enqueue(request)
}

/** Recoverable worker entrypoint. State and acknowledgement receipt are written by FileOutbox before returning. */
export const drainLiNKautowork = async (): Promise<readonly unknown[]> => {
  const { gateway, outbox } = gatewayAndQueue()
  return outbox.drain(async (request: GatewayRequest) => {
    const result = await gateway.transport(request)
    return result
  })
}

/** Health is derived from the same durable queue the web producer and worker share. */
export const healthLiNKautowork = async (): Promise<GatewayMetrics> => {
  const { outbox } = gatewayAndQueue()
  return outbox.health()
}
