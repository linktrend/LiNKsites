import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import type { LocaleCode } from '@linksites/types'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import crypto from 'crypto'

// Collections
import { Articles } from '@/collections/Articles'
import { ArticleCategories } from '@/collections/ArticleCategories'
import { CaseStudyCategories } from '@/collections/CaseStudyCategories'
import { CaseStudyPage } from '@/collections/CaseStudyPage'
import { FAQPage } from '@/collections/FAQPage'
import { HelpArticles } from '@/collections/HelpArticles'
import { HelpCategories } from '@/collections/HelpCategories'
import { Languages } from '@/collections/Languages'
import { Media } from '@/collections/Media'
import { Navigation } from '@/collections/Navigation'
import { OfferCategories } from '@/collections/OfferCategories'
import { OfferPage } from '@/collections/OfferPage'
import { Roles } from '@/collections/Roles'
import { Sites } from '@/collections/Sites'
import { SiteSettings } from '@/collections/SiteSettings'
import { TermsPage } from '@/collections/TermsPage'
import { Testimonials } from '@/collections/Testimonials'
import { TranslationQueue } from '@/collections/TranslationQueue'
import { Users } from '@/collections/Users'
import { APIKeys } from '@/collections/APIKeys'
import { VideoCategories } from '@/collections/VideoCategories'
import { VideoPage } from '@/collections/VideoPage'
import { Videos } from '@/collections/Videos'
import { PrivacyPage } from '@/collections/PrivacyPage'
import { CookiePolicyPage } from '@/collections/CookiePolicyPage'
import { Pages } from '@/collections/Pages'
import { SiteDomains } from '@/collections/SiteDomains'
import { Locations } from '@/collections/Locations'
import { TeamMembers } from '@/collections/TeamMembers'

// Globals
import { ContactInfoGlobal } from '@/globals/ContactInfoGlobal'
import { FooterGlobal } from '@/globals/FooterGlobal'
import { HeaderGlobal } from '@/globals/HeaderGlobal'
import { LegalGlobal } from '@/globals/LegalGlobal'
import { SEOGlobal } from '@/globals/SEOGlobal'
import { applyGlobalCollectionHooks } from '@/hooks/globalHooks'
import { manageUsersAccess } from '@/access'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Validate required environment variables.
//
// Payload codegen commands (generate:types / generate:importmap) should not
// hard-fail when DATABASE_URI is missing, because they don't need a live DB.
const isPayloadCodegen = process.argv.some((arg) => {
  return arg.includes('generate:types') || arg.includes('generate:importmap')
})

const databaseUri =
  process.env.DATABASE_URI ??
  (isPayloadCodegen ? 'postgresql://user:pass@localhost:5432/payload' : undefined)

if (!databaseUri) {
  throw new Error('DATABASE_URI environment variable is required. Please add it to your .env file.')
}

if (!/^postgres(ql)?:\/\//.test(databaseUri)) {
  throw new Error('DATABASE_URI must be a PostgreSQL connection string (postgres:// or postgresql://).')
}
const databaseHostname = (() => {
  try {
    return new URL(databaseUri).hostname.toLowerCase()
  } catch {
    return ''
  }
})()
const useSupabaseSsl = databaseHostname.endsWith('.supabase.co')

if (!process.env.PAYLOAD_SECRET) {
  console.warn(
    '⚠️  PAYLOAD_SECRET is not set. This is required for production. Generating temporary secret...'
  )
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      beforeNavLinks: ['/admin/components/SiteSelectorNav'],
      graphics: {
        Logo: '/admin/graphics/Logo',
        Icon: '/admin/graphics/Icon',
      },
      views: {
        ApprovalQueue: {
          Component: '/admin/views/ApprovalQueue',
          path: '/approval-queue',
        },
        TranslationQueue: {
          Component: '/admin/views/TranslationQueue',
          path: '/translation-queue',
        },
        SiteDashboard: {
          Component: '/admin/views/SiteDashboard',
          path: '/site-dashboard',
        },
      },
    },
    meta: {
      titleSuffix: ' | LiNKtrend CMS',
      description: 'LiNKtrend multi-site content console',
    },
  },
  collections: applyGlobalCollectionHooks([
    // Core Collections
    Users,
    APIKeys,
    Roles,
    Sites,
    SiteDomains,
    SiteSettings,
    Languages,
    Media,
    Navigation,
    Testimonials,
    Locations,
    TeamMembers,

    // Taxonomy Collections
    ArticleCategories,
    CaseStudyCategories,
    OfferCategories,
    HelpCategories,
    VideoCategories,

    // Content Collections
    Articles,
    HelpArticles,
    Videos,

    // Page Collections
    Pages,
    OfferPage,
    CaseStudyPage,
    VideoPage,
    FAQPage,
    TermsPage,
    PrivacyPage,
    CookiePolicyPage,
    TranslationQueue,
  ]),
  globals: [
    HeaderGlobal,
    FooterGlobal,
    SEOGlobal,
    LegalGlobal,
    ContactInfoGlobal,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: databaseUri,
      ssl: useSupabaseSsl
        ? { rejectUnauthorized: false }
        : false,
    },
    // Auto-push in development (no prompts after first migration)
    // Use explicit migrations in production for safety
    push: process.env.NODE_ENV !== 'production',
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  localization: {
    locales: [
      {
        label: 'English',
        code: 'en',
      },
      {
        label: '繁體中文',
        code: 'zh-TW',
      },
      {
        label: 'Español',
        code: 'es',
      },
    ] as Array<{ label: string; code: LocaleCode }>,
    defaultLocale: 'en',
    fallback: true,
  },
  cors: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
  ].filter(Boolean),
  csrf: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
  ].filter(Boolean),
  sharp,
  endpoints: [
    {
      path: '/users/:id/api-key',
      method: 'post',
      handler: async (req) => {
        const id = req.routeParams?.id
        if (!id) {
          return Response.json({ message: 'Missing user ID' }, { status: 400 })
        }
        if (!req.user) {
          return Response.json({ message: 'Not authenticated' }, { status: 401 })
        }

        const canManage = await manageUsersAccess({ req })
        const isSelf = req.user?.id === id || String(req.user?.id) === String(id)
        if (!canManage && !isSelf) {
          return Response.json({ message: 'Forbidden' }, { status: 403 })
        }

        const apiKey = crypto.randomBytes(48).toString('hex')
        try {
          await req.payload.update({
            collection: 'users' as const,
            id: String(id),
            data: {
              enableAPIKey: true,
              apiKey,
            } as Record<string, unknown>,
            depth: 0,
            overrideAccess: true,
          })
          return Response.json({ apiKey }, { status: 200 })
        } catch (error) {
          return Response.json({
            message: 'Failed to generate API key',
            error: error instanceof Error ? error.message : 'Unknown error',
          }, { status: 500 })
        }
      },
    },
  ],
  plugins: [],
} satisfies Parameters<typeof buildConfig>[0])
