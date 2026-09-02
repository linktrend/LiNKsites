#!/usr/bin/env node
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(new URL('../..', import.meta.url).pathname)
const workflow = readFileSync(resolve(root, '.github/workflows/ci.yml'), 'utf8')
const fastScript = readFileSync(resolve(root, 'scripts/ci-fast.sh'), 'utf8')
const keyWriter = readFileSync(resolve(root, 'scripts/ci/write-cache-key-manifest.mjs'), 'utf8')
assert.doesNotMatch(workflow, /uses:\s*actions\/cache@v4/)
assert.doesNotMatch(workflow, /hashFiles\(/)
assert.match(workflow, /id: cache-keys[\s\S]*write-cache-key-manifest\.mjs/)
assert.match(fastScript, /pnpm test:w2-08/)
assert.match(fastScript, /w2-08-source-certification/)
assert.ok((workflow.match(/actions\/cache\/restore@v4/g) ?? []).length >= 3)
assert.ok((workflow.match(/actions\/cache\/save@v4/g) ?? []).length >= 3)
assert.doesNotMatch(workflow, /buildx-restore|Save Docker BuildKit layers|path:\s*~\/\.cache\/linksites-buildx/)
assert.match(workflow, /DOCKER_BUILDKIT_CACHE:\s*disabled/)
for (const marker of ['actions/cache/restore@v4', 'actions/cache/save@v4']) {
  const positions = [...workflow.matchAll(new RegExp(marker.replaceAll('/', '\\/'), 'g'))].map((match) => match.index)
  for (const position of positions) assert.match(workflow.slice(Math.max(0, position - 180), position), /continue-on-error:\s*true/)
}
const profile = workflow.indexOf('Run Full application and recovery profile')
const receipt = workflow.indexOf('Bind successful suite to exact Phase source and file tree')
const evidence = workflow.indexOf('Upload exact Full application evidence')
const save = workflow.indexOf('Save Playwright browser payload')
assert.ok(profile >= 0 && receipt > profile && evidence > receipt && save > evidence, 'cache save must follow required profile, receipt, and evidence')
assert.doesNotMatch(workflow.slice(profile, receipt), /continue-on-error:\s*true/)
assert.doesNotMatch(workflow.slice(receipt, evidence), /continue-on-error:\s*true/)
assert.doesNotMatch(workflow.slice(0, save), /cache-hit[^\n]*Run Full application/)
assert.match(keyWriter, /git', \['ls-tree', '-r', 'HEAD'/)
assert.match(keyWriter, /computedBeforeWorkspaceMutation/)
process.stdout.write('cache workflow contract probes passed\n')
