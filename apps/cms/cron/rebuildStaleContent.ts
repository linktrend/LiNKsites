/**
 * Hook up to:
 * - Vercel Cron: add this file as an edge function entry.
 * - DigitalOcean App Platform: schedule `node cron/rebuildStaleContent.ts`.
 * - n8n: call this file via a scheduled workflow HTTP node.
 */
import { getPayload } from 'payload'
import config from '@payload-config'

const DAYS = Number.parseInt(process.env.REBUILD_STALE_DAYS ?? '7', 10)
const REBUILD_ENDPOINT = process.env.REBUILD_WEBHOOK_URL

const now = Date.now()
const cutoff = new Date(now - DAYS * 24 * 60 * 60 * 1000).toISOString()

const minimalFields = ['id', 'site', 'locale', 'updatedAt'] as const

const postJSON = async (url: string, payload: unknown) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 3000)
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    return response.ok
  } finally {
    clearTimeout(timer)
  }
}

async function main() {
  const payload = await getPayload({ config })
  const result = (await payload.find({
    collection: 'articles',
    where: {
      updatedAt: { less_than: cutoff },
      status: { equals: 'published' },
    },
    limit: 50,
    depth: 0,
    select: minimalFields as never,
  })) as { docs: Array<{ id: string; site?: string | { id?: string }; locale?: string }> }

  if (!REBUILD_ENDPOINT) {
    console.warn('REBUILD_WEBHOOK_URL not configured; skipping outbound calls')
    return
  }

  await Promise.all(
    result.docs.map((doc) =>
      postJSON(REBUILD_ENDPOINT, {
        id: doc.id,
        site: (doc as { site?: string | { id?: string } }).site ?? null,
        locale: (doc as { locale?: string }).locale ?? 'en',
        event: 'rebuild_stale_content',
      }).catch((error) => console.error('Failed to enqueue rebuild', { error, id: doc.id })),
    ),
  )
}

void main().catch((error) => {
  console.error('Rebuild stale content cron failed', error)
  process.exit(1)
})
