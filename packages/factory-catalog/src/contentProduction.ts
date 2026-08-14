import { createHash } from 'node:crypto'
import type { LeadResearchPackage, SchemaVersion } from '@linksites/types'
import { assertLibraryConsumptionEvidence, type LibraryConsumptionEvidence } from './libraryConsumer'
import type { Revision2MaterializedWebsiteTemplate } from './revision2Materialization'
import type { TemplateId } from './templateIdentity'
import { assertValidWorkingContentPackage, computeWorkingContentChecksum, type WorkingContentPackage, type WorkingContentPage, type WorkingContentProvenance } from './workingContent'

export const CONTENT_PRODUCTION_SCHEMA_VERSION = { major: 1, minor: 0 } as const satisfies SchemaVersion
export const CONTENT_PRODUCTION_EXECUTOR_VERSION = 'w2-01-deterministic-adapter.v1' as const
const SHA256 = /^[a-f0-9]{64}$/
const PLACEHOLDER = /(?:\{\{|\}\}|\b(?:lorem|ipsum|example(?:\.com)?|demo(?:-?data)?|your business|TODO|TBD)\b)/i

export class ContentProductionError extends Error {
  constructor(message: string, public readonly code: 'invalid_input' | 'missing_required_fact' | 'untrusted_library' | 'media_policy' | 'quality_gate') { super(message); this.name = 'ContentProductionError' }
}

export interface ApprovedLeadReview { quote: string; author: string }
export interface ApprovedLeadMedia { assetId: string; source: string; sha256: string; licenseSpdx: string; altText: string; width: number; height: number; format: 'avif' | 'webp' | 'jpg' | 'png' }
export interface ApprovedLeadResearchFacts {
  schemaVersion: SchemaVersion; leadId: string; orgId: string; businessName: string; geography: string; services: string[]; credentials: string[]; reviews: ApprovedLeadReview[]; contact: { phone: string; email: string; address: string; website: string }; pricing: string; legalClaims: string[]; media: ApprovedLeadMedia[]
}
export interface TemplateBaselineSection { sectionId: string; componentId: string; copy: Record<string, unknown> }
export interface TemplateBaselinePage { pageId: string; route: string; sections: TemplateBaselineSection[] }
export interface TemplateMediaAsset extends ApprovedLeadMedia {}
export interface ApprovedTemplateAssetBundle { templateId: TemplateId; baselinePages: TemplateBaselinePage[]; media: TemplateMediaAsset[]; libraryAssetPath: string; libraryAssetSha256: string }
export interface MediaPolicy { allowedSourcePrefixes: string[]; allowedLicenseSpdx: string[]; maxWidth: number; maxHeight: number; allowedFormats: Array<ApprovedLeadMedia['format']>; requireTemplateMedia: boolean }
export interface ContentProductionEvidence { schemaVersion: SchemaVersion; executorVersion: typeof CONTENT_PRODUCTION_EXECUTOR_VERSION; inputIdempotencyKey: string; inputChecksum: string; outputChecksum: string; libraryRevision: string; libraryAssetPath: string; libraryAssetSha256: string; fieldMap: Array<{ output: string; input: string; classification: 'factual' | 'generated_copy' | 'media' }>; gates: Record<string, 'pass' | 'fail'> }
export interface ContentProductionResult { contentPackage: WorkingContentPackage; evidence: ContentProductionEvidence; informationArchitecture: { templateId: TemplateId; pages: TemplateBaselinePage[] }; selectedMedia: { assets: TemplateMediaAsset[]; provenance: WorkingContentProvenance[] } }
export type LibraryProductionEvidence = LibraryConsumptionEvidence | Revision2MaterializedWebsiteTemplate

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)
const nonEmpty = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0
const stable = (value: unknown): string => value === null || typeof value !== 'object' ? JSON.stringify(value) : Array.isArray(value) ? `[${value.map(stable).join(',')}]` : `{${Object.keys(value as Record<string, unknown>).sort().map((key) => `${JSON.stringify(key)}:${stable((value as Record<string, unknown>)[key])}`).join(',')}}`
const sha256 = (value: string): string => createHash('sha256').update(value, 'utf8').digest('hex')
const containsForbiddenToken = (value: unknown): boolean => typeof value === 'string' ? PLACEHOLDER.test(value) : Array.isArray(value) ? value.some(containsForbiddenToken) : isRecord(value) && Object.values(value).some(containsForbiddenToken)

