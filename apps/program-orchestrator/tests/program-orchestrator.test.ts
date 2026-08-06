import assert from 'node:assert/strict'
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
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
  const docs = new Map<string, Record<string, unknown>>()
  const payload = createServer(async (request, response) => {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1')
    const parts = url.pathname.split('/').filter(Boolean)
    const id = parts[2]
    const chunks: Buffer[] = []
    for await (const chunk of request) chunks.push(Buffer.from(chunk))
    const send = (status: number, value: unknown) => { response.writeHead(status, { 'content-type': 'application/json' }); response.end(JSON.stringify(value)) }
    if (request.method === 'GET' && !id) {
      const slug = url.searchParams.get('where[slug][equals]')
      const values = slug ? [...docs.values()].filter((doc) => doc.slug === slug) : [...docs.values()]
      return send(200, { docs: values, totalDocs: values.length })
    }
    if (request.method === 'GET') return docs.has(id) ? send(200, docs.get(id)) : send(404, {})
    const body = JSON.parse(Buffer.concat(chunks).toString() || '{}') as Record<string, unknown>
    const documentId = id ?? `test-page-${docs.size + 1}`
    docs.set(documentId, { ...body, id: documentId })
    return send(id ? 200 : 201, { doc: docs.get(documentId) })
  })
  await new Promise<void>((resolve) => payload.listen(0, '127.0.0.1', resolve))
  const payloadPort = (payload.address() as import('node:net').AddressInfo).port
  const web = createServer((_request, response) => { response.writeHead(200, { 'content-type': 'text/html', 'x-robots-tag': 'noindex, nofollow', 'cache-control': 'private, no-store' }); response.end('<main data-private-preview="true" data-route="/"><h1>Private preview</h1></main>') })
  await new Promise<void>((resolve) => web.listen(0, '127.0.0.1', resolve))
  const webPort = (web.address() as import('node:net').AddressInfo).port
  const config = { ...createLocalConfig(directory), payloadBaseUrl: `http://127.0.0.1:${payloadPort}`, webMasterBaseUrl: `http://127.0.0.1:${webPort}` }
  await writeFile(config.approvedFactsPath, JSON.stringify(approvedFacts(id)))
  const value = await createProductionComposition(config)
  const close = value.close
  return { ...value, directory, close: async () => { await close(); await new Promise<void>((resolve) => payload.close(() => resolve())); await new Promise<void>((resolve) => web.close(() => resolve())) } }
}

test('production composition boots with complete approved local configuration', async () => {
  const value = await composition()
  try {
    assert.equal((await value.runtime.health()).readiness, false)
    await value.runtime.runLead(lead())
    assert.equal((await value.runtime.health()).programState, 'completed')
  } finally { await value.close(); await rm(value.directory, { recursive: true, force: true }) }
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
  } finally { await value.close(); await rm(value.directory, { recursive: true, force: true }) }
})

test('intake records retry disposition when durable completion delivery is pending', async () => {
  const value = await composition('lead-intake-retry-disposition')
  try {
    await value.adapters.injectFault({ operation: 'completion.emit', remaining: 1, kind: 'transient' })
    await writeFile(value.config.intakePath, `${JSON.stringify(lead('lead-intake-retry-disposition'))}\n`, 'utf8')
    await assert.rejects(runFirstReadyFileLead(value), /boundary:completion-sink:transient-failure/)
    const intakeState = JSON.parse(await readFile(`${value.config.statePath}.intake.json`, 'utf8')) as Record<string, { state?: string; nextAttemptAt?: string }>
    const item = Object.values(intakeState)[0]
    assert.equal(item.state, 'program_retry_scheduled')
    assert.ok(item.nextAttemptAt)
  } finally { await value.close(); await rm(value.directory, { recursive: true, force: true }) }
})

test('the canonical 16-issue graph completes without public activation', async () => {
  const value = await composition('lead-parallel')
  try {
    await value.runtime.runLead(lead('lead-parallel'))
    const state = await value.runtime.exportState() as { issues: Array<{ issueId: string; moduleId: string; phaseId: string; dependsOn: string[]; state: string }>; modules: Array<{ moduleId: string; state: string; scheduled: boolean }>; runs: Array<{ issueId: string; evidence: Array<{ storage_location: string }> }>; events: Array<{ type: string; issueId?: string }>; program: { state: string; graph: { programId: string } } }
    assert.equal(state.program.state, 'completed')
    assert.equal(state.program.graph.programId, 'linksites')
    assert.equal(state.issues.length, 16)
    assert.ok(state.issues.every((issue) => issue.state === 'completed'))
    const reservation = state.issues.find((issue) => issue.issueId === 'foundation-reservation')
    assert.equal(reservation?.moduleId, 'M06')
    assert.equal(reservation?.phaseId, 'inventory')
    assert.deepEqual(reservation?.dependsOn, ['vertical-qualification'])
    assert.equal(state.modules.find((module) => module.moduleId === 'M01')?.state, 'excluded')
    assert.equal(state.modules.find((module) => module.moduleId === 'M01')?.scheduled, false)
    assert.equal(state.events.filter((event) => event.type === 'run.claimed' && ['foundation-reservation', 'library-verification'].includes(event.issueId ?? '')).length, 2)
    for (const issueId of ['content-gates', 'payload-parity', 'private-publication', 'site-render-validation', 'final-evidence']) {
      const location = state.runs.find((run) => run.issueId === issueId)?.evidence[0]?.storage_location
      assert.ok(location && !location.startsWith('local://'))
      assert.ok(JSON.parse(await readFile(location, 'utf8')))
    }
    assert.equal(JSON.stringify(state).includes('sold-site-public-activation'), false)
  } finally { await value.close(); await rm(value.directory, { recursive: true, force: true }) }
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
  } finally { await value.close(); await rm(value.directory, { recursive: true, force: true }) }
})

