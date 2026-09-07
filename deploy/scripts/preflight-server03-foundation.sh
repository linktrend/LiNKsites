#!/usr/bin/env bash
set -euo pipefail

# Apply the canonical active-provider, migration, private-route and image gates.
export COMPOSE_PROJECT_NAME=linksites-foundation
bash deploy/scripts/preflight.sh "$@"
set -a
# shellcheck disable=SC1090
source "$1"
set +a
compose_files=(-f deploy/docker-compose.server03-foundation.yml)
if [[ "${LINKSITES_TEMPLATE_RELEASE_STATE:-}" == 'ready' ]]; then
  compose_files+=(-f deploy/docker-compose.template-ready.yml)
fi
docker compose --env-file "$1" "${compose_files[@]}" config --quiet