function assertFacts(facts: unknown, lead: LeadResearchPackage): asserts facts is ApprovedLeadResearchFacts {
  const schema = isRecord(facts) && isRecord(facts.schemaVersion) ? facts.schemaVersion : null
  const contact = isRecord(facts) && isRecord(facts.contact) ? facts.contact : null
  if (!isRecord(facts) || schema?.major !== 1 || schema?.minor !== 0 || facts.orgId !== lead.org_id || facts.leadId !== lead.lead_id) throw new ContentProductionError('approved facts are not bound to the LeadResearchPackage', 'invalid_input')
  for (const [value, name] of [[facts.businessName, 'businessName'], [facts.geography, 'geography'], [facts.pricing, 'pricing'], [contact?.phone, 'contact.phone'], [contact?.email, 'contact.email'], [contact?.address, 'contact.address'], [contact?.website, 'contact.website']] as const) if (!nonEmpty(value)) throw new ContentProductionError(`missing required fact: ${name}`, 'missing_required_fact')
  for (const [value, name] of [[facts.services, 'services'], [facts.credentials, 'credentials'], [facts.legalClaims, 'legalClaims']] as const) if (!Array.isArray(value) || value.length === 0 || !value.every(nonEmpty)) throw new ContentProductionError(`${name} is incomplete`, 'missing_required_fact')
  if (!Array.isArray(facts.reviews) || facts.reviews.length === 0 || !facts.reviews.every((review) => isRecord(review) && nonEmpty(review.quote) && nonEmpty(review.author))) throw new ContentProductionError('reviews are incomplete', 'missing_required_fact')
  if (!Array.isArray(facts.media)) throw new ContentProductionError('media is invalid', 'media_policy')
}

function factValue(path: string, facts: ApprovedLeadResearchFacts): unknown { return path.split('.').reduce<unknown>((current, part) => isRecord(current) ? current[part] : undefined, facts) }
function replaceTokens(value: unknown, facts: ApprovedLeadResearchFacts, fieldMap: ContentProductionEvidence['fieldMap'], path: string): unknown {
  if (typeof value === 'string') return value.replace(/\{\{([a-zA-Z][a-zA-Z0-9.]*)\}\}/g, (_token, factPath: string) => { const resolved = factValue(factPath, facts); if (resolved === undefined || resolved === null || (typeof resolved === 'string' && !resolved.trim())) throw new ContentProductionError(`missing required fact for template token ${factPath}`, 'missing_required_fact'); fieldMap.push({ output: path, input: `facts.${factPath}`, classification: 'factual' }); return Array.isArray(resolved) ? resolved.join(', ') : String(resolved) })
  if (Array.isArray(value)) return value.map((item, index) => replaceTokens(item, facts, fieldMap, `${path}[${index}]`))
  if (isRecord(value)) return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, replaceTokens(child, facts, fieldMap, `${path}.${key}`)]))
  return value
}

