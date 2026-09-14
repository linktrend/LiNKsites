import assert from 'node:assert/strict'
import test from 'node:test'
import { CONFIG_SCHEMA_VERSION, SERVICE_CONFIGURATION, validateRuntimeConfig, HARNESS_RELEASE_PIN, PROFILE_RELEASE_PIN } from '../config/runtime-contract.mjs'
import { readFile } from 'node:fs/promises'

const secret = 'aB9!'.repeat(10)
const databaseUri = ['postgresql:', '//runtime@postgres.example.test:5432/linksites'].join('')
const orchestratorDatabaseUri = ['postgresql:', '//orchestrator@postgres.example.test:5432/linksites'].join('')
const image = (name, character) => `ghcr.io/linktrend/linksites-${name}@sha256:${character.repeat(64)}`
const base = {
  LINKSITES_DEPLOYMENT_ENV: 'production',
  LINKSITES_CONFIG_SCHEMA_VERSION: CONFIG_SCHEMA_VERSION,
  LINKSITES_RELEASE_SHA: 'f'.repeat(40),
  LINKSITES_ORG_ID: 'linksites-test',
  LINKSITES_AUTOWORK_MODE: 'manual',
  LINKSITES_PLATFORM_STATE: 'pending',
  LINKSITES_HARNESS_COMMIT: HARNESS_RELEASE_PIN.commit,
  LINKSITES_HARNESS_TREE: HARNESS_RELEASE_PIN.tree,
  LINKSITES_HARNESS_RANGE: HARNESS_RELEASE_PIN.compatibleRange,
  LINKSITES_PROFILE_ID: PROFILE_RELEASE_PIN.id,
  LINKSITES_PROFILE_VERSION: PROFILE_RELEASE_PIN.version,
  LINKSITES_CMS_IMAGE: image('cms', '1'),
  LINKSITES_WEB_MASTER_IMAGE: image('web-master', '2'),
  LINKSITES_WORKER_IMAGE: image('autowork-worker', '4'),
  LINKSITES_ORCHESTRATOR_IMAGE: image('program-orchestrator', '3'),
  LINKSITES_MIGRATIONS_IMAGE: image('migrations', '5'),
  DATABASE_URI: databaseUri,
  W2_02_DATABASE_URI: orchestratorDatabaseUri,
  PAYLOAD_SECRET: secret,
  PAYLOAD_PUBLIC_SERVER_URL: 'https://cms.example.test',
  LINKAUTOWORK_OUTBOX_PATH: '/var/lib/linksites/outbox.json',
  LINKAUTOWORK_OUTBOX_INTEGRITY_SECRET: secret,
  LINKSITES_TEMPLATE_RELEASE_STATE: 'deferred',
  LINKSITES_TEMPLATE_FORMAT: 'revision2',
  LINKSITES_TEMPLATE_ID: 'master-template-type-1',
  LINKSITES_TEMPLATE_VERSION: '2.0.0-a1.1',
  LINKSITES_LINKLIBRARIES_ROOT: '/var/lib/linksites/linklibraries',
  LINKSITES_LINKLIBRARIES_COMMIT_SHA: 'd'.repeat(40),
  LINKSITES_LINKLIBRARIES_TREE_SHA: 'e'.repeat(40),
  LINKSITES_LINKLIBRARIES_DEPENDENCY_LOCK_SHA256: 'f'.repeat(64),
  LINKSITES_LINKLIBRARIES_RECEIPT_PATH: '/var/lib/linksites/linklibraries/receipt.json',
  NEXT_PUBLIC_CMS_PROVIDER: 'payload',
  PAYLOAD_BASE_URL: 'https://cms.example.test',
  NEXT_PUBLIC_PAYLOAD_API_URL: 'https://cms.example.test',
  PAYLOAD_API_KEY: secret,
  PREVIEW_ACCESS_TOKEN: secret,
  W2_02_MODE: 'production',
  W2_02_ORG_ID: '00000000-0000-4000-8000-000000000001',
  W2_02_SITE_ID: '00000000-0000-4000-8000-000000000002',
  W2_02_DATABASE_ROLE: 'svc_linksites_runtime',
  W2_02_APPROVED_FACTS_PATH: '/var/lib/linksites/approved-facts.json',
  W2_02_POSTGRES_ADAPTER_MODULE: '@linksites/program-orchestrator/postgres-adapter',
  W2_02_EXECUTION_REVISION: 'f'.repeat(40),
  W2_02_EXECUTABLE_CHECKPOINT: 'e'.repeat(64),
  W2_02_STATE_DIR: '/var/lib/linksites/program',
  W2_02_PAYLOAD_BASE_URL: 'https://cms.example.test',
  W2_02_PAYLOAD_API_KEY: secret,
  W2_02_PAYLOAD_SITE_ID: '42',
  W2_02_WEB_MASTER_BASE_URL: 'https://preview.example.test',
  W2_02_PREVIEW_ACCESS_TOKEN: secret,
  W2_05_OUTCOME_GATEWAY_SECRET: secret,
  W2_05_OUTCOME_GATEWAY_KEY_ID: 'linksites-production',
  W2_02_LIBRARY_REPOSITORY_PATH: '/var/lib/linksites/linklibraries',
  W2_02_LIBRARY_COMMIT_SHA: 'a'.repeat(40),
  W2_02_LIBRARY_CATALOG_SHA256: 'b'.repeat(64),
  W2_02_LIBRARY_ENTRY_SHA256: 'c'.repeat(64),
}

