import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
// The repository's Chromium test dependency is owned by the CMS proof lane;
// this disposable cross-app proof intentionally does not add a second runtime
// dependency just to launch the already-installed browser.
const { chromium } = await import('../../cms/node_modules/playwright/lib/index.js') as typeof import('playwright')
import { createLocalConfig, createProductionComposition } from '../src/composition.ts'

const required = (name: string): string => {
  const value = process.env[name]
  assert.ok(value, `missing ${name}`)
  return value
}

const stateDir = required('W2_02_STATE_DIR')
const cmsUrl = required('W2_02_PAYLOAD_BASE_URL')
const webUrl = required('W2_02_WEB_MASTER_BASE_URL')
const apiKey = required('W2_02_PAYLOAD_API_KEY')
const siteId = required('W2_02_PAYLOAD_SITE_ID')
const previewToken = required('W2_02_PREVIEW_ACCESS_TOKEN')
const chromiumPath = required('W2_02_CHROMIUM_EXECUTABLE')
const artifactPath = required('W2_02_ARTIFACT_PATH')
const leadId = 'w2-02-private-local'

await mkdir(stateDir, { recursive: true })
const config = {
  ...createLocalConfig(stateDir), payloadBaseUrl: cmsUrl, payloadApiKey: apiKey,
  payloadSiteId: siteId, webMasterBaseUrl: webUrl, previewAccessToken: previewToken,
}
await writeFile(config.approvedFactsPath, JSON.stringify({ schemaVersion: { major: 1, minor: 0 }, orgId: 'local-org', leadId, businessName: 'W2-02 Local Services', geography: 'Taipei', services: ['Local service consultation'], credentials: ['Founder-provided credentials'], reviews: [{ quote: 'Founder-provided review', author: 'Approved customer' }], contact: { phone: '+886200000000', email: 'local@example.invalid', address: 'Taipei, Taiwan', website: 'https://local.invalid.test' }, pricing: 'Contact for an approved quote', legalClaims: ['Founder-approved legal copy'], media: [] }))
const composition = await createProductionComposition(config)
try {
  assert.equal((await composition.runtime.health()).readiness, true, 'real services must be reachable before orchestration')
  await composition.runtime.runLead({ schema_version: { major: 1, minor: 0 }, org_id: 'local-org', correlation_id: 'w2-02-real-service-proof', idempotency_key: 'w2-02-real-service-proof', lead_id: leadId, requested_vertical: 'home_services', source: 'manual-file', research: { summary: 'Disposable local real-service proof.', sources: ['source:founder:brief'] } })
  const ledger = await composition.runtime.exportState() as { program: { state: string }; issues: Array<{ state: string }>; outbox: Array<{ status: string }>; persistedEvidence: unknown[] }
  assert.equal(ledger.program.state, 'completed')
  assert.equal(ledger.issues.length, 16)
  assert.ok(ledger.issues.every((issue) => issue.state === 'completed'))
  assert.deepEqual(ledger.outbox.map((item) => item.status), ['delivered'])
  const privateRecords = await fetch(`${cmsUrl}/api/pages?site=${encodeURIComponent(siteId)}&where[previewEnvironment][equals]=private-preview`, { headers: { Authorization: `users API-Key ${apiKey}` } }).then(async (response) => { assert.equal(response.status, 200); return response.json() as Promise<{ docs: Array<{ id: string }> }> })
  assert.ok(privateRecords.docs.length > 0, 'authenticated Payload readback must contain the private records')
  const anonymous = await fetch(`${cmsUrl}/api/pages?site=${encodeURIComponent(siteId)}&where[previewEnvironment][equals]=private-preview`).then(async (response) => ({ status: response.status, text: await response.text() }))
  assert.ok(anonymous.status === 403 || !/W2-02 Local Services/.test(anonymous.text), 'anonymous Payload must not expose the private records')
  const browser = await chromium.launch({ headless: true, executablePath: chromiumPath })
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
    const denied = await page.goto(`${webUrl}/en/demo/not-the-token`, { waitUntil: 'domcontentloaded' })
    assert.equal(denied?.status(), 404)
    const allowed = await page.goto(`${webUrl}/en/demo/${encodeURIComponent(previewToken)}`, { waitUntil: 'domcontentloaded' })
    assert.equal(allowed?.status(), 200)
    assert.match(allowed?.headers()['x-robots-tag'] ?? '', /noindex/)
    assert.match(allowed?.headers()['cache-control'] ?? '', /no-store/)
    assert.equal(await page.locator('[data-private-preview="true"]').count(), 1)
  } finally { await browser.close() }
  const proof = { scope: 'disposable local actual Payload plus optimized web-master plus Chromium', issues: 16, serviceReceipts: ledger.persistedEvidence.length, payloadReadback: privateRecords.docs.length, privateOnly: true, browserGates: true, completionOutbox: 'delivered', publicActivation: false, tokenBearingUrlsPersisted: false }
  await writeFile(artifactPath, `${JSON.stringify(proof, null, 2)}\n`)
  assert.equal(/token|previewToken|apiKey/i.test(await readFile(artifactPath, 'utf8')), false, 'sanitized receipt must contain no credentials')
  process.stdout.write(`W2-02 real local vertical slice: ${JSON.stringify(proof)}\n`)
} finally { await composition.close() }
