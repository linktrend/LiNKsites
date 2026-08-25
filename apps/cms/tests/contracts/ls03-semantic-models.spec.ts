import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { LS03_GENERATED_COLLECTION_SLUGS } from '../../src/generated/ls03-payload-types'
import { rejectImmutableUpdate } from '../../src/hooks/enforceImmutableRecord'
import {
  LS03_CANONICAL_COLLECTIONS,
  LS03_CAPABILITY_PLANS,
  LS03_DISPATCH_IDEMPOTENCY,
  LS03_PLAN_BUDGETS,
  SHA1_IDENTITY,
  assertDistinctProductAndServiceCollections,
} from '../../src/payload/ls03/semanticContract'
import {
  projectDeprecatedTemplateId,
  projectLegacyCaseStudy,
  projectLegacyOffer,
} from '../../src/payload/utils/legacyProjections'

const collectionsDir = join(dirname(fileURLToPath(import.meta.url)), '../../src/collections')

function collectionSource(fileName: string): string {
  return readFileSync(join(collectionsDir, fileName), 'utf8')
}

describe('LS-03 ISS-10 template adoption and entitlement snapshots', () => {
  it('registers immutable adoption and entitlement collections', () => {
    const adoptions = collectionSource('TemplateAdoptions.ts')
    const snapshots = collectionSource('EntitlementSnapshots.ts')
    expect(adoptions).toContain("slug: 'template-adoptions'")
    expect(snapshots).toContain("slug: 'entitlement-snapshots'")
    expect(adoptions).toContain('rejectImmutableUpdate')
    expect(snapshots).toContain('rejectImmutableUpdate')
    expect(typeof rejectImmutableUpdate).toBe('function')
  })

  it('keeps free-text template IDs as deprecated projections', () => {
    const projection = projectDeprecatedTemplateId('tmpl_hero')
    expect(projection.kind).toBe('deprecated-projection')
    expect(projection.templateId).toBe('tmpl_hero')
    expect(projection.canonicalCollection).toBe('template-adoptions')
    expect(collectionSource('SiteSettings.ts')).toContain('DEPRECATED projection of a free-text template ID')
  })

  it('pins the governed LS-03 dispatch idempotency key', () => {
    expect(LS03_DISPATCH_IDEMPOTENCY).toBe(
      'cursor-cloud-dispatch-v1:linksites-ls03-275-repair-base9da7197e',
    )
  })
})

describe('LS-03 ISS-11 semantic collections', () => {
  it('keeps Products and Services as distinct collections', () => {
    assertDistinctProductAndServiceCollections()
    const products = collectionSource('Products.ts')
    const services = collectionSource('Services.ts')
    expect(products).toContain("slug: 'products'")
    expect(services).toContain("slug: 'services'")
    expect(products).toContain("defaultValue: 'product'")
    expect(services).toContain("defaultValue: 'service'")
    expect(products).not.toContain("slug: 'services'")
    expect(services).not.toContain("slug: 'products'")
  })

  it('covers Results/Work, Articles, Videos, FAQ/Help, Team, Locations, Policies, Service Areas, and typed core settings', () => {
    expect(collectionSource('ResultsWork.ts')).toContain("slug: 'results-work'")
    expect(collectionSource('Articles.ts')).toContain("slug: 'articles'")
    expect(collectionSource('Videos.ts')).toContain("slug: 'videos'")
    expect(collectionSource('FAQPage.ts')).toContain("slug: 'faq-pages'")
    expect(collectionSource('HelpArticles.ts')).toContain("slug: 'help-articles'")
    expect(collectionSource('TeamMembers.ts')).toContain("slug: 'team-members'")
    expect(collectionSource('Locations.ts')).toContain("slug: 'locations'")
    expect(collectionSource('Policies.ts')).toContain("slug: 'policies'")
    expect(collectionSource('ServiceAreas.ts')).toContain("slug: 'service-areas'")
    expect(collectionSource('CoreSettings.ts')).toContain("slug: 'core-settings'")
    expect(collectionSource('Articles.ts')).toContain('provenanceFields')
    expect(collectionSource('Videos.ts')).toContain('provenanceFields')
    expect(collectionSource('FAQPage.ts')).toContain('provenanceFields')
    expect(collectionSource('HelpArticles.ts')).toContain('provenanceFields')
    expect(collectionSource('TeamMembers.ts')).toContain('provenanceFields')
    expect(collectionSource('Locations.ts')).toContain('provenanceFields')
  })

  it('projects Offers and Cases onto Products/Services and Results/Work', () => {
    expect(projectLegacyOffer('product')).toEqual({
      sourceCollection: 'offer-pages',
      targetCollection: 'products',
      semanticKind: 'product',
    })
    expect(projectLegacyOffer('service')).toEqual({
      sourceCollection: 'offer-pages',
      targetCollection: 'services',
      semanticKind: 'service',
    })
    expect(projectLegacyCaseStudy()).toEqual({
      sourceCollection: 'case-study-pages',
      targetCollection: 'results-work',
    })
    expect(collectionSource('OfferPage.ts')).toContain('DEPRECATED Offer projection')
    expect(collectionSource('CaseStudyPage.ts')).toContain('DEPRECATED Case projection')
  })

  it('pins commercial plans A/B/C/L', () => {
    expect(LS03_CAPABILITY_PLANS).toEqual(['A', 'B', 'C', 'L'])
    expect(LS03_PLAN_BUDGETS).toEqual({
      A: 30,
      B: 15,
      C: 6,
      L: 0,
    })
  })
})

describe('LS-03 generated Payload types', () => {
  it('closes generated collection slugs against the semantic contract', () => {
    expect([...LS03_GENERATED_COLLECTION_SLUGS].sort()).toEqual(
      [...Object.values(LS03_CANONICAL_COLLECTIONS)].sort(),
    )
  })

  it('rejects invalid SHA-1 identities fail-closed', () => {
    expect(SHA1_IDENTITY.test('not-a-sha1')).toBe(false)
    expect(SHA1_IDENTITY.test('0178894d6ce718bb7dff3c141892f82144e2d18c')).toBe(true)
  })
})
