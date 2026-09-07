#!/usr/bin/env bash
set -euo pipefail

# Exercise real orchestrator readiness and an authenticated rendered preview.
export COMPOSE_PROJECT_NAME=linksites-foundation
exec bash deploy/scripts/postdeploy-smoke.sh "$@"
