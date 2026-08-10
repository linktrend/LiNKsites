import { FileOutbox, type GatewayRequest } from '../../src/index.ts'

const input = JSON.parse(process.env.LINKSITES_TEST_OUTBOX_CRASH_INPUT ?? '') as {
  path: string
  request: GatewayRequest
}

const outbox = new FileOutbox(input.path, {
  integritySecret: 'queue-integrity-test',
  leaseMs: 30,
  lockStaleMs: 1,
  resigner: (request, attempt) => ({ ...request, envelope: { ...request.envelope, delivery_attempt: attempt } }),
  validator: () => undefined,
})
await outbox.enqueue(input.request)
await outbox.drain(async () => { process.exit(42) }, 0)
