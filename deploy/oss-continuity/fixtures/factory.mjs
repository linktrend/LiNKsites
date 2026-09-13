import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { MANIFEST_KIND, SCHEMA_VERSION, REQUIRED_LOCK_PACKAGES, PRODUCED_IMAGES, sha256Hex } from '../contract.mjs'

const digest = (label) => `sha256:${sha256Hex(label)}`
const commit = (label) => sha256Hex(label).slice(0, 40)

function archived(id, identity, extra = {}) {
  return {
    id,
    class: extra.class,
    owner: extra.owner,
    name: extra.name,
    version: extra.version,
    identity,
    licence: { recorded: extra.licence === false ? false : true, spdx: extra.licence === false ? null : 'MIT', name: extra.licence === false ? null : 'MIT' },
    originalSourceLocation: extra.omitProvenance ? null : `https://source.linktrend.example.invalid/${id}`,
    originalArtifactLocation: extra.omitProvenance ? null : `https://artifacts.linktrend.example.invalid/${id}`,
    archive: extra.missingArchive
      ? { recorded: false, controller: null, access: null, uri: null, kind: null, checksum: null, readback: null }
      : {
        recorded: true,
        controller: 'LiNKtrend',
        access: 'read-only',
        kind: 'object-store-replica',
        uri: extra.archiveUri || `https://oss-archive.linktrend.example.invalid/readonly/${id}/${identity.value}`,
        checksum: extra.checksumMismatch ? digest(`mismatch:${id}`) : identity.value,
        readback: { verified: true, method: 'synthetic-fixture-only', notALiveArchive: true },
      },
    compatibility: extra.incompatible
      ? { compatible: false, withAdmittedSource: false, tested: false, note: 'fixture incompatible version' }
      : { compatible: true, withAdmittedSource: true, tested: true, note: 'synthetic fixture' },
    reviewedUpdate: { recorded: true, packet: extra.owner, evidence: 'synthetic-reviewed-update-fixture' },
    reproduction: { recorded: true, instructions: 'Restore archived bytes; rebuild from admitted commit/tree.' },
    rollbackTarget: extra.absentRollback
      ? { recorded: false, identity: null, tested: false }
      : { recorded: true, identity: identity.value, tested: true },
  }
}

function passingComponents() {
  const rows = [
    archived('lockfile-pnpm', { type: 'sha256', value: digest('lockfile') }, { class: 'locked-package', owner: 'LSSEC-01', name: 'pnpm-lock.yaml', version: '9.0' }),
  ]
  for (const pkg of REQUIRED_LOCK_PACKAGES) {
    rows.push(archived(pkg.id, { type: 'pnpm-integrity', value: `sha512-${Buffer.from(pkg.id).toString('base64')}` }, { class: 'locked-package', owner: pkg.owner, name: pkg.name, version: pkg.version }))
  }
  rows.push(archived('tool-pnpm', { type: 'sha256', value: digest('pnpm-binary') }, { class: 'build-tool', owner: 'LSSEC-01', name: 'pnpm', version: '10.0.0' }))
  rows.push(archived('img-base-node', { type: 'oci-digest', value: digest('node') }, { class: 'base-image', owner: 'LSDEP-01', name: 'node:22.17.0-alpine', version: '22.17.0-alpine' }))
  rows.push(archived('img-base-postgres', { type: 'oci-digest', value: digest('postgres') }, { class: 'base-image', owner: 'LSDEP-01', name: 'postgres:16.8-alpine', version: '16.8-alpine' }))
  rows.push(archived('action-actions-checkout', { type: 'git-commit', value: commit('checkout') }, { class: 'build-action', owner: 'LSART-01', name: 'actions/checkout', version: 'v4' }))
  rows.push(archived('action-docker-setup-buildx-action', { type: 'git-commit', value: commit('buildx') }, { class: 'build-action', owner: 'LSART-01', name: 'docker/setup-buildx-action', version: 'v3' }))
  rows.push(archived('action-docker-login-action', { type: 'git-commit', value: commit('login') }, { class: 'build-action', owner: 'LSART-01', name: 'docker/login-action', version: 'v3' }))
  rows.push(archived('action-docker-build-push-action', { type: 'git-commit', value: commit('build-push') }, { class: 'build-action', owner: 'LSART-01', name: 'docker/build-push-action', version: 'v6' }))
  rows.push(archived('action-actions-upload-artifact', { type: 'git-commit', value: commit('upload') }, { class: 'build-action', owner: 'LSART-01', name: 'actions/upload-artifact', version: 'v4' }))
  for (const image of PRODUCED_IMAGES) {
    rows.push(archived(image.id, { type: 'oci-digest', value: digest(image.id) }, { class: 'produced-image', owner: image.owner, name: `ghcr.io/linktrend/${image.name}`, version: 'sha-synthetic' }))
  }
  return rows
}

