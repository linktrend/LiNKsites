/**
 * Connect via:
 * - Vercel Cron job hitting `node cron/purgeExpiredDrafts.ts`
 * - DigitalOcean App Platform scheduled task
 * - n8n scheduled workflow calling this script
 */
import { getPayload } from 'payload'
import config from '@payload-config'
import { cacheInvalidatePattern } from '@/payload/utils/cache'

const MAX_AGE_DAYS = Number.parseInt(process.env.DRAFT_MAX_AGE_DAYS ?? '30', 10)

const cutoff = new Date(Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000).toISOString()

async function main() {
  const payload = await getPayload({ config })
  const drafts = await payload.find({
    collection: 'articles',
    where: {
      status: { equals: 'draft' },
      updatedAt: { less_than: cutoff },
    },
    depth: 0,
    limit: 50,
    select: ['id', 'site'] as never,
  })

  for (const doc of drafts.docs as Array<Record<string, unknown>>) {
    try {
      await payload.delete({
        collection: 'articles',
        id: String(doc.id),
      })
      const siteId =
        typeof doc.site === 'string'
          ? (doc.site as string)
          : (doc.site as { id?: string } | undefined)?.id
      if (siteId) {
        await cacheInvalidatePattern(`site:${siteId}`)
      }
    } catch (error) {
      console.error('Failed to purge draft', { id: doc.id, error })
    }
  }
}

void main().catch((error) => {
  console.error('Purge expired drafts cron failed', error)
  process.exit(1)
})
