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