for (const service of ['cms', 'web-master', 'autowork-worker', 'program-orchestrator']) {
  test(`${service} accepts a complete production-shaped configuration`, () => assert.equal(validateRuntimeConfig(base, service).ok, true))
}
test('rejects a production localhost fallback', () => {
  const result = validateRuntimeConfig({ ...base, PAYLOAD_BASE_URL: 'http://localhost:3000' }, 'web-master')
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((error) => error.name === 'PAYLOAD_BASE_URL'))
})
test('rejects fixture mode and placeholders', () => {
  const result = validateRuntimeConfig({ ...base, NEXT_PUBLIC_CMS_PROVIDER: 'fixture', PAYLOAD_API_KEY: 'x' }, 'web-master')
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((error) => error.name === 'NEXT_PUBLIC_CMS_PROVIDER'))
  assert.ok(result.errors.some((error) => error.name === 'PAYLOAD_API_KEY'))
})

test('rejects preview token drift between web-master and orchestrator interfaces', () => {
  const result = validateRuntimeConfig({ ...base, W2_02_PREVIEW_ACCESS_TOKEN: 'x' }, 'web-master')
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((error) => error.name === 'PREVIEW_ACCESS_TOKEN'))
})

for (const state of [undefined, 'pending', 'unknown', 'quarantined']) {
  test(`operational services reject ${state ?? 'missing'} template release state`, () => {
    const environment = { ...base }
    if (state === undefined) delete environment.LINKSITES_TEMPLATE_RELEASE_STATE
    else environment.LINKSITES_TEMPLATE_RELEASE_STATE = state
    for (const service of ['web-master', 'program-orchestrator']) {
      const result = validateRuntimeConfig(environment, service)
      assert.equal(result.ok, false, `${service} must reject ${state ?? 'missing'}`)
      assert.ok(result.errors.some((error) => error.name === 'LINKSITES_TEMPLATE_RELEASE_STATE'))
    }
  })
}

test('ready template release requires a valid native v2 receipt', () => {
  const result = validateRuntimeConfig({ ...base, LINKSITES_TEMPLATE_RELEASE_STATE: 'ready' }, 'web-master')
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((error) => error.name === 'LINKSITES_TEMPLATE_RELEASE_RECEIPT_JSON'))
})

test('ready template release rejects a legacy v1 receipt before mounted binding', () => {
  const result = validateRuntimeConfig({
    ...base,
    LINKSITES_TEMPLATE_RELEASE_STATE: 'ready',
    LINKSITES_TEMPLATE_RELEASE_RECEIPT_JSON: JSON.stringify({ schemaVersion: 1, receiptType: 'consumption', entryId: base.LINKSITES_TEMPLATE_ID, version: base.LINKSITES_TEMPLATE_VERSION }),
  }, 'web-master')
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((error) => error.name === 'LINKSITES_TEMPLATE_RELEASE_RECEIPT_JSON' && error.error.includes('Revision 2 schema 2.2')))
})

test('deferred template release rejects legacy v1 admission inputs', () => {
  const result = validateRuntimeConfig({ ...base, LINKSITES_ADMITTED_TEMPLATE_SHA: 'a'.repeat(40) }, 'web-master')
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((error) => error.name === 'LINKSITES_ADMITTED_TEMPLATE_SHA'))
})

test('deferred template release rejects provider admission receipt evidence', () => {
  const result = validateRuntimeConfig({ ...base, LINKSITES_TEMPLATE_RELEASE_RECEIPT_JSON: JSON.stringify({ schemaVersion: 2 }) }, 'web-master')
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((error) => error.name === 'LINKSITES_TEMPLATE_RELEASE_RECEIPT_JSON'))
})

