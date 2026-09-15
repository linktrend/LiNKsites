#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { PLANNING_SENTINEL, verifyManifest } from '../oss-continuity/contract.mjs'

const manifestFlag = process.argv.indexOf('--manifest')
const outputFlag = process.argv.indexOf('--output')
const requireArchiveProof = process.argv.includes('--require-archive-proof')
const allowPlanning = process.argv.includes('--allow-planning')
const manifestPath = manifestFlag >= 0 ? resolve(process.cwd(), process.argv[manifestFlag + 1] ?? '') : null
if (!manifestPath) {
  throw new Error(`usage: node deploy/scripts/verify-oss-continuity-manifest.mjs --manifest <path> [--require-archive-proof|--allow-planning]`)
}
if (requireArchiveProof && allowPlanning) {
  throw new Error('cannot_combine_require_archive_proof_with_allow_planning')
}

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
const verdict = verifyManifest(manifest, {
  requireArchiveProof,
  allowPlanning: allowPlanning || !requireArchiveProof,
})
if (requireArchiveProof && manifest.continuityClaimed !== true) {
  verdict.ok = false
  verdict.errors = [...verdict.errors, { code: 'publication_continuity_claim_missing', component: null, extra: 'require-archive-proof refuses a non-claim' }]
}
if (allowPlanning && manifest.continuityClaimed === true) {
  verdict.ok = false
  verdict.errors = [...verdict.errors, { code: 'planning_cannot_claim_continuity', component: null, extra: PLANNING_SENTINEL }]
}
if (allowPlanning && manifest.evidenceClass !== 'planning') {
  verdict.ok = false
  verdict.errors = [...verdict.errors, { code: 'planning_evidence_class_required', component: null }]
}

const report = {
  status: verdict.ok ? 'oss_continuity_verified' : 'oss_continuity_failed',
  evidenceClass: manifest.evidenceClass,
  continuityClaimed: manifest.continuityClaimed,
  continuityComplete: manifest.continuityComplete === true,
  archiveAndReleaseComplete: manifest.archiveAndReleaseComplete === true,
  ok: verdict.ok,
  errors: verdict.errors,
}
if (outputFlag >= 0) {
  await writeFile(resolve(process.cwd(), process.argv[outputFlag + 1]), `${JSON.stringify(report, null, 2)}\n`)
}
console.log(JSON.stringify(report, null, 2))
if (!verdict.ok) process.exit(1)
