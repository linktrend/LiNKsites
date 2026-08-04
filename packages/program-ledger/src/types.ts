/**
 * Program Ledger — core contracts (Phase 2 foundation).
 *
 * Implements the Issue/Run/Gate/Event/Idempotency model required by the
 * LiNKsites Program Manual §20 (Issues, Runs, Executors, Model Routing,
 * Idempotency, Retry, and Compensation) and §04 (state model doctrine).
 *
 * Versioned per docs/archive/policies/CONTRACT_AND_SCHEMA_VERSIONING_POLICY.md:
 * every contract below carries an explicit `schemaVersion` as a
 * MAJOR.MINOR pair. This is version 1.0 — the first version, not an
 * implicit/unversioned baseline.
 *
 * W1-02 makes the hierarchy and gate records durable while keeping the
 * existing executor/lease contract intact. The model-routing ladder,
 * compensation Sagas, and cross-Program outbox/inbox remain out of scope.
 */

import { createHash } from 'node:crypto'
import type { EvidenceReceipt, SchemaVersion } from '@linksites/types'

export const SCHEMA_VERSION: SchemaVersion = { major: 1, minor: 0 }

/** Reserved tenant used only to make pre-tenant legacy rows deterministic. */
export const DEFAULT_ORG_ID = 'a0000000-a000-a000-a000-a00000000001'

export type { SchemaVersion }

/** Manual §20 §15: Issue lifecycle states with dependency-aware readiness. */
export type IssueState =
  | 'blocked'
  | 'ready'
  | 'dispatched'
  | 'running'
  | 'awaiting_gate'
  | 'retry_scheduled'
  | 'repair_required'
  | 'exception'
  | 'cancelled'
  | 'failed'
  | 'completed'

/** Manual §20 §20: Run lifecycle states. */
export type RunState =
  | 'created'
  | 'queued'
  | 'claimed'
  | 'executing'
  | 'checkpointed'
  | 'succeeded'
  | 'failed_retryable'
  | 'failed_terminal'
  | 'timed_out'
  | 'cancel_requested'
  | 'cancelled'
  | 'compensating'
  | 'compensated'

/** Manual §20 §67: failure taxonomy (subset covering this slice's scenarios). */
export type FailureClass =
  | 'transient_infrastructure'
  | 'timeout_uncertain'
  | 'invalid_input'
  | 'quality_gate_failed'
  | 'code_defect'
  | 'cancelled'
  | 'unknown'

/** Manual §20 §75: side-effect classes, governing retry/compensation posture. */
export type SideEffectClass =
  | 'none'
  | 'reproducible_artifact'
  | 'reversible_state'
  | 'conditionally_reversible'
  | 'irreversible_external'
  | 'destructive'
  | 'financial'

export interface RetryPolicy {
  maxAttempts: number
  backoffBaseMs: number
  backoffMaxMs: number
}

export type WorkState = 'planned' | 'ready' | 'in_progress' | 'awaiting_gate' | 'completed' | 'failed' | 'blocked'

export interface Program {
  schemaVersion: SchemaVersion
  programId: string
  orgId: string | null
  title: string
  state: WorkState
  revision: number
  createdAt: string
  updatedAt: string
}

export interface Module {
  schemaVersion: SchemaVersion
  moduleId: string
  programId: string
  orgId: string | null
  title: string
  purpose: string
  state: WorkState
  revision: number
  createdAt: string
  updatedAt: string
}

export interface Phase {
  schemaVersion: SchemaVersion
  phaseId: string
  moduleId: string
  programId: string
  orgId: string | null
  title: string
  objective: string
  state: WorkState
  revision: number
  createdAt: string
  updatedAt: string
}

