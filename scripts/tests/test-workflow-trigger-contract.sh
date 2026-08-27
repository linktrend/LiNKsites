#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

fail() {
  echo "FAIL: $*" >&2
  exit 1
}

require_line() {
  local file="$1"
  local expected="$2"
  rg -Fqx "$expected" "$ROOT/$file" \
    || fail "$file missing exact trigger line: $expected"
}

# Repository-owned application CI must wake on every Phase PR lifecycle event;
# the full-production job still remains label-gated inside ci.yml.
require_line ".github/workflows/ci.yml" "    types: [opened, synchronize, reopened, ready_for_review, labeled]"

# Fast checks are managed separately and remain Phase-PR-only.
require_line ".github/workflows/linktrend-review-packager.yml" "    types: [opened, synchronize, reopened, ready_for_review, converted_to_draft]"

# Full Suite remains an explicit label wake; widening this trigger would alter
# its sealed-candidate gate semantics.
require_line ".github/workflows/linktrend-integrator-merge.yml" "    types: [labeled]"
# Source policy emits on every relevant PR lifecycle event, including a draft
# becoming ready, while its job keeps the branch allowlist authoritative.
require_line ".github/workflows/branch-source-policy.yml" "    types: [opened, synchronize, reopened, ready_for_review, labeled]"

# No checkpoint push trigger may wake Phase application gates.
if rg -n '^\s+push:' \
  "$ROOT/.github/workflows/ci.yml" \
  "$ROOT/.github/workflows/linktrend-review-packager.yml" \
  "$ROOT/.github/workflows/linktrend-integrator-merge.yml" \
  "$ROOT/.github/workflows/branch-source-policy.yml"; then
  fail "Phase application workflow unexpectedly has a push trigger"
fi

echo "workflow trigger contract passed"
