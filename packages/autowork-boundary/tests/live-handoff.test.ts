import assert from 'node:assert/strict'
import test from 'node:test'
import {
  LiveModeError,
  parseLiveAutoworkHandoff,
  resolveLiveModeFromEnv,
  requireLiveMode,
  envSigningMaterialResolver,
} from '../src/live-handoff.ts'

const grants = [{ eventName: 'demo.completed', environments: ['development'], orgIds: ['org_demo'] }]

const complete = {
  endpoint: 'https://autowork.example.test/v1/events',
  issuer: 'linkplatform-issuer',
  audience: 'linksites',
  claimContractVersion: 'platform.auth-claims/1.1.0',
  receiptContract: '2026-08-13.v1',
  environment: 'development',
  orgId: 'org_demo',
  signingKeyRef: 'cms-test',
  grants,
}

test('live mode stays disabled until an exact scoped handoff is supplied', () => {
  assert.deepEqual(resolveLiveModeFromEnv({}), { enabled: false, reason: 'live_autowork_disabled' })
  assert.throws(() => requireLiveMode({ enabled: false, reason: 'live_autowork_disabled' }), LiveModeError)
  const handoff = parseLiveAutoworkHandoff(complete)
  assert.equal(handoff.signingKeyRef, 'cms-test')
  assert.equal(handoff.audience, 'linksites')
})

test('incomplete live handoff and secret values fail closed', () => {
  assert.throws(() => parseLiveAutoworkHandoff({ ...complete, endpoint: undefined }), /missing_endpoint/)
  assert.throws(() => parseLiveAutoworkHandoff({ ...complete, issuer: '' }), /missing_issuer/)
  assert.throws(() => parseLiveAutoworkHandoff({ ...complete, audience: 'lbrain-api' }), /invalid_audience/)
  assert.throws(() => parseLiveAutoworkHandoff({ ...complete, signingKeyRef: 'ltfx.auto.secret.not-a-ref.v1' }), /key reference/)
  assert.throws(() => parseLiveAutoworkHandoff({ ...complete, secret: 'ltfx.auto.secret.leak.v1' }), /secret/)
  assert.throws(() => parseLiveAutoworkHandoff({ ...complete, grants: [{ eventName: 'demo.completed', environments: ['production'], orgIds: ['org_demo'] }] }), /grants/)
  assert.throws(() => parseLiveAutoworkHandoff({ ...complete, orgId: 'other-org' }), /grants/)
})

test('signing material is resolved by key reference and is not stored on the handoff', () => {
  const resolver = envSigningMaterialResolver({
    LINKAUTOWORK_SIGNING_KEY_ID: 'cms-test',
    LINKAUTOWORK_SIGNING_SECRET: 'ltfx.auto.secret.resolver.v1',
  })
  assert.equal(resolver.resolve('cms-test'), 'ltfx.auto.secret.resolver.v1')
  assert.throws(() => resolver.resolve('other-key'), /mismatch/)
  assert.equal('secret' in parseLiveAutoworkHandoff(complete), false)
})
