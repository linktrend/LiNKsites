import assert from 'node:assert/strict'
import test from 'node:test'

import {
  generateSecurityHeaderDescriptor,
  UnsafeSecurityPolicyError,
  type SecurityPolicyConfiguration,
} from '../src/lib/security-headers.ts'

const deterministicFakeConfiguration = (): SecurityPolicyConfiguration => ({
  httpsReady: true,
  integrations: [
    {
      id: 'fake-analytics',
      approval: 'approved',
      csp: {
        'script-src': ['https://scripts.invalid'],
        'connect-src': ['https://events.invalid'],
      },
    },
    {
      id: 'fake-media',
      approval: 'approved',
      csp: { 'img-src': ['https://media.invalid'] },
    },
  ],
  scriptNonces: ['ZmFrZS1ub25jZS0wMDE='],
})

test('generates a deterministic baseline from approved integration descriptors', () => {
  const first = generateSecurityHeaderDescriptor(deterministicFakeConfiguration())
  const second = generateSecurityHeaderDescriptor(deterministicFakeConfiguration())

  assert.deepEqual(first, second)
  assert.equal(first.status, 'READY')
  assert.deepEqual(first.integrationIds, ['fake-analytics', 'fake-media'])
  assert.match(first.headers['Content-Security-Policy'], /script-src 'nonce-ZmFrZS1ub25jZS0wMDE=' 'self' https:\/\/scripts\.invalid/)
  assert.match(first.headers['Content-Security-Policy'], /object-src 'none'; base-uri 'self'; frame-ancestors 'none'$/)
  assert.equal(first.headers['Strict-Transport-Security'], 'max-age=31536000; includeSubDomains')
  assert.equal(first.headers['X-Content-Type-Options'], 'nosniff')
})

test('missing live configuration holds fail closed and emits no headers', () => {
  assert.deepEqual(generateSecurityHeaderDescriptor(), {
    status: 'HOLD',
    code: 'MISSING_SECURITY_POLICY_CONFIGURATION',
    headers: {},
  })
})

test('does not claim HSTS before HTTPS readiness', () => {
  const result = generateSecurityHeaderDescriptor({
    ...deterministicFakeConfiguration(),
    httpsReady: false,
  })

  assert.equal(result.status, 'READY')
  assert.equal(result.headers['Strict-Transport-Security'], undefined)
})

test('rejects wildcard, insecure, credentialed, and path-scoped integration sources', () => {
  for (const unsafeSource of [
    'https://*.invalid',
    'http://scripts.invalid',
    'https://user:password@scripts.invalid',
    'https://scripts.invalid/asset.js',
    "'unsafe-inline'",
  ]) {
    assert.throws(
      () => generateSecurityHeaderDescriptor({
        httpsReady: true,
        integrations: [{ id: 'unsafe', approval: 'approved', csp: { 'script-src': [unsafeSource] } }],
      }),
      UnsafeSecurityPolicyError,
      unsafeSource,
    )
  }
})

test('rejects duplicate integration identities and malformed nonces', () => {
  const duplicate = { id: 'duplicate', approval: 'approved' as const, csp: {} }
  assert.throws(
    () => generateSecurityHeaderDescriptor({ httpsReady: true, integrations: [duplicate, duplicate] }),
    /unique/,
  )
  assert.throws(
    () => generateSecurityHeaderDescriptor({ httpsReady: true, integrations: [], scriptNonces: ['short'] }),
    /nonces/,
  )
  assert.throws(
    () => generateSecurityHeaderDescriptor({
      httpsReady: true,
      integrations: [{ id: 'pending', approval: 'pending', csp: {} }],
    } as unknown as SecurityPolicyConfiguration),
    /not approved/,
  )
})
