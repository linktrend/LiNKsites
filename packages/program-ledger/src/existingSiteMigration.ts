/**
 * ISS-31 existing-site migration engineering (LS-10 / LS-FR-23 / LS-FR-24).
 *
 * Operates only on copied site snapshots. Plan/apply/verify, pin stability,
 * compatible and incompatible upgrades, retirement, and rollback readback
 * live here. LS-10 packet acceptance is never emitted: H-09 consumer
 * conformance is not accepted, and ISS-32/ISS-33 remain out of this issue.
 */

import { createHash } from 'node:crypto'
import { canonicalSerialize } from './types.ts'

export const ISS31_PACKET = 'LS-10' as const
export const ISS31_ISSUE = 'ISS-31' as const
export const CURRENT_GENERIC_RUNTIME = 'program-ledger+program-orchestrator+execution' as const

export const REJECTED_PIN_SHA_PREFIXES = [
  'd7997b6e',
  '9bdee5dd',
  'b2d2bbb0',
  '3bf53b8b',
] as const

export const EXISTING_SITE_PIN = Object.freeze({
  repository: 'https://github.com/linktrend/LiNKlibraries.git',
  commitSha: 'dbf749cb48ffa03bf2e702d37b608f14c63e0520',
  treeSha: 'a968c801f0fa7cbeac40edc788a4f081617e2759',
  entryId: 'master-template-type-1',
  version: '2.0.0-a1.1',
  lifecycle: 'draft',
  selectability: 'non_selectable',
  contractName: 'linksites.master-template',
  contractVersion: '2.0.0',
  compatibleRange: '>=2.0.0 <3.0.0',
} as const)

export const COMPATIBLE_UPGRADE_PIN = Object.freeze({
  ...EXISTING_SITE_PIN,
  commitSha: 'c0ffee0000000000000000000000000000000001',
  treeSha: 'c0ffee0000000000000000000000000000000002',
  version: '2.0.1-a1.2',
} as const)

export const INCOMPATIBLE_UPGRADE_PIN = Object.freeze({
  ...EXISTING_SITE_PIN,
  commitSha: 'deadbeef00000000000000000000000000000001',
  treeSha: 'deadbeef00000000000000000000000000000002',
  version: '3.0.0',
  contractVersion: '3.0.0',
  compatibleRange: '>=3.0.0 <4.0.0',
  lifecycle: 'draft',
  selectability: 'non_selectable',
} as const)

export const INVALID_LEGACY_PIN = Object.freeze({
  ...EXISTING_SITE_PIN,
  commitSha: 'd7997b6e00000000000000000000000000000001',
  treeSha: 'd7997b6e00000000000000000000000000000002',
  version: '1.9.0-legacy',
  contractVersion: '1.9.0',
  compatibleRange: '>=1.9.0 <2.0.0',
  lifecycle: 'deprecated',
  selectability: 'non_selectable',
} as const)

export type PinSelectability = 'selectable' | 'non_selectable' | 'conditionally_selectable'
export type CompatibilityKind = 'compatible' | 'incompatible'
export type SiteLifecycle = 'draft' | 'preview' | 'published' | 'retired' | 'rolled_back'
export type MigrationIssueType =
  | 'site.migration.plan'
  | 'site.migration.apply'
  | 'site.migration.verify'
  | 'site.migration.rollback'

export type PinRecord = {
  repository: string
  commitSha: string
  treeSha: string
  entryId: string
  version: string
  lifecycle: string
  selectability: PinSelectability
  contractName: string
  contractVersion: string
  compatibleRange: string
}

export type SiteIdentities = {
  provider: string
  layout: string
  plan: string
  overlay: string
  config: string
  content: string
  adapter: string
  effective: string
}

export type CopiedExistingSite = {
  siteId: string
  orgId: string
  pin: PinRecord
  adoptionId: string
  identities: SiteIdentities
  configuration: Record<string, unknown>
  content: Record<string, unknown>
  lifecycle: SiteLifecycle
  active: boolean
}

export type MigrationPlan = {
  planId: string
  siteIds: string[]
  targetPin: PinRecord
  compatibility: CompatibilityKind
  deliberate: boolean
  breaking: boolean
  beforeDigest: string
  beforeSnapshots: CopiedExistingSite[]
  pinWitness: Record<string, string>
  createdAt: string
}

