import type { PayloadRequest } from 'payload'
import { verifySignature } from '@/payload/utils/verifySignature'

/**
 * Shared middleware for inbound webhooks (n8n, cron, etc.).
 * Attach to any route under /payload/endpoints/webhooks to enforce signature checks.
 */
export const verifyWebhookMiddleware = async (
  req: PayloadRequest,
  res: { status: (code: number) => { json: (payload: unknown) => void } },
  next: () => void,
) => {
  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? '')
  const headerGetter = (key: string) => {
    const headersWithGet = req.headers as Headers | undefined
    const withGetter = headersWithGet?.get?.(key)
    if (withGetter) return withGetter

    const headersRecord = req.headers as unknown as Record<string, string | string[] | undefined>
    const value = headersRecord?.[key.toLowerCase()]
    if (Array.isArray(value)) return value[0]
    return value ?? undefined
  }
  const signature =
    headerGetter('x-signature') ||
    headerGetter('x-webhook-signature') ||
    headerGetter('signature')

  if (!verifySignature(rawBody, signature)) {
    res.status(401).json({ error: 'Invalid signature' })
    return
  }

  next()
}
