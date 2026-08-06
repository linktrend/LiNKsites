import { randomUUID } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { getPayload } from 'payload'
import { Client } from 'pg'
import {
  LINKLIBRARIES_REPOSITORY,
  consumePinnedLibraryEntry,
  createOfflineLibraryFixtureTransport,
  type LibraryCatalog,
  type LibraryEntryContract,
} from '../../../packages/factory-catalog/src/libraryConsumer.ts'

const root = resolve(import.meta.dirname, '../../..')
console.error('W2-04 seed: loading Payload configuration')
const { default: config } = await import('../src/payload.config.ts')
console.error('W2-04 seed: Payload configuration loaded')
const fixtureRoot = resolve(root, 'packages/factory-catalog/tests/fixtures/linklibraries/marketing-smb-v1')
const readFixture = (path: string) => readFile(resolve(fixtureRoot, path), 'utf8')
const commitSha = '1'.repeat(40)

const entry = JSON.parse(await readFixture('entry.json')) as LibraryEntryContract
const files = {
  'README.md': await readFixture('README.md'),
  'assets/marketingSmbV1.ts': await readFixture('assets/marketingSmbV1.ts'),
  'tests/marketingSmbV1.fixture.ts': await readFixture('tests/marketingSmbV1.fixture.ts'),
}
const catalog: LibraryCatalog = {
  schemaVersion: 1,
  generatedAt: '2026-08-04T00:00:00.000Z',
  sourceCommitSha: commitSha,
  entries: [{
    entryId: entry.entryId,
    kind: entry.kind,
    name: entry.name,
    summary: entry.summary,
    problemDomains: entry.problemDomains,
    tags: entry.tags,
    languages: entry.languages,
    frameworks: entry.frameworks,
    status: 'approved',
    path: `entries/${entry.entryId}`,
  }],
}

const consumption = await consumePinnedLibraryEntry({
  catalogReference: { repositoryUrl: LINKLIBRARIES_REPOSITORY, commitSha, ref: commitSha, catalog },
  entryId: 'marketing-smb-v1',
  compatibility: { nodeMajor: 22, runtimes: ['node', 'browser'] },
  executable: { entrypoint: 'assets/marketingSmbV1.ts', testFiles: ['tests/marketingSmbV1.fixture.ts'] },
  transport: createOfflineLibraryFixtureTransport({
    readCatalog: () => catalog,
    readEntryAtCommit: () => ({ entry, files }),
  }),
  recordedAt: '2026-08-05T00:00:00.000Z',
})

