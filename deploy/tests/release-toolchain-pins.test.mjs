import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import test from 'node:test'

const root = resolve(new URL('../..', import.meta.url).pathname)
const WORKFLOW_DIR = '.github/workflows'
const PNPM_ACTION = /uses:\s+(\S*pnpm\/action-setup\S+)/

function pnpmSetupVersionInputs(text) {
  const lines = text.split(/\r?\n/)
  const versions = []
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(PNPM_ACTION)
    if (!match) continue
    const indent = lines[index].match(/^\s*/)[0].length
    for (let next = index + 1; next < lines.length; next += 1) {
      const line = lines[next]
      if (!line.trim()) continue
      const nextIndent = line.match(/^\s*/)[0].length
      if (nextIndent <= indent) break
      const version = line.match(/^\s+version:\s*['"]?([^\s#'"]+)/)
      if (version) versions.push(`${match[1]} version=${version[1]}`)
    }
  }
  return versions
}

test('package.json packageManager is the only pnpm version source in release workflows', async () => {
  const pkg = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'))
  assert.match(
    String(pkg.packageManager || ''),
    /^pnpm@\d+\.\d+\.\d+/,
    'package.json packageManager must be the authoritative pnpm identity',
  )

  const names = await readdir(resolve(root, WORKFLOW_DIR))
  const duplicates = []
  for (const name of names.filter((file) => file.endsWith('.yml') || file.endsWith('.yaml'))) {
    const rel = `${WORKFLOW_DIR}/${name}`
    const text = await readFile(resolve(root, rel), 'utf8')
    if (!PNPM_ACTION.test(text)) continue
    PNPM_ACTION.lastIndex = 0
    const versions = pnpmSetupVersionInputs(text)
    if (versions.length) duplicates.push(`${rel}: ${versions.join(', ')}`)
  }

  assert.deepEqual(
    duplicates,
    [],
    `pnpm/action-setup must not declare a second version; package.json packageManager is authoritative. ${duplicates.join('; ')}`,
  )
})
