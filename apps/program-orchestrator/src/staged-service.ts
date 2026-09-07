import { createServer } from 'node:http'

const port = Number(process.env.PORT ?? '3000')
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer between 1 and 65535')
if (process.env.LINKSITES_DEPLOYMENT_ENV !== 'production') throw new Error('staged orchestrator requires production deployment identity')
if (process.env.LINKSITES_TEMPLATE_RELEASE_STATE !== 'pending') throw new Error('staged orchestrator is only valid while the template provider release is pending')

const responseHeaders = { 'content-type': 'application/json', 'cache-control': 'no-store' }
const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://127.0.0.1')
  if (request.method === 'GET' && url.pathname === '/healthz') {
    response.writeHead(200, responseHeaders).end(JSON.stringify({ status: 'live', service: 'program-orchestrator', activation: 'pending_provider' }))
    return
  }
  if (request.method === 'GET' && url.pathname === '/readyz') {
    response.writeHead(200, responseHeaders).end(JSON.stringify({ status: 'staged', service: 'program-orchestrator', intakeEnabled: false, providerRelease: 'pending' }))
    return
  }
  if (request.method === 'GET' && url.pathname === '/metrics') {
    response.writeHead(200, { 'content-type': 'text/plain; version=0.0.4', 'cache-control': 'no-store' })
    response.end('linksites_program_intake_enabled 0\nlinksites_program_provider_release_pending 1\n')
    return
  }
  if (url.pathname.startsWith('/ingress/')) {
    response.writeHead(503, { ...responseHeaders, 'retry-after': '3600' }).end(JSON.stringify({ error: 'intake disabled pending provider release' }))
    return
  }
  response.writeHead(404).end()
})

server.listen(port, '0.0.0.0', () => console.log(JSON.stringify({ timestamp: new Date().toISOString(), service: 'program-orchestrator', event: 'staged', intakeEnabled: false, providerRelease: 'pending' })))

const stop = () => server.close(() => process.exit(0))
process.once('SIGTERM', stop)
process.once('SIGINT', stop)
