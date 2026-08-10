#!/usr/bin/env node
/**
 * Disposable W2-07 Compose-proof bootstrap only.
 *
 * The production image never derives template-admission inputs from a local
 * file.  In this isolated proof, `payload-seed` first creates the exact
 * factory-catalog consumption receipt/evidence that seeded the disposable
 * Payload site.  This launcher passes that verified pair to the ordinary
 * web-master entrypoint so the rendered preview proves the real admission
 * boundary instead of a fabricated environment value.
 */
import { spawn } from 'node:child_process'
import { readFile } from 'node:fs/promises'

if (process.env.LINKSITES_LOCAL_COMPOSE_PROOF !== '1') {
  console.error('local-proof web-master launcher refuses non-proof execution')
  process.exit(78)
}

const seedPath = process.env.W2_04_PROOF_PATH ?? '/var/lib/linksites/seed.json'
let seed
try {
  seed = JSON.parse(await readFile(seedPath, 'utf8'))
} catch {
  console.error('local-proof web-master launcher could not read the seeded admission evidence')
  process.exit(78)
}

if (!seed || typeof seed !== 'object' || !('receipt' in seed) || !('evidence' in seed)) {
  console.error('local-proof web-master launcher received an incomplete seeded admission proof')
  process.exit(78)
}

const child = spawn(process.execPath, [
  '/app/deploy/scripts/entrypoint.mjs',
  'web-master',
  'node',
  'apps/web-master/server.js',
], {
  stdio: 'inherit',
  env: {
    ...process.env,
    LINKSITES_W2_04_LOCAL_PROOF: '1',
    LINKSITES_ADMITTED_TEMPLATE_RECEIPT_JSON: JSON.stringify(seed.receipt),
    LINKSITES_ADMITTED_TEMPLATE_EVIDENCE_JSON: JSON.stringify(seed.evidence),
  },
})

const forward = (signal) => child.kill(signal)
process.once('SIGTERM', () => forward('SIGTERM'))
process.once('SIGINT', () => forward('SIGINT'))
child.once('exit', (code, signal) => { process.exitCode = code ?? (signal ? 1 : 0) })
