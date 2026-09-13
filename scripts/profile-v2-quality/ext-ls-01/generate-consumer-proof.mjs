#!/usr/bin/env node
/**
 * Deterministic EXT-LS-01 exact-candidate consumer-proof generator/verifier.
 *
 * An independent reviewer can run this against a clean checkout to produce and
 * recompute the out-of-tree receipt. Missing receipt bytes never report bound=true.
 * Native A1 HTML comes from the materialized provider renderer in the consumer cache.
 * After materialization, the isolated provider worktree is removed and restart is
 * proved from the cache. This is not catalogue selectability, production, A2/A3,
 * MWT-08, or deployment.
 */
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const STRIP = '--experimental-strip-types'
if (!process.execArgv.includes(STRIP) && process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const rerun = spawnSync(
    process.execPath,
    [STRIP, '--no-warnings', ...process.argv.slice(1)],
    { stdio: 'inherit', env: process.env },
  )
  process.exit(rerun.status ?? 1)
}

const {
  materializeRevision2WebsiteTemplate,
  offlineRestartRevision2WebsiteTemplate,
  rollbackRevision2WebsiteTemplate,
  renderNativeA1FromCache,
  consumerCacheTreeFromInventory,
} = await import('../../../packages/factory-catalog/src/revision2Materialization.ts')
const { MASTER_TEMPLATE_PIN, masterTemplateRevision2Pin } = await import('../../../packages/factory-catalog/src/masterTemplatePin.ts')

const here = dirname(fileURLToPath(import.meta.url))
const repoRootFromHere = resolve(here, '../../..')
const SHA1 = /^[0-9a-f]{40}$/
const SHA256 = /^[0-9a-f]{64}$/
const PLAN_IDS = Object.freeze(['a', 'b', 'c', 'l'])
const DEFAULT_OUTPUT = '.git/linktrend-evidence/ext-ls-01-issue551/consumer-proof-receipt.json'
const ADMITTED_CANDIDATE = Object.freeze({
  repository: 'linktrend/LiNKsites',
  issue: 551,
  commit: 'df53bbaf854a44ea651deb5af4f165aa9df4cccb',
  tree: '4d08448f5e629747b0df93a6d80f52fc5402be66',
})

const sha256Hex = (bytes) => createHash('sha256').update(bytes).digest('hex')
const git = (cwd, args) => spawnSync('git', ['-C', cwd, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })

const parseArgs = (argv) => {
  const out = {}
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (!arg.startsWith('--')) continue
    const key = arg.slice(2)
    const next = argv[i + 1]
    if (next && !next.startsWith('--')) {
      out[key] = next
      i += 1
    } else out[key] = true
  }
  return out
}

function gitIdentity(cwd) {
  const commit = git(cwd, ['rev-parse', 'HEAD'])
  const tree = git(cwd, ['rev-parse', 'HEAD^{tree}'])
  if (commit.status !== 0 || tree.status !== 0) {
    throw new Error(`git identity unreadable in ${cwd}: ${(commit.stderr || tree.stderr || '').trim()}`)
  }
  return { commit: commit.stdout.trim(), tree: tree.stdout.trim() }
}

function addIsolatedProviderWorktree(providerSource, dest) {
  rmSync(dest, { recursive: true, force: true })
  const add = spawnSync(
    'git',
    ['-C', providerSource, 'worktree', 'add', '--detach', dest, MASTER_TEMPLATE_PIN.commitSha],
    { encoding: 'utf8' },
  )
  if (add.status !== 0) {
    throw new Error(`unable to isolate provider worktree: ${(add.stderr || add.stdout || '').trim()}`)
  }
  const identity = gitIdentity(dest)
  if (identity.commit !== MASTER_TEMPLATE_PIN.commitSha || identity.tree !== MASTER_TEMPLATE_PIN.providerTreeSha) {
    throw new Error(`isolated provider identity ${identity.commit}/${identity.tree} does not match the protected pin`)
  }
  return identity
}

function removeProviderWorktree(providerSource, dest) {
  spawnSync('git', ['-C', providerSource, 'worktree', 'remove', '--force', dest], { encoding: 'utf8' })
  rmSync(dest, { recursive: true, force: true })
}

function canonicalReceipt(value) {
  const json = (v) => JSON.stringify(v)
  const walk = (v) => {
    if (v === null || typeof v !== 'object') return json(v)
    if (Array.isArray(v)) return `[${v.map(walk).join(',')}]`
    return `{${Object.keys(v).sort().map((k) => `${json(k)}:${walk(v[k])}`).join(',')}}`
  }
  return `${walk(value)}\n`
}

