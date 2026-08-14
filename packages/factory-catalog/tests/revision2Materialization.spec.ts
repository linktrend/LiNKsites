import { describe, expect, it } from 'vitest'
import { materializeRevision2WebsiteTemplate } from '../src/revision2Materialization.js'

describe('Revision 2 website-template materialization', () => {
  it('fails closed when the provider root is absent', () => {
    const result = materializeRevision2WebsiteTemplate({
      providerRoot: '/definitely-not-a-provider-root',
      entryId: 'master-template-type-1',
      version: '1.0.0',
      pin: {
        sourceCommitSha: 'a'.repeat(40),
        sourceTreeSha: 'b'.repeat(40),
        dependencyLockSha256: 'c'.repeat(64),
      },
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors.join(' ')).toMatch(/could not be read|receipt found|no such file/i)
  })
})
