#!/usr/bin/env bash
# Wave 9.1 — verify CMS + frontend Docker builds locally (no push).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Building LinkSites CMS image (monorepo lockfile context)"
docker build -f deploy/docker/cms.Dockerfile -t linksites-cms:wave9-local .

echo "==> Building LinkSites frontend-shared image"
docker build -f deploy/docker/web-master.Dockerfile \
  --build-arg NEXT_PUBLIC_PAYLOAD_API_URL=https://cms.linktrend.internal \
  --build-arg PAYLOAD_PUBLIC_SERVER_URL=https://cms.linktrend.internal \
  -t linksites-frontend:wave9-local .

echo "Wave 9 Docker build verification passed."
