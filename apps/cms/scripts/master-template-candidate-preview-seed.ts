import { randomUUID } from 'node:crypto'
import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { getPayload } from 'payload'
import { Client } from 'pg'
import { MASTER_TEMPLATE_PIN } from '../../../packages/factory-catalog/src/masterTemplatePin.ts'
import {
  assertProductionStillRejectsDraftMaster,
  runMasterTemplateCandidatePreview,
  writeMasterTemplateCandidatePreviewFixture,
} from '../../../packages/factory-catalog/src/masterTemplatePreviewSeam.ts'

const root = resolve(import.meta.dirname, '../../..')
const fixtureRoot = resolve(
  root,
  'packages/factory-catalog/tests/fixtures/linklibraries/master-template-type-1-1.0.0',
)
const proofHostname = process.env.W2_04_LOCAL_PROOF_HOST ?? '127.0.0.1'

assertProductionStillRejectsDraftMaster(fixtureRoot)
const preview = runMasterTemplateCandidatePreview({
  siteId: 'northline-preview',
  locale: 'en',
  fixtureRoot,
})
if (preview.probe.verified.lifecycle !== 'draft' || preview.productionSelectable !== false) {
  throw new Error('Candidate preview seed refused to treat the master as production-selectable')
}

const starterPages = preview.probe.starterPages.filter((page) =>
  page.archetypeId === 'home' || page.archetypeId === 'about' || page.archetypeId === 'contact',
)
if (starterPages.length !== 3) {
  throw new Error('Candidate preview seed requires projected Home, About, and Contact pages')
}

console.error('Candidate preview seed: loading Payload configuration')
const { default: config } = await import('../src/payload.config.ts')
const payload = await getPayload({ config })
const within = async <T>(label: string, operation: Promise<T>): Promise<T> => {
  let timeout: NodeJS.Timeout | undefined
  try {
    return await Promise.race([
      operation,
      new Promise<T>((_, reject) => {
        timeout = setTimeout(() => reject(new Error(`Candidate preview seed timed out while ${label}`)), 30_000)
      }),
    ])
  } finally {
    if (timeout) clearTimeout(timeout)
  }
}
const options = { overrideAccess: true, disableTransaction: true, context: { skipTranslationSync: true } }
const language = await within('creating language', payload.create({
  collection: 'languages',
  data: { code: 'en', name: 'English', isDefault: true },
  ...options,
}))
const site = await within('creating site', payload.create({
  collection: 'sites',
  data: {
    name: 'Northline candidate preview',
    domain: proofHostname,
    status: 'published',
    templateId: MASTER_TEMPLATE_PIN.entryId,
    orgId: 'local-org',
    programId: 'master-template-candidate-preview',
    leadId: 'master-template-candidate-preview',
    defaultLanguage: language.id,
    languages: [language.id],
  },
  ...options,
}))
await within('creating hostname mapping', payload.create({
  collection: 'site-domains',
  data: { hostname: proofHostname, site: site.id, primary: true },
  ...options,
}))

const previewApiKey = process.env.W2_04_PREVIEW_API_KEY
const previewPassword = process.env.W2_04_PREVIEW_PASSWORD
if (!previewApiKey || !previewPassword) {
  throw new Error('Candidate preview seed requires runtime-generated preview credentials')
}
const previewRole = await within('creating preview role', payload.create({
  collection: 'roles',
  data: { name: 'private-preview-publisher', permissions: { read: true, create: true, update: true, publish: true } },
  ...options,
}))
await within('creating preview API user', payload.create({
  collection: 'users',
  data: {
    email: `candidate-preview-${randomUUID()}@example.test`,
    password: previewPassword,
    roles: [previewRole.id],
    assignedSites: [site.id],
    allowedLocales: ['en'],
    enableAPIKey: true,
    apiKey: previewApiKey,
  },
  ...options,
}))

const client = new Client({ connectionString: process.env.DATABASE_URI })
await client.connect()
await client.query(
  `insert into public.site_settings (site_id, locale, template_id, status, _status, created_at, updated_at)
   values ($1, $2, $3, 'published', 'published', now(), now())`,
  [site.id, 'en', MASTER_TEMPLATE_PIN.entryId],
)

const pageTypeFor = (archetypeId: string): 'home' | 'about' | 'contact' => {
  if (archetypeId === 'home' || archetypeId === 'about' || archetypeId === 'contact') return archetypeId
  throw new Error(`Candidate preview seed refuses unprojected archetype ${archetypeId}`)
}

for (const page of starterPages) {
  const inserted = await client.query<{ id: number }>(
    `insert into public.pages (slug, page_type, site_id, locale, preview_environment, status, _status, published_at, created_at, updated_at)
     values ($1, $2, $3, 'en', 'private-preview', 'published', 'published', now(), now(), now())
     returning id`,
    [page.slug, pageTypeFor(page.archetypeId), site.id],
  )
  const pageId = inserted.rows[0]?.id
  if (!pageId) throw new Error(`Candidate preview seed could not insert ${page.slug}`)
  await client.query(
    `insert into public.pages_locales (title, seo_title, seo_description, _locale, _parent_id)
     values ($1, $1, $2, 'en', $3)`,
    [page.title, 'Private local preview of the Library master draft. Not a live website.', pageId],
  )
  const hero = page.blocks.find((block) => block.blockType === 'hero') ?? page.blocks[0]
  const heading = typeof hero?.data.heading === 'string' ? hero.data.heading : page.title
  const description = typeof hero?.data.description === 'string'
    ? hero.data.description
    : typeof hero?.data.body === 'string'
      ? hero.data.body
      : page.title
  await client.query(
    `insert into public.pages_blocks_hero (_order, _parent_id, _path, _locale, id, badge, title, subtitle, cta_text, cta_url, cta_style)
     values (1, $1, 'content', 'en', $2, 'Northline draft', $3, $4, 'Private preview', '/en/demo', 'primary')`,
    [pageId, randomUUID(), heading, description],
  )
}
await client.end()

const fixturePath = process.env.LINKSITES_MASTER_TEMPLATE_PREVIEW_FIXTURE_PATH
if (fixturePath) {
  writeMasterTemplateCandidatePreviewFixture(fixturePath, {
    hostname: proofHostname,
    siteId: String(site.id),
    locale: 'en',
    fixtureRoot,
  })
}

const proofPath = process.env.W2_04_PROOF_PATH
if (!proofPath) throw new Error('W2_04_PROOF_PATH is required for the candidate preview seed')
await writeFile(proofPath, JSON.stringify({
  siteId: String(site.id),
  previewApiKey,
  productionSelectable: false,
  pin: MASTER_TEMPLATE_PIN,
  titles: Object.fromEntries(starterPages.map((page) => [page.slug, page.title])),
}))
process.stdout.write(`MASTER_TEMPLATE_CANDIDATE_PREVIEW_PATH=${proofPath}\n`, () => process.exit(0))
