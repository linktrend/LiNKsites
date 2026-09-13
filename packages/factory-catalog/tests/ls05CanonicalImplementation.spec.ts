import { describe, expect, it } from 'vitest'
import { FROZEN_PROVIDER_PIN, validateExactRelease } from '../src/libraryProviderClient.js'
import { MASTER_TEMPLATE_PIN } from '../src/masterTemplatePin.js'
import {
  A1_PROVIDER_SEMANTIC_MAP,
  MASTER_TEMPLATE_ADAPTER_ID,
  MASTER_TEMPLATE_ADAPTER_MAPPING_DIGEST,
  MASTER_TEMPLATE_ADAPTER_VERSION,
  REQUIRED_A1_PROVIDER_ROLES,
  createMasterTemplateAdapterIdentity,
  mapProviderSemantic,
  validateA1AdapterCoverage,
} from '../src/masterTemplateVersionedAdapter.js'
import { bindMasterTemplateIdentities } from '../src/masterTemplateIdentityBindings.js'

describe('LS-05 canonical A1 adapter and identity bindings', () => {
  it('has complete versioned A1 role coverage and explicit unsupported results', () => {
    expect(validateA1AdapterCoverage()).toEqual({ complete: true, missing: [] })
    expect(Object.keys(A1_PROVIDER_SEMANTIC_MAP).length).toBeGreaterThanOrEqual(REQUIRED_A1_PROVIDER_ROLES.length)
    expect(mapProviderSemantic('hero')).toMatchObject({ supported: true, mapping: { payloadBlockType: 'hero' } })
    expect(mapProviderSemantic('provider-added-role')).toEqual({ supported: false, providerRole: 'provider-added-role', reason: 'unsupported_provider_semantic' })
  })

  it('binds exact candidate, adoption, adapter, Payload, and effective identities', () => {
    const bindings = bindMasterTemplateIdentities({
      candidate: {
        repository: MASTER_TEMPLATE_PIN.repositoryUrl,
        entryId: MASTER_TEMPLATE_PIN.entryId,
        version: MASTER_TEMPLATE_PIN.version,
        providerCommitSha: MASTER_TEMPLATE_PIN.commitSha,
        providerTreeSha: MASTER_TEMPLATE_PIN.providerTreeSha,
        sourceReleaseCommitSha: MASTER_TEMPLATE_PIN.sourceReleaseCommitSha,
        sourceReleaseTreeSha: MASTER_TEMPLATE_PIN.sourceReleaseTreeSha,
        artifactTreeSha1: MASTER_TEMPLATE_PIN.artifactTreeSha1,
      },
      adoption: { siteId: 'site-ls05', locale: 'en-US', payloadStatus: 'draft' },
      payload: { siteId: 'site-ls05', locale: 'en-US', documentIds: ['pages:home', 'pages:contact'] },
    })
    expect(bindings.candidate.version).toBe('2.0.0-a1.1')
    expect(bindings.adapter.id).toBe(MASTER_TEMPLATE_ADAPTER_ID)
    expect(bindings.adapter.version).toBe(MASTER_TEMPLATE_ADAPTER_VERSION)
    expect(bindings.adapter.mappingDigest).toBe(MASTER_TEMPLATE_ADAPTER_MAPPING_DIGEST)
    expect(bindings.adoption.adoptionId).toMatch(/^[a-f0-9]{40}$/)
    expect(bindings.payload.projectionDigest).toMatch(/^[a-f0-9]{40}$/)
    expect(bindings.effective).toMatch(/^[a-f0-9]{40}$/)
    expect(createMasterTemplateAdapterIdentity({ providerCommitSha: bindings.candidate.providerCommitSha, providerTreeSha: bindings.candidate.providerTreeSha, version: bindings.candidate.version })).toMatch(/^[a-f0-9]{40}$/)
  })

  it('rejects provider identity tampering and publication of the draft candidate', () => {
    const candidate = {
      repository: MASTER_TEMPLATE_PIN.repositoryUrl,
      entryId: MASTER_TEMPLATE_PIN.entryId,
      version: MASTER_TEMPLATE_PIN.version,
      providerCommitSha: MASTER_TEMPLATE_PIN.commitSha,
      providerTreeSha: MASTER_TEMPLATE_PIN.providerTreeSha,
      sourceReleaseCommitSha: MASTER_TEMPLATE_PIN.sourceReleaseCommitSha,
      sourceReleaseTreeSha: MASTER_TEMPLATE_PIN.sourceReleaseTreeSha,
      artifactTreeSha1: MASTER_TEMPLATE_PIN.artifactTreeSha1,
    } as const
    expect(() => bindMasterTemplateIdentities({
      candidate: { ...candidate, providerTreeSha: 'f'.repeat(40) },
      adoption: { siteId: 'site-ls05', locale: 'en-US', payloadStatus: 'draft' },
      payload: { siteId: 'site-ls05', locale: 'en-US', documentIds: [] },
    })).toThrow(/exact pinned provider\/release identity/)
    expect(() => bindMasterTemplateIdentities({
      candidate,
      adoption: { siteId: 'site-ls05', locale: 'en-US', payloadStatus: 'published' },
      payload: { siteId: 'site-ls05', locale: 'en-US', documentIds: [] },
    })).toThrow(/must remain draft/)
  })

  it('requires an explicit draft-candidate probe policy', () => {
    const result = validateExactRelease({}, FROZEN_PROVIDER_PIN, { allowDraftCandidate: true })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors.join(' ')).toMatch(/explicit.*draft_candidate_probe/i)
  })
})
