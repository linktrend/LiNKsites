import fs from 'node:fs'
import path from 'node:path'
import payload from 'payload'
import { cmsSchemaMapping } from '@linksites/types'

const args = new Set(process.argv.slice(2))
const isDryRun = args.has('--dry-run')
const seedArgIndex = process.argv.findIndex((arg) => arg === '--seed')
const seedPath =
  seedArgIndex > -1 && process.argv[seedArgIndex + 1]
    ? process.argv[seedArgIndex + 1]
    : path.resolve(process.cwd(), '../../supabase/schemas/seed.sample.json')

type SeedFile = {
  collections?: Record<string, Array<Record<string, unknown>>>
}

const loadSeed = (): SeedFile => {
  const raw = fs.readFileSync(seedPath, 'utf-8')
  return JSON.parse(raw) as SeedFile
}

const ensurePayload = async () => {
  const { default: resolvedConfig } = await import('@/payload.config')
  await payload.init({ config: resolvedConfig })
}

const upsertRecord = async (
  collection: string,
  record: Record<string, unknown>,
): Promise<void> => {
  const { id, ...data } = record
  if (typeof id === 'string') {
    const existing = await payload.find({
      collection,
      where: { id: { equals: id } },
      depth: 0,
      limit: 1,
    })
    if (existing.totalDocs > 0 && existing.docs[0]) {
      await payload.update({
        collection,
        id,
        data,
        depth: 0,
      })
      return
    }
  }

  await payload.create({
    collection,
    data,
    depth: 0,
  })
}

const run = async () => {
  const seed = loadSeed()
  const collections = seed.collections ?? {}
  const mapping = cmsSchemaMapping.collections ?? {}

  if (isDryRun) {
    console.log('[sync] Dry run mode enabled.')
  }

  if (!isDryRun) {
    await ensurePayload()
  }

  for (const [collection, records] of Object.entries(collections)) {
    if (!mapping[collection]) {
      console.warn(`[sync] Skipping collection without mapping: ${collection}`)
      continue
    }
    for (const record of records) {
      if (isDryRun) {
        console.log(`[sync] Would upsert ${collection}`, record)
      } else {
        await upsertRecord(collection, record)
      }
    }
  }

  console.log('[sync] Seed sync complete.')
}

void run()
