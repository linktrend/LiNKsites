#!/usr/bin/env node
/**
 * Fail-closed LS-02 H-09/H-10 identity rebind validator.
 *
 * This script validates references and package integrity only. It never checks
 * out another repository, copies provider bytes, or emits a conformance or
 * review acceptance verdict.
 */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  CANDIDATE_PARENT,
  FORBIDDEN_CLAIM_PATTERN,
  GIT_SHA,
  ISSUE,
  OWNED_PATHS,
  PACKET,
  REPOSITORY,
  isOwnedPath,
} from './constants.mjs'

const here = resolve(fileURLToPath(new URL('.', import.meta.url)))
const repoRoot = resolve(here, '../../..')
const defaultInput = resolve(repoRoot, 'docs/evidence/ls02/handoff-successor/handoff-successor.json')
const defaultManifest = resolve(repoRoot, 'docs/evidence/ls02/handoff-successor/manifest.json')
const defaultChecksums = resolve(repoRoot, 'docs/evidence/ls02/handoff-successor/SHA256SUMS.json')
const HANDOFF_KIND = 'ls02-handoff-successor'
const MANIFEST_KIND = 'ls02-handoff-successor-manifest'
const CHECKSUM_KIND = 'ls02-handoff-successor-checksums'

const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'))
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex')
const fileSha256 = (file) => sha256(readFileSync(file))
const errorResult = (verdict, failures) => ({ ok: false, verdict, failures })

export function validateHandoff(input, expected = CANDIDATE_PARENT) {
  const failures = []
  if (!object(input)) return errorResult('INVALID_INPUT', ['handoff must be a JSON object'])

  if (input.repository !== REPOSITORY || input.issue !== ISSUE || input.packet !== PACKET) {
    return errorResult('FOREIGN_INPUT', ['repository, issue, and packet must identify this LS-02 LiNKsites package'])
  }
  if (input.kind !== HANDOFF_KIND || input.schemaVersion !== 1) {
    failures.push(`kind/schemaVersion must be ${HANDOFF_KIND}/1`)
  }
  if (!object(input.candidateParent)) {
    return errorResult('STALE_CANDIDATE', ['candidateParent is missing'])
  }
  for (const key of ['commit', 'tree']) {
    if (!GIT_SHA.test(input.candidateParent[key] || '')) failures.push(`candidateParent.${key} must be a lowercase 40-character SHA`)
    if (input.candidateParent[key] !== expected[key]) failures.push(`candidateParent.${key} does not match the exact candidate parent`)
  }
  if (failures.some((failure) => failure.includes('candidateParent.'))) return errorResult('STALE_CANDIDATE', failures)

  if (input.identityOnly !== true) failures.push('identityOnly must be true')
  if (!object(input.h09) || input.h09.receiptAction !== 'rebind-required' || input.h09.conformanceAccepted !== false) {
    failures.push('H-09 must require receipt rebind and remain unaccepted')
  }
  if (!object(input.h10) || input.h10.reviewAction !== 'blocked-until-h09-rebind' || input.h10.reviewAccepted !== false) {
    failures.push('H-10 must remain blocked until H-09 rebind and unaccepted')
  }
  if (!object(input.provider) || input.provider.repository !== 'linktrend/LiNKlibraries' || input.provider.pinOnly !== true) {
    failures.push('provider must be the LiNKlibraries pin-only reference')
  }
  if (input.provider?.bytesCopied !== false) failures.push('provider bytes must be explicitly absent')

  const strings = collectStrings(input)
  if (strings.some((value) => FORBIDDEN_CLAIM_PATTERN.test(value))) {
    return errorResult('FORBIDDEN_CLAIM', ['handoff contains an acceptance, conformance, production, hosted, or provider-byte claim'])
  }
  if (!object(input.scope) || !Array.isArray(input.scope.ownedPaths) || !input.scope.ownedPaths.every((path) => OWNED_PATHS.includes(path))) {
    failures.push('scope.ownedPaths must be exactly the two governed package roots')
  }
  if (!Array.isArray(input.scope?.prohibitedPaths) || input.scope.prohibitedPaths.length === 0) {
    failures.push('scope.prohibitedPaths must name prohibited product/provider surfaces')
  }
  return failures.length === 0 ? { ok: true, verdict: 'IDENTITY_REBIND_READY', failures: [] } : errorResult('INVALID_CONTRACT', failures)
}

function collectStrings(value, result = []) {
  if (typeof value === 'string') result.push(value)
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, result))
  else if (object(value)) Object.values(value).forEach((item) => collectStrings(item, result))
  return result
}

