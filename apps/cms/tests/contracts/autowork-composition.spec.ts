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
    process.env.LINKAUTOWORK_SIGNING_SECRET = 'test-secret'
    process.env.LINKAUTOWORK_SIGNING_KEY_ID = 'cms-test'
    process.env.LINKAUTOWORK_ENVIRONMENT = 'development'
    process.env.LINKAUTOWORK_OUTBOX_PATH = join(directory, 'outbox.json')
    process.env.LINKAUTOWORK_EVENT_GRANTS = JSON.stringify([{ eventName: 'demo.completed', environments: ['development'], orgIds: ['org_demo'] }])
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 202, headers: { 'x-linkautowork-receipt': 'receipt-test' } }))

    await triggerLiNKautowork({ id: 'page-1', collection: 'pages', eventType: 'content_published', site: 'site-1', meta: { lead_id: 'lead-1', org_id: 'org_demo' } })
    const queued = JSON.parse(await readFile(process.env.LINKAUTOWORK_OUTBOX_PATH, 'utf8'))
    expect(queued).toHaveLength(1)
    expect(queued[0].request.envelope.payload).toEqual({ lead_id: 'lead-1', site_id: 'site-1' })
    await drainLiNKautowork()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const persisted = JSON.parse(await readFile(process.env.LINKAUTOWORK_OUTBOX_PATH, 'utf8'))
    expect(persisted[0]).toMatchObject({ state: 'sent', receiptId: 'receipt-test' })
  })

  it('fails closed before transport for blank identity or missing grants', async () => {
    process.env.LINKAUTOWORK_GATEWAY_URL = 'http://127.0.0.1:1/events'
    process.env.LINKAUTOWORK_SIGNING_SECRET = 'test-secret'
    process.env.LINKAUTOWORK_SIGNING_KEY_ID = 'cms-test'
    process.env.LINKAUTOWORK_ENVIRONMENT = 'development'
    process.env.LINKAUTOWORK_OUTBOX_PATH = join(await mkdtemp(join(tmpdir(), 'linksites-cms-w2-05-')), 'outbox.json')
    process.env.LINKAUTOWORK_EVENT_GRANTS = ''
    const fetchMock = vi.spyOn(globalThis, 'fetch')
    await expect(triggerLiNKautowork({ id: 'page-1', collection: 'pages', eventType: 'content_published', site: 'site-1', meta: { lead_id: '', org_id: 'org_demo' } })).rejects.toThrow()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
