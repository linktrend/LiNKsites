import { describe, expect, it } from 'vitest'
import type { LedgerStore } from '../src/store.js'
import { ProgramLedger, LedgerError } from '../src/ledger.js'

/**
 * Shared dependency test suite. Runs against EVERY `LedgerStore`
 * implementation (in-memory AND Postgres/pglite) to prove all four
 * dependency-satisfaction scenarios:
 *
 *   (a) Satisfied dependency (accepted Gate)    → IS dispatchable
 *   (b) Unsatisfied dependency                  → NOT dispatchable, clear error
 *   (c) Multiple dependencies, all required     → ALL must be satisfied
 *   (d) Zero dependencies                       → unchanged behaviour (regression)
 *
 * The guard is enforced inside `dispatch()`, which is the single,
 * unavoidable entry point into Run creation for any executor.
 */
export function runDependencyTests(storeName: string, makeStore: () => Promise<LedgerStore> | LedgerStore) {
  async function newLedger() {
    return new ProgramLedger(await makeStore())
  }

  /** Helper: drive an Issue through the full accepted-Gate lifecycle. */
  async function runThroughAcceptedGate(ledger: ProgramLedger, issueId: string): Promise<void> {
    const run = await ledger.dispatch(issueId)
    const claimed = await ledger.claim(run.runId, 'executor-a')
    await ledger.complete(run.runId, claimed.lease!.fencingToken, { result: 'ok' })
    await ledger.decideGate(issueId, run.runId, 'accepted', {}, 'reviewer-1')
  }

  // -----------------------------------------------------------------------
  // (a) Satisfied dependency: dependency Issue has an accepted Gate
  // -----------------------------------------------------------------------
  describe(`[${storeName}] (a) satisfied dependency → dispatchable`, () => {
    it('allows dispatch when the single declared dependency has reached completed state', async () => {
      const ledger = await newLedger()

      const dep = await ledger.createIssue({
        issueType: 'test.dep',
        programRef: 'program-1',
        input: { step: 'first' },
      })
      await runThroughAcceptedGate(ledger, dep.issueId)
      const depAfter = await ledger.getIssue(dep.issueId)
      expect(depAfter!.state).toBe('completed')

      const downstream = await ledger.createIssue({
        issueType: 'test.downstream',
        programRef: 'program-1',
        input: { step: 'second' },
        dependsOn: [dep.issueId],
      })

      // Must NOT throw.
      const run = await ledger.dispatch(downstream.issueId)
      expect(run.issueId).toBe(downstream.issueId)
      expect(run.state).toBe('queued')
    })

    it('allows dispatch when a dependency that was previously rejected is later accepted', async () => {
      const ledger = await newLedger()

      const dep = await ledger.createIssue({
        issueType: 'test.dep',
        programRef: 'program-1',
        input: { step: 'first' },
        maxAttempts: 3,
      })

      // First attempt: gate rejected.
      const run1 = await ledger.dispatch(dep.issueId)
      const claimed1 = await ledger.claim(run1.runId, 'executor-a')
      await ledger.complete(run1.runId, claimed1.lease!.fencingToken, { draft: 'v1' })
      await ledger.decideGate(dep.issueId, run1.runId, 'rejected', {}, 'reviewer-1')

      const downstream = await ledger.createIssue({
        issueType: 'test.downstream',
        programRef: 'program-1',
        input: { step: 'second' },
        dependsOn: [dep.issueId],
      })

      // Downstream must be blocked while dep is in repair_required.
      await expect(ledger.dispatch(downstream.issueId)).rejects.toThrow(LedgerError)

      // Retry dep and get it accepted.
      const run2 = await ledger.retryIssue(dep.issueId)
      const claimed2 = await ledger.claim(run2.runId, 'executor-b')
      await ledger.complete(run2.runId, claimed2.lease!.fencingToken, { draft: 'v2-fixed' })
      await ledger.decideGate(dep.issueId, run2.runId, 'accepted', {}, 'reviewer-1')

      // Now downstream IS dispatchable.
      const downstreamRun = await ledger.dispatch(downstream.issueId)
      expect(downstreamRun.state).toBe('queued')
    })
  })

  // -----------------------------------------------------------------------
  // (b) Unsatisfied dependency → NOT dispatchable
  // -----------------------------------------------------------------------
  describe(`[${storeName}] (b) unsatisfied dependency → blocked with clear error`, () => {
    it('blocks dispatch and throws LedgerError(dependency_not_satisfied) when dependency is in ready state (never started)', async () => {
      const ledger = await newLedger()

      const dep = await ledger.createIssue({
        issueType: 'test.dep',
        programRef: 'program-1',
        input: { step: 'first' },
      })

      const downstream = await ledger.createIssue({
        issueType: 'test.downstream',
        programRef: 'program-1',
        input: { step: 'second' },
        dependsOn: [dep.issueId],
      })

      const err = await ledger.dispatch(downstream.issueId).catch((e) => e)
      expect(err).toBeInstanceOf(LedgerError)
      expect((err as LedgerError).code).toBe('dependency_not_satisfied')
      expect((err as LedgerError).message).toMatch(/dependency Issue/)
      expect((err as LedgerError).message).toMatch(/accepted Gate/)
    })

    it('blocks dispatch when dependency Gate is pending (run succeeded but gate not decided)', async () => {
      const ledger = await newLedger()

      const dep = await ledger.createIssue({
        issueType: 'test.dep',
        programRef: 'program-1',
        input: { step: 'first' },
      })

      // Dispatch and run dep — but do NOT decide the Gate yet.
      const depRun = await ledger.dispatch(dep.issueId)
      const claimed = await ledger.claim(depRun.runId, 'executor-a')
      await ledger.complete(depRun.runId, claimed.lease!.fencingToken, { result: 'ok' })
      // dep.state is now 'awaiting_gate' — not 'completed'.

      const downstream = await ledger.createIssue({
        issueType: 'test.downstream',
        programRef: 'program-1',
        input: { step: 'second' },
        dependsOn: [dep.issueId],
      })

      const err = await ledger.dispatch(downstream.issueId).catch((e) => e)
      expect(err).toBeInstanceOf(LedgerError)
      expect((err as LedgerError).code).toBe('dependency_not_satisfied')
    })

    it('blocks dispatch when dependency Gate was rejected (dep in repair_required state)', async () => {
      const ledger = await newLedger()

      const dep = await ledger.createIssue({
        issueType: 'test.dep',
        programRef: 'program-1',
        input: { step: 'first' },
        maxAttempts: 3,
      })
      const depRun = await ledger.dispatch(dep.issueId)
      const claimed = await ledger.claim(depRun.runId, 'executor-a')
      await ledger.complete(depRun.runId, claimed.lease!.fencingToken, { draft: 'v1' })
      await ledger.decideGate(dep.issueId, depRun.runId, 'rejected', {}, 'reviewer-1')
      // dep.state is now 'repair_required' — not 'completed'.

      const downstream = await ledger.createIssue({
        issueType: 'test.downstream',
        programRef: 'program-1',
        input: { step: 'second' },
        dependsOn: [dep.issueId],
      })

      const err = await ledger.dispatch(downstream.issueId).catch((e) => e)
      expect(err).toBeInstanceOf(LedgerError)
      expect((err as LedgerError).code).toBe('dependency_not_satisfied')
    })

    it('blocks dispatch when declared dependency Issue does not exist in the ledger', async () => {
      const ledger = await newLedger()

      const nonExistentIssueId = '00000000-dead-beef-0000-000000000000'

      const downstream = await ledger.createIssue({
        issueType: 'test.downstream',
        programRef: 'program-1',
        input: { step: 'second' },
        dependsOn: [nonExistentIssueId],
      })

      const err = await ledger.dispatch(downstream.issueId).catch((e) => e)
      expect(err).toBeInstanceOf(LedgerError)
      expect((err as LedgerError).code).toBe('dependency_not_satisfied')
      expect((err as LedgerError).message).toMatch(/does not exist/)
    })
  })

  // -----------------------------------------------------------------------
  // (c) Multiple dependencies — ALL must be satisfied
  // -----------------------------------------------------------------------
  describe(`[${storeName}] (c) multiple dependencies — all required, not just one`, () => {
    it('blocks dispatch when only the first of two dependencies is satisfied', async () => {
      const ledger = await newLedger()

      const dep1 = await ledger.createIssue({
        issueType: 'test.dep',
        programRef: 'program-1',
        input: { step: 'first' },
      })
      const dep2 = await ledger.createIssue({
        issueType: 'test.dep',
        programRef: 'program-1',
        input: { step: 'second' },
      })

      // Satisfy only dep1.
      await runThroughAcceptedGate(ledger, dep1.issueId)

      const downstream = await ledger.createIssue({
        issueType: 'test.downstream',
        programRef: 'program-1',
        input: { step: 'third' },
        dependsOn: [dep1.issueId, dep2.issueId],
      })

      const err = await ledger.dispatch(downstream.issueId).catch((e) => e)
      expect(err).toBeInstanceOf(LedgerError)
      expect((err as LedgerError).code).toBe('dependency_not_satisfied')
    })

    it('blocks dispatch when only the second of two dependencies is satisfied', async () => {
      const ledger = await newLedger()

      const dep1 = await ledger.createIssue({
        issueType: 'test.dep',
        programRef: 'program-1',
        input: { step: 'first' },
      })
      const dep2 = await ledger.createIssue({
        issueType: 'test.dep',
        programRef: 'program-1',
        input: { step: 'second' },
      })

      // Satisfy only dep2.
      await runThroughAcceptedGate(ledger, dep2.issueId)

      const downstream = await ledger.createIssue({
        issueType: 'test.downstream',
        programRef: 'program-1',
        input: { step: 'third' },
        dependsOn: [dep1.issueId, dep2.issueId],
      })

      const err = await ledger.dispatch(downstream.issueId).catch((e) => e)
      expect(err).toBeInstanceOf(LedgerError)
      expect((err as LedgerError).code).toBe('dependency_not_satisfied')
    })

    it('allows dispatch only when ALL dependencies are satisfied', async () => {
      const ledger = await newLedger()

      const dep1 = await ledger.createIssue({
        issueType: 'test.dep',
        programRef: 'program-1',
        input: { step: 'first' },
      })
      const dep2 = await ledger.createIssue({
        issueType: 'test.dep',
        programRef: 'program-1',
        input: { step: 'second' },
      })
      const dep3 = await ledger.createIssue({
        issueType: 'test.dep',
        programRef: 'program-1',
        input: { step: 'third' },
      })

      // Satisfy all three.
      await runThroughAcceptedGate(ledger, dep1.issueId)
      await runThroughAcceptedGate(ledger, dep2.issueId)
      await runThroughAcceptedGate(ledger, dep3.issueId)

      const downstream = await ledger.createIssue({
        issueType: 'test.downstream',
        programRef: 'program-1',
        input: { step: 'fourth' },
        dependsOn: [dep1.issueId, dep2.issueId, dep3.issueId],
      })

      const run = await ledger.dispatch(downstream.issueId)
      expect(run.state).toBe('queued')
    })
  })

  // -----------------------------------------------------------------------
  // (d) Zero dependencies — exactly the same behaviour as before
  // -----------------------------------------------------------------------
  describe(`[${storeName}] (d) zero dependencies — no regression for existing issue types`, () => {
    it('allows dispatch immediately for an Issue with no declared dependencies', async () => {
      const ledger = await newLedger()

      const issue = await ledger.createIssue({
        issueType: 'test.independent',
        programRef: 'program-1',
        input: { data: 'standalone' },
      })

      const run = await ledger.dispatch(issue.issueId)
      expect(run.issueId).toBe(issue.issueId)
      expect(run.state).toBe('queued')
    })

    it('allows dispatch for an Issue created with an explicit empty dependsOn array', async () => {
      const ledger = await newLedger()

      const issue = await ledger.createIssue({
        issueType: 'test.independent',
        programRef: 'program-1',
        input: { data: 'standalone' },
        dependsOn: [],
      })

      const run = await ledger.dispatch(issue.issueId)
      expect(run.state).toBe('queued')
    })

    it('full lifecycle (create → dispatch → claim → complete → gate) still works unchanged for dependency-free issues', async () => {
      const ledger = await newLedger()

      const issue = await ledger.createIssue({
        issueType: 'test.independent',
        programRef: 'program-1',
        input: { x: 1 },
      })
      const run = await ledger.dispatch(issue.issueId)
      const claimed = await ledger.claim(run.runId, 'executor-a')
      await ledger.complete(run.runId, claimed.lease!.fencingToken, { result: 'done' })
      const gate = await ledger.decideGate(issue.issueId, run.runId, 'accepted', {}, 'reviewer-1')
      expect(gate.decision).toBe('accepted')
      const final = await ledger.getIssue(issue.issueId)
      expect(final!.state).toBe('completed')
    })
  })
}
