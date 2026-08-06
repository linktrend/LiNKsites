#!/usr/bin/env node
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { cp, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const source = resolve(new URL('../fixtures/recovery', import.meta.url).pathname)
const rehearsalRoot = await mkdtemp(join(tmpdir(), 'linksites-w2-07-restore-'))
const backup = join(rehearsalRoot, 'backup')
const restored = join(rehearsalRoot, 'restored')
const evidenceOutput = process.argv.includes('--evidence') ? resolve(process.cwd(), process.argv[process.argv.indexOf('--evidence') + 1] ?? '') : null
const files = ['certified-site.json', 'working-content.json', 'ledger-evidence.json', 'media-manifest.json']
const checksum = async (file) => createHash('sha256').update(await readFile(file)).digest('hex')

try {
  // The source fixture stands in for the four durable backup classes. The
  // entire rehearsal happens in a new temporary directory, not in a running
  // repository, container, cloud account, or customer data store.
  await cp(source, backup, { recursive: true, errorOnExist: true })
  const backupChecksums = Object.fromEntries(await Promise.all(files.map(async (file) => [file, await checksum(join(backup, file))])))
  await cp(backup, restored, { recursive: true, errorOnExist: true })
  for (const file of files) {
    assert.equal(await stat(join(restored, file)).then(() => true), true, `${file} is restored`)
    assert.equal(await checksum(join(restored, file)), backupChecksums[file], `${file} checksum matches backup`)
  }
  const site = JSON.parse(await readFile(join(restored, 'certified-site.json'), 'utf8'))
  const ledger = JSON.parse(await readFile(join(restored, 'ledger-evidence.json'), 'utf8'))
  assert.equal(site.status, 'draft', 'restored certified site remains private/draft')
  assert.equal(ledger.completion, 'emitted', 'restored certified run evidence is present')
  const server = createServer((request, response) => {
    if (request.url !== '/private-preview') { response.writeHead(404).end(); return }
    response.writeHead(200, { 'content-type': 'application/json', 'x-robots-tag': 'noindex, nofollow' })
    response.end(JSON.stringify({ title: site.title, runMarker: site.runMarker, status: site.status }))
  })
  await new Promise((resolveListen) => server.listen(0, '127.0.0.1', resolveListen))
  const address = server.address()
  assert.ok(address && typeof address === 'object')
  const response = await fetch(`http://127.0.0.1:${address.port}/private-preview`)
  const rendered = await response.json()
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow')
  assert.equal(rendered.runMarker, site.runMarker)
  await new Promise((resolveClose) => server.close(resolveClose))
  const receipt = { schemaVersion: '1.0.0', rehearsal: 'local-fixture-recovery', environment: 'disposable-local-only', backupChecksums, restoredFiles: files, servedPrivateDraft: true, publicActivation: false, credentialsPersisted: false }
  if (evidenceOutput) await writeFile(evidenceOutput, `${JSON.stringify(receipt, null, 2)}\n`)
  console.log(JSON.stringify(receipt))
} finally {
  await rm(rehearsalRoot, { recursive: true, force: true })
}
