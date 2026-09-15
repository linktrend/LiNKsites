/**
 * Issue 549: bind the protected LiNKlibraries marketing-smb-v1 consumer bundle.
 *
 * Loads only copied metadata (not provider implementation source). Production
 * selection remains fail-closed: Library-local selectable is not LiNKsites
 * renderer, Payload, deployment, or production admission.
 */
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  ExactProviderAdoptionError,
  LSFACT01_PROTECTED_MARKETING_SMB,
  sealExactProviderHandoff,
  type ExactProviderHandoff,
} from './exactProviderAdoption.ts'

const BUNDLE_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../docs/end-to-end-delivery/upstreams/linklibraries',
  LSFACT01_PROTECTED_MARKETING_SMB.commit,
)

function sha256Utf8(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex')
}

function readCopied(relativePath: string, expectedSha256: string): string {
  const bytes = readFileSync(resolve(BUNDLE_ROOT, relativePath), 'utf8')
  const digest = sha256Utf8(bytes)
  if (digest !== expectedSha256) {
    throw new ExactProviderAdoptionError(
      `Copied ${relativePath} digest ${digest} does not match the protected identity.`,
      'tampered',
    )
  }
  return bytes
}

export function loadProtectedMarketingSmbHandoff(): ExactProviderHandoff {
  const pin = LSFACT01_PROTECTED_MARKETING_SMB
  const entryBytes = readCopied('entries/marketing-smb-v1/entry.json', pin.entryJsonSha256)
  const catalogBytes = readCopied('indexes/catalog.json', pin.catalogSha256)
  const schemaBytes = readCopied(
    'entries/marketing-smb-v1/content/content.schema.json',
    pin.contentSchemaSha256,
  )
  const entry = JSON.parse(entryBytes) as { entryId?: string; state?: string; selectable?: boolean }
  if (entry.entryId !== 'marketing-smb-v1' || entry.state !== 'usable' || entry.selectable !== true) {
    throw new ExactProviderAdoptionError(
      'Protected marketing-smb-v1 entry is not Library-local selectable on the copied bytes.',
      'lifecycle_denied',
    )
  }
  const catalog = JSON.parse(catalogBytes) as { entries?: Array<{ entryId?: string; selectable?: boolean; state?: string }> }
  const record = catalog.entries?.find((item) => item.entryId === 'marketing-smb-v1')
  if (!record || record.selectable !== true || record.state !== 'usable') {
    throw new ExactProviderAdoptionError(
      'Protected catalog record is not Library-local selectable.',
      'lifecycle_denied',
    )
  }
  return sealExactProviderHandoff({
    family: 'marketing-smb-v1',
    version: 'marketing-smb-v1',
    producer: { repository: pin.repository, commit: pin.commit, tree: pin.tree },
    pinCommit: pin.commit,
    pinTree: pin.tree,
    files: [
      { path: 'entry.json', bytes: entryBytes },
      { path: 'indexes/catalog.json', bytes: catalogBytes },
      { path: 'content/content.schema.json', bytes: schemaBytes },
    ],
    dependencyLock: { packages: [], services: [] },
  })
}
