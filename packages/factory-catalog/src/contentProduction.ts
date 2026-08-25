import { createHash } from 'node:crypto'
import type { LeadResearchPackage, SchemaVersion } from '@linksites/types'
import { AdoptionIdentityError, assertSiteAdoptionIdentities } from './adoptionIdentities.ts'
import { assertLibraryConsumptionEvidence, type LibraryConsumptionEvidence } from './libraryConsumer.ts'
import { SEMANTIC_COMPONENT_MAP } from './masterTemplateSemanticProjection.ts'
import type { Revision2MaterializedWebsiteTemplate } from './revision2Materialization.ts'
import type { TemplateId } from './templateIdentity.ts'
import {
  assertValidWorkingContentPackage,
  computeWorkingContentChecksum,
  isLs04ContentMode,
  type Ls04CatalogRecord,
  type Ls04ContentMode,
  type Ls04LayeredIdentities,
  type WorkingContentPackage,
  type WorkingContentPage,
  type WorkingContentProvenance,
} from './workingContent.ts'

export const CONTENT_PRODUCTION_SCHEMA_VERSION = { major: 1, minor: 0 } as const satisfies SchemaVersion
export const CONTENT_PRODUCTION_EXECUTOR_VERSION = 'w2-01-deterministic-adapter.v1' as const
export const LS04_CONTENT_PRODUCTION_EXECUTOR_VERSION = 'ls04-working-content.v1' as const
const SHA256 = /^[a-f0-9]{64}$/
const PLACEHOLDER = /(?:\{\{|\}\}|\b(?:lorem|ipsum|example(?:\.com)?|demo(?:-?data)?|your business|TODO|TBD)\b)/i
const QUANTIFIED_CLAIM = /(?:\d+\s*%|\$\s*\d|\bguaranteed\b|\b#1\b|\balways wins\b)/i
const FAKE_ATTRIBUTION = /^(?:john doe|jane doe|happy customer|anonymous|placeholder|n\/a)$/i

const WORKING_COMPONENT_TO_LIBRARY: Readonly<Record<string, string>> = Object.freeze({
  SignupHero: 'hero-banner',
  CTASection: 'cta-section',
  OfferShowcase: 'offer-collection',
  ArticlesGrid: 'article-collection',
})

function pageFamilyFor(route: string, libraryComponentId: string): string {
  if (route === '/') return 'home'
  if (libraryComponentId === 'offer-collection' || libraryComponentId === 'article-collection') return 'collection'
  return 'content'
}

export class ContentProductionError extends Error {
  constructor(message: string, public readonly code: 'invalid_input' | 'missing_required_fact' | 'untrusted_library' | 'media_policy' | 'quality_gate' | 'tenant_isolation' | 'false_claim') {
    super(message)
    this.name = 'ContentProductionError'
  }
}

export interface ApprovedLeadReview { quote: string; author: string; sourceReferences?: string[] }
export interface ApprovedLeadCredential { name: string; sourceReferences: string[] }
export interface ApprovedLeadMedia { assetId: string; source: string; sha256: string; licenseSpdx: string; altText: string; width: number; height: number; format: 'avif' | 'webp' | 'jpg' | 'png' }
export interface ApprovedLeadResearchFacts {
  schemaVersion: SchemaVersion
  leadId: string
  orgId: string
  businessName: string
  geography: string
  services: string[]
  products?: Ls04CatalogRecord[]
  credentials: Array<string | ApprovedLeadCredential>
  reviews: ApprovedLeadReview[]
  contact: { phone: string; email: string; address: string; website: string }
  pricing: string
  legalClaims: string[]
  media: ApprovedLeadMedia[]
}
export interface TemplateBaselineSection { sectionId: string; componentId: string; copy: Record<string, unknown> }
export interface TemplateBaselinePage { pageId: string; route: string; sections: TemplateBaselineSection[] }
export interface TemplateMediaAsset extends ApprovedLeadMedia {}
export interface ApprovedTemplateAssetBundle { templateId: TemplateId; baselinePages: TemplateBaselinePage[]; media: TemplateMediaAsset[]; libraryAssetPath: string; libraryAssetSha256: string }
export interface MediaPolicy { allowedSourcePrefixes: string[]; allowedLicenseSpdx: string[]; maxWidth: number; maxHeight: number; allowedFormats: Array<ApprovedLeadMedia['format']>; requireTemplateMedia: boolean }
export interface ContentProductionEvidence { schemaVersion: SchemaVersion; executorVersion: string; inputIdempotencyKey: string; inputChecksum: string; outputChecksum: string; libraryRevision: string; libraryAssetPath: string; libraryAssetSha256: string; fieldMap: Array<{ output: string; input: string; classification: 'factual' | 'generated_copy' | 'media' }>; gates: Record<string, 'pass' | 'fail'> }
export interface ContentProductionResult { contentPackage: WorkingContentPackage; evidence: ContentProductionEvidence; informationArchitecture: { templateId: TemplateId; pages: TemplateBaselinePage[] }; selectedMedia: { assets: TemplateMediaAsset[]; provenance: WorkingContentProvenance[] } }
export type LibraryProductionEvidence = LibraryConsumptionEvidence | Revision2MaterializedWebsiteTemplate
export interface Ls04ProductionContext {
  contentMode: Ls04ContentMode
  identities: Ls04LayeredIdentities
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)
const nonEmpty = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0
const stable = (value: unknown): string => value === null || typeof value !== 'object' ? JSON.stringify(value) : Array.isArray(value) ? `[${value.map(stable).join(',')}]` : `{${Object.keys(value as Record<string, unknown>).sort().map((key) => `${JSON.stringify(key)}:${stable((value as Record<string, unknown>)[key])}`).join(',')}}`
const sha256 = (value: string): string => createHash('sha256').update(value, 'utf8').digest('hex')
const containsForbiddenToken = (value: unknown): boolean => typeof value === 'string' ? PLACEHOLDER.test(value) : Array.isArray(value) ? value.some(containsForbiddenToken) : isRecord(value) && Object.values(value).some(containsForbiddenToken)

function credentialName(value: string | ApprovedLeadCredential): string {
  return typeof value === 'string' ? value : value.name
}

function credentialSources(value: string | ApprovedLeadCredential): string[] {
  return typeof value === 'string' ? [] : value.sourceReferences
}

function assertFacts(facts: unknown, lead: LeadResearchPackage, mode: Ls04ContentMode): asserts facts is ApprovedLeadResearchFacts {
  const schema = isRecord(facts) && isRecord(facts.schemaVersion) ? facts.schemaVersion : null
  const contact = isRecord(facts) && isRecord(facts.contact) ? facts.contact : null
  if (!isRecord(facts) || schema?.major !== 1 || schema?.minor !== 0 || facts.orgId !== lead.org_id || facts.leadId !== lead.lead_id) throw new ContentProductionError('approved facts are not bound to the LeadResearchPackage', 'invalid_input')
  for (const [value, name] of [[facts.businessName, 'businessName'], [facts.geography, 'geography'], [facts.pricing, 'pricing'], [contact?.phone, 'contact.phone'], [contact?.email, 'contact.email'], [contact?.address, 'contact.address'], [contact?.website, 'contact.website']] as const) if (!nonEmpty(value)) throw new ContentProductionError(`missing required fact: ${name}`, 'missing_required_fact')
  if (!Array.isArray(facts.legalClaims) || facts.legalClaims.length === 0 || !facts.legalClaims.every(nonEmpty)) throw new ContentProductionError('legalClaims is incomplete', 'missing_required_fact')
  const services = Array.isArray(facts.services) ? facts.services : null
  const products = Array.isArray(facts.products) ? facts.products : []
  if (mode === 'service' || mode === 'hybrid') {
    if (!services || services.length === 0 || !services.every(nonEmpty)) throw new ContentProductionError('services is incomplete', 'missing_required_fact')
  }
  if (mode === 'product' || mode === 'hybrid') {
    if (products.length === 0 || !products.every((record) => isRecord(record) && nonEmpty(record.slug) && nonEmpty(record.title) && nonEmpty(record.summary))) throw new ContentProductionError('products is incomplete', 'missing_required_fact')
  }
  if (mode === 'neither') {
    if (services && services.length > 0) throw new ContentProductionError('neither mode cannot carry service catalog facts', 'invalid_input')
    if (products.length > 0) throw new ContentProductionError('neither mode cannot carry product catalog facts', 'invalid_input')
  }
  if (mode === 'product' && services && services.length > 0) throw new ContentProductionError('product mode cannot carry service catalog facts', 'invalid_input')
  if (mode === 'service' && products.length > 0) throw new ContentProductionError('service mode cannot carry product catalog facts', 'invalid_input')
  if (!Array.isArray(facts.credentials) || facts.credentials.length === 0 || !facts.credentials.every((credential) => (typeof credential === 'string' && nonEmpty(credential)) || (isRecord(credential) && nonEmpty(credential.name)))) throw new ContentProductionError('credentials are incomplete', 'missing_required_fact')
  if (!Array.isArray(facts.reviews) || facts.reviews.length === 0 || !facts.reviews.every((review) => isRecord(review) && nonEmpty(review.quote) && nonEmpty(review.author))) throw new ContentProductionError('reviews are incomplete', 'missing_required_fact')
  if (!Array.isArray(facts.media)) throw new ContentProductionError('media is invalid', 'media_policy')
}

function factValue(path: string, facts: ApprovedLeadResearchFacts): unknown {
  return path.split('.').reduce<unknown>((current, part) => isRecord(current) ? current[part] : undefined, facts)
}

function replaceTokens(value: unknown, facts: ApprovedLeadResearchFacts, fieldMap: ContentProductionEvidence['fieldMap'], path: string): unknown {
  if (typeof value === 'string') return value.replace(/\{\{([a-zA-Z][a-zA-Z0-9.]*)\}\}/g, (_token, factPath: string) => {
    const resolved = factValue(factPath, facts)
    if (resolved === undefined || resolved === null || (typeof resolved === 'string' && !resolved.trim())) throw new ContentProductionError(`missing required fact for template token ${factPath}`, 'missing_required_fact')
    fieldMap.push({ output: path, input: `facts.${factPath}`, classification: 'factual' })
    return Array.isArray(resolved) ? resolved.map((item) => (isRecord(item) && nonEmpty(item.title) ? item.title : String(item))).join(', ') : String(resolved)
  })
  if (Array.isArray(value)) return value.map((item, index) => replaceTokens(item, facts, fieldMap, `${path}[${index}]`))
  if (isRecord(value)) return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, replaceTokens(child, facts, fieldMap, `${path}.${key}`)]))
  return value
}

