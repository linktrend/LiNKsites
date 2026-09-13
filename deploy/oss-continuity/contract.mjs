/**
 * LiNKsites OSS continuity contract (Issue 542).
 *
 * Fail-closed identities for the external open-source material required to
 * rebuild and operate a five-image release. A lockfile, digest pin, cache or
 * live upstream URL is not an archive. This module does not download, vendor,
 * fork or publish artifacts.
 */
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export const SCHEMA_VERSION = 1
export const MANIFEST_KIND = 'linksites-oss-continuity-manifest'
export const RECEIPTS_KIND = 'oss-continuity-archive-receipts'
export const PLANNING_SENTINEL = 'PLANNING_NOT_A_CONTINUITY_CLAIM'
export const SHA256_DIGEST = /^sha256:[a-f0-9]{64}$/
export const GIT_SHA = /^[0-9a-f]{40}$/
export const LOCK_INTEGRITY = /^sha512-[A-Za-z0-9+/=]+$/

const MUTABLE_IDENTITY = /(?:^|[:/@])(latest|pnpm@latest|node:\d+$|@v\d+$)/i
const UPSTREAM_HOST = /(^|\.)(npmjs\.org|registry\.npmjs\.org|github\.com|ghcr\.io|docker\.io|hub\.docker\.com)$/i
const PLACEHOLDER = /placeholder|replace-me|todo|changeme|example\.com\/archive/i

export const REQUIRED_LOCK_PACKAGES = [
  { id: 'pkg-next', name: 'next', version: '16.3.3', licenceExpectedWhenArchived: 'recorded-at-archive', owner: 'LSSEC-01' },
  { id: 'pkg-react', name: 'react', version: '19.1.0', licenceExpectedWhenArchived: 'recorded-at-archive', owner: 'LSSEC-01' },
  { id: 'pkg-payload', name: 'payload', version: '3.87.1', licenceExpectedWhenArchived: 'recorded-at-archive', owner: 'LSSEC-01' },
  { id: 'pkg-pg', name: 'pg', version: '8.16.3', licenceExpectedWhenArchived: 'recorded-at-archive', owner: 'LSSEC-01' },
  { id: 'pkg-playwright', name: 'playwright', version: '1.56.1', licenceExpectedWhenArchived: 'recorded-at-archive', owner: 'LSSEC-01' },
  { id: 'pkg-typescript', name: 'typescript', version: '5.7.3', licenceExpectedWhenArchived: 'recorded-at-archive', owner: 'LSSEC-01' },
  { id: 'pkg-turbo', name: 'turbo', version: '2.10.5', licenceExpectedWhenArchived: 'recorded-at-archive', owner: 'LSSEC-01' },
  { id: 'pkg-sharp', name: 'sharp', version: '0.35.4', licenceExpectedWhenArchived: 'recorded-at-archive', owner: 'LSSEC-01' },
]

export const PRODUCED_IMAGES = [
  { id: 'image-cms', env: 'LINKSITES_CMS_IMAGE_DIGEST', name: 'linksites-cms', owner: 'LSART-01' },
  { id: 'image-web-master', env: 'LINKSITES_WEB_MASTER_IMAGE_DIGEST', name: 'linksites-web-master', owner: 'LSART-01' },
  { id: 'image-worker', env: 'LINKSITES_WORKER_IMAGE_DIGEST', name: 'linksites-autowork-worker', owner: 'LSART-01' },
  { id: 'image-orchestrator', env: 'LINKSITES_ORCHESTRATOR_IMAGE_DIGEST', name: 'linksites-program-orchestrator', owner: 'LSART-01' },
  { id: 'image-migrations', env: 'LINKSITES_MIGRATIONS_IMAGE_DIGEST', name: 'linksites-migrations', owner: 'LSART-01' },
]

export const ARCHIVE_PROOF_CLASSES = Object.freeze([
  'locked-package',
  'base-image',
  'build-action',
  'build-tool',
  'produced-image',
])

export function sha256Hex(bytes) {
  return createHash('sha256').update(bytes).digest('hex')
}

export function fail(code, detail = '') {
  const error = new Error(detail ? `${code}:${detail}` : code)
  error.code = code
  error.detail = detail
  return error
}

