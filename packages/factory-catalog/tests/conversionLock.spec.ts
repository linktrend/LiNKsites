import { describe, expect, it } from 'vitest'
import { ConversionLockError, ConversionLockRegistry, type CreateConversionLockInput } from '../src/conversionLock.js'
import type { ProspectAdaptation, ProspectAdaptationStatus } from '../src/prospectAdaptation.js'

function buildAdaptation(overrides: Partial<ProspectAdaptation> = {}): ProspectAdaptation {
  return {
    schemaVersion: { major: 1, minor: 0 },
    adaptationId: 'adapt-1',
    siteSpecId: 'sitespec-1',
    foundationId: 'foundation-1',
    reservationId: 'res-1',
    status: 'published',
    prospectContent: {},
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

function buildInput(overrides: Partial<CreateConversionLockInput> = {}): CreateConversionLockInput {
  return {
    adaptation: buildAdaptation(),
    previewDeploymentVersionRef: 'preview-version-1',
    conversionInstructionRef: 'conversion-instruction-1',
    stripePaymentConfirmationRef: 'stripe-payment-1',
    odooCommercialRecordRef: 'odoo-record-1',
    ...overrides,
  }
}

describe('ConversionLockRegistry.createLock', () => {
  it('creates a lock with all fields correctly populated for a published Adaptation', () => {
    const registry = new ConversionLockRegistry()
    const input = buildInput()
    const lock = registry.createLock(input)

    expect(lock.lockId).toBeTruthy()
    expect(lock.adaptationId).toBe(input.adaptation.adaptationId)
    expect(lock.foundationId).toBe(input.adaptation.foundationId)
    expect(lock.previewDeploymentVersionRef).toBe(input.previewDeploymentVersionRef)
    expect(lock.conversionInstructionRef).toBe(input.conversionInstructionRef)
    expect(lock.stripePaymentConfirmationRef).toBe(input.stripePaymentConfirmationRef)
    expect(lock.odooCommercialRecordRef).toBe(input.odooCommercialRecordRef)
    expect(lock.lockedAt).toBeTruthy()
    expect(() => new Date(lock.lockedAt).toISOString()).not.toThrow()
  })

  it('rejects a draft-status Adaptation, naming the actual status', () => {
    const registry = new ConversionLockRegistry()
    const input = buildInput({ adaptation: buildAdaptation({ status: 'draft' as ProspectAdaptationStatus }) })

    expect(() => registry.createLock(input)).toThrow(ConversionLockError)
    try {
      registry.createLock(input)
      throw new Error('expected createLock to throw')
    } catch (error) {
      expect((error as Error).message).toContain('draft')
    }
  })

  it('rejects a previewed-status Adaptation, naming the actual status', () => {
    const registry = new ConversionLockRegistry()
    const input = buildInput({ adaptation: buildAdaptation({ status: 'previewed' as ProspectAdaptationStatus }) })

    expect(() => registry.createLock(input)).toThrow(ConversionLockError)
    try {
      registry.createLock(input)
      throw new Error('expected createLock to throw')
    } catch (error) {
      expect((error as Error).message).toContain('previewed')
    }
  })

  it('rejects an archived-status Adaptation, naming the actual status', () => {
    const registry = new ConversionLockRegistry()
    const input = buildInput({ adaptation: buildAdaptation({ status: 'archived' as ProspectAdaptationStatus }) })

    expect(() => registry.createLock(input)).toThrow(ConversionLockError)
    try {
      registry.createLock(input)
      throw new Error('expected createLock to throw')
    } catch (error) {
      expect((error as Error).message).toContain('archived')
    }
  })

  it('is idempotent: a retry with the same adaptationId returns the original lock unchanged', () => {
    const registry = new ConversionLockRegistry()
    const first = registry.createLock(buildInput())

    const second = registry.createLock(
      buildInput({
        previewDeploymentVersionRef: 'preview-version-DIFFERENT',
        conversionInstructionRef: 'conversion-instruction-DIFFERENT',
        stripePaymentConfirmationRef: 'stripe-payment-DIFFERENT',
        odooCommercialRecordRef: 'odoo-record-DIFFERENT',
      }),
    )

    expect(second.lockId).toBe(first.lockId)
    expect(second.lockedAt).toBe(first.lockedAt)
    expect(second.previewDeploymentVersionRef).toBe(first.previewDeploymentVersionRef)
  })

  it('rejects locking a different Adaptation targeting a Foundation that already has an active lock', () => {
    const registry = new ConversionLockRegistry()
    registry.createLock(buildInput())

    const conflicting = buildInput({
      adaptation: buildAdaptation({ adaptationId: 'adapt-2', foundationId: 'foundation-1' }),
    })

    expect(() => registry.createLock(conflicting)).toThrow(ConversionLockError)
  })
})

describe('ConversionLockRegistry.getLockForFoundation / isLocked', () => {
  it('reports null/false before any lock exists', () => {
    const registry = new ConversionLockRegistry()
    expect(registry.getLockForFoundation('foundation-1')).toBeNull()
    expect(registry.isLocked('foundation-1')).toBe(false)
  })

  it('reports the real lock/true after one is created', () => {
    const registry = new ConversionLockRegistry()
    const lock = registry.createLock(buildInput())

    expect(registry.getLockForFoundation('foundation-1')).toEqual(lock)
    expect(registry.isLocked('foundation-1')).toBe(true)
  })
})

describe('ConversionLockRegistry.assertRecycleAllowed', () => {
  it('does not throw for a Foundation with no lock', () => {
    const registry = new ConversionLockRegistry()
    expect(() => registry.assertRecycleAllowed('foundation-1')).not.toThrow()
  })

  it('throws ConversionLockError naming the foundationId and the locking adaptationId for a locked Foundation', () => {
    const registry = new ConversionLockRegistry()
    const lock = registry.createLock(buildInput())

    expect(() => registry.assertRecycleAllowed('foundation-1')).toThrow(ConversionLockError)
    try {
      registry.assertRecycleAllowed('foundation-1')
      throw new Error('expected assertRecycleAllowed to throw')
    } catch (error) {
      expect((error as Error).message).toContain('foundation-1')
      expect((error as Error).message).toContain(lock.adaptationId)
    }
  })
})

describe('ConversionLockRegistry per-Foundation scoping', () => {
  it('leaves a distinct Foundation with no lock entirely unaffected by another Foundation lock', () => {
    const registry = new ConversionLockRegistry()
    registry.createLock(buildInput({ adaptation: buildAdaptation({ adaptationId: 'adapt-1', foundationId: 'foundation-1' }) }))

    expect(registry.getLockForFoundation('foundation-2')).toBeNull()
    expect(registry.isLocked('foundation-2')).toBe(false)
    expect(() => registry.assertRecycleAllowed('foundation-2')).not.toThrow()
  })
})
