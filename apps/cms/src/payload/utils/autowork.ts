import type { PayloadRequest } from 'payload'
import { FileOutbox, LiNKautoworkGateway, type GatewayEnvironment, type GatewayEventPolicy, type GatewayRequest } from '@linksites/autowork-boundary'

export type AutoworkEvent = { id: string | number; collection: string; eventType: string; site?: string; locale?: string; meta?: Record<string, unknown>; req?: PayloadRequest | null }

const environmentNames = new Set(['development', 'staging', 'production'])
const configuredPolicies = (): readonly GatewayEventPolicy[] => {
  const raw = process.env.LINKAUTOWORK_EVENT_GRANTS
  if (!raw?.trim()) throw new Error('LINKAUTOWORK_EVENT_GRANTS is required')
  const parsed: unknown = JSON.parse(raw)
  if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('LINKAUTOWORK_EVENT_GRANTS must be a non-empty array')
  return parsed.map((value) => {
    if (!value || typeof value !== 'object') throw new Error('invalid LiNKautowork grant')
    const grant = value as Record<string, unknown>
    const orgIds = Array.isArray(grant.orgIds) ? grant.orgIds.filter((id): id is string => typeof id === 'string' && id.trim() !== '') : []
    const environments = Array.isArray(grant.environments) ? grant.environments.filter((env): env is GatewayEnvironment => typeof env === 'string' && environmentNames.has(env)) : []
    if (typeof grant.eventName !== 'string' || orgIds.length === 0 || environments.length === 0 || orgIds.includes('*')) throw new Error('invalid or wildcard LiNKautowork grant')
    return { eventName: grant.eventName as GatewayEventPolicy['eventName'], orgIds, environments }
  })
}

const gatewayAndQueue = (): { gateway: LiNKautoworkGateway; outbox: FileOutbox } => {
  const gatewayUrl = process.env.LINKAUTOWORK_GATEWAY_URL
  const secret = process.env.LINKAUTOWORK_SIGNING_SECRET
  const keyId = process.env.LINKAUTOWORK_SIGNING_KEY_ID
  const environment = process.env.LINKAUTOWORK_ENVIRONMENT as GatewayEnvironment
  const queuePath = process.env.LINKAUTOWORK_OUTBOX_PATH
  if (!gatewayUrl || !secret || !keyId || !environmentNames.has(environment) || !queuePath) throw new Error('LiNKautowork durable delivery configuration is incomplete')
  const gateway = new LiNKautoworkGateway({ secret, keyId, environment, policies: configuredPolicies(), transport: async (request) => {
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 3_000)
    try { const response = await fetch(gatewayUrl, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(request), signal: controller.signal }); return { status: response.status, receiptId: response.headers.get('x-linkautowork-receipt') ?? 'missing', acknowledgedAt: new Date().toISOString() } } finally { clearTimeout(timer) }
  } })
  return { gateway, outbox: new FileOutbox(queuePath, 5, gateway.metrics, (request, attempt) => gateway.resignRequest(request, attempt)) }
}

export const triggerLiNKautowork = async (event: AutoworkEvent): Promise<void> => {
  const leadId = typeof event.meta?.lead_id === 'string' ? event.meta.lead_id : undefined
  const siteId = typeof event.site === 'string' ? event.site : undefined
  const orgId = typeof event.meta?.org_id === 'string' ? event.meta.org_id : undefined
  if (!leadId || !siteId || !orgId) throw new Error('lead, site, and org are required for LiNKautowork enqueue')
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
