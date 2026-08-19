import assert from 'node:assert/strict'
import test from 'node:test'
import {
  assertProviderBaseline,
  bindProviderBaseline,
  providerBaseline,
  ProviderBaselineError,
  PROVIDER_BASELINES,
} from '../src/provider-baseline.ts'

test('contains exactly the five frozen current provider baselines', () => {
  assert.deepEqual(Object.keys(PROVIDER_BASELINES).sort(), [
    'autowork',
    'brain',
    'libraries',
    'platform',
    'skills',
  ])
  for (const name of Object.keys(PROVIDER_BASELINES) as Array<keyof typeof PROVIDER_BASELINES>) {
    assert.equal(Object.isFrozen(providerBaseline(name)), true)
    assert.equal(bindProviderBaseline(name, providerBaseline(name)), providerBaseline(name))
  }
  assert.deepEqual(providerBaseline('platform'), {
    provider: 'platform',
    commit: 'adbabf7d399cbfe5c1056d275c3d98eb480397cc',
    tree: 'b76993f458b6dbed5d2c3e09c2c5e8ad87c6a45d',
    authClaimsSchema: 'platform.auth-claims/1.1.0',
    providerTrustContract: 'platform.provider-trust/1.0.0',
  })
  assert.deepEqual(providerBaseline('libraries'), {
    provider: 'libraries',
    commit: '4cbe7fb174aba4b159d6c37ba1ef65fd3221510f',
    tree: '60e582fbd1ce988538b650c99878e700c6cfa0d2',
    schemaVersion: 2,
    schemaRevision: 2,
    cataloguePath: 'indexes/v2/catalog.json',
    schemaPath: 'schemas/v2',
    catalogueRecordsSha256: '03b52875dd3c2fcf5c8fa056560fd77e0986aca04ba69bd11ebf28c866b97f2c',
  })
  assert.deepEqual(providerBaseline('brain'), {
    provider: 'brain',
    commit: '9042e668dd0c7cef232cb427ffc9c76f06a7a446',
    tree: '303a15936932fb5a54b208c934a6d511045cc8e4',
    contractVersion: '2.0.0',
    profile: 'linksites.oversight',
    profileVersion: '1.0.0',
  })
  assert.deepEqual(providerBaseline('skills'), {
    provider: 'skills',
    commit: 'e3d80fd22a05a4f68207e130c50b772b5acffda4',
    tree: '69a131b46a73a4ef724694bfe240b1a11652bcc9',
    contractVersion: 'skills.api.v0.2',
  })
  assert.deepEqual(providerBaseline('autowork'), {
    provider: 'autowork',
    commit: '79ee98eb3bd1ae0cce9d34872e90fe7101a9f353',
    tree: 'deb37e4f3a29339b35613ee799d461c74bb7b585',
    contractVersion: '2026-08-13.v1',
  })
})

test('rejects the obsolete Issue 127 / PR 180 library pin', () => {
  assert.throws(
    () =>
      bindProviderBaseline('libraries', {
        ...providerBaseline('libraries'),
        commit: 'b2d2bbb035c6e6a3f859480ce57f12e0882dd3f0',
        tree: '2701e6a190468f437102946425a64e890eed6690',
        catalogueRecordsSha256: 'e1659929c19176227b8349c532f2b6744b6c130e035351d1bc89fb30fa39ad77',
      }),
    ProviderBaselineError,
  )
})

for (const [name, change] of [
  ['unknown name', { provider: 'unknown' }],
  ['commit mismatch', { commit: '0'.repeat(40) }],
  ['tree mismatch', { tree: '0'.repeat(40) }],
  ['version mismatch', { contractVersion: 'wrong' }],
  ['profile mismatch', { profile: 'wrong' }],
  ['applicable digest-like unknown field', { digest: '0'.repeat(64) }],
  ['unknown field', { extra: true }],
] as const) {
  test(`rejects ${name}`, () => {
    const candidate = { ...providerBaseline('brain'), ...change }
    assert.throws(() => bindProviderBaseline('brain', candidate), ProviderBaselineError)
  })
}

test('rejects missing provenance and never silently falls back', () => {
  assert.throws(() => bindProviderBaseline('skills', undefined), /missingBaseline/)
  assert.throws(() => assertProviderBaseline({ provider: 'not-a-provider' }), /unknownProvider/)
  assert.throws(
    () => bindProviderBaseline('platform', { ...providerBaseline('platform'), authClaimsSchema: 'platform.auth-claims/1.0.0' }),
    /authClaimsSchemaMismatch/,
  )
})
