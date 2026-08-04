import { createHash } from 'node:crypto'
import type { SchemaVersion } from '@linksites/types'

export const WORKING_CONTENT_SCHEMA_VERSION = { major: 1, minor: 0 } as const satisfies SchemaVersion

export type WorkingContentState =
  | 'working'
  | 'ready_for_gate'
  | 'accepted'
  | 'promoted'
  | 'superseded'
  | 'rejected'

export type WorkingGateOutcome = 'pending' | 'accepted' | 'rejected'

export interface WorkingContentSection {
  sectionId: string
  componentId: string
  content: Record<string, unknown>
}

export interface WorkingContentPage {
  pageId: string
  route: string
  sections: WorkingContentSection[]
}

export interface WorkingContentAssetReference {
  assetId: string
  sha256: string
  source: string
}

export interface WorkingContentLibraryReference {
  libraryId: string
  sha: string
}

export type WorkingContentProvenanceKind = 'factual_claim' | 'generated_copy' | 'media'

export interface WorkingContentProvenance {
  claimId: string
  kind: WorkingContentProvenanceKind
  sourceReferences: string[]
  statement: string
}

export interface WorkingContentPackage {
  schemaVersion: SchemaVersion
  content: {
    pages: WorkingContentPage[]
  }
  assetRefs: WorkingContentAssetReference[]
  libraryRefs: WorkingContentLibraryReference[]
  provenance: WorkingContentProvenance[]
}

export interface CreateWorkingContentVersionInput {
  workingPackageId: string
  orgId: string
  leadId: string
  siteId: string
  programRef: string
  runId?: string | null
  expectedCurrentVersion: number | null
  authorId: string
  executorId: string
  contentPackage: WorkingContentPackage
}

export interface WorkingContentVersion {
  schemaVersion: SchemaVersion
  workingPackageId: string
  versionNumber: number
  orgId: string
  leadId: string
  siteId: string
  programRef: string
  runId: string | null
  parentVersionNumber: number | null
  authorId: string
  executorId: string
  contentPackage: WorkingContentPackage
  contentChecksum: string
  lifecycleState: WorkingContentState
  gateOutcome: WorkingGateOutcome
  gateReference: string | null
  gateEvidenceReferences: string[]
  promotionIdempotencyKey: string | null
  payloadTargetCollection: string | null
  payloadDocumentId: string | null
  payloadDraftRevision: string | null
  promotionReceiptId: string | null
  createdAt: string
  updatedAt: string
}

export interface WorkingContentPromotionInput {
  schemaVersion: SchemaVersion
  orgId: string
  workingPackageId: string
  workingPackageVersion: number
  contentChecksum: string
  promotionIdempotencyKey: string
  contentPackage: WorkingContentPackage
  gateEvidenceReferences: string[]
}

export interface WorkingContentPromotionReceipt {
  promotionReceiptId: string
  schemaVersion: SchemaVersion
  orgId: string
  workingPackageId: string
  versionNumber: number
  promotionIdempotencyKey: string
  contentChecksum: string
  payloadTargetCollection: string
  payloadDocumentId: string | null
  payloadDraftRevision: string | null
  receipt: Record<string, unknown>
  createdAt: string
}

