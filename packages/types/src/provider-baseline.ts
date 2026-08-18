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
  readonly catalogueRecordsSha256: 'dcabdfa363fe419d5b1ec04266efb65bd835ea5bc916c770d587404a2abe97a5'
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
    commit: '5452f90a35ed690698a9161117a9d92c69985582',
    tree: '90b51726f7a77e4620151a463a10cfc3d2007c88',
    authClaimsSchema: 'platform.auth-claims/1.1.0',
    providerTrustContract: 'platform.provider-trust/1.0.0',
  },
  libraries: {
    provider: 'libraries',
    commit: '368d869e92a6056540092cf18ba6c7e32954dad1',
    tree: '185d7cf714777d60a2d01a4881bf1a11bc5018d9',
    schemaVersion: 2,
    schemaRevision: 2,
    cataloguePath: 'indexes/v2/catalog.json',
    schemaPath: 'schemas/v2',
    catalogueRecordsSha256: 'dcabdfa363fe419d5b1ec04266efb65bd835ea5bc916c770d587404a2abe97a5',
  },
  brain: {
    provider: 'brain',
    commit: '8ce1d737f8870a479f07b1741c58d6681cd07aa1',
    tree: '0cae42d612342f5e52c7e2e0e76cb6fc2f6d81f3',
    contractVersion: '2.0.0',
    profile: 'linksites.oversight',
    profileVersion: '1.0.0',
  },
  skills: {
    provider: 'skills',
    commit: '6269cb173a7c9e0170b29f35c539343c29eab795',
    tree: '6c36e6c98f90e55d957fba781327b1b0ef90860a',
    contractVersion: 'skills.api.v0.2',
  },
  autowork: {
    provider: 'autowork',
    commit: '4eb29203766b1ccf200a2dc10b39cc58d175c90c',
    tree: '5f306d674780a5a26048017f916da6048d71e7a5',
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
