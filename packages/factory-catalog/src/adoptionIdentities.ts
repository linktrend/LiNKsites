/**
 * LS-02 / ISS-07 adoption identities.
 *
 * Exact provider/layout/plan/overlay/config/content/adapter/effective SHA-1
 * identities for an adopted Site Specification. Provider and adapter pins are
 * dependency evidence only — this module does not copy provider or Harness
 * source. Effective identity is the canonical digest of the other seven pins.
 */

import { createHash } from 'node:crypto'
import { canonicalJsonStringify } from './libraryConsumer.ts'

export class AdoptionIdentityError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AdoptionIdentityError'
  }
}

const SHA1 = /^[a-f0-9]{40}$/

export const LS02_DISPATCH_IDEMPOTENCY = 'cursor-cloud-dispatch-v1:linksites-ls02-272-base627d6d2' as const

export const LS02_DEPENDENCY_EVIDENCE = Object.freeze({
  dispatchIdempotency: LS02_DISPATCH_IDEMPOTENCY,
  ls01Protected: Object.freeze({
    commitSha: '627d6d2ae46dadcf3f8c51d2c8681cba01efc754',
    treeSha: 'a2601a98bd63fff5e358d8f585ff459969a2cbce',
  }),
  h09Protected: Object.freeze({
    commitSha: 'ad8560b242da0d15c0d65a6c8d4d17a0171e2d2b',
    treeSha: '6cab53da19ba390d392157dbcc38979f1a6c86b5',
  }),
  mwt02Provider: Object.freeze({
    candidateTree: '0178894d6ce718bb7dff3c141892f82144e2d18c',
  }),
})

export type Sha1Identity = string

export interface SiteAdoptionIdentities {
  provider: Sha1Identity
  layout: Sha1Identity
  plan: Sha1Identity
  overlay: Sha1Identity
  config: Sha1Identity
  content: Sha1Identity
  adapter: Sha1Identity
  effective: Sha1Identity
}

const IDENTITY_KEYS = ['adapter', 'config', 'content', 'layout', 'overlay', 'plan', 'provider'] as const

function assertSha1(value: unknown, label: string): asserts value is Sha1Identity {
  if (typeof value !== 'string' || !SHA1.test(value)) {
    throw new AdoptionIdentityError(`${label} must be an exact lowercase 40-character SHA-1 identity.`)
  }
}

export function computeEffectiveAdoptionIdentity(identities: Omit<SiteAdoptionIdentities, 'effective'>): Sha1Identity {
  const payload = {
    adapter: identities.adapter,
    config: identities.config,
    content: identities.content,
    layout: identities.layout,
    overlay: identities.overlay,
    plan: identities.plan,
    provider: identities.provider,
    dependencies: LS02_DEPENDENCY_EVIDENCE,
  }
  return createHash('sha1').update(canonicalJsonStringify(payload), 'utf8').digest('hex')
}

export function assertSiteAdoptionIdentities(identities: SiteAdoptionIdentities): SiteAdoptionIdentities {
  for (const key of IDENTITY_KEYS) {
    assertSha1(identities[key], key)
  }
  assertSha1(identities.effective, 'effective')
  if (identities.provider !== LS02_DEPENDENCY_EVIDENCE.mwt02Provider.candidateTree) {
    throw new AdoptionIdentityError('provider identity must equal the accepted MWT-02 candidateTree.')
  }
  if (identities.adapter !== LS02_DEPENDENCY_EVIDENCE.h09Protected.treeSha) {
    throw new AdoptionIdentityError('adapter identity must equal the H-09 protected tree (evidence pin, not copied source).')
  }
  const expectedEffective = computeEffectiveAdoptionIdentity(identities)
  if (identities.effective !== expectedEffective) {
    throw new AdoptionIdentityError('effective identity does not match the canonical digest of the exact adoption pins.')
  }
  return Object.freeze({ ...identities })
}

