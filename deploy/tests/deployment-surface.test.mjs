import assert from 'node:assert/strict'
import test from 'node:test'
import { access, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(new URL('../..', import.meta.url).pathname)
const read = (file) => readFile(resolve(root, file), 'utf8')

test('active deployment uses fail-closed inputs, ordered migrations, and private topology', async () => {
  const compose = await read('deploy/docker-compose.deploy.yml')
  for (const value of ['supabase-migrate:', 'payload-migrate:', 'condition: service_completed_successfully', 'condition: service_healthy', 'internal: true', 'TRAEFIK_CMS_PRIVATE_MIDDLEWARE:?', 'TRAEFIK_PREVIEW_PRIVATE_MIDDLEWARE:?']) assert.ok(compose.includes(value), value)
  assert.ok(!compose.includes(':-http://') && !compose.includes(':-https://'), 'deployment compose has no URL defaults')
  assert.ok(!compose.includes('web-company'), 'inactive app is not deployable')
})

test('active package scripts cannot invoke retired mirror tooling', async () => {
  const cmsPackage = await read('apps/cms/package.json')
  assert.ok(!cmsPackage.includes('sync-supabase-to-cms'))
  assert.ok(!cmsPackage.includes('seed-supabase-lsites-core'))
  await assert.rejects(access(resolve(root, 'apps/web-company')))
  await access(resolve(root, 'archive/paused-applications/web-company/ARCHIVE.md'))
  await access(resolve(root, 'archive/retired-supabase-mirror/README.md'))
})

test('production Dockerfiles validate configuration before app startup', async () => {
  for (const file of ['deploy/docker/cms.Dockerfile', 'deploy/docker/web-master.Dockerfile', 'deploy/docker/autowork-worker.Dockerfile', 'deploy/docker/program-orchestrator.Dockerfile']) {
    const dockerfile = await read(file)
    assert.ok(dockerfile.includes('entrypoint.mjs'), `${file} has fail-closed entrypoint`)
    assert.ok(dockerfile.includes('USER '), `${file} has non-root execution`)
    assert.ok(dockerfile.includes('HEALTHCHECK'), `${file} has health check`)
  }
})