export function passingManifest() {
  return {
    schemaVersion: SCHEMA_VERSION,
    kind: MANIFEST_KIND,
    evidenceClass: 'archive-proof',
    continuityClaimed: true,
    continuityComplete: false,
    archiveAndReleaseComplete: false,
    syntheticFixture: true,
    vendoredDependencies: false,
    activeFork: false,
    downloadedOrPublishedByThisWorker: false,
    planningSeparatedFromArchiveProof: true,
    repository: { name: 'LiNKsites', releaseSha: commit('release'), releaseTree: commit('tree'), lockfileSha256: sha256Hex('lock') },
    components: passingComponents(),
    note: 'Fully synthetic passing fixture. Not a live archive and not a complete five-image release.',
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

export function fixtureMissingArchive() {
  const manifest = clone(passingManifest())
  manifest.components[1].archive = { recorded: false, controller: null, access: null, uri: null, kind: null, checksum: null, readback: null }
  return manifest
}

export function fixtureMutableIdentity() {
  const manifest = clone(passingManifest())
  manifest.components.find((row) => row.id === 'img-base-node').identity = { type: 'tag', value: 'node:22-alpine' }
  return manifest
}

export function fixtureChecksumMismatch() {
  const manifest = clone(passingManifest())
  manifest.components[0].archive.checksum = digest('other')
  return manifest
}

export function fixtureMissingLicence() {
  const manifest = clone(passingManifest())
  manifest.components[2].licence = { recorded: false, spdx: null, name: null }
  return manifest
}

export function fixtureMissingProvenance() {
  const manifest = clone(passingManifest())
  manifest.components[3].originalSourceLocation = null
  manifest.components[3].originalArtifactLocation = null
  return manifest
}

export function fixtureIncompatibleVersion() {
  const manifest = clone(passingManifest())
  manifest.components.find((row) => row.id === 'pkg-next').compatibility = { compatible: false, withAdmittedSource: false, tested: false, note: 'next 1.0.0 is not the admitted 16.3.3 identity' }
  manifest.components.find((row) => row.id === 'pkg-next').version = '1.0.0'
  return manifest
}

export function fixtureAbsentRollback() {
  const manifest = clone(passingManifest())
  manifest.components.find((row) => row.id === 'image-cms').rollbackTarget = { recorded: false, identity: null, tested: false }
  return manifest
}

export const FIXTURES = {
  'passing.json': passingManifest,
  'missing-archive.json': fixtureMissingArchive,
  'mutable-identity.json': fixtureMutableIdentity,
  'checksum-mismatch.json': fixtureChecksumMismatch,
  'missing-licence.json': fixtureMissingLicence,
  'missing-provenance.json': fixtureMissingProvenance,
  'incompatible-version.json': fixtureIncompatibleVersion,
  'absent-rollback.json': fixtureAbsentRollback,
}

export function writeFixtureFiles(directory) {
  for (const [name, builder] of Object.entries(FIXTURES)) {
    writeFileSync(resolve(directory, name), `${JSON.stringify(builder(), null, 2)}\n`)
  }
}
