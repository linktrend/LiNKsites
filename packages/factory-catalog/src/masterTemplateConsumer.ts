/**
 * Materialized LiNKlibraries master-template consumer.
 *
 * Tests load a consumer-owned fixture cache. Runtime must not require a live
 * Library checkout. Production selection still rejects draft / non_selectable.
 */
import { createHash } from 'node:crypto'
import {
  MASTER_TEMPLATE_PIN,
  MasterTemplateConsumerError,
  assertAdmissibleProviderSha,
} from './masterTemplatePin.ts'
import { assertDerivationPolicy } from './masterTemplateOverridePolicy.ts'
import {
  MASTER_TEMPLATE_ARCHETYPES,
  type MasterTemplateArchetype,
} from './masterTemplateSemanticProjection.ts'

const SHA256_PATTERN = /^[a-f0-9]{64}$/
const GIT_SHA_PATTERN = /^[a-f0-9]{40}$/

export interface MasterTemplateSourceInventory {
  template: {
    entryId: string
    version: string
    sourceRepository: string
  }
  source: {
    commitSha: string
    treeSha: string
  }
}

export interface MasterTemplateCatalogueRecord {
  entryId: string
  version: string
  artifactTreeSha1: string
  releaseManifestSha256: string
  inventorySha256: string
  lifecycle: string
  selectability: string
  bundlePath: string
}

export interface MasterTemplateBundle {
  providerCommitSha: string
  catalogueBytes: string
  manifestBytes: string
  inventoryBytes: string
  receiptBytes: string
  indexBytes: string
  sourceInventory: unknown
  derivationPolicy: unknown
  layoutContracts: unknown
  defaultContent: unknown
}