export type ApplyReceipt = {
  planId: string
  applied: boolean
  preserved: boolean
  reason: string
  afterDigest: string
  afterSnapshots: CopiedExistingSite[]
  appliedAt: string
}

export type VerifyReceipt = {
  planId: string
  verified: boolean
  pinStableForUnselected: boolean
  beforeDigest: string
  afterDigest: string
  expectedApplied: boolean
  reason: string
}

export type RollbackReceipt = {
  planId: string
  rolledBack: boolean
  readbackDigest: string
  beforeDigest: string
  matchesBefore: boolean
  afterSnapshots: CopiedExistingSite[]
  reason: string
}

export type Ls10Acceptance = {
  packet: typeof ISS31_PACKET
  issue: typeof ISS31_ISSUE
  status: 'HOLD'
  h09ConsumerConformanceAccepted: false
  genericRuntimeActive: true
  currentRuntime: typeof CURRENT_GENERIC_RUNTIME
  reason: string
}

export class ExistingSiteMigrationError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'site_not_found'
      | 'plan_not_found'
      | 'apply_not_found'
      | 'invalid_pin'
      | 'deliberate_migration_required'
      | 'default_must_not_move_existing'
      | 'rollback_not_available'
      | 'unknown_compatibility',
  ) {
    super(message)
    this.name = 'ExistingSiteMigrationError'
  }
}

export function sha256Canonical(value: unknown): string {
  return createHash('sha256').update(canonicalSerialize(value)).digest('hex')
}

export function digestCopiedSite(site: CopiedExistingSite): string {
  return sha256Canonical(site)
}

export function digestCopiedCatalog(sites: readonly CopiedExistingSite[]): string {
  const ordered = sites
    .slice()
    .sort((left, right) => left.siteId.localeCompare(right.siteId))
    .map((site) => ({ siteId: site.siteId, digest: digestCopiedSite(site) }))
  return sha256Canonical(ordered)
}

export function cloneSite(site: CopiedExistingSite): CopiedExistingSite {
  return structuredClone(site)
}

export function isRejectedPinSha(commitSha: string): boolean {
  const normalized = commitSha.trim().toLowerCase()
  return REJECTED_PIN_SHA_PREFIXES.some((prefix) => normalized.startsWith(prefix))
}

export function parseCompatibleRange(range: string): { minInclusive: string; maxExclusive: string } | null {
  const match = /^>=(\d+\.\d+\.\d+) <(\d+\.\d+\.\d+)$/.exec(range.trim())
  if (!match) return null
  return { minInclusive: match[1], maxExclusive: match[2] }
}

function compareSemverCore(left: string, right: string): number {
  const [lMaj, lMin, lPat] = left.split('.').map((part) => Number(part))
  const [rMaj, rMin, rPat] = right.split('.').map((part) => Number(part))
  if (lMaj !== rMaj) return lMaj - rMaj
  if (lMin !== rMin) return lMin - rMin
  return lPat - rPat
}

export function coreVersion(version: string): string {
  const match = /^(\d+\.\d+\.\d+)/.exec(version)
  return match ? match[1] : version
}

export function pinIsCompatibleWithSite(sitePin: PinRecord, targetPin: PinRecord): boolean {
  if (sitePin.contractName !== targetPin.contractName) return false
  const range = parseCompatibleRange(sitePin.compatibleRange)
  if (!range) return false
  const targetCore = coreVersion(targetPin.contractVersion)
  return compareSemverCore(targetCore, range.minInclusive) >= 0 && compareSemverCore(targetCore, range.maxExclusive) < 0
}

export function classifyUpgrade(sitePin: PinRecord, targetPin: PinRecord): CompatibilityKind {
  return pinIsCompatibleWithSite(sitePin, targetPin) ? 'compatible' : 'incompatible'
}

export function evaluateLs10Acceptance(input: {
  h09ConsumerConformanceAccepted: boolean
  iss31EngineeringComplete: boolean
}): Ls10Acceptance {
  const reason = !input.h09ConsumerConformanceAccepted
    ? 'h09_consumer_conformance_not_accepted'
    : 'iss31_does_not_accept_ls10_packet'
  return {
    packet: ISS31_PACKET,
    issue: ISS31_ISSUE,
    status: 'HOLD',
    h09ConsumerConformanceAccepted: false,
    genericRuntimeActive: true,
    currentRuntime: CURRENT_GENERIC_RUNTIME,
    reason,
  }
}

