import { createServer } from 'node:http'
import { configFromEnvironment, createProductionComposition } from './composition.ts'
import { runFirstReadyLead } from './intake.ts'

const port = Number(process.env.PORT ?? '3000')
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer between 1 and 65535')

const config = configFromEnvironment(process.env, process.cwd())
const composition = await createProductionComposition(config)
let stopping = false
let cycling = false
let lastError: string | null = null

const log = (event: string, values: Record<string, unknown> = {}) => console.log(JSON.stringify({ timestamp: new Date().toISOString(), service: 'program-orchestrator', event, correlationId: `program:${config.orgId}`, ...values }))
const cycle = async () => {
  if (cycling || stopping) return
  cycling = true
  try {
    await runFirstReadyLead(composition)
    lastError = null
  } catch (error) {
    // No ready work is normal. The externally visible diagnostic stays safe.
    lastError = error instanceof Error ? error.message.replace(/(?:secret|token|password|authorization|api.?key)\s*[:=]\s*\S+/gi, '[REDACTED]') : 'unknown'
    log('intake_cycle_failed', { safeCode: 'program:intake-cycle-failed' })
  } finally {
    cycling = false
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', 'http://127.0.0.1')
  if (request.method !== 'GET') { response.writeHead(405).end(); return }
  if (url.pathname === '/healthz') {
    response.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' })
    response.end(JSON.stringify({ status: 'live', service: 'program-orchestrator' }))
    return
  }
  if (url.pathname === '/readyz') {
    const health = await composition.runtime.health().catch(() => null)
    const ready = Boolean(health?.readiness) && !lastError
    response.writeHead(ready ? 200 : 503, { 'content-type': 'application/json', 'cache-control': 'no-store' })
    response.end(JSON.stringify({ status: ready ? 'ready' : 'not_ready', service: 'program-orchestrator' }))
    return
  }
  if (url.pathname === '/metrics') {
    const health = await composition.runtime.health().catch(() => null)
    if (!health) { response.writeHead(503).end(); return }
    const metric = (name: string, value: number) => `linksites_program_${name} ${value}\n`
    response.writeHead(200, { 'content-type': 'text/plain; version=0.0.4', 'cache-control': 'no-store' })
    response.end(metric('active_issues', health.activeIssues) + metric('retries_total', health.retries) + metric('dead_letters_total', health.deadLetters) + metric('manual_attention_total', health.manualAttention) + metric('completion_emits_total', health.completionEmits))
    return
  }
  response.writeHead(404).end()
})

const interval = setInterval(() => { void cycle() }, Number(process.env.LINKSITES_PROGRAM_POLL_MS ?? '5000'))
server.listen(port, '0.0.0.0', () => log('started', { port }))
void cycle()
const stop = async () => {
  if (stopping) return
  stopping = true
  clearInterval(interval)
  await new Promise<void>((resolve) => server.close(() => resolve()))
  await composition.close()
  log('stopped')
}
process.once('SIGTERM', () => { void stop() })
process.once('SIGINT', () => { void stop() })