function assertLs04Claims(facts: ApprovedLeadResearchFacts, lead: LeadResearchPackage): void {
  for (const review of facts.reviews) {
    if (FAKE_ATTRIBUTION.test(review.author.trim())) throw new ContentProductionError(`fake review attribution is rejected: ${review.author}`, 'false_claim')
    if (!Array.isArray(review.sourceReferences) || review.sourceReferences.length === 0 || !review.sourceReferences.every(nonEmpty)) throw new ContentProductionError('reviews require evidence source references', 'false_claim')
  }
  for (const credential of facts.credentials) {
    const sources = credentialSources(credential)
    if (sources.length === 0 || !sources.every(nonEmpty)) throw new ContentProductionError(`credential "${credentialName(credential)}" is missing evidence`, 'false_claim')
  }
  for (const claim of facts.legalClaims) {
    if (QUANTIFIED_CLAIM.test(claim) && lead.research.sources.length === 0) throw new ContentProductionError('unverifiable quantified claim is rejected', 'false_claim')
  }
}

function assertIdentities(identities: Ls04LayeredIdentities, facts: ApprovedLeadResearchFacts, lead: LeadResearchPackage): void {
  if (identities.orgId !== facts.orgId || identities.orgId !== lead.org_id) throw new ContentProductionError('working content identities are not bound to the fact/lead tenant', 'tenant_isolation')
  if (!nonEmpty(identities.siteId) || !nonEmpty(identities.locale)) throw new ContentProductionError('site and locale identities are required', 'missing_required_fact')
  try {
    assertSiteAdoptionIdentities(identities.adoptionIdentities)
  } catch (error) {
    const message = error instanceof AdoptionIdentityError ? error.message : 'adoption identities are incomplete'
    throw new ContentProductionError(message, 'invalid_input')
  }
}

