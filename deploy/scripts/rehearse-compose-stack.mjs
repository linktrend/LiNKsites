#!/usr/bin/env node
/**
 * W2-07's production-shaped local stack gate.  It layers the disposable
 * overlay onto the real deployment Compose definition, builds the five
 * LiNKsites images, starts ordered migrations, drives one private-only
 * Program run, reads health/ledger/Payload/preview state, and stops cleanly.
 *
 * The local Platform bootstrap only supplies a disposable database shape
 * needed to prove LiNKsites' fail-closed migration job.  It is deliberately
 * not evidence that the governed LiNKplatform migration is admitted or
 * applied in any authoritative environment.
 */
import assert from 'node:assert/strict'
import { createHash, randomBytes } from 'node:crypto'
import { execFile } from 'node:child_process'
import { chmod, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { promisify } from 'node:util'

const exec = promisify(execFile)
const root = resolve(new URL('../..', import.meta.url).pathname)
const evidenceIndex = process.argv.indexOf('--evidence')
const evidencePath = evidenceIndex === -1 ? null : resolve(process.cwd(), process.argv[evidenceIndex + 1] ?? '')
if (evidenceIndex !== -1 && !evidencePath) throw new Error('--evidence requires a path')
const keep = process.env.LINKSITES_KEEP_LOCAL_COMPOSE_PROOF === '1'

const run = async (file, args, options = {}) => {
  const result = await exec(file, args, { cwd: root, maxBuffer: 8 * 1024 * 1024, ...options })
  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)
  return result.stdout
}
const quiet = async (file, args, options = {}) => (await exec(file, args, { cwd: root, maxBuffer: 8 * 1024 * 1024, ...options })).stdout
const random = () => randomBytes(24).toString('hex')
const sourceRevision = (await quiet('git', ['rev-parse', 'HEAD'])).trim()
// Bind the disposable proof to the last fetched authoritative remote ref,
// rather than a potentially stale local checkout branch.  This is only a
// provenance read; it does not claim that the local bootstrap is a Platform
// deployment or that it can promote a Platform migration.
const platformRevision = (await quiet('git', ['-C', '/Users/linktrend/Projects/LiNKplatform', 'rev-parse', 'origin/main'])).trim()
const libraryPath = '/Users/linktrend/Projects/LiNKlibraries'
await run('git', ['-C', libraryPath, 'cat-file', '-e', 'a7193d40152747db2a03e094fa263f324a971a0b^{commit}'])

const checkpoint = async () => {
  const files = (await quiet('git', ['ls-files', 'apps/program-orchestrator/src', 'apps/program-orchestrator/package.json', 'packages/factory-catalog/src', 'packages/factory-catalog/package.json', 'packages/program-ledger/src', 'packages/program-ledger/package.json'])).trim().split(/\r?\n/).filter(Boolean).sort()
  const hash = createHash('sha256')
  for (const file of files) hash.update(file).update('\0').update(await readFile(join(root, file))).update('\0')
  return hash.digest('hex')
}

const proofRoot = await mkdtemp(join(tmpdir(), 'linksites-w2-07-compose-'))
const tlsDir = join(proofRoot, 'tls')
const runtimeDir = join(proofRoot, 'runtime')
const runtimeEnv = join(proofRoot, 'runtime.env')
const composeEnv = join(proofRoot, 'compose.env')
const platformBootstrap = join(proofRoot, 'platform-bootstrap.sql')
const localCertificate = join(tlsDir, 'server.crt')
const localKey = join(tlsDir, 'server.key')
const localCa = join(tlsDir, 'ca.crt')
const gatewayConfig = join(tlsDir, 'dynamic.yml')
const project = `linksitesw207${random().slice(0, 12)}`
const tlsPort = String(18443 + Math.floor(Math.random() * 1000))
const orchestratorPort = String(19443 + Math.floor(Math.random() * 1000))
const apiKey = random()
const previewToken = random()
const payloadSecret = random()
const gatewaySecret = random()
const runMarker = `w2-02-run-${random().slice(0, 16)}`
const checkpointHash = await checkpoint()

