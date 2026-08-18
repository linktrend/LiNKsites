#!/usr/bin/env node
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const root = resolve(new URL('../..', import.meta.url).pathname)
const script = join(root, 'scripts/ci/affected-docker-images.mjs')
const temp = mkdtempSync(join(tmpdir(), 'linksites-docker-classifier-'))
const run = (paths, expectedMode, expectedImages) => {
  const output = join(temp, `${Math.random()}.json`)
  const pathsFile = join(temp, `${Math.random()}.paths`)
  writeFileSync(pathsFile, `${paths.join('\n')}\n`)
  execFileSync(process.execPath, [script, '--base', 'HEAD', '--head', 'HEAD', '--paths-file', pathsFile, '--output', output], { cwd: root })
  const result = JSON.parse(readFileSync(output, 'utf8'))
  assert.equal(result.mode, expectedMode)
  assert.equal(result.schemaVersion, 1)
  assert.equal(result.baseSha, 'HEAD')
  assert.equal(result.headSha, 'HEAD')
  assert.deepEqual(result.images, expectedImages)
}
try {
  run(['apps/cms/src/config.ts'], 'affected', ['cms'])
  run(['pnpm-lock.yaml'], 'all', ['cms', 'web-master', 'autowork-worker', 'program-orchestrator', 'migrations'])
  process.stdout.write('affected Docker classifier fail-closed probe passed\n')
} finally {
  rmSync(temp, { recursive: true, force: true })
}
