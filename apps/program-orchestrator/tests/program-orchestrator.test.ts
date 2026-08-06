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
  schema_version: { major: 1, minor: 0 }, org_id: 'local-org', correlation_id: `corr:${id}`, idempotency_key: `lead:${id}`, lead_id: id,
  requested_vertical: 'home_services', source: 'manual-file', research: { summary: 'Founder-provided local home-services research.', sources: ['source:founder:brief'] },
})

const approvedFacts = (id: string) => ({
  schemaVersion: { major: 1, minor: 0 }, orgId: 'local-org', leadId: id, businessName: `Founder Services ${id}`, geography: 'Taipei',
  services: ['Local service consultation'], credentials: ['Founder-provided credentials'], reviews: [{ quote: 'Founder-provided review', author: 'Approved customer' }],
  contact: { phone: '+886200000000', email: `${id}@invalid.test`, address: 'Taipei, Taiwan', website: `https://${id}.invalid.test` },
  pricing: 'Contact for an approved quote', legalClaims: ['Founder-approved legal copy'], media: [],
})

async function composition(id = 'lead-local-001') {
  const directory = await mkdtemp(join(tmpdir(), 'linksites-w2-02-'))
  const config = createLocalConfig(directory)
  await writeFile(config.approvedFactsPath, JSON.stringify(approvedFacts(id)))
  const value = await createProductionComposition(config)
  return { ...value, directory }
}

test('production composition boots with complete approved local configuration', async () => {
  const value = await composition()
  try {
    assert.equal((await value.runtime.health()).readiness, false)
    await value.runtime.runLead(lead())
    assert.equal((await value.runtime.health()).programState, 'completed')
  } finally { await rm(value.directory, { recursive: true, force: true }) }
})

test('manual NDJSON intake uses the shared port and claims once', async () => {
  const value = await composition('lead-file-intake')
  try {
    const candidate = lead('lead-file-intake')
    await writeFile(value.config.intakePath, `${JSON.stringify(candidate)}\n`, 'utf8')
    const accepted = await runFirstReadyFileLead(value)
    assert.equal(accepted.idempotency_key, candidate.idempotency_key)
    assert.match(await readFile(`${value.config.statePath}.intake.json`, 'utf8'), /program_started/)
    assert.equal((await value.runtime.health()).programState, 'completed')
  } finally { await rm(value.directory, { recursive: true, force: true }) }
})

test('the canonical 16-issue graph completes without public activation', async () => {
  const value = await composition('lead-parallel')
  try {
    await value.runtime.runLead(lead('lead-parallel'))
    const state = await value.runtime.exportState() as { issues: Array<{ issueId: string; state: string }>; runs: Array<{ issueId: string; evidence: Array<{ storage_location: string }> }>; events: Array<{ type: string; issueId?: string }>; program: { state: string; graph: { programId: string } } }
    assert.equal(state.program.state, 'completed')
    assert.equal(state.program.graph.programId, 'linksites')
    assert.equal(state.issues.length, 16)
    assert.ok(state.issues.every((issue) => issue.state === 'completed'))
    assert.equal(state.events.filter((event) => event.type === 'run.claimed' && ['foundation-reservation', 'library-verification'].includes(event.issueId ?? '')).length, 2)
    for (const issueId of ['content-gates', 'payload-parity', 'private-publication', 'site-render-validation', 'final-evidence']) {
      const location = state.runs.find((run) => run.issueId === issueId)?.evidence[0]?.storage_location
      assert.ok(location && !location.startsWith('local://'))
      assert.ok(JSON.parse(await readFile(location, 'utf8')))
    }
    assert.equal(JSON.stringify(state).includes('sold-site-public-activation'), false)
  } finally { await rm(value.directory, { recursive: true, force: true }) }
})

test('transient failures at external boundaries retry without duplicate effects', async () => {
  const value = await composition('lead-retry')
  try {
    for (const operation of ['foundation.reserve', 'library.verify', 'working-content.production', 'working-content.media', 'working-content.assemble', 'payload.promote-draft', 'payload.readback', 'frontend.private-preview', 'frontend.render']) await value.adapters.injectFault({ operation, remaining: 1, kind: 'transient' })
    await value.runtime.runLead(lead('lead-retry'))
    const state = await value.runtime.exportState() as { program: { state: string }; metrics: { retries: number }; issues: Array<{ attempt: number }> }
    assert.equal(state.program.state, 'completed')
    assert.ok(state.metrics.retries >= 9)
    assert.ok(state.issues.some((issue) => issue.attempt > 1))
  } finally { await rm(value.directory, { recursive: true, force: true }) }
})

