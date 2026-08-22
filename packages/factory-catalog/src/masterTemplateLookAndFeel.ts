/**
 * LiNKsites look-and-feel composition for mapped master-template pages.
 *
 * Reuses the 186 semantic map. Distinct sections keep distinct regions —
 * never flatten everything to hero. Unknown semantic IDs fail closed.
 * This is inspectable draft presentation, not production admission.
 */
import { MasterTemplateConsumerError } from './masterTemplatePin.ts'
import {
  SEMANTIC_COMPONENT_MAP,
  type ProjectedMasterTemplatePage,
  type ProjectedPayloadBlock,
} from './masterTemplateSemanticProjection.ts'

export const LOOK_AND_FEEL_REGIONS = [
  'hero',
  'features',
  'cta',
  'prose',
  'form',
  'collection',
  'media',
  'proof',
  'shell',
  'pricing',
] as const

export type LookAndFeelRegion = (typeof LOOK_AND_FEEL_REGIONS)[number]

export interface StyledSurface {
  background: string
  color: string
  padding: string
  radius: string
}

export interface StyledCopy {
  eyebrow?: string
  heading?: string
  body?: string
  items: Array<{ title: string; description?: string }>
  action?: { label: string; href: string }
}

export interface StyledSection {
  id: string
  libraryComponentId: string
  reactSymbol: string
  payloadBlockType: string
  region: LookAndFeelRegion
  surface: StyledSurface
  copy: StyledCopy
}

export interface StyledMasterTemplatePage {
  archetypeId: ProjectedMasterTemplatePage['archetypeId']
  title: string
  slug: string
  composition: 'marketing-shell'
  chrome: { header: true; footer: true; newsletter: boolean }
  sections: StyledSection[]
  site: ProjectedMasterTemplatePage['site']
}

const REGION_BY_COMPONENT: Readonly<Record<string, LookAndFeelRegion>> = Object.freeze({
  action: 'cta',
  'newsletter-capture': 'cta',
  'article-collection': 'collection',
  'cta-section': 'cta',
  'case-collection': 'collection',
  'media-background': 'media',
  'offer-collection': 'collection',
  'feature-list': 'features',
  'pricing-table': 'pricing',
  'pricing-preview': 'pricing',
  'scroll-hint': 'shell',
  'hero-banner': 'hero',
  'social-proof': 'proof',
  'solution-overview': 'features',
  'token-background': 'media',
  'rich-text': 'prose',
  'site-header': 'shell',
  'site-footer': 'shell',
  'contact-form': 'form',
  'location-list': 'collection',
  'map-embed': 'media',
})

const SURFACE_BY_REGION: Readonly<Record<LookAndFeelRegion, StyledSurface>> = Object.freeze({
  hero: {
    background: 'var(--gradient-hero)',
    color: 'var(--color-brand-foreground)',
    padding: 'var(--spacing-3xl)',
    radius: '0px',
  },
  features: {
    background: 'var(--color-background)',
    color: 'var(--color-foreground)',
    padding: 'var(--spacing-2xl)',
    radius: 'var(--radius-lg)',
  },
  cta: {
    background: 'var(--gradient-primary)',
    color: 'var(--color-primary-foreground)',
    padding: 'var(--spacing-2xl)',
    radius: 'var(--radius-xl)',
  },
  prose: {
    background: 'var(--color-card)',
    color: 'var(--color-card-foreground)',
    padding: 'var(--spacing-2xl)',
    radius: 'var(--radius-md)',
  },
  form: {
    background: 'var(--color-muted)',
    color: 'var(--color-foreground)',
    padding: 'var(--spacing-2xl)',
    radius: 'var(--radius-lg)',
  },
  collection: {
    background: 'var(--color-muted)',
    color: 'var(--color-foreground)',
    padding: 'var(--spacing-2xl)',
    radius: 'var(--radius-lg)',
  },
  media: {
    background: 'var(--gradient-secondary)',
    color: 'var(--color-secondary-foreground)',
    padding: 'var(--spacing-xl)',
    radius: 'var(--radius-md)',
  },
  proof: {
    background: 'var(--color-card)',
    color: 'var(--color-card-foreground)',
    padding: 'var(--spacing-2xl)',
    radius: 'var(--radius-lg)',
  },
  shell: {
    background: 'var(--color-background)',
    color: 'var(--color-foreground)',
    padding: 'var(--spacing-md)',
    radius: '0px',
  },
  pricing: {
    background: 'var(--color-background)',
    color: 'var(--color-foreground)',
    padding: 'var(--spacing-2xl)',
    radius: 'var(--radius-lg)',
  },
})

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined
}

