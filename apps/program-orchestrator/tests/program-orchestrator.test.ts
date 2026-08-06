import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import type { LeadResearchPackage } from '@linksites/types'
import { W2_02_GRAPH } from '../src/graph.ts'
import { configFromEnvironment, createLocalConfig, createProductionComposition, validateRuntimeConfig } from '../src/composition.ts'
import { runFirstReadyFileLead } from '../src/intake.ts'

const lead = (id = 'lead-local-001'): LeadResearchPackage => ({
  schema_version: { major: 1, minor: 0 },
  org_id: 'local-org',
  correlation_id: `corr:${id}`,
  idempotency_key: `lead:${id}`,
  lead_id: id,
  requested_vertical: 'home_services',
  source: 'manual-file',
  research: { summary: 'Founder-provided local home-services research.', sources: ['source:founder:brief'] },
})

async function composition() {
  const directory = await mkdtemp(join(tmpdir(), 'linksites-w2-02-'))
  const value = await createProductionComposition(createLocalConfig(directory))
  return { ...value, directory }
}

test('production composition boots only with complete approved local configuration', async () => {
  const value = await composition()
  try {
    assert.equal((await value.runtime.health()).readiness, false)
    await value.runtime.runLead(lead())
    assert.equal((await value.runtime.health()).programState, 'completed')
  } finally { await rm(value.directory, { recursive: true, force: true }) }
})

test('manual NDJSON intake enters the same canonical boundary and claims once', async () => {
  const value = await composition()
  try {
    const candidate = lead('lead-file-intake')
    await writeFile(value.config.intakePath, `${JSON.stringify(candidate)}\n`, 'utf8')
    const accepted = await runFirstReadyFileLead(value)
    assert.equal(accepted.idempotency_key, candidate.idempotency_key)
    assert.equal((await readFile(`${value.config.statePath}.intake.json`, 'utf8')).trim(), candidate.idempotency_key)
    assert.equal((await value.runtime.health()).programState, 'completed')
  } finally { await rm(value.directory, { recursive: true, force: true }) }
})

test('the full graph completes with safe parallel foundation/library branches and no public activation', async () => {
  const value = await composition()
  try {
    await value.runtime.runLead(lead('lead-parallel'))
    const state = await value.runtime.exportState() as { issues: Array<{ issueId: string; state: string }>; events: Array<{ type: string; issueId?: string }>; program: { state: string } }
    assert.equal(state.program.state, 'completed')
    assert.equal(state.issues.length, 16)
    assert.ok(state.issues.every((issue) => issue.state === 'completed'))
    assert.equal(state.events.filter((event) => event.type === 'run.claimed' && ['foundation-reserve', 'library-resolve'].includes(event.issueId ?? '')).length, 2)
    const completion = await value.runtime.completion()
    assert.ok(completion)
    assert.equal(completion?.status, 'completed')
    assert.match(completion?.private_preview_url ?? '', /127\.0\.0\.1/)
    assert.equal(JSON.stringify(state).includes('sold-site-public-activation'), false)
  } finally { await rm(value.directory, { recursive: true, force: true }) }
})

test('transient failures at every external boundary retry and converge without duplicate effects', async () => {
  const value = await composition()
  try {
    for (const operation of ['foundation.reserve', 'library.resolve', 'working-content.copy', 'working-content.media', 'working-content.assemble', 'payload.promote-draft', 'payload.readback', 'frontend.private-preview', 'frontend.render']) await value.adapters.injectFault({ operation, remaining: 1, kind: 'transient' })
    await value.runtime.runLead(lead('lead-retry'))
    const state = await value.runtime.exportState() as { program: { state: string }; metrics: { retries: number }; issues: Array<{ attempt: number }> }
    assert.equal(state.program.state, 'completed')
    assert.ok(state.metrics.retries >= 9)
    assert.ok(state.issues.some((issue) => issue.attempt > 1))
  } finally { await rm(value.directory, { recursive: true, force: true }) }
})

