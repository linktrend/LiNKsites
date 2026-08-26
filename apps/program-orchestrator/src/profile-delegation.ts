import {
  CUTOVER_PACKET,
  HARNESS_PIN,
  LINKSITES_PROFILE,
  MIGRATION_PLAN,
  PROFILE_CLOCK,
  createLinksitesProfilePort,
  evidenceMapper,
  evaluateReadiness,
  siteTransitionMapper,
  validateProfile,
  type ProfilePort,
  type ProfileRecord,
  type WebsiteDomainPayload,
} from '../../../packages/linkharness-profile/src/index.ts'

export const ISS32_PACKET = 'LS-10' as const
export const ISS32_ISSUE = 'ISS-32' as const

export const PROTECTED_DEVELOPMENT = Object.freeze({
  repository: 'linktrend/LiNKsites',
  commit: '02ebf5d8710c50c1f2c390989239f0baf916ba97',
  tree: 'fb427d30ea7c3e7060fc9cc1a63a1110266dd755',
})

export const GENERIC_RUNTIME = 'program-ledger+program-orchestrator+execution' as const

export type LiveAuthority = 'generic-runtime' | 'harness-profile'
export type H09ReceiptAction = 'rebind-required' | 'accepted'

export type H09HandoffState = {
  receiptAction: H09ReceiptAction
  conformanceAccepted: boolean
  consumerCommit: string
  consumerTree: string
}

export type GenericRuntimeSnapshot = {
  liveAuthority: LiveAuthority
  runtime: typeof GENERIC_RUNTIME
  genericRuntimeActive: boolean
  executingRevision?: string
}

export type DelegatedCompositionSnapshot = {
  profileId: string
  profileValid: boolean
  harnessCommit: string
  harnessTree: string
  copyPolicy: string
  processLaneOnly: boolean
  providerBytesCopied: boolean
  genericRuntimeActive: boolean
  cutoverPacket: string
  liveAuthority: LiveAuthority
  conformanceAccepted: boolean
  retirementAllowed: boolean
}

export type ShadowMismatchCode =
  | 'generic-live-authority'
  | 'generic-runtime-inactive'
  | 'profile-invalid'
  | 'harness-commit'
  | 'harness-tree'
  | 'harness-source-copy'
  | 'process-lane'
  | 'provider-bytes-copied'
  | 'delegated-live-authority-premature'
  | 'conformance-claimed-before-h09'
  | 'retirement-allowed-before-h09'
  | 'profile-generic-runtime-inactive'
  | 'cutover-packet'
  | 'rollback-contract'

export type ShadowCompareResult = {
  equal: boolean
  mismatches: ShadowMismatchCode[]
  generic: GenericRuntimeSnapshot
  delegated: DelegatedCompositionSnapshot
}

export type RollbackReceipt = {
  receiptKind: 'iss32-rollback'
  restoredAuthority: 'generic-runtime'
  genericRuntimeActive: true
  retirementBlocked: true
  conformanceAccepted: false
  reason: string
  at: string
}

function domainPayload(profile: ProfileRecord): WebsiteDomainPayload {
  return profile.domainPayload as unknown as WebsiteDomainPayload
}

function assertNever(value: never, message: string): never {
  throw new Error(message)
}

export function defaultH09Handoff(): H09HandoffState {
  return {
    receiptAction: 'rebind-required',
    conformanceAccepted: false,
    consumerCommit: PROTECTED_DEVELOPMENT.commit,
    consumerTree: PROTECTED_DEVELOPMENT.tree,
  }
}

export function harnessProfileHandoffAccepted(
  handoff: H09HandoffState,
  required = PROTECTED_DEVELOPMENT,
): boolean {
  let actionOk = false
  switch (handoff.receiptAction) {
    case 'accepted':
      actionOk = true
      break
    case 'rebind-required':
      actionOk = false
      break
    default:
      assertNever(handoff.receiptAction, `unknown H-09 receipt action: ${String(handoff.receiptAction)}`)
  }
  return (
    actionOk &&
    handoff.conformanceAccepted === true &&
    handoff.consumerCommit === required.commit &&
    handoff.consumerTree === required.tree
  )
}

export function createGenericRuntimeSnapshot(input: {
  executingRevision?: string
  liveAuthority?: LiveAuthority
  genericRuntimeActive?: boolean
} = {}): GenericRuntimeSnapshot {
  return {
    liveAuthority: input.liveAuthority ?? 'generic-runtime',
    runtime: GENERIC_RUNTIME,
    genericRuntimeActive: input.genericRuntimeActive ?? true,
    executingRevision: input.executingRevision,
  }
}

export class HarnessProfileDelegationAdapter {
  private liveAuthority: LiveAuthority = 'generic-runtime'
  private readonly profile: ProfileRecord
  private readonly port: ProfilePort
  private readonly handoff: H09HandoffState
  private readonly harnessHandoffAccepted: boolean
  private readonly shadowMode: boolean
  private lastRollback: RollbackReceipt | null = null

  constructor(options: {
    profile?: ProfileRecord
    handoff?: H09HandoffState
    harnessHandoffAccepted?: boolean
    shadowMode?: boolean
  } = {}) {
    this.profile = options.profile ?? LINKSITES_PROFILE
    this.port = createLinksitesProfilePort()
    this.handoff = options.handoff ?? defaultH09Handoff()
    this.harnessHandoffAccepted = options.harnessHandoffAccepted ?? false
    this.shadowMode = options.shadowMode ?? true
  }