export function buildCanonicalAdoptionIdentities(pins: Pick<SiteAdoptionIdentities, 'layout' | 'plan' | 'overlay' | 'config' | 'content'>): SiteAdoptionIdentities {
  const identities = {
    provider: LS02_DEPENDENCY_EVIDENCE.mwt02Provider.candidateTree,
    adapter: LS02_DEPENDENCY_EVIDENCE.h09Protected.treeSha,
    layout: pins.layout,
    plan: pins.plan,
    overlay: pins.overlay,
    config: pins.config,
    content: pins.content,
    effective: '',
  }
  identities.effective = computeEffectiveAdoptionIdentity(identities)
  return assertSiteAdoptionIdentities(identities)
}

/**
 * Frozen LSG0-02 Issue 523 schema identities. These are compatibility pins for
 * copied schema/data upgrade only — never production admission, never selectable
 * Library fixture activation.
 */
export const LSDATA01_DISPATCH_IDEMPOTENCY =
  'cursor-cloud-dispatch-v1:linksites-lsdata01-524-base4b2dbaf5' as const

export const LSDATA01_SCHEMA_IDENTITIES = Object.freeze({
  issue523: Object.freeze({
    commitSha: '1f475a686750231acf5b122775282c4a13847f1f',
    treeSha: 'cb272c94eff3a8051f6b88dd476d7182b79a36fc',
  }),
  libraries: Object.freeze({
    commitSha: '5188aaf1a9313a3746075cd6ccea0937c05f7a32',
    treeSha: 'e389671f1dc19f6c1e17a2fd3520f4d9e3b1c139',
  }),
  harness: Object.freeze({
    commitSha: '7f8d5199f67057fb0a314c1d90e04ea6f64df0bf',
    treeSha: '2ce580d54ffa7abbee77fe3710130b9e37c3c31f',
  }),
  platform: Object.freeze({
    commitSha: '67ba864667c8e8dd2b3baed00830c28e3035cea3',
    treeSha: '863e6b1f40def2df99aeb748dd9be570d28b1fb2',
  }),
})

/** Provider fixture trees that must never activate production. */
export const LSDATA01_NON_ADMITTED_FIXTURE_TREES = Object.freeze({
  masterTemplateType1Artifact: 'b599c0f0ee6bc2aad3484aa42ef1fd9e86a05758',
})

export const LSDATA01_PAYLOAD_MIGRATION = '20260911_000001_lsdata01_payload_data_compatibility' as const

export const LSDATA01_COMPATIBILITY_CLASSES = ['retained-production-pin', 'schema-compatibility-copy'] as const
export type Lsdata01CompatibilityClass = (typeof LSDATA01_COMPATIBILITY_CLASSES)[number]

export const LSDATA01_ACTIVATION_STATES = ['inactive', 'active', 'rejected'] as const
export type Lsdata01ActivationState = (typeof LSDATA01_ACTIVATION_STATES)[number]

export type Lsdata01AdoptionState = 'linked' | 'adopted' | 'replaced' | 'rolled_back'

export interface Lsdata01AdoptionRecord {
  adoptionId: string
  tenantOrgId: string
  siteId: string
  identities: SiteAdoptionIdentities
  compatibilityClass: Lsdata01CompatibilityClass
  activationState: Lsdata01ActivationState
  adoptionState: Lsdata01AdoptionState
}

export interface Lsdata01TenantActor {
  actorOrgId: string
  assignedSiteIds: readonly string[]
}

const SCHEMA_COMPAT_PROVIDER_TREES = new Set<string>([
  LSDATA01_SCHEMA_IDENTITIES.libraries.treeSha,
  LSDATA01_SCHEMA_IDENTITIES.harness.treeSha,
  LSDATA01_SCHEMA_IDENTITIES.platform.treeSha,
])

function assertSha1Identity(value: unknown, label: string): asserts value is Sha1Identity {
  assertSha1(value, label)
}

export function computeSchemaCompatibilityEffectiveIdentity(
  identities: Omit<SiteAdoptionIdentities, 'effective'>,
): Sha1Identity {
  const payload = {
    adapter: identities.adapter,
    config: identities.config,
    content: identities.content,
    layout: identities.layout,
    overlay: identities.overlay,
    plan: identities.plan,
    provider: identities.provider,
    dependencies: LSDATA01_SCHEMA_IDENTITIES,
  }
  return createHash('sha1').update(canonicalJsonStringify(payload), 'utf8').digest('hex')
}

