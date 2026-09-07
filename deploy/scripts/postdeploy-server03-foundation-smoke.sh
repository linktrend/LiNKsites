#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo 'usage: deploy/scripts/postdeploy-server03-foundation-smoke.sh <protected-runtime-env-file>' >&2
  exit 64
fi
runtime_env="$1"
[[ -f "$runtime_env" ]] || { echo 'runtime environment file is absent' >&2; exit 78; }

docker compose --env-file "$runtime_env" -f deploy/docker-compose.server03-foundation.yml exec -T web-master node --input-type=module <<'NODE'
const checks = [
  ['CMS readiness', 'http://payload:3000/api/readyz'],
  ['renderer readiness', 'http://127.0.0.1:3000/api/readyz'],
  ['staged orchestrator readiness', 'http://program-orchestrator:3000/readyz'],
]
for (const [name, url] of checks) {
  const response = await fetch(url, { redirect: 'manual' })
  if (response.status !== 200) throw new Error(`${name} smoke failed with HTTP ${response.status}`)
}
const ingress = await fetch('http://program-orchestrator:3000/ingress/lead-research', { method: 'POST', body: '{}' })
if (ingress.status !== 503) throw new Error(`staged orchestrator ingress must fail closed with HTTP 503, got ${ingress.status}`)
console.log('Server03 foundation health passed; provider-dependent intake, selected-template preview, and public ingress remain disabled.')
NODE
