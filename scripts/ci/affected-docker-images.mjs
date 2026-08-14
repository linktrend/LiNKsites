#!/usr/bin/env node
/**
 * Fail-closed Docker image selection. Unknown, shared, deployment, lockfile,
 * or empty-diff inputs select every production image.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const images = ['cms', 'web-master', 'autowork-worker', 'program-orchestrator', 'migrations']
const args = process.argv.slice(2)
const option = (name) => args.includes(name) ? args[args.indexOf(name) + 1] : undefined
const base = option('--base')
const head = option('--head') ?? 'HEAD'
const output = option('--output')
const pathsFile = option('--paths-file')
if (!base || !output) throw new Error('--base and --output are required')

const all = (reason, changedPaths = []) => ({ schemaVersion: 1, mode: 'all', reason, changedPaths, images })
let changedPaths
try {
  changedPaths = pathsFile
    ? readFileSync(pathsFile, 'utf8').split('\n').filter(Boolean)
    : execFileSync('git', ['diff', '--name-only', `${base}...${head}`], { encoding: 'utf8' }).split('\n').filter(Boolean)
} catch { changedPaths = [] }

const shared = (path) => (
  path === 'pnpm-lock.yaml' || path === 'package.json' || path === 'turbo.json' ||
  path.startsWith('deploy/') || path.startsWith('packages/') || path.startsWith('scripts/') ||
  path.startsWith('.github/') || path.startsWith('supabase/') || path.startsWith('config/')
)
let result
if (!changedPaths.length) result = all('empty-or-unreadable-diff', changedPaths)
else if (changedPaths.some(shared)) result = all('shared-deployment-or-lockfile-change', changedPaths)
else {
  const selected = new Set()
  for (const path of changedPaths) {
    if (path.startsWith('apps/cms/')) selected.add('cms')
    else if (path.startsWith('apps/web-master/')) selected.add('web-master')
    else if (path.startsWith('apps/autowork-worker/')) selected.add('autowork-worker')
    else if (path.startsWith('apps/program-orchestrator/')) selected.add('program-orchestrator')
    else result = all(`unmapped-change:${path}`, changedPaths)
  }
  if (!result) result = selected.size ? { schemaVersion: 1, mode: 'affected', reason: 'isolated-service-change', changedPaths, images: images.filter((image) => selected.has(image)) } : all('no-mapped-production-surface', changedPaths)
}
mkdirSync(dirname(resolve(output)), { recursive: true })
writeFileSync(resolve(output), `${JSON.stringify(result, null, 2)}\n`)
process.stdout.write(`${JSON.stringify(result)}\n`)
