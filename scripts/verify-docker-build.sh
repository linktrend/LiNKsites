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
[[ -s "$classification" ]] || { echo "Docker classification evidence is missing or empty: $classification" >&2; exit 78; }
classification_images="$(node - "$classification" "$base_sha" "$release_sha" <<'NODE'
const fs = require('node:fs')
const path = require('node:path')
const [file, expectedBase, expectedHead] = process.argv.slice(2)
let value
try { value = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8')) } catch (error) {
  console.error(`Docker classification evidence is not valid JSON: ${error.message}`)
  process.exit(78)
}
const allowed = new Set(['cms', 'web-master', 'autowork-worker', 'program-orchestrator', 'migrations'])
if (value?.schemaVersion !== 1 || !['all', 'affected'].includes(value.mode) || value.baseSha !== expectedBase || value.headSha !== expectedHead || !Array.isArray(value.images) || value.images.length === 0 || value.images.some((image) => typeof image !== 'string' || !allowed.has(image))) {
  console.error('Docker classification evidence failed schema/head/image validation')
  process.exit(78)
}
process.stdout.write(value.images.join('\n'))
NODE
)"
selected_images=()
while IFS= read -r image; do
  [[ -n "$image" ]] && selected_images+=("$image")
done <<<"$classification_images"
(( ${#selected_images[@]} > 0 )) || { echo 'Docker classification selected no images' >&2; exit 78; }
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
