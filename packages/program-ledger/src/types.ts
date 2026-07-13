/**
 * Program Ledger — core contracts (Phase 2 foundation).
 *
 * Implements the Issue/Run/Gate/Event/Idempotency model required by the
 * LiNKsites Program Manual §20 (Issues, Runs, Executors, Model Routing,
 * Idempotency, Retry, and Compensation) and §04 (state model doctrine).
 *
 * Versioned per docs/policies/CONTRACT_AND_SCHEMA_VERSIONING_POLICY.md:
 * every contract below carries an explicit `schemaVersion` as a
 * MAJOR.MINOR pair. This is version 1.0 — the first version, not an
 * implicit/unversioned baseline.
 *
 * Scope note: this is a deliberately bounded first slice of the manual's
 * full Program Ledger doctrine. It implements the mechanics the manual's
 * Phase 2 exit gate requires (idempotent dispatch, lease/fencing-based
 * claim, heartbeat-based crash detection, cooperative cancellation, and
 * Gate-gated completion that a Run cannot self-declare). It deliberately
 * does NOT yet implement: Program/Module/Stage hierarchy objects (Issues
 * reference them only as opaque string IDs for now), the full dependency
 * DAG (requires_completion/requires_gate/etc.), the 8-level model-routing
 * ladder, compensation Sagas, or cross-Program outbox/inbox. Those are
 * separate, later work packets — see audit/14_implementation_roadmap.md.
 */

export const SCHEMA_VERSION = { major: 1, minor: 0 } as const

export type SchemaVersion = { major: number; minor: number }

/** Manual §20 §15: Issue lifecycle states (subset — draft/blocked/dependency-DAG
 * evaluation is deferred; Issues in this slice start at `ready`). */
export type IssueState =
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

export interface Issue {
  schemaVersion: SchemaVersion
  issueId: string
  issueType: string
  /** Opaque references — Program/Module/Stage objects don't exist yet (see scope note above). */
  programRef: string
  moduleRef?: string
  stageRef?: string
  state: IssueState
  input: Record<string, unknown>
  inputDigest: string
  sideEffectClass: SideEffectClass
  retryPolicy: RetryPolicy
  timeoutMs: number
  attemptCount: number
  createdAt: string
  updatedAt: string
  cancelRequested: boolean
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
  attemptNumber: number
  state: RunState
  /** Immutable input snapshot pinned at Run creation (manual §20 §21). */
  inputSnapshot: Record<string, unknown>
  lease: Lease | null
  output: unknown | null
  failure: { failureClass: FailureClass; message: string } | null
  createdAt: string
  claimedAt: string | null
  lastHeartbeatAt: string | null
  completedAt: string | null
}

export type GateDecision = 'pending' | 'accepted' | 'rejected'

export interface GateResult {
  schemaVersion: SchemaVersion
  gateId: string
  issueId: string
  runId: string
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
  | 'issue.completed'
  | 'issue.retry_scheduled'
  | 'issue.repair_required'

export interface LedgerEvent {
  schemaVersion: SchemaVersion
  eventId: string
  issueId: string
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
  runId: string | null
  state: IdempotencyState
  createdAt: string
}

/**
 * Derives a stable idempotency key from business intent, not a random
 * retry ID (manual §20 §57-59). Full formula per the manual is
 * issue_type + target + tenant + input_digest + intended_effect +
 * contract_version; this slice has no explicit tenant/target/
 * intended-effect fields yet (Program/Module hierarchy is not built), so
 * those are folded into `programRef`/`issueType` for now — revisit when
 * the full Program/Module/Stage objects exist.
 */
export function deriveIdempotencyKey(issue: Pick<Issue, 'issueType' | 'programRef' | 'inputDigest'>): string {
  return `${issue.issueType}:${issue.programRef}:${issue.inputDigest}:v${SCHEMA_VERSION.major}.${SCHEMA_VERSION.minor}`
}