export interface Issue {
  schemaVersion: SchemaVersion
  issueId: string
  issueType: string
  /** Durable hierarchy references. */
  programRef: string
  moduleRef?: string
  phaseRef?: string
  /** Stable packet/application key, distinct from the UUID storage identity. */
  issueKey?: string
  target?: string | null
  intendedEffect: string
  correlationId?: string | null
  state: IssueState
  input: Record<string, unknown>
  inputDigest: string
  sideEffectClass: SideEffectClass
  /**
   * When set, `ProgramLedger.dispatch` must verify
   * `platform.has_capability_grant(orgId, requiredCapabilityId)` before
   * creating a Run. Required for external side-effect classes when a
   * `CapabilityGrantLookup` is injected into the ledger.
   */
  requiredCapabilityId?: string | null
  /**
   * Tenant org this Issue belongs to (platform.organizations id). Required
   * together with `requiredCapabilityId` for the capability grant gate.
   */
  orgId?: string | null
  retryPolicy: RetryPolicy
  timeoutMs: number
  attemptCount: number
  createdAt: string
  updatedAt: string
  cancelRequested: boolean
  retryAt: string | null
}

export interface Lease {
  leaseId: string
  fencingToken: number
  executorId: string
  expiresAt: string
}

export interface Run {
  schemaVersion: SchemaVersion
  runId: string
  issueId: string
  orgId: string
  attemptNumber: number
  state: RunState
  /** Immutable input snapshot pinned at Run creation (manual §20 §21). */
  inputSnapshot: Record<string, unknown>
  lease: Lease | null
  executorType: string | null
  executorVersion: string | null
  correlationId: string | null
  idempotencyKey: string
  output: unknown | null
  failure: { failureClass: FailureClass; message: string } | null
  createdAt: string
  claimedAt: string | null
  startedAt: string | null
  lastHeartbeatAt: string | null
  completedAt: string | null
  terminalState: RunState | null
}

export type GateDecision = 'pending' | 'accepted' | 'rejected'

export type GateSubjectType = 'issue' | 'phase' | 'module' | 'program'

/**
 * Fully-qualified, tenant-scoped identity for every Gate subject.
 * Module and Phase IDs are local to their parent, so a local ID alone is
 * never sufficient to read or mutate hierarchy Gate history.
 */
export interface HierarchySubjectRef {
  subjectType: GateSubjectType
  subjectId: string
  orgId: string
  programId: string
  moduleId?: string
  phaseId?: string
}

export type { EvidenceReceipt }

/**
 * Ledger gates accept the shared receipt envelope, while extending its
 * subject vocabulary to the four durable hierarchy subjects. The shared
 * contract intentionally only names cross-program subjects; the ledger must
 * still bind a hierarchy gate to its exact local subject.
 */
export type LedgerEvidenceReceipt = Omit<EvidenceReceipt, 'subject'> & {
  subject: { type: GateSubjectType | 'run'; id: string }
}

export interface GateResult {
  schemaVersion: SchemaVersion
  gateId: string
  subjectType: GateSubjectType
  subjectId: string
  orgId: string
  /** Complete hierarchy identity persisted with the Gate for tenant-safe reads. */
  subjectProgramId: string
  subjectModuleId: string | null
  subjectPhaseId: string | null
  subjectRevision: string
  attempt: number
  evaluator: string
  evaluatorVersion: string
  inputs: Record<string, unknown>
  reasons: string[]
  evidenceReceipts: LedgerEvidenceReceipt[]
  /** Compatibility fields for the original Issue gate API. */
  issueId: string | null
  runId: string | null
  decision: GateDecision
  evidence: Record<string, unknown>
  decidedBy: string | null
  decidedAt: string | null
}

export type LedgerEventType =
  | 'issue.created'
  | 'run.dispatched'
  | 'run.claimed'
  | 'run.heartbeat'
  | 'run.reclaimed'
  | 'run.succeeded'
  | 'run.failed'
  | 'run.cancel_requested'
  | 'run.cancelled'
  | 'gate.decided'
  | 'hierarchy.transitioned'
  | 'issue.completed'
  | 'issue.retry_scheduled'
  | 'issue.repair_required'
  | 'issue.retry_budget_exhausted'

export interface LedgerEvent {
  schemaVersion: SchemaVersion
  eventId: string
  issueId: string | null
  orgId: string
  runId: string | null
  type: LedgerEventType
  payload: Record<string, unknown>
  occurredAt: string
}

/** Manual §20 §60: idempotency record states. */
export type IdempotencyState =
  | 'reserved'
  | 'executing'
  | 'completed'
  | 'failed_safe_to_retry'

