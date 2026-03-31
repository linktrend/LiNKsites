import config from '@/payload.config'
import { cmsSchemaMapping, supabaseSchema } from '@linksites/types'

const EXCLUDED_COLLECTIONS = new Set([
  'users',
  'roles',
  'api-keys',
  'translation-queue',
])

const getCollectionSlugs = async (): Promise<string[]> => {
  const resolvedConfig = await config
  return (resolvedConfig.collections ?? [])
    .map((collection) => collection.slug)
    .filter((slug): slug is string => typeof slug === 'string')
}

const run = async () => {
  const collections = await getCollectionSlugs()
  const mapping = cmsSchemaMapping.collections ?? {}
  const schemaTables = new Set((supabaseSchema.tables ?? []).map((table) => table.name))

  const missingMappings = collections.filter(
    (slug) =>
      !slug.startsWith('payload-') &&
      !EXCLUDED_COLLECTIONS.has(slug) &&
      !Object.prototype.hasOwnProperty.call(mapping, slug),
  )

  const missingTables = Object.entries(mapping)
    .map(([, entry]) => entry?.table)
    .filter((table): table is string => typeof table === 'string' && !schemaTables.has(table))

  if (missingMappings.length > 0) {
    throw new Error(`Missing Supabase mapping for: ${missingMappings.join(', ')}`)
  }

  if (missingTables.length > 0) {
    throw new Error(`Supabase schema missing tables: ${missingTables.join(', ')}`)
  }

  console.log('[contracts] CMS collections align with Supabase mapping.')
}

void run()
