import assert from 'node:assert/strict'
import { mkdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { chromium } from 'playwright'

const cmsUrl = process.env.W2_04_CMS_URL
const webUrl = process.env.W2_04_WEB_URL
const token = process.env.PREVIEW_ACCESS_TOKEN
const previewApiKey = process.env.W2_04_PREVIEW_API_KEY
const siteId = process.env.W2_04_SITE_ID
const artifactDir = process.env.W2_04_ARTIFACT_DIR

assert.ok(cmsUrl && webUrl && token && previewApiKey && siteId && artifactDir, 'W2-04 local proof environment is incomplete')
await mkdir(artifactDir, { recursive: true })

const publicUrl = `${cmsUrl}/api/pages?site=${encodeURIComponent(siteId)}&where[slug][equals]=home&where[status][equals]=published`
const anonymous = await fetch(publicUrl)
assert.equal(anonymous.status, 200, 'anonymous CMS REST should retain public published pages')
const anonymousJson = await anonymous.json()
assert.equal(anonymousJson.totalDocs, 1, 'anonymous CMS REST must not enumerate the private-preview record')
assert.match(JSON.stringify(anonymousJson), /A real published Payload page/)
assert.doesNotMatch(JSON.stringify(anonymousJson), /Private Payload preview|Only the token-gated route may render this record/)

const authorized = await fetch(publicUrl, { headers: { Authorization: `users API-Key ${previewApiKey}` } })
assert.equal(authorized.status, 200, 'governed server API key must be accepted by Payload')
const authorizedJson = await authorized.json()
assert.match(JSON.stringify(authorizedJson), /Private Payload preview/, 'authorized server path must retrieve private preview data')
const privateId = authorizedJson.docs.find((doc) => doc.previewEnvironment === 'private-preview')?.id
assert.ok(privateId, 'authorized CMS response must identify the private-preview record')
const anonymousPrivate = await fetch(`${cmsUrl}/api/pages/${privateId}?site=${encodeURIComponent(siteId)}`)
assert.ok([403, 404].includes(anonymousPrivate.status), 'anonymous CMS REST must not retrieve the private-preview record by ID')
assert.doesNotMatch(await anonymousPrivate.text(), /Private Payload preview|Only the token-gated route may render this record/)

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.W2_04_CHROMIUM_EXECUTABLE,
})
try {
  const desktop = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  desktop.setDefaultTimeout(30_000)
  console.error('W2-04 browser: public desktop navigation')
  const publicResponse = await desktop.goto(`${webUrl}/en`, { waitUntil: 'domcontentloaded', timeout: 30_000 })
  assert.equal(publicResponse?.status(), 200, 'public page must render through web-master')
  console.error('W2-04 browser: public heading')
  const publicHeading = desktop.getByRole('heading', { level: 1, name: 'A real published Payload page' })
  try {
    await publicHeading.waitFor({ timeout: 30_000 })
  } catch {
    throw new Error(`public CMS heading missing; rendered body: ${(await desktop.locator('body').innerText()).slice(0, 1000)}`)
  }
  assert.equal(await desktop.getByText('Private Payload preview').count(), 0, 'private content must not leak into the public render')
  console.error('W2-04 browser: public accessibility landmarks')
  await assert.doesNotReject(desktop.locator('main').waitFor({ timeout: 10_000 }), 'page must expose a main landmark')
  const unnamedLinks = await desktop.locator('a').evaluateAll((links) => links.filter((link) => !(link.textContent || '').trim() && !link.getAttribute('aria-label')).length)
  assert.equal(unnamedLinks, 0, 'rendered links must have an accessible name')
  await desktop.screenshot({ path: join(artifactDir, 'public-desktop.png'), fullPage: true })

  for (const [route, heading] of [
    ['/en/about', 'About Payload proof'],
    ['/en/services', 'Services Payload proof'],
    ['/en/contact', 'Contact Payload proof'],
    ['/en/legal/privacy-policy', 'Privacy Payload proof'],
    ['/en/legal/terms-of-use', 'Terms Payload proof'],
    ['/en/legal/cookie-policy', 'Cookie Payload proof'],
  ]) {
    const response = await desktop.goto(`${webUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 30_000 })
    assert.equal(response?.status(), 200, `${route} must render real published CMS content`)
    await desktop.getByRole('heading', { level: 1, name: heading }).waitFor({ timeout: 30_000 })
  }
  const missingPage = await desktop.goto(`${webUrl}/en/not-a-real-page`, { waitUntil: 'domcontentloaded', timeout: 30_000 })
  assert.ok([200, 404].includes(missingPage?.status() ?? 0), 'unknown public route must render the controlled not-found boundary')
  await desktop.getByRole('heading', { name: 'Page Not Found' }).waitFor({ timeout: 30_000 })
  assert.equal(await desktop.getByText('Private Payload preview').count(), 0, 'not-found rendering must not expose private content')

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } })
  mobile.setDefaultTimeout(30_000)
  console.error('W2-04 browser: public mobile navigation')
  await mobile.goto(`${webUrl}/en`, { waitUntil: 'domcontentloaded', timeout: 10_000 })
  await mobile.getByRole('heading', { level: 1, name: 'A real published Payload page' }).waitFor({ timeout: 30_000 })
  const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
  assert.equal(overflow, false, 'mobile viewport must not horizontally overflow')
  await mobile.screenshot({ path: join(artifactDir, 'public-mobile.png'), fullPage: true })
  assert.ok((await stat(join(artifactDir, 'public-desktop.png'))).size > 0, 'desktop visual artifact is empty')
  assert.ok((await stat(join(artifactDir, 'public-mobile.png'))).size > 0, 'mobile visual artifact is empty')

  console.error('W2-04 browser: missing token')
  const missing = await desktop.goto(`${webUrl}/en/demo`, { waitUntil: 'domcontentloaded', timeout: 10_000 })
  assert.equal(missing?.status(), 404, 'missing preview token must be denied')

  console.error('W2-04 browser: wrong token')
  const denied = await desktop.goto(`${webUrl}/en/demo/not-the-token`, { waitUntil: 'domcontentloaded', timeout: 10_000 })
  assert.equal(denied?.status(), 404, 'invalid preview token must be denied')
  assert.match(denied?.headers()['x-robots-tag'] ?? '', /noindex, nofollow/)
  assert.match(denied?.headers()['cache-control'] ?? '', /private, no-store/)

  console.error('W2-04 browser: valid token navigation')
  const allowed = await desktop.goto(`${webUrl}/en/demo/${token}`, { waitUntil: 'domcontentloaded', timeout: 10_000 })
  assert.equal(allowed?.status(), 200, 'valid preview token must render the private page')
  assert.match(allowed?.headers()['x-robots-tag'] ?? '', /noindex, nofollow/)
  assert.match(allowed?.headers()['cache-control'] ?? '', /private, no-store/)
  console.error('W2-04 browser: valid token heading')
  await assert.doesNotReject(desktop.getByRole('heading', { level: 1, name: 'Private Payload preview' }).waitFor({ timeout: 10_000 }))
} finally {
  await browser.close()
}

console.log('W2-04 local Payload/browser proof: PASS')
console.log('content: real disposable Payload REST record rendered by web-master')
console.log('privacy: invalid preview denied; valid preview noindex/nofollow/no-store; public render has no private content')
console.log('quality: heading/main/link-name checks plus desktop/mobile screenshot and no mobile horizontal overflow')
console.log('routes: home, about, services, contact, privacy, terms, cookie policy, and not-found verified against Payload')
