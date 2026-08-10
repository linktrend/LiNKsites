import assert from 'node:assert/strict'
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { createHmac } from 'node:crypto'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import type { LeadResearchPackage } from '@linksites/types'
import { createFileLifecycleStore, SiteLifecycleService, type LiNKreachAuthorizationVerifier } from '@linksites/factory-catalog'
import { W2_02_GRAPH } from '../src/graph.ts'
import { configFromEnvironment, createLocalConfig, createProductionComposition, validateRuntimeConfig } from '../src/composition.ts'
import { runFirstReadyLead } from '../src/intake.ts'
import { CommercialOutcomeIngress, VerifiedGatewayOutcomeAuthorization } from '../src/commercial-outcome-ingress.ts'
import { LiNKautoworkGateway } from '@linksites/autowork-boundary'

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
const outcomeGatewayFixture = { commercialOutcomeGatewaySecret: 'test-only-outcome-gateway-secret', commercialOutcomeGatewayKeyId: 'test-only-outcome-gateway-key' }

test('W2-05 cryptographically verified commercial outcomes enter the W2-02 durable lifecycle path and reject forged signatures', async () => {
  const authorization: LiNKreachAuthorizationVerifier = { verify: async () => true }
  const directory = await mkdtemp(join(tmpdir(), 'linksites-w2-06-ingress-'))
  const lifecycle = new SiteLifecycleService(createFileLifecycleStore(directory), authorization)
  const secret = 'outcome-gateway-test-secret'
  const gateway = new LiNKautoworkGateway({ secret, keyId: 'key-1', environment: 'development', transport: async () => { throw new Error('not used') } })
  const ingress = new CommercialOutcomeIngress(lifecycle, gateway, new VerifiedGatewayOutcomeAuthorization(authorization))
  try {
    // This is the actual W2-05 builder. It can produce only a signed pending
    // transport event; the ingress performs the accepted transition after
    // cryptographic verification.
    const request = gateway.buildRequest('commercial.outcome.recorded', 'org_demo', 'corr-outcome', 'outcome:001', { lead_id: 'lead_demo', site_id: 'site_demo', submission: { outcome: 'no_sale', reach_authorization_reference: 'reach-auth-001', outcome_event_id: 'commercial-event-001', outcome_nonce: 'nonce-001', recorded_at: '2026-08-04T00:10:00.000Z' } })
    assert.equal(request.envelope.acknowledgement.status, 'pending')
    const first = await ingress.accept(request)
    assert.equal(first.outcome, 'no_sale')
    assert.equal((await createFileLifecycleStore(directory).getBySiteId('org_demo', 'site_demo'))?.lifecycleId, first.lifecycleId)
    await assert.rejects(ingress.accept({ ...request, nonce: 'forged-nonce', envelope: { ...request.envelope, signature: { ...request.envelope.signature, signature: 'forged' } } }), /invalid_signature/i)
    const asserted = gateway.buildRequest('commercial.outcome.recorded', 'org_demo', 'corr-outcome', 'outcome:asserted', { lead_id: 'lead_asserted', site_id: 'site_asserted', submission: { outcome: 'no_sale', reach_authorization_reference: 'reach-auth-asserted', outcome_event_id: 'commercial-event-asserted', outcome_nonce: 'nonce-asserted', recorded_at: '2026-08-04T00:10:00.000Z' } })
    const { signature: _signature, ...unsigned } = asserted.envelope
    const callerAsserted = { ...unsigned, acknowledgement: { status: 'accepted' as const } }
    const assertedEnvelope = { ...callerAsserted, signature: { algorithm: 'hmac-sha256' as const, key_id: 'key-1', signature: createHmac('sha256', secret).update(`${asserted.timestamp}.${asserted.nonce}.${JSON.stringify(callerAsserted)}`).digest('hex') } }
    await assert.rejects(ingress.accept({ ...asserted, envelope: assertedEnvelope }), /verified pending/i)
  } finally { await rm(directory, { recursive: true, force: true }) }
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
    if (['POST', 'PATCH'].includes(request.method ?? '') && request.headers.authorization !== 'users API-Key test-api-key') return send(401, { error: 'authenticated Payload mutation required' })
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
  const config = { ...createLocalConfig(directory), ...outcomeGatewayFixture, payloadBaseUrl: `http://127.0.0.1:${payloadPort}`, payloadApiKey: 'test-api-key', payloadSiteId: 'test-site', webMasterBaseUrl: `http://127.0.0.1:${webPort}`, previewAccessToken: 'test-preview-token' }
  await writeFile(config.approvedFactsPath, JSON.stringify(approvedFacts(id)))
  const value = await createProductionComposition(config, { outcomeAuthorization: { verify: async () => true } })
  const close = value.close
  return { ...value, directory, docs, close: async () => { await close(); await new Promise<void>((resolve) => payload.close(() => resolve())); await new Promise<void>((resolve) => web.close(() => resolve())) } }
}

test('production composition boots with complete approved local configuration', async () => {
  const value = await composition()
  try {
    assert.equal((await value.runtime.health()).readiness, false)
    await value.runtime.runLead(lead())
    assert.equal((await value.runtime.health()).programState, 'completed')
    const gateway = new LiNKautoworkGateway({ secret: value.config.commercialOutcomeGatewaySecret, keyId: value.config.commercialOutcomeGatewayKeyId, environment: 'development', transport: async () => { throw new Error('not used') }, policies: [{ eventName: 'commercial.outcome.recorded', orgIds: [value.config.orgId], environments: ['development'] }] })
    const request = gateway.buildRequest('commercial.outcome.recorded', value.config.orgId, 'composed-outcome', 'composed-outcome:001', { lead_id: 'lead-composed', site_id: 'site-composed', submission: { outcome: 'no_sale', reach_authorization_reference: 'reach-auth-composed', outcome_event_id: 'commercial-outcome-composed', outcome_nonce: 'outcome-nonce-composed', recorded_at: '2026-08-06T00:00:00.000Z' } })
    assert.equal((await value.runtime.acceptCommercialOutcome(request)).status, 'outcome_recorded')
  } finally { await value.close(); await rm(value.directory, { recursive: true, force: true }) }
})

test('promotion maps the stable run marker onto all five schema-backed Payload drafts', async () => {
  const id = 'w2-02-run-0123456789abcdef'
  const value = await composition(id)
  try {
    await value.runtime.runLead(lead(id))
    const state = await value.runtime.exportState() as { program: { state: string } }
    assert.equal(state.program.state, 'completed')
    // The mock holds the real request bodies, so this verifies the mapping
    // independently of marker-bearing rendered copy.
    assert.equal(value.docs.size, 5)
    assert.ok([...value.docs.values()].every((doc) => doc.promotionRunMarker === id))
    assert.ok([...value.docs.values()].every((doc) => doc.status === 'draft' && doc.previewEnvironment === 'private-preview'))
  } finally { await value.close(); await rm(value.directory, { recursive: true, force: true }) }
})

test('manual NDJSON intake uses the shared port and claims once', async () => {
  const value = await composition('lead-file-intake')
  try {
    const candidate = lead('lead-file-intake')
    await writeFile(value.config.intakePath, `${JSON.stringify(candidate)}\n`, 'utf8')
    const accepted = await runFirstReadyLead(value)
    assert.ok(accepted)
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
    await assert.rejects(runFirstReadyLead(value), /boundary:completion-sink:transient-failure/)
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
    const generated = [value.config.statePath, value.config.completionPath, ...(await readdir(`${value.directory}/evidence`)).map((file) => join(value.directory, 'evidence', file))]
    for (const file of generated) assert.equal((await readFile(file, 'utf8')).includes('test-preview-token'), false, `preview token leaked into generated ${file}`)
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
  const config = { ...createLocalConfig(directory), ...outcomeGatewayFixture, payloadBaseUrl: 'http://127.0.0.1:9', payloadApiKey: 'test-api-key', payloadSiteId: 'test-site', webMasterBaseUrl: 'http://127.0.0.1:9', previewAccessToken: 'test-preview-token' }
  const signalPath = join(directory, 'worker-ready')
  const workerCode = `(async()=>{const {writeFile}=await import('node:fs/promises'); const {createLocalConfig,createProductionComposition}=await import('./src/composition.ts'); const config=createLocalConfig(${JSON.stringify(directory)},'local-org'); const value=await createProductionComposition({...config,commercialOutcomeGatewaySecret:'test-only-outcome-gateway-secret',commercialOutcomeGatewayKeyId:'test-only-outcome-gateway-key',payloadBaseUrl:'http://127.0.0.1:9',payloadApiKey:'test-api-key',payloadSiteId:'test-site',webMasterBaseUrl:'http://127.0.0.1:9',previewAccessToken:'test-preview-token',leaseDurationMs:50,workerId:'crashed-worker'}); const lead=${JSON.stringify(lead('lead-process-crash'))}; await value.ledger.createOrResume(lead); const claim=await value.ledger.claim('lead-research'); if(!claim) throw new Error('claim-not-acquired'); await value.ledger.saveReceipt('lead-research','crash-boundary',{receipt:'irreversible-before-termination'},claim.run.runId,claim.run.lease.fencingToken); await writeFile(${JSON.stringify(signalPath)},JSON.stringify({runId:claim.run.runId,fencingToken:claim.run.lease?.fencingToken})); await new Promise(()=>{})})().catch(error=>{console.error(error); process.exit(1)})`
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

test('a paused stale worker cannot acknowledge an irreversible receipt after lease expiry and reclaim', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'linksites-w2-02-stale-receipt-'))
  const config = { ...createLocalConfig(directory), ...outcomeGatewayFixture, payloadBaseUrl: 'http://127.0.0.1:9', payloadApiKey: 'test-api-key', payloadSiteId: 'test-site', webMasterBaseUrl: 'http://127.0.0.1:9', previewAccessToken: 'test-preview-token', leaseDurationMs: 25, workerId: 'worker-a' }
  const first = await createProductionComposition(config)
  let second: Awaited<ReturnType<typeof createProductionComposition>> | undefined
  try {
    await first.ledger.createOrResume(lead('lead-stale-receipt'))
    const stale = await first.ledger.claim('lead-research')
    assert.ok(stale)
    await new Promise((resolve) => setTimeout(resolve, 60)) // worker A is paused across its lease expiry
    second = await createProductionComposition({ ...config, workerId: 'worker-b' })
    assert.equal(await second.ledger.reclaimExpiredLeases(), 1)
    const current = await second.ledger.claim('lead-research')
    assert.ok(current)
    await assert.rejects(first.ledger.saveReceipt('lead-research', 'stale-external-effect', { acknowledged: true }, stale.run.runId, stale.run.lease!.fencingToken), /stale lease fencing token/)
    await assert.rejects(first.ledger.succeed(stale.run.runId, stale.run.lease!.fencingToken, { stale: true }, []), /stale lease|not found/)
    assert.equal((await second.ledger.snapshot()).receipts.length, 0)
  } finally { await second?.close?.(); await first.close(); await rm(directory, { recursive: true, force: true }) }
})

test('a stale lease is rejected before the token-gated external preview mutation can write evidence', async () => {
  const value = await composition('lead-stale-external-mutation')
  try {
    await value.ledger.createOrResume(lead('lead-stale-external-mutation'))
    await assert.rejects(
      value.adapters.createPrivatePreview('site:lead-stale-external-mutation', { payloadDocumentIds: ['pages::stale'], parity: true }, { runId: 'run:expired', fencingToken: 0 }),
      /stale lease fencing token|not found/,
    )
    await assert.rejects(readdir(`${value.directory}/evidence`), /ENOENT/)
  } finally { await value.close(); await rm(value.directory, { recursive: true, force: true }) }
})

test('two independent workers fence the same ready issue to one claim', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'linksites-w2-02-race-'))
  const config = { ...createLocalConfig(directory), ...outcomeGatewayFixture, payloadBaseUrl: 'http://127.0.0.1:9', payloadApiKey: 'test-api-key', payloadSiteId: 'test-site', webMasterBaseUrl: 'http://127.0.0.1:9', previewAccessToken: 'test-preview-token', workerId: 'setup-worker' }
  const setup = await createProductionComposition(config)
  try {
    await setup.ledger.createOrResume(lead('lead-cross-process-race'))
    const worker = (workerId: string) => new Promise<string>((resolve, reject) => {
      const code = `(async()=>{const {createLocalConfig}=await import('./src/composition.ts');const {DurableLedger}=await import('./src/durable-store.ts');const c=createLocalConfig(${JSON.stringify(directory)},'local-org');const x=new DurableLedger({...c,workerId:${JSON.stringify(workerId)}});const claim=await x.claim('lead-research');process.stdout.write(claim?claim.run.runId:'none')})().catch(e=>{console.error(e);process.exit(1)})`
      const child = spawn(process.execPath, ['--import', 'tsx/esm', '-e', code], { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'] })
      let stdout = ''; let stderr = ''
      child.stdout.on('data', (chunk) => { stdout += chunk })
      child.stderr.on('data', (chunk) => { stderr += chunk })
      child.on('exit', (status) => status === 0 ? resolve(stdout) : reject(new Error(stderr)))
    })
    const claims = await Promise.all([worker('race-a'), worker('race-b')])
    assert.equal(claims.filter((value) => value !== 'none').length, 1)
    assert.equal((await setup.ledger.snapshot()).runs.length, 1)
  } finally { await setup.close(); await rm(directory, { recursive: true, force: true }) }
})

