#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo 'usage: deploy/scripts/preflight-server03-foundation.sh <protected-runtime-env-file> <release-manifest.json>' >&2
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
export LINKSITES_TEMPLATE_RELEASE_STATE=pending
for service in cms web-master autowork-worker program-orchestrator-staged; do
  node deploy/scripts/validate-runtime-config.mjs "$service"
done
node --input-type=module - "$manifest" <<'NODE'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
const manifest = JSON.parse(await readFile(process.argv[2], 'utf8'))
const checksum = async (file) => createHash('sha256').update(await readFile(resolve(process.cwd(), file))).digest('hex')
if (manifest.schemaVersion !== '1.2.0') throw new Error('Server03 foundation requires deployment manifest schema 1.2.0')
if (manifest.repository?.releaseSha !== process.env.LINKSITES_RELEASE_SHA) throw new Error('manifest release SHA does not equal runtime release SHA')
if (manifest.libraries?.state !== 'pending' || manifest.libraries?.infrastructureAcceptanceEligible !== true) throw new Error('foundation manifest must record the provider release as pending and infrastructure-eligible')
for (const capability of ['renderer-activation', 'orchestrator-intake', 'private-site-pilot', 'public-site-release']) {
  if (!manifest.libraries.blockedCapabilities?.includes(capability)) throw new Error(`foundation manifest does not block ${capability}`)
}
if (manifest.platform?.state === 'ready') {
  if (manifest.platform.migrationsAppliedSha !== process.env.LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA) throw new Error('platform migration SHA does not match the release manifest')
} else if (manifest.platform?.state !== 'pending' || manifest.platform?.infrastructureArtifactAcceptanceEligible !== true) {
  throw new Error('foundation manifest has neither admitted nor explicitly pending Platform authority')
}
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
for (const row of manifest.schemas?.supabaseMigrations ?? []) if (await checksum(row.file) !== row.sha256) throw new Error(`Supabase migration source checksum mismatch: ${row.file}`)
const payloadIndex = manifest.schemas?.payloadMigrationIndex
if (!payloadIndex || await checksum(payloadIndex.file) !== payloadIndex.sha256) throw new Error('Payload migration index checksum does not match the release manifest')
for (const row of manifest.schemas?.payloadMigrations ?? []) if (await checksum(row.file) !== row.sha256) throw new Error(`Payload migration source checksum mismatch: ${row.file}`)
NODE
docker compose --env-file "$runtime_env" -f deploy/docker-compose.server03-foundation.yml config --quiet
echo 'LiNKsites Server03 provider-independent foundation preflight passed; this command performed no deployment.'
