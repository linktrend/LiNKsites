import { describe, expect, it } from 'vitest'
import {
  DesignCatalogError,
  PLACEHOLDER_STYLE_FAMILY,
  TOKEN_LAYER_ORDER,
  TRUST_PROFESSIONAL_STYLE,
  assertStyleIsProductionReady,
  resolveSiteDesignProfile,
  resolveTokens,
  resolveTokensWithProvenance,
  type StyleFamily,
  type TokenLayer,
} from '../src/designCatalog.js'

describe('TOKEN_LAYER_ORDER (manual §06)', () => {
  it('matches the manual\'s exact hierarchy: global -> semantic -> style-family -> vertical -> tier -> site -> component', () => {
    expect(TOKEN_LAYER_ORDER).toEqual(['global', 'semantic', 'style-family', 'vertical', 'tier', 'site', 'component'])
  })
})

describe('resolveTokens', () => {
  it('lets a later layer in the hierarchy override an earlier one for the same token', () => {
    const layers: TokenLayer[] = [
      { kind: 'global', tokens: { 'color.primary': '#000000' } },
      { kind: 'tier', tokens: { 'color.primary': '#0ea5e9' } },
    ]
    expect(resolveTokens(layers)).toEqual({ 'color.primary': '#0ea5e9' })
  })

  it('resolves correctly regardless of the order layers are passed in (sorts by hierarchy, not call order)', () => {
    const layers: TokenLayer[] = [
      { kind: 'component', tokens: { 'color.primary': '#component' } },
      { kind: 'global', tokens: { 'color.primary': '#global' } },
      { kind: 'site', tokens: { 'color.primary': '#site' } },
    ]
    // component is last in the hierarchy, so it must win regardless of array order.
    expect(resolveTokens(layers)['color.primary']).toBe('#component')
  })

  it('merges non-overlapping tokens from every layer', () => {
    const layers: TokenLayer[] = [
      { kind: 'global', tokens: { 'color.primary': '#000' } },
      { kind: 'style-family', tokens: { 'font.heading': 'Inter' } },
    ]
    expect(resolveTokens(layers)).toEqual({ 'color.primary': '#000', 'font.heading': 'Inter' })
  })
})

describe('resolveTokensWithProvenance', () => {
  it('records which layer last set each token, for Design Decision Record traceability', () => {
    const layers: TokenLayer[] = [
      { kind: 'global', tokens: { 'color.primary': '#global' } },
      { kind: 'tier', tokens: { 'color.primary': '#tier' } },
    ]
    const resolved = resolveTokensWithProvenance(layers)
    expect(resolved['color.primary']).toEqual({ value: '#tier', setByLayer: 'tier' })
  })
})

describe('PLACEHOLDER_STYLE_FAMILY (structural placeholder, manual §06)', () => {
  it('is deliberately candidate and accessibility-unreviewed, not real approved design content', () => {
    expect(PLACEHOLDER_STYLE_FAMILY.status).toBe('candidate')
    expect(PLACEHOLDER_STYLE_FAMILY.accessibilityContrastPassed).toBe(false)
  })
})

describe('assertStyleIsProductionReady (manual §06: accessibility constrains admission)', () => {
  it('rejects a style that has not passed accessibility review, even if status is active', () => {
    const style: StyleFamily = { ...PLACEHOLDER_STYLE_FAMILY, status: 'active', accessibilityContrastPassed: false }
    expect(() => assertStyleIsProductionReady(style)).toThrow(DesignCatalogError)
  })

  it('rejects a style that passed accessibility but is still a candidate', () => {
    const style: StyleFamily = { ...PLACEHOLDER_STYLE_FAMILY, status: 'candidate', accessibilityContrastPassed: true }
    expect(() => assertStyleIsProductionReady(style)).toThrow(DesignCatalogError)
  })

  it('accepts a style that is both active AND accessibility-passed', () => {
    const style: StyleFamily = { ...PLACEHOLDER_STYLE_FAMILY, status: 'active', accessibilityContrastPassed: true }
    expect(() => assertStyleIsProductionReady(style)).not.toThrow()
  })
})

