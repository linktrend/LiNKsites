import {
  LS03_CANONICAL_COLLECTIONS,
  LS03_DEPRECATED_PROJECTION_COLLECTIONS,
  isDeprecatedTemplateIdProjection,
} from '@/payload/ls03/semanticContract'

export type LegacyOfferKind = 'product' | 'service'

export type DeprecatedTemplateProjection = {
  kind: 'deprecated-projection'
  templateId: string
  adoptionRequired: true
  canonicalCollection: typeof LS03_CANONICAL_COLLECTIONS.templateAdoptions
}

export type OfferCompatibilityProjection = {
  sourceCollection: typeof LS03_DEPRECATED_PROJECTION_COLLECTIONS.offerPages
  targetCollection: typeof LS03_CANONICAL_COLLECTIONS.products | typeof LS03_CANONICAL_COLLECTIONS.services
  semanticKind: LegacyOfferKind
}

export type CaseCompatibilityProjection = {
  sourceCollection: typeof LS03_DEPRECATED_PROJECTION_COLLECTIONS.caseStudyPages
  targetCollection: typeof LS03_CANONICAL_COLLECTIONS.resultsWork
}

export function projectDeprecatedTemplateId(templateId: unknown): DeprecatedTemplateProjection {
  if (!isDeprecatedTemplateIdProjection(templateId)) {
    throw new Error('Free-text template IDs are deprecated projections and require a non-empty legacy value.')
  }
  return {
    kind: 'deprecated-projection',
    templateId,
    adoptionRequired: true,
    canonicalCollection: LS03_CANONICAL_COLLECTIONS.templateAdoptions,
  }
}

export function projectLegacyOffer(kind: LegacyOfferKind): OfferCompatibilityProjection {
  return {
    sourceCollection: LS03_DEPRECATED_PROJECTION_COLLECTIONS.offerPages,
    targetCollection:
      kind === 'product' ? LS03_CANONICAL_COLLECTIONS.products : LS03_CANONICAL_COLLECTIONS.services,
    semanticKind: kind,
  }
}

export function projectLegacyCaseStudy(): CaseCompatibilityProjection {
  return {
    sourceCollection: LS03_DEPRECATED_PROJECTION_COLLECTIONS.caseStudyPages,
    targetCollection: LS03_CANONICAL_COLLECTIONS.resultsWork,
  }
}

export function assertOfferIsNotCanonicalProductOrService(): void {
  const offers: string = LS03_DEPRECATED_PROJECTION_COLLECTIONS.offerPages
  const products: string = LS03_CANONICAL_COLLECTIONS.products
  const services: string = LS03_CANONICAL_COLLECTIONS.services
  if (offers === products || offers === services) {
    throw new Error('Offers must remain a deprecated projection, not the canonical Product or Service collection.')
  }
}
