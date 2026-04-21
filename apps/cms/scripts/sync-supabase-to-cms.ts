import payload from 'payload'
import config from '@/payload.config'
import { Client } from 'pg'
import { resolve4 } from 'node:dns/promises'
import type { ClientConfig } from 'pg'

const SUPABASE_DATABASE_URI = process.env.SUPABASE_DATABASE_URI
if (!SUPABASE_DATABASE_URI) {
  throw new Error('SUPABASE_DATABASE_URI is required')
}

const ensurePayload = async () => {
  await payload.init({ config })
}

const fetchRows = async (client: Client, table: string) => {
  const { rows } = await client.query(`select * from ${table}`)
  return rows
}

const upsertLanguage = async (code: string, name: string, isDefault: boolean) => {
  const existing = await payload.find({
    collection: 'languages',
    where: { code: { equals: code } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (existing.totalDocs > 0 && existing.docs[0]) {
    const doc = existing.docs[0]
    await payload.update({
      collection: 'languages',
      id: doc.id,
      data: { name, isDefault },
      depth: 0,
      overrideAccess: true,
    })
    return doc.id
  }

  const created = await payload.create({
    collection: 'languages',
    data: { code, name, isDefault },
    depth: 0,
    overrideAccess: true,
  })
  return created.id
}

const upsertSite = async (domain: string, data: Record<string, unknown>) => {
  const existing = await payload.find({
    collection: 'sites',
    where: { domain: { equals: domain } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (existing.totalDocs > 0 && existing.docs[0]) {
    const doc = existing.docs[0]
    await payload.update({
      collection: 'sites',
      id: doc.id,
      data,
      depth: 0,
      overrideAccess: true,
    })
    return doc.id
  }

  const created = await payload.create({
    collection: 'sites',
    data,
    depth: 0,
    overrideAccess: true,
  })
  return created.id
}

const upsertSiteDomain = async (hostname: string, data: Record<string, unknown>) => {
  const existing = await payload.find({
    collection: 'site-domains',
    where: { hostname: { equals: hostname } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (existing.totalDocs > 0 && existing.docs[0]) {
    const doc = existing.docs[0]
    await payload.update({
      collection: 'site-domains',
      id: doc.id,
      data,
      depth: 0,
      overrideAccess: true,
    })
    return
  }

  await payload.create({
    collection: 'site-domains',
    data,
    depth: 0,
    overrideAccess: true,
  })
}

const upsertPage = async (siteId: string | number, locale: string, slug: string, data: Record<string, unknown>) => {
  const existing = await payload.find({
    collection: 'pages',
    where: {
      and: [{ slug: { equals: slug } }, { site: { equals: siteId } }, { locale: { equals: locale } }],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (existing.totalDocs > 0 && existing.docs[0]) {
    const doc = existing.docs[0]
    await payload.update({
      collection: 'pages',
      id: doc.id,
      data,
      depth: 0,
      overrideAccess: true,
    })
    return
  }

  await payload.create({
    collection: 'pages',
    data,
    depth: 0,
    overrideAccess: true,
  })
}

const upsertNavigation = async (
  siteId: string | number,
  locale: string,
  url: string,
  navKey: string,
  data: Record<string, unknown>,
) => {
  const existing = await payload.find({
    collection: 'navigation',
    where: {
      and: [
        { url: { equals: url } },
        { navKey: { equals: navKey } },
        { site: { equals: siteId } },
        { locale: { equals: locale } },
      ],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (existing.totalDocs > 0 && existing.docs[0]) {
    const doc = existing.docs[0]
    await payload.update({
      collection: 'navigation',
      id: doc.id,
      data,
      depth: 0,
      overrideAccess: true,
    })
    return
  }

  await payload.create({
    collection: 'navigation',
    data,
    depth: 0,
    overrideAccess: true,
  })
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
  await ensurePayload()
  const client = new Client(await buildClientConfig())
  await client.connect()
  try {
    await client.query('set search_path to lsites_core, public')

    const languageRows = await fetchRows(client, 'languages')
    const languageMap = new Map<string, string | number>()
    for (const row of languageRows) {
      const id = await upsertLanguage(row.code, row.name, row.is_default ?? false)
      languageMap.set(row.code, id)
    }

    const domainRows = await fetchRows(client, 'site_domains')
    const domainMap = new Map<string, string>()
    for (const row of domainRows) {
      if (row.is_primary) {
        domainMap.set(row.site_id, row.domain)
      }
    }

    const siteRows = await fetchRows(client, 'sites')
    const siteMap = new Map<string, string | number>()
    for (const row of siteRows) {
      const defaultLanguage = languageMap.get(row.default_locale)
      const languages = Array.from(languageMap.values())
      const primaryDomain = row.primary_domain ?? domainMap.get(row.id)
      if (!primaryDomain) continue
      const siteId = await upsertSite(primaryDomain, {
        name: row.name,
        domain: primaryDomain,
        templateId: row.template_id ?? 'marketing-smb-v1',
        defaultLanguage: defaultLanguage ?? languages[0],
        languages,
      })
      siteMap.set(row.id, siteId)
    }

    for (const row of domainRows) {
      const siteId = siteMap.get(row.site_id)
      if (!siteId) continue
      await upsertSiteDomain(row.domain, {
        hostname: row.domain,
        site: siteId,
        primary: row.is_primary ?? false,
      })
    }

    const pageRows = await fetchRows(client, 'pages')
    for (const row of pageRows) {
      const siteId = siteMap.get(row.site_id)
      if (!siteId) continue
      const base = row.data && typeof row.data === 'object' ? row.data : {}
      const data = {
        ...base,
        title: row.title ?? base.title,
        slug: row.slug ?? base.slug,
        status: row.status ?? base.status ?? 'published',
        pageType: base.pageType ?? 'generic',
        site: siteId,
        locale: row.locale ?? base.locale ?? 'en',
      }
      await upsertPage(siteId, data.locale as string, data.slug as string, data)
    }

    const navRows = await fetchRows(client, 'navigation')
    for (const row of navRows) {
      const siteId = siteMap.get(row.site_id)
      if (!siteId) continue
      const base = row.data && typeof row.data === 'object' ? row.data : {}
      const navKey = base.navKey ?? 'primary'
      const url = base.url
      if (!url) continue
      const data = {
        ...base,
        label: base.label ?? row.title,
        url,
        navKey,
        status: row.status ?? base.status ?? 'published',
        site: siteId,
        locale: row.locale ?? base.locale ?? 'en',
      }
      await upsertNavigation(siteId, data.locale as string, data.url as string, data.navKey as string, data)
    }

    console.log('[sync] Supabase → CMS sync complete.')
  } finally {
    await client.end()
  }
}

void run()
