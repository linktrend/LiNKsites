import { describe, expect, it } from 'vitest'
import {
  assertNoAnalyticsIdentityCollision,
  createPreviewDeployment,
  expireIfPastDue,
  isDeploymentServable,
  markDeploymentAsIndexable,
  PreviewDeploymentError,
  type CreatePreviewDeploymentInput,
  type PreviewDeployment,
} from '../src/previewDeployment.js'
import type { SiteAssemblyManifest } from '../src/siteAssemblyManifest.js'

function buildManifest(overrides: Partial<SiteAssemblyManifest> = {}): SiteAssemblyManifest {
  return {
    schemaVersion: { major: 1, minor: 0 },
    manifestId: 'manifest-1',
    manifestVersion: 1,
    siteId: 'site-1',
    siteClass: 'preview',
    kitId: 'home_services',
    tierId: 'standard',
    platformReleaseRef: 'platform-release-1',
    designProfileRef: 'site-1',
    contentReleaseRef: 'adaptation:adapt-1',
    pages: [],
    lineage: {},
    resolvedAt: new Date().toISOString(),
    ...overrides,
  }
}

const FIXED_NOW = new Date('2026-01-01T00:00:00.000Z')

function buildInput(overrides: Partial<CreatePreviewDeploymentInput> = {}): CreatePreviewDeploymentInput {
  return {
    previewId: 'preview-1',
    prospectId: 'prospect-1',
    manifest: buildManifest(),
    payloadDraftContentRef: 'payload-draft-1',
    analyticsIdentityRef: 'analytics-1',
    accessPolicy: 'internal_only',
    expiresAt: new Date('2026-01-08T00:00:00.000Z').toISOString(),
    now: FIXED_NOW,
    ...overrides,
  }
}

function buildDeployment(overrides: Partial<PreviewDeployment> = {}): PreviewDeployment {
  return {
    schemaVersion: { major: 1, minor: 0 },
    previewId: 'preview-1',
    prospectId: 'prospect-1',
    siteAssemblyManifestId: 'manifest-1',
    siteAssemblyManifestVersion: 1,
    payloadDraftContentRef: 'payload-draft-1',
    analyticsIdentityRef: 'analytics-1',
    accessPolicy: 'internal_only',
    indexingPolicy: 'noindex',
    status: 'active',
    createdAt: FIXED_NOW.toISOString(),
    expiresAt: new Date('2026-01-08T00:00:00.000Z').toISOString(),
    qualityReceiptRef: null,
    ...overrides,
  }
}

describe('createPreviewDeployment', () => {
  it('creates an active deployment with all fields populated from the input', () => {
    const input = buildInput()
    const deployment = createPreviewDeployment(input)

    expect(deployment.previewId).toBe(input.previewId)
    expect(deployment.prospectId).toBe(input.prospectId)
    expect(deployment.siteAssemblyManifestId).toBe(input.manifest.manifestId)
    expect(deployment.siteAssemblyManifestVersion).toBe(input.manifest.manifestVersion)
    expect(deployment.payloadDraftContentRef).toBe(input.payloadDraftContentRef)
    expect(deployment.analyticsIdentityRef).toBe(input.analyticsIdentityRef)
    expect(deployment.accessPolicy).toBe(input.accessPolicy)
    expect(deployment.status).toBe('active')
    expect(deployment.expiresAt).toBe(input.expiresAt)
    expect(deployment.qualityReceiptRef).toBeNull()
  })

  it('forces indexingPolicy to "noindex" unconditionally, even when accessPolicy is "public"', () => {
    const deployment = createPreviewDeployment(buildInput({ accessPolicy: 'public' }))
    expect(deployment.indexingPolicy).toBe('noindex')
  })

  it('forces indexingPolicy to "noindex" for token_required and internal_only access policies too', () => {
    const tokenRequired = createPreviewDeployment(buildInput({ accessPolicy: 'token_required' }))
    const internalOnly = createPreviewDeployment(buildInput({ accessPolicy: 'internal_only' }))
    expect(tokenRequired.indexingPolicy).toBe('noindex')
    expect(internalOnly.indexingPolicy).toBe('noindex')
  })

  it('rejects an expiresAt strictly in the past relative to now', () => {
    const input = buildInput({ expiresAt: new Date('2025-12-31T00:00:00.000Z').toISOString() })
    expect(() => createPreviewDeployment(input)).toThrow(PreviewDeploymentError)
  })

  it('rejects an expiresAt exactly equal to now (must be strictly after, not equal)', () => {
    const input = buildInput({ expiresAt: FIXED_NOW.toISOString() })
    expect(() => createPreviewDeployment(input)).toThrow(PreviewDeploymentError)
  })
})

