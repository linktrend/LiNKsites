import { describe, expect, it } from 'vitest'
import {
  DesignCatalogError,
  PLACEHOLDER_STYLE_FAMILY,
  TOKEN_LAYER_ORDER,
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
