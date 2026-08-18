#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
: "${LINKSITES_LINKLIBRARIES_ROOT:?set the exact LiNKlibraries candidate checkout root}"
: "${LINKSITES_LINKLIBRARIES_COMMIT_SHA:?set the exact provider candidate commit}"
: "${LINKSITES_LINKLIBRARIES_TREE_SHA:?set the exact provider candidate tree}"
: "${LINKSITES_LINKLIBRARIES_DEPENDENCY_LOCK_SHA256:?set the exact provider dependency-lock digest}"
probe_output="$(cd "$repo_root" && node_modules/.pnpm/node_modules/.bin/tsx scripts/master-template-candidate-probe.ts)"
printf '%s\n' "$probe_output"
mutated_tokens="$(printf '%s\n' "$probe_output" | sed -n 's/^LINKSITES_PAIRED_PROOF_TOKEN_CSS_PATH=//p' | tail -1)"
test -f "$mutated_tokens"

export W2_04_TEMPLATE_ID="master-template-type-1"
export LINKSITES_TEMPLATE_FORMAT="revision2"
export LINKSITES_PAIRED_PROOF=1
export LINKSITES_LINKLIBRARIES_RECEIPT_PATH="$LINKSITES_LINKLIBRARIES_ROOT/registry/v2/entries/master-template-type-1/versions/1.0.0/release-receipt.json"
export LINKSITES_PAIRED_PROOF_TOKEN_CSS_PATH="$mutated_tokens"
export LINKSITES_KEEP_LOCAL_REHEARSAL="${LINKSITES_KEEP_LOCAL_REHEARSAL:-1}"

cd "$repo_root"
bash scripts/w2-04-local-proof.sh
