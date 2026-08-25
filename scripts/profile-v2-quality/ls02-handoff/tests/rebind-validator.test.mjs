#!/usr/bin/env node
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { CANDIDATE_PARENT } from '../constants.mjs'
import { validateHandoff, validateManifest, validateOwnedPaths } from '../rebind-validator.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const packageRoot = dirname(here)
const repoRoot = join(packageRoot, '../../..')
const inputFile = join(repoRoot, 'docs/evidence/ls02/handoff-successor/handoff-successor.json')
const manifestFile = join(repoRoot, 'docs/evidence/ls02/handoff-successor/manifest.json')
const checksumsFile = join(repoRoot, 'docs/evidence/ls02/handoff-successor/SHA256SUMS.json')
const validator = join(packageRoot, 'rebind-validator.mjs')

const load = (file) => JSON.parse(readFileSync(file, 'utf8'))

test('canonical handoff is identity-only and candidate-bound', () => {
  const result = validateHandoff(load(inputFile))
  assert.deepEqual(result.failures, [])
  assert.equal(result.verdict, 'IDENTITY_REBIND_READY')
  assert.deepEqual(load(inputFile).candidateParent, CANDIDATE_PARENT)
})

test('stale candidate fails closed', () => {
  const input = load(join(packageRoot, 'fixtures/stale-candidate.json'))
  const result = validateHandoff(input)
  assert.equal(result.ok, false)
  assert.equal(result.verdict, 'STALE_CANDIDATE')
})

test('foreign repository and issue fail closed', () => {
  const input = load(join(packageRoot, 'fixtures/foreign-repository.json'))
  const result = validateHandoff(input)
  assert.equal(result.ok, false)
  assert.equal(result.verdict, 'FOREIGN_INPUT')
})

test('acceptance and provider-byte claims fail closed', () => {
  const input = load(inputFile)
  input.h09.conformanceAccepted = true
  assert.equal(validateHandoff(input).ok, false)
  const providerBytes = load(inputFile)
  providerBytes.provider.bytesCopied = true
  assert.equal(validateHandoff(providerBytes).ok, false)
})

test('owned path confinement rejects product and traversal paths', () => {
  assert.equal(validateOwnedPaths([
    'docs/evidence/ls02/handoff-successor/handoff-successor.json',
    'scripts/profile-v2-quality/ls02-handoff/rebind-validator.mjs',
  ]).ok, true)
  const result = validateOwnedPaths(['packages/factory-catalog/src/siteSpecification.ts', '../apps/web/page.tsx'])
  assert.equal(result.ok, false)
  assert.equal(result.failures.length, 2)
})

test('generated manifest and checksums are internally coherent', () => {
  const result = validateManifest(load(manifestFile), load(checksumsFile), repoRoot)
  assert.deepEqual(result.failures, [])
})

test('CLI emits identity-only readiness and rejects stale input', () => {
  const output = execFileSync(process.execPath, [validator, '--input', inputFile, '--manifest', manifestFile, '--checksums', checksumsFile], { encoding: 'utf8' })
  assert.match(output, /REBIND_OK verdict=IDENTITY_REBIND_READY/)
  assert.throws(() => execFileSync(process.execPath, [validator, '--input', join(packageRoot, 'fixtures/stale-candidate.json'), '--manifest', manifestFile, '--checksums', checksumsFile], { encoding: 'utf8' }), /STALE_CANDIDATE/)
})

test('validator syntax is valid', () => {
  execFileSync(process.execPath, ['--check', validator])
})
