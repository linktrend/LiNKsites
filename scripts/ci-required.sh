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
mkdir -p .ci-artifacts

pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm --filter @linksites/program-orchestrator run build
pnpm --filter @linksites/cms run build
pnpm --filter @linksites/web-master run build
# Browser provisioning and disposable service bootstrap happen before their
# mandatory dependent suites. Nothing is treated as an optional convenience.
pnpm exec playwright install --with-deps chromium
LINKSITES_PLATFORM_REPOSITORY="$LINKSITES_PLATFORM_REPOSITORY" bash scripts/test-supabase-local.sh
pnpm --filter @linksites/cms run test:local
# CMS local integration owns its disposable database/browser lifecycle above.
# Run every remaining workspace suite and reject any silently skipped case.
pnpm --filter '!@linksites/cms' test 2>&1 | tee .ci-artifacts/non-cms-tests.log
if rg -n -i '\b(skipped|todo)\b' .ci-artifacts/non-cms-tests.log; then
  echo 'a mandatory non-CMS suite reported skipped or todo cases' >&2
  exit 1
fi
bash scripts/verify-docker-build.sh
node --test deploy/tests/*.test.mjs deploy/tests/runtime-contract.test.mjs
pnpm deploy:restore-rehearsal -- --evidence .ci-artifacts/w2-07-local-restore.json
pnpm audit --audit-level=moderate
scripts/assert-active-surface-clean.sh
git diff --exit-code
git diff --cached --exit-code
node - <<'NODE'
const fs = require('node:fs')
fs.writeFileSync('.ci-artifacts/w2-07-summary.json', JSON.stringify({ schemaVersion: '1.0.0', status: 'passed', suites: ['install', 'lint', 'typecheck', 'all-production-builds', 'unit-integration', 'local-payload-browser', 'supabase-rls', 'docker-build', 'deployment-contract', 'restore-rehearsal', 'dependency-audit', 'legacy-surface-scan'] }, null, 2) + '\n')
NODE
