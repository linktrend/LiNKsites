import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { enforceSiteScope } from '@/hooks/enforceSiteScope'
import { validateSiteAccess as validateSiteAccessHook } from '@/hooks/validateSiteAccess'
import { getSiteFromRequest } from '@/utils/siteScope'

type MockUser = {
  roles: { name: string }[]
  assignedSites: string[]
  allowedLocales: string[]
}

type MockReq = {
  user: MockUser
  query?: Record<string, unknown>
  context?: Record<string, unknown>
  headers?: { get: (name: string) => string | null }
  payload?: Record<string, unknown>
}

const docs = {
  'a1': { id: 'a1', site: 'site-a', title: 'Doc A' },
  'b1': { id: 'b1', site: 'site-b', title: 'Doc B' },
}

const buildUser = (assignedSites: string[], role = 'editor'): MockUser => ({
  roles: [{ name: role }],
  assignedSites,
  allowedLocales: ['en'],
})

const buildPayloadReq = (
  user: MockUser,
  incoming: IncomingMessage,
  body?: Record<string, unknown>,
): MockReq => {
  const url = new URL(incoming.url ?? '/', 'http://localhost')
  const headers = {
    get: (name: string) => {
      const value = incoming.headers[name.toLowerCase()]
      if (Array.isArray(value)) return value[0] ?? null
      return (value as string | undefined) ?? null
    },
  }
  return {
    user,
    query: Object.fromEntries(url.searchParams.entries()),
    headers,
    context: {},
    payload: {
      find: async () => ({ docs: [{ id: 'mock-user' }], totalDocs: 1 }),
    },
    ...(body ? { data: body } : {}),
  } as MockReq
}

const app = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const url = new URL(req.url ?? '/', 'http://localhost')
  const siteHeader = (req.headers['x-site-id'] as string) ?? undefined
  const roleHeader = (req.headers['x-role'] as string) ?? 'editor'
  const user = buildUser((req.headers['x-user-sites'] as string | undefined)?.split(',') ?? [], roleHeader)

  const buffers: Buffer[] = []
  for await (const chunk of req) {
    buffers.push(chunk as Buffer)
  }
  const bodyText = Buffer.concat(buffers).toString() || '{}'
  let jsonBody: Record<string, unknown> = {}
  try {
    jsonBody = JSON.parse(bodyText)
  } catch {
    // noop - handled below
  }

  if (url.pathname.startsWith('/docs/')) {
    const id = url.pathname.split('/').pop() ?? ''
    const doc = docs[id as keyof typeof docs]
    const payloadReq = buildPayloadReq(user, req)
    const filtered = await enforceSiteScope({
      req: payloadReq as never,
      doc,
      collection: { slug: 'articles' } as never,
      context: {} as never,
    })
    if (!filtered) {
      res.statusCode = 403
      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify({ error: 'Access denied' }))
      return
    }
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify(filtered))
    return
  }

  if (url.pathname === '/admin/site-context') {
    const payloadReq = buildPayloadReq(
      user,
      req,
      {
        site: siteHeader,
      },
    )
    const site = getSiteFromRequest(payloadReq as never)
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({ site }))
    return
  }

  if (url.pathname === '/docs' && req.method === 'POST') {
    const payloadReq = buildPayloadReq(user, req, jsonBody)
    try {
      await validateSiteAccessHook({
        data: jsonBody,
        req: payloadReq as never,
        originalDoc: null,
        operation: 'create',
        collection: { slug: 'articles' } as never,
        context: {},
      })
      res.statusCode = 200
      res.end(JSON.stringify({ ok: true, site: jsonBody.site }))
    } catch (error) {
      const message = (error as Error).message
      res.statusCode = message.includes('required') ? 400 : 403
      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify({ error: message }))
    }
    return
  }

  res.statusCode = 404
  res.end()
})

describe('Site scoping contracts', () => {
  it('blocks access to documents from other sites', async () => {
    const response = await request(app)
      .get('/docs/a1')
      .set('x-user-sites', 'site-b')

    expect(response.statusCode).toBe(403)
    expect(response.body.error).toMatch(/Access denied/)
  })

  it('returns document when user belongs to site', async () => {
    const response = await request(app)
      .get('/docs/a1')
      .set('x-user-sites', 'site-a')

    expect(response.statusCode).toBe(200)
    expect(response.body.id).toBe('a1')
    expect(response.body.site).toBe('site-a')
  })

  it('fails gracefully when site is missing on create', async () => {
    const response = await request(app)
      .post('/docs')
      .send({ title: 'Missing site' })

    expect(response.statusCode).toBe(400)
    expect(response.body.error).toMatch(/Site is required/)
  })

  it('captures site context from admin UI headers', async () => {
    const response = await request(app)
      .get('/admin/site-context')
      .set('x-site-id', 'site-a')

    expect(response.statusCode).toBe(200)
    expect(response.body.site).toBe('site-a')
  })

  it('prevents non-admins from overriding site context', async () => {
    const response = await request(app)
      .post('/docs')
      .set('x-user-sites', 'site-a')
      .send({ title: 'Cross-site attempt', site: 'site-b' })

    expect(response.statusCode).toBe(403)
    expect(response.body.error).toMatch(/Access denied to site|Site is required/)
  })
})
