import payload from 'payload'
import config from '@/payload.config'

const SUPER_ADMIN_ROLE = 'Super Admin'
const DEFAULT_SITE_NAME = 'LiNKtrend Master'
const DEFAULT_DOMAIN = 'linktrend-master.local'
const DEFAULT_LOCALES = [
  { code: 'en', name: 'English', isDefault: true },
  { code: 'es', name: 'Spanish', isDefault: false },
  { code: 'zh-tw', name: 'Traditional Chinese', isDefault: false },
  { code: 'zh-cn', name: 'Simplified Chinese', isDefault: false },
]
const DEFAULT_TEMPLATE_ID = 'marketing-smb-v1'

const connect = async () => {
  await payload.init({
    config,
  })
}

const ensureLanguage = async (code: string, name: string, isDefault: boolean) => {
  const existing = await payload.find({
    collection: 'languages',
    where: { code: { equals: code } },
    limit: 1,
    depth: 0,
  })

  if (existing.totalDocs > 0) {
    const doc = existing.docs[0]
    if (doc) {
      await payload.update({
        collection: 'languages',
        id: doc.id,
        data: { name, isDefault },
        depth: 0,
      })
      return doc.id
    }
  }

  const created = await payload.create({
    collection: 'languages',
    data: { code, name, isDefault },
    depth: 0,
  })
  return String(created.id)
}

const ensureSuperAdminRole = async () => {
  const existing = await payload.find({
    collection: 'roles',
    where: { name: { equals: SUPER_ADMIN_ROLE } },
    limit: 1,
    depth: 0,
  })

  if (existing.totalDocs > 0 && existing.docs[0]) {
    return String(existing.docs[0].id)
  }

  const created = await payload.create({
    collection: 'roles',
    data: {
      name: SUPER_ADMIN_ROLE,
      description: 'Bootstrap super admin role with full permissions',
      permissions: {
        read: true,
        create: true,
        update: true,
        delete: true,
        publish: true,
        approve: true,
        submit_for_review: true,
        manage_users: true,
        manage_roles: true,
        manage_sites: true,
      },
      isDefault: false,
    },
    depth: 0,
  })
  return String(created.id)
}

const ensureDefaultSite = async (languageIds: string[], defaultLanguageId: string) => {
  const existing = await payload.find({
    collection: 'sites',
    where: { domain: { equals: DEFAULT_DOMAIN } },
    limit: 1,
    depth: 0,
  })

  const data = {
    name: DEFAULT_SITE_NAME,
    domain: DEFAULT_DOMAIN,
    templateId: DEFAULT_TEMPLATE_ID,
    defaultLanguage: defaultLanguageId as never,
    languages: languageIds as never[],
  }

  if (existing.totalDocs > 0 && existing.docs[0]) {
    const updated = await payload.update({
      collection: 'sites',
      id: existing.docs[0].id,
      data,
      depth: 0,
    })
    return String(updated.id)
  }

  const created = await payload.create({
    collection: 'sites',
    data,
    depth: 0,
  })
  return String(created.id)
}

const ensureSiteDomain = async (hostname: string, siteId: string, primary: boolean) => {
  const existing = await payload.find({
    collection: 'site-domains',
    where: { hostname: { equals: hostname } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (existing.totalDocs > 0 && existing.docs[0]) {
    await payload.update({
      collection: 'site-domains',
      id: existing.docs[0].id,
      data: { site: siteId as never, primary },
      depth: 0,
      overrideAccess: true,
    })
    return
  }

  await payload.create({
    collection: 'site-domains',
    data: { hostname, site: siteId as never, primary },
    depth: 0,
    overrideAccess: true,
  })
}

const ensureSiteSettings = async (siteId: string, locale: string) => {
  const existing = await payload.find({
    collection: 'site-settings',
    where: { and: [{ site: { equals: siteId } }, { locale: { equals: locale } }] },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const data = {
    site: siteId as never,
    locale,
    templateId: DEFAULT_TEMPLATE_ID,
    status: 'published',
  }

  if (existing.totalDocs > 0 && existing.docs[0]) {
    await payload.update({
      collection: 'site-settings',
      id: existing.docs[0].id,
      data: data as any,
      depth: 0,
      overrideAccess: true,
    })
    return
  }

  await payload.create({
    collection: 'site-settings',
    data: data as any,
    depth: 0,
    overrideAccess: true,
  })
}

const run = async () => {
  await connect()

  const languageIds: Array<{ id: string; isDefault: boolean }> = []
  for (const locale of DEFAULT_LOCALES) {
    const id = await ensureLanguage(locale.code, locale.name, locale.isDefault)
    if (id) {
      languageIds.push({ id: String(id), isDefault: locale.isDefault })
    }
  }
  const defaultLang = languageIds.find((l) => l.isDefault) ?? languageIds[0]
  const defaultLanguageId = defaultLang?.id
  if (!defaultLanguageId) {
    throw new Error('No default language found')
  }
  const superAdminRoleId = await ensureSuperAdminRole()
  const siteId = await ensureDefaultSite(
    languageIds.map((l) => l.id),
    defaultLanguageId,
  )

  // Ensure hostnames resolve to the default site in local dev.
  await ensureSiteDomain(DEFAULT_DOMAIN, siteId, true)
  await ensureSiteDomain('localhost', siteId, false)

  // Ensure site settings exist per locale (template selection is read from here).
  for (const locale of DEFAULT_LOCALES.map((l) => l.code)) {
    await ensureSiteSettings(siteId, locale)
  }

  // eslint-disable-next-line no-console
  console.log('Bootstrap seed complete', {
    superAdminRoleId,
    siteId,
    languages: languageIds,
  })
}

void run().then(() => {
  process.exit(0)
})
