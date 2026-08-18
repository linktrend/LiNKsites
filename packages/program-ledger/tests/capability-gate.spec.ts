import { describe, expect, it } from 'vitest'
import {
  assertDispatchCapabilityGrant,
  CapabilityGateError,
  EXTERNAL_CAPABILITY_SIDE_EFFECTS,
} from '../src/capability-gate.js'
import type { CapabilityGrantLookup } from '../src/capability-lookup.js'
import type {
  PlatformClaimVerifier,
  VerifiedPlatformCapability,
} from '../src/platform-client.js'
import { InMemoryLedgerStore } from '../src/store.js'
import { ProgramLedger, LedgerError } from '../src/ledger.js'
import { providerBaseline } from '@linksites/types'

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
        providerBaseline: providerBaseline('platform'),
      }),
    ).rejects.toBeInstanceOf(CapabilityGateError)
  })

  it('allows when lookup returns true', async () => {
    await expect(
      assertDispatchCapabilityGrant(allow, {
        sideEffectClass: 'financial',
        orgId: 'org-1',
        requiredCapabilityId: 'cap.plane.execution_tracking',
        providerBaseline: providerBaseline('platform'),
      }),
    ).resolves.toBeUndefined()
  })

  it('fails closed on a missing or stale Platform baseline', async () => {
    await expect(
      assertDispatchCapabilityGrant(allow, {
        sideEffectClass: 'financial',
        orgId: 'org-1',
        requiredCapabilityId: 'cap.plane.execution_tracking',
      }),
    ).rejects.toMatchObject({ code: 'provider_baseline_rejected' })
    await expect(
      assertDispatchCapabilityGrant(allow, {
        sideEffectClass: 'financial',
        orgId: 'org-1',
        requiredCapabilityId: 'cap.plane.execution_tracking',
        providerBaseline: {
          ...providerBaseline('platform'),
          commit: '0'.repeat(40),
        },
      }),
    ).rejects.toMatchObject({ reason: 'commitMismatch' })
  })
})

describe('ProgramLedger.dispatch capability gate', () => {
  it('blocks external dispatch without a grant', async () => {
    const ledger = new ProgramLedger(new InMemoryLedgerStore(), undefined, {
      hasCapabilityGrant: async () => false,
    }, providerBaseline('platform'))
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
    }, providerBaseline('platform'))
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

describe('Platform claim binding for capability dispatch', () => {
  const capabilityId = 'cap.plane.execution_tracking'
  const baseVerified: VerifiedPlatformCapability = {
    orgId: 'org-1',
    actorId: 'actor-1',
    runtimeBindingId: 'binding-1',
    audience: 'linksites-ledger',
    capabilityId,
    environment: 'development',
  }

  function verifierFor(result: VerifiedPlatformCapability | Error): PlatformClaimVerifier {
    return {
      verifyCapabilityClaim: async () => {
        if (result instanceof Error) throw result
        return result
      },
    }
  }

  function input(overrides: Record<string, unknown> = {}) {
    return {
      sideEffectClass: 'financial' as const,
      orgId: 'org-1',
      requiredCapabilityId: capabilityId,
      providerBaseline: providerBaseline('platform'),
      platformClaim: { forged: false },
      platformClaimVerifier: verifierFor(baseVerified),
      expectedAudience: 'linksites-ledger',
      expectedEnvironment: 'development',
      runtimeBindingId: 'binding-1',
      ...overrides,
    }
  }

  it.each([
    ['wrong org', { orgId: 'org-2' }],
    ['wrong audience', { expectedAudience: 'other-service' }],
    ['wrong binding', { runtimeBindingId: 'binding-2' }],
    ['wrong environment', { expectedEnvironment: 'production' }],
  ])('fails closed for %s', async (_label, overrides) => {
    await expect(
      assertDispatchCapabilityGrant(
        { hasCapabilityGrant: async () => true },
        input(overrides),
      ),
    ).rejects.toMatchObject({ code: 'capability_grant_denied' })
  })

  it('fails closed when the claim is omitted', async () => {
    await expect(
      assertDispatchCapabilityGrant(
        { hasCapabilityGrant: async () => true },
        input({ platformClaim: undefined }),
      ),
    ).rejects.toMatchObject({ code: 'capability_grant_denied' })
  })

  it.each([
    ['expired', new Error('expired')],
    ['revoked', new Error('revoked')],
    ['forged', new Error('forged claim')],
    ['malformed', new Error('malformed claim')],
    ['cross-environment', new Error('cross-environment claim')],
  ])('fails closed for a Platform-rejected %s claim', async (_label, error) => {
    await expect(
      assertDispatchCapabilityGrant(
        { hasCapabilityGrant: async () => true },
        input({ platformClaimVerifier: verifierFor(error) }),
      ),
    ).rejects.toMatchObject({ code: 'capability_grant_denied' })
  })

  it('fails closed when the narrow capability is denied', async () => {
    const lookupCalls: Array<[string, string]> = []
    await expect(
      assertDispatchCapabilityGrant(
        {
          hasCapabilityGrant: async (orgId, id) => {
            lookupCalls.push([orgId, id])
            return false
          },
        },
        input(),
      ),
    ).rejects.toMatchObject({ code: 'capability_grant_denied' })
    expect(lookupCalls).toEqual([['org-1', capabilityId]])
  })

  it('uses verified Platform identity and preserves the Ledger grant authority', async () => {
    const lookupCalls: Array<[string, string]> = []
    await expect(
      assertDispatchCapabilityGrant(
        {
          hasCapabilityGrant: async (orgId, id) => {
            lookupCalls.push([orgId, id])
            return true
          },
        },
        input(),
      ),
    ).resolves.toBeUndefined()
    expect(lookupCalls).toEqual([['org-1', capabilityId]])
  })
})