function assertCompatibility(kind: CompatibilityKind): CompatibilityKind {
  switch (kind) {
    case 'compatible':
    case 'incompatible':
      return kind
    default: {
      const exhaustive: never = kind
      throw new ExistingSiteMigrationError(`unknown compatibility ${String(exhaustive)}`, 'unknown_compatibility')
    }
  }
}

function assertLifecycle(lifecycle: SiteLifecycle): SiteLifecycle {
  switch (lifecycle) {
    case 'draft':
    case 'preview':
    case 'published':
    case 'retired':
    case 'rolled_back':
      return lifecycle
    default: {
      const exhaustive: never = lifecycle
      throw new ExistingSiteMigrationError(`unknown lifecycle ${String(exhaustive)}`, 'invalid_pin')
    }
  }
}

export type ExistingSiteMigrationEngineOptions = {
  now?: () => string
}

export class ExistingSiteMigrationEngine {
  private readonly sites = new Map<string, CopiedExistingSite>()
  private readonly historic = new Map<string, CopiedExistingSite[]>()
  private readonly plans = new Map<string, MigrationPlan>()
  private readonly applies = new Map<string, ApplyReceipt>()
  private readonly retiredPins = new Set<string>()
  private defaultPin: PinRecord
  private readonly now: () => string
  private planSeq = 0

  constructor(sites: readonly CopiedExistingSite[], defaultPin: PinRecord = EXISTING_SITE_PIN, options: ExistingSiteMigrationEngineOptions = {}) {
    this.defaultPin = structuredClone(defaultPin)
    this.now = options.now ?? (() => new Date().toISOString())
    for (const site of sites) {
      const copy = cloneSite(site)
      assertLifecycle(copy.lifecycle)
      this.sites.set(copy.siteId, copy)
      this.historic.set(copy.siteId, [cloneSite(copy)])
    }
  }

  listSites(): CopiedExistingSite[] {
    return [...this.sites.values()].map(cloneSite).sort((left, right) => left.siteId.localeCompare(right.siteId))
  }

  getSite(siteId: string): CopiedExistingSite {
    const site = this.sites.get(siteId)
    if (!site) throw new ExistingSiteMigrationError(`copied site ${siteId} not found`, 'site_not_found')
    return cloneSite(site)
  }

  getDefaultPin(): PinRecord {
    return structuredClone(this.defaultPin)
  }

  /**
   * Defaults never move existing copied sites. New-selection only affects
   * sites created after the default change.
   */
  setDefaultPin(pin: PinRecord): void {
    this.defaultPin = structuredClone(pin)
  }

  alignExistingSitesToDefault(): never {
    throw new ExistingSiteMigrationError('defaults never move existing sites', 'default_must_not_move_existing')
  }

  adoptNewSite(input: Omit<CopiedExistingSite, 'pin'> & { pin?: PinRecord }): CopiedExistingSite {
    const site: CopiedExistingSite = {
      ...cloneSite({ ...input, pin: input.pin ?? this.defaultPin } as CopiedExistingSite),
      pin: structuredClone(input.pin ?? this.defaultPin),
    }
    this.sites.set(site.siteId, site)
    this.historic.set(site.siteId, [cloneSite(site)])
    return cloneSite(site)
  }

  plan(input: {
    siteIds: string[]
    targetPin: PinRecord
    compatibility: CompatibilityKind
    deliberate?: boolean
  }): MigrationPlan {
    const compatibility = assertCompatibility(input.compatibility)
    const snapshots = input.siteIds.map((siteId) => this.getSite(siteId))
    const deliberate = input.deliberate === true
    for (const snapshot of snapshots) {
      if (isRejectedPinSha(snapshot.pin.commitSha) && !deliberate) {
        throw new ExistingSiteMigrationError(
          `invalid legacy pin ${snapshot.pin.commitSha} requires a deliberate migration`,
          'deliberate_migration_required',
        )
      }
      const classified = classifyUpgrade(snapshot.pin, input.targetPin)
      if (classified !== compatibility) {
        throw new ExistingSiteMigrationError(
          `declared compatibility ${compatibility} does not match classified ${classified} for ${snapshot.siteId}`,
          'unknown_compatibility',
        )
      }
    }
    this.planSeq += 1
    const pinWitness: Record<string, string> = {}
    for (const site of this.listSites()) pinWitness[site.siteId] = site.pin.commitSha
    const plan: MigrationPlan = {
      planId: `iss31-plan-${String(this.planSeq).padStart(4, '0')}`,
      siteIds: [...input.siteIds],
      targetPin: structuredClone(input.targetPin),
      compatibility,
      deliberate,
      breaking: compatibility === 'incompatible',
      beforeDigest: digestCopiedCatalog(snapshots),
      beforeSnapshots: snapshots,
      pinWitness,
      createdAt: this.now(),
    }
    this.plans.set(plan.planId, plan)
    return structuredClone(plan)
  }

