import assert from 'node:assert/strict'
import test from 'node:test'
import { CONFIG_SCHEMA_VERSION, SERVICE_CONFIGURATION, validateRuntimeConfig } from '../config/runtime-contract.mjs'
import { readFile } from 'node:fs/promises'

const secret = 'aB9!'.repeat(10)
const databaseUri = ['postgresql:', '//runtime@postgres.example.test:5432/linksites'].join('')
const orchestratorDatabaseUri = ['postgresql:', '//orchestrator@postgres.example.test:5432/linksites'].join('')
const base = {
  LINKSITES_DEPLOYMENT_ENV: 'production',
  LINKSITES_CONFIG_SCHEMA_VERSION: CONFIG_SCHEMA_VERSION,
  LINKSITES_RELEASE_SHA: 'f'.repeat(40),
  LINKSITES_ORG_ID: 'linksites-test',
  DATABASE_URI: databaseUri,
  W2_02_DATABASE_URI: orchestratorDatabaseUri,
  PAYLOAD_SECRET: secret,
  PAYLOAD_PUBLIC_SERVER_URL: 'https://cms.example.test',
  LINKAUTOWORK_GATEWAY_URL: 'https://autowork.example.test',
  LINKAUTOWORK_SIGNING_SECRET: secret,
  LINKAUTOWORK_SIGNING_KEY_ID: 'linksites-production',
  LINKAUTOWORK_ENVIRONMENT: 'production',
  LINKAUTOWORK_OUTBOX_PATH: '/var/lib/linksites/outbox.json',
  LINKAUTOWORK_OUTBOX_INTEGRITY_SECRET: secret,
  LINKAUTOWORK_EVENT_GRANTS: JSON.stringify([{ eventName: 'demo.completed', environments: ['production'], orgIds: ['linksites-test'] }]),
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
