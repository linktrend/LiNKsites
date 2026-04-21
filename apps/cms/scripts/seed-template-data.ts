import payload from 'payload'
import config from '@/payload.config'

const DEFAULT_SITE_NAME = 'LiNKtrend Master'
const DEFAULT_DOMAIN = 'linktrend-master.local'
const DEFAULT_LOCALES = [
  { code: 'en', name: 'English', isDefault: true },
]

const connect = async () => {
  await payload.init({ config })
}

const ensureLanguage = async (code: string, name: string, isDefault: boolean) => {
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

const ensureDefaultSite = async (languageIds: (string | number)[], defaultLanguageId: string | number) => {
  const existing = await payload.find({
    collection: 'sites',
    where: { domain: { equals: DEFAULT_DOMAIN } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const data = {
    name: DEFAULT_SITE_NAME,
    domain: DEFAULT_DOMAIN,
    defaultLanguage: defaultLanguageId as never,
    languages: languageIds as never[],
  }

  if (existing.totalDocs > 0 && existing.docs[0]) {
    const updated = await payload.update({
      collection: 'sites',
      id: existing.docs[0].id,
      data,
      depth: 0,
      overrideAccess: true,
    })
    return updated.id
  }

  const created = await payload.create({
    collection: 'sites',
    data,
    depth: 0,
    overrideAccess: true,
  })
  return created.id
}

const seedGlobalSettings = async () => {
  console.log('\n📝 Seeding global settings...')

  try {
    await payload.updateGlobal({
      slug: 'seo',
      data: {
        titleTemplate: '%s | Master Template',
        defaultTitle: 'Master Website Template',
        defaultDescription: 'Modern, scalable website template',
      },
      overrideAccess: true,
    })
    console.log('✓ SEO global seeded')
  } catch (error) {
    console.error('✗ SEO global failed:', error instanceof Error ? error.message : error)
  }

  // Header global requires a logo upload (media). Skip seeding for now.

  try {
    await payload.updateGlobal({
      slug: 'footer',
      data: {
        columns: [
          {
            heading: 'Company',
            links: [
              { label: 'About', url: '/about' },
              { label: 'Contact', url: '/contact' },
            ],
          },
          {
            heading: 'Legal',
            links: [
              { label: 'Privacy Policy', url: '/privacy-policy' },
              { label: 'Terms of Service', url: '/terms-of-service' },
            ],
          },
        ],
      },
      overrideAccess: true,
    })
    console.log('✓ Footer global seeded')
  } catch (error) {
    console.error('✗ Footer global failed:', error instanceof Error ? error.message : error)
  }
}

const seedPages = async (siteId: string | number, localeCode: string) => {
  console.log('\n📄 Seeding pages...')

  const pages = [
    {
      slug: 'home',
      title: 'Home',
      pageType: 'home',
      content: [
        {
          blockType: 'hero',
          title: 'Welcome to the Master Template',
          subtitle: 'Connect your CMS content or use this demo layout.',
          badge: 'Demo',
          cta: { text: 'Get Started', url: '/contact', style: 'primary' },
        },
        {
          blockType: 'features',
          title: 'Features',
          subtitle: 'Highlights you can configure in CMS',
          items: [
            { icon: 'database', title: 'CMS-driven', description: 'Content pulled from Payload.' },
            { icon: 'globe', title: 'Multi-locale', description: 'Locales handled via normalizeLocale.' },
            { icon: 'server', title: 'Multi-site', description: 'Site key resolved from host.' },
            { icon: 'layout', title: 'Blocks', description: 'Hero, features, pricing, CTA, etc.' },
          ],
        },
        {
          blockType: 'pricing',
          plans: [
            {
              name: 'Starter',
              price: '$0',
              period: 'per month',
              description: 'Perfect for getting started',
              features: [{ feature: 'Basic features', included: true }],
              highlighted: false,
              cta: { text: 'Get Started', url: '/contact' },
            },
            {
              name: 'Pro',
              price: '$29',
              period: 'per month',
              description: 'For professional users',
              features: [
                { feature: 'Everything in Starter', included: true },
                { feature: 'Pro support', included: true },
              ],
              highlighted: true,
              cta: { text: 'Get Started', url: '/contact' },
            },
            {
              name: 'Enterprise',
              price: 'Custom',
              period: 'per month',
              description: 'For large organizations',
              features: [{ feature: 'Custom SLAs', included: true }],
              highlighted: false,
              cta: { text: 'Contact Us', url: '/contact' },
            },
          ],
        },
        {
          blockType: 'cta',
          title: 'Ready to connect your CMS?',
          text: 'Add real content in Payload CMS and it will render here.',
          button: { text: 'Go to Contact', url: '/contact', style: 'primary' },
        },
        {
          blockType: 'newsletter',
          title: 'Stay Updated',
          subtitle: 'Subscribe to our newsletter',
          placeholder: 'Enter your email',
          buttonLabel: 'Subscribe',
        },
      ],
    },
    {
      slug: 'about',
      title: 'About Us',
      pageType: 'about',
      content: [
        {
          blockType: 'hero',
          title: 'Building the Future of AI-Powered Automation',
          subtitle: 'We design, build, and scale intelligent products that automate work, amplify creativity, and connect ideas to results.',
          cta: { text: 'Contact Us', url: '/contact', style: 'primary' },
        },
        {
          blockType: 'richText',
          content: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'heading',
                  tag: 'h2',
                  children: [{ type: 'text', text: 'What We Do' }],
                },
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      text: '[SiteName] is a technology company dedicated to creating, launching, and marketing next-generation applications. We build, iterate, and launch multiple SaaS and mobile applications in parallel — each designed to solve specific challenges in productivity, marketing, or automation. Our platforms integrate advanced AI models for prediction, personalization, and intelligent automation, turning data into actionable outcomes.',
                    },
                  ],
                },
              ],
            },
          },
        },
        {
          blockType: 'features',
          title: 'Our Mission & Vision',
          items: [
            {
              icon: 'Target',
              title: 'Our Mission',
              description:
                'To empower businesses with AI-first solutions that automate work, amplify creativity, and deliver measurable results. We believe technology should work for people, not the other way around.',
            },
            {
              icon: 'Eye',
              title: 'Our Vision',
              description:
                'To become the leading platform for intelligent automation, where every business—regardless of size—can harness the power of AI to transform their operations and achieve unprecedented growth.',
            },
          ],
        },
        {
          blockType: 'features',
          title: 'Core Values',
          items: [
            {
              icon: 'Lightbulb',
              title: 'Innovation First',
              description: 'We push boundaries and embrace new technologies to create cutting-edge solutions.',
            },
            {
              icon: 'Users',
              title: 'Customer Obsession',
              description: 'Our customers\' success is our success. We listen, adapt, and deliver exceptional value.',
            },
            {
              icon: 'Shield',
              title: 'Trust & Transparency',
              description: 'We build trust through honest communication and transparent business practices.',
            },
            {
              icon: 'TrendingUp',
              title: 'Continuous Growth',
              description: 'We invest in learning, improvement, and scaling our impact every single day.',
            },
          ],
        },
        {
          blockType: 'cta',
          title: 'Ready to Transform Your Business?',
          text: 'Join hundreds of companies already using our AI-powered automation platform to streamline operations, boost productivity, and drive growth. Our team is ready to help you get started on your automation journey.',
          button: { text: 'Let\'s Work Together', url: '/contact', style: 'primary' },
        },
      ],
    },
    {
      slug: 'contact',
      title: 'Contact Us',
      pageType: 'contact',
      content: [
        {
          blockType: 'hero',
          title: 'Contact Us',
          subtitle: 'Get in touch with our team',
          cta: { text: 'Email Us', url: 'mailto:info@example.com', style: 'primary' },
        },
        {
          blockType: 'richText',
          content: {
            root: {
              type: 'root',
              children: [
                { type: 'paragraph', children: [{ type: 'text', text: 'Contact form and details coming soon.' }] },
              ],
            },
          },
        },
        {
          blockType: 'cta',
          title: 'Have questions?',
          text: 'We are here to help.',
          button: { text: 'Email Us', url: 'mailto:info@example.com', style: 'primary' },
        },
      ],
    },
    {
      slug: 'pricing',
      title: 'Pricing',
      pageType: 'pricing',
      content: [
        {
          blockType: 'hero',
          title: 'Flexible Pricing for Every Business',
          subtitle: 'Choose the plan that fits your needs',
          cta: { text: 'Get Started', url: '/contact', style: 'primary' },
        },
        {
          blockType: 'richText',
          content: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'heading',
                  tag: 'h2',
                  children: [{ type: 'text', text: 'AI Automation Platform' }],
                },
              ],
            },
          },
        },
        {
          blockType: 'pricing',
          plans: [
            {
              name: 'Free',
              price: '$0',
              period: 'forever',
              description: 'Perfect for trying out AI automation',
              features: [
                { feature: '2 automation workflows', included: true },
                { feature: '100 executions per month', included: true },
                { feature: 'Community support', included: true },
                { feature: 'Basic templates', included: true },
                { feature: 'Email notifications', included: true },
              ],
              highlighted: false,
              cta: { text: 'Get Started', url: '/contact' },
            },
            {
              name: 'Pro',
              price: '$49',
              period: 'per month',
              description: 'Best for teams scaling AI workflows',
              features: [
                { feature: 'Unlimited workflows', included: true },
                { feature: '10,000 executions per month', included: true },
                { feature: 'Priority support', included: true },
                { feature: 'Advanced AI models', included: true },
                { feature: 'Custom integrations', included: true },
                { feature: 'Team collaboration', included: true },
                { feature: 'Advanced analytics', included: true },
                { feature: 'API access', included: true },
              ],
              highlighted: true,
              cta: { text: 'Start Free Trial', url: '/contact' },
            },
            {
              name: 'Enterprise',
              price: 'Custom',
              period: 'contact sales',
              description: 'For organizations with advanced needs',
              features: [
                { feature: 'Unlimited everything', included: true },
                { feature: 'Dedicated account manager', included: true },
                { feature: 'Custom SLA', included: true },
                { feature: 'On-premise deployment', included: true },
                { feature: 'Advanced security', included: true },
                { feature: 'SSO integration', included: true },
                { feature: 'Custom contracts', included: true },
                { feature: '24/7 phone support', included: true },
              ],
              highlighted: false,
              cta: { text: 'Contact Sales', url: '/contact' },
            },
          ],
        },
        {
          blockType: 'richText',
          content: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'heading',
                  tag: 'h2',
                  children: [{ type: 'text', text: 'Data Analytics Suite' }],
                },
              ],
            },
          },
        },
        {
          blockType: 'pricing',
          plans: [
            {
              name: 'Starter',
              price: '$29',
              period: 'per month',
              description: 'Essential analytics for small teams',
              features: [
                { feature: 'Up to 5 data sources', included: true },
                { feature: '10 dashboards', included: true },
                { feature: 'Basic visualizations', included: true },
                { feature: 'Email reports', included: true },
                { feature: '7-day data retention', included: true },
                { feature: 'Community support', included: true },
              ],
              highlighted: false,
              cta: { text: 'Get Started', url: '/contact' },
            },
            {
              name: 'Pro',
              price: '$99',
              period: 'per month',
              description: 'Advanced analytics for growing teams',
              features: [
                { feature: 'Unlimited data sources', included: true },
                { feature: 'Unlimited dashboards', included: true },
                { feature: 'Advanced visualizations', included: true },
                { feature: 'Real-time data', included: true },
                { feature: 'Custom alerts', included: true },
                { feature: '90-day data retention', included: true },
                { feature: 'Priority support', included: true },
                { feature: 'API access', included: true },
              ],
              highlighted: true,
              cta: { text: 'Start Free Trial', url: '/contact' },
            },
            {
              name: 'Enterprise',
              price: 'Custom',
              period: 'contact sales',
              description: 'Enterprise-grade analytics platform',
              features: [
                { feature: 'Everything in Pro', included: true },
                { feature: 'Unlimited data retention', included: true },
                { feature: 'White-label options', included: true },
                { feature: 'Dedicated infrastructure', included: true },
                { feature: 'Advanced security', included: true },
                { feature: 'Custom SLA', included: true },
                { feature: '24/7 support', included: true },
                { feature: 'Training & onboarding', included: true },
              ],
              highlighted: false,
              cta: { text: 'Contact Sales', url: '/contact' },
            },
          ],
        },
        {
          blockType: 'richText',
          content: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'heading',
                  tag: 'h2',
                  children: [{ type: 'text', text: 'AI Strategy & Implementation' }],
                },
              ],
            },
          },
        },
        {
          blockType: 'pricing',
          plans: [
            {
              name: 'Starter',
              price: '$99',
              period: 'per month',
              description: 'Essential strategy consulting',
              features: [
                { feature: 'AI readiness assessment', included: true },
                { feature: 'Strategic roadmap', included: true },
                { feature: 'Technology recommendations', included: true },
                { feature: 'Monthly consulting sessions', included: true },
                { feature: 'Email support', included: true },
              ],
              highlighted: false,
              cta: { text: 'Get Started', url: '/contact' },
            },
            {
              name: 'Professional',
              price: '$299',
              period: 'per month',
              description: 'Comprehensive implementation support',
              features: [
                { feature: 'Everything in Starter', included: true },
                { feature: 'Hands-on implementation', included: true },
                { feature: 'Team training', included: true },
                { feature: 'Weekly consulting sessions', included: true },
                { feature: 'Priority support', included: true },
                { feature: 'Custom AI solutions', included: true },
                { feature: 'Performance optimization', included: true },
              ],
              highlighted: true,
              cta: { text: 'Start Free Trial', url: '/contact' },
            },
            {
              name: 'Enterprise',
              price: 'Custom',
              period: 'contact sales',
              description: 'Full-service AI transformation',
              features: [
                { feature: 'Everything in Professional', included: true },
                { feature: 'Dedicated AI team', included: true },
                { feature: 'Custom development', included: true },
                { feature: '24/7 support', included: true },
                { feature: 'Executive workshops', included: true },
                { feature: 'Change management', included: true },
                { feature: 'Ongoing optimization', included: true },
              ],
              highlighted: false,
              cta: { text: 'Contact Sales', url: '/contact' },
            },
          ],
        },
        {
          blockType: 'richText',
          content: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'heading',
                  tag: 'h2',
                  children: [{ type: 'text', text: 'Data Engineering & Integration' }],
                },
              ],
            },
          },
        },
        {
          blockType: 'pricing',
          plans: [
            {
              name: 'Starter',
              price: '$149',
              period: 'per month',
              description: 'Essential data infrastructure',
              features: [
                { feature: 'Up to 10 data sources', included: true },
                { feature: 'Basic ETL pipelines', included: true },
                { feature: 'Data quality monitoring', included: true },
                { feature: 'Standard integrations', included: true },
                { feature: 'Email support', included: true },
              ],
              highlighted: false,
              cta: { text: 'Get Started', url: '/contact' },
            },
            {
              name: 'Professional',
              price: '$499',
              period: 'per month',
              description: 'Advanced data engineering',
              features: [
                { feature: 'Unlimited data sources', included: true },
                { feature: 'Advanced ETL/ELT', included: true },
                { feature: 'Real-time streaming', included: true },
                { feature: 'Custom integrations', included: true },
                { feature: 'Data governance', included: true },
                { feature: 'Priority support', included: true },
                { feature: 'Performance tuning', included: true },
              ],
              highlighted: true,
              cta: { text: 'Start Free Trial', url: '/contact' },
            },
            {
              name: 'Enterprise',
              price: 'Custom',
              period: 'contact sales',
              description: 'Enterprise data platform',
              features: [
                { feature: 'Everything in Professional', included: true },
                { feature: 'Dedicated infrastructure', included: true },
                { feature: 'Advanced security', included: true },
                { feature: 'Custom data models', included: true },
                { feature: '24/7 support', included: true },
                { feature: 'SLA guarantees', included: true },
                { feature: 'White-glove service', included: true },
              ],
              highlighted: false,
              cta: { text: 'Contact Sales', url: '/contact' },
            },
          ],
        },
        {
          blockType: 'cta',
          title: 'Need a Custom Solution?',
          text: 'Contact our team to discuss your specific requirements and get a tailored pricing plan that fits your business needs.',
          button: { text: 'Contact Sales', url: '/contact', style: 'primary' },
        },
      ],
    },
    {
      slug: 'resources',
      title: 'Resources',
      pageType: 'generic',
      content: [
        {
          blockType: 'hero',
          title: 'Resources',
          subtitle: 'Explore our articles, guides, and case studies',
          cta: { text: 'Browse Articles', url: '/resources', style: 'primary' },
        },
        {
          blockType: 'richText',
          content: {
            root: {
              type: 'root',
              children: [
                { type: 'paragraph', children: [{ type: 'text', text: 'Resources content coming soon.' }] },
              ],
            },
          },
        },
      ],
    },
    {
      slug: 'offers',
      title: 'Our Offers',
      pageType: 'generic',
      content: [
        {
          blockType: 'hero',
          title: 'Our Offers',
          subtitle: 'Discover our products and services',
          cta: { text: 'Learn More', url: '/contact', style: 'primary' },
        },
      ],
    },
    {
      slug: 'privacy-policy',
      title: 'Privacy Policy',
      pageType: 'privacy',
      content: [
        {
          blockType: 'hero',
          title: 'Privacy Policy',
          subtitle: 'How we handle your data',
        },
        {
          blockType: 'richText',
          content: {
            root: {
              type: 'root',
              children: [
                { type: 'heading', tag: 'h2', children: [{ type: 'text', text: 'Privacy Policy' }] },
                {
                  type: 'paragraph',
                  children: [
                    { type: 'text', text: 'This is a placeholder privacy policy. Replace with your actual privacy policy content.' },
                  ],
                },
              ],
            },
          },
        },
      ],
    },
    {
      slug: 'terms-of-service',
      title: 'Terms of Service',
      pageType: 'terms',
      content: [
        {
          blockType: 'hero',
          title: 'Terms of Service',
          subtitle: 'Our terms and conditions',
        },
        {
          blockType: 'richText',
          content: {
            root: {
              type: 'root',
              children: [
                { type: 'heading', tag: 'h2', children: [{ type: 'text', text: 'Terms of Service' }] },
                {
                  type: 'paragraph',
                  children: [
                    { type: 'text', text: 'This is a placeholder terms of service. Replace with your actual terms and conditions.' },
                  ],
                },
              ],
            },
          },
        },
      ],
    },
  ]

  for (const pageData of pages) {
    try {
      const existing = await payload.find({
        collection: 'pages',
        where: {
          and: [{ slug: { equals: pageData.slug } }, { site: { equals: siteId } }, { locale: { equals: localeCode } }],
        },
        limit: 1,
        depth: 0,
      })

      if (existing.totalDocs > 0 && existing.docs[0]) {
        await payload.update({
          collection: 'pages',
          id: existing.docs[0].id,
          data: { ...pageData, site: siteId as never, locale: localeCode as never, status: 'published' },
          depth: 0,
        })
        console.log(`✓ Updated page: ${pageData.slug}`)
      } else {
        await payload.create({
          collection: 'pages',
        data: { ...pageData, site: siteId as never, locale: localeCode as never, status: 'published' },
          depth: 0,
          overrideAccess: true,
        })
        console.log(`✓ Created page: ${pageData.slug}`)
      }
    } catch (error) {
      console.error(`✗ Failed page ${pageData.slug}:`, error instanceof Error ? error.message : error)
    }
  }
}

