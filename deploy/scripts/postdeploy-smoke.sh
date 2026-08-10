#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo 'usage: deploy/scripts/postdeploy-smoke.sh <protected-runtime-env-file>' >&2
  exit 64
fi
runtime_env="$1"
[[ -f "$runtime_env" ]] || { echo 'runtime environment file is absent' >&2; exit 78; }
set -a
# shellcheck disable=SC1090
source "$runtime_env"
set +a

# Execute from the web-master container. The preview check uses the exact
# stable completion URL; privacy is supplied by the named external middleware,
# not by a secret-bearing URL or application header.
docker compose --env-file "$runtime_env" -f deploy/docker-compose.deploy.yml exec -T web-master node --input-type=module <<'NODE'
const previewBase = process.env.W2_02_WEB_MASTER_BASE_URL
if (!previewBase) throw new Error('web-master preview base URL is absent')
const previewUrl = new URL('/en/demo', previewBase)
if (previewUrl.username || previewUrl.password || previewUrl.search || previewUrl.hash) throw new Error('stable preview URL must not contain credentials, query, or fragment')

const checks = [
  ['CMS readiness', 'http://payload:3000/api/readyz'],
  ['orchestrator readiness', 'http://program-orchestrator:3000/readyz'],
  ['private preview', previewUrl.toString()],
]
for (const [name, url] of checks) {
  const response = await fetch(url, { redirect: 'manual' })
  if (response.status !== 200) throw new Error(`${name} smoke failed with HTTP ${response.status}`)
}
console.log('Post-deploy private health checks passed. This does not activate a public domain.')
NODE