  apply(planId: string): ApplyReceipt {
    const plan = this.plans.get(planId)
    if (!plan) throw new ExistingSiteMigrationError(`plan ${planId} not found`, 'plan_not_found')
    const compatibility = assertCompatibility(plan.compatibility)
    const invalidSelected = plan.beforeSnapshots.some((snapshot) => isRejectedPinSha(snapshot.pin.commitSha))
    if (compatibility === 'incompatible' && !(plan.deliberate && invalidSelected)) {
      const preserved = plan.siteIds.map((siteId) => this.getSite(siteId))
      const receipt: ApplyReceipt = {
        planId,
        applied: false,
        preserved: true,
        reason: 'incompatible_upgrade_preserves_active_state',
        afterDigest: digestCopiedCatalog(preserved),
        afterSnapshots: preserved,
        appliedAt: this.now(),
      }
      this.applies.set(planId, receipt)
      return structuredClone(receipt)
    }
    const after: CopiedExistingSite[] = []
    for (const snapshot of plan.beforeSnapshots) {
      const current = this.getSite(snapshot.siteId)
      const next = invalidSelected && plan.deliberate
        ? this.projectDeliberateInvalidSite(current, plan.targetPin)
        : this.projectCompatibleSite(current, plan.targetPin)
      this.recordHistoric(next)
      this.sites.set(next.siteId, next)
      after.push(cloneSite(next))
    }
    const receipt: ApplyReceipt = {
      planId,
      applied: true,
      preserved: false,
      reason: invalidSelected && plan.deliberate ? 'deliberate_invalid_pin_migrated' : 'compatible_upgrade_applied',
      afterDigest: digestCopiedCatalog(after),
      afterSnapshots: after,
      appliedAt: this.now(),
    }
    this.applies.set(planId, receipt)
    return structuredClone(receipt)
  }

  verify(planId: string, unselectedSiteIds: string[] = []): VerifyReceipt {
    const plan = this.plans.get(planId)
    if (!plan) throw new ExistingSiteMigrationError(`plan ${planId} not found`, 'plan_not_found')
    const applied = this.applies.get(planId)
    if (!applied) throw new ExistingSiteMigrationError(`apply receipt for ${planId} not found`, 'apply_not_found')
    const currentSelected = plan.siteIds.map((siteId) => this.getSite(siteId))
    const afterDigest = digestCopiedCatalog(currentSelected)
    const pinStableForUnselected = unselectedSiteIds.every((siteId) => {
      if (plan.siteIds.includes(siteId)) return false
      const site = this.getSite(siteId)
      return site.pin.commitSha === plan.pinWitness[siteId]
    })
    const expectedApplied = applied.applied
    const digestMatches = afterDigest === applied.afterDigest
    const appliedMatches = applied.applied === expectedApplied
    const preservedMatches = !applied.applied ? applied.preserved && afterDigest === plan.beforeDigest : applied.afterDigest !== plan.beforeDigest
    const verified = digestMatches && appliedMatches && preservedMatches && pinStableForUnselected
    return {
      planId,
      verified,
      pinStableForUnselected,
      beforeDigest: plan.beforeDigest,
      afterDigest,
      expectedApplied,
      reason: verified ? 'verify_passed' : 'verify_failed',
    }
  }