export function assertFailClosedTenantBoundary(record: Pick<Lsdata01AdoptionRecord, 'tenantOrgId' | 'siteId'>, actor: Lsdata01TenantActor): void {
  if (!record.tenantOrgId.trim() || !actor.actorOrgId.trim()) {
    throw new AdoptionIdentityError('Tenant authorization denied: org identity is required.')
  }
  if (record.tenantOrgId !== actor.actorOrgId) {
    throw new AdoptionIdentityError('Tenant authorization denied: org boundary is fail-closed.')
  }
  if (!actor.assignedSiteIds.includes(record.siteId)) {
    throw new AdoptionIdentityError('Tenant authorization denied: site is not assigned to the actor.')
  }
}

export function classifyProviderIdentity(
  provider: string,
  options: { claimProduction: boolean },
): Lsdata01CompatibilityClass {
  assertSha1Identity(provider, 'provider')
  if (provider === LSDATA01_NON_ADMITTED_FIXTURE_TREES.masterTemplateType1Artifact) {
    throw new AdoptionIdentityError('Provider fixture trees are not production admission and cannot be activated.')
  }
  if (provider === LS02_DEPENDENCY_EVIDENCE.mwt02Provider.candidateTree) {
    return 'retained-production-pin'
  }
  if (SCHEMA_COMPAT_PROVIDER_TREES.has(provider)) {
    if (options.claimProduction) {
      throw new AdoptionIdentityError('Frozen LSG0-02 schema identities are compatibility copies only, not production admission.')
    }
    return 'schema-compatibility-copy'
  }
  throw new AdoptionIdentityError('Unknown provider identity rejected without partial activation.')
}

export function assertCompatibleAdoptionIdentities(
  identities: SiteAdoptionIdentities,
  options: { claimProduction: boolean },
): { identities: SiteAdoptionIdentities; compatibilityClass: Lsdata01CompatibilityClass; activationState: Lsdata01ActivationState } {
  const compatibilityClass = classifyProviderIdentity(identities.provider, options)
  if (compatibilityClass === 'retained-production-pin') {
    const pinned = assertSiteAdoptionIdentities(identities)
    return { identities: pinned, compatibilityClass, activationState: 'active' }
  }
  for (const key of IDENTITY_KEYS) {
    assertSha1Identity(identities[key], key)
  }
  if (identities.adapter !== LSDATA01_SCHEMA_IDENTITIES.harness.treeSha) {
    throw new AdoptionIdentityError('schema-compatibility adapter identity must equal the frozen LSG0-02 Harness tree.')
  }
  const expectedEffective = computeSchemaCompatibilityEffectiveIdentity(identities)
  if (identities.effective !== expectedEffective) {
    throw new AdoptionIdentityError('schema-compatibility effective identity does not match the frozen LSG0-02 digest.')
  }
  return {
    identities: Object.freeze({ ...identities }),
    compatibilityClass,
    activationState: 'inactive',
  }
}

export function retainPriorAdoption(record: Lsdata01AdoptionRecord): Lsdata01AdoptionRecord {
  if (record.compatibilityClass === 'schema-compatibility-copy') {
    const classified = assertCompatibleAdoptionIdentities(record.identities, { claimProduction: false })
    return Object.freeze({
      ...record,
      identities: classified.identities,
      compatibilityClass: 'schema-compatibility-copy',
      activationState: 'inactive',
    })
  }
  const pinned = assertSiteAdoptionIdentities(record.identities)
  return Object.freeze({
    ...record,
    identities: pinned,
    compatibilityClass: 'retained-production-pin',
    activationState: record.adoptionState === 'rolled_back' ? record.activationState : 'active',
  })
}

