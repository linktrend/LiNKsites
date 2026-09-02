/**
 * Deterministic private-preview build planner (overflow lane).
 *
 * Consumes caller-supplied site-composition identities and emits a stable
 * private preview/build plan. Live CMS, hosting, and provider configuration
 * are never contacted. Missing or incomplete live configuration is an explicit
 * HOLD. Identical fake inputs produce identical plan digests. This module
 * does not deploy, publish, or select a production candidate.
 */
import { createHash } from 'node:crypto'
import { canonicalJsonStringify } from './libraryConsumer.ts'

export const PREVIEW_BUILD_PACKET = 'LS-OVERFLOW-PREVIEW-BUILD' as const
export const PREVIEW_BUILD_FIXTURE_AUTHORITY = 'linksites_fake_input_only' as const
export const PREVIEW_BUILD_SCHEMA_VERSION = 1 as const

const SHA1 = /^[a-f0-9]{40}$/

export class PreviewBuildPipelineError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PreviewBuildPipelineError'
  }
}

export type PreviewBuildFixtureAuthority = typeof PREVIEW_BUILD_FIXTURE_AUTHORITY

export type PreviewBuildComposition = Readonly<{
  assemblyManifestId: string
  assemblyManifestVersion: number
  siteClass: 'preview'
  pageInstanceIds: readonly string[]
  adapterRevision: string
  contentReleaseDigest: string
  assemblyDigest: string
}>

export type LiveConfigurationProbe = Readonly<{
  fixtureAuthority: PreviewBuildFixtureAuthority
  status: 'HOLD_unavailable' | 'fake_recorded'
}>

export type LiveConfigurationInput = Readonly<{
  cms?: LiveConfigurationProbe | null
  hosting?: LiveConfigurationProbe | null
  provider?: LiveConfigurationProbe | null
}> | null | undefined

export type PreviewBuildRoute = Readonly<{
  pageInstanceId: string
  previewPath: string
}>

export type PreviewBuildLiveConfiguration =
  | Readonly<{
      status: 'HOLD_unavailable'
      reason: 'missing_live_cms_hosting_or_provider_configuration'
      cms: 'HOLD_unavailable'
      hosting: 'HOLD_unavailable'
      provider: 'HOLD_unavailable'
    }>
  | Readonly<{
      status: 'recorded_fake_only'
      liveUse: 'HOLD'
      cms: 'fake_recorded'
      hosting: 'fake_recorded'
      provider: 'fake_recorded'
    }>

export type PreviewBuildPlan = Readonly<{
  schemaVersion: typeof PREVIEW_BUILD_SCHEMA_VERSION
  packet: typeof PREVIEW_BUILD_PACKET
  fixtureAuthority: PreviewBuildFixtureAuthority
  productionSelectable: false
  deployAttempted: false
  indexingPolicy: 'noindex'
  accessPolicy: 'token_required'
  previewEnvironment: 'private-preview'
  liveConfiguration: PreviewBuildLiveConfiguration
  composition: PreviewBuildComposition
  routes: readonly PreviewBuildRoute[]
  planDigest: string
  verdict: 'preview_build_planned_hold_live'
}>

export type PlanPreviewBuildInput = Readonly<{
  fixtureAuthority: PreviewBuildFixtureAuthority
  composition: PreviewBuildComposition
  liveConfiguration?: LiveConfigurationInput
}>

function requireSha1(value: unknown, label: string): string {
  if (typeof value !== 'string' || !SHA1.test(value)) {
    throw new PreviewBuildPipelineError(`${label} must be an exact lowercase 40-character SHA-1.`)
  }
  return value
}

function requireNonEmptyId(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new PreviewBuildPipelineError(`${label} is required.`)
  }
  return value
}

function probeIsFakeRecorded(probe: LiveConfigurationProbe | null | undefined): probe is LiveConfigurationProbe {
  return probe?.fixtureAuthority === PREVIEW_BUILD_FIXTURE_AUTHORITY && probe.status === 'fake_recorded'
}

function probeIsHold(probe: LiveConfigurationProbe | null | undefined): boolean {
  return probe == null || probe.status === 'HOLD_unavailable'
}

