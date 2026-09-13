import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import test from 'node:test'
import {
  PLANNING_SENTINEL,
  generateManifest,
  verifyManifest,
  buildSyntheticPassingManifest,
} from '../oss-continuity/contract.mjs'
import {
  FIXTURES,
  passingManifest,
  writeFixtureFiles,
} from '../oss-continuity/fixtures/factory.mjs'

const root = resolve(new URL('../..', import.meta.url).pathname)
const fixtureDir = resolve(root, 'deploy/oss-continuity/fixtures')
writeFixtureFiles(fixtureDir)

const expectedFail = {
  'missing-archive.json': 'missing_archive',
  'mutable-identity.json': 'mutable_identity',
  'checksum-mismatch.json': 'checksum_mismatch',
  'missing-licence.json': 'missing_licence',
  'missing-provenance.json': 'missing_provenance',
  'incompatible-version.json': 'incompatible_version',
  'absent-rollback.json': 'absent_rollback',
}

test('committed fail-closed fixtures refuse archive proof', async () => {
  for (const [name, code] of Object.entries(expectedFail)) {
    const manifest = JSON.parse(await readFile(join(fixtureDir, name), 'utf8'))
    const verdict = verifyManifest(manifest, { requireArchiveProof: true, allowPlanning: false })
    assert.equal(verdict.ok, false, name)
    assert.ok(verdict.errors.some((row) => row.code === code), `${name} should report ${code}, got ${verdict.errors.map((row) => row.code).join(',')}`)
  }
})

test('fully synthetic passing fixture verifies archive proof without claiming a live archive', async () => {
  const manifest = passingManifest()
  const verdict = verifyManifest(manifest, { requireArchiveProof: true, allowPlanning: false })
  assert.equal(verdict.ok, true, JSON.stringify(verdict.errors))
  assert.equal(manifest.syntheticFixture, true)
  assert.equal(manifest.archiveAndReleaseComplete, false)
  assert.equal(manifest.continuityComplete, false)
})

test('generator records admitted lock, digest-pinned bases, pinned publish actions and unpublished images as planning', () => {
  const manifest = generateManifest(root, { env: { ...process.env }, receipts: null, claimContinuity: false })
  assert.equal(manifest.evidenceClass, 'planning')
  assert.equal(manifest.continuityClaimed, false)
  assert.equal(manifest.continuityComplete, false)
  assert.equal(manifest.vendoredDependencies, false)
  assert.equal(manifest.activeFork, false)
  const next = manifest.components.find((row) => row.id === 'pkg-next')
  assert.equal(next.version, '16.3.3')
  assert.match(next.identity.value, /^sha512-/)
  const node = manifest.components.find((row) => row.id === 'img-base-node')
  assert.equal(node.identity.value, 'sha256:fc3e945f920b7e3000cd1af86c4ae406ec70c72f328b667baf0f3a8910d69eed')
  const postgres = manifest.components.find((row) => row.id === 'img-base-postgres')
  assert.equal(postgres.identity.value, 'sha256:3b057e1c2c6dfee60a30950096f3fab33be141dbb0fdd7af3d477083de94166c')
  const cms = manifest.components.find((row) => row.id === 'image-cms')
  assert.equal(cms.identity.type, 'unpublished')
  assert.ok(manifest.components.some((row) => row.class === 'build-action' && /^[0-9a-f]{40}$/.test(row.identity.value)))
  const planning = verifyManifest(manifest, { requireArchiveProof: false, allowPlanning: true })
  assert.equal(planning.ok, true, JSON.stringify(manifest.verification))
  const proof = verifyManifest(manifest, { requireArchiveProof: true, allowPlanning: false })
  assert.equal(proof.ok, false)
  assert.ok(proof.errors.some((row) => row.code === 'missing_archive'))
})

test('CLI generator and verifier keep planning separated from archive proof', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'oss-continuity-'))
  const output = join(directory, 'manifest.json')
  try {
    execFileSync(process.execPath, ['deploy/scripts/generate-oss-continuity-manifest.mjs', '--output', output, '--receipts', PLANNING_SENTINEL], { cwd: root, encoding: 'utf8' })
    const generated = JSON.parse(await readFile(output, 'utf8'))
    assert.equal(generated.evidenceClass, 'planning')
    const allowed = execFileSync(process.execPath, ['deploy/scripts/verify-oss-continuity-manifest.mjs', '--manifest', output, '--allow-planning'], { cwd: root, encoding: 'utf8' })
    assert.match(allowed, /oss_continuity_verified/)
    const run = (args) => {
      try {
        execFileSync(process.execPath, args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
        throw new Error('expected_command_to_fail')
      } catch (error) {
        return `${error.stdout || ''}${error.stderr || ''}${error.message}`
      }
    }
    assert.match(run(['deploy/scripts/verify-oss-continuity-manifest.mjs', '--manifest', output, '--require-archive-proof']), /oss_continuity_failed|publication_continuity_claim_missing|missing_archive/)
    assert.match(run(['deploy/scripts/generate-oss-continuity-manifest.mjs', '--output', output, '--claim-continuity']), /cannot_claim_oss_continuity_without_archive_receipts|continuity_claim_rejected/)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('synthetic rewrite of admitted source still refuses a complete-release claim', () => {
  const planning = generateManifest(root)
  const passing = buildSyntheticPassingManifest(planning)
  const verdict = verifyManifest(passing, { requireArchiveProof: true, allowPlanning: false })
  assert.equal(verdict.ok, true, JSON.stringify(verdict.errors))
  assert.equal(passing.archiveAndReleaseComplete, false)
  assert.equal(passing.syntheticFixture, true)
})

test('publication workflow still requires digest, SBOM and provenance and gates OSS continuity claims', async () => {
  const workflow = await readFile(resolve(root, '.github/workflows/publish-server03-images.yml'), 'utf8')
  assert.equal((workflow.match(/provenance: mode=max/g) || []).length, 5)
  assert.equal((workflow.match(/sbom: true/g) || []).length, 5)
  assert.match(workflow, /generate-oss-continuity-manifest\.mjs/)
  assert.match(workflow, /verify-oss-continuity-manifest\.mjs/)
  assert.match(workflow, /PLANNING_NOT_A_CONTINUITY_CLAIM/)
  assert.match(workflow, /oss_continuity_receipts_json/)
  assert.doesNotMatch(workflow, /provenance:\s*false/)
  assert.doesNotMatch(workflow, /sbom:\s*false/)
})

test('factory table covers every required fail-closed mode', () => {
  assert.deepEqual(Object.keys(FIXTURES).sort(), [
    'absent-rollback.json',
    'checksum-mismatch.json',
    'incompatible-version.json',
    'missing-archive.json',
    'missing-licence.json',
    'missing-provenance.json',
    'mutable-identity.json',
    'passing.json',
  ])
})
