/**
 * Executor Registry and a deterministic execution driver (Phase 2, Issue
 * phase2-executor-registry-001).
 *
 * Manual §20 §42/§46 describes executor adapters and an 8-level
 * model-routing ladder (deterministic code -> ... -> human/OpenClaw
 * exception). This is a deliberately small first slice: a registry that
 * maps an `issueType` to the `ExecutorAdapter` that knows how to perform
 * it, plus a `runIssueOnce()` driver that performs one real dispatch ->
 * claim -> execute -> complete/fail cycle against the Program Ledger.
 * The full routing ladder, model pinning, and executor security
 * envelopes (manual §18.70-73) are explicitly NOT built here -- this is
 * only enough to prove one real executor can drive an Issue through the
 * ledger end to end (manual §98.4's "one Issue can be traced through
 * accepted output" language), not a production executor framework.
 */

import type { FailureClass, Issue, Run } from './types.js'
import type { ProgramLedger } from './ledger.js'

export type ExecutorResult = { kind: 'success'; output: unknown } | { kind: 'failure'; failureClass: FailureClass; message: string }

export interface ExecutorAdapter {
  readonly executorId: string
  canHandle(issueType: string): boolean
  execute(issue: Issue, run: Run): Promise<ExecutorResult>
}

export class ExecutorRegistry {
  private readonly adapters: ExecutorAdapter[] = []

  register(adapter: ExecutorAdapter): void {
    this.adapters.push(adapter)
  }

  findFor(issueType: string): ExecutorAdapter | null {
    return this.adapters.find((a) => a.canHandle(issueType)) ?? null
  }
}

export class NoExecutorAvailableError extends Error {
  constructor(issueType: string) {
    super(`No registered executor can handle issueType "${issueType}".`)
    this.name = 'NoExecutorAvailableError'
  }
}

/**
 * Performs one real dispatch -> claim -> execute -> complete/fail cycle
 * for a `ready`/`retry_scheduled` Issue, using whichever registered
 * executor claims to handle its `issueType`. This stands in for what a
 * real worker runtime (n8n, CrewAI, Agent Zero, a Cursor/Codex agent,
 * etc.) would do in a polling or event-driven loop -- it is a
 * deterministic, synchronous driver for tests and synthetic workflows,
 * not a production scheduler.
 *
 * Does NOT decide the Gate -- per manual §20 §32, Gate acceptance is a
 * distinct authority the executor cannot self-declare. Callers must call
 * `ledger.decideGate()` separately after this returns.
 */
export async function runIssueOnce(
  ledger: ProgramLedger,
  registry: ExecutorRegistry,
  issueId: string,
): Promise<Run> {
  const run = await ledger.dispatch(issueId)
  const issue = await ledger.getIssue(issueId)
  if (!issue) throw new Error(`Issue ${issueId} not found`)

  const adapter = registry.findFor(issue.issueType)
  if (!adapter) {
    throw new NoExecutorAvailableError(issue.issueType)
  }

  const claimed = await ledger.claim(run.runId, adapter.executorId)
  const fencingToken = claimed.lease!.fencingToken

  const result = await adapter.execute(issue, claimed)

  if (result.kind === 'success') {
    return ledger.complete(run.runId, fencingToken, result.output)
  }
  return ledger.fail(run.runId, fencingToken, result.failureClass, result.message)
}

/**
 * A deterministic synthetic executor for `test.synthetic.echo` Issues --
 * used to prove the full ledger lifecycle end to end without depending
 * on any real LiNKsites capability (Payload, Supabase, an AI model, etc.).
 * This is the "synthetic workflow" the manual's Phase 2 exit gate (§62)
 * refers to.
 */
export class SyntheticEchoExecutor implements ExecutorAdapter {
  readonly executorId = 'synthetic-echo-executor'

  canHandle(issueType: string): boolean {
    return issueType === 'test.synthetic.echo'
  }

  async execute(issue: Issue): Promise<ExecutorResult> {
    return { kind: 'success', output: { echoed: issue.input } }
  }
}

/** A synthetic executor that always fails, for testing failure/retry paths end to end. */
export class SyntheticAlwaysFailExecutor implements ExecutorAdapter {
  readonly executorId = 'synthetic-always-fail-executor'

  canHandle(issueType: string): boolean {
    return issueType === 'test.synthetic.always_fail'
  }

  async execute(): Promise<ExecutorResult> {
    return { kind: 'failure', failureClass: 'code_defect', message: 'synthetic deterministic failure for testing' }
  }
}
