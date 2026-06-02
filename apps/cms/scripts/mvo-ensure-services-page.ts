import { getPayload } from 'payload'
import config from '@/payload.config'

const parseArgs = (): Record<string, string> => {
  const out: Record<string, string> = {}
  for (const raw of process.argv.slice(2)) {
    const [k, v] = raw.split('=')
    if (k?.startsWith('--') && v) out[k.slice(2)] = v
  }
  return out
}

const lexicalDoc = (title: string, body: string) => ({
  root: {
    type: 'root',
    children: [
      { type: 'heading', tag: 'h2', children: [{ type: 'text', text: title }] },
      { type: 'paragraph', children: [{ type: 'text', text: body }] },
    ],
  },
})

async function main() {
  const args = parseArgs()
  const siteIdRaw = args.siteId
  const locale = args.locale ?? 'en'
  if (!siteIdRaw) throw new Error('Missing --siteId=')
  const siteId = Number(siteIdRaw)
  if (!Number.isFinite(siteId)) throw new Error(`Invalid --siteId=${siteIdRaw}`)

  const payload = await getPayload({ config })
  const existing = await payload.find({
    collection: 'pages',
    where: {
      and: [
        { slug: { equals: 'services' } },
        { site: { equals: siteId } },
        { locale: { equals: locale } },
      ],
    },
    limit: 1,
    overrideAccess: true,
  })

  if (existing.totalDocs > 0) {
    console.log(JSON.stringify({ ok: true, alreadyExisted: true, pageId: existing.docs[0]?.id }))
    return
  }

  const page = await payload.create({
    collection: 'pages',
    data: {
      title: 'Services',
      slug: 'services',
      pageType: 'generic',
      site: siteId,
      locale: locale as never,
      status: 'published',
      content: [
        {
          blockType: 'hero',
          title: 'Our Services',
          subtitle: 'Professional lawn care and landscaping',
          cta: { text: 'Contact', url: `/${locale}/contact`, style: 'primary' },
        },
        {
          blockType: 'richText',
          content: lexicalDoc(
            'What we offer',
            'MVO readiness page — replace with business-specific services.',
          ),
        },
      ],
    } as never,
    overrideAccess: true,
    locale,
  })

  console.log(JSON.stringify({ ok: true, pageId: page.id, slug: 'services' }))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
