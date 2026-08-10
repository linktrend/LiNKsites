import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { GRAPH_EXPORT } from '../src/graph.ts'

const target = resolve(dirname(fileURLToPath(import.meta.url)), '../../../docs/production-roadmap/evidence/w2-02/program-graph.json')
const exported = JSON.parse(await readFile(target, 'utf8'))
assert.deepEqual(exported, JSON.parse(JSON.stringify(GRAPH_EXPORT)), 'committed program-graph.json is not the canonical exporter output')
assert.equal(exported.issues.length, 16)
process.stdout.write('W2-02 canonical graph validation: PASS (16 issues)\n')
