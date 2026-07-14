import { describe, expect, it } from 'vitest'
import { InMemoryLedgerStore } from '../src/store.js'
import { ProgramLedger } from '../src/ledger.js'
import { HierarchyRegistry } from '../src/hierarchy.js'
import {
  ExecutorRegistry,
  NoExecutorAvailableError,
  SyntheticAlwaysFailExecutor,
  SyntheticEchoExecutor,
  runIssueOnce,
} from '../src/executor.js'

/**
 * Proves one full, real, end-to-end Issue lifecycle through the Program
 * Ledger using an actual executor (a synthetic one, per manual §62's
 * "synthetic workflow" language) -- not just individual ledger method
 * calls in isolation, which is what tests/ledgerContract.shared.ts
 * already covers. This is the first evidence that a real executor
 * runtime pattern (register -> find -> claim -> execute -> complete)
 * works end to end against this ledger.
 */

describe('end-to-end synthetic Issue lifecycle', () => {
  it('runs a real Issue from creation through Gate acceptance using a registered executor', async () => {
    const ledger = new ProgramLedger(new InMemoryLedgerStore(), new HierarchyRegistry())
    const registry = new ExecutorRegistry()
    registry.register(new SyntheticEchoExecutor())

    const issue = await ledger.createIssue({
      issueType: 'test.synthetic.echo',
      programRef: 'linksites',
      moduleRef: 'M07',
      input: { prospectName: 'Acme Plumbing' },
    })
    expect(issue.state).toBe('ready')

    const run = await runIssueOnce(ledger, registry, issue.issueId)
    expect(run.state).toBe('succeeded')
    expect(run.output).toEqual({ echoed: { prospectName: 'Acme Plumbing' } })

    const afterRun = await ledger.getIssue(issue.issueId)
    expect(afterRun!.state).toBe('awaiting_gate')

    // Gate acceptance is a distinct authority the executor never claimed
    // for itself -- runIssueOnce() only got the Issue to awaiting_gate.
    const gate = await ledger.decideGate(issue.issueId, run.runId, 'accepted', { checked: true }, 'reviewer-1')
    expect(gate.decision).toBe('accepted')

    const finalIssue = await ledger.getIssue(issue.issueId)
    expect(finalIssue!.state).toBe('completed')

    // Traceability: the whole lifecycle is in the event trail.
    // (Re-using the ledger's own store would require exposing it, so
    // this asserts via the final Issue state and Run output instead --
    // the append-only event trail itself is already covered by
    // tests/ledgerContract.shared.ts's traceability test.)
  })

  it('runs a failing synthetic executor through to a terminal failure end to end', async () => {
    const ledger = new ProgramLedger(new InMemoryLedgerStore())
    const registry = new ExecutorRegistry()
    registry.register(new SyntheticAlwaysFailExecutor())

    const issue = await ledger.createIssue({
      issueType: 'test.synthetic.always_fail',
      programRef: 'linksites',
      input: {},
    })

    const run = await runIssueOnce(ledger, registry, issue.issueId)
    expect(run.state).toBe('failed_terminal')
    expect(run.failure).toEqual({ failureClass: 'code_defect', message: 'synthetic deterministic failure for testing' })

    const finalIssue = await ledger.getIssue(issue.issueId)
    expect(finalIssue!.state).toBe('failed')
  })

  it('throws NoExecutorAvailableError when no registered executor can handle the Issue type', async () => {
    const ledger = new ProgramLedger(new InMemoryLedgerStore())
    const registry = new ExecutorRegistry() // nothing registered

    const issue = await ledger.createIssue({
      issueType: 'test.synthetic.echo',
      programRef: 'linksites',
      input: {},
    })

    await expect(runIssueOnce(ledger, registry, issue.issueId)).rejects.toThrow(NoExecutorAvailableError)
  })
})
