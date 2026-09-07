import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import test from 'node:test'

const root = resolve(new URL('../..', import.meta.url).pathname)
const digest = (character) => `sha256:${character.repeat(64)}`

test('pending provider and Platform authorities produce an honest infrastructure manifest', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'linksites-manifest-'))
  const output = join(directory, 'manifest.json')
  try {
    execFileSync(process.execPath, [
      'deploy/scripts/generate-deployment-manifest.mjs',
      '--provider-state', 'pending',
      '--platform-state', 'pending',
      '--output', output,
    ], {
      cwd: root,
      env: {
        ...process.env,
        LINKSITES_CMS_IMAGE_DIGEST: digest('1'),
        LINKSITES_WEB_MASTER_IMAGE_DIGEST: digest('2'),
        LINKSITES_ORCHESTRATOR_IMAGE_DIGEST: digest('3'),
        LINKSITES_WORKER_IMAGE_DIGEST: digest('4'),
        LINKSITES_MIGRATIONS_IMAGE_DIGEST: digest('5'),
      },
      stdio: 'pipe',
    })
    const manifest = JSON.parse(await readFile(output, 'utf8'))
    assert.equal(manifest.schemaVersion, '1.2.0')
    assert.equal(manifest.libraries.state, 'pending')
    assert.equal(manifest.libraries.infrastructureAcceptanceEligible, true)
    assert.equal(manifest.platform.state, 'pending')
    assert.equal(manifest.platform.infrastructureArtifactAcceptanceEligible, true)
    assert.equal('catalogSha' in manifest.libraries, false)
    assert.equal('migrationsAppliedSha' in manifest.platform, false)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
