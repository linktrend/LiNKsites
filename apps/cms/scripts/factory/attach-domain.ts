import { getPayload } from 'payload'
import config from '@/payload.config'

type ArgMap = Record<string, string | undefined>

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
  if (!value) throw new Error(`Missing required arg --${key}=...`)
  return value
}

async function main() {
  const args = parseArgs()
  const siteId = requireArg(args, 'siteId')
  const hostname = requireArg(args, 'hostname')
  const primary = (args.primary ?? 'false').toLowerCase() === 'true'

  const payload = await getPayload({ config })

  // De-dupe if it already exists
  const existing = await payload.find({
    collection: 'site-domains',
    where: { hostname: { equals: hostname } },
    limit: 1,
    overrideAccess: true,
  })
  if (existing.docs[0]) {
    console.log(JSON.stringify({ ok: true, siteDomainId: (existing.docs[0] as any).id, alreadyExisted: true }, null, 2))
    return
  }

  const doc = await payload.create({
    collection: 'site-domains',
    data: { hostname, site: siteId, primary } as any,
    overrideAccess: true,
  })

  console.log(JSON.stringify({ ok: true, siteDomainId: doc.id, hostname, siteId, primary }, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