test('configuration and executor registry fail closed', () => {
  assert.throws(() => configFromEnvironment({}, '/tmp'), /configuration is incomplete/)
  const config = createLocalConfig('/tmp/w2-02-test')
  assert.throws(() => validateRuntimeConfig(config), /gateway verification configuration/)
  const configured = { ...config, ...outcomeGatewayFixture }
  assert.throws(() => validateRuntimeConfig({ ...configured, approvedExecutors: { ...configured.approvedExecutors, 'payload.draft.promote': '9.9.9' } }), /not approved/)
  assert.throws(() => validateRuntimeConfig({ ...configured, approvedExecutors: { ...configured.approvedExecutors, 'unknown.executor': '1.0.0' } }), /unknown or missing executor kind/)
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

test('completion outbox exhausts into a terminal dead letter', async () => {
  const value = await composition('lead-completion-dead-letter')
  try {
    await value.adapters.injectFault({ operation: 'completion.emit', remaining: 3, kind: 'transient' })
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await assert.rejects(value.runtime.runLead(lead('lead-completion-dead-letter')), /boundary:completion-sink:transient-failure/)
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 1_050))
    }
    const state = await value.runtime.exportState() as { outbox: Array<{ status: string; attempts: number; deadLetteredAt: string | null }>; metrics: { outboxBacklog: number; outboxDeadLetters: number } }
    assert.deepEqual(state.outbox.map((entry) => entry.status), ['dead_lettered'])
    assert.equal(state.outbox[0]?.attempts, 3)
    assert.ok(state.outbox[0]?.deadLetteredAt)
    assert.equal(state.metrics.outboxBacklog, 0)
    assert.equal(state.metrics.outboxDeadLetters, 1)
  } finally { await value.close(); await rm(value.directory, { recursive: true, force: true }) }
})
