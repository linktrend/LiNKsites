#!/usr/bin/env node
/** Compute immutable cache keys before any build can mutate the workspace. */
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync, appendFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const option = (name) => {
  const index = process.argv.indexOf(name)
  if (index < 0 || !process.argv[index + 1]) throw new Error(`missing ${name}`)
  return process.argv[index + 1]
}
const runner = option('--runner')
const output = resolve(option('--output'))
const tree = execFileSync('git', ['rev-parse', 'HEAD^{tree}'], { encoding: 'utf8' }).trim()
const digest = (paths) => createHash('sha256').update(execFileSync('git', ['ls-tree', '-r', 'HEAD', '--', ...paths], { encoding: 'utf8' })).digest('hex').slice(0, 32)
const manifest = {
  schemaVersion: 1,
  sourceSha: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  treeSha: tree,
  computedBeforeWorkspaceMutation: true,
  trackedPathSets: {
    playwright: ['pnpm-lock.yaml', 'apps/cms/package.json'],
    turbo: ['pnpm-lock.yaml', 'turbo.json', 'package.json', 'apps', 'packages', 'scripts'],
    buildx: ['pnpm-lock.yaml', 'package.json', 'turbo.json', 'deploy/docker', 'apps', 'packages', 'scripts'],
  },
}
manifest.keys = Object.fromEntries(Object.entries(manifest.trackedPathSets).map(([name, paths]) => [name, `${name}-${runner}-${digest(paths)}`]))
mkdirSync(dirname(output), { recursive: true })
writeFileSync(output, `${JSON.stringify(manifest, null, 2)}\n`)
if (process.env.GITHUB_OUTPUT) {
  for (const [name, key] of Object.entries(manifest.keys)) appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${key}\n`)
}
process.stdout.write(`${JSON.stringify(manifest)}\n`)
