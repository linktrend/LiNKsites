/**
 * Design Intelligence Catalog and token hierarchy (Phase 3, Issue
 * phase3-design-catalog-001).
 *
 * Manual §06: "a versioned knowledge base for selecting/applying visual
 * systems (styles, palettes, fonts, layout/motion profiles)." Manual
 * §06 doctrine enforced here:
 *
 * - Only `active` Catalog entries may be selected automatically (§06) --
 *   `assertStyleIsProductionReady()`.
 * - Accessibility constrains Catalog ADMISSION, not just a final
 *   cosmetic check -- "an attractive candidate failing accessibility is
 *   not eligible for production" (§06) -- a StyleFamily cannot become
 *   `active` without `accessibilityContrastPassed: true`, enforced at
 *   the type/guard level, not left to convention.
 * - Design tokens are hierarchical and OVERRIDE in a fixed order: global
 *   -> semantic -> style-family -> vertical -> tier -> site profile ->
 *   component (§06) -- `resolveTokens()` implements exactly that layer
 *   order, later layers overriding earlier ones for the same token name.
 * - The `ui-ux-pro-max-skill` upstream repo is named in the manual as a
 *   design-catalog SEED to be pinned/reviewed/normalized into an
 *   internal Catalog version -- this repository does not have access to
 *   that upstream repo. No real style content is invented here; the one
 *   seeded StyleFamily below is a structural placeholder for exercising
 *   the mechanism, explicitly left at `candidate`.
 */

import type { SchemaVersion } from '@linksites/types'

export type DesignAssetStatus = 'candidate' | 'active' | 'deprecated' | 'retired'

/** Manual §06's token hierarchy layers, in override order (later overrides earlier for the same token name). */
export type TokenLayerKind = 'global' | 'semantic' | 'style-family' | 'vertical' | 'tier' | 'site' | 'component'

export const TOKEN_LAYER_ORDER: TokenLayerKind[] = ['global', 'semantic', 'style-family', 'vertical', 'tier', 'site', 'component']

export interface TokenLayer {
  kind: TokenLayerKind
  tokens: Record<string, string>
}

export class DesignCatalogError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DesignCatalogError'
  }
}

/**
 * Resolves a final token set by applying layers strictly in
 * TOKEN_LAYER_ORDER, regardless of the order they were passed in --
 * this makes the resolution deterministic and independent of caller
 * mistakes about ordering (manual §06's hierarchy is a fixed contract,
 * not caller-supplied).
 */
export function resolveTokens(layers: TokenLayer[]): Record<string, string> {
  const sorted = [...layers].sort((a, b) => TOKEN_LAYER_ORDER.indexOf(a.kind) - TOKEN_LAYER_ORDER.indexOf(b.kind))
  const resolved: Record<string, string> = {}
  for (const layer of sorted) {
    Object.assign(resolved, layer.tokens)
  }
  return resolved
}

/** Tracks which layer last set each token -- useful for the Design Decision Record's traceability requirement (manual §06). */
export function resolveTokensWithProvenance(layers: TokenLayer[]): Record<string, { value: string; setByLayer: TokenLayerKind }> {
  const sorted = [...layers].sort((a, b) => TOKEN_LAYER_ORDER.indexOf(a.kind) - TOKEN_LAYER_ORDER.indexOf(b.kind))
  const resolved: Record<string, { value: string; setByLayer: TokenLayerKind }> = {}
  for (const layer of sorted) {
    for (const [key, value] of Object.entries(layer.tokens)) {
      resolved[key] = { value, setByLayer: layer.kind }
    }
  }
  return resolved
}

export interface StyleFamily {
  schemaVersion: SchemaVersion
  styleId: string
  displayName: string
  status: DesignAssetStatus
  /** Base color-palette tokens this style family contributes at the 'style-family' layer. */
  baseTokens: Record<string, string>
  /**
   * Manual §06: accessibility constrains Catalog ADMISSION. This must
   * be true before status can legitimately become 'active' -- enforced
   * by assertStyleIsProductionReady(), not just documented.
   */
  accessibilityContrastPassed: boolean
  fontPairing: { headingFont: string; bodyFont: string }
}

/**
 * The one seeded StyleFamily -- a structural placeholder, not real
 * design content sourced from ui-ux-pro-max-skill (which this
 * repository cannot reach). Deliberately `candidate`, with
 * `accessibilityContrastPassed: false` until a real accessibility
 * review happens -- both facts together make it doubly ineligible for
 * production, which is the correct, honest default.
 */
export const PLACEHOLDER_STYLE_FAMILY: StyleFamily = {
  schemaVersion: { major: 1, minor: 0 },
  styleId: 'placeholder-neutral-professional',
  displayName: 'Neutral Professional (structural placeholder, not reviewed)',
  status: 'candidate',
  baseTokens: {
    'color.primary': '#0ea5e9',
    'color.background': '#ffffff',
    'color.text': '#1f2937',
  },
  accessibilityContrastPassed: false,
  fontPairing: { headingFont: 'system-ui', bodyFont: 'system-ui' },
}

/**
 * Manual §06: only `active` Catalog entries may be selected
 * automatically, and a candidate failing accessibility is never
 * eligible for production regardless of how visually appealing it is.
 */
export function assertStyleIsProductionReady(style: StyleFamily): void {
  if (!style.accessibilityContrastPassed) {
    throw new DesignCatalogError(
      `Style "${style.styleId}" has not passed accessibility contrast review -- it cannot be used in production regardless of its lifecycle status (manual §06).`,
    )
  }
  if (style.status !== 'active') {
    throw new DesignCatalogError(`Style "${style.styleId}" is not production-ready (status: "${style.status}").`)
  }
}

export interface SiteDesignProfile {
  schemaVersion: SchemaVersion
  siteRef: string
  styleId: string
  resolvedTokens: Record<string, string>
  resolvedAt: string
}

/**
 * Resolves a Site Design Profile for one site from a StyleFamily plus
 * any vertical/tier/site-specific overrides, enforcing that the
 * StyleFamily is production-ready first (manual §06 -- you cannot
 * resolve a real Site Design Profile from a non-active or
 * accessibility-failing style).
 */
export function resolveSiteDesignProfile(
  siteRef: string,
  style: StyleFamily,
  overrideLayers: TokenLayer[] = [],
): SiteDesignProfile {
  assertStyleIsProductionReady(style)
  const layers: TokenLayer[] = [{ kind: 'style-family', tokens: style.baseTokens }, ...overrideLayers]
  return {
    schemaVersion: { major: 1, minor: 0 },
    siteRef,
    styleId: style.styleId,
    resolvedTokens: resolveTokens(layers),
    resolvedAt: new Date().toISOString(),
  }
}
