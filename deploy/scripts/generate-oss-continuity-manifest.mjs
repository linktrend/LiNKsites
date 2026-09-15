#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { generateManifest, parseReceiptsInput, PLANNING_SENTINEL } from '../oss-continuity/contract.mjs'

const rootFlag = process.argv.indexOf('--root')
const outputFlag = process.argv.indexOf('--output')
const receiptsFlag = process.argv.indexOf('--receipts')
const claim = process.argv.includes('--claim-continuity')
const root = rootFlag >= 0 ? resolve(process.argv[rootFlag + 1]) : resolve(new URL('../..', import.meta.url).pathname)
const output = outputFlag >= 0 ? resolve(process.cwd(), process.argv[outputFlag + 1] ?? '') : null
if (!output) {
  throw new Error(`usage: node deploy/scripts/generate-oss-continuity-manifest.mjs --output <path> [--receipts <file-or-${PLANNING_SENTINEL}>] [--claim-continuity]`)
}

let receiptsInput = PLANNING_SENTINEL
if (receiptsFlag >= 0) {
  const value = process.argv[receiptsFlag + 1]
  if (!value) throw new Error('missing --receipts value')
  if (value === PLANNING_SENTINEL) receiptsInput = PLANNING_SENTINEL
  else receiptsInput = await readFile(resolve(process.cwd(), value), 'utf8')
}

const parsed = parseReceiptsInput(receiptsInput)
if (claim && parsed.mode === 'planning') {
  throw new Error('cannot_claim_oss_continuity_without_archive_receipts')
}
const manifest = generateManifest(root, {
  env: process.env,
  receipts: parsed.receipts,
  claimContinuity: claim,
})
await mkdir(dirname(output), { recursive: true })
await writeFile(output, `${JSON.stringify(manifest, null, 2)}\n`)
console.log(JSON.stringify({
  status: 'oss_continuity_manifest_generated',
  output,
  evidenceClass: manifest.evidenceClass,
  continuityClaimed: manifest.continuityClaimed,
  continuityComplete: manifest.continuityComplete,
  releaseSha: manifest.repository.releaseSha,
  releaseTree: manifest.repository.releaseTree,
}))
