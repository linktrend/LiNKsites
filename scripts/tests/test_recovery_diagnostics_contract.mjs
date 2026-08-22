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
assert.match(proof, /run_phase payload-seed/)
assert.match(proof, /run_phase web-build/)
assert.match(proof, /local_db_scheme="postgresql:"/)
assert.match(proof, /local_db_port="54322"/)
assert.match(proof, /W2-02 local proof must use the disposable Supabase URI/)
assert.equal((proof.match(/PAYLOAD_API_KEY="\$api_key"/g) ?? []).length, 3, 'all hosted Payload consumers must use the generated seed API key')
assert.ok(proof.indexOf('api_key="$(node') < proof.indexOf('PAYLOAD_API_KEY="$api_key"'), 'generated API key must be read before any consumer starts')
assert.doesNotMatch(proof, /(?:W2_02_)?PAYLOAD_API_KEY="ltfx\./, 'hosted Payload consumers must not use unrelated synthetic literals')
assert.match(proof, /diagnostic_root\/cms\.log/)
assert.match(proof, /diagnostic_root\/web\.log/)
assert.match(proof, /sanitize_file/)
assert.match(proof, /\.cms\.log\.raw/)
assert.match(proof, /\.web\.log\.raw/)
assert.match(rehearsal, /recovery-failure\.json/)
assert.match(rehearsal, /w2-07-recovery-failure\.json/)
assert.match(rehearsal, /w2-02\.stderr\.log/)
process.stdout.write('Recovery diagnostics contract probe passed\n')
