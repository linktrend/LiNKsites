import assert from 'node:assert/strict'
import test from 'node:test'
import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const root = resolve(new URL('../..', import.meta.url).pathname)
const read = (file) => readFile(resolve(root, file), 'utf8')

test('active deployment uses fail-closed inputs, ordered migrations, and private topology', async () => {
  const compose = await read('deploy/docker-compose.deploy.yml')
  for (const value of ['supabase-migrate:', 'payload-migrate:', 'condition: service_completed_successfully', 'condition: service_healthy', 'internal: true', 'TRAEFIK_CMS_PRIVATE_MIDDLEWARE:?', 'TRAEFIK_PREVIEW_PRIVATE_MIDDLEWARE:?']) assert.ok(compose.includes(value), value)
  assert.ok(!compose.includes(':-http://') && !compose.includes(':-https://'), 'deployment compose has no URL defaults')
  assert.ok(!compose.includes('web-company'), 'inactive app is not deployable')
})

test('Server03 uses the canonical operational Compose services and admitted provider', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'linksites-compose-operational-'))
  try {
    const runtimeFile = join(directory, 'runtime.env')
    await writeFile(runtimeFile, '')
    const canonical = await read('deploy/docker-compose.deploy.yml')
    const readyOverlay = await read('deploy/docker-compose.template-ready.yml')
    const env = { ...process.env }
    for (const match of `${canonical}\n${readyOverlay}`.matchAll(/\$\{([A-Z0-9_]+)/g)) env[match[1]] = 'synthetic-fixture'
    env.LINKSITES_RUNTIME_ENV_FILE = runtimeFile
    env.LINKLIBRARIES_ARTIFACT_PATH = directory
    env.LINKSITES_TEMPLATE_RELEASE_STATE = 'ready'
    env.LINKSITES_TEMPLATE_RELEASE_RECEIPT_JSON = '{}'
    const config = (...files) => JSON.parse(execFileSync('docker', ['compose', '--project-name', 'linksites-foundation', ...files.flatMap((file) => ['-f', file]), 'config', '--format', 'json'], { cwd: root, env, encoding: 'utf8' }))
    const baseline = config('deploy/docker-compose.deploy.yml')
    const foundation = config('deploy/docker-compose.server03-foundation.yml')
    const ready = config('deploy/docker-compose.deploy.yml', 'deploy/docker-compose.template-ready.yml')
    assert.deepEqual(foundation.services, baseline.services, 'Server03 must run the real production services')
    assert.equal(foundation.services['program-orchestrator'].command ?? null, null, 'use the real image entrypoint')
    for (const name of ['web-master', 'program-orchestrator']) {
      assert.notEqual(foundation.services[name].environment.LINKSITES_TEMPLATE_RELEASE_STATE, 'pending')
      assert.equal(foundation.services[name].volumes.some((volume) => volume.target === '/opt/linksites/linklibraries'), false, 'deferred/base Server03 must not require provider mounts')
      assert.ok(ready.services[name].volumes.some((volume) => volume.target === '/opt/linksites/linklibraries' && volume.read_only), 'ready overlay must add the provider mount')
    }
    assert.equal(foundation.services['web-master'].environment.LINKSITES_TEMPLATE_FORMAT, 'revision2')
    assert.equal(foundation.services['program-orchestrator'].environment.LINKSITES_TEMPLATE_FORMAT, 'revision2')
    assert.ok(!canonical.includes('LINKSITES_ADMITTED_TEMPLATE_SHA'))
    assert.ok(foundation.services['web-master'].labels['traefik.http.routers.linksites-preview.middlewares'])
    assert.equal(foundation.services['web-master'].ports?.length ?? 0, 0)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('Server03 delegates to operational admission and authenticated preview checks', async () => {
  const preflight = await read('deploy/scripts/preflight-server03-foundation.sh')
  const smoke = await read('deploy/scripts/postdeploy-server03-foundation-smoke.sh')
  const operationalSmoke = await read('deploy/scripts/postdeploy-smoke.sh')
  assert.ok(preflight.includes('bash deploy/scripts/preflight.sh "$@"'))
  assert.ok(smoke.includes('bash deploy/scripts/postdeploy-smoke.sh "$@"'))
  assert.ok(preflight.includes('COMPOSE_PROJECT_NAME=linksites-foundation'))
  assert.ok(smoke.includes('COMPOSE_PROJECT_NAME=linksites-foundation'))
  assert.ok(operationalSmoke.includes(".status !== 'ready'"))
  assert.ok(operationalSmoke.includes('data-private-preview='))
  assert.ok(operationalSmoke.includes('noindex'))
})

test('Server03 monitoring watches real runtime health and recovery evidence', async () => {
  const rules = await read('deploy/monitoring/server03-foundation.rules.yml')
  for (const alert of ['LiNKsitesFoundationTargetDown', 'LiNKsitesFoundationRuntimeAttention', 'LiNKsitesFoundationRuntimeMetricsMissing', 'LiNKsitesFoundationBackupStale', 'LiNKsitesFoundationRestoreRehearsalStale']) assert.ok(rules.includes(alert), alert)
  assert.ok(rules.includes('linksites_program_dead_letters_total'))
  assert.ok(rules.includes('linksites_program_active_issues'))
  assert.ok(!rules.includes('linksites_program_intake_enabled != 0'))
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
  const orchestrator = await read('deploy/docker/program-orchestrator.Dockerfile')
  assert.ok(orchestrator.includes('git config --system --add safe.directory /opt/linksites/linklibraries'), 'orchestrator can read only the fixed immutable library mount as its non-root user')
  assert.ok(!orchestrator.includes('safe.directory *'), 'orchestrator does not trust arbitrary Git repositories')
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
  assert.ok(manifest.includes("--platform-state"))
  assert.ok(manifest.includes("infrastructureArtifactAcceptanceEligible"))
  assert.ok(manifest.includes("specifier.endsWith('.js')"), '.js imports prefer the corresponding TypeScript source')
  assert.ok(manifest.includes('[specifier, `${specifier}.ts`, `${specifier}.js`]'), 'extensionless TypeScript migration imports resolve to source files')
  assert.ok(manifest.includes("specifier.replace(/\\.js$/, '')"), '.js migration imports resolve to TypeScript source files')
  assert.ok(manifest.includes('Payload migration import does not resolve to a source file'), 'unresolved migration imports fail closed')
})

test('production migration runner accepts only real PostgreSQL URLs', async () => {
  const migrationRunner = await read('deploy/scripts/run-supabase-migrations.sh')
  assert.ok(migrationRunner.includes('postgres_scheme=postgresql'), 'the accepted database scheme is PostgreSQL')
  assert.ok(migrationRunner.includes('"$postgres_scheme"://*'), 'real PostgreSQL URLs are accepted without embedding credential-shaped fixture text')
  assert.ok(!migrationRunner.includes('" + "'), 'generated string fragments cannot corrupt shell validation')
  assert.ok(migrationRunner.includes('*localhost*|*127.0.0.1*|*0.0.0.0*'), 'loopback targets remain forbidden')
})

test('deployment contract binds preview token, production mode, and smoke topology', async () => {
  const contract = await read('deploy/config/runtime-contract.mjs')
  const preflight = await read('deploy/scripts/preflight.sh')
  const smoke = await read('deploy/scripts/postdeploy-smoke.sh')
  const example = await read('deploy/config/production.env.example')
  const compose = await read('deploy/docker-compose.deploy.yml')
  const exampleNames = new Set(example.split('\n').flatMap((line) => {
    const match = line.match(/^([A-Z0-9_]+)=/)
    return match ? [match[1]] : []
  }))
  assert.equal(exampleNames.has('LINKSITES_TEMPLATE_RELEASE_STATE'), true)
  assert.match(example, /^LINKSITES_TEMPLATE_RELEASE_STATE=deferred$/m)
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
  for (const name of [
    'LINKSITES_TEMPLATE_RELEASE_RECEIPT_JSON',
    'LINKSITES_LINKLIBRARIES_ROOT',
    'LINKSITES_LINKLIBRARIES_COMMIT_SHA',
    'LINKSITES_LINKLIBRARIES_TREE_SHA',
    'LINKSITES_LINKLIBRARIES_DEPENDENCY_LOCK_SHA256',
    'LINKSITES_LINKLIBRARIES_RECEIPT_PATH',
    'LINKLIBRARIES_ARTIFACT_PATH',
    'LINKLIBRARIES_CATALOG_SHA',
    'LINKLIBRARIES_ENTRY_SHA',
    'LINKLIBRARIES_CATALOG_CONTENT_SHA256',
    'LINKLIBRARIES_ENTRY_CONTENT_SHA256',
    'W2_02_LIBRARY_REPOSITORY_PATH',
  ]) assert.equal(exampleNames.has(name), false, `${name} must remain unset in deferred runtime example`)
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
  assert.ok(overlay.includes('LINKSITES_ADMITTED_TEMPLATE_LIBRARY_PATH: /opt/linksites/linklibraries'), 'web-master must mount and address the admitted LiNKlibraries artifact outside the read-only runtime volume')
  assert.ok(overlay.includes('LINKSITES_ADMITTED_TEMPLATE_SHA: ${LINKLIBRARIES_CATALOG_SHA'), 'web-master admission SHA must bind to the manifest authority')
  assert.ok(rehearsal.includes("externalPlatformAdmission: 'not asserted; separate governed prerequisite remains'"))
  assert.ok(rehearsal.includes("W2_04_LOCAL_PROOF_HOST: 'preview.localtest'"), 'the disposable seed must map the same private hostname the proof requests')
  assert.ok(rehearsal.includes('LINKSITES_ADMITTED_TEMPLATE_SHA: libraryRevision'), 'the disposable admission fixture must use the exact historical library revision it verifies')
  assert.ok(rehearsal.includes('LINKLIBRARIES_CATALOG_CONTENT_SHA256: libraryCatalogChecksum'), 'the rehearsal must supply the verified catalog checksum to Compose')
  assert.ok(rehearsal.includes('LINKLIBRARIES_ENTRY_CONTENT_SHA256: libraryEntryChecksum'), 'the rehearsal must supply the verified entry checksum to Compose')
  assert.ok(rehearsal.includes('select state::text from lsites_ledger.program_runtime_states'), 'production-mode completion proof must read the PostgreSQL ledger, not a local state file')
  assert.ok(rehearsal.includes("approved-facts.json'), `${JSON.stringify(facts)}\\n`, { mode: 0o444 }"), 'the non-root orchestrator must be able to read the synthetic approved-facts fixture')
  assert.ok(rehearsal.includes("W2_02_POSTGRES_ADAPTER_MODULE: '@linksites/program-orchestrator/postgres-adapter'"), 'the rehearsal must select the packaged production Postgres adapter')
  assert.ok(rehearsal.includes('DATABASE_URI: localDatabaseUrl'), 'the disposable services must receive an executable local PostgreSQL URI')
  assert.ok(rehearsal.includes('W2_02_DATABASE_URI: localDatabaseUrl'), 'the disposable orchestrator must receive an executable local PostgreSQL URI')
  assert.ok(rehearsal.includes("W2_02_MODE: 'production'"), 'the disposable orchestrator must exercise the production adapter route')
  assert.ok(rehearsal.includes("const localOrgId = '00000000-0000-4000-8000-000000000001'"), 'the production-shaped fixture must use one valid organization UUID')
  assert.ok(rehearsal.includes("process.env.LINKSITES_PLATFORM_REPOSITORY ?? '/Users/linktrend/Projects/LiNKplatform'"), 'the Platform provenance checkout must be relocatable for a Linux rehearsal host')
  assert.ok(rehearsal.includes("process.env.LINKLIBRARIES_ARTIFACT_PATH ?? '/Users/linktrend/Projects/LiNKlibraries'"), 'the library evidence checkout must be relocatable for a Linux rehearsal host')
  assert.ok(rehearsal.includes('env: { ...process.env, ...runtimeValues, ...composeVariables'), 'the rehearsal must supply generated runtime values to Compose interpolation and override ambient inputs')
  assert.ok(overlay.includes('local-proof-web-master-entrypoint.mjs'), 'the disposable renderer must consume the seed-created admission evidence through an explicit proof-only launcher')
  assert.ok(overlay.includes('LINKSITES_ADMITTED_TEMPLATE_SHA: ${LINKLIBRARIES_CATALOG_SHA:?set exact approved LiNKlibraries commit}'), 'the seed and renderer must bind the same admitted library commit')
  assert.ok(overlay.includes('aliases: [cms.localtest, preview.localtest, gateway.localtest]'), 'the isolated TLS gateway hostname must resolve through the local router')
  assert.ok(overlay.match(/payload-seed:[\s\S]*LINKLIBRARIES_ARTIFACT_PATH[\s\S]*\/opt\/linksites\/linklibraries:ro/), 'the seed must inspect the same read-only library artifact as the renderer')
  const seed = await read('apps/cms/scripts/w2-04-seed.ts')
  assert.ok(seed.includes('MARKETING_SMB_V1_CATALOG_AUTHORITY'), 'the disposable seed must use the source-owned authority instead of an offline placeholder receipt')
  assert.ok(seed.includes("sha256(catalogRaw) !== authority.catalogChecksum"), 'the disposable seed must verify mounted catalog bytes')
  assert.ok(seed.includes("canonicalJsonChecksum(admittedEntry) !== authority.entryChecksum"), 'the disposable seed must verify canonical entry metadata')
  assert.ok(seed.includes("sha256(contents) !== asset.sha256"), 'the disposable seed must verify every mounted asset byte')
  assert.ok(overlay.includes('local-autowork-gateway:'), 'the disposable stack must include a proof-only completion receiver')
  assert.ok(overlay.includes('local-proof-autowork-gateway.mjs'), 'the completion receiver must use the proof-gated signed acknowledgement service')
  assert.ok(rehearsal.includes('DNS:gateway.localtest'), 'the disposable TLS certificate must cover the completion receiver')
  assert.ok(rehearsal.includes('servers: [{ url: http://local-autowork-gateway:3001 }]'), 'the isolated TLS router must reach the completion receiver')
  assert.ok(overlay.includes('payload-seed:\n        condition: service_completed_successfully'), 'the disposable renderer must wait for the admission evidence producer')
  assert.ok(rehearsal.includes("['up', '--detach', '--no-build', '--wait'"))
  assert.ok(rehearsal.includes("'exec', '-T', 'program-orchestrator', 'node', '-e'"), 'the final private-preview readback must run inside the isolated Compose network')
  assert.ok(rehearsal.includes("privatePreview: body.includes('data-private-preview=\"true\"')"), 'the final readback must verify the protected renderer marker without emitting HTML')
  assert.ok(rehearsal.includes("fetch('http://127.0.0.1:3000/readyz')"), 'orchestrator readiness must be checked inside its Linux runtime namespace')
  assert.ok(rehearsal.includes("preview_environment = 'private-preview' and public_activation = false"), 'database readback must prove published private-preview state without public activation')
  assert.ok(rehearsal.includes("['ps', '--all', '--format', 'json']"), 'graceful-shutdown proof must include stopped containers')
  assert.ok(rehearsal.includes("split(/\\r?\\n/).filter(Boolean).map"), 'shutdown state must tolerate Compose JSON and NDJSON output')
  assert.ok(rehearsal.includes("completedIssues: 16"))
})