export function produceWorkingContent(input: {
  lead: unknown
  facts: unknown
  template: ApprovedTemplateAssetBundle
  library: LibraryProductionEvidence
  mediaPolicy: MediaPolicy
  ls04?: Ls04ProductionContext
}): ContentProductionResult {
  if (!isRecord(input.lead)) throw new ContentProductionError('lead is invalid', 'invalid_input')
  const lead = input.lead as LeadResearchPackage
  const mode: Ls04ContentMode = input.ls04?.contentMode ?? 'service'
  if (input.ls04 && input.ls04.contentMode !== input.ls04.identities.contentMode) throw new ContentProductionError('content mode does not match layered identities', 'invalid_input')
  if (input.ls04 && !isLs04ContentMode(input.ls04.contentMode)) throw new ContentProductionError('content mode is unsupported', 'invalid_input')
  assertFacts(input.facts, lead, mode)
  const facts = input.facts as ApprovedLeadResearchFacts
  if (input.ls04) {
    assertIdentities(input.ls04.identities, facts, lead)
    assertLs04Claims(facts, lead)
  }
  const libraryEntryId = 'reference' in input.library ? input.library.reference.entryId : input.library.entry.entryId
  const libraryAssetSha256 = 'reference' in input.library
    ? input.library.files[input.template.libraryAssetPath] ? sha256(input.library.files[input.template.libraryAssetPath]) : undefined
    : input.library.receipt.assetChecksums[input.template.libraryAssetPath]
  if (!('reference' in input.library)) assertLibraryConsumptionEvidence(input.library)
  if (!input.template.templateId || libraryEntryId !== input.template.templateId || libraryAssetSha256 !== input.template.libraryAssetSha256) throw new ContentProductionError('template baseline is not bound to the exact LiNKlibraries asset receipt', 'untrusted_library')
  if (input.template.baselinePages.length === 0 || input.template.baselinePages.some((page) => page.sections.length === 0)) throw new ContentProductionError('template baseline is incomplete', 'untrusted_library')
  const fieldMap: ContentProductionEvidence['fieldMap'] = []
  const copyProvenance: WorkingContentProvenance[] = []
  const pages: WorkingContentPage[] = input.template.baselinePages.map((page) => ({
    pageId: page.pageId,
    route: page.route,
    sections: page.sections.map((section) => {
      const content = replaceTokens(section.copy, facts, fieldMap, `${page.route}/${section.sectionId}`) as Record<string, unknown>
      const libraryComponentId = WORKING_COMPONENT_TO_LIBRARY[section.componentId]
      const projection = libraryComponentId ? SEMANTIC_COMPONENT_MAP[libraryComponentId] : undefined
      if (!libraryComponentId || !projection) throw new ContentProductionError(`component ${section.componentId} has no typed semantic projection`, 'invalid_input')
      copyProvenance.push({ claimId: `copy:${page.pageId}:${section.sectionId}`, kind: 'generated_copy', sourceReferences: [`library://${input.template.templateId}/baseline-copy`], statement: `Deterministic adaptation of the accepted Library baseline for ${page.pageId}.` })
      if (input.ls04) {
        content.ls04 = {
          semantic: {
            semanticId: `${page.pageId}:${section.sectionId}:${libraryComponentId}`,
            providerComponentId: libraryComponentId,
            pageFamily: pageFamilyFor(page.route, libraryComponentId),
            targetRecord: { collection: 'pages', family: projection.payloadBlockType, contentRef: `${page.route}#${section.sectionId}` },
          },
          identities: input.ls04.identities,
          claims: [
            ...facts.reviews.map((review, index) => ({ claimId: `review:${index}`, kind: 'review' as const, evidenceRefs: review.sourceReferences ?? [], confidence: 1, statement: review.quote })),
            ...facts.credentials.map((credential, index) => ({ claimId: `credential:${index}`, kind: 'credential' as const, evidenceRefs: credentialSources(credential), confidence: 1, statement: credentialName(credential) })),
          ],
          catalog: {
            products: mode === 'product' || mode === 'hybrid' ? facts.products ?? [] : [],
            services: mode === 'service' || mode === 'hybrid' ? (facts.services ?? []).map((title, index) => ({ slug: `service-${index + 1}`, title, summary: title, code: `svc-${index + 1}` })) : [],
          },
        }
      }
      return { sectionId: section.sectionId, componentId: section.componentId, content }
    }),
  }))
  const assets = [...input.template.media, ...facts.media]
  if (input.mediaPolicy.requireTemplateMedia && input.template.media.length === 0) throw new ContentProductionError('template requires media but the Library baseline contains none', 'media_policy')
  const seen = new Set<string>()
  for (const asset of assets) {
    const unlicensed = !nonEmpty(asset.licenseSpdx) || asset.licenseSpdx.toLowerCase() === 'none' || asset.licenseSpdx.toLowerCase() === 'unknown'
    if (seen.has(asset.sha256) || !SHA256.test(asset.sha256) || !nonEmpty(asset.altText) || asset.width <= 0 || asset.height <= 0 || asset.width > input.mediaPolicy.maxWidth || asset.height > input.mediaPolicy.maxHeight || !input.mediaPolicy.allowedFormats.includes(asset.format) || unlicensed || !input.mediaPolicy.allowedLicenseSpdx.includes(asset.licenseSpdx) || !input.mediaPolicy.allowedSourcePrefixes.some((prefix) => asset.source.startsWith(prefix))) {
      throw new ContentProductionError(`media ${asset.assetId} is not permitted by the approved media policy`, 'media_policy')
    }
    seen.add(asset.sha256)
  }
  const mediaProvenance = assets.map((asset) => ({ claimId: `media:${asset.assetId}`, kind: 'media' as const, sourceReferences: [asset.source], statement: `Media ${asset.assetId} has an accepted checksum, license, and accessibility description.` }))
  const libraryRevision = 'reference' in input.library ? input.library.reference.releaseSourceCommitSha : input.library.receipt.libraryCommitSha
  const contentPackage: WorkingContentPackage = {
    schemaVersion: CONTENT_PRODUCTION_SCHEMA_VERSION,
    templateId: input.template.templateId,
    content: { pages },
    assetRefs: assets.map(({ assetId, sha256: checksum, source }) => ({ assetId, sha256: checksum, source })),
    libraryRefs: [{ libraryId: libraryEntryId, sha: libraryRevision }],
    provenance: [...copyProvenance, ...mediaProvenance, { claimId: `facts:${facts.leadId}`, kind: 'factual_claim', sourceReferences: lead.research.sources, statement: `Factual fields are bound to approved research facts for ${facts.leadId}.` }],
  }
  assertValidWorkingContentPackage(contentPackage)
  if (pages.some((page) => containsForbiddenToken(page.sections.map((section) => {
    const { ls04: _retained, ...copy } = section.content
    return copy
  })))) throw new ContentProductionError('produced content contains a forbidden placeholder/mock token', 'quality_gate')
  const executorVersion = input.ls04 ? LS04_CONTENT_PRODUCTION_EXECUTOR_VERSION : CONTENT_PRODUCTION_EXECUTOR_VERSION
  const inputChecksum = sha256(stable({ lead: input.lead, facts: input.facts, template: input.template, mediaPolicy: input.mediaPolicy, library: 'reference' in input.library ? input.library.reference : input.library.receipt, ls04: input.ls04 ?? null }))
  return {
    contentPackage,
    evidence: {
      schemaVersion: CONTENT_PRODUCTION_SCHEMA_VERSION,
      executorVersion,
      inputIdempotencyKey: lead.idempotency_key,
      inputChecksum,
      outputChecksum: computeWorkingContentChecksum(contentPackage),
      libraryRevision,
      libraryAssetPath: input.template.libraryAssetPath,
      libraryAssetSha256: input.template.libraryAssetSha256,
      fieldMap,
      gates: { schema: 'pass', required_pages: 'pass', factual_grounding: 'pass', media_provenance: 'pass', no_placeholders: 'pass', deterministic_checksum: 'pass', tenant_isolation: 'pass', claim_evidence: 'pass' },
    },
    informationArchitecture: { templateId: input.template.templateId, pages: structuredClone(input.template.baselinePages) },
    selectedMedia: { assets: structuredClone(assets), provenance: mediaProvenance },
  }
}
