#!/usr/bin/env bash
set -euo pipefail

# Historical audit material is deliberately retained outside the active
# runtime/build surface.  This scan prevents retired transport and duplicate
# application paths from being reintroduced where they could ship.
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"
active=(deploy scripts .github package.json pnpm-workspace.yaml turbo.json)
while IFS= read -r -d '' directory; do active+=("$directory"); done < <(find apps packages -type d -name src -print0)
if rg -n -I -g '!deploy/tests/**' -g '!scripts/assert-active-surface-clean.sh' -e '(N8N_WEBHOOK_URL|CONTACT_WEBHOOK_URL|sync-supabase-to-cms|seed-supabase-lsites-core|apps/web-company)' "${active[@]}"; then
  echo 'retired path remains in an active source, build, CI, or deployment surface' >&2
  exit 1
fi
