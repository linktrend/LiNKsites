#!/usr/bin/env bash
set -euo pipefail

mkdir -p .ci-artifacts
if [[ "${EVENT_NAME:-}" == "pull_request" ]]; then
  base_sha="$(git rev-parse HEAD^1)"
  head_sha="$(git rev-parse HEAD^2)"
else
  base_sha="${BEFORE_SHA:-}"
  head_sha="$(git rev-parse HEAD)"
  if [[ ! "$base_sha" =~ ^[0-9a-f]{40}$ ]] || [[ "$base_sha" == "0000000000000000000000000000000000000000" ]]; then
    base_sha=""
  fi
fi

log_opts="--all"
if [[ -n "$base_sha" ]]; then
  git cat-file -e "${base_sha}^{commit}"
  git cat-file -e "${head_sha}^{commit}"
  log_opts="${base_sha}..${head_sha}"
fi

docker run --rm \
  --volume "$PWD:/repo:ro" \
  zricethezav/gitleaks@sha256:e1b35e12a8c6fa8901f060459cfb6b2fc4c484d3afbe3b029733a3bbfab07055 \
  git --redact --verbose --log-opts="$log_opts" /repo

python3 - <<'PY'
import json
import pathlib

pathlib.Path('.ci-artifacts/security-summary.json').write_text(
    json.dumps({'schemaVersion': 1, 'status': 'passed', 'scanner': 'gitleaks'}, indent=2) + '\n',
    encoding='utf-8',
)
PY
