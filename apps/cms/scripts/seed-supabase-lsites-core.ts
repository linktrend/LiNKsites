import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve4 } from 'node:dns/promises'
import type { ClientConfig } from 'pg'
import { Client } from 'pg'

const SUPABASE_DATABASE_URI = process.env.SUPABASE_DATABASE_URI
if (!SUPABASE_DATABASE_URI) {
  throw new Error('SUPABASE_DATABASE_URI is required')
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '../../../')
const MIGRATION_PATH = path.join(ROOT_DIR, 'supabase/migrations/20260331_000001_lsites_init.sql')

const NOW = new Date().toISOString()
const SITE_ID = '11111111-1111-1111-1111-111111111111'

const seed = {
  languages: [
    { code: 'en', name: 'English', is_default: true },
  ],
  sites: [
    {
      id: SITE_ID,
      name: 'LiNKtrend Master',
      status: 'active',
      template_id: 'marketing-smb-v1',
      primary_domain: 'linktrend-master.local',
      default_locale: 'en',
      created_at: NOW,
      updated_at: NOW,
    },
  ],
  site_domains: [
    {
      id: '22222222-2222-2222-2222-222222222222',
      site_id: SITE_ID,
      domain: 'linktrend-master.local',
      is_primary: true,
      created_at: NOW,
    },
  ],
  pages: [
    {
      id: '33333333-3333-3333-3333-333333333333',
      site_id: SITE_ID,
      locale: 'en',
      slug: 'home',
      title: 'Home',
      status: 'published',
      data: {
        pageType: 'home',
        content: [
          {
            blockType: 'hero',
            title: 'Welcome to LiNKtrend',
            subtitle: 'Seeded from Supabase (source of truth).',
            cta: { text: 'Get Started', url: '/contact', style: 'primary' },
          },
          {
            blockType: 'features',
            title: 'Features',
            subtitle: 'Configurable blocks from CMS',
            items: [
              { icon: 'database', title: 'Supabase-first', description: 'Content originates in Supabase.' },
              { icon: 'layout', title: 'CMS-driven', description: 'Synced into Payload CMS.' },
              { icon: 'globe', title: 'Multi-locale', description: 'Locale-aware rendering.' },
            ],
          },
          {
            blockType: 'cta',
            title: 'See it live',
            text: 'This content came from Supabase and was synced into the CMS.',
            button: { text: 'Contact', url: '/contact', style: 'primary' },
          },
        ],
      },
      source_hash: null,
      created_at: NOW,
      updated_at: NOW,
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      site_id: SITE_ID,
      locale: 'en',
      slug: 'about',
      title: 'About Us',
      status: 'published',
      data: {
        pageType: 'about',
        content: [
          {
            blockType: 'hero',
            title: 'About LiNKtrend',
            subtitle: 'AI-powered automation for real businesses.',
            cta: { text: 'Contact Us', url: '/contact', style: 'primary' },
          },
          {
            blockType: 'richText',
            content: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'paragraph',
                    children: [{ text: 'This page content was generated in Supabase and synced into the CMS.' }],
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
            },
          },
        ],
      },
      source_hash: null,
      created_at: NOW,
      updated_at: NOW,
    },
  ],
  navigation: [
    {
      id: '55555555-5555-5555-5555-555555555555',
      site_id: SITE_ID,
      locale: 'en',
      title: 'Home',
      status: 'published',
      data: {
        navKey: 'primary',
        label: 'Home',
        url: '/',
        order: 0,
        external: false,
      },
      created_at: NOW,
      updated_at: NOW,
    },
    {
      id: '66666666-6666-6666-6666-666666666666',
      site_id: SITE_ID,
      locale: 'en',
      title: 'About',
      status: 'published',
      data: {
        navKey: 'primary',
        label: 'About',
        url: '/about',
        order: 1,
        external: false,
      },
      created_at: NOW,
      updated_at: NOW,
    },
    {
      id: '77777777-7777-7777-7777-777777777777',
      site_id: SITE_ID,
      locale: 'en',
      title: 'Contact',
      status: 'published',
      data: {
        navKey: 'primary',
        label: 'Contact',
        url: '/contact',
        order: 2,
        external: false,
      },
      created_at: NOW,
      updated_at: NOW,
    },
  ],
}

const jsonbColumns = new Set(['data'])

const ensureSchema = async (client: Client) => {
  const schemaCheck = await client.query(
    "select schema_name from information_schema.schemata where schema_name = 'lsites_core'",
  )
  if (schemaCheck.rowCount > 0) return

  const migration = fs.readFileSync(MIGRATION_PATH, 'utf-8')
  await client.query(migration)
}

const upsertRows = async (
  client: Client,
  table: string,
  rows: Array<Record<string, unknown>>,
  conflictKey: string,
) => {
  if (rows.length === 0) return
  for (const row of rows) {
    const columns = Object.keys(row)
    const values = columns.map((col) => row[col])
    const placeholders = columns.map((col, i) =>
      jsonbColumns.has(col) ? `$${i + 1}::jsonb` : `$${i + 1}`,
    )
    const updates = columns
      .filter((col) => col !== conflictKey)
      .map((col) => `${col} = EXCLUDED.${col}`)
      .join(', ')

    const sql = `
      insert into ${table} (${columns.join(', ')})
      values (${placeholders.join(', ')})
      on conflict (${conflictKey}) do update set ${updates}
    `
    await client.query(sql, values)
  }
}

const buildClientConfig = async (): Promise<ClientConfig> => {
  const url = new URL(SUPABASE_DATABASE_URI)
  let host = url.hostname
  try {
    const [ipv4] = await resolve4(url.hostname)
    if (ipv4) host = ipv4
  } catch {
    // fallback to hostname
  }
  return {
    host,
    port: Number(url.port || 5432),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, '') || 'postgres',
    ssl: { rejectUnauthorized: false },
  }
}

const run = async () => {
  const client = new Client(await buildClientConfig())
  await client.connect()
  try {
    await ensureSchema(client)
    await client.query('set search_path to lsites_core, public')

    await upsertRows(client, 'languages', seed.languages, 'code')
    await upsertRows(client, 'sites', seed.sites, 'id')
    await upsertRows(client, 'site_domains', seed.site_domains, 'id')
    await upsertRows(client, 'pages', seed.pages, 'id')
    await upsertRows(client, 'navigation', seed.navigation, 'id')

    console.log('[supabase] lsites_core seed applied.')
  } finally {
    await client.end()
  }
}

void run()