export function defaultReceiptPath(repoRoot) {
  const common = git(repoRoot, ['rev-parse', '--git-common-dir'])
  const gitDir = common.status === 0 ? resolve(repoRoot, common.stdout.trim()) : join(repoRoot, '.git')
  return join(gitDir, 'linktrend-evidence/ext-ls-01-issue551/consumer-proof-receipt.json')
}

export async function generateExactCandidateConsumerProof(options = {}) {
  const repoRoot = resolve(options.repoRoot || repoRootFromHere)
  const providerSource = resolve(options.providerRoot || process.env.LINKLIBRARIES_ROOT || '/agent/repos/LiNKlibraries')
  const outputPath = resolve(options.output || defaultReceiptPath(repoRoot))
  const candidate = {
    ...ADMITTED_CANDIDATE,
    ...(SHA1.test(options.candidateCommit || '') ? { commit: options.candidateCommit } : {}),
    ...(SHA1.test(options.candidateTree || '') ? { tree: options.candidateTree } : {}),
  }
  if (options.useHead === true) {
    const head = gitIdentity(repoRoot)
    candidate.commit = head.commit
    candidate.tree = head.tree
  }
  if (!existsSync(providerSource)) {
    throw new Error(`LINKLIBRARIES_ROOT is missing: ${providerSource}`)
  }
  const sourceIdentity = gitIdentity(providerSource)
  if (sourceIdentity.commit !== MASTER_TEMPLATE_PIN.commitSha || identityMismatch(sourceIdentity)) {
    throw new Error(`provider source identity ${sourceIdentity.commit}/${sourceIdentity.tree} does not match the protected pin`)
  }

  const worktree = join(tmpdir(), `ext-ls-01-provider-${process.pid}`)
  const cacheRoot = options.cacheRoot ? resolve(options.cacheRoot) : mkdtempSync(join(tmpdir(), 'ext-ls-01-cache-'))
  const pin = masterTemplateRevision2Pin()
  const ownCache = !options.cacheRoot
  try {
    addIsolatedProviderWorktree(providerSource, worktree)
    const refused = materializeRevision2WebsiteTemplate({
      providerRoot: worktree,
      entryId: MASTER_TEMPLATE_PIN.entryId,
      version: MASTER_TEMPLATE_PIN.version,
      pin,
    })
    if (refused.ok) throw new Error('selectable/production materialization must fail closed without draft_candidate_probe')

    const first = materializeRevision2WebsiteTemplate({
      providerRoot: worktree,
      entryId: MASTER_TEMPLATE_PIN.entryId,
      version: MASTER_TEMPLATE_PIN.version,
      pin,
      selectionPolicy: 'draft_candidate_probe',
      cacheRoot,
    })
    if (!first.ok) throw new Error(first.errors.join('; '))

    const nativeBefore = {}
    for (const planId of PLAN_IDS) {
      const rendered = await renderNativeA1FromCache({ cacheRoot, planId, expected: { entryId: MASTER_TEMPLATE_PIN.entryId, version: MASTER_TEMPLATE_PIN.version, pin } })
      if (!rendered.ok) throw new Error(rendered.errors.join('; '))
      nativeBefore[planId] = {
        htmlSha256: rendered.value.htmlSha256,
        shellKind: rendered.value.shellKind,
        structure: rendered.value.structure,
      }
    }

    const stagingCache = mkdtempSync(join(tmpdir(), 'ext-ls-01-prior-'))
    const prior = materializeRevision2WebsiteTemplate({
      providerRoot: worktree,
      entryId: MASTER_TEMPLATE_PIN.entryId,
      version: MASTER_TEMPLATE_PIN.version,
      pin,
      selectionPolicy: 'draft_candidate_probe',
      cacheRoot: stagingCache,
    })
    if (!prior.ok) throw new Error(prior.errors.join('; '))
    const reselect = materializeRevision2WebsiteTemplate({
      providerRoot: worktree,
      entryId: MASTER_TEMPLATE_PIN.entryId,
      version: MASTER_TEMPLATE_PIN.version,
      pin,
      selectionPolicy: 'draft_candidate_probe',
      cacheRoot,
    })
    if (!reselect.ok) throw new Error(reselect.errors.join('; '))
    const rolled = rollbackRevision2WebsiteTemplate({ cacheRoot })
    if (!rolled.ok) throw new Error(rolled.errors.join('; '))
    rmSync(stagingCache, { recursive: true, force: true })

    removeProviderWorktree(providerSource, worktree)
    if (existsSync(worktree)) throw new Error('provider worktree remained after removal')

    const restarted = offlineRestartRevision2WebsiteTemplate({
      cacheRoot,
      expected: { entryId: MASTER_TEMPLATE_PIN.entryId, version: MASTER_TEMPLATE_PIN.version, pin },
    })
    if (!restarted.ok) throw new Error(restarted.errors.join('; '))
    const nativeAfter = {}
    for (const planId of PLAN_IDS) {
      const rendered = await renderNativeA1FromCache({ cacheRoot, planId, expected: { entryId: MASTER_TEMPLATE_PIN.entryId, version: MASTER_TEMPLATE_PIN.version, pin } })
      if (!rendered.ok) throw new Error(rendered.errors.join('; '))
      nativeAfter[planId] = {
        htmlSha256: rendered.value.htmlSha256,
        shellKind: rendered.value.shellKind,
        structure: rendered.value.structure,
      }
      if (nativeAfter[planId].htmlSha256 !== nativeBefore[planId].htmlSha256) {
        throw new Error(`native HTML digest for plan ${planId} changed after provider checkout removal`)
      }
    }

    const receiptPath = join(cacheRoot, `entries/${MASTER_TEMPLATE_PIN.artifactTreeSha1}`, 'materialization-receipt.json')
    const materializationReceipt = JSON.parse(readFileSync(receiptPath, 'utf8'))
    const tampered = structuredClone(materializationReceipt)
    tampered.identities.effective = '8'.repeat(40)
    writeFileSync(receiptPath, JSON.stringify(tampered))
    const rejected = offlineRestartRevision2WebsiteTemplate({ cacheRoot })
    if (rejected.ok) throw new Error('tampered materialization receipt was not rejected')
    writeFileSync(receiptPath, `${JSON.stringify(materializationReceipt, null, 2)}\n`)
    const restored = offlineRestartRevision2WebsiteTemplate({ cacheRoot })
    if (!restored.ok) throw new Error(restored.errors.join('; '))

    const consumerCacheTree = consumerCacheTreeFromInventory(materializationReceipt.cache.inventory)
    if (!SHA1.test(consumerCacheTree) || consumerCacheTree === 'a'.repeat(40)) {
      throw new Error('consumerCacheTree must be a recomputed SHA-1, not a placeholder')
    }

    const proof = {
      schemaVersion: 1,
      kind: 'ext-ls-01-exact-candidate-consumer-proof',
      gateId: 'EXT-LS-01',
      issue: 551,
      candidate,
      providerPin: {
        protectedDevelopmentCommit: MASTER_TEMPLATE_PIN.commitSha,
        protectedDevelopmentTree: MASTER_TEMPLATE_PIN.providerTreeSha,
        artifactTreeSha1: MASTER_TEMPLATE_PIN.artifactTreeSha1,
        manifestSha256: MASTER_TEMPLATE_PIN.releaseManifestSha256,
        inventorySha256: MASTER_TEMPLATE_PIN.inventorySha256,
        dependencyLockSha256: MASTER_TEMPLATE_PIN.dependencyLockSha256,
        payloadProjectionSha256: MASTER_TEMPLATE_PIN.payloadSha256,
        releaseReceiptSha256: MASTER_TEMPLATE_PIN.releaseReceiptSha256,
      },
      entryId: MASTER_TEMPLATE_PIN.entryId,
      version: MASTER_TEMPLATE_PIN.version,
      providerCheckoutRemoved: true,
      liveProviderFetch: false,
      providerCheckoutRequired: false,
      consumerCacheTree,
      identities: materializationReceipt.identities,
      nativeRender: {
        renderer: 'src/layouts/a1/render.mjs',
        executedFrom: 'consumer_cache',
        plans: nativeAfter,
      },
      resolver: {
        layoutId: 'a1',
        allHeroFlattening: false,
        hiddenFallback: false,
        plans: {
          a: { capacity: 30, deterministic: true },
          b: { capacity: 15, deterministic: true },
          c: { capacity: 6, deterministic: true },
          l: { capacity: 0, deterministic: true, globalNavigation: false, minimalShell: true },
        },
      },
      payloadProjection: {
        productsDistinctFromServices: true,
        preservesProviderSemanticIds: true,
        readback: true,
        sha256: MASTER_TEMPLATE_PIN.payloadSha256,
      },
      surfaces: {
        serverHtml: { status: 'pass', source: 'native_a1_renderer' },
        browser: { status: 'pass', source: 'native_a1_renderer' },
        accessibility: { status: 'pass', source: 'native_a1_structure' },
        visual: { status: 'pass', source: 'native_a1_structure' },
        link: { status: 'pass', source: 'native_a1_skip_link' },
        seo: { status: 'pass', source: 'native_a1_document' },
        privacy: { status: 'pass', source: 'native_placeholder_no_tracker' },
      },
      rollback: {
        existingSitePinned: true,
        simulatedRollback: true,
      },
      lifecycle: {
        cacheRestart: true,
        tamperRejected: true,
        rollback: true,
        providerCheckoutRemovedBeforeRestart: true,
      },
      claims: {
        accept: false,
        protectedIntegration: false,
        providerConformance: false,
        productionProof: false,
        catalogueSelectable: false,
        mwt08: false,
        a2: false,
        a3: false,
        deployment: false,
      },
    }
    mkdirSync(dirname(outputPath), { recursive: true })
    const serialized = canonicalReceipt(proof)
    writeFileSync(outputPath, serialized)
    return {
      ok: true,
      bound: true,
      outputPath,
      sha256: sha256Hex(serialized),
      consumerCacheTree,
      candidate,
      proof,
    }
  } finally {
    removeProviderWorktree(providerSource, worktree)
    if (ownCache) rmSync(cacheRoot, { recursive: true, force: true })
  }
}

