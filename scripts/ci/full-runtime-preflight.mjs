#!/usr/bin/env node
/**
 * Prepare and prove the exact hosted runtime consumed by the Full profile.
 * This runs before any application build or test so a missing service or
 * browser is a truthful infrastructure failure, not wasted application work.
 */
import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = resolve(new URL('../..', import.meta.url).pathname)
const args = new Map(process.argv.slice(2).reduce((items, value, index, values) => {
  if (value.startsWith('--')) items.push([value.slice(2), values[index + 1]])
  return items
}, []))
const output = resolve(root, args.get('output') ?? '.ci-artifacts/full-runtime-preflight.json')
const githubEnv = args.get('github-env')

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, { cwd: root, encoding: 'utf8', ...options })
  if (result.status !== 0) throw new Error(`${command} ${commandArgs.join(' ')} failed: ${(result.stderr || result.stdout).trim()}`)
  return result.stdout.trim()
}

const nodeVersion = process.versions.node
if (Number(nodeVersion.split('.')[0]) !== 22) throw new Error(`Node 22 is required; found ${nodeVersion}`)
const runtimes = {}
for (const command of ['pnpm', 'docker', 'supabase']) runtimes[command] = run(command, ['--version']).split('\n')[0]

// This declared bootstrap is intentionally performed once. The Full profile
// only consumes the bound executable and rejects a missing/mismatched binding.
run('pnpm', ['--filter', '@linksites/cms', 'exec', 'playwright', 'install', '--with-deps', 'chromium'])
const browserPath = run('pnpm', ['--filter', '@linksites/cms', 'exec', 'node', '-e', "process.stdout.write(require('playwright').chromium.executablePath())"])
run(browserPath, ['--version'])

const evidence = {
  schemaVersion: 1,
  result: 'passed',
  node: nodeVersion,
  runtimes,
  bindings: {
    W2_02_CHROMIUM_EXECUTABLE: browserPath,
    W2_04_CHROMIUM_EXECUTABLE: browserPath,
  },
}
mkdirSync(dirname(output), { recursive: true })
writeFileSync(output, `${JSON.stringify(evidence, null, 2)}\n`)
if (githubEnv) {
  appendFileSync(githubEnv, `W2_02_CHROMIUM_EXECUTABLE=${browserPath}\nW2_04_CHROMIUM_EXECUTABLE=${browserPath}\n`)
}
process.stdout.write(`${JSON.stringify(evidence)}\n`)
