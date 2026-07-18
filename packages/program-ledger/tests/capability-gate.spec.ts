import { describe, expect, it } from 'vitest'
import {
  assertDispatchCapabilityGrant,
  CapabilityGateError,
  EXTERNAL_CAPABILITY_SIDE_EFFECTS,
} from '../src/capability-gate.js'
import type { CapabilityGrantLookup } from '../src/capability-lookup.js'
import { InMemoryLedgerStore } from '../src/store.js'
import { ProgramLedger, LedgerError } from '../src/ledger.js'

describe('EXTERNAL_CAPABILITY_SIDE_EFFECTS', () => {
  it('includes irreversible / destructive / financial classes', () => {
    expect(EXTERNAL_CAPABILITY_SIDE_EFFECTS.has('irreversible_external')).toBe(true)
    expect(EXTERNAL_CAPABILITY_SIDE_EFFECTS.has('destructive')).toBe(true)
    expect(EXTERNAL_CAPABILITY_SIDE_EFFECTS.has('financial')).toBe(true)
    expect(EXTERNAL_CAPABILITY_SIDE_EFFECTS.has('none')).toBe(false)
  })
})

describe('assertDispatchCapabilityGrant', () => {
  const allow: CapabilityGrantLookup = {
    hasCapabilityGrant: async () => true,
  }
  const deny: CapabilityGrantLookup = {
    hasCapabilityGrant: async () => false,
  }

  it('skips when side effect is none and no capability id', async () => {
    await expect(
      assertDispatchCapabilityGrant(undefined, { sideEffectClass: 'none' }),
    ).resolves.toBeUndefined()
  })

  it('requires capability id for external side effects', async () => {
    await expect(
      assertDispatchCapabilityGrant(allow, { sideEffectClass: 'financial', orgId: 'org-1' }),
    ).rejects.toMatchObject({ code: 'capability_required' })
  })

  it('requires org id when capability id is set', async () => {
    await expect(
      assertDispatchCapabilityGrant(allow, {
        sideEffectClass: 'financial',
        requiredCapabilityId: 'cap.plane.execution_tracking',
      }),
    ).rejects.toMatchObject({ code: 'org_required' })
  })

  it('denies when lookup returns false', async () => {
    await expect(
      assertDispatchCapabilityGrant(deny, {
        sideEffectClass: 'financial',
        orgId: 'org-1',
        requiredCapabilityId: 'cap.plane.execution_tracking',
      }),
    ).rejects.toBeInstanceOf(CapabilityGateError)
  })

  it('allows when lookup returns true', async () => {
    await expect(
      assertDispatchCapabilityGrant(allow, {
        sideEffectClass: 'financial',
        orgId: 'org-1',
        requiredCapabilityId: 'cap.plane.execution_tracking',
      }),
    ).resolves.toBeUndefined()
  })
})

describe('ProgramLedger.dispatch capability gate', () => {
  it('blocks external dispatch without a grant', async () => {
    const ledger = new ProgramLedger(new InMemoryLedgerStore(), undefined, {
      hasCapabilityGrant: async () => false,
    })
    const issue = await ledger.createIssue({
      issueType: 'publish-site',
      programRef: 'lsites',
      input: { siteId: 's1' },
      sideEffectClass: 'irreversible_external',
      orgId: 'org-1',
      requiredCapabilityId: 'cap.plane.execution_tracking',
    })
    await expect(ledger.dispatch(issue.issueId)).rejects.toBeInstanceOf(LedgerError)
  })

  it('allows external dispatch when grant lookup returns true', async () => {
    const ledger = new ProgramLedger(new InMemoryLedgerStore(), undefined, {
      hasCapabilityGrant: async () => true,
    })
    const issue = await ledger.createIssue({
      issueType: 'publish-site',
      programRef: 'lsites',
      input: { siteId: 's1' },
      sideEffectClass: 'irreversible_external',
      orgId: 'org-1',
      requiredCapabilityId: 'cap.plane.execution_tracking',
    })
    const run = await ledger.dispatch(issue.issueId)
    expect(run.issueId).toBe(issue.issueId)
  })

  it('still dispatches none side-effect issues without a lookup', async () => {
    const ledger = new ProgramLedger(new InMemoryLedgerStore())
    const issue = await ledger.createIssue({
      issueType: 'draft',
      programRef: 'lsites',
      input: {},
      sideEffectClass: 'none',
    })
    const run = await ledger.dispatch(issue.issueId)
    expect(run.issueId).toBe(issue.issueId)
  })
})
