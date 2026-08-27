#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
: "${LINKSITES_LINKLIBRARIES_ROOT:?set the exact LiNKlibraries candidate checkout root}"
: "${LINKSITES_LINKLIBRARIES_COMMIT_SHA:?set the exact provider candidate commit}"
: "${LINKSITES_LINKLIBRARIES_TREE_SHA:?set the exact provider candidate tree}"
: "${LINKSITES_LINKLIBRARIES_DEPENDENCY_LOCK_SHA256:?set the exact provider dependency-lock digest}"
provider_repository_commit="$LINKSITES_LINKLIBRARIES_COMMIT_SHA"
provider_repository_tree="$LINKSITES_LINKLIBRARIES_TREE_SHA"
probe_output="$(cd "$repo_root" && node_modules/.pnpm/node_modules/.bin/tsx scripts/master-template-candidate-probe.ts)"
printf '%s\n' "$probe_output"
mutated_tokens="$(printf '%s\n' "$probe_output" | sed -n 's/^LINKSITES_PAIRED_PROOF_TOKEN_CSS_PATH=//p' | tail -1)"
test -f "$mutated_tokens"
runtime_cache_root="$(printf '%s\n' "$probe_output" | sed -n 's/^LINKSITES_RUNTIME_CACHE_ROOT=//p' | tail -1)"
test -d "$runtime_cache_root"
release_version="$(printf '%s\n' "$probe_output" | sed -n 's/^LINKSITES_TEMPLATE_VERSION=//p' | tail -1)"
release_source_commit="$(printf '%s\n' "$probe_output" | sed -n 's/^LINKSITES_RELEASE_SOURCE_COMMIT_SHA=//p' | tail -1)"
release_source_tree="$(printf '%s\n' "$probe_output" | sed -n 's/^LINKSITES_RELEASE_SOURCE_TREE_SHA=//p' | tail -1)"
test -n "$release_version"
test -n "$release_source_commit"
test -n "$release_source_tree"

export W2_04_TEMPLATE_ID="master-template-type-1"
export LINKSITES_TEMPLATE_FORMAT="revision2"
export LINKSITES_PAIRED_PROOF=1
export LINKSITES_TEMPLATE_VERSION="$release_version"
export LINKSITES_LINKLIBRARIES_PROVIDER_CHECKOUT_ROOT="$LINKSITES_LINKLIBRARIES_ROOT"
export LINKSITES_LINKLIBRARIES_ROOT="$runtime_cache_root"
export LINKSITES_LINKLIBRARIES_REPOSITORY_COMMIT_SHA="$provider_repository_commit"
export LINKSITES_LINKLIBRARIES_REPOSITORY_TREE_SHA="$provider_repository_tree"
export LINKSITES_LINKLIBRARIES_COMMIT_SHA="$release_source_commit"
export LINKSITES_LINKLIBRARIES_TREE_SHA="$release_source_tree"
export LINKSITES_LINKLIBRARIES_RECEIPT_PATH="$LINKSITES_LINKLIBRARIES_ROOT/registry/v2/entries/master-template-type-1/versions/${release_version}/release-receipt.json"
export LINKSITES_PAIRED_PROOF_TOKEN_CSS_PATH="$mutated_tokens"
export LINKSITES_KEEP_LOCAL_REHEARSAL="${LINKSITES_KEEP_LOCAL_REHEARSAL:-1}"

cd "$repo_root"
bash scripts/w2-04-local-proof.sh