test('deferred operational services do not require provider checkout, root, lock, or receipt mounts', () => {
  const environment = { ...base }
  for (const name of ['LINKSITES_LINKLIBRARIES_ROOT', 'LINKSITES_LINKLIBRARIES_COMMIT_SHA', 'LINKSITES_LINKLIBRARIES_TREE_SHA', 'LINKSITES_LINKLIBRARIES_DEPENDENCY_LOCK_SHA256', 'LINKSITES_LINKLIBRARIES_RECEIPT_PATH', 'W2_02_LIBRARY_REPOSITORY_PATH']) delete environment[name]
  for (const service of ['web-master', 'program-orchestrator']) assert.equal(validateRuntimeConfig(environment, service).ok, true, service)
})

test('accepts a valid first numeric Payload document ID and rejects an invalid one', () => {
  assert.equal(validateRuntimeConfig({ ...base, W2_02_PAYLOAD_SITE_ID: '1' }, 'program-orchestrator').ok, true)
  const result = validateRuntimeConfig({ ...base, W2_02_PAYLOAD_SITE_ID: '0' }, 'program-orchestrator')
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((error) => error.name === 'W2_02_PAYLOAD_SITE_ID'))
})

test('configuration reference documents every executable runtime name', async () => {
  const reference = await readFile(new URL('../config/README.md', import.meta.url), 'utf8')
  for (const requirement of Object.values(SERVICE_CONFIGURATION).flat()) assert.ok(reference.includes(`\`${requirement.name}\``), requirement.name)
})

test('manual Autowork rejects live gateway or admission fields', () => {
  const result = validateRuntimeConfig({ ...base, LINKAUTOWORK_GATEWAY_URL: 'https://autowork.example.test' }, 'cms')
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((error) => error.name === 'LINKAUTOWORK_GATEWAY_URL'))
})

test('live Autowork requires an exact handoff and key reference', () => {
  const live = {
    ...base,
    LINKSITES_AUTOWORK_MODE: 'live',
    LINKAUTOWORK_GATEWAY_URL: 'https://autowork.example.test',
    LINKAUTOWORK_SIGNING_SECRET: secret,
    LINKAUTOWORK_SIGNING_KEY_ID: 'linksites-production',
    LINKAUTOWORK_ENVIRONMENT: 'production',
    LINKAUTOWORK_EVENT_GRANTS: JSON.stringify([{ eventName: 'demo.completed', environments: ['production'], orgIds: ['linksites-test'] }]),
    LINKAUTOWORK_ISSUER: 'linkplatform-issuer',
    LINKAUTOWORK_AUDIENCE: 'linksites',
    LINKAUTOWORK_RECEIPT_CONTRACT: '2026-08-13.v1',
  }
  assert.equal(validateRuntimeConfig(live, 'cms').ok, true)
  const secretRef = validateRuntimeConfig({ ...live, LINKAUTOWORK_SIGNING_KEY_ID: 'ltfx-not-a-reference' }, 'cms')
  assert.equal(secretRef.ok, false)
})

test('pending Platform state rejects a fake applied SHA', () => {
  const result = validateRuntimeConfig({ ...base, LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA: 'a'.repeat(40) }, 'cms')
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((error) => error.name === 'LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA'))
})

test('ready Platform state requires the applied SHA and distinct database credentials', () => {
  const ready = { ...base, LINKSITES_PLATFORM_STATE: 'ready', LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA: '6'.repeat(40) }
  assert.equal(validateRuntimeConfig(ready, 'cms').ok, true)
  const same = validateRuntimeConfig({ ...ready, W2_02_DATABASE_URI: databaseUri }, 'program-orchestrator')
  assert.equal(same.ok, false)
  assert.ok(same.errors.some((error) => error.name === 'W2_02_DATABASE_URI'))
})

test('mutable image tags are rejected', () => {
  const result = validateRuntimeConfig({ ...base, LINKSITES_CMS_IMAGE: 'ghcr.io/linktrend/linksites-cms:latest' }, 'cms')
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((error) => error.name === 'LINKSITES_CMS_IMAGE'))
})

test('Harness and Profile pins match the admitted source pin module', async () => {
  const pin = await readFile(new URL('../../packages/linkharness-profile/src/pin.ts', import.meta.url), 'utf8')
  assert.ok(pin.includes(`commit: "${HARNESS_RELEASE_PIN.commit}"`))
  assert.ok(pin.includes(`tree: "${HARNESS_RELEASE_PIN.tree}"`))
  assert.ok(pin.includes(`id: "${PROFILE_RELEASE_PIN.id}"`))
  assert.ok(pin.includes(`version: "${PROFILE_RELEASE_PIN.version}"`))
})