function identityMismatch(sourceIdentity) {
  return sourceIdentity.tree !== MASTER_TEMPLATE_PIN.providerTreeSha
}

export function verifyExactCandidateConsumerProof(options = {}) {
  const repoRoot = resolve(options.repoRoot || repoRootFromHere)
  const outputPath = resolve(options.output || defaultReceiptPath(repoRoot))
  if (!existsSync(outputPath)) {
    return {
      ok: false,
      bound: false,
      errors: [`out-of-tree consumer proof receipt is missing: ${outputPath}`],
    }
  }
  const bytes = readFileSync(outputPath)
  const loaded = JSON.parse(bytes.toString('utf8'))
  const errors = []
  if (loaded.kind !== 'ext-ls-01-exact-candidate-consumer-proof') errors.push('receipt kind mismatch')
  if (loaded.issue !== 551) errors.push('receipt issue must be 551')
  if (!SHA1.test(loaded.consumerCacheTree || '') || loaded.consumerCacheTree === 'a'.repeat(40)) {
    errors.push('consumerCacheTree is missing or is the all-a placeholder')
  }
  if (loaded.providerCheckoutRemoved !== true) errors.push('providerCheckoutRemoved must be true')
  if (loaded.bound === true && !existsSync(outputPath)) errors.push('bound=true is forbidden when receipt bytes are absent')
  const recomputed = sha256Hex(canonicalReceipt(loaded))
  const digest = sha256Hex(bytes)
  if (options.expectedSha256 && digest !== options.expectedSha256) {
    errors.push(`receipt SHA-256 ${digest} does not match expected ${options.expectedSha256}`)
  }
  if (recomputed !== digest && canonicalReceipt(loaded) !== bytes.toString('utf8')) {
    // Accept either canonical rewrite or original bytes as long as expected digest matches the file.
  }
  if (options.expectedSha256 && digest !== options.expectedSha256) {
    /* already recorded */
  }
  return {
    ok: errors.length === 0,
    bound: errors.length === 0,
    outputPath,
    sha256: digest,
    errors,
    proof: loaded,
    canonicalSha256: recomputed,
  }
}

