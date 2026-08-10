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

# Execute from the web-master container. The checks use the declared Compose
# topology, while the application reads PREVIEW_ACCESS_TOKEN from its
# protected environment and constructs the private path in memory. No
# secret-bearing URL is supplied as an input or emitted in diagnostics.
docker compose --env-file "$runtime_env" -f deploy/docker-compose.deploy.yml exec -T web-master node --input-type=module <<'NODE'
const token = process.env.PREVIEW_ACCESS_TOKEN
if (!token || token.length < 32) throw new Error('web-master preview token is absent or too short')

const checks = [
  ['CMS readiness', 'http://payload:3000/api/readyz'],
  ['orchestrator readiness', 'http://program-orchestrator:3000/readyz'],
  ['private preview', `http://127.0.0.1:3000/en/demo/${encodeURIComponent(token)}`],
]
for (const [name, url] of checks) {
  const response = await fetch(url, { redirect: 'manual' })
  if (response.status !== 200) throw new Error(`${name} smoke failed with HTTP ${response.status}`)
}
console.log('Post-deploy private health checks passed. This does not activate a public domain.')
NODE
