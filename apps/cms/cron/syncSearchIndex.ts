/**
 * Connect via:
 * - Vercel Cron: schedule `node cron/syncSearchIndex.ts`.
 * - DigitalOcean App Platform: scheduled job.
 * - n8n: scheduled workflow HTTP node hitting this script.
 */
import { getPayload } from 'payload'
import config from '@payload-config'

const SEARCH_ENDPOINT = process.env.SEARCH_INDEX_ENDPOINT

const minimalFields = ['id', 'title', 'site', 'locale', 'status', 'updatedAt'] as const

const sendBatch = async (docs: Array<Record<string, unknown>>) => {
  if (!SEARCH_ENDPOINT) {
    console.warn('SEARCH_INDEX_ENDPOINT not configured; skipping index sync')
    return
  }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 3000)
  try {
    await fetch(SEARCH_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        documents: docs.map((doc) => ({
          id: doc.id,
          title: doc.title,
          site: (doc as { site?: string | { id?: string } }).site ?? null,
          locale: (doc as { locale?: string }).locale ?? 'en',
          status: doc.status,
          updatedAt: doc.updatedAt,
        })),
      }),
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timer)
  }
}

async function main() {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'articles',
    where: { status: { equals: 'published' } },
    limit: 100,
    depth: 0,
    select: minimalFields as never,
  })

  if (result.docs.length > 0) {
    await sendBatch(result.docs as Array<Record<string, unknown>>)
  }
}

void main().catch((error) => {
  console.error('Search index sync failed', error)
  process.exit(1)
})