test('restart after an irreversible receipt reuses durable adapter effects', async () => {
  const value = await composition('lead-restart')
  let restarted: Awaited<ReturnType<typeof createProductionComposition>> | undefined
  try {
    await value.adapters.injectFault({ operation: 'payload.promote-draft', remaining: 1, kind: 'crash_after_receipt' })
    await value.runtime.runLead(lead('lead-restart'))
    restarted = await createProductionComposition(value.config)
    await restarted.runtime.runLead(lead('lead-restart'))
    const completionLines = (await readFile(value.config.completionPath, 'utf8')).trim().split(/\r?\n/).filter(Boolean)
    assert.equal(completionLines.length, 1)
    const state = await restarted.runtime.exportState() as { program: { state: string }; receipts: Array<{ issueId: string; operation: string }> }
    assert.equal(state.program.state, 'completed')
    assert.deepEqual(state.receipts.filter((receipt) => receipt.operation === 'payload-cms').map((receipt) => receipt.issueId).sort(), ['payload-draft', 'payload-parity'])
    assert.equal(await restarted.adapters.payloadDocumentCount(), 5)
  } finally { await restarted?.close?.(); await value.close(); await rm(value.directory, { recursive: true, force: true }) }
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
  } finally { await value.close(); await rm(value.directory, { recursive: true, force: true }) }
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
  } finally { await value.close(); await rm(value.directory, { recursive: true, force: true }) }
})

test('post-promotion protected render failure creates durable manual attention', async () => {
  const value = await composition('lead-render-compensation')
  try {
    await value.adapters.injectFault({ operation: 'frontend.render', remaining: 1, kind: 'permanent' })
    await value.runtime.runLead(lead('lead-render-compensation'))
    const state = await value.runtime.exportState() as { program: { state: string }; manualAttention: Array<{ issueId: string; reason: string }>; issues: Array<{ issueId: string; state: string }> }
    assert.equal(state.program.state, 'manual_attention')
    assert.deepEqual(state.manualAttention.map((item) => item.issueId), ['site-render-validation'])
    assert.match(state.manualAttention[0].reason, /frontend:permanent-failure/)
    assert.equal(await value.adapters.payloadDocumentCount(), 5)
    assert.ok((await readdir(`${value.directory}/evidence`)).some((file) => file.startsWith('manual-attention-compensation-')))
  } finally { await value.close(); await rm(value.directory, { recursive: true, force: true }) }
})

