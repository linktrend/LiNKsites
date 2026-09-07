#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo 'usage: deploy/scripts/preflight.sh <protected-runtime-env-file> <release-manifest.json>' >&2
  exit 64
fi
runtime_env="$1"
manifest="$2"
[[ -f "$runtime_env" ]] || { echo 'runtime environment file is absent' >&2; exit 78; }
[[ -f "$manifest" ]] || { echo 'release manifest is absent' >&2; exit 78; }
set -a
# shellcheck disable=SC1090
source "$runtime_env"
set +a
for service in cms web-master autowork-worker program-orchestrator; do
  node deploy/scripts/validate-runtime-config.mjs "$service"
done
node --input-type=module - "$manifest" <<'NODE'
import { readFile } from 'node:fs/promises'
import { stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
const manifest = JSON.parse(await readFile(process.argv[2], 'utf8'))
if (!['deferred', 'ready'].includes(manifest.libraries?.state) || manifest.libraries?.entryId !== 'master-template-type-1') throw new Error('manifest must carry an explicit native v2 template release state')
if (manifest.libraries.state === 'deferred' && (manifest.libraries.publishingEligible !== false || !manifest.libraries.blockedCapabilities?.includes('template-dependent-publishing'))) throw new Error('deferred template release must block template-dependent publishing')
if (manifest.libraries.state === 'ready' && manifest.libraries.publishingEligible !== true) throw new Error('ready template release must explicitly enable publishing only after native v2 admission')
if (manifest.platform?.state !== 'ready' || !/^[a-f0-9]{40}$/i.test(manifest.platform.migrationsAppliedSha ?? '')) throw new Error('operational acceptance requires an exact admitted Platform migration SHA')
const checksum = async (file) => createHash('sha256').update(await readFile(resolve(process.cwd(), file))).digest('hex')
const cmsDatabase = new URL(process.env.DATABASE_URI)
const orchestratorDatabase = new URL(process.env.W2_02_DATABASE_URI)
const databaseIdentity = (url) => `${url.protocol}//${url.hostname}:${url.port || '5432'}/${url.username}`
if (databaseIdentity(cmsDatabase) === databaseIdentity(orchestratorDatabase)) throw new Error('CMS and orchestrator database host credentials must be distinct')
if (manifest.repository?.releaseSha !== process.env.LINKSITES_RELEASE_SHA) throw new Error('manifest release SHA does not equal runtime release SHA')
const imageBindings = {
  LINKSITES_CMS_IMAGE: manifest.images?.cms,
  LINKSITES_WEB_MASTER_IMAGE: manifest.images?.webMaster,
  LINKSITES_WORKER_IMAGE: manifest.images?.autoworkWorker,
  LINKSITES_ORCHESTRATOR_IMAGE: manifest.images?.orchestrator,
  LINKSITES_MIGRATIONS_IMAGE: manifest.images?.migrations,
}
for (const [name, digest] of Object.entries(imageBindings)) {
  const actual = process.env[name]
  if (!/^sha256:[a-f0-9]{64}$/i.test(digest ?? '')) throw new Error(`manifest image ${name} is missing or mutable`)
  if (!/^.+@sha256:[a-f0-9]{64}$/i.test(actual ?? '')) throw new Error(`${name} must be an immutable name@sha256 reference`)
  if (actual.split('@')[1].toLowerCase() !== digest.toLowerCase()) throw new Error(`${name} digest does not match the release manifest`)
}
const required = ['TRAEFIK_NETWORK', 'TRAEFIK_ENTRYPOINT', 'TRAEFIK_CMS_HOST', 'TRAEFIK_PREVIEW_HOST', 'TRAEFIK_CMS_PRIVATE_MIDDLEWARE', 'TRAEFIK_PREVIEW_PRIVATE_MIDDLEWARE']
for (const name of required) if (!process.env[name]?.trim() || /<|replace|example|todo/i.test(process.env[name])) throw new Error(`${name} is missing or a placeholder`)
for (const name of ['LINKSITES_RUNTIME_ENV_FILE', 'LINKLIBRARIES_ARTIFACT_PATH']) {
  const value = process.env[name]
  if (!value?.startsWith('/')) throw new Error(`${name} must be an absolute host path`)
  const details = await stat(value).catch(() => null)
  if (!details) throw new Error(`${name} does not exist on the deployment host`)
  if (name === 'LINKLIBRARIES_ARTIFACT_PATH' && !details.isDirectory()) throw new Error(`${name} must be a directory`)
}
if (manifest.platform?.migrationsAppliedSha !== process.env.LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA) throw new Error('platform migration SHA does not match the release manifest')
const migrationRows = manifest.schemas?.supabaseMigrations
if (!Array.isArray(migrationRows) || migrationRows.length === 0) throw new Error('manifest has no Supabase migration identity')
for (const row of migrationRows) if (await checksum(`supabase/migrations/${row.file}`) !== row.sha256) throw new Error(`Supabase migration source checksum mismatch: ${row.file}`)
const payloadIndex = manifest.schemas?.payloadMigrationIndex
if (!payloadIndex || await checksum(payloadIndex.file) !== payloadIndex.sha256) throw new Error('Payload migration index checksum does not match the release manifest')
for (const row of manifest.schemas?.payloadMigrations ?? []) if (await checksum(row.file) !== row.sha256) throw new Error(`Payload migration source checksum mismatch: ${row.file}`)
const library = manifest.libraries
const artifact = process.env.LINKLIBRARIES_ARTIFACT_PATH
const git = (args) => execFileSync('git', ['-C', artifact, ...args], { encoding: 'utf8' }).trim()
if (!artifact || git(['rev-parse', '--is-inside-work-tree']) !== 'true') throw new Error('LINKLIBRARIES_ARTIFACT_PATH is not a Git working tree')
if (git(['rev-parse', 'HEAD']) !== library.providerCommitSha || git(['rev-parse', 'HEAD^{tree}']) !== library.providerTreeSha) throw new Error('native v2 provider checkout identity does not match the release manifest')
if (process.env.LINKSITES_LINKLIBRARIES_COMMIT_SHA !== library.providerCommitSha || process.env.LINKSITES_LINKLIBRARIES_TREE_SHA !== library.providerTreeSha) throw new Error('native v2 provider identity does not match the release manifest')
if (library.state === 'ready') {
  const receiptRaw = process.env.LINKSITES_TEMPLATE_RELEASE_RECEIPT_JSON
  if (!receiptRaw || createHash('sha256').update(receiptRaw).digest('hex') !== library.receiptSha256) throw new Error('native v2 provider receipt does not match the release manifest')
} else if (process.env.LINKSITES_TEMPLATE_RELEASE_RECEIPT_JSON) {
  throw new Error('deferred template release must not carry provider admission receipt evidence')
}
NODE
docker compose --env-file "$runtime_env" -f deploy/docker-compose.deploy.yml config --quiet
echo 'LiNKsites Phase 2 preflight passed; this command performed no deployment.'
