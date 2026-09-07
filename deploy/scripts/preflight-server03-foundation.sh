#!/usr/bin/env bash
set -euo pipefail

# Apply the canonical active-provider, migration, private-route and image gates.
export COMPOSE_PROJECT_NAME=linksites-foundation
bash deploy/scripts/preflight.sh "$@"
docker compose --env-file "$1" -f deploy/docker-compose.server03-foundation.yml config --quiet
