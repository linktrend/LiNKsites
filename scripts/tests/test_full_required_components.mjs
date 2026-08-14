#!/usr/bin/env node
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = resolve(new URL('../..', import.meta.url).pathname)
const manifest = join(root, 'scripts/ci/full-required-components.json')
const verifier = join(root, 'scripts/ci/verify-full-required-components.mjs')
const directory = mkdtempSync(join(tmpdir(), 'linksites-full-coverage-'))
try {
  const required = JSON.parse(readFileSync(manifest, 'utf8')).alwaysRequired
  const timingFile = join(directory, 'timings.jsonl')
  writeFileSync(timingFile, required.filter((name) => name !== 'cms-production-build').map((component) => JSON.stringify({ component, result: 'passed' })).join('\n') + '\n')
  const result = spawnSync(process.execPath, [verifier, '--manifest', manifest, '--timings', timingFile, '--recovery-required', '0'], { encoding: 'utf8' })
  assert.notEqual(result.status, 0, 'missing cms-production-build must fail the aggregate')
  assert.match(result.stderr, /cms-production-build/)
  process.stdout.write('missing cms-production-build negative probe passed\n')
} finally {
  rmSync(directory, { recursive: true, force: true })
}
