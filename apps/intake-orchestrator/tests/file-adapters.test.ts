import assert from 'node:assert/strict'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import test from 'node:test'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { manualFirstTestLead, validDemoCompletion } from '../../../packages/types/fixtures/w1-01-contract-fixtures.ts'
import { FileCompletionSink, FileWorkIntakePort } from '../src/file-adapters.ts'

test('file adapters use canonical envelopes and idempotent local completion output', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'linksites-w1-03-'))
  const inputPath = join(directory, 'intake.ndjson')
  const outputPath = join(directory, 'completion.ndjson')
  await writeFile(inputPath, `${JSON.stringify(manualFirstTestLead)}\n`, 'utf8')

  const intake = new FileWorkIntakePort(inputPath)
  const now = '2026-08-04T00:00:00.000Z'
  const [item] = await intake.pullReady(10, now)
  assert.equal(item?.itemId, 'line:1')
  const claim = await intake.claim(item!.itemId, manualFirstTestLead.lead_id, manualFirstTestLead.idempotency_key, now)
  assert.ok(claim)
  await intake.acknowledge(item!.itemId, { state: 'program_started' })
  assert.deepEqual(await intake.pullReady(10, now), [])

  const sink = new FileCompletionSink(outputPath)
  await sink.write(validDemoCompletion)
  await sink.write(validDemoCompletion)
  const lines = (await readFile(outputPath, 'utf8')).trim().split('\n')
  assert.equal(lines.length, 1)
  assert.equal(JSON.parse(lines[0]!).idempotency_key, validDemoCompletion.idempotency_key)
})

test('competing file intake adapters produce exactly one claim winner', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'linksites-w1-03-'))
  const inputPath = join(directory, 'intake.ndjson')
  const statePath = join(directory, 'claims.state.json')
  await writeFile(inputPath, `${JSON.stringify(manualFirstTestLead)}\n`, 'utf8')

  const first = new FileWorkIntakePort(inputPath, statePath)
  const second = new FileWorkIntakePort(inputPath, statePath)
  const now = '2026-08-04T00:00:00.000Z'
  const [firstItem] = await first.pullReady(10, now)
  const [secondItem] = await second.pullReady(10, now)
  assert.equal(firstItem?.itemId, 'line:1')
  assert.equal(secondItem?.itemId, 'line:1')

  const claims = await Promise.all([
    first.claim(firstItem!.itemId, manualFirstTestLead.lead_id, manualFirstTestLead.idempotency_key, now),
    second.claim(secondItem!.itemId, manualFirstTestLead.lead_id, manualFirstTestLead.idempotency_key, now),
  ])

  assert.equal(claims.filter(Boolean).length, 1)
  assert.deepEqual(await first.pullReady(10, now), [])
  assert.deepEqual(await second.pullReady(10, now), [])
})

test('file intake durably reclaims a retryable Program claim only when due', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'linksites-w1-03-'))
  const inputPath = join(directory, 'intake.ndjson')
  await writeFile(inputPath, `${JSON.stringify(manualFirstTestLead)}\n`, 'utf8')
  const intake = new FileWorkIntakePort(inputPath)
  const firstNow = '2026-08-04T00:00:00.000Z'
  const retryAt = '2026-08-04T00:00:00.007Z'

  const [item] = await intake.pullReady(10, firstNow)
  await intake.claim(item!.itemId, manualFirstTestLead.lead_id, manualFirstTestLead.idempotency_key, firstNow)
  await intake.acknowledge(item!.itemId, {
    state: 'program_retry_scheduled',
    reasonCode: 'ledger:program-create-transient',
    nextAttemptAt: retryAt,
    attemptNumber: 2,
  })

  assert.deepEqual(await intake.pullReady(10, firstNow), [])
  const [retry] = await intake.pullReady(10, retryAt)
  assert.equal(retry?.attemptNumber, 2)
  assert.ok(await intake.claim(retry!.itemId, manualFirstTestLead.lead_id, manualFirstTestLead.idempotency_key, retryAt))
})