test('restart after an irreversible receipt replays from durable adapter effects and emits exactly one completion', async () => {
  const value = await composition()
  try {
    await value.adapters.injectFault({ operation: 'payload.promote-draft', remaining: 1, kind: 'crash_after_receipt' })
    await value.runtime.runLead(lead('lead-restart'))
    const restarted = await createProductionComposition(value.config)
    await restarted.runtime.runLead(lead('lead-restart'))
    const completionLines = (await readFile(value.config.completionPath, 'utf8')).trim().split(/\r?\n/).filter(Boolean)
    assert.equal(completionLines.length, 1)
    const state = await restarted.runtime.exportState() as { program: { state: string }; receipts: Array<{ issueId: string; operation: string }> }
    assert.equal(state.program.state, 'completed')
    assert.deepEqual(state.receipts.filter((receipt) => receipt.operation === 'payload-cms').map((receipt) => receipt.issueId).sort(), ['payload-draft-promote', 'payload-readback-parity'])
  } finally { await rm(value.directory, { recursive: true, force: true }) }
})

test('gate rejection prevents preview and completion', async () => {
  const value = await composition()
  try {
    await value.adapters.rejectNextGate()
    await value.runtime.runLead(lead('lead-gate-reject'))
    const state = await value.runtime.exportState() as { program: { state: string }; issues: Array<{ issueId: string; state: string }> }
    assert.equal(state.program.state, 'failed')
    assert.equal(state.issues.find((issue) => issue.issueId === 'private-preview-create')?.state, 'ready')
    assert.equal(await value.runtime.completion(), null)
  } finally { await rm(value.directory, { recursive: true, force: true }) }
})

test('partial irreversible mutation is fail-closed and records manual attention', async () => {
  const value = await composition()
  try {
    await value.adapters.injectFault({ operation: 'payload.promote-draft', remaining: 1, kind: 'permanent' })
    await value.runtime.runLead(lead('lead-partial'))
    const state = await value.runtime.exportState() as { program: { state: string }; manualAttention: Array<{ issueId: string }>; deadLetters: unknown[] }
    assert.equal(state.program.state, 'manual_attention')
    assert.deepEqual(state.manualAttention.map((item) => item.issueId), ['payload-draft-promote'])
    assert.equal(state.deadLetters.length, 0)
  } finally { await rm(value.directory, { recursive: true, force: true }) }
})

test('configuration and executor registry fail closed', () => {
  assert.throws(() => configFromEnvironment({}, '/tmp'), /configuration is incomplete/)
  const config = createLocalConfig('/tmp/w2-02-test')
  assert.throws(() => validateRuntimeConfig({ ...config, approvedExecutors: { ...config.approvedExecutors, 'cms.promote-draft': '9.9.9' } }), /not approved/)
  assert.throws(() => validateRuntimeConfig({ ...config, approvedExecutors: { ...config.approvedExecutors, 'unknown.executor': '1.0.0' } }), /unknown executor kind/)
  assert.equal(W2_02_GRAPH.some((issue) => issue.executorKind === 'sold-site.public-activation'), false)
})

test('duplicate lead and duplicate delivery are idempotent', async () => {
  const value = await composition()
  try {
    await value.runtime.runLead(lead('lead-duplicate'))
    await value.runtime.runLead(lead('lead-duplicate'))
    const lines = (await readFile(value.config.completionPath, 'utf8')).trim().split(/\r?\n/).filter(Boolean)
    assert.equal(lines.length, 1)
    const state = await value.runtime.exportState() as { metrics: { completionEmits: number }; runs: unknown[] }
    assert.equal(state.metrics.completionEmits, 1)
    assert.equal(state.runs.length, 16)
  } finally { await rm(value.directory, { recursive: true, force: true }) }
})

test('completion-boundary failure retains a durable reservation and replays once after restart', async () => {
  const value = await composition()
  try {
    await value.adapters.injectFault({ operation: 'completion.emit', remaining: 2, kind: 'transient' })
    await value.runtime.runLead(lead('lead-completion-retry'))
    assert.equal((await value.runtime.health()).programState, 'completed')
    assert.equal((await value.runtime.completion())?.status, 'completed')
    assert.equal((await readFile(value.config.completionPath, 'utf8').catch(() => '')).trim(), '')
    const restarted = await createProductionComposition(value.config)
    await restarted.runtime.runLead(lead('lead-completion-retry'))
    const lines = (await readFile(value.config.completionPath, 'utf8')).trim().split(/\r?\n/).filter(Boolean)
    assert.equal(lines.length, 1)
  } finally { await rm(value.directory, { recursive: true, force: true }) }
})