describe('markDeploymentAsIndexable', () => {
  it('succeeds for a public-access deployment with a qualityReceiptRef, returning a new object without mutating the original', () => {
    const original = buildDeployment({ accessPolicy: 'public', qualityReceiptRef: 'receipt-1' })
    const result = markDeploymentAsIndexable(original)

    expect(result.indexingPolicy).toBe('indexable')
    expect(result).not.toBe(original)
    expect(original.indexingPolicy).toBe('noindex')
  })

  it('rejects a token_required deployment', () => {
    const deployment = buildDeployment({ accessPolicy: 'token_required', qualityReceiptRef: 'receipt-1' })
    expect(() => markDeploymentAsIndexable(deployment)).toThrow(PreviewDeploymentError)
  })

  it('rejects an internal_only deployment', () => {
    const deployment = buildDeployment({ accessPolicy: 'internal_only', qualityReceiptRef: 'receipt-1' })
    expect(() => markDeploymentAsIndexable(deployment)).toThrow(PreviewDeploymentError)
  })

  it('rejects a public deployment with qualityReceiptRef: null', () => {
    const deployment = buildDeployment({ accessPolicy: 'public', qualityReceiptRef: null })
    expect(() => markDeploymentAsIndexable(deployment)).toThrow(PreviewDeploymentError)
  })
})

describe('assertNoAnalyticsIdentityCollision', () => {
  it('does not throw for deployments with all-distinct analytics identities', () => {
    const deployments = [
      buildDeployment({ previewId: 'preview-1', analyticsIdentityRef: 'analytics-1' }),
      buildDeployment({ previewId: 'preview-2', analyticsIdentityRef: 'analytics-2' }),
    ]
    expect(() => assertNoAnalyticsIdentityCollision(deployments)).not.toThrow()
  })

  it('throws, naming both previewIds, when two deployments share the same analyticsIdentityRef', () => {
    const deployments = [
      buildDeployment({ previewId: 'preview-1', analyticsIdentityRef: 'analytics-shared' }),
      buildDeployment({ previewId: 'preview-2', analyticsIdentityRef: 'analytics-shared' }),
    ]

    expect(() => assertNoAnalyticsIdentityCollision(deployments)).toThrow(PreviewDeploymentError)
    try {
      assertNoAnalyticsIdentityCollision(deployments)
      throw new Error('expected assertNoAnalyticsIdentityCollision to throw')
    } catch (error) {
      expect((error as Error).message).toContain('preview-1')
      expect((error as Error).message).toContain('preview-2')
    }
  })
})

describe('isDeploymentServable', () => {
  it('returns true for an active, not-yet-expired deployment', () => {
    const deployment = buildDeployment({
      status: 'active',
      expiresAt: new Date('2026-01-08T00:00:00.000Z').toISOString(),
    })
    expect(isDeploymentServable(deployment, FIXED_NOW)).toBe(true)
  })

  it('returns false for an active but past-due deployment', () => {
    const deployment = buildDeployment({
      status: 'active',
      expiresAt: new Date('2025-12-31T00:00:00.000Z').toISOString(),
    })
    expect(isDeploymentServable(deployment, FIXED_NOW)).toBe(false)
  })

  it('returns false for a non-active status even if expiresAt is still in the future', () => {
    const locked = buildDeployment({
      status: 'locked',
      expiresAt: new Date('2026-01-08T00:00:00.000Z').toISOString(),
    })
    const archived = buildDeployment({
      status: 'archived',
      expiresAt: new Date('2026-01-08T00:00:00.000Z').toISOString(),
    })
    expect(isDeploymentServable(locked, FIXED_NOW)).toBe(false)
    expect(isDeploymentServable(archived, FIXED_NOW)).toBe(false)
  })
})

describe('expireIfPastDue', () => {
  it('transitions an active, past-due deployment to "expired" and returns a new object', () => {
    const original = buildDeployment({
      status: 'active',
      expiresAt: new Date('2025-12-31T00:00:00.000Z').toISOString(),
    })
    const result = expireIfPastDue(original, FIXED_NOW)

    expect(result.status).toBe('expired')
    expect(result).not.toBe(original)
    expect(original.status).toBe('active')
  })

  it('does not transition an active, not-yet-past-due deployment', () => {
    const original = buildDeployment({
      status: 'active',
      expiresAt: new Date('2026-01-08T00:00:00.000Z').toISOString(),
    })
    const result = expireIfPastDue(original, FIXED_NOW)

    expect(result.status).toBe('active')
  })

  it('is a no-op for a deployment that is already "locked", even if expiresAt has passed', () => {
    const original = buildDeployment({
      status: 'locked',
      expiresAt: new Date('2025-12-31T00:00:00.000Z').toISOString(),
    })
    const result = expireIfPastDue(original, FIXED_NOW)

    expect(result.status).toBe('locked')
    expect(result).toBe(original)
  })
})