  rollback(planId: string): RollbackReceipt {
    const plan = this.plans.get(planId)
    if (!plan) throw new ExistingSiteMigrationError(`plan ${planId} not found`, 'plan_not_found')
    const applied = this.applies.get(planId)
    if (!applied) throw new ExistingSiteMigrationError(`apply receipt for ${planId} not found`, 'apply_not_found')
    if (!applied.applied) {
      throw new ExistingSiteMigrationError('rollback is only available after a successful compatible apply', 'rollback_not_available')
    }
    const restored: CopiedExistingSite[] = []
    for (const snapshot of plan.beforeSnapshots) {
      const rolled: CopiedExistingSite = { ...cloneSite(snapshot), lifecycle: 'rolled_back', active: true }
      this.recordHistoric(rolled)
      this.sites.set(rolled.siteId, rolled)
      restored.push(cloneSite(rolled))
    }
    const readbackDigest = digestCopiedCatalog(restored.map((site) => ({ ...site, lifecycle: 'published' })))
    const beforeComparable = digestCopiedCatalog(plan.beforeSnapshots)
    const identityReadback = digestCopiedCatalog(
      restored.map((site, index) => ({
        ...site,
        lifecycle: plan.beforeSnapshots[index].lifecycle,
      })),
    )
    return {
      planId,
      rolledBack: true,
      readbackDigest: identityReadback,
      beforeDigest: beforeComparable,
      matchesBefore: identityReadback === beforeComparable,
      afterSnapshots: restored,
      reason: 'rollback_readback',
    }
  }

  retirePin(pin: PinRecord): void {
    this.retiredPins.add(pin.commitSha)
    for (const [siteId, site] of this.sites) {
      if (site.pin.commitSha === pin.commitSha && site.lifecycle !== 'rolled_back') {
        const retired = { ...cloneSite(site), lifecycle: 'retired' as const, active: site.active }
        this.recordHistoric(retired)
        this.sites.set(siteId, retired)
      }
    }
  }

  pinIsRetired(commitSha: string): boolean {
    return this.retiredPins.has(commitSha)
  }

  retrieveHistoric(siteId: string, pinCommitSha: string): CopiedExistingSite | null {
    const history = this.historic.get(siteId) ?? []
    const found = [...history].reverse().find((site) => site.pin.commitSha === pinCommitSha)
    return found ? cloneSite(found) : null
  }

  catalogDigest(): string {
    return digestCopiedCatalog(this.listSites())
  }

  private projectCompatibleSite(site: CopiedExistingSite, targetPin: PinRecord): CopiedExistingSite {
    const identities: SiteIdentities = {
      ...site.identities,
      provider: targetPin.treeSha,
      effective: sha256Canonical({ previous: site.identities.effective, target: targetPin }),
    }
    return {
      ...cloneSite(site),
      pin: structuredClone(targetPin),
      identities,
      configuration: {
        ...site.configuration,
        templatePin: targetPin.commitSha,
        templateTree: targetPin.treeSha,
        templateVersion: targetPin.version,
      },
      content: {
        ...site.content,
        schemaVersion: targetPin.contractVersion,
      },
      lifecycle: site.lifecycle,
      active: true,
    }
  }

  private projectDeliberateInvalidSite(site: CopiedExistingSite, targetPin: PinRecord): CopiedExistingSite {
    return {
      ...cloneSite(site),
      pin: structuredClone(targetPin),
      identities: {
        ...site.identities,
        provider: targetPin.treeSha,
      },
      configuration: {
        ...site.configuration,
        templatePin: targetPin.commitSha,
        templateTree: targetPin.treeSha,
        templateVersion: targetPin.version,
      },
      lifecycle: site.lifecycle,
      active: true,
    }
  }

  private recordHistoric(site: CopiedExistingSite): void {
    const history = this.historic.get(site.siteId) ?? []
    history.push(cloneSite(site))
    this.historic.set(site.siteId, history)
  }
}

export const MIGRATION_ISSUE_TYPES: readonly MigrationIssueType[] = [
  'site.migration.plan',
  'site.migration.apply',
  'site.migration.verify',
  'site.migration.rollback',
]

export function isMigrationIssueType(value: string): value is MigrationIssueType {
  return (MIGRATION_ISSUE_TYPES as readonly string[]).includes(value)
}

export function migrationDependsOn(issueType: MigrationIssueType): MigrationIssueType | null {
  switch (issueType) {
    case 'site.migration.plan':
      return null
    case 'site.migration.apply':
      return 'site.migration.plan'
    case 'site.migration.verify':
      return 'site.migration.apply'
    case 'site.migration.rollback':
      return 'site.migration.apply'
    default: {
      const exhaustive: never = issueType
      throw new ExistingSiteMigrationError(`unknown issue type ${String(exhaustive)}`, 'unknown_compatibility')
    }
  }
}