export interface VerifiedMasterTemplatePin {
  pin: typeof MASTER_TEMPLATE_PIN
  catalogueRecord: MasterTemplateCatalogueRecord
  sourceInventory: MasterTemplateSourceInventory
  archetypes: MasterTemplateArchetype[]
  lifecycle: 'draft'
  selectability: 'non_selectable'
  artifactTreeSha1: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const sha256 = (value: string): string => createHash('sha256').update(value, 'utf8').digest('hex')

function parseJson(bytes: string, label: string): unknown {
  try {
    return JSON.parse(bytes)
  } catch {
    throw new MasterTemplateConsumerError(`${label} is not valid JSON.`)
  }
}

export function assertSourceInventoryShape(value: unknown): asserts value is MasterTemplateSourceInventory {
  if (!isRecord(value) || !isRecord(value.template) || !isRecord(value.source)) {
    throw new MasterTemplateConsumerError(
      'Source inventory must use nested template.sourceRepository and source.commitSha / source.treeSha.',
    )
  }
  if (typeof value.template.sourceRepository !== 'string' || value.template.sourceRepository.length === 0) {
    throw new MasterTemplateConsumerError('Source inventory template.sourceRepository is required.')
  }
  if (typeof value.source.commitSha !== 'string' || !GIT_SHA_PATTERN.test(value.source.commitSha)) {
    throw new MasterTemplateConsumerError('Source inventory source.commitSha must be a full Git SHA.')
  }
  if (typeof value.source.treeSha !== 'string' || !GIT_SHA_PATTERN.test(value.source.treeSha)) {
    throw new MasterTemplateConsumerError('Source inventory source.treeSha must be a full Git tree SHA.')
  }
  if (typeof value.template.entryId !== 'string' || typeof value.template.version !== 'string') {
    throw new MasterTemplateConsumerError('Source inventory template identity is missing.')
  }
}

function readCatalogueRecord(catalogue: unknown): MasterTemplateCatalogueRecord {
  if (!isRecord(catalogue) || !Array.isArray(catalogue.records)) {
    throw new MasterTemplateConsumerError('Catalogue is missing records.')
  }
  if (typeof catalogue.recordsSha256 === 'string' && catalogue.recordsSha256 !== MASTER_TEMPLATE_PIN.catalogueRecordsSha256) {
    throw new MasterTemplateConsumerError('Catalogue recordsSha256 does not match the pinned identity.')
  }
  const record = catalogue.records.find((row) => isRecord(row) && row.entryId === MASTER_TEMPLATE_PIN.entryId)
  if (!isRecord(record)) throw new MasterTemplateConsumerError('Catalogue does not contain master-template-type-1.')
  for (const field of ['version', 'artifactTreeSha1', 'releaseManifestSha256', 'inventorySha256', 'lifecycle', 'selectability', 'bundlePath']) {
    if (typeof record[field] !== 'string') throw new MasterTemplateConsumerError(`Catalogue record is missing ${field}.`)
  }
  return {
    entryId: String(record.entryId),
    version: String(record.version),
    artifactTreeSha1: String(record.artifactTreeSha1),
    releaseManifestSha256: String(record.releaseManifestSha256),
    inventorySha256: String(record.inventorySha256),
    lifecycle: String(record.lifecycle),
    selectability: String(record.selectability),
    bundlePath: String(record.bundlePath),
  }
}

function readArchetypes(layoutContracts: unknown): MasterTemplateArchetype[] {
  if (!isRecord(layoutContracts) || !Array.isArray(layoutContracts.pageArchetypes)) {
    throw new MasterTemplateConsumerError('Layout contracts must declare pageArchetypes.')
  }
  const ids = layoutContracts.pageArchetypes.map((row) => {
    if (!isRecord(row) || typeof row.id !== 'string') throw new MasterTemplateConsumerError('Layout archetype is missing id.')
    return row.id
  })
  if (ids.length !== MASTER_TEMPLATE_ARCHETYPES.length || MASTER_TEMPLATE_ARCHETYPES.some((id, index) => ids[index] !== id)) {
    throw new MasterTemplateConsumerError(
      `Layout archetypes must be exactly ${MASTER_TEMPLATE_ARCHETYPES.join('|')}; refusing to invent a mapping.`,
    )
  }
  return [...MASTER_TEMPLATE_ARCHETYPES]
}

export function verifyMasterTemplateBundle(bundle: MasterTemplateBundle): VerifiedMasterTemplatePin {
  assertAdmissibleProviderSha(bundle.providerCommitSha)
  if (sha256(bundle.catalogueBytes) !== MASTER_TEMPLATE_PIN.catalogueFileSha256) {
    throw new MasterTemplateConsumerError('Catalogue file SHA-256 does not match the pinned receipt.')
  }
  if (sha256(bundle.manifestBytes) !== MASTER_TEMPLATE_PIN.releaseManifestSha256) {
    throw new MasterTemplateConsumerError('Manifest SHA-256 does not match the pinned receipt.')
  }
  if (sha256(bundle.inventoryBytes) !== MASTER_TEMPLATE_PIN.inventorySha256) {
    throw new MasterTemplateConsumerError('Inventory SHA-256 does not match the pinned receipt.')
  }
  if (!SHA256_PATTERN.test(sha256(bundle.receiptBytes)) || !SHA256_PATTERN.test(sha256(bundle.indexBytes))) {
    throw new MasterTemplateConsumerError('Receipt or index bytes are empty.')
  }

  const catalogue = parseJson(bundle.catalogueBytes, 'Catalogue')
  const manifest = parseJson(bundle.manifestBytes, 'Manifest')
  const inventory = parseJson(bundle.inventoryBytes, 'Inventory')
  const receipt = parseJson(bundle.receiptBytes, 'Receipt')
  const index = parseJson(bundle.indexBytes, 'Release index')
  if (!isRecord(manifest) || !isRecord(inventory) || !isRecord(receipt) || !isRecord(index)) {
    throw new MasterTemplateConsumerError('Pinned release documents must be objects.')
  }

  const catalogueRecord = readCatalogueRecord(catalogue)
  assertSourceInventoryShape(bundle.sourceInventory)
  assertDerivationPolicy(bundle.derivationPolicy)
  const archetypes = readArchetypes(bundle.layoutContracts)

  const artifactTreeSha1 = catalogueRecord.artifactTreeSha1
  if (
    artifactTreeSha1 !== MASTER_TEMPLATE_PIN.artifactTreeSha1 ||
    manifest.artifactTreeSha1 !== artifactTreeSha1 ||
    index.artifactTreeSha1 !== artifactTreeSha1 ||
    !isRecord(receipt.release) ||
    receipt.release.artifactTreeSha1 !== artifactTreeSha1
  ) {
    throw new MasterTemplateConsumerError('artifactTreeSha1 is not consistent across catalogue, index, manifest, and receipt.')
  }
  if (catalogueRecord.releaseManifestSha256 !== MASTER_TEMPLATE_PIN.releaseManifestSha256) {
    throw new MasterTemplateConsumerError('Catalogue releaseManifestSha256 does not match the pin.')
  }
  if (catalogueRecord.inventorySha256 !== MASTER_TEMPLATE_PIN.inventorySha256) {
    throw new MasterTemplateConsumerError('Catalogue inventorySha256 does not match the pin.')
  }
  if (
    bundle.sourceInventory.template.entryId !== MASTER_TEMPLATE_PIN.entryId ||
    bundle.sourceInventory.template.version !== MASTER_TEMPLATE_PIN.version ||
    bundle.sourceInventory.template.sourceRepository !== MASTER_TEMPLATE_PIN.sourceRepository ||
    bundle.sourceInventory.source.commitSha !== MASTER_TEMPLATE_PIN.releaseSourceCommitSha ||
    bundle.sourceInventory.source.treeSha !== MASTER_TEMPLATE_PIN.releaseSourceRepositoryTreeSha1
  ) {
    throw new MasterTemplateConsumerError('Source inventory identity does not match the pinned Library release source.')
  }
  if (catalogueRecord.lifecycle !== 'draft' || catalogueRecord.selectability !== 'non_selectable') {
    throw new MasterTemplateConsumerError('Pinned master-template-type-1 must remain draft / non_selectable.')
  }

  return {
    pin: MASTER_TEMPLATE_PIN,
    catalogueRecord,
    sourceInventory: bundle.sourceInventory,
    archetypes,
    lifecycle: 'draft',
    selectability: 'non_selectable',
    artifactTreeSha1,
  }
}

export function selectMasterTemplateForProduction(bundle: MasterTemplateBundle): never {
  const verified = verifyMasterTemplateBundle(bundle)
  throw new MasterTemplateConsumerError(
    `Production path rejects ${verified.pin.entryId}@${verified.pin.version} because lifecycle=${verified.lifecycle} and selectability=${verified.selectability}.`,
  )
}

export function rejectStaleMarketingSmbAuthority(input: { entryId: string; status: string; selectability?: string }): void {
  if (input.entryId === 'marketing-smb-v1') {
    throw new MasterTemplateConsumerError(
      'Stale marketing-smb-v1 approved fixtures cannot override current Library quarantine or selectability.',
    )
  }
}
