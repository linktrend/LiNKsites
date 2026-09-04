import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { exportSiteBundle, importSiteBundle, SiteTransferError } from '../src/siteTransfer.ts'

const fixture = (name: string): unknown => JSON.parse(readFileSync(fileURLToPath(new URL(`./fixtures/site-transfer/${name}.json`, import.meta.url)), 'utf8'))

describe('site transfer manifest conformance', () => {
  it('exports deterministically and accepts a conforming fixture', () => {
    const records = [
      { kind: 'page', id: 'home', value: { title: 'Home', route: '/' } },
      { kind: 'settings', id: 'primary', value: { locale: 'en' } },
    ]
    expect(exportSiteBundle('site-001', [...records].reverse())).toEqual(exportSiteBundle('site-001', records))
    expect(importSiteBundle(fixture('valid'))).toEqual(fixture('valid'))
  })

  it('rejects a fixture whose record bytes no longer match its digest', () => {
    expect(() => importSiteBundle(fixture('corrupted-record'))).toThrowError(
      expect.objectContaining<Partial<SiteTransferError>>({ code: 'DIGEST_MISMATCH' }),
    )
  })

  it.each([
    ['unknown manifest field', (bundle: any) => { bundle.manifest.extra = true }],
    ['unsupported algorithm', (bundle: any) => { bundle.manifest.digestAlgorithm = 'sha1' }],
    ['record reordering', (bundle: any) => { bundle.records.reverse() }],
    ['duplicate identity', (bundle: any) => { bundle.manifest.entries[1] = bundle.manifest.entries[0] }],
    ['missing record', (bundle: any) => { bundle.records.pop() }],
  ])('fails closed for %s', (_label, corrupt) => {
    const bundle = fixture('valid')
    corrupt(bundle)
    expect(() => importSiteBundle(bundle)).toThrow(SiteTransferError)
  })

  it('rejects non-portable identifiers during export', () => {
    expect(() => exportSiteBundle('site-001', [{ kind: 'page', id: '../tenant', value: {} }])).toThrow(SiteTransferError)
  })
})
