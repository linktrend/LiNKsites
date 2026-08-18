#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

for tool in pnpm node python3; do
  command -v "$tool" >/dev/null || { echo "required fast-CI tool unavailable: $tool" >&2; exit 69; }
done

export CI=1
mkdir -p .ci-artifacts

BASE_SHA="${BASE_SHA:-}"
HEAD_SHA="${HEAD_SHA:-$(git rev-parse HEAD)}"
[[ "$BASE_SHA" =~ ^[0-9a-f]{40}$ ]] || { echo 'BASE_SHA must be the exact pull-request base commit' >&2; exit 64; }
[[ "$HEAD_SHA" =~ ^[0-9a-f]{40}$ ]] || { echo 'HEAD_SHA must be the exact pull-request head commit' >&2; exit 64; }
git cat-file -e "${BASE_SHA}^{commit}"
git cat-file -e "${HEAD_SHA}^{commit}"

started_at="$(date +%s)"
pnpm install --frozen-lockfile --prefer-offline
pnpm lint
pnpm typecheck
node --test deploy/tests/runtime-contract.test.mjs
python3 -m unittest scripts.tests.test_ci_full_suite_receipt
scripts/assert-active-surface-clean.sh
git diff --exit-code
git diff --cached --exit-code
BASE_SHA="$BASE_SHA" HEAD_SHA="$HEAD_SHA" bash scripts/ci-secret-scan.sh
finished_at="$(date +%s)"
elapsed="$((finished_at - started_at))"

python3 - "$elapsed" <<'PY'
import json
import pathlib
import sys

path = pathlib.Path('.ci-artifacts/fast-check-summary.json')
path.write_text(json.dumps({
    'schemaVersion': 1,
    'status': 'passed',
    'elapsedSeconds': int(sys.argv[1]),
    'targetSeconds': 300,
    'checks': ['frozen-install', 'lint', 'typecheck', 'runtime-contract', 'receipt-verifier-tests', 'legacy-surface-scan', 'changed-range-secret-scan'],
}, indent=2) + '\n', encoding='utf-8')
PY

if (( elapsed > 300 )); then
  echo "fast CI exceeded five-minute target: ${elapsed}s" >&2
  exit 1
fi
