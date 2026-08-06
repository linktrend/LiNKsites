#!/usr/bin/env bash
set -euo pipefail

: "${LINKSITES_CMS_SMOKE_URL:?set the private CMS readiness URL}"
: "${LINKSITES_PREVIEW_SMOKE_URL:?set the private preview URL including its non-secret path}"
: "${LINKSITES_ORCHESTRATOR_SMOKE_URL:?set the orchestrator readiness URL}"
for url in "$LINKSITES_CMS_SMOKE_URL" "$LINKSITES_PREVIEW_SMOKE_URL" "$LINKSITES_ORCHESTRATOR_SMOKE_URL"; do
  case "$url" in https://*) ;; *) echo 'all smoke URLs must use HTTPS' >&2; exit 78 ;; esac
  status="$(curl --fail --silent --show-error --output /dev/null --write-out '%{http_code}' --max-time 15 "$url")"
  [[ "$status" == 200 ]] || { echo "smoke check failed: HTTP $status" >&2; exit 1; }
done
echo 'Post-deploy private health checks passed. This does not activate a public domain.'
