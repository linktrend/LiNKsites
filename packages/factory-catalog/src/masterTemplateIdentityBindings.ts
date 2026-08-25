/** LS-05 consumer-owned candidate/adoption/adapter/Payload/effective bindings. */
import { createHash } from 'node:crypto'
import { FROZEN_CANDIDATE_SHA, FROZEN_SOURCE_RELEASE_SHA, FROZEN_SOURCE_RELEASE_TREE_SHA, FROZEN_TREE_SHA } from './libraryProviderClient.ts'
import { MASTER_TEMPLATE_PIN } from './masterTemplatePin.ts'
import { MASTER_TEMPLATE_ADAPTER_ID, MASTER_TEMPLATE_ADAPTER_MAPPING_DIGEST, MASTER_TEMPLATE_ADAPTER_VERSION } from './masterTemplateVersionedAdapter.ts'

const SHA1 = /^[a-f0-9]{40}$/
const canonical = (value: unknown): string => value === null || typeof value !== 'object' ? JSON.stringify(value) : Array.isArray(value) ? `[${value.map(canonical).join(',')}]` : `{${Object.keys(value as Record<string, unknown>).sort().map((key) => `${JSON.stringify(key)}:${canonical((value as Record<string, unknown>)[key])}`).join(',')}}`
const digest = (value: unknown): string => createHash('sha1').update(canonical(value), 'utf8').digest('hex')

export type MasterTemplateIdentityBindings = Readonly<{
  candidate: Readonly<{ repository: string; entryId: string; version: string; providerCommitSha: string; providerTreeSha: string; sourceReleaseCommitSha: string; sourceReleaseTreeSha: string; artifactTreeSha1: string }>
  adoption: Readonly<{ siteId: string; locale: string; payloadStatus: 'draft' | 'published'; adoptionId: string }>
  adapter: Readonly<{ id: typeof MASTER_TEMPLATE_ADAPTER_ID; version: typeof MASTER_TEMPLATE_ADAPTER_VERSION; mappingDigest: string; identity: string }>
  payload: Readonly<{ siteId: string; locale: string; documentIds: readonly string[]; projectionDigest: string }>
  effective: string
}>

export class MasterTemplateIdentityError extends Error {
  constructor(message: string) { super(message); this.name = 'MasterTemplateIdentityError' }
}

function requireSha(value: unknown, label: string): string {
  if (typeof value !== 'string' || !SHA1.test(value)) throw new MasterTemplateIdentityError(`${label} must be an exact lowercase SHA-1`)
  return value
}

export function bindMasterTemplateIdentities(input: Readonly<{ candidate: MasterTemplateIdentityBindings['candidate']; adoption: Omit<MasterTemplateIdentityBindings['adoption'], 'adoptionId'>; payload: Omit<MasterTemplateIdentityBindings['payload'], 'projectionDigest'> & { projectionDigest?: string } }>): MasterTemplateIdentityBindings {
  const candidate = input.candidate
  for (const key of ['providerCommitSha', 'providerTreeSha', 'sourceReleaseCommitSha', 'sourceReleaseTreeSha', 'artifactTreeSha1'] as const) requireSha(candidate[key], `candidate.${key}`)
  if (candidate.repository !== 'https://github.com/linktrend/LiNKlibraries.git' || candidate.entryId !== 'master-template-type-1' || candidate.version !== '2.0.0-a1.1') throw new MasterTemplateIdentityError('candidate does not identify the pinned master template A1')
  if (candidate.providerCommitSha !== FROZEN_CANDIDATE_SHA || candidate.providerTreeSha !== FROZEN_TREE_SHA || candidate.sourceReleaseCommitSha !== FROZEN_SOURCE_RELEASE_SHA || candidate.sourceReleaseTreeSha !== FROZEN_SOURCE_RELEASE_TREE_SHA || candidate.artifactTreeSha1 !== MASTER_TEMPLATE_PIN.artifactTreeSha1) throw new MasterTemplateIdentityError('candidate does not match the exact pinned provider/release identity')
  if (!input.adoption.siteId || !input.adoption.locale) throw new MasterTemplateIdentityError('adoption requires siteId and locale')
  if (input.adoption.payloadStatus !== 'draft') throw new MasterTemplateIdentityError('A1 candidate adoption must remain draft')
  if (!Array.isArray(input.payload.documentIds) || input.payload.documentIds.some((id) => typeof id !== 'string' || !id)) throw new MasterTemplateIdentityError('Payload document IDs are invalid')
  const adapterIdentity = digest({ id: MASTER_TEMPLATE_ADAPTER_ID, version: MASTER_TEMPLATE_ADAPTER_VERSION, mappingDigest: MASTER_TEMPLATE_ADAPTER_MAPPING_DIGEST, candidate })
  const payload = { ...input.payload, projectionDigest: input.payload.projectionDigest ?? digest(input.payload) }
  const adoption = { ...input.adoption, adoptionId: digest({ candidate, siteId: input.adoption.siteId, locale: input.adoption.locale, payloadStatus: input.adoption.payloadStatus }) }
  const effective = digest({ candidate, adoption, adapter: { id: MASTER_TEMPLATE_ADAPTER_ID, version: MASTER_TEMPLATE_ADAPTER_VERSION, mappingDigest: MASTER_TEMPLATE_ADAPTER_MAPPING_DIGEST, identity: adapterIdentity }, payload })
  return Object.freeze({ candidate: Object.freeze({ ...candidate }), adoption: Object.freeze(adoption), adapter: Object.freeze({ id: MASTER_TEMPLATE_ADAPTER_ID, version: MASTER_TEMPLATE_ADAPTER_VERSION, mappingDigest: MASTER_TEMPLATE_ADAPTER_MAPPING_DIGEST, identity: adapterIdentity }), payload: Object.freeze(payload), effective })
}

export function assertMasterTemplateIdentityBindings(value: unknown): asserts value is MasterTemplateIdentityBindings {
  if (!value || typeof value !== 'object' || !('effective' in value) || typeof (value as { effective?: unknown }).effective !== 'string' || !SHA1.test((value as { effective: string }).effective)) throw new MasterTemplateIdentityError('master-template identity bindings are absent or invalid')
}
