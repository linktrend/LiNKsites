#!/usr/bin/env node
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(new URL('../..', import.meta.url).pathname)
const workflow = readFileSync(resolve(root, '.github/workflows/ci.yml'), 'utf8')
const preflight = readFileSync(resolve(root, 'scripts/ci/full-runtime-preflight.mjs'), 'utf8')
const full = readFileSync(resolve(root, 'scripts/ci-required.sh'), 'utf8')
assert.match(preflight, /\['pnpm', 'docker', 'supabase'\]/)
assert.match(preflight, /playwright', 'install', '--with-deps', 'chromium'/)
assert.match(preflight, /W2_02_CHROMIUM_EXECUTABLE/)
assert.match(preflight, /W2_04_CHROMIUM_EXECUTABLE/)
assert.match(workflow, /Run deterministic Full runtime preflight[\s\S]*full-runtime-preflight\.mjs/)
assert.ok(workflow.indexOf('Run deterministic Full runtime preflight') < workflow.indexOf('Run Full application and recovery profile'))
assert.doesNotMatch(full, /component chromium-install/)
assert.match(full, /preflight chromium bindings are required/)
process.stdout.write('full runtime preflight contract probes passed\n')
