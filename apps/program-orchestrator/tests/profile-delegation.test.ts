import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import {
  CUTOVER_PACKET,
  HARNESS_PIN,
  LINKSITES_PROFILE,
  MIGRATION_PLAN,
} from '../../../packages/linkharness-profile/src/index.ts'
import {
  GENERIC_RUNTIME,
  HarnessProfileDelegationAdapter,
  ISS32_ISSUE,
  ISS32_PACKET,
  PROTECTED_DEVELOPMENT,
  createGenericRuntimeSnapshot,
  createHarnessProfileDelegationAdapter,
  defaultH09Handoff,
  harnessProfileHandoffAccepted,
} from '../src/profile-delegation.ts'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const OWNED_PREFIXES = ['apps/program-orchestrator/', 'execution/']
const GENERATED_EVIDENCE_PATHS = new Set(['.github/linktrend-secret-scan-fixtures.json'])
const PROHIBITED_PREFIXES = [
  'packages/program-ledger/',
  'deploy/',
  'docs/releases/',
  'packages/linkharness-profile/',
  'provider-checkout/',
  'harness-checkout/',
]

function scopedDiff(): string[] {
  const tracked = execFileSync(
    'git',
    ['diff', '--name-only', PROTECTED_DEVELOPMENT.commit],
    { cwd: REPO_ROOT, encoding: 'utf8' },
  )
  const untracked = execFileSync(
    'git',
    ['ls-files', '--others', '--exclude-standard'],
    { cwd: REPO_ROOT, encoding: 'utf8' },
  )
  return [...new Set([...tracked.split(/\r?\n/), ...untracked.split(/\r?\n/)].filter(Boolean))]
}

test('ISS-32 contract binds Harness pin and @linksites/profile without taking live authority', () => {
  const adapter = createHarnessProfileDelegationAdapter()
  const composition = adapter.compose()
  const handoff = defaultH09Handoff()
  assert.equal(adapter.packet(), ISS32_PACKET)
  assert.equal(adapter.issue(), ISS32_ISSUE)
  assert.equal(adapter.currentLiveAuthority(), 'generic-runtime')
  assert.equal(adapter.shadowEnabled(), true)
  assert.equal(composition.profileId, 'linksites-profile')
  assert.equal(composition.profileValid, true)
  assert.equal(composition.harnessCommit, HARNESS_PIN.commit)
  assert.equal(composition.harnessTree, HARNESS_PIN.tree)
  assert.equal(composition.copyPolicy, 'do_not_copy_harness_source')
  assert.equal(composition.processLaneOnly, true)
  assert.equal(composition.providerBytesCopied, false)
  assert.equal(composition.genericRuntimeActive, true)
  assert.equal(composition.cutoverPacket, CUTOVER_PACKET)
  assert.equal(composition.conformanceAccepted, false)
  assert.equal(composition.retirementAllowed, false)
  assert.equal(adapter.profilePort().identity().id, LINKSITES_PROFILE.identity.id)
  assert.equal(adapter.mappedTransition('published', 'rolled_back')?.evidenceKind, 'rollback_receipt')
  assert.equal(adapter.mappedEvidence('rollback')?.proofLevel, 'artifact')
  assert.equal(handoff.receiptAction, 'rebind-required')
  assert.equal(handoff.conformanceAccepted, false)
  assert.equal(handoff.consumerCommit, PROTECTED_DEVELOPMENT.commit)
  assert.equal(handoff.consumerTree, PROTECTED_DEVELOPMENT.tree)
  assert.equal(harnessProfileHandoffAccepted(handoff), false)
  assert.equal(MIGRATION_PLAN.currentRuntime, GENERIC_RUNTIME)
})

test('ISS-32 shadow-compare matches a healthy generic runtime against the delegated composition', () => {
  const adapter = new HarnessProfileDelegationAdapter()
  const generic = createGenericRuntimeSnapshot({ executingRevision: PROTECTED_DEVELOPMENT.commit })
  const result = adapter.shadowCompare(generic)
  assert.equal(result.equal, true, result.mismatches.join(','))
  assert.deepEqual(result.mismatches, [])
  assert.equal(result.generic.runtime, GENERIC_RUNTIME)
  assert.equal(result.delegated.liveAuthority, 'generic-runtime')
})

