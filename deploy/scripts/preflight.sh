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
for (const row of migrationRows) if (await checksum(row.file) !== row.sha256) throw new Error(`Supabase migration source checksum mismatch: ${row.file}`)
const payloadIndex = manifest.schemas?.payloadMigrationIndex
if (!payloadIndex || await checksum(payloadIndex.file) !== payloadIndex.sha256) throw new Error('Payload migration index checksum does not match the release manifest')
for (const row of manifest.schemas?.payloadMigrations ?? []) if (await checksum(row.file) !== row.sha256) throw new Error(`Payload migration source checksum mismatch: ${row.file}`)
const library = manifest.libraries
if (!library?.catalogSha || !library?.entrySha || library.catalogSha !== library.entrySha) throw new Error('manifest must bind catalog and entry evidence to one exact LiNKlibraries commit')
if (library.catalogSha !== process.env.LINKLIBRARIES_CATALOG_SHA || library.entrySha !== process.env.LINKLIBRARIES_ENTRY_SHA) throw new Error('LiNKlibraries ref does not match the release manifest')
if (process.env.W2_02_LIBRARY_COMMIT_SHA && process.env.W2_02_LIBRARY_COMMIT_SHA !== library.catalogSha) throw new Error('orchestrator library commit does not match the release manifest')
if (process.env.W2_02_LIBRARY_CATALOG_SHA256 && process.env.W2_02_LIBRARY_CATALOG_SHA256 !== library.catalogContentSha256) throw new Error('orchestrator catalog checksum does not match the release manifest')
if (process.env.W2_02_LIBRARY_ENTRY_SHA256 && process.env.W2_02_LIBRARY_ENTRY_SHA256 !== library.entryContentSha256) throw new Error('orchestrator entry checksum does not match the release manifest')
const artifact = process.env.LINKLIBRARIES_ARTIFACT_PATH
const git = (args) => execFileSync('git', ['-C', artifact, ...args], { encoding: 'utf8' }).trim()
if (git(['rev-parse', '--is-inside-work-tree']) !== 'true') throw new Error('LINKLIBRARIES_ARTIFACT_PATH is not a Git working tree')
git(['cat-file', '-e', `${library.catalogSha}^{commit}`])
const catalog = git(['show', `${library.catalogSha}:${library.catalogPath}`])
const entry = git(['show', `${library.entrySha}:${library.entryPath}`])
if (createHash('sha256').update(catalog).digest('hex') !== library.catalogContentSha256) throw new Error('LiNKlibraries catalog content checksum does not match the release manifest')
if (createHash('sha256').update(entry).digest('hex') !== library.entryContentSha256) throw new Error('LiNKlibraries entry content checksum does not match the release manifest')
if (!JSON.parse(catalog).entries?.some((row) => row.entryId === library.entryId && row.status === 'approved')) throw new Error('LiNKlibraries manifest entry is not approved in the exact catalog')
NODE
docker compose --env-file "$runtime_env" -f deploy/docker-compose.deploy.yml config --quiet
echo 'LiNKsites Phase 2 preflight passed; this command performed no deployment.'
