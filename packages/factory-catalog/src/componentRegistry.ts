/**
 * Component Registry (Phase 3, Issue phase3-component-registry-001).
 *
 * Manual doctrine (§06/§08): components used to assemble sites must be
 * a GOVERNED, machine-readable object -- lifecycle-tracked, tier-gated,
 * and consultable by the (future) Site Assembly Engine -- not merely
 * human-readable documentation. `apps/web-master/docs/components/index.json`
 * is real, useful documentation of what exists in code today, but it has
 * no lifecycle status, no tier gating, and no schema versioning, so it
 * cannot answer "is this component allowed for this customer's paid
 * tier?" This Issue builds that governed object, seeded with a handful
 * of components that genuinely exist in `apps/web-master` today (drawn
 * directly from `docs/components/index.json`, not invented), so the
 * registry starts from real evidence rather than a synthetic example.
 */

import type { SchemaVersion } from '@linksites/types'
import { checkEntitlement, type TierId, type TierSpecification } from './tierSpecification.js'

export type ComponentAssetStatus = 'candidate' | 'active' | 'deprecated' | 'retired'

export type ComponentCategory = 'marketing' | 'content' | 'forms' | 'navigation' | 'layout'

export interface ComponentDefinition {
  schemaVersion: SchemaVersion
  componentId: string
  displayName: string
  status: ComponentAssetStatus
  category: ComponentCategory
  /** Real source path, for traceability back to the actual implementation (not an opaque ref). */
  sourceFile: string
  /**
   * True only for components that require CUSTOM code written for one
   * specific customer, distinct from selecting an existing catalog
   * component (manual's tier dimension `allowsCustomComponentCode`).
   * All components seeded below are pre-built catalog components, so
   * this is false for every seed entry.
   */
  requiresCustomCode: boolean
  /** Tiers this component is permitted for; empty array means "all tiers" (no tier-specific restriction known). */
  restrictedToTiers: TierId[]
}

export class ComponentRegistryError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ComponentRegistryError'
  }
}

export class ComponentRegistry {
  private components = new Map<string, ComponentDefinition>()

  register(component: ComponentDefinition): void {
    if (this.components.has(component.componentId)) {
      throw new ComponentRegistryError(`Component "${component.componentId}" is already registered.`)
    }
    this.components.set(component.componentId, component)
  }

  get(componentId: string): ComponentDefinition {
    const component = this.components.get(componentId)
    if (!component) throw new ComponentRegistryError(`Component "${componentId}" is not registered.`)
    return component
  }

  listByCategory(category: ComponentCategory): ComponentDefinition[] {
    return Array.from(this.components.values()).filter((c) => c.category === category)
  }

  listActive(): ComponentDefinition[] {
    return Array.from(this.components.values()).filter((c) => c.status === 'active')
  }

  /**
   * Enforces that a component may be used for a given tier: it must be
   * `active`, must not be tier-restricted away from this tier, and if
   * it requires custom code, the tier's TierSpecification must permit
   * that (checked via the same `checkEntitlement()` already proven in
   * the Tier Specification Issue, not a duplicated rule).
   */
  assertComponentAvailableForTier(componentId: string, tier: TierSpecification): void {
    const component = this.get(componentId)
    if (component.status !== 'active') {
      throw new ComponentRegistryError(`Component "${componentId}" is not active (status: "${component.status}") and cannot be used in production.`)
    }
    if (component.restrictedToTiers.length > 0 && !component.restrictedToTiers.includes(tier.tierId)) {
      throw new ComponentRegistryError(`Component "${componentId}" is restricted to tiers [${component.restrictedToTiers.join(', ')}], not "${tier.tierId}".`)
    }
    if (component.requiresCustomCode) {
      const result = checkEntitlement(tier, { kind: 'custom_component_code' })
      if (result.disposition !== 'allowed') {
        throw new ComponentRegistryError(`Component "${componentId}" requires custom component code, which tier "${tier.tierId}" does not permit (${result.disposition}).`)
      }
    }
  }
}

/**
 * Real components drawn directly from `apps/web-master/docs/components/index.json`
 * (verified present in that file as of this Issue), not invented
 * examples. Marked `active` because they are shipped, in-use components
 * in `apps/web-master` today -- an honest reflection of current reality,
 * not an aspirational claim.
 */
export const SEED_COMPONENTS: ComponentDefinition[] = [
  {
    schemaVersion: { major: 1, minor: 0 },
    componentId: 'SignupHero',
    displayName: 'Signup Hero',
    status: 'active',
    category: 'marketing',
    sourceFile: 'src/components/marketing/SignupHero.tsx',
    requiresCustomCode: false,
    restrictedToTiers: [],
  },
  {
    schemaVersion: { major: 1, minor: 0 },
    componentId: 'CTASection',
    displayName: 'CTA Section',
    status: 'active',
    category: 'marketing',
    sourceFile: 'src/components/marketing/CTASection.tsx',
    requiresCustomCode: false,
    restrictedToTiers: [],
  },
  {
    schemaVersion: { major: 1, minor: 0 },
    componentId: 'OfferShowcase',
    displayName: 'Offer Showcase',
    status: 'active',
    category: 'marketing',
    sourceFile: 'src/components/marketing/OfferShowcase.tsx',
    requiresCustomCode: false,
    restrictedToTiers: [],
  },
  {
    schemaVersion: { major: 1, minor: 0 },
    componentId: 'ArticlesGrid',
    displayName: 'Articles Grid',
    status: 'active',
    category: 'content',
    sourceFile: 'src/components/marketing/ArticlesGrid.tsx',
    requiresCustomCode: false,
    restrictedToTiers: [],
  },
]

export function buildSeededComponentRegistry(): ComponentRegistry {
  const registry = new ComponentRegistry()
  for (const component of SEED_COMPONENTS) {
    registry.register(component)
  }
  return registry
}
