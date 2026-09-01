import { mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { materializeRevision2WebsiteTemplate } from '../src/revision2Materialization.js'
import { mapVersionedProviderSemantic, validateA1AdapterCoverage } from '../src/masterTemplateVersionedAdapter.js'

const fixturePath = resolve(dirname(fileURLToPath(import.meta.url)), 'fixtures/ls05/fake-immutable-a1-semantics.json')

describe('LS-05 bounded exact-A1 engineering', () => {
  it('uses an explicitly fake/HOLD immutable input to prove deterministic coverage only', () => {
    const fixture = JSON.parse(readFileSync(fixturePath, 'utf8')) as { fixtureAuthority: string; immutableProviderStatus: string; providerAdmissionClaimed: boolean; pairedConsumerProofClaimed: boolean; roles: string[] }
    expect(fixture.fixtureAuthority).toBe('linksites_fake_input_only')
    expect(fixture.immutableProviderStatus).toBe('HOLD_unavailable')
    expect(fixture.providerAdmissionClaimed).toBe(false)
    expect(fixture.pairedConsumerProofClaimed).toBe(false)
    expect(validateA1AdapterCoverage(fixture.roles)).toEqual({ complete: true, missing: [] })
  })

  it('returns an explicit unsupported result for a non-A1 adapter version', () => {
    expect(mapVersionedProviderSemantic('2.0.0-a1.2', 'hero')).toEqual({
      supported: false,
      providerRole: 'hero',
      version: '2.0.0-a1.2',
      reason: 'unsupported_adapter_version',
    })
  })

  it('rejects provider metadata reached through a symlink before parsing it', async () => {
    const providerRoot = await mkdtemp(join(tmpdir(), 'linksites-ls05-provider-'))
    const outsideRoot = await mkdtemp(join(tmpdir(), 'linksites-ls05-outside-'))
    try {
      await mkdir(join(providerRoot, 'indexes/v2'), { recursive: true })
      await writeFile(join(outsideRoot, 'catalog.json'), '{}')
      await symlink(join(outsideRoot, 'catalog.json'), join(providerRoot, 'indexes/v2/catalog.json'))
      const result = materializeRevision2WebsiteTemplate({
        providerRoot,
        entryId: 'master-template-type-1',
        version: '2.0.0-a1.1',
        selectionPolicy: 'draft_candidate_probe',
        pin: { sourceCommitSha: '12'.repeat(20), sourceTreeSha: '34'.repeat(20), dependencyLockSha256: '56'.repeat(32) },
      })
      expect(result).toEqual({ ok: false, errors: ['provider catalogue path is missing, non-regular, symlinked, or outside provider root'] })
    } finally {
      await rm(providerRoot, { recursive: true, force: true })
      await rm(outsideRoot, { recursive: true, force: true })
    }
  })
})