export class WorkingContentError extends Error {
  constructor(message: string, public readonly code: 'invalid_input' | 'not_found' | 'conflict' | 'checksum_mismatch' | 'invalid_state') {
    super(message)
    this.name = 'WorkingContentError'
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

const isSha256 = (value: unknown): value is string =>
  typeof value === 'string' && /^[a-f0-9]{64}$/.test(value)

const hasExactKeys = (value: unknown, required: readonly string[]): value is Record<string, unknown> =>
  isRecord(value) && required.every((key) => Object.prototype.hasOwnProperty.call(value, key)) && Object.keys(value).every((key) => required.includes(key))

function assertContentPackage(value: unknown): asserts value is WorkingContentPackage {
  if (!isRecord(value) || !hasExactKeys(value, ['schemaVersion', 'content', 'assetRefs', 'libraryRefs', 'provenance'])) {
    throw new WorkingContentError('working content package has an incompatible top-level shape', 'invalid_input')
  }
  const schema = value.schemaVersion
  if (!isRecord(schema) || schema.major !== WORKING_CONTENT_SCHEMA_VERSION.major || schema.minor !== WORKING_CONTENT_SCHEMA_VERSION.minor || Object.keys(schema).length !== 2) {
    throw new WorkingContentError('working content package schema version is unsupported', 'invalid_input')
  }

  const content = value.content
  if (!isRecord(content) || !hasExactKeys(content, ['pages']) || !Array.isArray(content.pages) || content.pages.length === 0) {
    throw new WorkingContentError('working content package must contain at least one page', 'invalid_input')
  }
  for (const page of content.pages) {
    if (!isRecord(page) || !hasExactKeys(page, ['pageId', 'route', 'sections']) || !isNonEmptyString(page.pageId) || !isNonEmptyString(page.route) || !Array.isArray(page.sections)) {
      throw new WorkingContentError('working content page is incompatible with the template contract', 'invalid_input')
    }
    for (const section of page.sections) {
      if (!isRecord(section) || !hasExactKeys(section, ['sectionId', 'componentId', 'content']) || !isNonEmptyString(section.sectionId) || !isNonEmptyString(section.componentId) || !isRecord(section.content)) {
        throw new WorkingContentError('working content section is incompatible with the template contract', 'invalid_input')
      }
    }
  }

  if (!Array.isArray(value.assetRefs) || !value.assetRefs.every((asset) => isRecord(asset) && hasExactKeys(asset, ['assetId', 'sha256', 'source']) && isNonEmptyString(asset.assetId) && isSha256(asset.sha256) && isNonEmptyString(asset.source))) {
    throw new WorkingContentError('working content asset references are invalid', 'invalid_input')
  }
  if (!Array.isArray(value.libraryRefs) || !value.libraryRefs.every((library) => isRecord(library) && hasExactKeys(library, ['libraryId', 'sha']) && isNonEmptyString(library.libraryId) && isNonEmptyString(library.sha))) {
    throw new WorkingContentError('working content LiNKlibraries references are invalid', 'invalid_input')
  }
  if (!Array.isArray(value.provenance) || !value.provenance.every((record) => isRecord(record) && hasExactKeys(record, ['claimId', 'kind', 'sourceReferences', 'statement']) && isNonEmptyString(record.claimId) && (record.kind === 'factual_claim' || record.kind === 'generated_copy' || record.kind === 'media') && Array.isArray(record.sourceReferences) && record.sourceReferences.every(isNonEmptyString) && isNonEmptyString(record.statement))) {
    throw new WorkingContentError('working content provenance is invalid', 'invalid_input')
  }
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  return `{${Object.keys(value as Record<string, unknown>).sort().map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`).join(',')}}`
}

export function validateWorkingContentPackage(value: unknown): value is WorkingContentPackage {
  try {
    assertContentPackage(value)
    return true
  } catch {
    return false
  }
}

export function assertValidWorkingContentPackage(value: unknown): asserts value is WorkingContentPackage {
  assertContentPackage(value)
}

export function computeWorkingContentChecksum(contentPackage: WorkingContentPackage): string {
  assertValidWorkingContentPackage(contentPackage)
  return createHash('sha256').update(stableStringify(contentPackage)).digest('hex')
}

export function toWorkingContentPromotionInput(version: WorkingContentVersion, promotionIdempotencyKey: string): WorkingContentPromotionInput {
  if (version.lifecycleState !== 'accepted' && version.lifecycleState !== 'promoted') {
    throw new WorkingContentError(`version ${version.workingPackageId}/${version.versionNumber} is ${version.lifecycleState}, not accepted`, 'invalid_state')
  }
  if (version.contentChecksum !== computeWorkingContentChecksum(version.contentPackage)) {
    throw new WorkingContentError(`checksum mismatch for version ${version.workingPackageId}/${version.versionNumber}`, 'checksum_mismatch')
  }
  return {
    schemaVersion: version.schemaVersion,
    orgId: version.orgId,
    workingPackageId: version.workingPackageId,
    workingPackageVersion: version.versionNumber,
    contentChecksum: version.contentChecksum,
    promotionIdempotencyKey,
    contentPackage: version.contentPackage,
    gateEvidenceReferences: version.gateEvidenceReferences,
  }
}

type SqlRow = Record<string, unknown>

export interface WorkingContentSqlExecutor {
  query(sql: string, params?: unknown[]): Promise<{ rows: SqlRow[] }>
}

const iso = (value: unknown): string => new Date(String(value)).toISOString()

function mapVersion(row: SqlRow): WorkingContentVersion {
  const contentPackage = {
    schemaVersion: { major: Number(row.schema_version_major), minor: Number(row.schema_version_minor) },
    content: row.content_payload as WorkingContentPackage['content'],
    assetRefs: row.asset_refs as WorkingContentPackage['assetRefs'],
    libraryRefs: row.library_refs as WorkingContentPackage['libraryRefs'],
    provenance: row.provenance as WorkingContentPackage['provenance'],
  }
  assertValidWorkingContentPackage(contentPackage)
  const version: WorkingContentVersion = {
    schemaVersion: contentPackage.schemaVersion,
    workingPackageId: String(row.working_package_id),
    versionNumber: Number(row.version_number),
    orgId: String(row.org_id),
    leadId: String(row.lead_id),
    siteId: String(row.site_id),
    programRef: String(row.program_ref),
    runId: row.run_id == null ? null : String(row.run_id),
    parentVersionNumber: row.parent_version_number == null ? null : Number(row.parent_version_number),
    authorId: String(row.author_id),
    executorId: String(row.executor_id),
    contentPackage,
    contentChecksum: String(row.content_checksum),
    lifecycleState: row.lifecycle_state as WorkingContentState,
    gateOutcome: row.gate_outcome as WorkingGateOutcome,
    gateReference: row.gate_reference == null ? null : String(row.gate_reference),
    gateEvidenceReferences: row.gate_evidence_refs as string[],
    promotionIdempotencyKey: row.promotion_idempotency_key == null ? null : String(row.promotion_idempotency_key),
    payloadTargetCollection: row.payload_target_collection == null ? null : String(row.payload_target_collection),
    payloadDocumentId: row.payload_document_id == null ? null : String(row.payload_document_id),
    payloadDraftRevision: row.payload_draft_revision == null ? null : String(row.payload_draft_revision),
    promotionReceiptId: row.promotion_receipt_id == null ? null : String(row.promotion_receipt_id),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  }
  const actual = computeWorkingContentChecksum(version.contentPackage)
  if (actual !== version.contentChecksum) {
    throw new WorkingContentError(`stored checksum does not match version ${version.workingPackageId}/${version.versionNumber}`, 'checksum_mismatch')
  }
  return version
}

function mapReceipt(row: SqlRow): WorkingContentPromotionReceipt {
  return {
    promotionReceiptId: String(row.promotion_receipt_id),
    schemaVersion: { major: Number(row.schema_version_major), minor: Number(row.schema_version_minor) },
    orgId: String(row.org_id),
    workingPackageId: String(row.working_package_id),
    versionNumber: Number(row.version_number),
    promotionIdempotencyKey: String(row.promotion_idempotency_key),
    contentChecksum: String(row.content_checksum),
    payloadTargetCollection: String(row.payload_target_collection),
    payloadDocumentId: row.payload_document_id == null ? null : String(row.payload_document_id),
    payloadDraftRevision: row.payload_draft_revision == null ? null : String(row.payload_draft_revision),
    receipt: row.receipt as Record<string, unknown>,
    createdAt: iso(row.created_at),
  }
}

async function inTransaction<T>(db: WorkingContentSqlExecutor, work: () => Promise<T>): Promise<T> {
  await db.query('begin')
  try {
    const result = await work()
    await db.query('commit')
    return result
  } catch (error) {
    await db.query('rollback').catch(() => undefined)
    throw error
  }
}

export class WorkingContentRepository {
  constructor(private readonly db: WorkingContentSqlExecutor) {}

  async createVersion(input: CreateWorkingContentVersionInput): Promise<WorkingContentVersion> {
    assertValidWorkingContentPackage(input.contentPackage)
    if (!isNonEmptyString(input.workingPackageId) || !isNonEmptyString(input.orgId) || !isNonEmptyString(input.leadId) || !isNonEmptyString(input.siteId) || !isNonEmptyString(input.programRef) || !isNonEmptyString(input.authorId) || !isNonEmptyString(input.executorId) || (input.runId !== null && input.runId !== undefined && !isNonEmptyString(input.runId)) || (input.expectedCurrentVersion !== null && (!Number.isInteger(input.expectedCurrentVersion) || input.expectedCurrentVersion < 0))) {
      throw new WorkingContentError('working content version identity or compare-and-swap input is invalid', 'invalid_input')
    }
    const checksum = computeWorkingContentChecksum(input.contentPackage)
    return inTransaction(this.db, async () => {
      await this.db.query(
        `insert into lsites_sites.working_packages
          (working_package_id, org_id, lead_id, site_id)
         values ($1, $2, $3, $4)
         on conflict (working_package_id) do nothing`,
        [input.workingPackageId, input.orgId, input.leadId, input.siteId],
      )
      const packageResult = await this.db.query(
        `select current_version, org_id, lead_id, site_id
           from lsites_sites.working_packages
          where working_package_id = $1
          for update`,
        [input.workingPackageId],
      )
      const packageRow = packageResult.rows[0]
      if (!packageRow) throw new WorkingContentError(`working package ${input.workingPackageId} was not found`, 'not_found')
      if (String(packageRow.org_id) !== input.orgId || String(packageRow.lead_id) !== input.leadId || String(packageRow.site_id) !== input.siteId) {
        throw new WorkingContentError(`working package ${input.workingPackageId} identity conflicts with the requested lead/site/org`, 'conflict')
      }
      const currentVersion = Number(packageRow.current_version)
      const expectedCurrentVersion = input.expectedCurrentVersion ?? 0
      if (expectedCurrentVersion !== currentVersion) {
        throw new WorkingContentError(`working package ${input.workingPackageId} changed from expected version ${String(input.expectedCurrentVersion)} to ${currentVersion}`, 'conflict')
      }
      const versionNumber = currentVersion + 1
      const inserted = await this.db.query(
        `insert into lsites_sites.working_content_versions
          (working_package_id, version_number, schema_version_major, schema_version_minor,
           org_id, lead_id, site_id, program_ref, run_id, parent_version_number,
           author_id, executor_id, content_payload, asset_refs, library_refs,
           provenance, content_checksum)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
         returning *`,
        [
          input.workingPackageId,
          versionNumber,
          input.contentPackage.schemaVersion.major,
          input.contentPackage.schemaVersion.minor,
          input.orgId,
          input.leadId,
          input.siteId,
          input.programRef,
          input.runId ?? null,
          currentVersion === 0 ? null : expectedCurrentVersion,
          input.authorId,
          input.executorId,
          input.contentPackage.content,
          input.contentPackage.assetRefs,
          input.contentPackage.libraryRefs,
          input.contentPackage.provenance,
          checksum,
        ],
      )
      await this.db.query(
        `update lsites_sites.working_packages set current_version = $2, updated_at = now()
          where working_package_id = $1`,
        [input.workingPackageId, versionNumber],
      )
      return mapVersion(inserted.rows[0])
    })
  }

  async readVersion(workingPackageId: string, versionNumber: number): Promise<WorkingContentVersion | null> {
    const result = await this.db.query(
      `select * from lsites_sites.working_content_versions
        where working_package_id = $1 and version_number = $2`,
      [workingPackageId, versionNumber],
    )
    return result.rows[0] ? mapVersion(result.rows[0]) : null
  }

  async markReadyForGate(workingPackageId: string, versionNumber: number, expectedChecksum: string): Promise<WorkingContentVersion> {
    return this.transitionGate(workingPackageId, versionNumber, expectedChecksum, 'ready_for_gate', 'pending', null, [])
  }

  async markGateOutcome(input: {
    workingPackageId: string
    versionNumber: number
    expectedChecksum: string
    outcome: 'accepted' | 'rejected'
    gateReference: string
    evidenceReferences: string[]
  }): Promise<WorkingContentVersion> {
    if (!isNonEmptyString(input.gateReference) || input.evidenceReferences.length === 0 || !input.evidenceReferences.every(isNonEmptyString)) {
      throw new WorkingContentError('a gate outcome requires a gate reference and evidence references', 'invalid_input')
    }
    return this.transitionGate(input.workingPackageId, input.versionNumber, input.expectedChecksum, input.outcome, input.outcome, input.gateReference, input.evidenceReferences)
  }

  private async transitionGate(
    workingPackageId: string,
    versionNumber: number,
    expectedChecksum: string,
    lifecycleState: 'ready_for_gate' | 'accepted' | 'rejected',
    gateOutcome: WorkingGateOutcome,
    gateReference: string | null,
    evidenceReferences: string[],
  ): Promise<WorkingContentVersion> {
    return inTransaction(this.db, async () => {
      const current = await this.db.query(
        `select * from lsites_sites.working_content_versions
          where working_package_id = $1 and version_number = $2 for update`,
        [workingPackageId, versionNumber],
      )
      if (!current.rows[0]) throw new WorkingContentError(`working content version ${workingPackageId}/${versionNumber} was not found`, 'not_found')
      const version = mapVersion(current.rows[0])
      if (version.contentChecksum !== expectedChecksum) throw new WorkingContentError(`checksum mismatch for version ${workingPackageId}/${versionNumber}`, 'checksum_mismatch')
      if (lifecycleState === 'ready_for_gate' && version.lifecycleState !== 'working') throw new WorkingContentError(`version ${workingPackageId}/${versionNumber} is not working`, 'invalid_state')
      if (lifecycleState !== 'ready_for_gate' && version.lifecycleState !== 'ready_for_gate') throw new WorkingContentError(`version ${workingPackageId}/${versionNumber} is not ready for a gate outcome`, 'invalid_state')
      const updated = await this.db.query(
        `update lsites_sites.working_content_versions
            set lifecycle_state = $3, gate_outcome = $4, gate_reference = $5,
                gate_evidence_refs = $6, updated_at = now()
          where working_package_id = $1 and version_number = $2
          returning *`,
        [workingPackageId, versionNumber, lifecycleState, gateOutcome, gateReference, evidenceReferences],
      )
      if (lifecycleState === 'accepted') {
        await this.db.query(
          `update lsites_sites.working_content_versions
              set lifecycle_state = 'superseded', updated_at = now()
            where working_package_id = $1 and lifecycle_state = 'accepted' and version_number <> $2`,
          [workingPackageId, versionNumber],
        )
      }
      return mapVersion(updated.rows[0])
    })
  }

  async selectExactAcceptedVersion(input: { workingPackageId: string; versionNumber: number; contentChecksum: string }): Promise<WorkingContentVersion> {
    const result = await this.db.query(
      `select * from lsites_sites.working_content_versions
        where working_package_id = $1 and version_number = $2
          and content_checksum = $3 and lifecycle_state in ('accepted', 'promoted')`,
      [input.workingPackageId, input.versionNumber, input.contentChecksum],
    )
    if (!result.rows[0]) throw new WorkingContentError(`exact accepted working content version ${input.workingPackageId}/${input.versionNumber} was not found`, 'not_found')
    return mapVersion(result.rows[0])
  }

  async preparePromotion(input: { orgId: string; workingPackageId: string; versionNumber: number; contentChecksum: string; promotionIdempotencyKey: string }): Promise<WorkingContentPromotionInput> {
    if (!isNonEmptyString(input.promotionIdempotencyKey)) throw new WorkingContentError('promotion idempotency key is required', 'invalid_input')
    return inTransaction(this.db, async () => {
      const prior = await this.db.query(
        `select * from lsites_sites.working_content_versions
          where org_id = $1 and promotion_idempotency_key = $2`,
        [input.orgId, input.promotionIdempotencyKey],
      )
      if (prior.rows[0] && (String(prior.rows[0].working_package_id) !== input.workingPackageId || Number(prior.rows[0].version_number) !== input.versionNumber)) {
        throw new WorkingContentError(`promotion idempotency key ${input.promotionIdempotencyKey} is already bound to another immutable version`, 'conflict')
      }
      const version = prior.rows[0]
        ? mapVersion(prior.rows[0])
        : await this.selectExactAcceptedVersion(input)
      if (version.orgId !== input.orgId || version.contentChecksum !== input.contentChecksum) throw new WorkingContentError('promotion input does not match the selected immutable version', 'conflict')
      if (version.promotionIdempotencyKey === null) {
        const updated = await this.db.query(
          `update lsites_sites.working_content_versions
              set promotion_idempotency_key = $4, updated_at = now()
            where org_id = $1 and working_package_id = $2 and version_number = $3
              and content_checksum = $5 and lifecycle_state in ('accepted', 'promoted')
            returning *`,
          [input.orgId, input.workingPackageId, input.versionNumber, input.promotionIdempotencyKey, input.contentChecksum],
        )
        if (!updated.rows[0]) throw new WorkingContentError('working content changed while preparing promotion', 'conflict')
      }
      const selected = version.promotionIdempotencyKey === null
        ? await this.readVersion(input.workingPackageId, input.versionNumber)
        : version
      if (!selected) throw new WorkingContentError('prepared working content version disappeared', 'not_found')
      return toWorkingContentPromotionInput(selected, input.promotionIdempotencyKey)
    })
  }

  async recordPromotionReceipt(input: {
    orgId: string
    workingPackageId: string
    versionNumber: number
    promotionIdempotencyKey: string
    contentChecksum: string
    promotionReceiptId: string
    payloadTargetCollection: string
    payloadDocumentId?: string | null
    payloadDraftRevision?: string | null
    receipt: Record<string, unknown>
  }): Promise<WorkingContentPromotionReceipt> {
    if (!isNonEmptyString(input.promotionReceiptId) || !isNonEmptyString(input.payloadTargetCollection) || !isRecord(input.receipt)) throw new WorkingContentError('promotion receipt fields are invalid', 'invalid_input')
    return inTransaction(this.db, async () => {
      const prior = await this.db.query(
        `select * from lsites_sites.working_content_promotion_receipts
          where org_id = $1 and promotion_idempotency_key = $2`,
        [input.orgId, input.promotionIdempotencyKey],
      )
      if (prior.rows[0]) {
        const existing = mapReceipt(prior.rows[0])
        if (existing.workingPackageId !== input.workingPackageId || existing.versionNumber !== input.versionNumber || existing.contentChecksum !== input.contentChecksum) throw new WorkingContentError('promotion idempotency key conflicts with an existing receipt', 'conflict')
        return existing
      }
      const version = await this.selectExactAcceptedVersion({ workingPackageId: input.workingPackageId, versionNumber: input.versionNumber, contentChecksum: input.contentChecksum })
      if (version.orgId !== input.orgId || version.promotionIdempotencyKey !== input.promotionIdempotencyKey) throw new WorkingContentError('promotion receipt is not bound to the prepared version', 'conflict')
      const inserted = await this.db.query(
        `insert into lsites_sites.working_content_promotion_receipts
          (promotion_receipt_id, org_id, working_package_id, version_number,
           promotion_idempotency_key, content_checksum, payload_target_collection,
           payload_document_id, payload_draft_revision, receipt)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         returning *`,
        [input.promotionReceiptId, input.orgId, input.workingPackageId, input.versionNumber, input.promotionIdempotencyKey, input.contentChecksum, input.payloadTargetCollection, input.payloadDocumentId ?? null, input.payloadDraftRevision ?? null, input.receipt],
      )
      await this.db.query(
        `update lsites_sites.working_content_versions
            set lifecycle_state = 'promoted', payload_target_collection = $4,
                payload_document_id = $5, payload_draft_revision = $6,
                promotion_receipt_id = $7, updated_at = now()
          where org_id = $1 and working_package_id = $2 and version_number = $3`,
        [input.orgId, input.workingPackageId, input.versionNumber, input.payloadTargetCollection, input.payloadDocumentId ?? null, input.payloadDraftRevision ?? null, input.promotionReceiptId],
      )
      return mapReceipt(inserted.rows[0])
    })
  }

  async traceLineage(workingPackageId: string, versionNumber: number): Promise<WorkingContentVersion[]> {
    const lineage: WorkingContentVersion[] = []
    const visited = new Set<number>()
    let next: number | null = versionNumber
    while (next !== null) {
      if (visited.has(next)) throw new WorkingContentError(`lineage cycle detected at ${workingPackageId}/${next}`, 'conflict')
      visited.add(next)
      const version = await this.readVersion(workingPackageId, next)
      if (!version) throw new WorkingContentError(`lineage version ${workingPackageId}/${next} was not found`, 'not_found')
      lineage.push(version)
      next = version.parentVersionNumber
    }
    return lineage.reverse()
  }

  async compareVersions(workingPackageId: string, leftVersion: number, rightVersion: number): Promise<{ left: WorkingContentVersion; right: WorkingContentVersion; sameChecksum: boolean; changedFields: string[] }> {
    const left = await this.readVersion(workingPackageId, leftVersion)
    const right = await this.readVersion(workingPackageId, rightVersion)
    if (!left || !right) throw new WorkingContentError(`cannot compare missing working content versions for ${workingPackageId}`, 'not_found')
    const changedFields: string[] = []
    if (stableStringify(left.contentPackage.content) !== stableStringify(right.contentPackage.content)) changedFields.push('content')
    if (stableStringify(left.contentPackage.assetRefs) !== stableStringify(right.contentPackage.assetRefs)) changedFields.push('assetRefs')
    if (stableStringify(left.contentPackage.libraryRefs) !== stableStringify(right.contentPackage.libraryRefs)) changedFields.push('libraryRefs')
    if (stableStringify(left.contentPackage.provenance) !== stableStringify(right.contentPackage.provenance)) changedFields.push('provenance')
    return { left, right, sameChecksum: left.contentChecksum === right.contentChecksum, changedFields }
  }
}
