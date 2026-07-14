import { describe, expect, it } from 'vitest'
import type { LedgerStore } from '../src/store.js'
import { ProgramLedger, LedgerError } from '../src/ledger.js'

/**
 * Shared contract test suite -- proves the manual §62 (Phase 2) exit gate
 * in code:
 *
 *   "A synthetic workflow survives duplicates, worker crash, timeout,
 *    cancellation, and replay. One Issue can be traced through accepted
 *    output and cost. No model owns workflow truth or authority."
 *
 * ("cost" tracing and full Program/Module/Stage hierarchy are out of
 * scope for this first slice -- see src/types.ts scope note.)
 *
 * Run against EVERY `LedgerStore` implementation (in-memory AND
 * Postgres/pglite) so the same correctness properties are proven
 * regardless of backing store -- see tests/exit-gate.spec.ts and
 * tests/postgres-store.spec.ts.
 */
export function runLedgerContractTests(storeName: string, makeStore: () => Promise<LedgerStore> | LedgerStore) {
  async function newLedger() {
    return new ProgramLedger(await makeStore())
  }

  describe(`[${storeName}] duplicate dispatch`, () => {
    it('does not create two Runs when dispatch is called twice for the same Issue', async () => {
      const ledger = await newLedger()
      const issue = await ledger.createIssue({
        issueType: 'test.synthetic',
        programRef: 'program-1',
        input: { foo: 'bar' },
      })

      const runA = await ledger.dispatch(issue.issueId)
      const runB = await ledger.dispatch(issue.issueId)

      expect(runB.runId).toBe(runA.runId)
    })
  })

  describe(`[${storeName}] worker crash and lease reclaim`, () => {
    it('lets a second executor claim a Run after the first crashes (lease expires), and invalidates the crashed worker', async () => {
      const ledger = await newLedger()
      const issue = await ledger.createIssue({
        issueType: 'test.synthetic',
        programRef: 'program-1',
        input: { foo: 'bar' },
      })
      const run = await ledger.dispatch(issue.issueId)

      const claimedByA = await ledger.claim(run.runId, 'executor-a', 1)
      const staleFencingToken = claimedByA.lease!.fencingToken

      await new Promise((resolve) => setTimeout(resolve, 5))
      const reclaimed = await ledger.reclaimExpiredLeases()
      expect(reclaimed.map((r) => r.runId)).toContain(run.runId)

      const claimedByB = await ledger.claim(run.runId, 'executor-b', 30_000)
      expect(claimedByB.lease!.fencingToken).toBeGreaterThan(staleFencingToken)

      await expect(ledger.complete(run.runId, staleFencingToken, { result: 'from-zombie-a' })).rejects.toThrow(
        LedgerError,
      )

      const completed = await ledger.complete(run.runId, claimedByB.lease!.fencingToken, { result: 'from-b' })
      expect(completed.state).toBe('succeeded')
      expect(completed.output).toEqual({ result: 'from-b' })
    })

    it('rejects a zombie write in the window between reclaim and the NEXT claim (not just after re-claim)', async () => {
      const ledger = await newLedger()
      const issue = await ledger.createIssue({
        issueType: 'test.synthetic',
        programRef: 'program-1',
        input: { foo: 'bar' },
      })
      const run = await ledger.dispatch(issue.issueId)
      const claimedByA = await ledger.claim(run.runId, 'executor-a', 1)
      const staleFencingToken = claimedByA.lease!.fencingToken

      await new Promise((resolve) => setTimeout(resolve, 5))
      await ledger.reclaimExpiredLeases()

      // Nobody has re-claimed the Run yet. The crashed worker's token
      // must already be invalid at this point, not just after someone
      // else claims it.
      await expect(ledger.complete(run.runId, staleFencingToken, { result: 'zombie-write' })).rejects.toThrow(
        LedgerError,
      )
    })
  })

  describe(`[${storeName}] timeout / retry`, () => {
    it('schedules a retry on a retryable failure, and a fresh dispatch produces a brand-new Run', async () => {
      const ledger = await newLedger()
      const issue = await ledger.createIssue({
        issueType: 'test.synthetic',
        programRef: 'program-1',
        input: { foo: 'bar' },
        maxAttempts: 3,
      })
      const run1 = await ledger.dispatch(issue.issueId)
      const claimed = await ledger.claim(run1.runId, 'executor-a')

      const failed = await ledger.fail(run1.runId, claimed.lease!.fencingToken, 'timeout_uncertain', 'no response')
      expect(failed.state).toBe('failed_retryable')

      const run2 = await ledger.retryIssue(issue.issueId)
      expect(run2.runId).not.toBe(run1.runId)
      expect(run2.attemptNumber).toBe(2)
    })

    it('stops retrying once maxAttempts is exhausted', async () => {
      const ledger = await newLedger()
      const issue = await ledger.createIssue({
        issueType: 'test.synthetic',
        programRef: 'program-1',
        input: { foo: 'bar' },
        maxAttempts: 1,
      })
      const run1 = await ledger.dispatch(issue.issueId)
      const claimed = await ledger.claim(run1.runId, 'executor-a')
      await ledger.fail(run1.runId, claimed.lease!.fencingToken, 'transient_infrastructure', 'network blip')

      await expect(ledger.retryIssue(issue.issueId)).rejects.toThrow(LedgerError)
    })
  })

  describe(`[${storeName}] cancellation`, () => {
    it('cooperatively cancels a running Issue: marks the Run cancel_requested, then confirms', async () => {
      const ledger = await newLedger()
      const issue = await ledger.createIssue({
        issueType: 'test.synthetic',
        programRef: 'program-1',
        input: { foo: 'bar' },
      })
      const run = await ledger.dispatch(issue.issueId)
      const claimed = await ledger.claim(run.runId, 'executor-a')

      const afterCancelRequest = await ledger.cancelRequest(issue.issueId)
      expect(afterCancelRequest.cancelRequested).toBe(true)

      const confirmed = await ledger.confirmCancelled(run.runId, claimed.lease!.fencingToken)
      expect(confirmed.state).toBe('cancelled')
    })

    it('cancels immediately when nothing has been dispatched yet', async () => {
      const ledger = await newLedger()
      const issue = await ledger.createIssue({
        issueType: 'test.synthetic',
        programRef: 'program-1',
        input: { foo: 'bar' },
      })
      const cancelled = await ledger.cancelRequest(issue.issueId)
      expect(cancelled.state).toBe('cancelled')
    })
  })

  describe(`[${storeName}] replay does not corrupt history`, () => {
    it('every attempt is a distinct, immutable Run; a Gate rejection followed by retry creates a new Run, not a mutated one', async () => {
      const ledger = await newLedger()
      const issue = await ledger.createIssue({
        issueType: 'test.synthetic',
        programRef: 'program-1',
        input: { foo: 'bar' },
        maxAttempts: 3,
      })
      const run1 = await ledger.dispatch(issue.issueId)
      const claimed1 = await ledger.claim(run1.runId, 'executor-a')
      await ledger.complete(run1.runId, claimed1.lease!.fencingToken, { draft: 'v1' })

      const gate = await ledger.decideGate(issue.issueId, run1.runId, 'rejected', { reason: 'incomplete' }, 'reviewer-1')
      expect(gate.decision).toBe('rejected')

      const run2 = await ledger.retryIssue(issue.issueId)
      expect(run2.runId).not.toBe(run1.runId)
      expect(run2.attemptNumber).toBe(2)

      const claimed2 = await ledger.claim(run2.runId, 'executor-b')
      await ledger.complete(run2.runId, claimed2.lease!.fencingToken, { draft: 'v2-fixed' })
      const finalGate = await ledger.decideGate(issue.issueId, run2.runId, 'accepted', {}, 'reviewer-1')
      expect(finalGate.decision).toBe('accepted')
    })

    it('bounds Gate-rejection-triggered retries by maxAttempts too, not just Run-failure retries', async () => {
      const ledger = await newLedger()
      const issue = await ledger.createIssue({
        issueType: 'test.synthetic',
        programRef: 'program-1',
        input: { foo: 'bar' },
        maxAttempts: 2,
      })

      const run1 = await ledger.dispatch(issue.issueId)
      const claimed1 = await ledger.claim(run1.runId, 'executor-a')
      await ledger.complete(run1.runId, claimed1.lease!.fencingToken, { draft: 'v1' })
      await ledger.decideGate(issue.issueId, run1.runId, 'rejected', {}, 'reviewer-1')

      const run2 = await ledger.retryIssue(issue.issueId)
      expect(run2.attemptNumber).toBe(2)
      const claimed2 = await ledger.claim(run2.runId, 'executor-b')
      await ledger.complete(run2.runId, claimed2.lease!.fencingToken, { draft: 'v2' })
      await ledger.decideGate(issue.issueId, run2.runId, 'rejected', {}, 'reviewer-1')

      // maxAttempts is 2, and both attempts are now exhausted -- a third
      // retry must be refused, even though the trigger is a Gate
      // rejection rather than a Run failure.
      await expect(ledger.retryIssue(issue.issueId)).rejects.toThrow(LedgerError)
    })
  })

  describe(`[${storeName}] traceability`, () => {
    it('every state transition for an Issue is recorded as an ordered, append-only event trail', async () => {
      const store = await makeStore()
      const ledger = new ProgramLedger(store)
      const issue = await ledger.createIssue({
        issueType: 'test.synthetic',
        programRef: 'program-1',
        input: { foo: 'bar' },
      })
      const run = await ledger.dispatch(issue.issueId)
      const claimed = await ledger.claim(run.runId, 'executor-a')
      await ledger.complete(run.runId, claimed.lease!.fencingToken, { result: 'ok' })
      await ledger.decideGate(issue.issueId, run.runId, 'accepted', {}, 'reviewer-1')

      const events = await store.listEvents(issue.issueId)
      expect(events.map((e) => e.type)).toEqual([
        'issue.created',
        'run.dispatched',
        'run.claimed',
        'run.succeeded',
        'gate.decided',
        'issue.completed',
      ])
      expect(events.every((e) => e.issueId === issue.issueId)).toBe(true)
      expect(events.slice(1).every((e) => e.runId === run.runId)).toBe(true)
    })
  })

  describe(`[${storeName}] Gate authority`, () => {
    it('a Run succeeding does not by itself complete the Issue -- only an accepted Gate does', async () => {
      const ledger = await newLedger()
      const issue = await ledger.createIssue({
        issueType: 'test.synthetic',
        programRef: 'program-1',
        input: { foo: 'bar' },
      })
      const run = await ledger.dispatch(issue.issueId)
      const claimed = await ledger.claim(run.runId, 'executor-a')
      await ledger.complete(run.runId, claimed.lease!.fencingToken, { result: 'ok' })

      const gate = await ledger.decideGate(issue.issueId, run.runId, 'accepted', { checked: true }, 'reviewer-1')
      expect(gate.decision).toBe('accepted')
    })
  })
}
