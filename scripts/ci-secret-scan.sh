#!/usr/bin/env bash
set -euo pipefail

mkdir -p .ci-artifacts
base_sha="${BASE_SHA:-}"
head_sha="${HEAD_SHA:-}"
[[ "$base_sha" =~ ^[0-9a-f]{40}$ ]] || { echo 'BASE_SHA must be an exact commit SHA' >&2; exit 64; }
[[ "$head_sha" =~ ^[0-9a-f]{40}$ ]] || { echo 'HEAD_SHA must be an exact commit SHA' >&2; exit 64; }
git cat-file -e "${base_sha}^{commit}"
git cat-file -e "${head_sha}^{commit}"
log_opts="${base_sha}..${head_sha}"

scan_log=.ci-artifacts/gitleaks.log
docker run --rm \
  --volume "$PWD:/repo:ro" \
  zricethezav/gitleaks@sha256:e1b35e12a8c6fa8901f060459cfb6b2fc4c484d3afbe3b029733a3bbfab07055 \
  git --redact --verbose --log-opts="$log_opts" /repo 2>&1 | tee "$scan_log"

# Gitleaks can return zero after reporting a partial repository scan. A partial
# or inaccessible Git history is not evidence that the changed range is safe.
if rg -n -i 'partial scan|failed to scan Git repository|fatal: not a git repository' "$scan_log"; then
  echo 'gitleaks did not complete a full changed-range scan' >&2
  exit 1
fi

python3 - <<'PY'
import json
import pathlib

pathlib.Path('.ci-artifacts/security-summary.json').write_text(
    json.dumps({'schemaVersion': 1, 'status': 'passed', 'scanner': 'gitleaks'}, indent=2) + '\n',
    encoding='utf-8',
)
PY