export function isMutableIdentity(value) {
  if (value == null || value === '') return true
  const text = String(value)
  if (SHA256_DIGEST.test(text) || GIT_SHA.test(text) || LOCK_INTEGRITY.test(text)) return false
  if (/@sha256:[a-f0-9]{64}$/.test(text)) return false
  if (/@[0-9a-f]{40}$/.test(text)) return false
  if (MUTABLE_IDENTITY.test(text)) return true
  if (/:(latest|main|master|stable)\b/i.test(text)) return true
  if (/@v\d+(\.\d+)?$/.test(text)) return true
  if (/^[a-z0-9./_-]+:[A-Za-z0-9._-]+$/i.test(text)) return true
  return false
}

function git(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()
}

function read(root, rel) {
  return readFileSync(resolve(root, rel))
}

export function lockPackageIntegrity(lockText, name, version) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = lockText.match(new RegExp(`^  ${escaped}@${version}:\\n    resolution: \\{integrity: ([^}]+)\\}`, 'm'))
  if (!match) throw fail('lock_identity_missing', `${name}@${version}`)
  return match[1]
}

export function parsePinnedFromLines(text) {
  const images = []
  const fromRe = /^FROM\s+(\S+?)@sha256:([a-f0-9]{64})/gm
  let match
  while ((match = fromRe.exec(text))) {
    images.push({ reference: match[1], digest: `sha256:${match[2]}` })
  }
  return images
}