export function activateAdoptionOrReject(
  prior: Lsdata01AdoptionRecord | null,
  incoming: Omit<Lsdata01AdoptionRecord, 'compatibilityClass' | 'activationState'> & {
    claimProduction: boolean
  },
  actor: Lsdata01TenantActor,
): Lsdata01AdoptionRecord {
  const priorSnapshot = prior ? Object.freeze({ ...prior, identities: Object.freeze({ ...prior.identities }) }) : null
  try {
    assertFailClosedTenantBoundary(incoming, actor)
    const classified = assertCompatibleAdoptionIdentities(incoming.identities, {
      claimProduction: incoming.claimProduction,
    })
    if (classified.compatibilityClass === 'schema-compatibility-copy' && incoming.adoptionState === 'adopted') {
      throw new AdoptionIdentityError('Schema compatibility copies cannot activate production adoption.')
    }
    return Object.freeze({
      adoptionId: incoming.adoptionId,
      tenantOrgId: incoming.tenantOrgId,
      siteId: incoming.siteId,
      identities: classified.identities,
      compatibilityClass: classified.compatibilityClass,
      activationState: classified.activationState,
      adoptionState: classified.compatibilityClass === 'schema-compatibility-copy' ? 'linked' : incoming.adoptionState,
    })
  } catch (error) {
    if (priorSnapshot) {
      return priorSnapshot
    }
    throw error
  }
}

export function rollbackAdoption(record: Lsdata01AdoptionRecord, target: Lsdata01AdoptionRecord): Lsdata01AdoptionRecord {
  if (record.adoptionId !== target.adoptionId || record.tenantOrgId !== target.tenantOrgId) {
    throw new AdoptionIdentityError('Rollback target does not match the recorded adoption identity.')
  }
  return Object.freeze({
    ...target,
    adoptionState: 'rolled_back',
    activationState: target.compatibilityClass === 'retained-production-pin' ? 'active' : 'inactive',
  })
}

export interface Lsdata01CompatibilityStore {
  readonly appliedMigrations: ReadonlySet<string>
  applyMigration(): { applied: boolean; name: string }
  installFresh(record: Parameters<typeof activateAdoptionOrReject>[1], actor: Lsdata01TenantActor): Lsdata01AdoptionRecord
  upgradeCopied(prior: Lsdata01AdoptionRecord, actor: Lsdata01TenantActor): Lsdata01AdoptionRecord
  rejectIncompatible(
    prior: Lsdata01AdoptionRecord | null,
    incoming: Parameters<typeof activateAdoptionOrReject>[1],
    actor: Lsdata01TenantActor,
  ): { activated: false; prior: Lsdata01AdoptionRecord | null; reason: string }
  get(adoptionId: string): Lsdata01AdoptionRecord | undefined
}

export function createLsdata01CompatibilityStore(): Lsdata01CompatibilityStore {
  const adoptions = new Map<string, Lsdata01AdoptionRecord>()
  const appliedMigrations = new Set<string>()

  const applyMigration = () => {
    const already = appliedMigrations.has(LSDATA01_PAYLOAD_MIGRATION)
    appliedMigrations.add(LSDATA01_PAYLOAD_MIGRATION)
    return { applied: !already, name: LSDATA01_PAYLOAD_MIGRATION }
  }

  return {
    get appliedMigrations() {
      return appliedMigrations
    },
    applyMigration,
    installFresh(record, actor) {
      applyMigration()
      if (adoptions.has(record.adoptionId)) {
        throw new AdoptionIdentityError('Fresh installation rejected: adoption already exists.')
      }
      const next = activateAdoptionOrReject(null, record, actor)
      adoptions.set(next.adoptionId, next)
      return next
    },
    upgradeCopied(prior, actor) {
      applyMigration()
      const retained = retainPriorAdoption(prior)
      assertFailClosedTenantBoundary(retained, actor)
      adoptions.set(retained.adoptionId, retained)
      return retained
    },
    rejectIncompatible(prior, incoming, actor) {
      const before = prior ? adoptions.get(prior.adoptionId) ?? prior : null
      try {
        const next = activateAdoptionOrReject(null, incoming, actor)
        if (next.activationState === 'active' && incoming.claimProduction && next.compatibilityClass !== 'retained-production-pin') {
          throw new AdoptionIdentityError('Incompatible production claim.')
        }
        throw new AdoptionIdentityError('Incompatible input must not activate.')
      } catch (error) {
        if (before) {
          adoptions.set(before.adoptionId, before)
        }
        return {
          activated: false,
          prior: before,
          reason: error instanceof Error ? error.message : String(error),
        }
      }
    },
    get(adoptionId) {
      return adoptions.get(adoptionId)
    },
  }
}