function resolveLiveConfiguration(input: LiveConfigurationInput): PreviewBuildLiveConfiguration {
  if (input == null) {
    return {
      status: 'HOLD_unavailable',
      reason: 'missing_live_cms_hosting_or_provider_configuration',
      cms: 'HOLD_unavailable',
      hosting: 'HOLD_unavailable',
      provider: 'HOLD_unavailable',
    }
  }

  for (const key of ['cms', 'hosting', 'provider'] as const) {
    const probe = input[key]
    if (probe != null && probe.fixtureAuthority !== PREVIEW_BUILD_FIXTURE_AUTHORITY) {
      throw new PreviewBuildPipelineError(`${key} live-configuration probe must declare ${PREVIEW_BUILD_FIXTURE_AUTHORITY}.`)
    }
    if (probe != null && probe.status !== 'HOLD_unavailable' && probe.status !== 'fake_recorded') {
      throw new PreviewBuildPipelineError(`${key} live-configuration status is not an allowed HOLD/fake status.`)
    }
  }

  const allFake = probeIsFakeRecorded(input.cms) && probeIsFakeRecorded(input.hosting) && probeIsFakeRecorded(input.provider)
  if (allFake) {
    return {
      status: 'recorded_fake_only',
      liveUse: 'HOLD',
      cms: 'fake_recorded',
      hosting: 'fake_recorded',
      provider: 'fake_recorded',
    }
  }

  if (probeIsHold(input.cms) && probeIsHold(input.hosting) && probeIsHold(input.provider)) {
    return {
      status: 'HOLD_unavailable',
      reason: 'missing_live_cms_hosting_or_provider_configuration',
      cms: 'HOLD_unavailable',
      hosting: 'HOLD_unavailable',
      provider: 'HOLD_unavailable',
    }
  }

  return {
    status: 'HOLD_unavailable',
    reason: 'missing_live_cms_hosting_or_provider_configuration',
    cms: 'HOLD_unavailable',
    hosting: 'HOLD_unavailable',
    provider: 'HOLD_unavailable',
  }
}

function normalizeComposition(composition: PreviewBuildComposition): PreviewBuildComposition {
  if (composition.siteClass !== 'preview') {
    throw new PreviewBuildPipelineError('preview build plans require siteClass "preview".')
  }
  if (!Number.isInteger(composition.assemblyManifestVersion) || composition.assemblyManifestVersion < 1) {
    throw new PreviewBuildPipelineError('assemblyManifestVersion must be a positive integer.')
  }
  if (!Array.isArray(composition.pageInstanceIds) || composition.pageInstanceIds.length === 0) {
    throw new PreviewBuildPipelineError('pageInstanceIds must contain at least one page instance.')
  }
  const pageInstanceIds = [...new Set(composition.pageInstanceIds.map((id) => requireNonEmptyId(id, 'pageInstanceId')))].sort()
  if (pageInstanceIds.length !== composition.pageInstanceIds.length) {
    throw new PreviewBuildPipelineError('pageInstanceIds must be unique.')
  }
  return Object.freeze({
    assemblyManifestId: requireNonEmptyId(composition.assemblyManifestId, 'assemblyManifestId'),
    assemblyManifestVersion: composition.assemblyManifestVersion,
    siteClass: 'preview',
    pageInstanceIds: Object.freeze(pageInstanceIds),
    adapterRevision: requireNonEmptyId(composition.adapterRevision, 'adapterRevision'),
    contentReleaseDigest: requireSha1(composition.contentReleaseDigest, 'contentReleaseDigest'),
    assemblyDigest: requireSha1(composition.assemblyDigest, 'assemblyDigest'),
  })
}

function previewPath(assemblyManifestId: string, pageInstanceId: string): string {
  return `/preview/${encodeURIComponent(assemblyManifestId)}/${encodeURIComponent(pageInstanceId)}`
}

function digestPlan(value: unknown): string {
  return createHash('sha1').update(canonicalJsonStringify(value), 'utf8').digest('hex')
}

export function planPreviewBuild(input: PlanPreviewBuildInput): PreviewBuildPlan {
  if (input.fixtureAuthority !== PREVIEW_BUILD_FIXTURE_AUTHORITY) {
    throw new PreviewBuildPipelineError(`fixtureAuthority must be ${PREVIEW_BUILD_FIXTURE_AUTHORITY}.`)
  }
  const composition = normalizeComposition(input.composition)
  const liveConfiguration = resolveLiveConfiguration(input.liveConfiguration)
  const routes = Object.freeze(
    composition.pageInstanceIds.map((pageInstanceId) =>
      Object.freeze({
        pageInstanceId,
        previewPath: previewPath(composition.assemblyManifestId, pageInstanceId),
      }),
    ),
  )
  const unsigned = {
    schemaVersion: PREVIEW_BUILD_SCHEMA_VERSION,
    packet: PREVIEW_BUILD_PACKET,
    fixtureAuthority: PREVIEW_BUILD_FIXTURE_AUTHORITY,
    productionSelectable: false as const,
    deployAttempted: false as const,
    indexingPolicy: 'noindex' as const,
    accessPolicy: 'token_required' as const,
    previewEnvironment: 'private-preview' as const,
    liveConfiguration,
    composition,
    routes,
    verdict: 'preview_build_planned_hold_live' as const,
  }
  return Object.freeze({
    ...unsigned,
    planDigest: digestPlan(unsigned),
  })
}
