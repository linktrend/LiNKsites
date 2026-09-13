import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import test from 'node:test'
import { parsePinnedActions, parsePinnedFromLines } from '../oss-continuity/contract.mjs'

const root = resolve(new URL('../..', import.meta.url).pathname)
const RELEASE_WORKFLOWS = [
  '.github/workflows/ci.yml',
  '.github/workflows/publish-server03-images.yml',
]
const PRODUCTION_DOCKERFILES = [
  'deploy/docker/cms.Dockerfile',
  'deploy/docker/web-master.Dockerfile',
  'deploy/docker/autowork-worker.Dockerfile',
  'deploy/docker/program-orchestrator.Dockerfile',
  'deploy/docker/migrations.Dockerfile',
]
const NODE_IMAGE = 'node:22.17.0-alpine@sha256:fc3e945f920b7e3000cd1af86c4ae406ec70c72f328b667baf0f3a8910d69eed'
const PNPM_PACKAGE_MANAGER =
  /^pnpm@10\.0\.0\+sha512\.[a-f0-9]{128}$/
const USES_LINE = /^\s+uses:\s+(\S+?)@([^\s#]+)(?:\s+#\s*(.*))?$/gm
const NODE_VERSION_LINE = /^\s+node-version:\s*['"]?([^\s#'"]+)['"]?\s*$/gm
const GIT_SHA = /^[0-9a-f]{40}$/

function floatingUses(text) {
  const floating = []
  USES_LINE.lastIndex = 0
  let match
  while ((match = USES_LINE.exec(text))) {
    if (!GIT_SHA.test(match[2])) floating.push(`${match[1]}@${match[2]}`)
  }
  return floating
}

test('release-relevant CI and publication workflows have no floating GitHub Action tags', async () => {
  for (const rel of RELEASE_WORKFLOWS) {
    const text = await readFile(resolve(root, rel), 'utf8')
    const floating = floatingUses(text)
    assert.deepEqual(floating, [], `${rel} has floating actions: ${floating.join(', ')}`)
    const parsed = parsePinnedActions(text)
    assert.deepEqual(parsed.floating, [], `${rel} parsePinnedActions floating: ${parsed.floating.join(', ')}`)
    assert.ok(parsed.actions.length > 0, `${rel} must declare at least one commit-pinned action`)
    for (const action of parsed.actions) {
      assert.match(action.commit, GIT_SHA, `${action.uses} missing immutable commit`)
      assert.ok(action.comment, `${action.uses}@${action.commit} must keep a readable version comment`)
    }
  }
})

test('CI Node and pnpm toolchain inputs are exact identities, not majors or moving tags', async () => {
  const nvmrc = (await readFile(resolve(root, '.nvmrc'), 'utf8')).trim()
  assert.equal(nvmrc, '22.17.0')
  const pkg = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'))
  assert.match(String(pkg.packageManager || ''), PNPM_PACKAGE_MANAGER)
  const ci = await readFile(resolve(root, '.github/workflows/ci.yml'), 'utf8')
  const nodeVersions = [...ci.matchAll(NODE_VERSION_LINE)].map((row) => row[1])
  assert.ok(nodeVersions.length >= 2, 'ci.yml must pin Node on Fast and Full')
  assert.ok(nodeVersions.every((value) => value === '22.17.0'), `unpinned CI Node: ${nodeVersions.join(',')}`)
  assert.doesNotMatch(ci, /node-version:\s*['"]?22['"]?\s*$/m)
  assert.match(ci, /version:\s*10\.0\.0/)
  assert.match(ci, /supabase\/setup-cli@[0-9a-f]{40} # v1\.7\.1/)
  assert.match(ci, /version:\s*2\.81\.3/)
})

test('production Dockerfiles remain digest-pinned and Corepack uses the integrity-qualified pnpm identity', async () => {
  const pkg = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'))
  const expectedPrepare = `corepack prepare ${pkg.packageManager} --activate`
  for (const rel of PRODUCTION_DOCKERFILES) {
    const text = await readFile(resolve(root, rel), 'utf8')
    const images = parsePinnedFromLines(text)
    assert.ok(images.length > 0, `${rel} has no digest-pinned FROM`)
    const stageNames = new Set(
      [...text.matchAll(/^FROM\s+\S+\s+AS\s+(\S+)/gim)].map((row) => row[1]),
    )
    const unpinnedFrom = [...text.matchAll(/^FROM\s+(\S+)/gm)]
      .map((row) => row[1])
      .filter((ref) => !stageNames.has(ref) && !/@sha256:[a-f0-9]{64}/.test(ref))
    assert.deepEqual(unpinnedFrom, [], `${rel} unpinned FROM: ${unpinnedFrom.join(', ')}`)
    if (rel !== 'deploy/docker/migrations.Dockerfile') {
      assert.ok(text.includes(expectedPrepare), `${rel} must prepare the hashed pnpm identity`)
    }
  }
  const cmsInApp = await readFile(resolve(root, 'apps/cms/Dockerfile'), 'utf8')
  assert.match(cmsInApp, /^FROM node:22\.17\.0-alpine@sha256:[a-f0-9]{64}$/m)
  assert.ok(cmsInApp.includes(NODE_IMAGE.split('@')[1]))
})
