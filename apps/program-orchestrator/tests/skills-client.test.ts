import assert from 'node:assert/strict'
import test from 'node:test'
import { SkillsClient } from '../src/skillsClient.ts'
import { SkillsPolicyError, type SkillPayload, type SkillPin } from '../src/skillsPolicy.ts'
import { providerBaseline } from '@linksites/types'

const pin: SkillPin = { skillId: 'audit-protocol', releaseId: 'release-1', version: '2.0.0', digest: `sha256:${'a'.repeat(64)}` }
const allowlist = [{ skillId: pin.skillId, version: pin.version, inputSchemaRef: 'skills://schema/audit-protocol/input', outputSchemaRef: 'skills://schema/audit-protocol/output' }]
const receipt = {
  providerBaseline: providerBaseline('skills'),
  releaseId: pin.releaseId, skillId: pin.skillId, version: pin.version, digest: pin.digest,
  qualification: 'qualified' as const, lifecycle: 'usable' as const,
  compatibility: { compatible: true, consumer: 'linksites' as const, runtimeProfile: 'program-orchestrator', contractVersion: 'skills.api.v0.2' },
  attestation: { valid: true, audience: 'linksites' as const, releaseId: pin.releaseId, version: pin.version, digest: pin.digest, issuer: 'librarian', issuedAt: '2026-08-13T00:00:00.000Z' },
  freshness: { checkedAt: '2026-08-13T00:00:00.000Z', expiresAt: '2026-08-14T00:00:00.000Z' },
}
const payload = (overrides: Partial<SkillPayload> = {}): SkillPayload => ({ kind: 'summary', pin, receipt, value: { title: 'summary' }, ...overrides })
const client = (resource: SkillPayload, calls: string[] = [], now = '2026-08-13T12:00:00.000Z') => new SkillsClient({ retrieve: async (request) => { calls.push(JSON.stringify(request)); return resource } }, { baseline: providerBaseline('skills'), now: () => new Date(now), allowlist })

test('retrieves an explicitly pinned progressive resource and never executes it', async () => {
  const calls: string[] = []
  const result = await client(payload(), calls).summary(pin)
  assert.equal(result.value && (result.value as { title: string }).title, 'summary')
  assert.deepEqual(JSON.parse(calls[0]), { ...pin, kind: 'summary' })
})

test('supports guide, catalogue, fragment, and exact release retrieval through the same verified path', async () => {
  const kinds = ['guide', 'catalogue', 'fragment', 'release'] as const
  for (const kind of kinds) {
    const requests: string[] = []
    const resource = payload({ kind })
    const value = client(resource, requests)
    if (kind === 'guide') await value.guide(pin)
    if (kind === 'catalogue') await value.catalogue(pin)
    if (kind === 'fragment') await value.fragment(pin, 'routing')
    if (kind === 'release') await value.release(pin)
    assert.equal(requests.length, 1)
    assert.equal(JSON.parse(requests[0]).kind, kind)
  }
})

for (const [name, change] of [
  ['missing pin', { digest: '' }],
  ['wrong release', { receipt: { ...receipt, releaseId: 'release-2' } }],
  ['wrong version', { receipt: { ...receipt, version: '9.9.9' } }],
  ['wrong digest', { receipt: { ...receipt, digest: `sha256:${'b'.repeat(64)}` } }],
  ['unqualified', { receipt: { ...receipt, qualification: 'pending' } }],
  ['revoked lifecycle', { receipt: { ...receipt, lifecycle: 'revoked' } }],
  ['quarantined lifecycle', { receipt: { ...receipt, lifecycle: 'quarantined' } }],
  ['incompatible', { receipt: { ...receipt, compatibility: { ...receipt.compatibility, compatible: false } } }],
  ['invalid attestation', { receipt: { ...receipt, attestation: { ...receipt.attestation, valid: false } } }],
  ['stale receipt', { receipt: { ...receipt, freshness: { checkedAt: '2026-08-11T00:00:00.000Z', expiresAt: '2026-08-12T00:00:00.000Z' } } }],
  ['corrupt content', { content: 'tampered', contentHash: `sha256:${'c'.repeat(64)}` }],
] as const) {
  test(`fails closed for ${name}`, async () => {
    const requestPin = name === 'missing pin' ? { ...pin, digest: '' as `sha256:${string}` } : pin
    await assert.rejects(client(payload(change as Partial<SkillPayload>)).summary(requestPin), SkillsPolicyError)
  })
}

test('does not fall back to latest, similarly named, native, or another release after rejection', async () => {
  const requests: string[] = []
  const skills = new SkillsClient({ retrieve: async (request) => { requests.push(JSON.stringify(request)); return payload({ receipt: { ...receipt, lifecycle: 'revoked' } }) } }, { baseline: providerBaseline('skills'), allowlist })
  await assert.rejects(skills.summary(pin), /lifecycleNotUsable/)
  assert.equal(requests.length, 1)
  assert.deepEqual(JSON.parse(requests[0]), { ...pin, kind: 'summary' })
  await assert.rejects(client(payload()).summary({ ...pin, releaseId: 'latest' }), /unPinnedExactRelease/)
  await assert.rejects(client(payload()).summary({ ...pin, version: 'native' }), /unPinnedExactRelease/)
})

test('provider absence remains a local closed failure with no fallback call', async () => {
  let calls = 0
  const skills = new SkillsClient({ retrieve: async () => { calls += 1; throw new Error('unavailable') } }, { baseline: providerBaseline('skills'), allowlist })
  await assert.rejects(skills.summary(pin), /unavailable/)
  assert.equal(calls, 1)
})

test('use reports and feedback are exact-release-bound and reject private-data fields', async () => {
  const reports: unknown[] = []
  const skills = new SkillsClient({ retrieve: async () => payload(), submitUseReport: async (report) => { reports.push(report) }, submitFeedback: async (feedback) => { reports.push(feedback) } }, { baseline: providerBaseline('skills'), allowlist })
  await skills.reportUse({ reportKind: 'completed_use', skillId: pin.skillId, releaseId: pin.releaseId, version: pin.version, digest: pin.digest, outcome: 'use_succeeded' })
  await skills.submitFeedback({ skillId: pin.skillId, releaseId: pin.releaseId, version: pin.version, digest: pin.digest, outcome: 'use_partial', issue: 'incomplete' })
  assert.equal(reports.length, 2)
  await assert.rejects(skills.reportUse({ reportKind: 'completed_use', skillId: pin.skillId, releaseId: pin.releaseId, version: pin.version, digest: pin.digest, outcome: 'use_succeeded', prompt: 'secret' } as never), /reportContainsPrivateData/)
})

test('rejects unknown skills and oversized catalogue dumps before local execution', async () => {
  await assert.rejects(client(payload()).summary({ ...pin, skillId: 'unlisted-skill' }), /unknownSkill/)
  const closed = new SkillsClient({ retrieve: async () => payload() }, { baseline: providerBaseline('skills') })
  await assert.rejects(closed.summary(pin), /unknownSkill/)
  await assert.rejects(
    client(payload({ kind: 'catalogue', value: { records: Array.from({ length: 33 }, (_, index) => ({ id: `skill-${index}` })) } })).catalogue(pin),
    /oversizedOrAmbiguousCatalogue/,
  )
})