let composeVariables
// Compose gives ambient shell variables precedence over --env-file. Every
// proof value is therefore also passed explicitly to Docker so a developer's
// old local port/network setting cannot silently change this isolated run.
const composeOptions = (options = {}) => ({
  ...options,
  env: { ...process.env, ...composeVariables, ...(options.env ?? {}) },
})
const compose = (args, options = {}) => run('docker', ['compose', '--project-name', project, '--env-file', composeEnv, '-f', 'deploy/docker-compose.deploy.yml', '-f', 'deploy/docker-compose.local-proof.yml', ...args], composeOptions(options))
const composeQuiet = (args, options = {}) => quiet('docker', ['compose', '--project-name', project, '--env-file', composeEnv, '-f', 'deploy/docker-compose.deploy.yml', '-f', 'deploy/docker-compose.local-proof.yml', ...args], composeOptions(options))

const platformSql = `
create extension if not exists pgcrypto;
create schema if not exists platform;
do $$ begin create type platform.org_kind as enum ('internal', 'client'); exception when duplicate_object then null; end $$;
do $$ begin create type platform.org_status as enum ('active', 'suspended', 'archived'); exception when duplicate_object then null; end $$;
do $$ begin create type platform.member_role as enum ('owner', 'admin', 'staff', 'client_admin', 'client_viewer'); exception when duplicate_object then null; end $$;
create table if not exists platform.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind platform.org_kind not null default 'client',
  status platform.org_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
do $$ begin create role svc_linksites_runtime login; exception when duplicate_object then null; end $$;
do $$ begin create role svc_linksites_ledger login; exception when duplicate_object then null; end $$;
create or replace function platform.has_org_access(target_org_id uuid, min_role platform.member_role)
returns boolean language sql stable as $$ select true $$;
grant usage on schema platform to svc_linksites_runtime, svc_linksites_ledger;
grant execute on function platform.has_org_access(uuid, platform.member_role) to svc_linksites_runtime, svc_linksites_ledger;
`

const runtimeValues = {
  LINKSITES_DEPLOYMENT_ENV: 'production',
  LINKSITES_CONFIG_SCHEMA_VERSION: '1.1.0',
  LINKSITES_RELEASE_SHA: sourceRevision,
  LINKSITES_ORG_ID: 'local-proof-org',
  DATABASE_URI: 'postgresql://postgres:local-proof-only@local-postgres:5432/postgres',
  PAYLOAD_SECRET: payloadSecret,
  PAYLOAD_PUBLIC_SERVER_URL: 'https://cms.localtest',
  LINKAUTOWORK_GATEWAY_URL: 'https://gateway.localtest',
  LINKAUTOWORK_SIGNING_SECRET: gatewaySecret,
  LINKAUTOWORK_SIGNING_KEY_ID: 'local-proof-key',
  LINKAUTOWORK_ENVIRONMENT: 'production',
  LINKAUTOWORK_OUTBOX_PATH: '/var/lib/linksites/linkautowork-outbox.json',
  LINKAUTOWORK_OUTBOX_INTEGRITY_SECRET: random(),
  LINKAUTOWORK_EVENT_GRANTS: JSON.stringify([{ eventName: 'demo.completed', environments: ['production'], orgIds: ['local-proof-org'] }]),
  NEXT_PUBLIC_CMS_PROVIDER: 'payload',
  PAYLOAD_BASE_URL: 'https://cms.localtest',
  NEXT_PUBLIC_PAYLOAD_API_URL: 'https://cms.localtest',
  PAYLOAD_API_KEY: apiKey,
  PREVIEW_ACCESS_TOKEN: previewToken,
  PREVIEW_RUN_MARKER: runMarker,
  LINKSITES_W2_04_LOCAL_PROOF_TEMPLATE_ID: 'marketing-smb-v1',
  // The seed must create the same private hostname that the proof requests;
  // otherwise web-master correctly rejects the unmapped token-gated tenant.
  W2_04_LOCAL_PROOF_HOST: 'preview.localtest',
  LINKSITES_LOCAL_COMPOSE_PROOF: '1',
  // The deterministic offline consumption fixture records a full Git SHA;
  // keep this derived so a truncated literal cannot silently bypass the
  // template-admission contract.
  LINKSITES_ADMITTED_TEMPLATE_SHA: '1'.repeat(40),
  W2_02_MODE: 'local',
  W2_02_DATABASE_URI: 'postgresql://postgres:local-proof-only@local-postgres:5432/postgres',
  W2_02_ORG_ID: 'local-proof-org',
  W2_02_SITE_ID: '00000000-0000-4000-8000-000000000002',
  W2_02_DATABASE_ROLE: 'svc_linksites_runtime',
  W2_02_APPROVED_FACTS_PATH: '/var/lib/linksites/program/approved-facts.json',
  W2_02_EXECUTION_REVISION: sourceRevision,
  W2_02_EXECUTABLE_CHECKPOINT: checkpointHash,
  W2_02_STATE_DIR: '/var/lib/linksites/program',
  W2_02_PAYLOAD_BASE_URL: 'https://cms.localtest',
  W2_02_PAYLOAD_API_KEY: apiKey,
  W2_02_PAYLOAD_SITE_ID: '1',
  W2_02_WEB_MASTER_BASE_URL: 'https://preview.localtest',
  W2_02_PREVIEW_ACCESS_TOKEN: previewToken,
  W2_05_OUTCOME_GATEWAY_SECRET: gatewaySecret,
  W2_05_OUTCOME_GATEWAY_KEY_ID: 'local-proof-key',
  W2_02_LIBRARY_REPOSITORY_PATH: '/var/lib/linksites/linklibraries',
  W2_04_PREVIEW_API_KEY: apiKey,
  W2_04_PREVIEW_PASSWORD: random(),
  LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA: platformRevision,
}

