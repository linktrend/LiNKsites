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
  LINKSITES_ADMITTED_TEMPLATE_LIBRARY_PATH: '/var/lib/linksites/linklibraries',
  LINKSITES_ADMITTED_TEMPLATE_SHA: 'a'.repeat(40),
  LINKSITES_ADMITTED_TEMPLATE_RECEIPT_JSON: JSON.stringify({ receipt: 'fixture' }),
  LINKSITES_ADMITTED_TEMPLATE_EVIDENCE_JSON: JSON.stringify({ evidence: 'fixture' }),
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