export function parsePinnedActions(workflowText) {
  const actions = []
  const re = /^\s+uses:\s+(\S+?)@([0-9a-f]{40})\s*(?:#\s*(.*))?$/gm
  let match
  while ((match = re.exec(workflowText))) {
    actions.push({
      uses: match[1],
      commit: match[2],
      comment: (match[3] || '').trim(),
      identity: `${match[1]}@${match[2]}`,
    })
  }
  const floating = []
  const floatRe = /^\s+uses:\s+(\S+?)@([^\s]+)$/gm
  while ((match = floatRe.exec(workflowText))) {
    if (!/^[0-9a-f]{40}$/.test(match[2])) floating.push(`${match[1]}@${match[2]}`)
  }
  return { actions, floating }
}

function emptyArchive() {
  return {
    recorded: false,
    controller: null,
    access: null,
    uri: null,
    kind: null,
    checksum: null,
    readback: null,
  }
}

function planningFields(owner) {
  return {
    licence: { recorded: false, spdx: null, reason: 'licence-bundle-belongs-with-owned-archive' },
    originalSourceLocation: null,
    originalArtifactLocation: null,
    archive: emptyArchive(),
    compatibility: { compatible: true, withAdmittedSource: true, tested: false, note: 'source-identity-matches-inspected-lock-or-pin; archive-restore-unproven' },
    reviewedUpdate: { recorded: false, packet: owner, evidence: null },
    reproduction: {
      recorded: false,
      instructions: 'Rebuild from the LiNKtrend read-only archive plus this repository commit/tree using pnpm install --frozen-lockfile and the digest-pinned production Dockerfiles. Upstream availability is not evidence.',
    },
    rollbackTarget: { recorded: false, identity: null, tested: false },
  }
}

function component(base, extra) {
  return { ...base, ...extra }
}

export function collectSourceIdentities(root, env = process.env) {
  const releaseSha = env.LINKSITES_RELEASE_SHA || git(root, ['rev-parse', 'HEAD'])
  const releaseTree = env.LINKSITES_RELEASE_TREE || git(root, ['rev-parse', 'HEAD^{tree}'])
  if (!GIT_SHA.test(releaseSha) || !GIT_SHA.test(releaseTree)) throw fail('release_identity_mutable')
  const lockBytes = read(root, 'pnpm-lock.yaml')
  const lockText = lockBytes.toString('utf8')
  const packageJson = JSON.parse(read(root, 'package.json').toString('utf8'))
  const workflowRel = '.github/workflows/publish-server03-images.yml'
  const workflowText = read(root, workflowRel).toString('utf8')
  const dockerFiles = [
    'deploy/docker/cms.Dockerfile',
    'deploy/docker/web-master.Dockerfile',
    'deploy/docker/autowork-worker.Dockerfile',
    'deploy/docker/program-orchestrator.Dockerfile',
    'deploy/docker/migrations.Dockerfile',
  ]
  const dockerfileText = dockerFiles.map((file) => read(root, file).toString('utf8')).join('\n')
  const pinnedImages = parsePinnedFromLines(dockerfileText)
  const nodePin = pinnedImages.find((row) => row.reference.startsWith('node:'))
  const postgresPin = pinnedImages.find((row) => row.reference.startsWith('postgres:'))
  if (!nodePin || !postgresPin) throw fail('production_base_image_unpinned')
  const { actions, floating } = parsePinnedActions(workflowText)
  if (floating.length) throw fail('publish_workflow_floating_action', floating.join(','))
  const apkUnpinned = /apk add --no-cache (?!.*==)[^\n]+/.test(dockerfileText)

  const components = []
  components.push(component({
    id: 'lockfile-pnpm',
    class: 'locked-package',
    owner: 'LSSEC-01',
    name: 'pnpm-lock.yaml',
    version: '9.0',
    identity: { type: 'sha256', value: sha256Hex(lockBytes) },
    originalSourceLocation: 'https://github.com/linktrend/LiNKsites/blob/HEAD/pnpm-lock.yaml',
    originalArtifactLocation: 'pnpm-lock.yaml',
  }, planningFields('LSSEC-01')))

  for (const pkg of REQUIRED_LOCK_PACKAGES) {
    const integrity = lockPackageIntegrity(lockText, pkg.name, pkg.version)
    components.push(component({
      id: pkg.id,
      class: 'locked-package',
      owner: pkg.owner,
      name: pkg.name,
      version: pkg.version,
      identity: { type: 'pnpm-integrity', value: integrity },
      originalSourceLocation: `https://www.npmjs.com/package/${pkg.name}/v/${pkg.version}`,
      originalArtifactLocation: `https://registry.npmjs.org/${pkg.name}/-/${pkg.name}-${pkg.version}.tgz`,
    }, planningFields(pkg.owner)))
  }

  components.push(component({
    id: 'tool-pnpm',
    class: 'build-tool',
    owner: 'LSSEC-01',
    name: 'pnpm',
    version: String(packageJson.packageManager || ''),
    identity: { type: 'packageManager', value: packageJson.packageManager },
    originalSourceLocation: 'https://github.com/pnpm/pnpm',
    originalArtifactLocation: 'corepack prepare pnpm@10.0.0',
    pinDiagnosis: 'version-pinned-without-integrity-hash',
  }, planningFields('LSSEC-01')))

  components.push(component({
    id: 'img-base-node',
    class: 'base-image',
    owner: 'LSDEP-01',
    name: nodePin.reference,
    version: nodePin.reference,
    identity: { type: 'oci-digest', value: nodePin.digest },
    originalSourceLocation: `docker.io/${nodePin.reference}`,
    originalArtifactLocation: `${nodePin.reference}@${nodePin.digest}`,
  }, planningFields('LSDEP-01')))

  components.push(component({
    id: 'img-base-postgres',
    class: 'base-image',
    owner: 'LSDEP-01',
    name: postgresPin.reference,
    version: postgresPin.reference,
    identity: { type: 'oci-digest', value: postgresPin.digest },
    originalSourceLocation: `docker.io/${postgresPin.reference}`,
    originalArtifactLocation: `${postgresPin.reference}@${postgresPin.digest}`,
  }, planningFields('LSDEP-01')))

  components.push(component({
    id: 'apk-build-packages',
    class: 'build-tool',
    owner: 'LSDEP-01',
    name: 'alpine-apk',
    version: apkUnpinned ? 'unpinned' : 'pinned',
    identity: { type: apkUnpinned ? 'unpinned-apk' : 'apk-snapshot', value: apkUnpinned ? 'apk add --no-cache libc6-compat' : 'pinned' },
    originalSourceLocation: 'alpine apk repositories used by the production Dockerfiles',
    originalArtifactLocation: null,
  }, planningFields('LSDEP-01')))

  const seenActions = new Set()
  for (const action of actions) {
    const id = `action-${action.uses.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase()}`
    if (seenActions.has(id)) continue
    seenActions.add(id)
    components.push(component({
      id,
      class: 'build-action',
      owner: 'LSART-01',
      name: action.uses,
      version: action.comment || action.commit,
      identity: { type: 'git-commit', value: action.commit },
      originalSourceLocation: `https://github.com/${action.uses}`,
      originalArtifactLocation: action.identity,
    }, planningFields('LSART-01')))
  }

  for (const image of PRODUCED_IMAGES) {
    const digest = env[image.env] || null
    const published = SHA256_DIGEST.test(digest || '')
    components.push(component({
      id: image.id,
      class: 'produced-image',
      owner: image.owner,
      name: `ghcr.io/linktrend/${image.name}`,
      version: published ? `sha-${releaseSha}` : 'unpublished',
      identity: { type: published ? 'oci-digest' : 'unpublished', value: published ? digest : null },
      originalSourceLocation: 'LiNKsites production Dockerfiles at the admitted release commit',
      originalArtifactLocation: published ? `ghcr.io/linktrend/${image.name}@${digest}` : null,
    }, planningFields(image.owner)))
  }

  return {
    releaseSha,
    releaseTree,
    lockfileSha256: sha256Hex(lockBytes),
    packageManager: packageJson.packageManager,
    workflowRel,
    dockerFiles,
    components,
    apkUnpinned,
  }
}

function hostOf(uri) {
  try {
    return new URL(uri).hostname
  } catch {
    return ''
  }
}

export function applyReceipts(manifest, receipts) {
  if (!receipts) return manifest
  if (receipts.kind !== RECEIPTS_KIND) throw fail('receipts_kind_invalid')
  if (receipts.schemaVersion !== SCHEMA_VERSION) throw fail('receipts_schema_invalid')
  const byId = new Map((receipts.components || []).map((row) => [row.id, row]))
  const components = manifest.components.map((row) => {
    const receipt = byId.get(row.id)
    if (!receipt) return row
    return {
      ...row,
      licence: receipt.licence || row.licence,
      originalSourceLocation: receipt.originalSourceLocation ?? row.originalSourceLocation,
      originalArtifactLocation: receipt.originalArtifactLocation ?? row.originalArtifactLocation,
      archive: { ...emptyArchive(), recorded: true, ...receipt.archive },
      compatibility: receipt.compatibility || row.compatibility,
      reviewedUpdate: receipt.reviewedUpdate || row.reviewedUpdate,
      reproduction: receipt.reproduction || row.reproduction,
      rollbackTarget: receipt.rollbackTarget || row.rollbackTarget,
      receiptChecksum: receipt.checksum || null,
    }
  })
  return {
    ...manifest,
    receiptsApplied: true,
    evidenceClass: receipts.evidenceClass || 'archive-proof',
    components,
  }
}

export function finalizeManifest({ source, receipts = null, continuityClaimed = false }) {
  let manifest = {
    schemaVersion: SCHEMA_VERSION,
    kind: MANIFEST_KIND,
    evidenceClass: receipts ? 'archive-proof' : 'planning',
    continuityClaimed: false,
    continuityComplete: false,
    archiveAndReleaseComplete: false,
    repository: {
      name: 'LiNKsites',
      releaseSha: source.releaseSha,
      releaseTree: source.releaseTree,
      lockfileSha256: source.lockfileSha256,
    },
    packageManager: source.packageManager,
    sourcesInspected: {
      lockfile: 'pnpm-lock.yaml',
      workflow: source.workflowRel,
      dockerfiles: source.dockerFiles,
    },
    planningSeparatedFromArchiveProof: true,
    vendoredDependencies: false,
    activeFork: false,
    downloadedOrPublishedByThisWorker: false,
    components: source.components,
    receiptsApplied: false,
  }
  if (receipts) manifest = applyReceipts(manifest, receipts)
  if (continuityClaimed) manifest.continuityClaimed = true
  const verdict = verifyManifest(manifest, { requireArchiveProof: Boolean(continuityClaimed), allowPlanning: !continuityClaimed })
  if (continuityClaimed && !verdict.ok) throw fail('continuity_claim_rejected', verdict.errors.map((row) => row.code).join(','))
  manifest.continuityComplete = Boolean(continuityClaimed && verdict.ok)
  manifest.archiveAndReleaseComplete = false
  manifest.verification = { ok: verdict.ok, errors: verdict.errors, requireArchiveProof: Boolean(continuityClaimed) }
  return manifest
}

function archiveUriAcceptable(uri, originalArtifactLocation) {
  if (!uri || typeof uri !== 'string') return false
  if (!/^https:\/\//.test(uri)) return false
  if (PLACEHOLDER.test(uri)) return false
  if (uri === originalArtifactLocation) return false
  const host = hostOf(uri)
  if (!host || UPSTREAM_HOST.test(host)) return false
  if (isMutableIdentity(uri)) return false
  return true
}

function licenceRecorded(licence) {
  if (!licence || typeof licence !== 'object') return false
  if (licence.recorded === true && (licence.spdx || licence.name)) return true
  return false
}

function provenanceRecorded(row) {
  return Boolean(row.originalSourceLocation && row.originalArtifactLocation)
}

function rollbackRecorded(row) {
  const target = row.rollbackTarget
  if (!target || target.recorded !== true) return false
  if (!target.identity || isMutableIdentity(target.identity)) return false
  if (target.tested !== true) return false
  return true
}

function identityImmutable(row) {
  const value = row.identity?.value
  const type = row.identity?.type
  if (type === 'unpublished' || value == null) return false
  if (type === 'unpinned-apk') return false
  if (type === 'packageManager') return false
  return !isMutableIdentity(value)
}

function checksumMatches(row) {
  const expected = row.identity?.value
  const provided = row.archive?.checksum || row.receiptChecksum
  if (!expected || !provided) return false
  return String(provided) === String(expected)
}

function compatible(row) {
  return row.compatibility?.compatible === true && row.compatibility?.withAdmittedSource === true
}

export function verifyManifest(manifest, options = {}) {
  const requireArchiveProof = Boolean(options.requireArchiveProof)
  const allowPlanning = options.allowPlanning !== false
  const errors = []
  const note = (code, id, extra) => errors.push({ code, component: id || null, extra: extra || null })

  if (!manifest || manifest.kind !== MANIFEST_KIND || manifest.schemaVersion !== SCHEMA_VERSION) {
    note('manifest_schema_invalid')
    return { ok: false, errors }
  }
  if (manifest.vendoredDependencies === true || manifest.activeFork === true) {
    note('forbidden_vendor_or_fork')
  }
  if (manifest.continuityClaimed === true && manifest.evidenceClass === 'planning') {
    note('planning_cannot_claim_continuity')
  }
  if (manifest.continuityClaimed === true) {
    // Claiming always requires archive proof.
  } else if (!allowPlanning && requireArchiveProof) {
    note('planning_rejected_when_archive_proof_required')
  }
  if (manifest.evidenceClass === 'planning' && manifest.archiveAndReleaseComplete === true) {
    note('planning_cannot_claim_archive_complete')
  }

  const byId = new Map((manifest.components || []).map((row) => [row.id, row]))
  const requiredIds = new Set()
  for (const pkg of REQUIRED_LOCK_PACKAGES) requiredIds.add(pkg.id)
  requiredIds.add('lockfile-pnpm')
  requiredIds.add('tool-pnpm')
  requiredIds.add('img-base-node')
  requiredIds.add('img-base-postgres')
  for (const image of PRODUCED_IMAGES) requiredIds.add(image.id)
  for (const id of requiredIds) {
    if (!byId.has(id)) note('required_component_missing', id)
  }

  const needProof = requireArchiveProof || manifest.continuityClaimed === true
  const classesPresent = new Set()

  for (const row of manifest.components || []) {
    classesPresent.add(row.class)
    if (isMutableIdentity(row.identity?.value) || row.identity?.type === 'unpublished' || row.identity?.type === 'unpinned-apk') {
      if (needProof) note('mutable_identity', row.id, row.identity)
    }
    if (needProof) {
      if (!row.archive?.recorded || !archiveUriAcceptable(row.archive?.uri, row.originalArtifactLocation)) {
        note('missing_archive', row.id)
      }
      if (row.archive?.access !== 'read-only' || row.archive?.controller !== 'LiNKtrend') {
        note('missing_archive', row.id, 'not-linktrend-readonly')
      }
      if (!checksumMatches(row)) note('checksum_mismatch', row.id)
      if (!licenceRecorded(row.licence)) note('missing_licence', row.id)
      if (!provenanceRecorded(row)) note('missing_provenance', row.id)
      if (!compatible(row)) note('incompatible_version', row.id)
      if (!rollbackRecorded(row)) note('absent_rollback', row.id)
      if (!identityImmutable(row)) note('mutable_identity', row.id)
    } else {
      if (row.archive?.recorded === true && !archiveUriAcceptable(row.archive.uri, row.originalArtifactLocation)) {
        note('missing_archive', row.id, 'planning-presented-unusable-archive-as-proof')
      }
      if (row.continuityProof === true) note('planning_cannot_claim_continuity', row.id)
    }
  }

  if (needProof) {
    for (const cls of ARCHIVE_PROOF_CLASSES) {
      if (![...classesPresent].includes(cls) && cls !== 'build-action') {
        note('required_class_missing', cls)
      }
    }
    const actions = (manifest.components || []).filter((row) => row.class === 'build-action')
    if (actions.length < 4) note('required_class_missing', 'build-action')
  }

  if (manifest.continuityClaimed === true && errors.length) {
    note('continuity_claimed_without_archive_proof')
  }

  return { ok: errors.length === 0, errors }
}

export function generateManifest(root, { env = process.env, receipts = null, claimContinuity = false } = {}) {
  const source = collectSourceIdentities(root, env)
  return finalizeManifest({ source, receipts, continuityClaimed: claimContinuity })
}

export function parseReceiptsInput(raw) {
  if (raw == null) return { mode: 'planning', receipts: null }
  const text = String(raw).trim()
  if (!text || text === PLANNING_SENTINEL) return { mode: 'planning', receipts: null }
  const parsed = JSON.parse(text)
  if (parsed.kind !== RECEIPTS_KIND) throw fail('receipts_kind_invalid')
  return { mode: 'archive-proof', receipts: parsed }
}

export function immutableIdentityFor(row, index) {
  const value = row.identity?.value
  if (row.identity?.type === 'unpublished' || row.identity?.type === 'unpinned-apk' || row.identity?.type === 'packageManager' || value == null) {
    return { type: 'sha256', value: `sha256:${sha256Hex(`synthetic:${row.id}:${index}`)}` }
  }
  return row.identity
}

export function buildSyntheticPassingManifest(planningManifest) {
  const components = planningManifest.components.map((row, index) => {
    const identity = immutableIdentityFor(row, index)
    const originalArtifactLocation = row.originalArtifactLocation || `https://artifacts.linktrend.example.invalid/${row.id}`
    const originalSourceLocation = row.originalSourceLocation || `https://source.linktrend.example.invalid/oss/${row.id}`
    return {
      ...row,
      version: row.identity?.type === 'unpublished' || row.identity?.type === 'unpinned-apk' ? `synthetic-${index}` : row.version,
      identity,
      licence: { recorded: true, spdx: 'MIT', name: 'MIT' },
      originalSourceLocation,
      originalArtifactLocation,
      archive: {
        recorded: true,
        controller: 'LiNKtrend',
        access: 'read-only',
        kind: 'object-store-replica',
        uri: `https://oss-archive.linktrend.example.invalid/readonly/${row.id}/${encodeURIComponent(identity.value)}`,
        checksum: identity.value,
        readback: { verified: true, method: 'synthetic-fixture-only', notALiveArchive: true },
      },
      receiptChecksum: identity.value,
      compatibility: { compatible: true, withAdmittedSource: true, tested: true, note: 'synthetic fixture; not a live archive' },
      reviewedUpdate: { recorded: true, packet: row.owner, evidence: 'synthetic-reviewed-update-fixture' },
      reproduction: {
        recorded: true,
        instructions: 'Restore archived bytes at the recorded URI, confirm checksum, then rebuild the five images from the admitted LiNKsites commit/tree using frozen install and digest-pinned Dockerfiles.',
      },
      rollbackTarget: { recorded: true, identity: identity.value, tested: true },
    }
  })
  const manifest = {
    ...planningManifest,
    evidenceClass: 'archive-proof',
    continuityClaimed: true,
    continuityComplete: false,
    archiveAndReleaseComplete: false,
    receiptsApplied: true,
    components,
    syntheticFixture: true,
    note: 'Fully synthetic passing fixture. Not a LiNKtrend production archive and not a complete release.',
  }
  const verdict = verifyManifest(manifest, { requireArchiveProof: true, allowPlanning: false })
  if (!verdict.ok) throw fail('synthetic_fixture_invalid', verdict.errors.map((row) => `${row.code}:${row.component}`).join(','))
  manifest.verification = { ok: true, errors: [], requireArchiveProof: true }
  return manifest
}