export function produceWorkingContent(input: { lead: unknown; facts: unknown; template: ApprovedTemplateAssetBundle; library: LibraryProductionEvidence; mediaPolicy: MediaPolicy }): ContentProductionResult {
  if (!isRecord(input.lead)) throw new ContentProductionError('lead is invalid', 'invalid_input')
  const lead = input.lead as LeadResearchPackage
  assertFacts(input.facts, lead)
  const facts = input.facts as ApprovedLeadResearchFacts
  const libraryEntryId = 'reference' in input.library ? input.library.reference.entryId : input.library.entry.entryId
  const libraryAssetSha256 = 'reference' in input.library
    ? input.library.files[input.template.libraryAssetPath] ? sha256(input.library.files[input.template.libraryAssetPath]) : undefined
    : input.library.receipt.assetChecksums[input.template.libraryAssetPath]
  if (!('reference' in input.library)) assertLibraryConsumptionEvidence(input.library)
  if (!input.template.templateId || libraryEntryId !== input.template.templateId || libraryAssetSha256 !== input.template.libraryAssetSha256) throw new ContentProductionError('template baseline is not bound to the exact LiNKlibraries asset receipt', 'untrusted_library')
  if (input.template.baselinePages.length === 0 || input.template.baselinePages.some((page) => page.sections.length === 0)) throw new ContentProductionError('template baseline is incomplete', 'untrusted_library')
  const fieldMap: ContentProductionEvidence['fieldMap'] = []
  const copyProvenance: WorkingContentProvenance[] = []
  const pages: WorkingContentPage[] = input.template.baselinePages.map((page) => ({ pageId: page.pageId, route: page.route, sections: page.sections.map((section) => { const content = replaceTokens(section.copy, facts, fieldMap, `${page.route}/${section.sectionId}`) as Record<string, unknown>; copyProvenance.push({ claimId: `copy:${page.pageId}:${section.sectionId}`, kind: 'generated_copy', sourceReferences: [`library://${input.template.templateId}/baseline-copy`], statement: `Deterministic adaptation of the accepted Library baseline for ${page.pageId}.` }); return { sectionId: section.sectionId, componentId: section.componentId, content } }) }))
  const assets = [...input.template.media, ...facts.media]
  if (input.mediaPolicy.requireTemplateMedia && input.template.media.length === 0) throw new ContentProductionError('template requires media but the Library baseline contains none', 'media_policy')
  const seen = new Set<string>()
  for (const asset of assets) { if (seen.has(asset.sha256) || !SHA256.test(asset.sha256) || !nonEmpty(asset.altText) || asset.width <= 0 || asset.height <= 0 || asset.width > input.mediaPolicy.maxWidth || asset.height > input.mediaPolicy.maxHeight || !input.mediaPolicy.allowedFormats.includes(asset.format) || !input.mediaPolicy.allowedLicenseSpdx.includes(asset.licenseSpdx) || !input.mediaPolicy.allowedSourcePrefixes.some((prefix) => asset.source.startsWith(prefix))) throw new ContentProductionError(`media ${asset.assetId} is not permitted by the approved media policy`, 'media_policy'); seen.add(asset.sha256) }
  const mediaProvenance = assets.map((asset) => ({ claimId: `media:${asset.assetId}`, kind: 'media' as const, sourceReferences: [asset.source], statement: `Media ${asset.assetId} has an accepted checksum, license, and accessibility description.` }))
  const libraryRevision = 'reference' in input.library ? input.library.reference.releaseSourceCommitSha : input.library.receipt.libraryCommitSha
  const contentPackage: WorkingContentPackage = { schemaVersion: CONTENT_PRODUCTION_SCHEMA_VERSION, templateId: input.template.templateId, content: { pages }, assetRefs: assets.map(({ assetId, sha256: checksum, source }) => ({ assetId, sha256: checksum, source })), libraryRefs: [{ libraryId: libraryEntryId, sha: libraryRevision }], provenance: [...copyProvenance, ...mediaProvenance, { claimId: `facts:${facts.leadId}`, kind: 'factual_claim', sourceReferences: lead.research.sources, statement: `Factual fields are bound to approved research facts for ${facts.leadId}.` }] }
  assertValidWorkingContentPackage(contentPackage)
  if (pages.some((page) => containsForbiddenToken(page))) throw new ContentProductionError('produced content contains a forbidden placeholder/mock token', 'quality_gate')
  const inputChecksum = sha256(stable({ lead: input.lead, facts: input.facts, template: input.template, mediaPolicy: input.mediaPolicy, library: 'reference' in input.library ? input.library.reference : input.library.receipt }))
  return { contentPackage, evidence: { schemaVersion: CONTENT_PRODUCTION_SCHEMA_VERSION, executorVersion: CONTENT_PRODUCTION_EXECUTOR_VERSION, inputIdempotencyKey: lead.idempotency_key, inputChecksum, outputChecksum: computeWorkingContentChecksum(contentPackage), libraryRevision, libraryAssetPath: input.template.libraryAssetPath, libraryAssetSha256: input.template.libraryAssetSha256, fieldMap, gates: { schema: 'pass', required_pages: 'pass', factual_grounding: 'pass', media_provenance: 'pass', no_placeholders: 'pass', deterministic_checksum: 'pass' } }, informationArchitecture: { templateId: input.template.templateId, pages: structuredClone(input.template.baselinePages) }, selectedMedia: { assets: structuredClone(assets), provenance: mediaProvenance } }
}