test('process termination after claim and irreversible receipt is reclaimed by a new worker', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'linksites-w2-02-crash-'))
  const config = { ...createLocalConfig(directory), payloadBaseUrl: 'http://127.0.0.1:9', webMasterBaseUrl: 'http://127.0.0.1:9' }
  const signalPath = join(directory, 'worker-ready')
  const workerCode = `(async()=>{const {writeFile}=await import('node:fs/promises'); const {createLocalConfig,createProductionComposition}=await import('./src/composition.ts'); const config=createLocalConfig(${JSON.stringify(directory)},'local-org'); const value=await createProductionComposition({...config,payloadBaseUrl:'http://127.0.0.1:9',webMasterBaseUrl:'http://127.0.0.1:9',leaseDurationMs:50,workerId:'crashed-worker'}); const lead=${JSON.stringify(lead('lead-process-crash'))}; await value.ledger.createOrResume(lead); const claim=await value.ledger.claim('lead-research'); if(!claim) throw new Error('claim-not-acquired'); await value.ledger.saveReceipt('lead-research','crash-boundary',{receipt:'irreversible-before-termination'}); await writeFile(${JSON.stringify(signalPath)},JSON.stringify({runId:claim.run.runId,fencingToken:claim.run.lease?.fencingToken})); await new Promise(()=>{})})().catch(error=>{console.error(error); process.exit(1)})`
  const worker = spawn(process.execPath, ['--import', 'tsx/esm', '-e', workerCode], { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'] })
  let restarted: Awaited<ReturnType<typeof createProductionComposition>> | undefined
  try {
    for (let attempt = 0; attempt < 80; attempt += 1) {
      if (await readFile(signalPath, 'utf8').catch(() => '')) break
      await new Promise((resolve) => setTimeout(resolve, 25))
    }
    const signal = JSON.parse(await readFile(signalPath, 'utf8')) as { runId: string; fencingToken: number }
    worker.kill('SIGKILL')
    await new Promise((resolve) => worker.once('exit', resolve))
    await new Promise((resolve) => setTimeout(resolve, 100))
    restarted = await createProductionComposition({ ...config, leaseDurationMs: 50, workerId: 'recreated-worker' })
    assert.equal(await restarted.ledger.reclaimExpiredLeases(), 1)
    const reclaimed = await restarted.ledger.claim('lead-research')
    assert.ok(reclaimed)
    assert.notEqual(reclaimed?.run.runId, signal.runId)
    assert.notEqual(reclaimed?.run.lease?.fencingToken, signal.fencingToken)
    await assert.rejects(restarted.ledger.succeed(signal.runId, signal.fencingToken, { stale: true }, []), /not found|stale lease|successful run requires evidence/)
    assert.equal((await restarted.ledger.snapshot()).receipts.filter((receipt) => receipt.operation === 'crash-boundary').length, 1)
  } finally {
    if (worker.exitCode === null && worker.signalCode === null) worker.kill('SIGKILL')
    await restarted?.close?.()
    await rm(directory, { recursive: true, force: true })
  }
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
  } finally { await value.close(); await rm(value.directory, { recursive: true, force: true }) }
})

test('completion delivery retries from a durable reservation after restart', async () => {
  const value = await composition('lead-completion-retry')
  let restarted: Awaited<ReturnType<typeof createProductionComposition>> | undefined
  try {
    await value.adapters.injectFault({ operation: 'completion.emit', remaining: 2, kind: 'transient' })
    await assert.rejects(value.runtime.runLead(lead('lead-completion-retry')), /boundary:completion-sink:transient-failure/)
    assert.equal((await value.runtime.completion())?.status, 'completed')
    assert.equal((await readFile(value.config.completionPath, 'utf8').catch(() => '')).trim(), '')
    assert.equal((await value.runtime.exportState() as { outbox: Array<{ status: string; attempts: number; lastError: string | null }>; metrics: { outboxBacklog: number; outboxFailures: number } }).outbox[0].status, 'pending')
    assert.equal((await value.runtime.exportState() as { metrics: { outboxBacklog: number; outboxFailures: number } }).metrics.outboxBacklog, 1)
    assert.equal((await value.runtime.exportState() as { metrics: { outboxBacklog: number; outboxFailures: number } }).metrics.outboxFailures, 1)
    await new Promise((resolve) => setTimeout(resolve, 1_050))
    restarted = await createProductionComposition(value.config)
    await restarted.runtime.runLead(lead('lead-completion-retry'))
    const lines = (await readFile(value.config.completionPath, 'utf8')).trim().split(/\r?\n/).filter(Boolean)
    assert.equal(lines.length, 1)
  } finally { await restarted?.close?.(); await value.close(); await rm(value.directory, { recursive: true, force: true }) }
})

test('completion crash after receipt is delivered once after restart', async () => {
  const value = await composition('lead-completion-crash')
  let restarted: Awaited<ReturnType<typeof createProductionComposition>> | undefined
  try {
    await value.adapters.injectFault({ operation: 'completion.emit', remaining: 1, kind: 'crash_after_receipt' })
    await assert.rejects(value.runtime.runLead(lead('lead-completion-crash')), /crash-after-receipt:completion-sink/)
    const reserved = await value.runtime.completion()
    assert.equal(reserved?.status, 'completed')
    assert.equal((await readFile(value.config.completionPath, 'utf8')).trim().split(/\r?\n/).filter(Boolean).length, 1)
    await new Promise((resolve) => setTimeout(resolve, 1_050))
    restarted = await createProductionComposition(value.config)
    await restarted.runtime.runLead(lead('lead-completion-crash'))
    const lines = (await readFile(value.config.completionPath, 'utf8')).trim().split(/\r?\n/).filter(Boolean)
    assert.equal(lines.length, 1)
    assert.equal(Object.keys(await restarted.adapters.deliveryReceipts()).length, 1)
    assert.equal((await restarted.runtime.exportState() as { completion: { state: string } }).completion.state, 'emitted')
    const outbox = (await restarted.runtime.exportState() as { outbox: Array<{ attempts: number; ackAt: string | null; status: string }> }).outbox[0]
    assert.equal(outbox.status, 'delivered')
    assert.ok(outbox.ackAt)
  } finally { await restarted?.close?.(); await value.close(); await rm(value.directory, { recursive: true, force: true }) }
})
