import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  PREVIEW_BUILD_FIXTURE_AUTHORITY,
  PREVIEW_BUILD_PACKET,
  PreviewBuildPipelineError,
  planPreviewBuild,
  type PlanPreviewBuildInput,
  type PreviewBuildComposition,
} from '../src/previewBuildPipeline.js'

const fixturePath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  'fixtures/preview-build/fake-preview-composition.json',
)

function fakeComposition(overrides: Partial<PreviewBuildComposition> = {}): PreviewBuildComposition {
  return {
    assemblyManifestId: 'manifest-preview-fake-001',
    assemblyManifestVersion: 1,
    siteClass: 'preview',
    pageInstanceIds: ['home', 'about', 'contact'],
    adapterRevision: 'linksites-adapter-fake-a1',
    contentReleaseDigest: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    assemblyDigest: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    ...overrides,
  }
}

function input(overrides: Partial<PlanPreviewBuildInput> = {}): PlanPreviewBuildInput {
  return {
    fixtureAuthority: PREVIEW_BUILD_FIXTURE_AUTHORITY,
    composition: fakeComposition(),
    ...overrides,
  }
}

describe('deterministic preview/build pipeline', () => {
  it('plans a private preview from explicit fake composition and HOLDs missing live configuration', () => {
    const fixture = JSON.parse(readFileSync(fixturePath, 'utf8')) as {
      fixtureAuthority: string
      immutableProviderStatus: string
      providerAdmissionClaimed: boolean
      productionSelectableClaimed: boolean
      deployAttempted: boolean
      composition: PreviewBuildComposition
    }
    expect(fixture.fixtureAuthority).toBe(PREVIEW_BUILD_FIXTURE_AUTHORITY)
    expect(fixture.immutableProviderStatus).toBe('HOLD_unavailable')
    expect(fixture.providerAdmissionClaimed).toBe(false)
    expect(fixture.productionSelectableClaimed).toBe(false)
    expect(fixture.deployAttempted).toBe(false)

    const plan = planPreviewBuild({
      fixtureAuthority: fixture.fixtureAuthority as typeof PREVIEW_BUILD_FIXTURE_AUTHORITY,
      composition: fixture.composition,
    })

    expect(plan.packet).toBe(PREVIEW_BUILD_PACKET)
    expect(plan.productionSelectable).toBe(false)
    expect(plan.deployAttempted).toBe(false)
    expect(plan.indexingPolicy).toBe('noindex')
    expect(plan.accessPolicy).toBe('token_required')
    expect(plan.previewEnvironment).toBe('private-preview')
    expect(plan.verdict).toBe('preview_build_planned_hold_live')
    expect(plan.liveConfiguration).toEqual({
      status: 'HOLD_unavailable',
      reason: 'missing_live_cms_hosting_or_provider_configuration',
      cms: 'HOLD_unavailable',
      hosting: 'HOLD_unavailable',
      provider: 'HOLD_unavailable',
    })
    expect(plan.routes.map((route) => route.previewPath)).toEqual([
      '/preview/manifest-preview-fake-001/about',
      '/preview/manifest-preview-fake-001/contact',
      '/preview/manifest-preview-fake-001/home',
    ])
  })

  it('is deterministic for identical fake inputs', () => {
    const first = planPreviewBuild(input())
    const second = planPreviewBuild(input())
    expect(first).toEqual(second)
    expect(first.planDigest).toMatch(/^[a-f0-9]{40}$/)
  })

  it('changes the plan digest when composition identities change', () => {
    const baseline = planPreviewBuild(input())
    const mutated = planPreviewBuild(
      input({
        composition: fakeComposition({ assemblyDigest: 'cccccccccccccccccccccccccccccccccccccccc' }),
      }),
    )
    expect(mutated.planDigest).not.toBe(baseline.planDigest)
  })

  it('records complete fake live probes as fake-only and still HOLDs live use', () => {
    const probe = { fixtureAuthority: PREVIEW_BUILD_FIXTURE_AUTHORITY, status: 'fake_recorded' as const }
    const plan = planPreviewBuild(
      input({
        liveConfiguration: { cms: probe, hosting: probe, provider: probe },
      }),
    )
    expect(plan.liveConfiguration).toEqual({
      status: 'recorded_fake_only',
      liveUse: 'HOLD',
      cms: 'fake_recorded',
      hosting: 'fake_recorded',
      provider: 'fake_recorded',
    })
    expect(plan.deployAttempted).toBe(false)
    expect(plan.productionSelectable).toBe(false)
  })

  it('HOLDs when only some live probes are present', () => {
    const plan = planPreviewBuild(
      input({
        liveConfiguration: {
          cms: { fixtureAuthority: PREVIEW_BUILD_FIXTURE_AUTHORITY, status: 'fake_recorded' },
          hosting: { fixtureAuthority: PREVIEW_BUILD_FIXTURE_AUTHORITY, status: 'HOLD_unavailable' },
        },
      }),
    )
    expect(plan.liveConfiguration.status).toBe('HOLD_unavailable')
  })

  it('rejects non-fake fixture authority', () => {
    expect(() =>
      planPreviewBuild({
        ...input(),
        fixtureAuthority: 'live-provider' as typeof PREVIEW_BUILD_FIXTURE_AUTHORITY,
      }),
    ).toThrow(PreviewBuildPipelineError)
  })

  it('rejects non-preview site class and invalid identities', () => {
    expect(() =>
      planPreviewBuild(input({ composition: fakeComposition({ siteClass: 'customer' as 'preview' }) })),
    ).toThrow(/siteClass/)
    expect(() =>
      planPreviewBuild(input({ composition: fakeComposition({ pageInstanceIds: [] }) })),
    ).toThrow(/pageInstanceIds/)
    expect(() =>
      planPreviewBuild(input({ composition: fakeComposition({ assemblyDigest: 'not-a-sha1' }) })),
    ).toThrow(/assemblyDigest/)
  })
})
