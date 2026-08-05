import type { PayloadRequest } from 'payload'
import { LiNKautoworkGateway } from '@linksites/autowork-boundary'

export type AutoworkEvent = { id: string | number; collection: string; eventType: string; site?: string; locale?: string; meta?: Record<string, unknown>; req?: PayloadRequest | null }

const shouldSkip = (event: AutoworkEvent): boolean => {
  const meta = (event.req as (PayloadRequest & { meta?: Record<string, unknown> }) | undefined)?.meta
  const context = (event.req as { context?: Record<string, unknown> } | null | undefined)?.context
  return meta?.source === 'n8n' || event.meta?.source === 'n8n' || context?.skipN8N === true
}

export const triggerLiNKautowork = async (event: AutoworkEvent): Promise<void> => {
  if (shouldSkip(event)) return
  const gatewayUrl = process.env.LINKAUTOWORK_GATEWAY_URL
  const secret = process.env.LINKAUTOWORK_SIGNING_SECRET
  const keyId = process.env.LINKAUTOWORK_SIGNING_KEY_ID
  const environment = process.env.LINKAUTOWORK_ENVIRONMENT as 'development' | 'staging' | 'production' | undefined
  const leadId = typeof event.meta?.lead_id === 'string' ? event.meta.lead_id : undefined
  const siteId = typeof event.site === 'string' ? event.site : undefined
  if (!gatewayUrl || !secret || !keyId || !environment || !leadId || !siteId) return
  const gateway = new LiNKautoworkGateway({
    secret, keyId, environment,
    transport: async (request) => {
      const response = await fetch(gatewayUrl, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(request) })
      return { status: response.status, receiptId: response.headers.get('x-linkautowork-receipt') ?? 'unavailable', acknowledgedAt: new Date().toISOString() }
    },
  })
  try {
    await gateway.send('demo.completed', String(event.meta?.org_id ?? 'unknown'), `cms:${event.id}`, `cms:${event.collection}:${event.id}:${event.eventType}`, { lead_id: leadId, site_id: siteId })
  } catch (error) {
    console.error('LiNKautowork gateway delivery failed', { code: error instanceof Error ? error.message : 'unknown' })
  }
}
