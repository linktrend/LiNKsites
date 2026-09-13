import { describe, expect, it } from 'vitest'
import { createHash } from 'node:crypto'
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { materializeRevision2WebsiteTemplate, offlineRestartRevision2WebsiteTemplate, rollbackRevision2WebsiteTemplate, renderNativeA1FromCache, consumerCacheTreeFromInventory } from '../src/revision2Materialization.js'
import { isProviderCandidateReceiptType } from '../src/libraryProviderClient.js'
import { MASTER_TEMPLATE_ADAPTER_ID, MASTER_TEMPLATE_ADAPTER_MAPPING_DIGEST, MASTER_TEMPLATE_ADAPTER_VERSION } from '../src/masterTemplateVersionedAdapter.js'
import { MASTER_TEMPLATE_PIN, masterTemplateRevision2Pin } from '../src/masterTemplatePin.js'

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
        providerCommitSha: 'c'.repeat(40),
        providerTreeSha: 'd'.repeat(40),
        dependencyLockSha256: 'c'.repeat(64),
      },
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors.join(' ')).toMatch(/could not be read|receipt found|no such file|provider catalogue path|readable Git worktree/i)
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

  it('rejects cache entry traversal through a symlinked directory', async () => {
    const cacheRoot = await mkdtemp(join(tmpdir(), 'linksites-ls05-cache-'))
    const outsideRoot = await mkdtemp(join(tmpdir(), 'linksites-ls05-outside-'))
    try {
      await mkdir(join(cacheRoot, 'entries'))
      await symlink(outsideRoot, join(cacheRoot, 'entries', 'linked'))
      await writeFile(join(cacheRoot, 'active.json'), JSON.stringify({
        schemaVersion: 1,
        identity: 'a'.repeat(40),
        entryId: 'master-template-type-1',
        version: '2.0.0-a1.1',
        entryDirectory: 'entries/linked',
        receiptPath: 'entries/linked/materialization-receipt.json',
      }))
      const result = offlineRestartRevision2WebsiteTemplate({ cacheRoot })
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.errors.join(' ')).toMatch(/entry path escapes cache root/i)
    } finally {
      await rm(cacheRoot, { recursive: true, force: true })
      await rm(outsideRoot, { recursive: true, force: true })
    }
  })

  it('rejects a cached receipt whose effective identity was tampered', async () => {
    const cacheRoot = await mkdtemp(join(tmpdir(), 'linksites-ls05-cache-'))
    const entryDirectory = 'entries/4444444444444444444444444444444444444444'
    const inventory = [{ path: 'manifest.json', sha256: sha256('x'), byteLength: 1 }]
    const provider = { repository: 'https://github.com/linktrend/LiNKlibraries.git', commitSha: '2'.repeat(40), treeSha: '3'.repeat(40), sourceReleaseCommitSha: '5'.repeat(40), sourceReleaseTreeSha: '6'.repeat(40) }
    const release = { entryId: 'master-template-type-1', version: '2.0.0-a1.1', artifactTreeSha1: '4'.repeat(40), releaseManifestSha256: 'a'.repeat(64), inventorySha256: 'b'.repeat(64), payloadSha256: 'c'.repeat(64), dependencyLockSha256: 'd'.repeat(64), releaseSourceCommitSha: '5'.repeat(40), releaseSourceTreeSha: '6'.repeat(40) }
    const adapter = { id: MASTER_TEMPLATE_ADAPTER_ID, version: MASTER_TEMPLATE_ADAPTER_VERSION, mappingDigest: MASTER_TEMPLATE_ADAPTER_MAPPING_DIGEST }
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

  it('rejects tampering with any required materialization verdict', async () => {
    const cacheRoot = await mkdtemp(join(tmpdir(), 'linksites-ls05-cache-'))
    const entryDirectory = 'entries/5555555555555555555555555555555555555555'
    const inventory = [{ path: 'manifest.json', sha256: sha256('x'), byteLength: 1 }]
    const provider = { repository: 'https://github.com/linktrend/LiNKlibraries.git', commitSha: '2'.repeat(40), treeSha: '3'.repeat(40), sourceReleaseCommitSha: '5'.repeat(40), sourceReleaseTreeSha: '6'.repeat(40) }
    const release = { entryId: 'master-template-type-1', version: '2.0.0-a1.1', artifactTreeSha1: '5'.repeat(40), releaseManifestSha256: 'a'.repeat(64), inventorySha256: 'b'.repeat(64), payloadSha256: 'c'.repeat(64), dependencyLockSha256: 'd'.repeat(64), releaseSourceCommitSha: '5'.repeat(40), releaseSourceTreeSha: '6'.repeat(40) }
    const adapter = { id: MASTER_TEMPLATE_ADAPTER_ID, version: MASTER_TEMPLATE_ADAPTER_VERSION, mappingDigest: MASTER_TEMPLATE_ADAPTER_MAPPING_DIGEST }
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
      for (const verdict of ['materialization', 'compatibility', 'projection'] as const) {
        const tampered = structuredClone(receipt)
        tampered.verdicts[verdict] = 'unknown'
        await writeFile(join(cacheRoot, entryDirectory, 'materialization-receipt.json'), JSON.stringify(tampered))
        await writeFile(join(cacheRoot, 'active.json'), JSON.stringify({ schemaVersion: 1, identity: receipt.identities.effective, entryId: release.entryId, version: release.version, entryDirectory, receiptPath: `${entryDirectory}/materialization-receipt.json` }))
        const rejected = offlineRestartRevision2WebsiteTemplate({ cacheRoot })
        expect(rejected.ok, `tampered ${verdict} verdict must be rejected`).toBe(false)
      }
    } finally {
      await rm(cacheRoot, { recursive: true, force: true })
    }
  })

  it('rolls back product cache state across two materialized generations', async () => {
    const cacheRoot = await mkdtemp(join(tmpdir(), 'linksites-ls05-cache-'))
    const buildGeneration = (generation: string) => {
      const entryDirectory = `entries/${generation}`
      const inventory = [{ path: 'manifest.json', sha256: sha256(generation), byteLength: generation.length }]
      const provider = { repository: 'https://github.com/linktrend/LiNKlibraries.git', commitSha: '2'.repeat(40), treeSha: '3'.repeat(40), sourceReleaseCommitSha: '5'.repeat(40), sourceReleaseTreeSha: '6'.repeat(40) }
      const release = { entryId: 'master-template-type-1', version: '2.0.0-a1.1', artifactTreeSha1: generation, releaseManifestSha256: 'a'.repeat(64), inventorySha256: 'b'.repeat(64), payloadSha256: 'c'.repeat(64), dependencyLockSha256: 'd'.repeat(64), releaseSourceCommitSha: '5'.repeat(40), releaseSourceTreeSha: '6'.repeat(40) }
      const adapter = { id: MASTER_TEMPLATE_ADAPTER_ID, version: MASTER_TEMPLATE_ADAPTER_VERSION, mappingDigest: MASTER_TEMPLATE_ADAPTER_MAPPING_DIGEST }
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
      return { entryDirectory, receipt }
    }
    const first = buildGeneration('a'.repeat(40))
    const second = buildGeneration('b'.repeat(40))
    try {
      await mkdir(join(cacheRoot, first.entryDirectory), { recursive: true })
      await mkdir(join(cacheRoot, second.entryDirectory), { recursive: true })
      await writeFile(join(cacheRoot, first.entryDirectory, 'manifest.json'), 'a'.repeat(40))
      await writeFile(join(cacheRoot, second.entryDirectory, 'manifest.json'), 'b'.repeat(40))
      await writeFile(join(cacheRoot, first.entryDirectory, 'materialization-receipt.json'), JSON.stringify(first.receipt))
      await writeFile(join(cacheRoot, second.entryDirectory, 'materialization-receipt.json'), JSON.stringify(second.receipt))
      await writeFile(join(cacheRoot, 'active.json'), JSON.stringify({ schemaVersion: 1, identity: second.receipt.identities.effective, entryId: second.receipt.release.entryId, version: second.receipt.release.version, entryDirectory: second.entryDirectory, receiptPath: `${second.entryDirectory}/materialization-receipt.json` }))
      await writeFile(join(cacheRoot, 'previous.json'), JSON.stringify({ schemaVersion: 1, identity: first.receipt.identities.effective, entryId: first.receipt.release.entryId, version: first.receipt.release.version, entryDirectory: first.entryDirectory, receiptPath: `${first.entryDirectory}/materialization-receipt.json` }))

      const rolledBack = rollbackRevision2WebsiteTemplate({ cacheRoot })
      expect(rolledBack.ok).toBe(true)
      if (rolledBack.ok) expect(rolledBack.value.files['manifest.json']).toBe('a'.repeat(40))
      const restarted = offlineRestartRevision2WebsiteTemplate({ cacheRoot })
      expect(restarted.ok).toBe(true)
      if (restarted.ok) expect(restarted.value.reference.artifactTreeSha1).toBe('a'.repeat(40))

      const rolledForward = rollbackRevision2WebsiteTemplate({ cacheRoot })
      expect(rolledForward.ok).toBe(true)
      if (rolledForward.ok) expect(rolledForward.value.files['manifest.json']).toBe('b'.repeat(40))
    } finally {
      await rm(cacheRoot, { recursive: true, force: true })
    }
  })

  it('materializes the protected uncatalogued A1 candidate, executes native render.mjs, then survives checkout removal, tamper, and rollback', async () => {
    const providerRoot = process.env.LINKLIBRARIES_ROOT ?? '/agent/repos/LiNKlibraries'
    if (!existsSync(providerRoot) || !existsSync(join(providerRoot, 'registry/v2/entries/master-template-type-1/versions/2.0.0-a1.1/release-receipt.json'))) {
      throw new Error('EXT-LS-01 requires the exact protected LiNKlibraries checkout at LINKLIBRARIES_ROOT')
    }
    const worktree = await mkdtemp(join(tmpdir(), 'linksites-ext-ls-01-provider-'))
    const cacheRoot = await mkdtemp(join(tmpdir(), 'linksites-ext-ls-01-cache-'))
    const pin = masterTemplateRevision2Pin()
    try {
      execFileSync('git', ['-C', providerRoot, 'worktree', 'add', '--detach', worktree, MASTER_TEMPLATE_PIN.commitSha])
      const refused = materializeRevision2WebsiteTemplate({
        providerRoot: worktree,
        entryId: MASTER_TEMPLATE_PIN.entryId,
        version: MASTER_TEMPLATE_PIN.version,
        pin,
      })
      expect(refused.ok).toBe(false)

      const first = materializeRevision2WebsiteTemplate({
        providerRoot: worktree,
        entryId: MASTER_TEMPLATE_PIN.entryId,
        version: MASTER_TEMPLATE_PIN.version,
        pin,
        selectionPolicy: 'draft_candidate_probe',
        cacheRoot,
      })
      expect(first.ok).toBe(true)
      if (!first.ok) return
      expect(first.value.reference.artifactTreeSha1).toBe(MASTER_TEMPLATE_PIN.artifactTreeSha1)
      expect(first.value.reference.releaseManifestSha256).toBe(MASTER_TEMPLATE_PIN.releaseManifestSha256)
      expect(first.value.reference.inventorySha256).toBe(MASTER_TEMPLATE_PIN.inventorySha256)
      expect(first.value.reference.receiptType).toBe('candidate')
      expect(first.value.materializationReceipt?.cache.providerCheckoutRequired).toBe(false)
      expect(first.value.files['plans/a.json']).toMatch(/"id": "a"/)
      expect(JSON.parse(first.value.files['plans/a.json']).capacity.value).toBe(30)
      expect(JSON.parse(first.value.files['plans/b.json']).capacity.value).toBe(15)
      expect(JSON.parse(first.value.files['plans/c.json']).capacity.value).toBe(6)
      expect(JSON.parse(first.value.files['plans/l.json']).capacity.value).toBe(0)
      expect(JSON.parse(first.value.files['plans/l.json']).shell.globalNavigation).toBe('none')
      expect(first.value.files['layouts/a1-guided-trust.json']).toContain('a1')
      expect(first.value.files['src/layouts/a1/render.mjs']).toMatch(/export function renderA1Page/)
      const cacheTree = consumerCacheTreeFromInventory(first.value.materializationReceipt?.cache.inventory ?? [])
      expect(cacheTree).toMatch(/^[a-f0-9]{40}$/)
      expect(cacheTree).not.toBe('a'.repeat(40))

      const nativeA = await renderNativeA1FromCache({ cacheRoot, planId: 'a', expected: { entryId: MASTER_TEMPLATE_PIN.entryId, version: MASTER_TEMPLATE_PIN.version, pin } })
      expect(nativeA.ok).toBe(true)
      if (!nativeA.ok) return
      expect(nativeA.value.structure.layoutPackA1).toBe(true)
      expect(nativeA.value.structure.standardShell).toBe(true)
      const nativeL = await renderNativeA1FromCache({ cacheRoot, planId: 'l', expected: { entryId: MASTER_TEMPLATE_PIN.entryId, version: MASTER_TEMPLATE_PIN.version, pin } })
      expect(nativeL.ok).toBe(true)
      if (nativeL.ok) {
        expect(nativeL.value.structure.typeLMinimal).toBe(true)
        expect(nativeL.value.structure.primaryNav).toBe(false)
      }

      const stagingCache = await mkdtemp(join(tmpdir(), 'linksites-ext-ls-01-prior-'))
      const prior = materializeRevision2WebsiteTemplate({
        providerRoot: worktree,
        entryId: MASTER_TEMPLATE_PIN.entryId,
        version: MASTER_TEMPLATE_PIN.version,
        pin,
        selectionPolicy: 'draft_candidate_probe',
        cacheRoot: stagingCache,
      })
      expect(prior.ok).toBe(true)
      const reselect = materializeRevision2WebsiteTemplate({
        providerRoot: worktree,
        entryId: MASTER_TEMPLATE_PIN.entryId,
        version: MASTER_TEMPLATE_PIN.version,
        pin,
        selectionPolicy: 'draft_candidate_probe',
        cacheRoot,
      })
      expect(reselect.ok).toBe(true)
      const rolled = rollbackRevision2WebsiteTemplate({ cacheRoot })
      expect(rolled.ok).toBe(true)
      await rm(stagingCache, { recursive: true, force: true })

      execFileSync('git', ['-C', providerRoot, 'worktree', 'remove', '--force', worktree])
      expect(existsSync(join(worktree, 'registry'))).toBe(false)

      const offline = offlineRestartRevision2WebsiteTemplate({ cacheRoot, expected: { entryId: MASTER_TEMPLATE_PIN.entryId, version: MASTER_TEMPLATE_PIN.version, pin } })
      expect(offline.ok).toBe(true)
      if (offline.ok) expect(offline.value.mode).toBe('offline_cache')
      const nativeRestart = await renderNativeA1FromCache({ cacheRoot, planId: 'a', expected: { entryId: MASTER_TEMPLATE_PIN.entryId, version: MASTER_TEMPLATE_PIN.version, pin } })
      expect(nativeRestart.ok).toBe(true)
      if (nativeRestart.ok) expect(nativeRestart.value.htmlSha256).toBe(nativeA.value.htmlSha256)

      const receiptPath = join(cacheRoot, `entries/${MASTER_TEMPLATE_PIN.artifactTreeSha1}`, 'materialization-receipt.json')
      const tampered = JSON.parse(await readFile(receiptPath, 'utf8')) as { identities: { effective: string } }
      tampered.identities.effective = '8'.repeat(40)
      await writeFile(receiptPath, JSON.stringify(tampered))
      const rejected = offlineRestartRevision2WebsiteTemplate({ cacheRoot })
      expect(rejected.ok).toBe(false)
    } finally {
      try { execFileSync('git', ['-C', providerRoot, 'worktree', 'remove', '--force', worktree], { stdio: ['ignore', 'pipe', 'pipe'] }) } catch { /* already removed */ }
      await rm(cacheRoot, { recursive: true, force: true })
      await rm(worktree, { recursive: true, force: true })
    }
  })
})