const seedNavigation = async (siteId: string | number, localeCode: string) => {
  console.log('\n🧭 Seeding navigation...')

  const navItems = [
    { label: 'Home', url: '/', order: 0 },
    { label: 'About', url: '/about', order: 1 },
    { label: 'Pricing', url: '/pricing', order: 2 },
    { label: 'Resources', url: '/resources', order: 3 },
    { label: 'Contact', url: '/contact', order: 4 },
  ]

  for (const navData of navItems) {
    try {
      const existing = await payload.find({
        collection: 'navigation',
        where: {
        and: [{ url: { equals: navData.url } }, { site: { equals: siteId } }, { locale: { equals: localeCode } }],
        },
        limit: 1,
        depth: 0,
      })

      if (existing.totalDocs > 0 && existing.docs[0]) {
        await payload.update({
          collection: 'navigation',
          id: existing.docs[0].id,
          data: { ...navData, site: siteId as never, locale: localeCode as never, status: 'published' },
          depth: 0,
        })
        console.log(`✓ Updated navigation: ${navData.label}`)
      } else {
        await payload.create({
          collection: 'navigation',
          data: {
            ...navData,
            site: siteId as never,
            locale: localeCode as never,
            status: 'published',
            slug: navData.label.toLowerCase().replace(/\s+/g, '-'),
          },
          depth: 0,
          overrideAccess: true,
        })
        console.log(`✓ Created navigation: ${navData.label}`)
      }
    } catch (error) {
      console.error(`✗ Failed navigation ${navData.label}:`, error instanceof Error ? error.message : error)
    }
  }
}

