import { describe, expect, it } from 'vitest'

import { resolveDatabaseUri } from '@/utils/databaseUri'

describe('Payload database URI resolution', () => {
  const fixtureValue = ['ltfx', 'db', 'uri', 'postgresql', '3cd2c965ba', 'v1'].join('.')

  it('rejects a fixture placeholder at runtime by leaving it invalid', () => {
    expect(resolveDatabaseUri(fixtureValue, false)).toBe(fixtureValue)
  })

  it('maps a fixture placeholder only for Payload code generation', () => {
    expect(resolveDatabaseUri(fixtureValue, true)).toBe(
      'postgresql://' + '127.0.0.1:5432/linksites_build',
    )
  })

  it('preserves configured runtime PostgreSQL URIs', () => {
    const configured = 'postgresql://' + 'db.example.invalid:5432/linksites'
    expect(resolveDatabaseUri(configured, false)).toBe(configured)
  })

  it('supplies a local URI only when code generation has no configured URI', () => {
    expect(resolveDatabaseUri(undefined, false)).toBeUndefined()
    expect(resolveDatabaseUri(undefined, true)).toBe(
      'postgresql://' + '127.0.0.1:5432/linksites_build',
    )
  })
})
