#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { createServer } from 'node:http'
import { LiNKautoworkGateway, parseGatewayEventPolicies } from '../../packages/autowork-boundary/src/index.ts'

if (process.env.LINKSITES_LOCAL_COMPOSE_PROOF !== '1') {
  console.error('local-proof LiNKautowork gateway refuses non-proof execution')
  process.exit(78)
}

const secret = process.env.LINKAUTOWORK_SIGNING_SECRET ?? ''
const keyId = process.env.LINKAUTOWORK_SIGNING_KEY_ID ?? ''
const policies = parseGatewayEventPolicies(process.env.LINKAUTOWORK_EVENT_GRANTS ?? '')
const gateway = new LiNKautoworkGateway({
  secret,
  keyId,
  environment: 'production',
  policies,
  transport: async () => { throw new Error('proof receiver has no outbound transport') },
})

createServer((request, response) => {
  if (request.method === 'GET' && request.url === '/healthz') {
    response.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' })
    response.end('{"status":"ok","service":"local-proof-autowork-gateway"}')
    return
  }
  if (request.method !== 'POST' || request.url !== '/') {
    response.writeHead(404).end()
    return
  }
  let raw = ''
  request.setEncoding('utf8')
  request.on('data', (chunk) => {
    raw += chunk
    if (raw.length > 128 * 1024) request.destroy()
  })
  request.on('end', () => {
    try {
      const signedRequest = JSON.parse(raw)
      const envelope = gateway.verify(signedRequest)
      if (envelope.event_name !== 'demo.completed') throw new Error('unexpected proof event')
      const acknowledgedAt = new Date().toISOString()
      const receiptId = `local-proof:${createHash('sha256').update(envelope.idempotency_key).digest('hex').slice(0, 24)}`
      response.writeHead(202, {
        'content-type': 'application/json',
        'cache-control': 'no-store',
        'x-linkautowork-receipt': receiptId,
        'x-linkautowork-receipt-signature': gateway.signAcknowledgement(signedRequest, receiptId, acknowledgedAt),
        'x-linkautowork-acknowledged-at': acknowledgedAt,
      })
      response.end('{"acknowledged":true}')
    } catch {
      response.writeHead(401, { 'cache-control': 'no-store' })
      response.end('{"acknowledged":false}')
    }
  })
}).listen(3001, '0.0.0.0', () => {
  process.stdout.write('{"status":"ready","service":"local-proof-autowork-gateway"}\n')
})
