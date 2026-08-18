import assert from 'node:assert/strict'
import { MASTER_TEMPLATE_PIN } from '../../../packages/factory-catalog/src/masterTemplatePin.ts'
import {
  assertProductionStillRejectsDraftMaster,
  runMasterTemplateCandidatePreview,
} from '../../../packages/factory-catalog/src/masterTemplatePreviewSeam.ts'

const webUrl = process.env.W2_04_WEB_URL
const token = process.env.PREVIEW_ACCESS_TOKEN
const titles = JSON.parse(process.env.LINKSITES_MASTER_TEMPLATE_PREVIEW_TITLES ?? '{}')

assert.ok(webUrl && token, 'Candidate preview browser environment is incomplete')
assertProductionStillRejectsDraftMaster()
const preview = runMasterTemplateCandidatePreview()
assert.equal(preview.productionSelectable, false)
assert.equal(preview.pinSha, MASTER_TEMPLATE_PIN.commitSha)

const expected = {
  home: titles.home ?? 'Northline',
  about: titles.about ?? 'About Northline',
  contact: titles.contact ?? 'Contact Northline',
}

const { chromium } = await import('playwright')
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.W2_04_CHROMIUM_EXECUTABLE || undefined,
})

const open = async (page, path, heading) => {
  const response = await page.goto(`${webUrl}${path}`, { waitUntil: 'domcontentloaded', timeout: 30_000 })
  assert.equal(response?.status(), 200, `${path} must render the private candidate preview`)
  const body = await page.locator('body').innerText()
  assert.match(body, new RegExp(heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  assert.equal(await page.locator('[data-production-selectable="false"]').count(), 1)
  assert.equal(await page.locator('[data-preview-seam="candidate-preview"]').count(), 1)
  assert.doesNotMatch(body, /dentist/i)
  return response
}

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  page.setDefaultTimeout(30_000)

  const missing = await page.goto(`${webUrl}/en/demo`, { waitUntil: 'domcontentloaded', timeout: 10_000 })
  assert.equal(missing?.status(), 404, 'missing preview token must be denied')

  const denied = await page.goto(`${webUrl}/en/demo/not-the-token`, { waitUntil: 'domcontentloaded', timeout: 10_000 })
  assert.equal(denied?.status(), 404, 'invalid preview token must be denied')

  await open(page, `/en/demo/${token}`, expected.home)
  await open(page, `/en/demo/${token}/about`, expected.about)
  await open(page, `/en/demo/${token}/contact`, expected.contact)
} finally {
  await browser.close()
}

console.log('Master template candidate preview browser proof: PASS')
console.log(`pin: ${MASTER_TEMPLATE_PIN.commitSha}`)
console.log('pages: Home / About / Contact loaded on /en/demo/<token>')
console.log('production: draft still rejected; no dentists; not a live website')
