#!/usr/bin/env bash
set -euo pipefail

# Build every active production image from the monorepo root. This is local
# build evidence only: no registry push, VPS, cloud, DNS, or live service call.
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
release_sha="$(git rev-parse HEAD)"
cms_url="https://cms.build.local.invalid"
base_sha="${BASE_SHA:-}"
classification="${DOCKER_CLASSIFICATION_OUTPUT:-.ci-artifacts/docker-classification.json}"
buildkit_cache="${DOCKER_BUILDKIT_CACHE:-$HOME/.cache/linksites-buildx}"
[[ -n "$base_sha" ]] || { echo 'BASE_SHA is required for fail-closed Docker classification' >&2; exit 78; }
node scripts/ci/affected-docker-images.mjs --base "$base_sha" --head "$release_sha" --output "$classification"
mapfile -t selected_images < <(node -e 'const v=require(process.argv[1]); for (const image of v.images) console.log(image)' "$classification")
mkdir -p "$buildkit_cache"

docker_build() {
  docker buildx build --load --pull=false \
    --cache-from "type=local,src=$buildkit_cache" \
    --cache-to "type=local,dest=$buildkit_cache,mode=max" "$@"
}

build() {
  local dockerfile="$1" image="$2"
  echo "==> Building $image"
  docker_build --build-arg "LINKSITES_RELEASE_SHA=$release_sha" -f "$dockerfile" -t "$image" .
}

for selected in "${selected_images[@]}"; do
  case "$selected" in
    cms) build deploy/docker/cms.Dockerfile linksites-cms:w2-07-local ;;
    web-master)
      echo '==> Building linksites-web-master:w2-07-local'
      docker_build --build-arg "LINKSITES_RELEASE_SHA=$release_sha" --build-arg "NEXT_PUBLIC_PAYLOAD_API_URL=$cms_url" --build-arg "PAYLOAD_PUBLIC_SERVER_URL=$cms_url" -f deploy/docker/web-master.Dockerfile -t linksites-web-master:w2-07-local . ;;
    autowork-worker) build deploy/docker/autowork-worker.Dockerfile linksites-autowork-worker:w2-07-local ;;
    program-orchestrator) build deploy/docker/program-orchestrator.Dockerfile linksites-program-orchestrator:w2-07-local ;;
    migrations)
      echo '==> Building linksites-migrations:w2-07-local'
      docker_build --build-arg "LINKSITES_RELEASE_SHA=$release_sha" -f deploy/docker/migrations.Dockerfile -t linksites-migrations:w2-07-local . ;;
    *) echo "unknown classified Docker image: $selected" >&2; exit 78 ;;
  esac
done

for selected in "${selected_images[@]}"; do
  image="linksites-$selected:w2-07-local"
  id="$(docker image inspect --format '{{.Id}}' "$image")"
  [[ "$id" == sha256:* ]] || { echo "missing image identity for $image" >&2; exit 1; }
  echo "$image $id"
done
echo 'W2-07 local Docker build verification passed.'
