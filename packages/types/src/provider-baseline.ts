export type ProviderName = 'platform' | 'libraries' | 'brain' | 'skills' | 'autowork'

type ProviderCommitTree = {
  readonly provider: ProviderName
  readonly commit: string
  readonly tree: string
}

export type PlatformBaseline = ProviderCommitTree & {
  readonly provider: 'platform'
  readonly authClaimsSchema: 'platform.auth-claims/1.1.0'
  readonly providerTrustContract: 'platform.provider-trust/1.0.0'
}
export type LibrariesBaseline = ProviderCommitTree & {
  readonly provider: 'libraries'
  readonly schemaVersion: 2
  readonly schemaRevision: 2
  readonly cataloguePath: 'indexes/v2/catalog.json'
  readonly schemaPath: 'schemas/v2'
  readonly catalogueRecordsSha256: '03b52875dd3c2fcf5c8fa056560fd77e0986aca04ba69bd11ebf28c866b97f2c'
}
export type BrainBaseline = ProviderCommitTree & {
  readonly provider: 'brain'
  readonly contractVersion: '2.0.0'
  readonly profile: 'linksites.oversight'
  readonly profileVersion: '1.0.0'
}
export type SkillsBaseline = ProviderCommitTree & {
  readonly provider: 'skills'
  readonly contractVersion: 'skills.api.v0.2'
}
export type AutoworkBaseline = ProviderCommitTree & {
  readonly provider: 'autowork'
  readonly contractVersion: '2026-08-13.v1'
}

export type ProviderBaseline =
  | PlatformBaseline
  | LibrariesBaseline
  | BrainBaseline
  | SkillsBaseline
  | AutoworkBaseline

const values: { readonly [P in ProviderName]: ProviderBaseline } = {
  platform: {
    provider: 'platform',
    commit: 'adbabf7d399cbfe5c1056d275c3d98eb480397cc',
    tree: 'b76993f458b6dbed5d2c3e09c2c5e8ad87c6a45d',
    authClaimsSchema: 'platform.auth-claims/1.1.0',
    providerTrustContract: 'platform.provider-trust/1.0.0',
  },
  libraries: {
    provider: 'libraries',
    commit: '4cbe7fb174aba4b159d6c37ba1ef65fd3221510f',
    tree: '60e582fbd1ce988538b650c99878e700c6cfa0d2',
    schemaVersion: 2,
    schemaRevision: 2,
    cataloguePath: 'indexes/v2/catalog.json',
    schemaPath: 'schemas/v2',
    catalogueRecordsSha256: '03b52875dd3c2fcf5c8fa056560fd77e0986aca04ba69bd11ebf28c866b97f2c',
  },
  brain: {
    provider: 'brain',
    commit: '9042e668dd0c7cef232cb427ffc9c76f06a7a446',
    tree: '303a15936932fb5a54b208c934a6d511045cc8e4',
    contractVersion: '2.0.0',
    profile: 'linksites.oversight',
    profileVersion: '1.0.0',
  },
  skills: {
    provider: 'skills',
    commit: 'e3d80fd22a05a4f68207e130c50b772b5acffda4',
    tree: '69a131b46a73a4ef724694bfe240b1a11652bcc9',
    contractVersion: 'skills.api.v0.2',
  },
  autowork: {
    provider: 'autowork',
    commit: '79ee98eb3bd1ae0cce9d34872e90fe7101a9f353',
    tree: 'deb37e4f3a29339b35613ee799d461c74bb7b585',
    contractVersion: '2026-08-13.v1',
  },
}

const keys: { readonly [P in ProviderName]: readonly string[] } = {
  platform: ['provider', 'commit', 'tree', 'authClaimsSchema', 'providerTrustContract'],
  libraries: [
    'provider',
    'commit',
    'tree',
    'schemaVersion',
    'schemaRevision',
    'cataloguePath',
    'schemaPath',
    'catalogueRecordsSha256',
  ],
  brain: ['provider', 'commit', 'tree', 'contractVersion', 'profile', 'profileVersion'],
  skills: ['provider', 'commit', 'tree', 'contractVersion'],
  autowork: ['provider', 'commit', 'tree', 'contractVersion'],
}

function freeze<T extends object>(value: T): T {
  return Object.freeze(value)
}

for (const provider of Object.keys(values) as ProviderName[]) freeze(values[provider])
export const PROVIDER_BASELINES = Object.freeze(values)

export class ProviderBaselineError extends Error {
  readonly code = 'provider_baseline_rejected' as const
  readonly reason: string
  constructor(reason: string) {
    super(`Provider baseline rejected: ${reason}`)
    this.reason = reason
    this.name = 'ProviderBaselineError'
  }
}

function isProviderName(value: unknown): value is ProviderName {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(values, value)
}

export function bindProviderBaseline<P extends ProviderName>(
  provider: P,
  candidate: unknown,
): Extract<ProviderBaseline, { provider: P }> {
  if (!isProviderName(provider)) throw new ProviderBaselineError('unknownProvider')
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    throw new ProviderBaselineError('missingBaseline')
  }
  const actual = candidate as Record<string, unknown>
  const allowed = keys[provider]
  if (
    Object.keys(actual).some((key) => !allowed.includes(key)) ||
    allowed.some((key) => !Object.prototype.hasOwnProperty.call(actual, key))
  ) {
    throw new ProviderBaselineError('unexpectedOrMissingKey')
  }
  const expected = values[provider] as Record<string, unknown>
  for (const key of allowed) if (actual[key] !== expected[key]) throw new ProviderBaselineError(`${key}Mismatch`)
  return expected as Extract<ProviderBaseline, { provider: P }>
}

export function assertProviderBaseline(
  candidate: unknown,
  provider?: ProviderName,
): asserts candidate is ProviderBaseline {
  if (provider !== undefined) {
    bindProviderBaseline(provider, candidate)
    return
  }
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    throw new ProviderBaselineError('missingBaseline')
  }
  const name = (candidate as Record<string, unknown>).provider
  if (!isProviderName(name)) throw new ProviderBaselineError('unknownProvider')
  bindProviderBaseline(name, candidate)
}

export function providerBaseline<P extends ProviderName>(
  provider: P,
): Extract<ProviderBaseline, { provider: P }> {
  if (!isProviderName(provider)) throw new ProviderBaselineError('unknownProvider')
  return values[provider] as Extract<ProviderBaseline, { provider: P }>
}
