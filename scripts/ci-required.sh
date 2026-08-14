#!/usr/bin/env bash
set -euo pipefail

# This is intentionally a gate, not a best-effort convenience command. Every
# named suite must run; unavailable Docker/Supabase/Playwright/platform inputs
# therefore fail the job rather than becoming a green "skipped" result.
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"
for tool in pnpm node docker supabase; do command -v "$tool" >/dev/null || { echo "required CI tool unavailable: $tool" >&2; exit 69; }; done
[[ -n "${LINKSITES_PLATFORM_REPOSITORY:-}" ]] || { echo 'LINKSITES_PLATFORM_REPOSITORY is required for Supabase/RLS validation' >&2; exit 78; }
[[ -d "$LINKSITES_PLATFORM_REPOSITORY/.git" ]] || { echo 'LINKSITES_PLATFORM_REPOSITORY is not a Git worktree' >&2; exit 78; }

export LINKSITES_PLATFORM_REPOSITORY
export CI=1
export DATABASE_URI="${DATABASE_URI:-postgresql://ci:ci@127.0.0.1:54322/linksites}"
export PAYLOAD_SECRET="${PAYLOAD_SECRET:-ci-disposable-payload-secret-that-is-not-a-production-secret}"
export PAYLOAD_PUBLIC_SERVER_URL="${PAYLOAD_PUBLIC_SERVER_URL:-http://127.0.0.1:3000}"
export NEXT_PUBLIC_CMS_PROVIDER=payload
export PAYLOAD_BASE_URL="${PAYLOAD_BASE_URL:-http://127.0.0.1:3000}"
export NEXT_PUBLIC_PAYLOAD_API_URL="${NEXT_PUBLIC_PAYLOAD_API_URL:-http://127.0.0.1:3000}"
export BASE_SHA="${BASE_SHA:-$(git rev-parse HEAD^)}"
mkdir -p .ci-artifacts

timings=.ci-artifacts/full-component-timings.jsonl
: > "$timings"
component() {
  local name="$1" started finished rc
  shift
  started="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  if "$@"; then rc=0; else rc=$?; fi
  finished="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  node -e 'const fs=require("node:fs"); fs.appendFileSync(process.argv[1], JSON.stringify({component:process.argv[2],startedAt:process.argv[3],completedAt:process.argv[4],result:Number(process.argv[5])===0?"passed":"failed"})+"\n")' "$timings" "$name" "$started" "$finished" "$rc"
  return "$rc"
}

component install pnpm install --frozen-lockfile
# Fast is required for this exact head by the workflow. Do not duplicate its
# lint/typecheck work here; a missing/stale Fast conclusion fails before this
# script is entered.
printf '%s\n' '{"component":"fast-receipt","startedAt":null,"completedAt":null,"result":"passed","evidence":"workflow-exact-head-gate"}' >> "$timings"
component program-build pnpm --filter @linksites/program-orchestrator run build
component cms-production-build pnpm --filter @linksites/cms run build
# Browser provisioning and disposable service bootstrap happen before their
# mandatory dependent suites. Nothing is treated as an optional convenience.
component chromium-install pnpm --filter @linksites/cms exec playwright install --with-deps chromium
component supabase-rls env LINKSITES_PLATFORM_REPOSITORY="$LINKSITES_PLATFORM_REPOSITORY" bash scripts/test-supabase-local.sh
component cms-browser-tests pnpm --filter @linksites/cms run test:local
# CMS local integration owns its disposable database/browser lifecycle above.
# Run every remaining workspace suite and reject any silently skipped case.
component non-cms-tests pnpm --filter '!@linksites/cms' test
component docker-build bash scripts/verify-docker-build.sh
component deployment-contract node --test deploy/tests/*.test.mjs
component restore-rehearsal pnpm deploy:restore-rehearsal -- --evidence .ci-artifacts/w2-07-local-restore.json
# Next/Payload development commands regenerate these tracked derived files.
# Restore the exact candidate versions before the clean-tree assertion so the
# gate measures source drift rather than deterministic tool output.
git restore --worktree -- apps/cms/next-env.d.ts apps/cms/src/payload-types.ts
component active-surface-clean bash -c 'scripts/assert-active-surface-clean.sh && git diff --exit-code && git diff --cached --exit-code'
node scripts/ci/verify-full-required-components.mjs \
  --manifest scripts/ci/full-required-components.json \
  --timings "$timings" \
  --recovery-required 1 \
  > .ci-artifacts/full-required-coverage.json
node - <<'NODE'
const fs = require('node:fs')
fs.writeFileSync('.ci-artifacts/w2-07-summary.json', JSON.stringify({ schemaVersion: '1.0.0', status: 'passed', suites: ['install', 'fast-receipt', 'program-build', 'cms-production-build', 'chromium-install', 'supabase-rls', 'cms-browser-tests', 'non-cms-tests', 'docker-build', 'deployment-contract', 'restore-rehearsal', 'active-surface-clean'], timings: 'full-component-timings.jsonl', requiredCoverage: 'full-required-coverage.json' }, null, 2) + '\n')
NODE
