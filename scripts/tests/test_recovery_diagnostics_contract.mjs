#!/usr/bin/env node
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(new URL('../..', import.meta.url).pathname)
const proof = readFileSync(resolve(root, 'scripts/w2-02-local-proof.sh'), 'utf8')
const rehearsal = readFileSync(resolve(root, 'deploy/scripts/rehearse-local-restore.mjs'), 'utf8')
execFileSync('bash', ['-n', resolve(root, 'scripts/w2-02-local-proof.sh')])
execFileSync(process.execPath, ['--check', resolve(root, 'deploy/scripts/rehearse-local-restore.mjs')])
assert.match(proof, /recovery-phases\.jsonl/)
assert.match(proof, /run_phase real-service/)
assert.match(proof, /run_phase posthook/)
assert.match(rehearsal, /recovery-failure\.json/)
assert.match(rehearsal, /w2-07-recovery-failure\.json/)
assert.match(rehearsal, /w2-02\.stderr\.log/)
process.stdout.write('Recovery diagnostics contract probe passed\n')