const lead = {
  schema_version: { major: 1, minor: 0 }, org_id: 'local-proof-org', correlation_id: `compose:${runMarker}`,
  idempotency_key: `compose:${runMarker}`, lead_id: runMarker, requested_vertical: 'home_services', source: 'manual-file',
  research: { summary: 'Disposable W2-07 Compose proof.', sources: ['source:founder:brief'] },
}
const facts = {
  schemaVersion: { major: 1, minor: 0 }, orgId: 'local-proof-org', leadId: runMarker,
  businessName: `W2-07 ${runMarker}`, geography: 'Taipei', services: ['Local service consultation'],
  credentials: ['Founder-provided credentials'], reviews: [{ quote: 'Founder-provided review', author: 'Approved customer' }],
  contact: { phone: '+886200000000', email: 'proof@local.invalid', address: 'Taipei, Taiwan', website: 'https://local.invalid.test' },
  pricing: 'Contact for an approved quote', legalClaims: ['Founder-approved legal copy'], media: [],
}

try {
  await run('bash', ['scripts/verify-docker-build.sh'])
  for (const image of ['linksites-cms:w2-07-local', 'linksites-web-master:w2-07-local', 'linksites-autowork-worker:w2-07-local', 'linksites-program-orchestrator:w2-07-local', 'linksites-migrations:w2-07-local']) {
    const revision = (await quiet('docker', ['image', 'inspect', '--format', '{{ index .Config.Labels "org.opencontainers.image.revision" }}', image])).trim()
    assert.equal(revision, sourceRevision, `${image} release label does not bind to the tested source SHA`)
  }

  await run('mkdir', ['-p', tlsDir, runtimeDir, join(runtimeDir, 'program')])
  await chmod(runtimeDir, 0o777)
  await chmod(join(runtimeDir, 'program'), 0o777)
  await writeFile(platformBootstrap, platformSql)
  await run('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', localKey, '-out', localCa, '-days', '1', '-subj', '/CN=LiNKsites local proof CA'])
  await run('openssl', ['req', '-newkey', 'rsa:2048', '-nodes', '-keyout', join(tlsDir, 'server-request.key'), '-out', join(tlsDir, 'server.csr'), '-subj', '/CN=cms.localtest', '-addext', 'subjectAltName=DNS:cms.localtest,DNS:preview.localtest'])
  await writeFile(join(tlsDir, 'server.ext'), 'subjectAltName=DNS:cms.localtest,DNS:preview.localtest\n')
  await run('openssl', ['x509', '-req', '-in', join(tlsDir, 'server.csr'), '-CA', localCa, '-CAkey', localKey, '-CAcreateserial', '-out', localCertificate, '-days', '1', '-extfile', join(tlsDir, 'server.ext')])
  await writeFile(gatewayConfig, `tls:\n  certificates:\n    - certFile: /etc/traefik/server.crt\n      keyFile: /etc/traefik/server-request.key\nhttp:\n  routers:\n    cms:\n      rule: Host(\`cms.localtest\`)\n      entryPoints: [websecure]\n      service: cms\n      tls: {}\n    preview:\n      rule: Host(\`preview.localtest\`)\n      entryPoints: [websecure]\n      service: preview\n      tls: {}\n  services:\n    cms:\n      loadBalancer:\n        servers: [{ url: http://payload:3000 }]\n    preview:\n      loadBalancer:\n        servers: [{ url: http://web-master:3000 }]\n`)
  await writeFile(runtimeEnv, `${Object.entries(runtimeValues).map(([name, value]) => `${name}=${value}`).join('\n')}\n`, { mode: 0o600 })
  await writeFile(join(runtimeDir, 'program', 'leads.ndjson'), `${JSON.stringify(lead)}\n`, { mode: 0o600 })
  await writeFile(join(runtimeDir, 'program', 'approved-facts.json'), `${JSON.stringify(facts)}\n`, { mode: 0o600 })
  composeVariables = {
    COMPOSE_PROJECT_NAME: project,
    LINKSITES_RUNTIME_ENV_FILE: runtimeEnv,
    LINKSITES_CMS_IMAGE: 'linksites-cms:w2-07-local',
    LINKSITES_WEB_MASTER_IMAGE: 'linksites-web-master:w2-07-local',
    LINKSITES_WORKER_IMAGE: 'linksites-autowork-worker:w2-07-local',
    LINKSITES_ORCHESTRATOR_IMAGE: 'linksites-program-orchestrator:w2-07-local',
    LINKSITES_MIGRATIONS_IMAGE: 'linksites-migrations:w2-07-local',
    LINKSITES_RELEASE_SHA: sourceRevision,
    LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA: platformRevision,
    PAYLOAD_PUBLIC_SERVER_URL: 'https://cms.localtest',
    NEXT_PUBLIC_PAYLOAD_API_URL: 'https://cms.localtest',
    LINKLIBRARIES_ARTIFACT_PATH: libraryPath,
    TRAEFIK_NETWORK: `${project}-edge`,
    TRAEFIK_CMS_HOST: 'cms.localtest',
    TRAEFIK_PREVIEW_HOST: 'preview.localtest',
    TRAEFIK_ENTRYPOINT: 'websecure',
    TRAEFIK_CMS_PRIVATE_MIDDLEWARE: 'local-proof-private',
    TRAEFIK_PREVIEW_PRIVATE_MIDDLEWARE: 'local-proof-private',
    LINKSITES_LOCAL_PROOF_PLATFORM_BOOTSTRAP: platformBootstrap,
    LINKSITES_LOCAL_PROOF_TLS_DIR: tlsDir,
    LINKSITES_LOCAL_PROOF_RUNTIME_DIR: runtimeDir,
    LINKSITES_LOCAL_PROOF_TLS_PORT: tlsPort,
    LINKSITES_LOCAL_PROOF_ORCHESTRATOR_PORT: orchestratorPort,
  }
  await writeFile(composeEnv, `${Object.entries(composeVariables).map(([name, value]) => `${name}=${value}`).join('\n')}\n`, { mode: 0o600 })

  await compose(['config', '--quiet'])
  try {
    await compose(['up', '--detach', '--no-build', '--wait', '--wait-timeout', '180'])
  } catch {
    // Preserve the service-level diagnostic before the scoped finally block
    // tears down this disposable proof project.
    const logs = await composeQuiet(['logs', '--no-color']).catch(() => '')
    throw new Error(`${error instanceof Error ? error.message : String(error)}\n\nCompose service logs:\n${logs}`)
  }
  const waitFor = async (predicate, description) => {
    for (let attempt = 0; attempt < 90; attempt += 1) {
      if (await predicate()) return
      await new Promise((resolveWait) => setTimeout(resolveWait, 1_000))
    }
    throw new Error(`timed out waiting for ${description}`)
  }
  await waitFor(async () => {
    try {
      const value = JSON.parse(await readFile(join(runtimeDir, 'program', 'program-ledger.json'), 'utf8'))
      return value.program?.state === 'completed' && value.issues?.length === 16 && value.issues.every((issue) => issue.state === 'completed') && value.completion?.state === 'emitted' && value.outbox?.length === 1 && value.outbox[0]?.status === 'delivered'
    } catch { return false }
  }, 'the certified 16-issue Program fixture')
  const headers = join(proofRoot, 'preview.headers')
  const body = join(proofRoot, 'preview.html')
  // Docker Desktop can report the service graph ready a fraction before its
  // loopback port-forward is accepting connections. Retry only that transient
  // connection-refused state; a TLS, router, authorization, or render failure
  // still leaves curl non-zero and fails this proof.
  try {
    await run('curl', ['--fail', '--silent', '--show-error', '--retry', '20', '--retry-connrefused', '--retry-delay', '1', '--cacert', localCa, '--resolve', `preview.localtest:${tlsPort}:127.0.0.1`, '-D', headers, '-o', body, `https://preview.localtest:${tlsPort}/en/demo/${previewToken}`])
  } catch (error) {
    // Do not emit environment files, request URLs, or generated credentials.
    // Service output and state identify a routing/listener failure without
    // retaining those transport credentials in a durable evidence artifact.
    const [state, logs] = await Promise.all([
      composeQuiet(['ps', '--format', 'json']).catch(() => ''),
      composeQuiet(['logs', '--no-color', 'local-tls', 'web-master', 'program-orchestrator']).catch(() => ''),
    ])
    throw new Error(`private preview request failed\n\nCompose listener diagnostics:\n${state}\n${logs}`)
  }
  assert.match(await readFile(headers, 'utf8'), /x-robots-tag:\s*noindex/i)
  assert.match(await readFile(body, 'utf8'), new RegExp(runMarker))
  await run('curl', ['--fail', '--silent', '--show-error', '--cacert', localCa, `http://127.0.0.1:${orchestratorPort}/readyz`])
  const databaseReadback = (await composeQuiet(['exec', '-T', 'local-postgres', 'psql', '-At', '-U', 'postgres', '-d', 'postgres', '-c', `select count(*) from public.pages where promotion_run_marker = '${runMarker}' and status = 'draft' and _status = 'draft';`])).trim()
  assert.equal(databaseReadback, '5', 'Compose stack must preserve five private draft documents')
  const migrationReceipt = (await composeQuiet(['exec', '-T', 'local-postgres', 'psql', '-At', '-U', 'postgres', '-d', 'postgres', '-c', `select platform_commit_sha from lsites_ledger.platform_migration_receipts where platform_commit_sha = '${platformRevision}';`])).trim()
  assert.equal(migrationReceipt, platformRevision, 'migration job receipt must bind its supplied platform revision')
  await compose(['stop', '--timeout', '20'])
  const state = JSON.parse(await composeQuiet(['ps', '--format', 'json']))
  for (const name of ['payload', 'web-master', 'autowork-worker', 'program-orchestrator']) assert.notEqual(state.find((service) => service.Service === name)?.State, 'running', `${name} did not stop cleanly`)
  const receipt = {
    schemaVersion: '1.0.0', gate: 'w2-07-compose-stack-v1', sourceRevision, executableCheckpoint: checkpointHash,
    localOnly: true, publicActivation: false, credentialsPersisted: false,
    applications: ['cms', 'web-master', 'autowork-worker', 'program-orchestrator', 'migrations'],
    configuration: { strictRuntimeContract: true, nonLoopbackHttps: true, ephemeralTlsCa: true },
    migrations: { ordered: true, localPlatformDatabaseShapeBootstrapped: true, suppliedPlatformRevision: platformRevision, externalPlatformAdmission: 'not asserted; separate governed prerequisite remains' },
    certifiedFixture: { runMarker, completedIssues: 16, privateDrafts: 5, completion: 'delivered', privatePreviewNoindex: true },
    health: { orchestratorReadiness: true, gracefulShutdown: true },
  }
  if (evidencePath) { await writeFile(evidencePath, `${JSON.stringify(receipt, null, 2)}\n`); }
  process.stdout.write(`${JSON.stringify(receipt)}\n`)
} finally {
  await compose(['down', '--volumes', '--remove-orphans']).catch(() => undefined)
  if (!keep) await rm(proofRoot, { recursive: true, force: true })
}
