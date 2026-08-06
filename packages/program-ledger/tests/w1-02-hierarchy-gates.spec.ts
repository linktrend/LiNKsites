import { describe, expect, it } from 'vitest'
import { HierarchyRegistry, LINKSITES_PROGRAM } from '../src/hierarchy.js'
import { ProgramLedger } from '../src/ledger.js'
import { InMemoryLedgerStore, type InMemoryHierarchyGateFailurePoint } from '../src/store.js'
import { deriveIdempotencyKey } from '../src/types.js'
import { canonicalEvidence } from './evidence.js'

describe('W1-02 durable hierarchy and gates', () => {
  const duplicateIdentityDefinition = {
    schemaVersion: { major: 1, minor: 0 },
    programId: 'duplicate-program',
    title: 'Duplicate identity test program',
    modules: [{ moduleId: 'M1', title: 'Duplicate Module', purpose: 'Test', band: 'control-improvement' as const, phases: [{ phaseId: 'P1', title: 'Duplicate Phase', objective: 'Test', issues: [{ issueKey: 'duplicate-issue', title: 'Issue', issueType: 'test.duplicate', objective: 'Test', dependsOnIssueKeys: [] }] }] }],
  }

  it('seeds a non-empty Program -> Module -> Phase -> Issue graph', async () => {
    const store = new InMemoryLedgerStore()
    const ledger = new ProgramLedger(store, new HierarchyRegistry())
    const seeded = await ledger.seedProgramGraph()

    expect(seeded.program.programId).toBe(LINKSITES_PROGRAM.programId)
    expect(seeded.modules.filter((module) => module.moduleId >= 'M07' && module.moduleId <= 'M12')).toHaveLength(6)
    expect(seeded.phases.length).toBeGreaterThan(0)
    expect(seeded.issues.length).toBe(16)
    expect((await store.listPhases('linksites', 'M07')).map((phase) => phase.phaseId)).toEqual(['intake'])
    expect((await ledger.getRunnableIssues({ programId: 'linksites' })).map((issue) => issue.issueKey)).toEqual(['foundation-reservation', 'lead-research'])
  })

  it('allows safe parallel readiness and blocks a dependent after gate rejection', async () => {
    const store = new InMemoryLedgerStore()
    const ledger = new ProgramLedger(store)
    const first = await ledger.createIssue({ issueKey: 'first', issueType: 'test.first', programRef: 'linksites', input: {} })
    const second = await ledger.createIssue({ issueKey: 'second', issueType: 'test.second', programRef: 'linksites', input: {}, dependsOn: [first.issueId] })
    const parallel = await ledger.getRunnableIssues()
    expect(parallel.map((issue) => issue.issueId)).toEqual([first.issueId])

    const run = await ledger.dispatch(first.issueId)
    const claim = await ledger.claim(run.runId, 'worker-a')
    await ledger.complete(run.runId, claim.lease!.fencingToken, { output: 'first' })
    await ledger.decideGate(first.issueId, run.runId, 'rejected', { reason: 'missing receipt' }, 'reviewer')
    expect(await ledger.getUnresolvedDependencies(second.issueId)).toEqual([
      expect.objectContaining({ reason: 'rejected_gate', state: 'repair_required' }),
    ])
    await expect(ledger.dispatch(second.issueId)).rejects.toMatchObject({ code: 'dependency_not_satisfied' })
  })

  it('performs an atomic competing claim with at most one active owner', async () => {
    const ledger = new ProgramLedger(new InMemoryLedgerStore())
    const issue = await ledger.createIssue({ issueType: 'test.claim', programRef: 'linksites', input: {} })
    const run = await ledger.dispatch(issue.issueId)
    const results = await Promise.allSettled([ledger.claim(run.runId, 'worker-a'), ledger.claim(run.runId, 'worker-b')])
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1)
    expect(results.filter((result) => result.status === 'rejected')).toHaveLength(1)
  })

  it('rejects an evidence-less Issue PASS and records all four gate subject types', async () => {
    const store = new InMemoryLedgerStore()
    const ledger = new ProgramLedger(store)
    const graph = await ledger.seedProgramGraph({
      schemaVersion: { major: 1, minor: 0 },
      programId: 'test-program',
      title: 'Test Program',
      modules: [{
        moduleId: 'M01', title: 'Test Module', purpose: 'Test', band: 'control-improvement', phases: [{
          phaseId: 'phase-1', title: 'Test Phase', objective: 'Test', issues: [{ issueKey: 'issue-1', title: 'Test Issue', issueType: 'test.gated', objective: 'Test', dependsOnIssueKeys: [] }],
        }],
      }],
    })
    const issue = graph.issues[0]
    const run = await ledger.dispatch(issue.issueId)
    const claim = await ledger.claim(run.runId, 'worker')
    await ledger.complete(run.runId, claim.lease!.fencingToken, null)
    await expect(ledger.decideGate(issue.issueId, run.runId, 'accepted', {}, 'reviewer')).rejects.toMatchObject({ code: 'invalid_state' })
    await ledger.decideGate(issue.issueId, run.runId, 'accepted', await canonicalEvidence(ledger, 'issue', issue.issueId, issue.orgId!), 'reviewer')
    await ledger.evaluateGate({ subjectType: 'phase', subjectId: 'phase-1', programId: 'test-program', moduleId: 'M01', phaseId: 'phase-1', orgId: issue.orgId!, decision: 'accepted', evidence: await canonicalEvidence(ledger, 'phase', 'phase-1', issue.orgId!, { programId: 'test-program', moduleId: 'M01', phaseId: 'phase-1' }), evaluator: 'reviewer' })
    await ledger.evaluateGate({ subjectType: 'module', subjectId: 'M01', programId: 'test-program', moduleId: 'M01', orgId: issue.orgId!, decision: 'accepted', evidence: await canonicalEvidence(ledger, 'module', 'M01', issue.orgId!, { programId: 'test-program', moduleId: 'M01' }), evaluator: 'reviewer' })
    await ledger.evaluateGate({ subjectType: 'program', subjectId: 'test-program', programId: 'test-program', orgId: issue.orgId!, decision: 'accepted', evidence: await canonicalEvidence(ledger, 'program', 'test-program', issue.orgId!), evaluator: 'reviewer' })
    expect((await ledger.getCurrentGate({ subjectType: 'program', subjectId: 'test-program', orgId: issue.orgId!, programId: 'test-program' }))?.decision).toBe('accepted')
  })

  it('rebuilds current state from a durable snapshot and isolates org readiness queries', async () => {
    const source = new InMemoryLedgerStore()
    const ledger = new ProgramLedger(source)
    const completedIssue = await ledger.createIssue({ issueType: 'test.recovery', programRef: 'linksites', orgId: 'org-a', input: { step: 'durable' } })
    const completedRun = await ledger.dispatch(completedIssue.issueId)
    const completedClaim = await ledger.claim(completedRun.runId, 'worker')
    await ledger.complete(completedRun.runId, completedClaim.lease!.fencingToken, { accepted: true })
    await ledger.decideGate(completedIssue.issueId, completedRun.runId, 'accepted', await canonicalEvidence(ledger, 'issue', completedIssue.issueId, completedIssue.orgId!), 'reviewer')
    const orgA = await ledger.createIssue({ issueType: 'test.org', programRef: 'linksites', orgId: 'org-a', input: {} })
    await ledger.createIssue({ issueType: 'test.org', programRef: 'linksites', orgId: 'org-b', input: {} })
    const restored = InMemoryLedgerStore.fromSnapshot(await source.exportSnapshot('org-a'))
    const recoveredLedger = new ProgramLedger(restored)
    expect(await restored.getIssue(orgA.issueId)).toMatchObject({ orgId: 'org-a' })
    expect((await recoveredLedger.dispatch(completedIssue.issueId)).runId).toBe(completedRun.runId)
    expect((await recoveredLedger.getCurrentGate({ subjectType: 'issue', subjectId: completedIssue.issueId, orgId: 'org-a', programId: completedIssue.programRef }))?.decision).toBe('accepted')
    expect((await recoveredLedger.getRunnableIssues({ orgId: 'org-b' })).every((issue) => issue.orgId === 'org-b')).toBe(true)
  })

  it('keeps idempotency and dependency dispatch scoped to the organization', async () => {
    const ledger = new ProgramLedger(new InMemoryLedgerStore())
    const orgA = await ledger.createIssue({ issueType: 'test.org-scoped', programRef: 'linksites', orgId: 'org-a', issueKey: 'same-key', input: { same: true } })
    const orgB = await ledger.createIssue({ issueType: 'test.org-scoped', programRef: 'linksites', orgId: 'org-b', issueKey: 'same-key', input: { same: true } })
    const runA = await ledger.dispatch(orgA.issueId)
    const runB = await ledger.dispatch(orgB.issueId)
    expect(runB.runId).not.toBe(runA.runId)

    const claimB = await ledger.claim(runB.runId, 'worker-b')
    await ledger.complete(runB.runId, claimB.lease!.fencingToken, { result: 'org-b' })
    await ledger.decideGate(orgB.issueId, runB.runId, 'accepted', await canonicalEvidence(ledger, 'issue', orgB.issueId, orgB.orgId!), 'reviewer')

    await expect(ledger.createIssue({ issueType: 'test.org-dependent', programRef: 'linksites', orgId: 'org-a', input: {}, dependsOn: [orgB.issueId] })).rejects.toMatchObject({ code: 'dependency_not_satisfied' })
  })

  it('applies the generic Issue gate API to the Issue state and audit trail', async () => {
    const store = new InMemoryLedgerStore()
    const ledger = new ProgramLedger(store)
    const issue = await ledger.createIssue({ issueType: 'test.generic-gate', programRef: 'linksites', input: {} })
    const run = await ledger.dispatch(issue.issueId)
    const claim = await ledger.claim(run.runId, 'worker')
    await ledger.complete(run.runId, claim.lease!.fencingToken, { result: 'ok' })
    const gate = await ledger.evaluateGate({ subjectType: 'issue', subjectId: issue.issueId, decision: 'accepted', evidence: await canonicalEvidence(ledger, 'issue', issue.issueId, issue.orgId!), evaluator: 'reviewer', runId: run.runId })
    expect((await ledger.getIssue(issue.issueId))?.state).toBe('completed')
    expect((await store.listEvents(issue.issueId, issue.orgId!)).map((event) => event.type).slice(-2)).toEqual(['gate.decided', 'issue.completed'])
    await expect(store.putGateResult(gate)).rejects.toThrow(/immutable/)
  })

  it('rejects fake and stale canonical receipts, expired lease actions, and same-org identity collisions', async () => {
    const ledger = new ProgramLedger(new InMemoryLedgerStore())
    const issue = await ledger.createIssue({ issueType: 'test.identity', issueKey: 'identity-a', intendedEffect: 'write', target: 'target-a', programRef: 'linksites', input: {} })
    const collision = await ledger.createIssue({ issueType: 'test.identity', issueKey: 'identity-b', intendedEffect: 'write', target: 'target-a', programRef: 'linksites', input: {} })
    expect((await ledger.dispatch(issue.issueId)).runId).not.toBe((await ledger.dispatch(collision.issueId)).runId)
    const run = await ledger.dispatch((await ledger.createIssue({ issueType: 'test.receipt', issueKey: 'receipt-expiry', programRef: 'linksites', input: {} })).issueId)
    const claimed = await ledger.claim(run.runId, 'worker', 1)
    await new Promise((resolve) => setTimeout(resolve, 5))
    await expect(ledger.heartbeat(run.runId, claimed.lease!.fencingToken)).rejects.toMatchObject({ code: 'lease_expired' })
    const gated = await ledger.createIssue({ issueType: 'test.receipt', issueKey: 'receipt-gated', programRef: 'linksites', input: {} })
    const gatedRun = await ledger.dispatch(gated.issueId)
    const gatedClaim = await ledger.claim(gatedRun.runId, 'worker')
    await ledger.complete(gatedRun.runId, gatedClaim.lease!.fencingToken, { ok: true })
    await expect(ledger.decideGate(gated.issueId, gatedRun.runId, 'accepted', { evidenceReceipts: [{ nope: true }] }, 'reviewer')).rejects.toMatchObject({ code: 'invalid_state' })
    await expect(ledger.decideGate(gated.issueId, gatedRun.runId, 'accepted', { evidenceReceipts: [{ schema_version: { major: 1, minor: 0 }, org_id: gated.orgId, correlation_id: 'c', idempotency_key: 'i', receipt_id: 'r', producer: 'p', subject: { type: 'issue', id: gated.issueId }, checksum: { algorithm: 'sha256', value: 'a'.repeat(64) }, revision_sha: 'b'.repeat(40), storage_location: 'evidence://r', gate_association: 'g', timestamp: '2026-08-04T00:00:00.000Z' }] }, 'reviewer')).rejects.toMatchObject({ code: 'invalid_state' })

    const copied = await canonicalEvidence(ledger, 'issue', gated.issueId, gated.orgId!)
    copied.evidenceReceipts[0]!.subject.id = 'copied-from-another-issue'
    await expect(ledger.decideGate(gated.issueId, gatedRun.runId, 'accepted', copied, 'reviewer')).rejects.toMatchObject({ code: 'invalid_state' })
  })

  it('binds an Issue Gate to its exact succeeded Run and uses collision-safe identity hashing', async () => {
    const ledger = new ProgramLedger(new InMemoryLedgerStore())
    const first = await ledger.createIssue({ issueType: 'test.exact-run', programRef: 'linksites', issueKey: 'exact-a', intendedEffect: 'write:a', target: 'target', input: {} })
    const second = await ledger.createIssue({ issueType: 'test.exact-run', programRef: 'linksites', issueKey: 'exact-b', intendedEffect: 'write', target: 'a:target', input: {} })
    const firstRun = await ledger.dispatch(first.issueId)
    const firstClaim = await ledger.claim(firstRun.runId, 'worker-a')
    await ledger.complete(firstRun.runId, firstClaim.lease!.fencingToken, { ok: true })
    const secondRun = await ledger.dispatch(second.issueId)
    const secondClaim = await ledger.claim(secondRun.runId, 'worker-b')
    await ledger.complete(secondRun.runId, secondClaim.lease!.fencingToken, { ok: true })

    await expect(ledger.decideGate(first.issueId, secondRun.runId, 'accepted', await canonicalEvidence(ledger, 'issue', first.issueId, first.orgId!), 'reviewer')).rejects.toMatchObject({ code: 'invalid_state' })
    expect(deriveIdempotencyKey({ ...first, issueKey: 'same', intendedEffect: 'a:b', target: 'c' })).not.toBe(
      deriveIdempotencyKey({ ...second, issueKey: 'same', intendedEffect: 'a', target: 'b:c' }),
    )
  })

  it('does not resolve duplicate local Module/Phase IDs across tenants or Programs', async () => {
    const store = new InMemoryLedgerStore()
    const ledger = new ProgramLedger(store)
    const orgA = await ledger.seedProgramGraph(duplicateIdentityDefinition, 'org-a')
    const orgB = await ledger.seedProgramGraph(duplicateIdentityDefinition, 'org-b')
    const alternateProgram = await ledger.seedProgramGraph({ ...duplicateIdentityDefinition, programId: 'alternate-program', modules: [{ ...duplicateIdentityDefinition.modules[0], phases: [{ ...duplicateIdentityDefinition.modules[0].phases[0], issues: [{ ...duplicateIdentityDefinition.modules[0].phases[0].issues[0], issueKey: 'alternate-issue' }] }] }] }, 'org-a')

    async function complete(issue: typeof orgA.issues[number]) {
      const run = await ledger.dispatch(issue.issueId)
      const claim = await ledger.claim(run.runId, 'worker')
      const succeeded = await ledger.complete(run.runId, claim.lease!.fencingToken, { ok: true })
      await ledger.decideGate(issue.issueId, succeeded.runId, 'accepted', await canonicalEvidence(ledger, 'issue', issue.issueId, issue.orgId!), 'reviewer')
    }
    await complete(orgA.issues[0]!)
    await complete(orgB.issues[0]!)
    await complete(alternateProgram.issues[0]!)

    const phaseA = { subjectType: 'phase' as const, subjectId: 'P1', orgId: 'org-a', programId: 'duplicate-program', moduleId: 'M1', phaseId: 'P1' }
    const phaseB = { ...phaseA, orgId: 'org-b' }
    const alternatePhase = { ...phaseA, programId: 'alternate-program' }
    const gateA = await ledger.evaluateGate({ ...phaseA, decision: 'accepted', evidence: await canonicalEvidence(ledger, 'phase', 'P1', 'org-a', phaseA), evaluator: 'reviewer' })
    const gateB = await ledger.evaluateGate({ ...phaseB, decision: 'accepted', evidence: await canonicalEvidence(ledger, 'phase', 'P1', 'org-b', phaseB), evaluator: 'reviewer' })
    const gateAlternate = await ledger.evaluateGate({ ...alternatePhase, decision: 'accepted', evidence: await canonicalEvidence(ledger, 'phase', 'P1', 'org-a', alternatePhase), evaluator: 'reviewer' })

    expect((await ledger.getCurrentGate(phaseA))?.gateId).toBe(gateA.gateId)
    expect((await ledger.getCurrentGate(phaseB))?.gateId).toBe(gateB.gateId)
    expect((await ledger.getCurrentGate(alternatePhase))?.gateId).toBe(gateAlternate.gateId)
    await expect(ledger.evaluateGate({ subjectType: 'phase', subjectId: 'P1', orgId: 'org-a', programId: 'wrong-program', moduleId: 'M1', phaseId: 'P1', decision: 'accepted', evidence: {}, evaluator: 'attacker' })).rejects.toMatchObject({ code: 'not_found' })
    expect(await store.getCurrentGate({ ...phaseA, programId: 'wrong-program' })).toBeNull()
  })

  it('rolls back a hierarchy Gate, state transition, and audit events at injected failure points', async () => {
    const failurePoints: InMemoryHierarchyGateFailurePoint[] = ['after_gate', 'after_subject', 'after_events']
    for (const failurePoint of failurePoints) {
      const store = new InMemoryLedgerStore({ hierarchyGateFailurePoint: failurePoint })
      const ledger = new ProgramLedger(store)
      await ledger.seedProgramGraph({ schemaVersion: { major: 1, minor: 0 }, programId: 'atomic-program', title: 'Atomic', modules: [{ moduleId: 'M1', title: 'Module', purpose: 'Test', band: 'control-improvement', phases: [] }] })
      const subject = { subjectType: 'module' as const, subjectId: 'M1', orgId: 'a0000000-a000-a000-a000-a00000000001', programId: 'atomic-program', moduleId: 'M1' }
      await expect(ledger.evaluateGate({ ...subject, decision: 'rejected', evidence: {}, evaluator: 'fault-injected' })).rejects.toThrow(`injected hierarchy Gate failure at ${failurePoint}`)
      expect((await store.getModule('atomic-program', 'M1', subject.orgId))?.state).toBe('ready')
      expect(await store.getCurrentGate(subject)).toBeNull()
      const snapshot = await store.exportSnapshot(subject.orgId)
      expect(snapshot.gates).toHaveLength(0)
      expect(snapshot.events).toHaveLength(0)
    }
  })
})