console.error('W2-04 seed: opening disposable Payload database')
const payload = await getPayload({ config })
console.error('W2-04 seed: disposable Payload database opened')
const within = async <T>(label: string, operation: Promise<T>): Promise<T> => {
  let timeout: NodeJS.Timeout | undefined
  try {
    return await Promise.race([
      operation,
      new Promise<T>((_, reject) => { timeout = setTimeout(() => reject(new Error(`W2-04 seed timed out while ${label}`)), 30_000) }),
    ])
  } finally {
    if (timeout) clearTimeout(timeout)
  }
}
// The proof deliberately creates only English records. Suppress the normal
// asynchronous translation-queue fan-out so the disposable fixture cannot
// recursively enqueue its own setup documents.
const options = { overrideAccess: true, disableTransaction: true, context: { skipTranslationSync: true } }
const language = await within('creating language', payload.create({ collection: 'languages', data: { code: 'en', name: 'English', isDefault: true }, ...options }))
console.error('W2-04 seed: language created')
const site = await within('creating site', payload.create({
  collection: 'sites',
  data: { name: 'W2-04 local proof site', domain: '127.0.0.1', status: 'published', templateId: 'marketing-smb-v1', defaultLanguage: language.id, languages: [language.id] },
  ...options,
}))
console.error('W2-04 seed: site created')
await within('creating hostname mapping', payload.create({ collection: 'site-domains', data: { hostname: '127.0.0.1', site: site.id, primary: true }, ...options }))
console.error('W2-04 seed: hostname created')
if (process.env.W2_04_SCHEMA_ONLY === '1') {
  console.log(`W2_04_SCHEMA=${JSON.stringify({ siteId: String(site.id), languageId: String(language.id) })}`)
  await payload.destroy()
  process.exit(0)
}
const common = { site: site.id, locale: 'en', status: 'published' as const }
const previewApiKey = 'w2-04-disposable-preview-api-key'
const previewRole = await within('creating preview role', payload.create({
  collection: 'roles',
  // The same disposable, site-scoped API user is used by the W2-02 local
  // promotion proof. It needs draft create/update authority; this fixture
  // remains local-only and never grants public publication authority.
  // Access resolution deliberately grants only recognised role profiles. The
  // editor profile has read/create/update but cannot publish, approve, or
  // manage sites, so it is the least-privileged role that can create drafts.
  data: { name: 'editor', permissions: { read: true, create: true, update: true } },
  ...options,
}))
await within('creating preview API user', payload.create({
  collection: 'users',
  data: {
    email: `w2-04-preview-${randomUUID()}@example.test`,
    password: 'w2-04-disposable-password',
    roles: [previewRole.id],
    assignedSites: [site.id],
    allowedLocales: ['en'],
    enableAPIKey: true,
    apiKey: previewApiKey,
  },
  ...options,
}))
console.error('W2-04 seed: server-side preview API user created')
// SiteSettings has an existing collection-lifecycle deadlock during an empty
// local bootstrap. This is a disposable proof-only fixture insert; normal
// application writes continue through Payload.
const client = new Client({ connectionString: process.env.DATABASE_URI })
await client.connect()
await client.query(
  `insert into public.site_settings (site_id, locale, template_id, status, _status, created_at, updated_at)
   values ($1, $2, $3, 'published', 'published', now(), now())`,
  [site.id, 'en', 'marketing-smb-v1'],
)
console.error('W2-04 seed: site settings inserted directly into disposable database')
await within('creating navigation', payload.create({
  collection: 'navigation',
  data: { ...common, navKey: 'primary', label: 'Contact', slug: 'contact', url: '/en/contact', order: 1 },
  ...options,
}))
// Payload's collection hooks recursively block during an empty bootstrap when
// they create localized blocks. The proof therefore writes the inspected
// Payload tables directly, preserving the exact public/pages -> localized
// content -> hero relation that the REST API and web-master read.
const insertPage = async ({
  slug,
  title,
  pageType,
  previewEnvironment,
  heroTitle,
  heroSubtitle,
}: {
  slug: string
  title: string
  pageType: 'home' | 'landing'
  previewEnvironment: 'private-preview' | null
  heroTitle: string
  heroSubtitle: string
}) => {
  const page = await client.query<{ id: number }>(
    `insert into public.pages (slug, page_type, site_id, locale, preview_environment, status, _status, published_at, created_at, updated_at)
     values ($1, $2, $3, 'en', $4, 'published', 'published', now(), now(), now())
     returning id`,
    [slug, pageType, site.id, previewEnvironment],
  )
  const pageId = page.rows[0]?.id
  if (!pageId) throw new Error('W2-04 could not insert a disposable page')
  await client.query(
    `insert into public.pages_locales (title, seo_title, seo_description, _locale, _parent_id)
     values ($1, $1, 'A real published Payload document rendered through web-master.', 'en', $2)`,
    [title, pageId],
  )
  await client.query(
    `insert into public.pages_blocks_hero (_order, _parent_id, _path, _locale, id, badge, title, subtitle, cta_text, cta_url, cta_style)
     values (1, $1, 'content', 'en', $2, 'Payload local proof', $3, $4, 'Contact', '/en/contact', 'primary')`,
    [pageId, randomUUID(), heroTitle, heroSubtitle],
  )
}
await insertPage({
  slug: 'home',
  title: 'Northstar local Payload proof', pageType: 'home', previewEnvironment: null,
  heroTitle: 'A real published Payload page', heroSubtitle: 'This content came from the disposable Payload database.',
})
for (const page of [
  ['about', 'About Payload proof'],
  ['services', 'Services Payload proof'],
  ['contact', 'Contact Payload proof'],
  ['legal/privacy-policy', 'Privacy Payload proof'],
  ['legal/terms-of-use', 'Terms Payload proof'],
  ['legal/cookie-policy', 'Cookie Payload proof'],
] as const) {
  await insertPage({
    slug: page[0], title: page[1], pageType: 'landing', previewEnvironment: null,
    heroTitle: page[1], heroSubtitle: `Real published Payload content for ${page[0]}.`,
  })
}
await insertPage({
  slug: 'home',
  title: 'Private Payload preview', pageType: 'landing', previewEnvironment: 'private-preview',
  heroTitle: 'Private Payload preview', heroSubtitle: 'Only the token-gated route may render this record.',
})
await client.end()
console.error('W2-04 seed: pages, localized rows, and hero blocks inserted directly into disposable database')

const proof = JSON.stringify({
  siteId: String(site.id),
  previewApiKey,
  receipt: consumption.receipt,
  evidence: consumption,
})
const proofPath = process.env.W2_04_PROOF_PATH
if (!proofPath) throw new Error('W2_04_PROOF_PATH is required for the local proof seed')
await writeFile(proofPath, proof)
// The short-lived CLI has already closed its direct client. Payload's pool
// teardown can wait indefinitely in this isolated bootstrap, so finish the
// seed process explicitly; the enclosing harness owns and stops the database.
process.stdout.write(`W2_04_LOCAL_PROOF_PATH=${proofPath}\n`, () => process.exit(0))
