import { describe, expect, it } from 'vitest'
import {
  assertProofSpecificationIsProductionReady,
  checkInvestmentAgainstBudget,
  createProofBlock,
  escalateProofBlock,
  ProofLevelError,
  type InvestmentAuthorization,
  type ProofBlock,
  type ProofSpecification,
} from '../src/proofLevel.js'

function buildSpec(overrides: Partial<ProofSpecification> = {}): ProofSpecification {
  return {
    schemaVersion: { major: 1, minor: 0 },
    level: 1,
    version: '1.0.0',
    status: 'active',
    maxAuthorizedInvestmentUsd: 100, // PROVISIONAL placeholder -- see module-level doc comment.
    scopeSummary: 'Level 1: a single personalized landing page demonstrating tier-appropriate value.',
    ...overrides,
  }
}

function buildAuthorization(overrides: Partial<InvestmentAuthorization> = {}): InvestmentAuthorization {
  return {
    budgetClass: 'standard_preview',
    maximumCostUsd: 100, // PROVISIONAL placeholder
    authorityRef: 'sales-authority-ref-0001',
    ...overrides,
  }
}

describe('assertProofSpecificationIsProductionReady', () => {
  it('throws ProofLevelError for a non-active specification', () => {
    const spec = buildSpec({ status: 'draft' })
    expect(() => assertProofSpecificationIsProductionReady(spec)).toThrow(ProofLevelError)
  })

  it('does not throw for an active specification', () => {
    const spec = buildSpec({ status: 'active' })
    expect(() => assertProofSpecificationIsProductionReady(spec)).not.toThrow()
  })
})

describe('checkInvestmentAgainstBudget', () => {
  it('returns allowed when the requested cost is within both the authorization and specification ceilings', () => {
    const spec = buildSpec({ maxAuthorizedInvestmentUsd: 100 })
    const authorization = buildAuthorization({ maximumCostUsd: 100 })
    const result = checkInvestmentAgainstBudget(spec, authorization, 50)
    expect(result.disposition).toBe('allowed')
  })

  it('returns exceeds_authorized_budget when the cost exceeds the authorization ceiling but not the specification ceiling', () => {
    const spec = buildSpec({ maxAuthorizedInvestmentUsd: 200 })
    const authorization = buildAuthorization({ maximumCostUsd: 100 })
    const result = checkInvestmentAgainstBudget(spec, authorization, 150)
    expect(result.disposition).toBe('exceeds_authorized_budget')
    expect(result.reason).toContain('authorization')
  })

  it('returns exceeds_specification_ceiling when the cost exceeds the specification ceiling, with an authorization ceiling that is higher', () => {
    // Authorization ceiling (300) is deliberately HIGHER than the spec ceiling (100),
    // so the requested cost (150) clears the authorization check and must fail on the
    // specification's own ceiling instead -- this makes the two dispositions distinct
    // and reachable in isolation.
    const spec = buildSpec({ maxAuthorizedInvestmentUsd: 100 })
    const authorization = buildAuthorization({ maximumCostUsd: 300 })
    const result = checkInvestmentAgainstBudget(spec, authorization, 150)
    expect(result.disposition).toBe('exceeds_specification_ceiling')
    expect(result.reason).toContain('Specification')
  })

  it('throws ProofLevelError if the specification is not active', () => {
    const spec = buildSpec({ status: 'deprecated' })
    const authorization = buildAuthorization()
    expect(() => checkInvestmentAgainstBudget(spec, authorization, 10)).toThrow(ProofLevelError)
  })
})