test('restart after an irreversible receipt reuses durable adapter effects', async () => {
  const value = await composition('lead-restart')
  try {
    await value.adapters.injectFault({ operation: 'payload.promote-draft', remaining: 1, kind: 'crash_after_receipt' })
    await value.runtime.runLead(lead('lead-restart'))
    const restarted = await createProductionComposition(value.config)
    await restarted.runtime.runLead(lead('lead-restart'))
    const completionLines = (await readFile(value.config.completionPath, 'utf8')).trim().split(/\r?\n/).filter(Boolean)
    assert.equal(completionLines.length, 1)
    const state = await restarted.runtime.exportState() as { program: { state: string }; receipts: Array<{ issueId: string; operation: string }> }
    assert.equal(state.program.state, 'completed')
    assert.deepEqual(state.receipts.filter((receipt) => receipt.operation === 'payload-cms').map((receipt) => receipt.issueId).sort(), ['payload-draft', 'payload-parity'])
    assert.equal(await restarted.adapters.payloadDocumentCount(), 5)
  } finally { await rm(value.directory, { recursive: true, force: true }) }
})

test('gate rejection prevents preview and completion', async () => {
  const value = await composition('lead-gate-reject')
  try {
    await value.adapters.rejectNextGate()
    await value.runtime.runLead(lead('lead-gate-reject'))
    const state = await value.runtime.exportState() as { program: { state: string }; issues: Array<{ issueId: string; state: string }> }
    assert.equal(state.program.state, 'failed')
    assert.equal(state.issues.find((issue) => issue.issueId === 'private-publication')?.state, 'ready')
    assert.equal(await value.runtime.completion(), null)
  } finally { await rm(value.directory, { recursive: true, force: true }) }
})

test('partial irreversible mutation records manual attention', async () => {
  const value = await composition('lead-partial')
  try {
    await value.adapters.injectFault({ operation: 'payload.promote-draft', remaining: 1, kind: 'permanent' })
    await value.runtime.runLead(lead('lead-partial'))
    const state = await value.runtime.exportState() as { program: { state: string }; manualAttention: Array<{ issueId: string }>; deadLetters: unknown[] }
    assert.equal(state.program.state, 'manual_attention')
    assert.deepEqual(state.manualAttention.map((item) => item.issueId), ['payload-draft'])
    assert.equal(state.deadLetters.length, 0)
  } finally { await rm(value.directory, { recursive: true, force: true }) }
})

test('configuration and executor registry fail closed', () => {
  assert.throws(() => configFromEnvironment({}, '/tmp'), /configuration is incomplete/)
  const config = createLocalConfig('/tmp/w2-02-test')
  assert.throws(() => validateRuntimeConfig({ ...config, approvedExecutors: { ...config.approvedExecutors, 'payload.draft.promote': '9.9.9' } }), /not approved/)
  assert.throws(() => validateRuntimeConfig({ ...config, approvedExecutors: { ...config.approvedExecutors, 'unknown.executor': '1.0.0' } }), /unknown or missing executor kind/)
  assert.equal(W2_02_GRAPH.some((issue) => issue.executorKind === 'sold-site.public-activation'), false)
})

test('duplicate lead and completion delivery are idempotent', async () => {
  const value = await composition('lead-duplicate')
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

test('completion delivery retries from a durable reservation after restart', async () => {
  const value = await composition('lead-completion-retry')
  try {
    await value.adapters.injectFault({ operation: 'completion.emit', remaining: 2, kind: 'transient' })
    await value.runtime.runLead(lead('lead-completion-retry'))
    assert.equal((await value.runtime.completion())?.status, 'completed')
    assert.equal((await readFile(value.config.completionPath, 'utf8').catch(() => '')).trim(), '')
    const restarted = await createProductionComposition(value.config)
    await restarted.runtime.runLead(lead('lead-completion-retry'))
    const lines = (await readFile(value.config.completionPath, 'utf8')).trim().split(/\r?\n/).filter(Boolean)
    assert.equal(lines.length, 1)
  } finally { await rm(value.directory, { recursive: true, force: true }) }
})

test('completion crash after receipt is delivered once after restart', async () => {
  const value = await composition('lead-completion-crash')
  try {
    await value.adapters.injectFault({ operation: 'completion.emit', remaining: 1, kind: 'crash_after_receipt' })
    await value.runtime.runLead(lead('lead-completion-crash'))
    const reserved = await value.runtime.completion()
    assert.equal(reserved?.status, 'completed')
    assert.equal((await readFile(value.config.completionPath, 'utf8')).trim().split(/\r?\n/).filter(Boolean).length, 1)
    const restarted = await createProductionComposition(value.config)
    await restarted.runtime.runLead(lead('lead-completion-crash'))
    const lines = (await readFile(value.config.completionPath, 'utf8')).trim().split(/\r?\n/).filter(Boolean)
    assert.equal(lines.length, 1)
    assert.equal(Object.keys(await restarted.adapters.deliveryReceipts()).length, 1)
    assert.equal((await restarted.runtime.exportState() as { completion: { state: string } }).completion.state, 'emitted')
  } finally { await rm(value.directory, { recursive: true, force: true }) }
})
