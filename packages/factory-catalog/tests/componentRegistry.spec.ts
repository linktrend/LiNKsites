import { describe, expect, it } from 'vitest'
import {
  ComponentRegistry,
  ComponentRegistryError,
  SEED_COMPONENTS,
  buildSeededComponentRegistry,
  type ComponentDefinition,
} from '../src/componentRegistry.js'
import { TIER_SPECIFICATIONS } from '../src/tierSpecification.js'

function buildComponent(overrides: Partial<ComponentDefinition> = {}): ComponentDefinition {
  return {
    schemaVersion: { major: 1, minor: 0 },
    componentId: 'TestComponent',
    displayName: 'Test Component',
    status: 'active',
    category: 'marketing',
    sourceFile: 'src/components/marketing/TestComponent.tsx',
    requiresCustomCode: false,
    restrictedToTiers: [],
    ...overrides,
  }
}

describe('ComponentRegistry basics', () => {
  it('registers and retrieves a component', () => {
    const registry = new ComponentRegistry()
    registry.register(buildComponent())
    expect(registry.get('TestComponent').displayName).toBe('Test Component')
  })

  it('rejects registering the same componentId twice', () => {
    const registry = new ComponentRegistry()
    registry.register(buildComponent())
    expect(() => registry.register(buildComponent())).toThrow(ComponentRegistryError)
  })

  it('throws when getting an unregistered component', () => {
    const registry = new ComponentRegistry()
    expect(() => registry.get('DoesNotExist')).toThrow(ComponentRegistryError)
  })

  it('lists components by category', () => {
    const registry = new ComponentRegistry()
    registry.register(buildComponent({ componentId: 'A', category: 'marketing' }))
    registry.register(buildComponent({ componentId: 'B', category: 'forms' }))
    expect(registry.listByCategory('marketing').map((c) => c.componentId)).toEqual(['A'])
  })

  it('lists only active components', () => {
    const registry = new ComponentRegistry()
    registry.register(buildComponent({ componentId: 'A', status: 'active' }))
    registry.register(buildComponent({ componentId: 'B', status: 'candidate' }))
    expect(registry.listActive().map((c) => c.componentId)).toEqual(['A'])
  })
})

describe('assertComponentAvailableForTier', () => {
  it('rejects a non-active component regardless of tier', () => {
    const registry = new ComponentRegistry()
    registry.register(buildComponent({ status: 'candidate' }))
    expect(() => registry.assertComponentAvailableForTier('TestComponent', TIER_SPECIFICATIONS.enterprise)).toThrow(ComponentRegistryError)
  })

  it('rejects a component restricted to a different tier', () => {
    const registry = new ComponentRegistry()
    registry.register(buildComponent({ restrictedToTiers: ['enterprise'] }))
    expect(() => registry.assertComponentAvailableForTier('TestComponent', TIER_SPECIFICATIONS.standard)).toThrow(ComponentRegistryError)
  })

  it('accepts a component restricted to a tier when that tier matches', () => {
    const registry = new ComponentRegistry()
    registry.register(buildComponent({ restrictedToTiers: ['enterprise'] }))
    expect(() => registry.assertComponentAvailableForTier('TestComponent', TIER_SPECIFICATIONS.enterprise)).not.toThrow()
  })

  it('rejects a custom-code component for a tier that does not permit custom component code', () => {
    const registry = new ComponentRegistry()
    registry.register(buildComponent({ requiresCustomCode: true }))
    expect(() => registry.assertComponentAvailableForTier('TestComponent', TIER_SPECIFICATIONS.standard)).toThrow(ComponentRegistryError)
  })

  it('accepts a custom-code component for a tier that permits it (delegates to checkEntitlement, not a duplicated rule)', () => {
    const registry = new ComponentRegistry()
    registry.register(buildComponent({ requiresCustomCode: true }))
    expect(() => registry.assertComponentAvailableForTier('TestComponent', TIER_SPECIFICATIONS.enterprise)).not.toThrow()
  })

  it('accepts an ordinary catalog component (no custom code, no tier restriction) for every tier', () => {
    const registry = new ComponentRegistry()
    registry.register(buildComponent())
    for (const tier of Object.values(TIER_SPECIFICATIONS)) {
      expect(() => registry.assertComponentAvailableForTier('TestComponent', tier)).not.toThrow()
    }
  })
})

describe('SEED_COMPONENTS (real components from apps/web-master/docs/components/index.json)', () => {
  it('contains at least the SignupHero, CTASection, OfferShowcase, and ArticlesGrid components', () => {
    const ids = SEED_COMPONENTS.map((c) => c.componentId)
    expect(ids).toEqual(expect.arrayContaining(['SignupHero', 'CTASection', 'OfferShowcase', 'ArticlesGrid']))
  })

  it('none of the seed components claim to require custom code (they are all pre-built catalog components)', () => {
    expect(SEED_COMPONENTS.every((c) => c.requiresCustomCode === false)).toBe(true)
  })

  it('buildSeededComponentRegistry() registers every seed component without collision', () => {
    const registry = buildSeededComponentRegistry()
    for (const component of SEED_COMPONENTS) {
      expect(registry.get(component.componentId)).toBeDefined()
    }
  })

  it('every seed component is available to the Standard tier (no custom code, no restriction)', () => {
    const registry = buildSeededComponentRegistry()
    for (const component of SEED_COMPONENTS) {
      expect(() => registry.assertComponentAvailableForTier(component.componentId, TIER_SPECIFICATIONS.standard)).not.toThrow()
    }
  })
})
