import { describe, expect, it } from 'vitest'
import { InMemoryLedgerStore } from '../src/store.js'
import { ProgramLedger, LedgerError } from '../src/ledger.js'
import { HierarchyRegistry, HierarchyError, LINKSITES_PROGRAM } from '../src/hierarchy.js'

describe('LINKSITES_PROGRAM', () => {
  it('defines exactly 20 Modules (M01-M20) per manual §05', () => {
    expect(LINKSITES_PROGRAM.modules).toHaveLength(20)
    const ids = LINKSITES_PROGRAM.modules.map((m) => m.moduleId)
    expect(ids).toEqual(Array.from({ length: 20 }, (_, i) => `M${String(i + 1).padStart(2, '0')}`))
  })

  it('groups Modules into the 4 functional bands the manual describes', () => {
    const bands = new Set(LINKSITES_PROGRAM.modules.map((m) => m.band))
    expect(bands).toEqual(
      new Set(['product-capability', 'preview-production', 'paid-fulfilment', 'managed-service', 'control-improvement']),
    )
  })
})

describe('HierarchyRegistry', () => {
  it('validates a known Program + Module ref', () => {
    const registry = new HierarchyRegistry()
    expect(() => registry.assertValidRefs('linksites', 'M07')).not.toThrow()
  })

  it('rejects an unknown Program ref', () => {
    const registry = new HierarchyRegistry()
    expect(() => registry.assertValidRefs('not-a-real-program')).toThrow(HierarchyError)
  })

  it('rejects an unknown Module ref within a known Program', () => {
    const registry = new HierarchyRegistry()
    expect(() => registry.assertValidRefs('linksites', 'M99')).toThrow(HierarchyError)
  })

  it('rejects a stageRef when no moduleRef is given', () => {
    const registry = new HierarchyRegistry()
    expect(() => registry.assertValidRefs('linksites', undefined, 'stage-1')).toThrow(HierarchyError)
  })

  it('rejects any stageRef today, since no Module has defined Stages yet', () => {
    const registry = new HierarchyRegistry()
    expect(() => registry.assertValidRefs('linksites', 'M07', 'stage-1')).toThrow(HierarchyError)
  })
})

describe('ProgramLedger with hierarchy validation enabled', () => {
  it('creates an Issue against a real Module ref (M07, Preview Intake & Planning)', async () => {
    const ledger = new ProgramLedger(new InMemoryLedgerStore(), new HierarchyRegistry())
    const issue = await ledger.createIssue({
      issueType: 'preview.intake.validate_request',
      programRef: 'linksites',
      moduleRef: 'M07',
      input: { foo: 'bar' },
    })
    expect(issue.moduleRef).toBe('M07')
  })

  it('rejects creating an Issue against an unknown Module when hierarchy validation is enabled', async () => {
    const ledger = new ProgramLedger(new InMemoryLedgerStore(), new HierarchyRegistry())
    await expect(
      ledger.createIssue({
        issueType: 'test.synthetic',
        programRef: 'linksites',
        moduleRef: 'M99',
        input: { foo: 'bar' },
      }),
    ).rejects.toThrow(HierarchyError)
  })

  it('still allows Issue creation without hierarchy validation when no registry is supplied (backward compatible)', async () => {
    const ledger = new ProgramLedger(new InMemoryLedgerStore())
    const issue = await ledger.createIssue({
      issueType: 'test.synthetic',
      programRef: 'anything-goes-without-a-registry',
      input: { foo: 'bar' },
    })
    expect(issue.programRef).toBe('anything-goes-without-a-registry')
  })
})

// Re-export check: LedgerError must remain distinct from HierarchyError.
describe('error type distinction', () => {
  it('HierarchyError is not a LedgerError', () => {
    expect(new HierarchyError('x')).not.toBeInstanceOf(LedgerError)
  })
})
