#!/usr/bin/env node
import assert from 'node:assert/strict'
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { execFileSync, spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const root = resolve(new URL('../..', import.meta.url).pathname)
const script = join(root, 'scripts/verify-docker-build.sh')
const temp = mkdtempSync(join(tmpdir(), 'linksites-docker-build-contract-'))
const bin = join(temp, 'bin')
const docker = join(bin, 'docker')
try {
  execFileSync('mkdir', ['-p', bin])
  writeFileSync(docker, '#!/usr/bin/env bash\nif [[ "$1" == image && "$2" == inspect ]]; then echo sha256:contract; else exit 0; fi\n')
  chmodSync(docker, 0o755)
  const env = { ...process.env, BASE_SHA: 'HEAD', DOCKER_BUILDKIT_CACHE: join(temp, 'cache'), PATH: `${bin}:${process.env.PATH}` }
  const passed = execFileSync('bash', [script], { cwd: root, env, encoding: 'utf8' })
  assert.match(passed, /W2-07 local Docker build verification passed\./)

  const failed = spawnSync('bash', [script], { cwd: root, env: { ...env, DOCKER_CLASSIFICATION_OUTPUT: '/dev/null' }, encoding: 'utf8' })
  assert.notEqual(failed.status, 0)
  assert.match(failed.stderr, /Docker classification evidence is missing or empty/)
  assert.doesNotMatch(`${failed.stdout}\n${failed.stderr}`, /W2-07 local Docker build verification passed\./)
  process.stdout.write('Docker build evidence contract probe passed\n')
} finally {
  rmSync(temp, { recursive: true, force: true })
}
