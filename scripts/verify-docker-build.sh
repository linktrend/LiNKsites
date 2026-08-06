#!/usr/bin/env bash
set -euo pipefail

# Build every active production image from the monorepo root. This is local
# build evidence only: no registry push, VPS, cloud, DNS, or live service call.
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
release_sha="$(git rev-parse HEAD)"
cms_url="https://cms.build.local.invalid"

build() {
  local dockerfile="$1" image="$2"
  echo "==> Building $image"
  docker build --pull=false --build-arg "LINKSITES_RELEASE_SHA=$release_sha" -f "$dockerfile" -t "$image" .
}

build deploy/docker/cms.Dockerfile linksites-cms:w2-07-local
echo '==> Building linksites-web-master:w2-07-local'
docker build --pull=false \
  --build-arg "LINKSITES_RELEASE_SHA=$release_sha" \
  --build-arg "NEXT_PUBLIC_PAYLOAD_API_URL=$cms_url" \
  --build-arg "PAYLOAD_PUBLIC_SERVER_URL=$cms_url" \
  -f deploy/docker/web-master.Dockerfile -t linksites-web-master:w2-07-local .
build deploy/docker/autowork-worker.Dockerfile linksites-autowork-worker:w2-07-local
build deploy/docker/program-orchestrator.Dockerfile linksites-program-orchestrator:w2-07-local
echo '==> Building linksites-migrations:w2-07-local'
docker build --pull=false \
  --build-arg "LINKSITES_RELEASE_SHA=$release_sha" \
  -f deploy/docker/migrations.Dockerfile -t linksites-migrations:w2-07-local .

for image in linksites-cms:w2-07-local linksites-web-master:w2-07-local linksites-autowork-worker:w2-07-local linksites-program-orchestrator:w2-07-local linksites-migrations:w2-07-local; do
  id="$(docker image inspect --format '{{.Id}}' "$image")"
  [[ "$id" == sha256:* ]] || { echo "missing image identity for $image" >&2; exit 1; }
  echo "$image $id"
done
echo 'W2-07 local Docker build verification passed.'
