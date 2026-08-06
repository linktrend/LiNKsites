import assert from 'node:assert/strict'
import test from 'node:test'
import { CONFIG_SCHEMA_VERSION, SERVICE_CONFIGURATION, validateRuntimeConfig } from '../config/runtime-contract.mjs'
import { readFile } from 'node:fs/promises'

const secret = 'aB9!'.repeat(10)
const base = {
  LINKSITES_DEPLOYMENT_ENV: 'production',
  LINKSITES_CONFIG_SCHEMA_VERSION: CONFIG_SCHEMA_VERSION,
  LINKSITES_RELEASE_SHA: 'f'.repeat(40),
  LINKSITES_ORG_ID: 'linksites-test',
  DATABASE_URI: 'postgresql://runtime:password@postgres.example.test:5432/linksites',
  PAYLOAD_SECRET: secret,
  PAYLOAD_PUBLIC_SERVER_URL: 'https://cms.example.test',
  LINKAUTOWORK_GATEWAY_URL: 'https://autowork.example.test',
  LINKAUTOWORK_SIGNING_SECRET: secret,
  LINKAUTOWORK_SIGNING_KEY_ID: 'linksites-production',
  LINKAUTOWORK_ENVIRONMENT: 'production',
  LINKAUTOWORK_OUTBOX_PATH: '/var/lib/linksites/outbox.json',
  LINKAUTOWORK_OUTBOX_INTEGRITY_SECRET: secret,
  LINKAUTOWORK_EVENT_GRANTS: JSON.stringify([{ eventName: 'demo.completed', environments: ['production'], orgIds: ['linksites-test'] }]),
  NEXT_PUBLIC_CMS_PROVIDER: 'payload',
  PAYLOAD_BASE_URL: 'https://cms.example.test',
  NEXT_PUBLIC_PAYLOAD_API_URL: 'https://cms.example.test',
  PAYLOAD_API_KEY: secret,
  W2_02_MODE: 'local',
  W2_02_ORG_ID: 'linksites-test',
  W2_02_EXECUTION_REVISION: 'f'.repeat(40),
  W2_02_EXECUTABLE_CHECKPOINT: 'e'.repeat(64),
  W2_02_STATE_DIR: '/var/lib/linksites/program',
  W2_02_PAYLOAD_BASE_URL: 'https://cms.example.test',
  W2_02_PAYLOAD_API_KEY: secret,
  W2_02_PAYLOAD_SITE_ID: 'site-test',
  W2_02_WEB_MASTER_BASE_URL: 'https://preview.example.test',
  W2_02_PREVIEW_ACCESS_TOKEN: secret,
  W2_05_OUTCOME_GATEWAY_SECRET: secret,
  W2_05_OUTCOME_GATEWAY_KEY_ID: 'linksites-production',
  W2_02_LIBRARY_REPOSITORY_PATH: '/var/lib/linksites/linklibraries',
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
  const result = validateRuntimeConfig({ ...base, NEXT_PUBLIC_CMS_PROVIDER: 'fixture', PAYLOAD_API_KEY: 'replace-me' }, 'web-master')
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((error) => error.name === 'NEXT_PUBLIC_CMS_PROVIDER'))
  assert.ok(result.errors.some((error) => error.name === 'PAYLOAD_API_KEY'))
})

test('configuration reference documents every executable runtime name', async () => {
  const reference = await readFile(new URL('../config/README.md', import.meta.url), 'utf8')
  for (const requirement of Object.values(SERVICE_CONFIGURATION).flat()) assert.ok(reference.includes(`\`${requirement.name}\``), requirement.name)
})
