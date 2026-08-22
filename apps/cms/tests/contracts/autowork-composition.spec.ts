import { createHmac } from 'node:crypto'
import { mkdtemp, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { drainLiNKautowork, triggerLiNKautowork } from '@/payload/utils/autowork'

describe('actual CMS to LiNKautowork composition', () => {
  const original = { ...process.env }
  afterEach(() => { process.env = { ...original }; vi.restoreAllMocks() })

  it('durably enqueues before the hook resolves and a restarted worker persists the receipt', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'linksites-cms-w2-05-'))
    process.env.LINKAUTOWORK_GATEWAY_URL = 'http://127.0.0.1:1/events'
    process.env.LINKAUTOWORK_SIGNING_SECRET = 'ltfx.auto.linkautowork_signing_secret.bed6dcd92148.v1'
    process.env.LINKAUTOWORK_SIGNING_KEY_ID = 'cms-test'
    process.env.LINKAUTOWORK_ENVIRONMENT = 'development'
    process.env.LINKAUTOWORK_OUTBOX_PATH = join(directory, 'outbox.json')
    process.env.LINKAUTOWORK_OUTBOX_INTEGRITY_SECRET = 'ltfx.auto.linkautowork_outbox_integrity_secret.c894e74e9421.v1'
    process.env.LINKAUTOWORK_EVENT_GRANTS = JSON.stringify([{ eventName: 'demo.completed', environments: ['development'], orgIds: ['org_demo'] }])
    const acknowledgedAt = '2026-08-05T00:00:00.000Z'
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (_input, init) => { const request = JSON.parse(String(init?.body)); const signature = createHmac('sha256', process.env.LINKAUTOWORK_SIGNING_SECRET!).update(`receipt-test.${acknowledgedAt}.${request.envelope.idempotency_key}`).digest('hex'); return new Response(null, { status: 202, headers: { 'x-linkautowork-receipt': 'receipt-test', 'x-linkautowork-receipt-signature': signature, 'x-linkautowork-acknowledged-at': acknowledgedAt } }) })

    const req = { payload: { findByID: vi.fn().mockResolvedValue({ id: 'site-1', orgId: 'org_demo', programId: 'program-1', leadId: 'lead-1' }) } } as never
    await triggerLiNKautowork({ id: 'page-1', collection: 'pages', eventType: 'content_published', site: 'site-1', req }, { readProgramPass: vi.fn().mockResolvedValue({ state: 'PASS', completionId: 'pass-1', programId: 'program-1', orgId: 'org_demo', leadId: 'lead-1', siteId: 'site-1' }) })
    const queued = JSON.parse(await readFile(process.env.LINKAUTOWORK_OUTBOX_PATH, 'utf8'))
    expect(queued.items).toHaveLength(1)
    expect(queued.items[0].request.envelope.payload).toEqual({ lead_id: 'lead-1', site_id: 'site-1' })
    await drainLiNKautowork()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const persisted = JSON.parse(await readFile(process.env.LINKAUTOWORK_OUTBOX_PATH, 'utf8'))
    expect(persisted.items[0]).toMatchObject({ state: 'sent', receiptId: 'receipt-test' })
  })

  it('fails closed before transport for blank identity or missing grants', async () => {
    process.env.LINKAUTOWORK_GATEWAY_URL = 'http://127.0.0.1:1/events'
    process.env.LINKAUTOWORK_SIGNING_SECRET = 'ltfx.auto.linkautowork_signing_secret.ad47f0d931da.v1'
    process.env.LINKAUTOWORK_SIGNING_KEY_ID = 'cms-test'
    process.env.LINKAUTOWORK_ENVIRONMENT = 'development'
    process.env.LINKAUTOWORK_OUTBOX_PATH = join(await mkdtemp(join(tmpdir(), 'linksites-cms-w2-05-')), 'outbox.json')
    process.env.LINKAUTOWORK_OUTBOX_INTEGRITY_SECRET = 'ltfx.auto.linkautowork_outbox_integrity_secret.3f685d4836cd.v1'
    process.env.LINKAUTOWORK_EVENT_GRANTS = ''
    const fetchMock = vi.spyOn(globalThis, 'fetch')
    const req = { payload: { findByID: vi.fn().mockResolvedValue({ id: 'site-1', orgId: 'org_demo', programId: 'program-1', leadId: '' }) } } as never
    await expect(triggerLiNKautowork({ id: 'page-1', collection: 'pages', eventType: 'content_published', site: 'site-1', req })).rejects.toThrow()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects a publication with no real Program PASS and ignores invented request metadata', async () => {
    process.env.LINKAUTOWORK_GATEWAY_URL = 'http://127.0.0.1:1/events'
    process.env.LINKAUTOWORK_SIGNING_SECRET = 'ltfx.auto.linkautowork_signing_secret.26e5d8b5ada2.v1'
    process.env.LINKAUTOWORK_SIGNING_KEY_ID = 'cms-test'
    process.env.LINKAUTOWORK_ENVIRONMENT = 'development'
    process.env.LINKAUTOWORK_OUTBOX_PATH = join(await mkdtemp(join(tmpdir(), 'linksites-cms-w2-05-')), 'outbox.json')
    process.env.LINKAUTOWORK_OUTBOX_INTEGRITY_SECRET = 'ltfx.auto.linkautowork_outbox_integrity_secret.193e0f7b4d18.v1'
    process.env.LINKAUTOWORK_EVENT_GRANTS = JSON.stringify([{ eventName: 'demo.completed', environments: ['development'], orgIds: ['org_demo'] }])
    const req = { payload: { findByID: vi.fn().mockResolvedValue({ id: 'site-1', orgId: 'org_demo', programId: 'program-1', leadId: 'lead-1' }) } } as never
    await expect(triggerLiNKautowork({ id: 'page-1', collection: 'pages', eventType: 'content_published', site: 'site-1', req }, { readProgramPass: vi.fn().mockResolvedValue(null) })).rejects.toThrow(/PASS/)
  })

  it('fails closed and retries when the gateway omits its acknowledgement receipt', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'linksites-cms-w2-05-'))
    Object.assign(process.env, { LINKAUTOWORK_GATEWAY_URL: 'http://127.0.0.1:1/events', LINKAUTOWORK_SIGNING_SECRET: 'ltfx.auto.linkautowork_signing_secret.6e8489151d45.v1', LINKAUTOWORK_SIGNING_KEY_ID: 'cms-test', LINKAUTOWORK_ENVIRONMENT: 'development', LINKAUTOWORK_OUTBOX_PATH: join(directory, 'outbox.json'), LINKAUTOWORK_OUTBOX_INTEGRITY_SECRET: 'ltfx.auto.linkautowork_outbox_integrity_secret.2981ff9f6d7c.v1', LINKAUTOWORK_EVENT_GRANTS: JSON.stringify([{ eventName: 'demo.completed', environments: ['development'], orgIds: ['org_demo'] }]) })
    const req = { payload: { findByID: vi.fn().mockResolvedValue({ id: 'site-1', orgId: 'org_demo', programId: 'program-1', leadId: 'lead-1' }) } } as never
    await triggerLiNKautowork({ id: 'page-1', collection: 'pages', eventType: 'content_published', site: 'site-1', req }, { readProgramPass: vi.fn().mockResolvedValue({ state: 'PASS', completionId: 'pass-1', programId: 'program-1', orgId: 'org_demo', leadId: 'lead-1', siteId: 'site-1' }) })
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 202 }))
    await drainLiNKautowork()
    const state = JSON.parse(await readFile(join(directory, 'outbox.json'), 'utf8'))
    expect(state.items[0].state).toBe('pending')
    expect(state.items[0].lastError).toMatch(/receipt/)
  })
})