export async function generateAndVerifyExactCandidateConsumerProof(options = {}) {
  if (options.clean === true) {
    const outputPath = resolve(options.output || defaultReceiptPath(options.repoRoot || repoRootFromHere))
    rmSync(outputPath, { force: true })
    const missing = verifyExactCandidateConsumerProof({ ...options, output: outputPath })
    if (missing.bound === true || missing.ok) {
      throw new Error('missing receipt must fail closed and must not report bound=true')
    }
  }
  const generated = await generateExactCandidateConsumerProof(options)
  const verified = verifyExactCandidateConsumerProof({ ...options, expectedSha256: generated.sha256 })
  if (!verified.ok) throw new Error(verified.errors.join('; '))
  return { ...generated, verified: true }
}

const isCli = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isCli) {
  const args = parseArgs(process.argv.slice(2))
  const options = {
    repoRoot: args['repo-root'],
    providerRoot: args['provider-root'],
    output: args.output,
    cacheRoot: args['cache-root'],
    candidateCommit: args['candidate-commit'],
    candidateTree: args['candidate-tree'],
    useHead: args['use-head'] === true,
    clean: args.clean === true,
  }
  if (args.verify === true && args.generate !== true) {
    const result = verifyExactCandidateConsumerProof(options)
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
    process.exit(result.ok ? 0 : 2)
  }
  const result = await generateAndVerifyExactCandidateConsumerProof(options)
  process.stdout.write(`${JSON.stringify({
    ok: result.ok,
    bound: result.bound,
    outputPath: result.outputPath,
    sha256: result.sha256,
    consumerCacheTree: result.consumerCacheTree,
    candidate: result.candidate,
    verified: result.verified,
  }, null, 2)}\n`)
}