describe('createProofBlock', () => {
  it('happy path: returns a ProofBlock with correct fields, supersededBy null, and a real proofBlockId', () => {
    const spec = buildSpec({ level: 2, version: '1.2.0' })
    const authorization = buildAuthorization()
    const block = createProofBlock('site-spec-001', spec, authorization, 50)

    expect(block.siteSpecId).toBe('site-spec-001')
    expect(block.level).toBe(2)
    expect(block.specificationVersion).toBe('1.2.0')
    expect(block.authorization).toEqual(authorization)
    expect(block.supersededBy).toBeNull()
    expect(typeof block.proofBlockId).toBe('string')
    expect(block.proofBlockId.length).toBeGreaterThan(0)
    expect(typeof block.createdAt).toBe('string')
    expect(new Date(block.createdAt).toString()).not.toBe('Invalid Date')
  })

  it('rejects when the budget check fails', () => {
    const spec = buildSpec({ maxAuthorizedInvestmentUsd: 50 })
    const authorization = buildAuthorization({ maximumCostUsd: 50 })
    expect(() => createProofBlock('site-spec-001', spec, authorization, 999)).toThrow(ProofLevelError)
  })

  it('rejects a Level-0 specification -- no prebuild ProofBlock exists for Level 0', () => {
    const spec = buildSpec({ level: 0, maxAuthorizedInvestmentUsd: 1000 })
    const authorization = buildAuthorization({ maximumCostUsd: 1000 })
    expect(() => createProofBlock('site-spec-001', spec, authorization, 10)).toThrow(ProofLevelError)
  })
})

describe('escalateProofBlock', () => {
  function buildInitialBlock(): ProofBlock {
    const spec = buildSpec({ level: 1, version: '1.0.0', maxAuthorizedInvestmentUsd: 100 })
    const authorization = buildAuthorization({ maximumCostUsd: 100 })
    return createProofBlock('site-spec-001', spec, authorization, 50)
  }

  it('happy path: returns { previous, next } where previous.supersededBy === next.proofBlockId and next.level is the new higher level', () => {
    const previous = buildInitialBlock()
    const newSpec = buildSpec({ level: 3, version: '3.0.0', maxAuthorizedInvestmentUsd: 500 })
    const newAuthorization = buildAuthorization({ maximumCostUsd: 500 })

    const result = escalateProofBlock(previous, newSpec, newAuthorization, 300)

    expect(result.next.level).toBe(3)
    expect(result.next.specificationVersion).toBe('3.0.0')
    expect(result.previous.supersededBy).toBe(result.next.proofBlockId)
    expect(result.previous.level).toBe(1)
    expect(result.previous.proofBlockId).toBe(previous.proofBlockId)
  })

  it('rejects escalating to the same level', () => {
    const previous = buildInitialBlock()
    const sameSpec = buildSpec({ level: 1, version: '1.1.0', maxAuthorizedInvestmentUsd: 100 })
    const authorization = buildAuthorization({ maximumCostUsd: 100 })
    expect(() => escalateProofBlock(previous, sameSpec, authorization, 50)).toThrow(ProofLevelError)
  })

  it('rejects escalating to a lower level', () => {
    const previous = createProofBlock(
      'site-spec-001',
      buildSpec({ level: 3, version: '3.0.0', maxAuthorizedInvestmentUsd: 500 }),
      buildAuthorization({ maximumCostUsd: 500 }),
      200,
    )
    const lowerSpec = buildSpec({ level: 2, version: '2.0.0', maxAuthorizedInvestmentUsd: 300 })
    const authorization = buildAuthorization({ maximumCostUsd: 300 })
    expect(() => escalateProofBlock(previous, lowerSpec, authorization, 50)).toThrow(ProofLevelError)
  })

  it('rejects if the new investment fails its own budget check (delegated to createProofBlock)', () => {
    const previous = buildInitialBlock()
    const newSpec = buildSpec({ level: 2, version: '2.0.0', maxAuthorizedInvestmentUsd: 100 })
    const newAuthorization = buildAuthorization({ maximumCostUsd: 100 })
    expect(() => escalateProofBlock(previous, newSpec, newAuthorization, 9999)).toThrow(ProofLevelError)
  })
})
