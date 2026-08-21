/**
 * In-memory CSS variables from authored theme.json.
 *
 * theme.json is canonical. Generated Library files (tokens.css, tokens.json,
 * variants.json) are never overlaid or written here. Dentist presets fail closed.
 */
import { MasterTemplateConsumerError } from './masterTemplatePin.js'
import { FORBIDDEN_GENERATED_TOKEN_PATHS } from './masterTemplateOverridePolicy.js'

export const INDUSTRY_PRESET_IDS = [
  'saas',
  'healthcare',
  'finance',
  'ecommerce',
  'legal',
  'realestate',
  'education',
  'restaurant',
  'agency',
  'nonprofit',
] as const

export const FORBIDDEN_VERTICAL_PRESETS = ['dentist'] as const

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const kebab = (value: string): string =>
  value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replaceAll('_', '-').toLowerCase()

export function assertIndustryPresets(theme: Record<string, unknown>): readonly string[] {
  if (!isRecord(theme.industryPresets)) {
    throw new MasterTemplateConsumerError('theme.json must declare industryPresets.')
  }
  const ids = Object.keys(theme.industryPresets).filter((key) => key !== 'description')
  const unexpected = ids.filter(
    (id) =>
      (FORBIDDEN_VERTICAL_PRESETS as readonly string[]).includes(id) ||
      !(INDUSTRY_PRESET_IDS as readonly string[]).includes(id),
  )
  const missing = INDUSTRY_PRESET_IDS.filter((id) => !ids.includes(id))
  if (unexpected.length > 0 || missing.length > 0 || ids.length !== INDUSTRY_PRESET_IDS.length) {
    throw new MasterTemplateConsumerError(
      `industry_preset_inventory_invalid:${[...missing, ...unexpected].join(',')}`,
    )
  }
  return INDUSTRY_PRESET_IDS
}

export function assertThemeJsonIsCanonical(theme: unknown): asserts theme is Record<string, unknown> {
  if (!isRecord(theme) || !isRecord(theme.theme)) {
    throw new MasterTemplateConsumerError('theme.json must contain an authored theme object.')
  }
  if (/Manually update src\/styles\/tokens\.css/i.test(JSON.stringify(theme.usage ?? {}))) {
    throw new MasterTemplateConsumerError('theme_json_manual_css_sync')
  }
  if (FORBIDDEN_VERTICAL_PRESETS.some((id) => Object.hasOwn(theme.industryPresets ?? {}, id))) {
    throw new MasterTemplateConsumerError('forbidden_vertical_preset')
  }
}

export function refuseGeneratedTokenOverlay(path: string): void {
  if ((FORBIDDEN_GENERATED_TOKEN_PATHS as readonly string[]).includes(path)) {
    throw new MasterTemplateConsumerError(
      `Generated token overlay "${path}" is forbidden; apply authored theme.json into CSS variables only.`,
    )
  }
}

function collectLeafDecls(
  node: unknown,
  mappingGroup: unknown,
  fallbackPrefix: string,
): Array<[string, string]> {
  const decls: Array<[string, string]> = []
  if (!isRecord(node)) return decls
  for (const [key, value] of Object.entries(node)) {
    if (key === 'description') continue
    if (isRecord(value)) {
      decls.push(
        ...collectLeafDecls(
          value,
          isRecord(mappingGroup) ? mappingGroup[key] : undefined,
          `${fallbackPrefix}-${kebab(key)}`,
        ),
      )
      continue
    }
    if (typeof value !== 'string' && typeof value !== 'number') continue
    const mapped = isRecord(mappingGroup) && typeof mappingGroup[key] === 'string'
      ? mappingGroup[key]
      : `${fallbackPrefix}-${kebab(key)}`
    decls.push([mapped, String(value)])
  }
  return decls
}

export function collectThemeDeclarations(
  themeTokens: Record<string, unknown>,
  mapping: Record<string, unknown> = {},
): Array<[string, string]> {
  const decls: Array<[string, string]> = []
  decls.push(...collectLeafDecls(themeTokens.colors, mapping.colors, '--color'))
  if (isRecord(themeTokens.typography)) {
    const typography = themeTokens.typography
    if (typeof typography.fontFamily === 'string') {
      const mapped = isRecord(mapping.typography) && typeof mapping.typography.fontFamily === 'string'
        ? mapping.typography.fontFamily
        : '--font-family'
      decls.push([mapped, typography.fontFamily])
    }
    if (typeof typography.fontFamilyHeading === 'string') {
      decls.push(['--font-family-heading', typography.fontFamilyHeading])
    }
    if (typeof typography.fontFamilyMono === 'string') {
      decls.push(['--font-family-mono', typography.fontFamilyMono])
    }
    decls.push(...collectLeafDecls(typography.fontSize, {}, '--font-size'))
    decls.push(...collectLeafDecls(typography.fontWeight, {}, '--font-weight'))
    decls.push(...collectLeafDecls(typography.lineHeight, {}, '--line-height'))
  }
  decls.push(...collectLeafDecls(themeTokens.spacing, mapping.spacing, '--spacing'))
  decls.push(...collectLeafDecls(themeTokens.radius, mapping.radius, '--radius'))
  decls.push(...collectLeafDecls(themeTokens.shadows, mapping.shadows, '--shadow'))
  decls.push(...collectLeafDecls(themeTokens.gradients, mapping.gradients, '--gradient'))
  if (isRecord(themeTokens.motion)) {
    decls.push(
      ...collectLeafDecls(
        themeTokens.motion.duration,
        isRecord(mapping.motion) ? mapping.motion.duration : undefined,
        '--duration',
      ),
    )
    decls.push(
      ...collectLeafDecls(
        themeTokens.motion.easing,
        isRecord(mapping.motion) ? mapping.motion.easing : undefined,
        '--easing',
      ),
    )
  }
  const names = new Set(decls.map(([name]) => name))
  if (names.has('--duration-normal') && names.has('--easing-default')) {
    decls.push([
      '--transition-colors',
      'color var(--duration-normal) var(--easing-default), background-color var(--duration-normal) var(--easing-default), border-color var(--duration-normal) var(--easing-default)',
    ])
    decls.push(['--transition-opacity', 'opacity var(--duration-normal) var(--easing-default)'])
    decls.push(['--transition-transform', 'transform var(--duration-normal) var(--easing-default)'])
    decls.push(['--transition-all', 'all var(--duration-normal) var(--easing-default)'])
    decls.push(['--transition-shadow', 'box-shadow var(--duration-normal) var(--easing-default)'])
  }
  return decls
}