  packet(): typeof ISS32_PACKET { return ISS32_PACKET }
  issue(): typeof ISS32_ISSUE { return ISS32_ISSUE }
  currentLiveAuthority(): LiveAuthority { return this.liveAuthority }
  shadowEnabled(): boolean { return this.shadowMode }
  lastRollbackReceipt(): RollbackReceipt | null { return this.lastRollback }
  profilePort(): ProfilePort { return this.port }
  h09Handoff(): H09HandoffState { return { ...this.handoff } }

  compose(): DelegatedCompositionSnapshot {
    const domain = domainPayload(this.profile)
    const validation = validateProfile(this.profile)
    const readiness = evaluateReadiness(this.profile)
    return {
      profileId: this.profile.identity.id,
      profileValid: validation.ok,
      harnessCommit: HARNESS_PIN.commit,
      harnessTree: HARNESS_PIN.tree,
      copyPolicy: HARNESS_PIN.copyPolicy,
      processLaneOnly: readiness.processLaneOnly,
      providerBytesCopied: readiness.providerBytesCopied,
      genericRuntimeActive: domain.configuration.currentGenericRuntimeActive && domain.readiness.currentGenericRuntimeActive,
      cutoverPacket: domain.readiness.cutoverPacket,
      liveAuthority: this.liveAuthority,
      conformanceAccepted: false,
      retirementAllowed: false,
    }
  }

  shadowCompare(generic: GenericRuntimeSnapshot, delegated = this.compose()): ShadowCompareResult {
    const mismatches: ShadowMismatchCode[] = []
    if (generic.liveAuthority !== 'generic-runtime') mismatches.push('generic-live-authority')
    if (!generic.genericRuntimeActive) mismatches.push('generic-runtime-inactive')
    if (!delegated.profileValid) mismatches.push('profile-invalid')
    if (delegated.harnessCommit !== HARNESS_PIN.commit) mismatches.push('harness-commit')
    if (delegated.harnessTree !== HARNESS_PIN.tree) mismatches.push('harness-tree')
    if (delegated.copyPolicy !== 'do_not_copy_harness_source') mismatches.push('harness-source-copy')
    if (!delegated.processLaneOnly) mismatches.push('process-lane')
    if (delegated.providerBytesCopied) mismatches.push('provider-bytes-copied')
    if (delegated.liveAuthority !== 'generic-runtime') mismatches.push('delegated-live-authority-premature')
    if (delegated.conformanceAccepted) mismatches.push('conformance-claimed-before-h09')
    if (delegated.retirementAllowed) mismatches.push('retirement-allowed-before-h09')
    if (!delegated.genericRuntimeActive) mismatches.push('profile-generic-runtime-inactive')
    if (delegated.cutoverPacket !== CUTOVER_PACKET) mismatches.push('cutover-packet')
    if (!MIGRATION_PLAN.rollbackKeepsCurrentRuntime) mismatches.push('rollback-contract')
    return { equal: mismatches.length === 0, mismatches, generic, delegated }
  }

  shadowCompareAndRollback(generic: GenericRuntimeSnapshot): { compare: ShadowCompareResult; rollback: RollbackReceipt | null } {
    const compare = this.shadowCompare(generic)
    if (compare.equal) return { compare, rollback: null }
    return { compare, rollback: this.rollback(`shadow-mismatch:${compare.mismatches.join(',')}`) }
  }

  rollback(reason: string): RollbackReceipt {
    this.liveAuthority = 'generic-runtime'
    const receipt: RollbackReceipt = {
      receiptKind: 'iss32-rollback',
      restoredAuthority: 'generic-runtime',
      genericRuntimeActive: true,
      retirementBlocked: true,
      conformanceAccepted: false,
      reason,
      at: PROFILE_CLOCK,
    }
    this.lastRollback = receipt
    return receipt
  }

  activateDelegatedLive(): never {
    if (!harnessProfileHandoffAccepted(this.handoff)) {
      this.rollback('activate-delegated-live:h09-rebind-required')
      throw new Error('iss32:h09-rebind-required:delegated-live-blocked')
    }
    if (!this.harnessHandoffAccepted) {
      this.rollback('activate-delegated-live:harness-handoff-required')
      throw new Error('iss32:delegated-live-reserved-until-harness-handoff-accepted')
    }
    throw new Error('iss32:delegated-live-not-owned-by-iss32')
  }

  retireGenericAuthority(): never {
    if (!harnessProfileHandoffAccepted(this.handoff)) {
      throw new Error('iss32:generic-authority-retirement-blocked-until-h09-accepted')
    }
    if (!this.harnessHandoffAccepted) {
      throw new Error('iss32:generic-authority-retirement-blocked-until-harness-handoff-accepted')
    }
    throw new Error('iss32:generic-authority-retirement-not-owned-by-iss32')
  }

  claimHarnessConformance(): never {
    if (!harnessProfileHandoffAccepted(this.handoff)) {
      throw new Error('iss32:harness-conformance-fail-closed-until-h09-rebind')
    }
    if (!this.harnessHandoffAccepted) {
      throw new Error('iss32:harness-conformance-fail-closed-until-handoff-accepted')
    }
    throw new Error('iss32:harness-conformance-not-owned-by-iss32')
  }

  mappedTransition(from: string, to: string) {
    return siteTransitionMapper(this.profile, from, to)
  }

  mappedEvidence(domainVerdict: string) {
    return evidenceMapper(this.profile, domainVerdict)
  }
}

export function createHarnessProfileDelegationAdapter(
  options?: ConstructorParameters<typeof HarnessProfileDelegationAdapter>[0],
): HarnessProfileDelegationAdapter {
  return new HarnessProfileDelegationAdapter(options)
}
