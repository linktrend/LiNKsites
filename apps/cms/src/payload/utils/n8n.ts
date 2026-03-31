import { setTimeout as delay } from 'node:timers/promises'
import type { PayloadRequest } from 'payload'

export type N8NEvent = {
  id: string | number
  collection: string
  eventType: string
  site?: string
  locale?: string
  meta?: Record<string, unknown>
  url?: string
  req?: PayloadRequest | null
}

const DEFAULT_TIMEOUT_MS = 3000
const RETRIES = 3

const shouldSkip = (event: N8NEvent): boolean => {
  const meta = (event.req as (PayloadRequest & { meta?: Record<string, unknown> }) | undefined)?.meta
  if (meta?.source === 'n8n') return true
  if (event.meta?.source === 'n8n') return true
  const reqContext = (event.req as { context?: Record<string, unknown> } | null | undefined)?.context
  if (reqContext?.skipN8N)
    return true
  return false
}

export const safeCall = async (url: string, payload: Record<string, unknown>): Promise<boolean> => {
  for (let attempt = 0; attempt < RETRIES; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })
      clearTimeout(timeout)
      if (response.ok) return true
    } catch (error) {
      if ((error as Error)?.name === 'AbortError') {
        // timed out, continue to retry
      }
    }
    const backoff = 150 * 2 ** attempt
    await delay(backoff)
  }
  return false
}

export const triggerN8N = async (event: N8NEvent): Promise<void> => {
  if (shouldSkip(event)) return
  const url = event.url ?? process.env.N8N_WEBHOOK_URL
  if (!url) return

  const payload = {
    id: event.id,
    collection: event.collection,
    eventType: event.eventType,
    site: event.site,
    locale: event.locale,
    meta: {
      source: 'payload',
      ...(event.meta ?? {}),
    },
  }

  try {
    await safeCall(url, payload)
  } catch (error) {
    console.error('n8n trigger failed', { error })
  }
}