function collectPatchDeclarations(
  baseTheme: Record<string, unknown>,
  patch: Record<string, unknown>,
  mapping: Record<string, unknown>,
): Array<[string, string]> {
  const base = new Map(collectThemeDeclarations(baseTheme, mapping))
  const merged: Record<string, unknown> = {
    ...baseTheme,
    colors: { ...(isRecord(baseTheme.colors) ? baseTheme.colors : {}), ...(isRecord(patch.colors) ? patch.colors : {}) },
    typography: {
      ...(isRecord(baseTheme.typography) ? baseTheme.typography : {}),
      ...(isRecord(patch.typography) ? patch.typography : {}),
    },
    radius: { ...(isRecord(baseTheme.radius) ? baseTheme.radius : {}), ...(isRecord(patch.radius) ? patch.radius : {}) },
    spacing: { ...(isRecord(baseTheme.spacing) ? baseTheme.spacing : {}), ...(isRecord(patch.spacing) ? patch.spacing : {}) },
    shadows: { ...(isRecord(baseTheme.shadows) ? baseTheme.shadows : {}), ...(isRecord(patch.shadows) ? patch.shadows : {}) },
    gradients: {
      ...(isRecord(baseTheme.gradients) ? baseTheme.gradients : {}),
      ...(isRecord(patch.gradients) ? patch.gradients : {}),
    },
    motion: patch.motion ?? baseTheme.motion,
  }
  return collectThemeDeclarations(merged, mapping).filter(([name, value]) => base.get(name) !== value)
}

function formatBlock(selectors: string, decls: Array<[string, string]>): string {
  const body = decls.map(([name, value]) => `  ${name}: ${value};`).join('\n')
  return `${selectors} {\n${body}\n}`
}

/**
 * Render CSS custom properties for web-master `data-theme`.
 * This is an in-memory projection, not a generated token file overlay.
 */
export function renderThemeContractCss(theme: unknown): string {
  assertThemeJsonIsCanonical(theme)
  const mapping = isRecord(theme.cssVariableMapping) ? theme.cssVariableMapping : {}
  const ids = assertIndustryPresets(theme)
  const base = theme.theme as Record<string, unknown>
  const dark = isRecord(theme.darkTheme) ? theme.darkTheme : {}
  const presets = theme.industryPresets as Record<string, unknown>
  const blocks = [
    formatBlock(
      ':root,\n:root[data-theme="default"],\n:root[data-theme="light"]',
      collectThemeDeclarations(base, mapping),
    ),
    formatBlock(':root[data-theme="dark"]', collectPatchDeclarations(base, dark, mapping)),
  ]
  for (const id of ids) {
    const preset = presets[id]
    if (!isRecord(preset)) {
      throw new MasterTemplateConsumerError(`industry preset "${id}" is missing.`)
    }
    blocks.push(formatBlock(`:root[data-theme="${id}"]`, collectPatchDeclarations(base, preset, mapping)))
  }
  return [
    '/* In-memory CSS from authored theme.json. Do not treat as a tokens.css overlay. */',
    ...blocks,
  ].join('\n\n') + '\n'
}

export function assertThemeContractCss(css: string): void {
  if (css.includes('SINGLE SOURCE OF TRUTH')) {
    throw new MasterTemplateConsumerError('tokens_css_claims_ssot')
  }
  const required = [
    '--color-primary',
    '--color-primary-foreground',
    '--color-background',
    '--color-foreground',
    '--color-muted',
    '--color-card',
    '--color-border',
    '--color-accent',
    '--font-family',
    '--spacing-md',
    '--radius-md',
    'data-theme="default"',
    'data-theme="light"',
    'data-theme="dark"',
  ]
  if (required.some((token) => !css.includes(token))) {
    throw new MasterTemplateConsumerError('theme contract CSS is missing required data-theme variables.')
  }
  if (css.includes('dentist')) {
    throw new MasterTemplateConsumerError('forbidden_vertical_preset')
  }
}