function resolveHref(data: Record<string, unknown>, locale: string): { label: string; href: string } | undefined {
  const action = isRecord(data.primaryAction)
    ? data.primaryAction
    : isRecord(data.primary)
      ? data.primary
      : isRecord(data.cta)
        ? data.cta
        : undefined
  const label = action ? asString(action.label) : asString(data.ctaLabel)
  const slug = action ? asString(action.targetPageSlug) : undefined
  const url = action ? asString(action.target) ?? asString(action.url) : asString(data.ctaUrl)
  if (!label) return undefined
  if (url) return { label, href: url }
  if (slug) return { label, href: `/${locale}/${slug}` }
  return { label, href: `/${locale}` }
}

function readItems(data: Record<string, unknown>): Array<{ title: string; description?: string }> {
  const raw = Array.isArray(data.features)
    ? data.features
    : Array.isArray(data.items)
      ? data.items
      : []
  return raw.flatMap((item) => {
    if (!isRecord(item)) return []
    const title = asString(item.title)
    if (!title) return []
    return [{ title, description: asString(item.description) ?? asString(item.summary) }]
  })
}

export function resolveLookAndFeelRegion(libraryComponentId: string): LookAndFeelRegion {
  const region = REGION_BY_COMPONENT[libraryComponentId]
  if (!region) {
    throw new MasterTemplateConsumerError(
      `Unmapped required Library component ID "${libraryComponentId}"; fail closed.`,
    )
  }
  return region
}

export function styleProjectedBlock(
  block: ProjectedPayloadBlock,
  locale: string,
): StyledSection {
  if (!SEMANTIC_COMPONENT_MAP[block.libraryComponentId]) {
    throw new MasterTemplateConsumerError(
      `Unmapped required Library component ID "${block.libraryComponentId}"; fail closed.`,
    )
  }
  const region = resolveLookAndFeelRegion(block.libraryComponentId)
  const data = isRecord(block.data) ? block.data : {}
  return {
    id: block.id,
    libraryComponentId: block.libraryComponentId,
    reactSymbol: block.reactSymbol,
    payloadBlockType: block.blockType,
    region,
    surface: SURFACE_BY_REGION[region],
    copy: {
      eyebrow: asString(data.eyebrow) ?? asString(data.label),
      heading: asString(data.heading) ?? asString(data.title),
      body: asString(data.description) ?? asString(data.body),
      items: readItems(data),
      action: resolveHref(data, locale),
    },
  }
}

export function composeMasterTemplateLookAndFeel(
  page: ProjectedMasterTemplatePage,
): StyledMasterTemplatePage {
  const sections = page.blocks.map((block) => styleProjectedBlock(block, page.site.locale))
  const regions = new Set(sections.map((section) => section.region))
  if (sections.length > 1 && regions.size === 1 && regions.has('hero')) {
    throw new MasterTemplateConsumerError(
      'Refusing all-sections-to-hero look-and-feel; distinct sections must keep distinct regions.',
    )
  }
  return {
    archetypeId: page.archetypeId,
    title: page.title,
    slug: page.slug,
    composition: 'marketing-shell',
    chrome: {
      header: true,
      footer: true,
      newsletter: page.archetypeId !== 'home',
    },
    sections,
    site: page.site,
  }
}