export interface IdempotencyRecord {
  schemaVersion: SchemaVersion
  idempotencyKey: string
  issueId: string
  orgId: string
  runId: string | null
  state: IdempotencyState
  createdAt: string
}

/**
 * Derives a stable idempotency key from business intent, not a random
 * retry ID (manual §20 §57-59). Full formula per the manual is
 * issue_type + target + tenant + input_digest + intended_effect +
 * contract_version; target and intended effect remain folded into the
 * program/issue references until a later packet adds explicit fields. Tenant
 * scope is included whenever an Issue has an orgId so identical work in two
 * organizations cannot share a dispatch record.
 */
export function deriveIdempotencyKey(
  issue: Pick<Issue, 'issueType' | 'programRef' | 'inputDigest' | 'issueKey' | 'intendedEffect' | 'target'> & { orgId?: string | null },
): string {
  const canonical = canonicalSerialize({
    contractVersion: SCHEMA_VERSION,
    orgId: issue.orgId ?? DEFAULT_ORG_ID,
    issueKey: issue.issueKey ?? null,
    issueType: issue.issueType,
    programRef: issue.programRef,
    inputDigest: issue.inputDigest,
    intendedEffect: issue.intendedEffect,
    target: issue.target ?? null,
  })
  const digest = createHash('sha256').update(canonical).digest('hex')
  return `ledger-idempotency:v${SCHEMA_VERSION.major}.${SCHEMA_VERSION.minor}:${digest}`
}

/**
 * Deterministic, length-prefixed serialization for identity material.
 * Object keys are sorted and every value carries a type tag and length, so
 * values such as `a:b` and the pair `a`/`b` cannot collapse into the same
 * delimiter-joined string.
 */
export function canonicalSerialize(value: unknown): string {
  if (value === null) return 'null'
  if (typeof value === 'string') return `string:${value.length}:${value}`
  if (typeof value === 'boolean') return `boolean:${value ? 1 : 0}`
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError('canonical serialization requires finite numbers')
    return `number:${String(value)}`
  }
  if (typeof value === 'bigint') return `bigint:${String(value).length}:${String(value)}`
  if (Array.isArray(value)) {
    const items = value.map(canonicalSerialize)
    return `array:${items.length}:${items.map((item) => `${item.length}:${item}`).join('')}`
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right))
    const serialized = entries
      .map(([key, item]) => {
        const encodedKey = canonicalSerialize(key)
        const encodedValue = canonicalSerialize(item)
        return `${encodedKey.length}:${encodedKey}${encodedValue.length}:${encodedValue}`
      })
      .join('')
    return `object:${entries.length}:${serialized}`
  }
  if (typeof value === 'undefined') return 'undefined'
  throw new TypeError(`unsupported canonical serialization type: ${typeof value}`)
}

/**
 * Declares that `issueId` cannot be dispatched until `dependsOnIssueId`
 * has reached `completed` state (i.e. its Gate was accepted).
 *
 * Stored as a separate join record — not as an array column on `Issue` —
 * so the database can enforce both FKs (both issue IDs must exist) and
 * the relationship is queryable without array unnesting. This mirrors the
 * shape used by `runs`, `gate_results`, and `idempotency_records`, which
 * all reference `issues` via FK join records rather than embedding state
 * directly on the Issue row.
 */
export interface IssueDependency {
  /** The Issue that is blocked until its dependency completes. */
  issueId: string
  /** The Issue that must reach `completed` state before `issueId` can be dispatched. */
  dependsOnIssueId: string
  orgId: string
  createdAt: string
}

export interface UnresolvedDependency {
  dependency: IssueDependency
  state: IssueState | null
  reason: 'missing' | 'not_completed' | 'rejected_gate' | 'wrong_org'
}

export interface ProgramCompletion {
  programId: string
  state: WorkState
  totalModules: number
  completedModules: number
  totalIssues: number
  completedIssues: number
  terminalFailures: number
}

export interface LedgerSnapshot {
  schemaVersion: SchemaVersion
  programs: Program[]
  modules: Module[]
  phases: Phase[]
  issues: Issue[]
  runs: Run[]
  idempotency: IdempotencyRecord[]
  gates: GateResult[]
  events: LedgerEvent[]
  dependencies: IssueDependency[]
}
