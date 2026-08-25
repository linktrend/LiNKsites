#!/usr/bin/env node
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { spawnSync } from 'node:child_process'
import { evaluateConsumerProof, exitCodeFor } from '../consumer-proof-validator.mjs'
import { HOLD_PROVIDER_OR_A1_ABSENT, LANES } from '../lanes.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const fixture = (name) => JSON.parse(readFileSync(join(root, 'fixtures', name), 'utf8'))
const cli = join(root, 'consumer-proof-validator.mjs')

const CANDIDATE_COMMIT = '2ba3bd70244061985a3896e748fb75e92dfb6c69'
const CANDIDATE_TREE = '606fcb986b8eb9af476aea369d94990357ff9681'

test('missing candidate identity fails closed', () => {
  const result = evaluateConsumerProof({})
  assert.equal(result.overall, 'FAIL')
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((item) => item.includes('candidate identity') || item.includes('candidate.commit')))
})

test('absent provider/A1 receipt HOLDs every lane', () => {
  const result = evaluateConsumerProof(fixture('absent-receipt.input.json'))
  assert.equal(result.overall, 'HOLD')
  assert.equal(result.ok, true)
  assert.deepEqual(result.holds, [HOLD_PROVIDER_OR_A1_ABSENT])
  assert.equal(result.lanes.length, LANES.length)
  assert.ok(result.lanes.every((lane) => lane.status === 'HOLD' && lane.reason === HOLD_PROVIDER_OR_A1_ABSENT))
  assert.equal(result.claims.accept, false)
  assert.equal(result.claims.protectedIntegration, false)
  assert.equal(result.claims.providerConformance, false)
  assert.equal(result.claims.productionProof, false)
  assert.equal(exitCodeFor(result), 0)
})

test('provider checkout inputs are rejected', () => {
  const result = evaluateConsumerProof(fixture('provider-checkout-forbidden.input.json'))
  assert.equal(result.overall, 'FAIL')
  assert.ok(result.errors.includes('validator must not require a provider checkout'))
  assert.ok(result.errors.includes('provider checkout path is not an allowed input'))
})

test('ACCEPT in a receipt is a forbidden claim', () => {
  const result = evaluateConsumerProof(fixture('forbidden-accept.input.json'))
  assert.equal(result.overall, 'FAIL')
  assert.ok(result.errors.some((item) => item.includes('forbidden claim ACCEPT')))
})

test('all-Hero flattening fails resolver lanes', () => {
  const result = evaluateConsumerProof(fixture('all-hero-flattening.input.json'))
  assert.equal(result.overall, 'FAIL')
  const resolver = result.lanes.filter((lane) => lane.id.startsWith('resolver_plan_'))
  assert.ok(resolver.every((lane) => lane.status === 'FAIL'))
})

test('partial A1 receipt HOLDs missing plans and surfaces', () => {
  const result = evaluateConsumerProof(fixture('partial-resolver-hold.input.json'))
  assert.equal(result.overall, 'HOLD')
  const byId = Object.fromEntries(result.lanes.map((lane) => [lane.id, lane]))
  assert.equal(byId.resolver_plan_a.status, 'PASS')
  assert.equal(byId.resolver_plan_b.status, 'HOLD')
  assert.equal(byId.resolver_plan_l.status, 'HOLD')
  assert.equal(byId.payload_projection.status, 'HOLD')
  assert.equal(byId.browser.status, 'HOLD')
  assert.equal(byId.privacy.status, 'HOLD')
})

test('complete candidate evidence is not ACCEPT or protected integration', () => {
  const result = evaluateConsumerProof(fixture('complete-candidate-evidence.input.json'))
  assert.equal(result.overall, 'CANDIDATE_EVIDENCE_COMPLETE')
  assert.ok(result.lanes.every((lane) => lane.status === 'PASS'))
  assert.equal(result.claims.accept, false)
  assert.equal(result.claims.protectedIntegration, false)
  assert.doesNotMatch(JSON.stringify(result), /\bACCEPT\b/)
  assert.doesNotMatch(JSON.stringify(result), /PROTECTED_INTEGRATION/)
})

test('CLI HOLDs the exact candidate when receipts are absent', () => {
  const proc = spawnSync(process.execPath, [
    cli,
    '--input',
    join(root, 'fixtures/absent-receipt.input.json'),
    '--candidate-commit',
    CANDIDATE_COMMIT,
    '--candidate-tree',
    CANDIDATE_TREE,
  ], { encoding: 'utf8' })
  assert.equal(proc.status, 0, proc.stderr)
  const result = JSON.parse(proc.stdout)
  assert.equal(result.candidate.commit, CANDIDATE_COMMIT)
  assert.equal(result.candidate.tree, CANDIDATE_TREE)
  assert.equal(result.overall, 'HOLD')
  assert.equal(result.gateId, 'EXT-LS-01')
})

test('CLI fails closed on forbidden ACCEPT', () => {
  const proc = spawnSync(process.execPath, [
    cli,
    '--input',
    join(root, 'fixtures/forbidden-accept.input.json'),
  ], { encoding: 'utf8' })
  assert.equal(proc.status, 2)
})

test('payload collision of Products and Services fails', () => {
  const input = fixture('complete-candidate-evidence.input.json')
  input.a1Receipt.payloadProjection.productsDistinctFromServices = false
  const result = evaluateConsumerProof(input)
  assert.equal(result.overall, 'FAIL')
  assert.equal(result.lanes.find((lane) => lane.id === 'payload_projection').status, 'FAIL')
})