export function validateOwnedPaths(paths) {
  const failures = []
  for (const file of paths || []) {
    if (typeof file !== 'string' || file.startsWith('/') || file.split('/').includes('..') || !isOwnedPath(file)) {
      failures.push(`OWNED_PATH_ESCAPE: ${file}`)
    }
  }
  return { ok: failures.length === 0, failures }
}

export function validateManifest(manifest, checksums, root = repoRoot) {
  const failures = []
  if (!object(manifest) || manifest.kind !== MANIFEST_KIND || manifest.schemaVersion !== 1) failures.push('manifest kind/schemaVersion is invalid')
  const candidate = manifest?.candidateParent
  if (candidate?.commit !== CANDIDATE_PARENT.commit || candidate?.tree !== CANDIDATE_PARENT.tree) failures.push('manifest candidate parent is stale')
  if (manifest?.repository !== REPOSITORY || manifest?.issue !== ISSUE || manifest?.packet !== PACKET) failures.push('manifest identity is foreign')
  const artifacts = Array.isArray(manifest?.artifacts) ? manifest.artifacts : []
  const pathResult = validateOwnedPaths(artifacts)
  failures.push(...pathResult.failures)
  if (!object(checksums) || checksums.kind !== CHECKSUM_KIND || checksums.algorithm !== 'sha256') failures.push('checksums kind/algorithm is invalid')
  const entries = Array.isArray(checksums?.files) ? checksums.files : []
  if (entries.length !== artifacts.length || entries.map((entry) => entry.path).join('\n') !== artifacts.join('\n')) failures.push('checksums file list does not match manifest')
  for (const entry of entries) {
    const file = resolve(root, entry.path || '')
    if (!file.startsWith(resolve(root) + '/') || !existsSync(file)) {
      failures.push(`checksum artifact is missing or escapes repository: ${entry.path}`)
      continue
    }
    if (!/^[0-9a-f]{64}$/.test(entry.sha256 || '') || fileSha256(file) !== entry.sha256) failures.push(`CHECKSUM_MISMATCH: ${entry.path}`)
  }
  return failures.length === 0 ? { ok: true, failures: [] } : { ok: false, failures }
}

export function writeChecksums(manifestFile = defaultManifest, checksumsFile = defaultChecksums, root = repoRoot) {
  const manifest = readJson(manifestFile)
  const result = validateHandoff(readJson(defaultInput))
  if (!result.ok) throw new Error(`${result.verdict}: ${result.failures.join('; ')}`)
  const files = manifest.artifacts.map((file) => ({ path: file, sha256: fileSha256(resolve(root, file)) }))
  const output = {
    schemaVersion: 1,
    kind: CHECKSUM_KIND,
    algorithm: 'sha256',
    repository: REPOSITORY,
    issue: ISSUE,
    packet: PACKET,
    candidateParent: CANDIDATE_PARENT,
    files,
  }
  writeFileSync(checksumsFile, `${JSON.stringify(output, null, 2)}\n`)
  return output
}

function parseArgs(argv) {
  const options = { input: defaultInput, manifest: defaultManifest, checksums: defaultChecksums, writeChecksums: false, paths: [] }
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--write-checksums') options.writeChecksums = true
    else if (arg === '--input') options.input = resolve(argv[++index])
    else if (arg === '--manifest') options.manifest = resolve(argv[++index])
    else if (arg === '--checksums') options.checksums = resolve(argv[++index])
    else if (arg === '--path') options.paths.push(argv[++index])
    else if (arg === '--help') options.help = true
    else throw new Error(`unknown argument: ${arg}`)
  }
  return options
}

function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv)
  if (options.help) {
    console.log('Usage: rebind-validator.mjs [--input file] [--manifest file] [--checksums file] [--write-checksums] [--path path]')
    return
  }
  const handoff = readJson(options.input)
  const handoffResult = validateHandoff(handoff)
  if (!handoffResult.ok) throw new Error(`${handoffResult.verdict}: ${handoffResult.failures.join('; ')}`)
  if (options.paths.length > 0) {
    const pathResult = validateOwnedPaths(options.paths)
    if (!pathResult.ok) throw new Error(pathResult.failures.join('; '))
  }
  if (options.writeChecksums) {
    writeChecksums(options.manifest, options.checksums)
    console.log(`CHECKSUMS_WRITTEN ${options.checksums}`)
    return
  }
  const integrity = validateManifest(readJson(options.manifest), readJson(options.checksums))
  if (!integrity.ok) throw new Error(`CHECKSUM_MISMATCH: ${integrity.failures.join('; ')}`)
  console.log(`REBIND_OK verdict=${handoffResult.verdict} candidate=${CANDIDATE_PARENT.commit}/${CANDIDATE_PARENT.tree}`)
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  try { main() } catch (error) { console.error(`FAIL ${error instanceof Error ? error.message : String(error)}`); process.exitCode = 1 }
}
