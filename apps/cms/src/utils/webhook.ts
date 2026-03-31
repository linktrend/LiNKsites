import { createHmac, timingSafeEqual } from 'node:crypto'
import { cacheInvalidatePattern } from '@/payload/utils/cache'
import type { WorkflowRequest } from '@/types/PayloadRequestExtended'

export interface WebhookPayload {
  event: string
  collection?: string
  doc?: Record<string, unknown> | null
  timestamp: string
}

/**
 * Trigger a webhook for rebuild/deploy
 */
export async function triggerWebhook(
  url: string,
  payload: WebhookPayload,
  secret?: string,
): Promise<boolean> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (secret) {
      headers['X-Webhook-Secret'] = secret
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })

    return response.ok
  } catch (error) {
    console.error('Webhook trigger failed:', error)
    return false
  }
}

/**
 * Trigger rebuild webhook for a site
 */
export async function triggerSiteRebuild(
  siteId: string,
  req: WorkflowRequest,
  reason: string = 'content_update',
): Promise<void> {
  try {
    // Fetch site configuration
    const site = await req.payload.findByID({
      collection: 'sites',
      id: siteId,
      depth: 0,
    })

    if (!site?.rebuildWebhookUrl) {
      console.log(`No rebuild webhook configured for site: ${siteId}`)
      return
    }

    const payload: WebhookPayload = {
      event: 'rebuild',
      collection: 'sites',
      doc: {
        id: siteId,
        site: siteId,
        locale: req.locale,
        reason,
      },
      timestamp: new Date().toISOString(),
    }

    const success = await triggerWebhook(
      site.rebuildWebhookUrl,
      payload,
      site.rebuildWebhookSecret || undefined,
    )

    if (success) {
      console.log(`Rebuild triggered for site: ${siteId}`)
    } else {
      console.error(`Failed to trigger rebuild for site: ${siteId}`)
    }

    void cacheInvalidatePattern(`site:${siteId}`).catch((error) =>
      console.error('Failed to invalidate caches after webhook trigger', error),
    )
  } catch (error) {
    console.error('Error triggering site rebuild:', error)
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  if (!secret || !signature) {
    return false
  }

  const normalizedSignature = signature.startsWith('sha256=')
    ? signature.slice(7)
    : signature

  const digest = createHmac('sha256', secret).update(payload).digest('hex')

  try {
    const provided = Buffer.from(normalizedSignature, 'hex')
    const expected = Buffer.from(digest, 'hex')

    if (provided.length !== expected.length) {
      return false
    }

    return timingSafeEqual(provided, expected)
  } catch {
    return false
  }
}
