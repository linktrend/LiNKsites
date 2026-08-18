#!/usr/bin/env node
/** Fail closed when a declared Full-suite coverage component did not execute. */
import { readFileSync } from 'node:fs'

const args = process.argv.slice(2)
const value = (flag) => {
  const index = args.indexOf(flag)
  if (index < 0 || !args[index + 1]) throw new Error(`missing ${flag}`)
  return args[index + 1]
}

try {
  const manifest = JSON.parse(readFileSync(value('--manifest'), 'utf8'))
  const recoveryRequired = value('--recovery-required') === '1'
  const records = readFileSync(value('--timings'), 'utf8').trim().split('\n').filter(Boolean).map((line) => JSON.parse(line))
  const required = [...manifest.alwaysRequired, ...(recoveryRequired ? [manifest.recoveryRequired] : [])]
  const byName = new Map(records.map((record) => [record.component, record]))
  const missing = required.filter((name) => !byName.has(name))
  const failed = required.filter((name) => byName.get(name)?.result !== 'passed')
  if (missing.length || failed.length) {
    throw new Error(`required Full coverage is incomplete; missing=${missing.join(',') || 'none'} failed=${failed.join(',') || 'none'}`)
  }
  process.stdout.write(`${JSON.stringify({ schemaVersion: 1, status: 'passed', required, executed: required, recoveryRequired })}\n`)
} catch (error) {
  process.stderr.write(`FAIL: ${error.message}\n`)
  process.exit(1)
}
