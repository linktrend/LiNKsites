import { getPayload } from 'payload'
import config from '@/payload.config'

type ArgMap = Record<string, string | undefined>

const lexicalDoc = (title: string, body: string) => ({
  root: {
    type: 'root',
    children: [
      {
        type: 'heading',
        tag: 'h2',
        children: [{ type: 'text', text: title }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: body }],
      },
    ],
  },
})

const parseArgs = (): ArgMap => {
  const args = process.argv.slice(2)
  const out: ArgMap = {}
  for (const raw of args) {
    const [k, v] = raw.split('=')
    if (!k) continue
    out[k.replace(/^--/, '')] = v
  }
  return out
}

const requireArg = (args: ArgMap, key: string): string => {
  const value = args[key]
  if (!value) {
    throw new Error(`Missing required arg --${key}=...`)
  }
  return value
}

async function main() {
  const args = parseArgs()

  const name = requireArg(args, 'name')
  const hostname = requireArg(args, 'hostname') // demo or real domain
  const templateId = args.templateId ?? 'marketing-smb-v1'
  const locales = (args.locales ?? 'en').split(',').map((s) => s.trim()).filter(Boolean)

  const payload = await getPayload({ config })

  // Resolve languages by code (needed by Sites collection).
  const languages = await payload.find({
    collection: 'languages',
    where: { code: { in: locales } },
    limit: 100,
    overrideAccess: true,
  })
  if (languages.docs.length === 0) {
    throw new Error(`No languages found for locales=${locales.join(',')}. Seed languages first.`)
  }

  const defaultLanguageDoc =
    languages.docs.find((l) => (l as any).isDefault === true) ?? languages.docs[0]

  // Create Site
  const site = await payload.create({
    collection: 'sites',
    data: {
      name,
      domain: hostname,
      templateId,
      defaultLanguage: (defaultLanguageDoc as any).id,
      languages: languages.docs.map((l) => (l as any).id),
    } as any,
    overrideAccess: true,
  })

  // Map hostname -> site
  await payload.create({
    collection: 'site-domains',
    data: {
      hostname,
      site: site.id,
      primary: true,
    } as any,
    overrideAccess: true,
  })

  // Create minimal Location + Team member docs per locale (published)
  for (const locale of locales) {
    const location = await payload.create({
      collection: 'locations',
      data: {
        name: `${name} - Main Location`,
        slug: `main-location-${locale}`,
        city: 'Your City',
        state: 'Your State',
        site: site.id,
        locale,
        status: 'published',
      } as any,
      overrideAccess: true,
      locale,
    })

    const teamMember = await payload.create({
      collection: 'team-members',
      data: {
        name: 'Owner',
        slug: `owner-${locale}`,
        role: 'Founder',
        site: site.id,
        locale,
        status: 'published',
      } as any,
      overrideAccess: true,
      locale,
    })

    // Site settings per locale (published)
    await payload.create({
      collection: 'site-settings',
      data: {
        site: site.id,
        locale,
        templateId,
        status: 'published',
      } as any,
      overrideAccess: true,
      locale,
    })

    // Pages: home/about/contact/locations/team (published)
    await payload.create({
      collection: 'pages',
      data: {
        title: 'Home',
        slug: 'home',
        pageType: 'home',
        site: site.id,
        locale,
        status: 'published',
        content: [
          {
            blockType: 'hero',
            badge: 'Local Business',
            title: name,
            subtitle: 'Modern website built by LiNKsites Factory Kit',
            cta: { text: 'Contact', url: `/${locale}/contact`, style: 'primary' },
          },
          {
            blockType: 'features',
            title: 'What We Do',
            subtitle: 'Fast, reliable, and professional',
            items: [
              { icon: 'check', title: 'Quality work', description: 'We treat your property like our own.' },
              { icon: 'clock', title: 'On-time', description: 'Clear scheduling and reliable arrivals.' },
              { icon: 'shield', title: 'Insured', description: 'Peace of mind for every job.' },
              { icon: 'star', title: 'Trusted', description: 'Local references available.' },
            ],
          },
          {
            blockType: 'cta',
            title: 'Get a free quote',
            text: 'Tell us what you need and we will respond quickly.',
            button: { text: 'Contact us', url: `/${locale}/contact`, style: 'primary' },
            backgroundColor: 'default',
          },
        ],
      } as any,
      overrideAccess: true,
      locale,
    })

    await payload.create({
      collection: 'pages',
      data: {
        title: 'About',
        slug: 'about',
        pageType: 'about',
        site: site.id,
        locale,
        status: 'published',
        content: [
          {
            blockType: 'hero',
            badge: 'About Us',
            title: name,
            subtitle: 'Local, reliable, and professional',
            cta: { text: 'Contact', url: `/${locale}/contact`, style: 'primary' },
          },
          {
            blockType: 'richText',
            content: lexicalDoc(
              'Our Story',
              'This is demo content seeded by the factory. Replace it with the business story, values, and mission.',
            ),
          },
        ],
      } as any,
      overrideAccess: true,
      locale,
    })

    await payload.create({
      collection: 'pages',
      data: {
        title: 'Contact',
        slug: 'contact',
        pageType: 'contact',
        site: site.id,
        locale,
        status: 'published',
        content: [
          {
            blockType: 'richText',
            content: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'heading',
                    tag: 'h2',
                    children: [{ type: 'text', text: 'Contact' }],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'text',
                        text: 'Send a message and we will get back to you.',
                      },
                    ],
                  },
                ],
              },
            },
          },
        ],
      } as any,
      overrideAccess: true,
      locale,
    })

    await payload.create({
      collection: 'pages',
      data: {
        title: 'Locations',
        slug: 'locations',
        pageType: 'generic',
        site: site.id,
        locale,
        status: 'published',
        content: [
          {
            blockType: 'locations',
            title: 'Locations',
            subtitle: 'Where we serve',
            items: [location.id],
          },
        ],
      } as any,
      overrideAccess: true,
      locale,
    })

    await payload.create({
      collection: 'pages',
      data: {
        title: 'Team',
        slug: 'team',
        pageType: 'generic',
        site: site.id,
        locale,
        status: 'published',
        content: [
          {
            blockType: 'teamMembers',
            title: 'Team',
            subtitle: 'Meet the people behind the work',
            items: [teamMember.id],
          },
        ],
      } as any,
      overrideAccess: true,
      locale,
    })

    // Navigation (published)
    await payload.create({
      collection: 'navigation',
      data: {
        navKey: 'primary',
        label: 'Home',
        url: `/${locale}`,
        order: 0,
        site: site.id,
        locale,
        status: 'published',
      } as any,
      overrideAccess: true,
      locale,
    })

    await payload.create({
      collection: 'navigation',
      data: {
        navKey: 'primary',
        label: 'Services',
        url: `/${locale}/offers`,
        order: 10,
        site: site.id,
        locale,
        status: 'published',
      } as any,
      overrideAccess: true,
      locale,
    })

    await payload.create({
      collection: 'navigation',
      data: {
        navKey: 'primary',
        label: 'About',
        url: `/${locale}/about`,
        order: 5,
        site: site.id,
        locale,
        status: 'published',
      } as any,
      overrideAccess: true,
      locale,
    })

    const resourcesParent = await payload.create({
      collection: 'navigation',
      data: {
        navKey: 'primary',
        label: 'Resources',
        url: '#',
        order: 20,
        site: site.id,
        locale,
        status: 'published',
      } as any,
      overrideAccess: true,
      locale,
    })

    await payload.create({
      collection: 'navigation',
      data: {
        navKey: 'primary',
        label: 'Articles',
        url: `/${locale}/resources/articles`,
        parent: resourcesParent.id,
        order: 0,
        site: site.id,
        locale,
        status: 'published',
      } as any,
      overrideAccess: true,
      locale,
    })

    await payload.create({
      collection: 'navigation',
      data: {
        navKey: 'primary',
        label: 'Case Studies',
        url: `/${locale}/resources/cases`,
        parent: resourcesParent.id,
        order: 10,
        site: site.id,
        locale,
        status: 'published',
      } as any,
      overrideAccess: true,
      locale,
    })

    await payload.create({
      collection: 'navigation',
      data: {
        navKey: 'primary',
        label: 'Videos',
        url: `/${locale}/resources/videos`,
        parent: resourcesParent.id,
        order: 20,
        site: site.id,
        locale,
        status: 'published',
      } as any,
      overrideAccess: true,
      locale,
    })

    await payload.create({
      collection: 'navigation',
      data: {
        navKey: 'primary',
        label: 'Help',
        url: `/${locale}/resources/faq`,
        parent: resourcesParent.id,
        order: 30,
        site: site.id,
        locale,
        status: 'published',
      } as any,
      overrideAccess: true,
      locale,
    })

    await payload.create({
      collection: 'navigation',
      data: {
        navKey: 'primary',
        label: 'Contact',
        url: `/${locale}/contact`,
        order: 30,
        site: site.id,
        locale,
        status: 'published',
      } as any,
      overrideAccess: true,
      locale,
    })

    const footerCompany = await payload.create({
      collection: 'navigation',
      data: {
        navKey: 'footer',
        label: 'Company',
        url: '#',
        order: 0,
        site: site.id,
        locale,
        status: 'published',
      } as any,
      overrideAccess: true,
      locale,
    })

    await payload.create({
      collection: 'navigation',
      data: {
        navKey: 'footer',
        label: 'Locations',
        url: `/${locale}/locations`,
        parent: footerCompany.id,
        order: 0,
        site: site.id,
        locale,
        status: 'published',
      } as any,
      overrideAccess: true,
      locale,
    })

    await payload.create({
      collection: 'navigation',
      data: {
        navKey: 'footer',
        label: 'Team',
        url: `/${locale}/team`,
        parent: footerCompany.id,
        order: 10,
        site: site.id,
        locale,
        status: 'published',
      } as any,
      overrideAccess: true,
      locale,
    })

    await payload.create({
      collection: 'navigation',
      data: {
        navKey: 'footer',
        label: 'About',
        url: `/${locale}/about`,
        parent: footerCompany.id,
        order: 15,
        site: site.id,
        locale,
        status: 'published',
      } as any,
      overrideAccess: true,
      locale,
    })

    await payload.create({
      collection: 'navigation',
      data: {
        navKey: 'footer',
        label: 'Contact',
        url: `/${locale}/contact`,
        parent: footerCompany.id,
        order: 20,
        site: site.id,
        locale,
        status: 'published',
      } as any,
      overrideAccess: true,
      locale,
    })

    const footerLegal = await payload.create({
      collection: 'navigation',
      data: {
        navKey: 'footer',
        label: 'Legal',
        url: '#',
        order: 10,
        site: site.id,
        locale,
        status: 'published',
      } as any,
      overrideAccess: true,
      locale,
    })

    await payload.create({
      collection: 'navigation',
      data: {
        navKey: 'footer',
        label: 'Terms of Use',
        url: `/${locale}/legal/terms-of-use`,
        parent: footerLegal.id,
        order: 0,
        site: site.id,
        locale,
        status: 'published',
      } as any,
      overrideAccess: true,
      locale,
    })

    await payload.create({
      collection: 'navigation',
      data: {
        navKey: 'footer',
        label: 'Privacy Policy',
        url: `/${locale}/legal/privacy-policy`,
        parent: footerLegal.id,
        order: 10,
        site: site.id,
        locale,
        status: 'published',
      } as any,
      overrideAccess: true,
      locale,
    })

    await payload.create({
      collection: 'navigation',
      data: {
        navKey: 'footer',
        label: 'Cookie Policy',
        url: `/${locale}/legal/cookie-policy`,
        parent: footerLegal.id,
        order: 20,
        site: site.id,
        locale,
        status: 'published',
      } as any,
      overrideAccess: true,
      locale,
    })

    // Legal docs (published) - separate collections used by the frontend legal routes.
    const lastUpdated = new Date().toISOString()

    await payload.create({
      collection: 'terms-pages',
      data: {
        title: 'Terms of Use',
        slug: 'terms-of-use',
        content: [
          {
            blockType: 'richText',
            content: lexicalDoc(
              'Terms of Use',
              'These are sample terms for a demo site. Replace this content before going live.',
            ),
          },
        ],
        lastUpdated,
        site: site.id,
        locale,
        status: 'published',
      } as any,
      overrideAccess: true,
      locale,
    })

    await payload.create({
      collection: 'privacy-pages',
      data: {
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        content: [
          {
            blockType: 'richText',
            content: lexicalDoc(
              'Privacy Policy',
              'This is sample policy text for a demo site. Replace this content before going live.',
            ),
          },
        ],
        lastUpdated,
        site: site.id,
        locale,
        status: 'published',
      } as any,
      overrideAccess: true,
      locale,
    })

    await payload.create({
      collection: 'cookie-policy-pages',
      data: {
        title: 'Cookie Policy',
        slug: 'cookie-policy',
        content: [
          {
            blockType: 'richText',
            content: lexicalDoc(
              'Cookie Policy',
              'This is sample cookie policy text for a demo site. Replace this content before going live.',
            ),
          },
        ],
        lastUpdated,
        site: site.id,
        locale,
        status: 'published',
      } as any,
      overrideAccess: true,
      locale,
    })

    // Offers/services (published) - powers /{locale}/offers
    const offerCategory = await payload.create({
      collection: 'offer-categories',
      data: {
        name: 'Services',
        site: site.id,
        locale,
        status: 'published',
      } as any,
      overrideAccess: true,
      locale,
    })

    await payload.create({
      collection: 'offer-pages',
      data: {
        title: 'Core Service',
        slug: 'core-service',
        category: offerCategory.id,
        excerpt: 'A simple demo service offering you can replace with real content.',
        content: [
          {
            blockType: 'hero',
            title: 'Core Service',
            subtitle: 'A demo offer page powered by the CMS',
            cta: { text: 'Contact', url: `/${locale}/contact`, style: 'primary' },
          },
          {
            blockType: 'richText',
            content: lexicalDoc(
              'What You Get',
              'This offer page is seeded content. Replace it with your real service description.',
            ),
          },
          {
            blockType: 'cta',
            title: 'Request a quote',
            text: 'Tell us what you need and we will respond quickly.',
            button: { text: 'Contact', url: `/${locale}/contact`, style: 'primary' },
          },
        ],
        site: site.id,
        locale,
        status: 'published',
      } as any,
      overrideAccess: true,
      locale,
    })

    // Case studies (published) - powers /{locale}/resources/cases
    const caseCategory = await payload.create({
      collection: 'case-study-categories',
      data: {
        name: 'Success Stories',
        site: site.id,
        locale,
        status: 'published',
      } as any,
      overrideAccess: true,
      locale,
    })

    await payload.create({
      collection: 'case-study-pages',
      data: {
        title: 'Local Success Story',
        slug: 'local-success-story',
        category: caseCategory.id,
        client: name,
        excerpt: 'A demo case study seeded by the factory.',
        challenge: lexicalDoc('Challenge', 'Describe the client challenge here.') as any,
        solution: lexicalDoc('Solution', 'Describe your solution and approach here.') as any,
        results: [
          { metric: 'Response time', value: 'Under 24 hours' },
          { metric: 'Customer satisfaction', value: '5-star average' },
        ],
        site: site.id,
        locale,
        status: 'published',
      } as any,
      overrideAccess: true,
      locale,
    })

    // Videos (published) - powers /{locale}/resources/videos
    const videoCategory = await payload.create({
      collection: 'video-categories',
      data: {
        name: 'How-To',
        site: site.id,
        locale,
        status: 'published',
      } as any,
      overrideAccess: true,
      locale,
    })

    await payload.create({
      collection: 'videos',
      data: {
        title: 'What We Do (Demo Video)',
        slug: 'what-we-do',
        category: videoCategory.id,
        youtubeId: 'dQw4w9WgXcQ',
        description: 'A demo video entry seeded by the factory.',
        content: [
          {
            blockType: 'richText',
            content: lexicalDoc('Video', 'Replace this demo entry with your real video content.'),
          },
        ],
        site: site.id,
        locale,
        status: 'published',
      } as any,
      overrideAccess: true,
      locale,
    })

    // FAQ (published) - used by offer pages (and future help center integration)
    await payload.create({
      collection: 'faq-pages',
      data: {
        title: 'FAQ',
        slug: 'faq',
        content: [
          {
            blockType: 'hero',
            title: 'FAQ',
            subtitle: 'Answers to common questions',
            cta: { text: 'Contact', url: `/${locale}/contact`, style: 'primary' },
          },
          {
            blockType: 'faq',
            title: 'Frequently Asked Questions',
            questions: [
              {
                question: 'How fast can you start?',
                answer: lexicalDoc('Answer', 'We can usually start quickly. Contact us to confirm availability.') as any,
              },
              {
                question: 'Do you offer free estimates?',
                answer: lexicalDoc('Answer', 'Yes. Send us details and we will respond with a quote.') as any,
              },
            ],
          },
        ],
        site: site.id,
        locale,
        status: 'published',
      } as any,
      overrideAccess: true,
      locale,
    })
  }

  console.log(JSON.stringify({ siteId: site.id, hostname, templateId, locales }, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
