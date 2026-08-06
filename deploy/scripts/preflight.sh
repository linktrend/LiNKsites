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
const manifest = JSON.parse(await readFile(process.argv[2], 'utf8'))
if (manifest.repository?.releaseSha !== process.env.LINKSITES_RELEASE_SHA) throw new Error('manifest release SHA does not equal runtime release SHA')
if (!Object.values(manifest.images ?? {}).every((digest) => /^sha256:[a-f0-9]{64}$/i.test(digest))) throw new Error('manifest contains a missing or mutable image identity')
NODE
docker compose --env-file "$runtime_env" -f deploy/docker-compose.deploy.yml config --quiet
echo 'LiNKsites Phase 2 preflight passed; this command performed no deployment.'
