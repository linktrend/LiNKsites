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

test('every deployed image has an immutable base and release label contract', async () => {
  for (const file of ['deploy/docker/cms.Dockerfile', 'deploy/docker/web-master.Dockerfile', 'deploy/docker/autowork-worker.Dockerfile', 'deploy/docker/program-orchestrator.Dockerfile', 'deploy/docker/migrations.Dockerfile']) {
    const dockerfile = await read(file)
    assert.match(dockerfile, /^FROM .+@sha256:[a-f0-9]{64}/m, `${file} pins a base image digest`)
    assert.match(dockerfile, /ARG LINKSITES_RELEASE_SHA/, `${file} declares release identity`)
    assert.match(dockerfile, /org\.opencontainers\.image\.revision/, `${file} labels release identity`)
  }
})

test('manifest and Compose name the same five deployable images', async () => {
  const compose = await read('deploy/docker-compose.deploy.yml')
  const manifest = await read('deploy/scripts/generate-deployment-manifest.mjs')
  for (const name of ['CMS', 'WEB_MASTER', 'ORCHESTRATOR', 'WORKER', 'MIGRATIONS']) {
    assert.ok(compose.includes(`LINKSITES_${name}_IMAGE`), `Compose image input ${name}`)
    assert.ok(manifest.includes(`LINKSITES_${name}_IMAGE_DIGEST`), `manifest digest ${name}`)
  }
  assert.ok(manifest.includes('LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA'))
  assert.ok(manifest.includes('`${specifier}.ts`'), 'extensionless TypeScript migration imports resolve to source files')
  assert.ok(manifest.includes('Payload migration import does not resolve to a source file'), 'unresolved migration imports fail closed')
})

test('production migration runner accepts only real PostgreSQL URLs', async () => {
  const migrationRunner = await read('deploy/scripts/run-supabase-migrations.sh')
  assert.ok(migrationRunner.includes('postgresql://*)'), 'real PostgreSQL URLs are accepted')
  assert.ok(!migrationRunner.includes('" + "'), 'generated string fragments cannot corrupt shell validation')
  assert.ok(migrationRunner.includes('*localhost*|*127.0.0.1*|*0.0.0.0*'), 'loopback targets remain forbidden')
})

test('deployment contract binds preview token, production mode, and smoke topology', async () => {
  const contract = await read('deploy/config/runtime-contract.mjs')
  const preflight = await read('deploy/scripts/preflight.sh')
  const smoke = await read('deploy/scripts/postdeploy-smoke.sh')
  const example = await read('deploy/config/production.env.example')
  const compose = await read('deploy/docker-compose.deploy.yml')
  assert.ok(contract.includes("required('PREVIEW_ACCESS_TOKEN', 'secret-min-32', true)"))
  assert.ok(contract.includes("required('W2_02_MODE', 'literal:production')"))
  assert.ok(contract.includes("required('DATABASE_URI', 'postgres-url', true)"))
  assert.ok(contract.includes("required('W2_02_ORG_ID', 'uuid')"))
  assert.ok(contract.includes("required('W2_02_SITE_ID', 'uuid')"))
  assert.ok(contract.includes("required('W2_02_DATABASE_ROLE', 'slug')"))
  assert.ok(contract.includes("required('W2_02_APPROVED_FACTS_PATH', 'absolute-path')"))
  assert.ok(contract.includes("required('W2_02_DATABASE_URI', 'postgres-url', true)"))
  assert.ok(contract.includes("required('W2_02_POSTGRES_ADAPTER_MODULE', 'literal:@linksites/program-orchestrator/postgres-adapter')"))
  assert.ok(example.includes(['PREVIEW_ACCESS_TOKEN', 'ltfx.' + 'placeholder.5e0a9b3c2eac.v1'].join('=')))
  assert.ok(example.includes('W2_02_POSTGRES_ADAPTER_MODULE=@linksites/program-orchestrator/postgres-adapter'))
  assert.ok(compose.includes('W2_02_MODE: ${W2_02_MODE:?set W2_02_MODE=production}'))
  assert.ok(compose.includes('DATABASE_URI: ${W2_02_DATABASE_URI:?set distinct orchestrator PostgreSQL URI}'))
  assert.ok(compose.includes('W2_02_APPROVED_FACTS_PATH: ${W2_02_APPROVED_FACTS_PATH:?set absolute approved facts path}'))
  assert.ok(smoke.includes('http://payload:3000/api/readyz'))
  assert.ok(smoke.includes('http://program-orchestrator:3000/readyz'))
  assert.ok(smoke.includes('process.env.PREVIEW_ACCESS_TOKEN'))
  assert.ok(!smoke.includes('LINKSITES_PREVIEW_SMOKE_URL'))
  for (const name of ['LINKSITES_CMS_IMAGE', 'LINKSITES_WEB_MASTER_IMAGE', 'LINKSITES_WORKER_IMAGE', 'LINKSITES_ORCHESTRATOR_IMAGE', 'LINKSITES_MIGRATIONS_IMAGE']) {
    assert.ok(preflight.includes(name), `preflight binds ${name}`)
  }
  assert.ok(preflight.includes('does not exist on the deployment host'))
})

test('local Compose rehearsal is an explicit disposable overlay of the deploy bundle', async () => {
  const overlay = await read('deploy/docker-compose.local-proof.yml')
  const rehearsal = await read('deploy/scripts/rehearse-compose-stack.mjs')
  assert.ok(overlay.includes('deploy/docker-compose.deploy.yml') === false, 'overlay is composed by the rehearsal command, not recursively')
  for (const service of ['local-postgres:', 'local-tls:', 'payload-seed:', 'supabase-migrate:', 'program-orchestrator:']) assert.ok(overlay.includes(service), service)
  assert.ok(overlay.includes('LINKSITES_ADMITTED_TEMPLATE_LIBRARY_PATH: /var/lib/linksites/linklibraries'), 'web-master must mount and address the admitted LiNKlibraries artifact')
  assert.ok(overlay.includes('LINKSITES_ADMITTED_TEMPLATE_SHA: ${LINKLIBRARIES_CATALOG_SHA'), 'web-master admission SHA must bind to the manifest authority')
  assert.ok(rehearsal.includes("externalPlatformAdmission: 'not asserted; separate governed prerequisite remains'"))
  assert.ok(rehearsal.includes("W2_04_LOCAL_PROOF_HOST: 'preview.localtest'"), 'the disposable seed must map the same private hostname the proof requests')
  assert.ok(rehearsal.includes("LINKSITES_ADMITTED_TEMPLATE_SHA: '1'.repeat(40)"), 'the disposable admission fixture must use the full SHA recorded in its receipt')
  assert.ok(rehearsal.includes('env: { ...process.env, ...composeVariables'), 'the rehearsal must override ambient Compose inputs with its generated isolated values')
  assert.ok(overlay.includes('local-proof-web-master-entrypoint.mjs'), 'the disposable renderer must consume the seed-created admission evidence through an explicit proof-only launcher')
  assert.ok(overlay.includes('payload-seed:\n        condition: service_completed_successfully'), 'the disposable renderer must wait for the admission evidence producer')
  assert.ok(rehearsal.includes("['up', '--detach', '--no-build', '--wait'"))
  assert.ok(rehearsal.includes("completedIssues: 16"))
})
