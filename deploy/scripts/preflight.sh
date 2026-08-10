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
const manifest = JSON.parse(await readFile(process.argv[2], 'utf8'))
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
NODE
docker compose --env-file "$runtime_env" -f deploy/docker-compose.deploy.yml config --quiet
echo 'LiNKsites Phase 2 preflight passed; this command performed no deployment.'
