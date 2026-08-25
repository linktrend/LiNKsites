import { describe, expect, it } from 'vitest'
import { createHash } from 'node:crypto'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { materializeRevision2WebsiteTemplate, offlineRestartRevision2WebsiteTemplate } from '../src/revision2Materialization.js'
import { isProviderCandidateReceiptType } from '../src/libraryProviderClient.js'

const canonical = (value: unknown): string => value === null || typeof value !== 'object'
  ? JSON.stringify(value)
  : Array.isArray(value)
    ? `[${value.map(canonical).join(',')}]`
    : `{${Object.keys(value as Record<string, unknown>).sort().map((key) => `${JSON.stringify(key)}:${canonical((value as Record<string, unknown>)[key])}`).join(',')}}`
const identity = (value: unknown): string => createHash('sha1').update(canonical(value), 'utf8').digest('hex')
const sha256 = (value: string): string => createHash('sha256').update(value, 'utf8').digest('hex')

describe('Revision 2 website-template materialization', () => {
  it('fails closed when the provider root is absent', () => {
    const result = materializeRevision2WebsiteTemplate({
      providerRoot: '/definitely-not-a-provider-root',
      entryId: 'master-template-type-1',
      version: '1.0.0',
      pin: {
        sourceCommitSha: 'a'.repeat(40),
        sourceTreeSha: 'b'.repeat(40),
        dependencyLockSha256: 'c'.repeat(64),
      },
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors.join(' ')).toMatch(/could not be read|receipt found|no such file/i)
  })

  it('recognizes the canonical prerelease candidate receipt type', () => {
    expect(isProviderCandidateReceiptType('provider_prerelease_candidate')).toBe(true)
    expect(isProviderCandidateReceiptType('provider_release_candidate')).toBe(true)
    expect(isProviderCandidateReceiptType('consumption')).toBe(false)
  })

  it('rejects a receipt path that escapes or is not bound to the active entry', async () => {
    const cacheRoot = await mkdtemp(join(tmpdir(), 'linksites-ls05-cache-'))
    try {
      await writeFile(join(cacheRoot, 'active.json'), JSON.stringify({
        schemaVersion: 1,
        identity: 'a'.repeat(40),
        entryId: 'master-template-type-1',
        version: '2.0.0-a1.1',
        entryDirectory: 'entries/a8c6c23fd41a5f0eb9221276998f96862a50119f',
        receiptPath: '../../outside/materialization-receipt.json',
      }))
      const result = offlineRestartRevision2WebsiteTemplate({ cacheRoot })
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.errors.join(' ')).toMatch(/receipt path escapes cache root/i)
    } finally {
      await rm(cacheRoot, { recursive: true, force: true })
    }
  })

  it('rejects a cached receipt whose effective identity was tampered', async () => {
    const cacheRoot = await mkdtemp(join(tmpdir(), 'linksites-ls05-cache-'))
    const entryDirectory = 'entries/4444444444444444444444444444444444444444'
    const inventory = [{ path: 'manifest.json', sha256: sha256('x'), byteLength: 1 }]
    const provider = { repository: 'https://github.com/linktrend/LiNKlibraries.git', commitSha: '2'.repeat(40), treeSha: '3'.repeat(40), sourceReleaseCommitSha: '5'.repeat(40), sourceReleaseTreeSha: '6'.repeat(40) }
    const release = { entryId: 'master-template-type-1', version: '2.0.0-a1.1', artifactTreeSha1: '4'.repeat(40), releaseManifestSha256: 'a'.repeat(64), inventorySha256: 'b'.repeat(64), payloadSha256: 'c'.repeat(64), dependencyLockSha256: 'd'.repeat(64), releaseSourceCommitSha: '5'.repeat(40), releaseSourceTreeSha: '6'.repeat(40) }
    const adapter = { id: 'linksites.master-template.revision2', version: '2.0.0-a1.1', mappingDigest: '7'.repeat(40) }
    const candidate = identity({ provider: provider.commitSha, tree: provider.treeSha, entryId: release.entryId, version: release.version, artifactTreeSha1: release.artifactTreeSha1 })
    const materialization = identity({ candidate, inventory })
    const adapterIdentity = identity(adapter)
    const receipt = {
      schemaVersion: 1,
      packet: 'LS-05',
      verdicts: { materialization: 'candidate_materialized', compatibility: 'adapter_compatible', projection: 'payload_projection_pending' },
      provider,
      release,
      adapter,
      cache: { entryDirectory, providerCheckoutRequired: false, inventory },
      identities: { candidate, materialization, adapter: adapterIdentity, payload: null, effective: identity({ candidate, materialization, adapter: adapterIdentity, payload: null }) },
    }
    try {
      await mkdir(join(cacheRoot, entryDirectory), { recursive: true })
      await writeFile(join(cacheRoot, entryDirectory, 'manifest.json'), 'x')
      await writeFile(join(cacheRoot, entryDirectory, 'materialization-receipt.json'), JSON.stringify(receipt))
      await writeFile(join(cacheRoot, 'active.json'), JSON.stringify({ schemaVersion: 1, identity: receipt.identities.effective, entryId: release.entryId, version: release.version, entryDirectory, receiptPath: `${entryDirectory}/materialization-receipt.json` }))
      const valid = offlineRestartRevision2WebsiteTemplate({ cacheRoot })
      expect(valid.ok).toBe(true)
      const tampered = JSON.parse(await readFile(join(cacheRoot, entryDirectory, 'materialization-receipt.json'), 'utf8')) as typeof receipt
      tampered.identities.effective = '8'.repeat(40)
      await writeFile(join(cacheRoot, entryDirectory, 'materialization-receipt.json'), JSON.stringify(tampered))
      const rejected = offlineRestartRevision2WebsiteTemplate({ cacheRoot })
      expect(rejected.ok).toBe(false)
      if (!rejected.ok) expect(rejected.errors.join(' ')).toMatch(/identit|bound/i)
    } finally {
      await rm(cacheRoot, { recursive: true, force: true })
    }
  })
})