test('ISS-32 shadow-compare fail-closes on premature live switch and rolls back to generic authority', () => {
  const adapter = createHarnessProfileDelegationAdapter()
  const generic = createGenericRuntimeSnapshot({ liveAuthority: 'harness-profile', genericRuntimeActive: false })
  const { compare, rollback } = adapter.shadowCompareAndRollback(generic)
  assert.equal(compare.equal, false)
  assert.ok(compare.mismatches.includes('generic-live-authority'))
  assert.ok(compare.mismatches.includes('generic-runtime-inactive'))
  if (rollback === null) throw new Error('expected rollback receipt')
  assert.equal(rollback.receiptKind, 'iss32-rollback')
  assert.equal(rollback.restoredAuthority, 'generic-runtime')
  assert.equal(rollback.genericRuntimeActive, true)
  assert.equal(rollback.retirementBlocked, true)
  assert.equal(rollback.conformanceAccepted, false)
  assert.equal(adapter.currentLiveAuthority(), 'generic-runtime')
  assert.equal(adapter.lastRollbackReceipt()?.reason.startsWith('shadow-mismatch:'), true)
})

test('ISS-32 keeps generic retirement and Harness conformance fail-closed until H-09 and handoff are accepted', () => {
  const adapter = createHarnessProfileDelegationAdapter()
  assert.throws(() => adapter.activateDelegatedLive(), /h09-rebind-required:delegated-live-blocked/)
  assert.equal(adapter.currentLiveAuthority(), 'generic-runtime')
  assert.equal(adapter.lastRollbackReceipt()?.reason, 'activate-delegated-live:h09-rebind-required')
  assert.throws(() => adapter.retireGenericAuthority(), /generic-authority-retirement-blocked-until-h09-accepted/)
  assert.throws(() => adapter.claimHarnessConformance(), /harness-conformance-fail-closed-until-h09-rebind/)

  const acceptedH09 = createHarnessProfileDelegationAdapter({
    handoff: {
      receiptAction: 'accepted',
      conformanceAccepted: true,
      consumerCommit: PROTECTED_DEVELOPMENT.commit,
      consumerTree: PROTECTED_DEVELOPMENT.tree,
    },
  })
  assert.equal(harnessProfileHandoffAccepted(acceptedH09.h09Handoff()), true)
  assert.throws(() => acceptedH09.activateDelegatedLive(), /delegated-live-reserved-until-harness-handoff-accepted/)
  assert.throws(() => acceptedH09.retireGenericAuthority(), /generic-authority-retirement-blocked-until-harness-handoff-accepted/)
  assert.throws(() => acceptedH09.claimHarnessConformance(), /harness-conformance-fail-closed-until-handoff-accepted/)

  const bothGates = createHarnessProfileDelegationAdapter({
    handoff: {
      receiptAction: 'accepted',
      conformanceAccepted: true,
      consumerCommit: PROTECTED_DEVELOPMENT.commit,
      consumerTree: PROTECTED_DEVELOPMENT.tree,
    },
    harnessHandoffAccepted: true,
  })
  assert.equal(bothGates.compose().conformanceAccepted, false)
  assert.equal(bothGates.compose().retirementAllowed, false)
  assert.throws(() => bothGates.activateDelegatedLive(), /delegated-live-not-owned-by-iss32/)
  assert.throws(() => bothGates.retireGenericAuthority(), /generic-authority-retirement-not-owned-by-iss32/)
  assert.throws(() => bothGates.claimHarnessConformance(), /harness-conformance-not-owned-by-iss32/)

  const stale = createHarnessProfileDelegationAdapter({
    handoff: {
      receiptAction: 'accepted',
      conformanceAccepted: true,
      consumerCommit: '0'.repeat(40),
      consumerTree: 'f'.repeat(40),
    },
  })
  assert.equal(harnessProfileHandoffAccepted(stale.h09Handoff()), false)
  assert.throws(() => stale.retireGenericAuthority(), /until-h09-accepted/)
  assert.throws(() => stale.claimHarnessConformance(), /until-h09-rebind/)
})

test('ISS-32 scope stays inside orchestrator and execution ownership', () => {
  const files = scopedDiff()
  for (const file of files) {
    const owned = GENERATED_EVIDENCE_PATHS.has(file) || OWNED_PREFIXES.some((prefix) => file === prefix.slice(0, -1) || file.startsWith(prefix))
    assert.equal(owned, true, `out-of-scope path: ${file}`)
    const prohibited = PROHIBITED_PREFIXES.some((prefix) => file.startsWith(prefix))
    assert.equal(prohibited, false, `prohibited path: ${file}`)
  }
})

test('ISS-32 owned files do not embed secret material', () => {
  const files = scopedDiff()
  const banned = /(api[_-]?key\s*[:=]\s*['"][A-Za-z0-9]{12,}|BEGIN (RSA |OPENSSH )?PRIVATE KEY|ghp_[A-Za-z0-9]+|sk_live_[A-Za-z0-9]+)/
  for (const file of files) {
    const path = resolve(REPO_ROOT, file)
    const stat = statSync(path, { throwIfNoEntry: false })
    if (!stat?.isFile()) continue
    const text = readFileSync(path, 'utf8')
    assert.equal(banned.test(text), false, `secret-like material in ${file}`)
  }
})
