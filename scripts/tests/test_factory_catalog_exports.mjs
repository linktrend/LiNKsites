#!/usr/bin/env node
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const root = resolve(new URL('../..', import.meta.url).pathname)
const index = resolve(root, 'packages/factory-catalog/src/index.ts')
const source = readFileSync(index, 'utf8')
const specifiers = [...source.matchAll(/export \* from ['"](\.\/[^'"]+)['"]/g)].map((match) => match[1])
assert.ok(specifiers.length > 0)
for (const specifier of specifiers) {
  assert.match(specifier, /\.ts$/, `workspace export must resolve to TypeScript source: ${specifier}`)
  assert.ok(existsSync(resolve(dirname(index), specifier)), `workspace export target is missing: ${specifier}`)
}
assert.doesNotMatch(source, /export \* from ['"]\.\/[^'"]+\.js['"]/, 'workspace export index must not point at runtime-only .js paths')
process.stdout.write('Factory catalog TypeScript export-resolution probe passed\n')