/** Independent WCAG 2.x relative-luminance contrast calculation, used below to verify (not just trust) TRUST_PROFESSIONAL_STYLE's accessibility claim. */
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  return [parseInt(clean.slice(0, 2), 16), parseInt(clean.slice(2, 4), 16), parseInt(clean.slice(4, 6), 16)]
}
function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}
function contrastRatio(hexA: string, hexB: string): number {
  const lA = relativeLuminance(hexToRgb(hexA))
  const lB = relativeLuminance(hexToRgb(hexB))
  const [lighter, darker] = lA >= lB ? [lA, lB] : [lB, lA]
  return (lighter + 0.05) / (darker + 0.05)
}

describe('TRUST_PROFESSIONAL_STYLE (Carlos-approved provisional business default, 2026-07-14)', () => {
  it('is active with accessibility already passed', () => {
    expect(TRUST_PROFESSIONAL_STYLE.status).toBe('active')
    expect(TRUST_PROFESSIONAL_STYLE.accessibilityContrastPassed).toBe(true)
  })

  it('independently verifies the accessibilityContrastPassed claim: primary color vs. white text meets WCAG AA (>= 4.5:1)', () => {
    const ratio = contrastRatio(TRUST_PROFESSIONAL_STYLE.baseTokens['color.primary'], '#FFFFFF')
    expect(ratio).toBeGreaterThanOrEqual(4.5)
  })

  it('independently verifies the accessibilityContrastPassed claim: accent color vs. white text meets WCAG AA (>= 4.5:1)', () => {
    const ratio = contrastRatio(TRUST_PROFESSIONAL_STYLE.baseTokens['color.accent'], '#FFFFFF')
    expect(ratio).toBeGreaterThanOrEqual(4.5)
  })

  it('independently verifies the accessibilityContrastPassed claim: body text vs. background meets WCAG AA (>= 4.5:1)', () => {
    const ratio = contrastRatio(TRUST_PROFESSIONAL_STYLE.baseTokens['color.text'], TRUST_PROFESSIONAL_STYLE.baseTokens['color.background'])
    expect(ratio).toBeGreaterThanOrEqual(4.5)
  })

  it('is accepted as production-ready without needing any override', () => {
    expect(() => assertStyleIsProductionReady(TRUST_PROFESSIONAL_STYLE)).not.toThrow()
  })

  it('limits the font pairing to exactly two families (heading + body), per design-consistency guidance', () => {
    const families = new Set([TRUST_PROFESSIONAL_STYLE.fontPairing.headingFont, TRUST_PROFESSIONAL_STYLE.fontPairing.bodyFont])
    expect(families.size).toBe(2)
  })

  it('resolves a real Site Design Profile directly, with no status/accessibility override required', () => {
    const profile = resolveSiteDesignProfile('site-1', TRUST_PROFESSIONAL_STYLE)
    expect(profile.resolvedTokens['color.primary']).toBe(TRUST_PROFESSIONAL_STYLE.baseTokens['color.primary'])
  })
})

describe('resolveSiteDesignProfile', () => {
  it('refuses to resolve a profile from a non-production-ready style', () => {
    expect(() => resolveSiteDesignProfile('site-1', PLACEHOLDER_STYLE_FAMILY)).toThrow(DesignCatalogError)
  })

  it('resolves a profile from a production-ready style, applying overrides correctly', () => {
    const readyStyle: StyleFamily = { ...PLACEHOLDER_STYLE_FAMILY, status: 'active', accessibilityContrastPassed: true }
    const profile = resolveSiteDesignProfile('site-1', readyStyle, [{ kind: 'site', tokens: { 'color.primary': '#custom' } }])
    expect(profile.siteRef).toBe('site-1')
    expect(profile.resolvedTokens['color.primary']).toBe('#custom') // site layer overrides style-family
    expect(profile.resolvedTokens['color.background']).toBe(readyStyle.baseTokens['color.background']) // untouched token preserved
  })
})