const seedPlaceholderContent = async (_siteId: string | number, _localeCode: string) => {
  console.log('\n📦 Placeholder content skipped')
  console.log('   Articles/help/videos require additional relationships; add real content in CMS as needed.')
}

const run = async () => {
  console.log('🚀 Starting template data seeding...\n')
  await connect()

  // 1. Languages
  const languageIds: Array<{ id: string | number; isDefault: boolean }> = []
  for (const locale of DEFAULT_LOCALES) {
    const id = await ensureLanguage(locale.code, locale.name, locale.isDefault)
    if (id) {
      languageIds.push({ id, isDefault: locale.isDefault })
    }
  }
  const defaultLang = languageIds.find((l) => l.isDefault) ?? languageIds[0]
  const defaultLanguageId = defaultLang?.id
  const defaultLocaleCode = (DEFAULT_LOCALES.find((l) => l.isDefault) ?? DEFAULT_LOCALES[0])?.code
  if (!defaultLanguageId || !defaultLocaleCode) {
    throw new Error('No default language found')
  }
  console.log('✓ Languages ensured')

  // 2. Site
  const siteId = await ensureDefaultSite(
    languageIds.map((l) => l.id),
    defaultLanguageId
  )
  console.log('✓ Default site ensured')

  // 3. Globals
  await seedGlobalSettings()

  // 4. Pages
  await seedPages(siteId, defaultLocaleCode)

  // 5. Navigation
  await seedNavigation(siteId, defaultLocaleCode)

  // 6. Placeholder content
  await seedPlaceholderContent(siteId, defaultLocaleCode)

  console.log('\n✅ Template data seeding complete!')
  console.log('\n📋 Summary:')
  console.log('  - 8 pages created (home, about, contact, pricing, resources, offers, privacy-policy, terms-of-service)')
  console.log('  - 5 navigation items')
  console.log('  - 2 globals (SEO, Footer)')
  console.log('  - placeholder content skipped (add in CMS as needed)')
}

void run().then(() => {
  process.exit(0)
})
