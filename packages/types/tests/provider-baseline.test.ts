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
    commit: '5452f90a35ed690698a9161117a9d92c69985582',
    tree: '90b51726f7a77e4620151a463a10cfc3d2007c88',
    authClaimsSchema: 'platform.auth-claims/1.1.0',
    providerTrustContract: 'platform.provider-trust/1.0.0',
  })
  assert.deepEqual(providerBaseline('libraries'), {
    provider: 'libraries',
    commit: '368d869e92a6056540092cf18ba6c7e32954dad1',
    tree: '185d7cf714777d60a2d01a4881bf1a11bc5018d9',
    schemaVersion: 2,
    schemaRevision: 2,
    cataloguePath: 'indexes/v2/catalog.json',
    schemaPath: 'schemas/v2',
    catalogueRecordsSha256: 'dcabdfa363fe419d5b1ec04266efb65bd835ea5bc916c770d587404a2abe97a5',
  })
  assert.deepEqual(providerBaseline('brain'), {
    provider: 'brain',
    commit: '8ce1d737f8870a479f07b1741c58d6681cd07aa1',
    tree: '0cae42d612342f5e52c7e2e0e76cb6fc2f6d81f3',
    contractVersion: '2.0.0',
    profile: 'linksites.oversight',
    profileVersion: '1.0.0',
  })
  assert.deepEqual(providerBaseline('skills'), {
    provider: 'skills',
    commit: '6269cb173a7c9e0170b29f35c539343c29eab795',
    tree: '6c36e6c98f90e55d957fba781327b1b0ef90860a',
    contractVersion: 'skills.api.v0.2',
  })
  assert.deepEqual(providerBaseline('autowork'), {
    provider: 'autowork',
    commit: '4eb29203766b1ccf200a2dc10b39cc58d175c90c',
    tree: '5f306d674780a5a26048017f916da6048d71e7a5',
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
