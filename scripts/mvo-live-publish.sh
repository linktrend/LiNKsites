#!/usr/bin/env bash
# MVO Area 7 — live Payload publish for one governed demo lead (Calusa / LinkSites).
# Requires DATABASE_URI (GSM: LINKSITES_CMS_DATABASE_URI) and PAYLOAD_SECRET in env.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CMS_DIR="$ROOT/apps/cms"
cd "$CMS_DIR"

if [[ -z "${DATABASE_URI:-}" ]]; then
  echo "ERROR: DATABASE_URI is required (e.g. from GSM LINKSITES_CMS_DATABASE_URI)" >&2
  exit 1
fi
if [[ -z "${PAYLOAD_SECRET:-}" ]]; then
  echo "ERROR: PAYLOAD_SECRET is required (e.g. from GSM LINKSITES_CMS_PAYLOAD_SECRET)" >&2
  exit 1
fi

export PAYLOAD_PUBLIC_SERVER_URL="${PAYLOAD_PUBLIC_SERVER_URL:-https://cms.linktrend.internal}"
# Never auto-push schema against the live pooler DB (use public.search_path via payload.config.ts).
export NODE_ENV="${NODE_ENV:-production}"
export LINKSITES_FACTORY_MODE="${LINKSITES_FACTORY_MODE:-1}"

BUSINESS_NAME="${MVO_LEAD_BUSINESS_NAME:-Calusa Demo Lawn Care}"
SLUG_BASE="${MVO_SITE_SLUG:-calusa-demo-mvo}"
RUN_TAG="${MVO_RUN_TAG:-$(date -u +%Y%m%d%H%M%S)}"
SITE_SLUG="${SLUG_BASE}-${RUN_TAG}"
HOSTNAME="${MVO_SITE_HOSTNAME:-${SITE_SLUG}.linktrend.internal}"
PREVIEW_BASE="${LINKSITES_PREVIEW_BASE_URL:-https://${HOSTNAME}}"

echo "==> Ensuring CMS languages/bootstrap (idempotent)"
pnpm run factory:bootstrap 2>/dev/null || true

echo "==> Creating published site in Payload (factory:create-demo-site)"
FACTORY_LOG="$(mktemp)"
pnpm run factory:create-demo-site -- --name="$BUSINESS_NAME" --hostname="$HOSTNAME" --templateId=marketing-smb-v1 --locales=en >"$FACTORY_LOG" 2>&1
SITE_ID="$(node -e "
const fs = require('fs');
const text = fs.readFileSync(process.argv[1], 'utf8');
const line = text.trim().split('\n').filter((l) => l.startsWith('{')).pop();
if (!line) throw new Error('factory:create-demo-site did not emit JSON');
const j = JSON.parse(line);
if (!j.siteId) throw new Error('missing siteId in factory output');
console.log(j.siteId);
" "$FACTORY_LOG")"
cat "$FACTORY_LOG"
rm -f "$FACTORY_LOG"

echo "==> Ensuring services page for readiness gate"
DATABASE_URI="$DATABASE_URI" PAYLOAD_SECRET="$PAYLOAD_SECRET" PAYLOAD_PUBLIC_SERVER_URL="$PAYLOAD_PUBLIC_SERVER_URL" \
  pnpm exec tsx scripts/mvo-ensure-services-page.ts --siteId="$SITE_ID" --locale=en

PREVIEW_URL="${PREVIEW_BASE%/}/en"
ARTIFACT_REF="payload_site:${SITE_ID}"
PAYLOAD_SYNC_REF="payload_sync:${SITE_ID}:mvo-live"

OUT_FILE="${MVO_LIVE_PUBLISH_JSON:-$ROOT/../LiNKtrend-System/LiNKdev/product/reports/linktrend-system/mvo-live-publish.json}"
mkdir -p "$(dirname "$OUT_FILE")"

node -e "
const fs = require('fs');
const payload = {
  generated_at: new Date().toISOString(),
  site_slug: process.env.SITE_SLUG,
  site_id: process.env.SITE_ID,
  hostname: process.env.HOSTNAME,
  preview_url: process.env.PREVIEW_URL,
  publish_url: process.env.PREVIEW_URL,
  payload_sync_ref: process.env.PAYLOAD_SYNC_REF,
  artifact_ref: process.env.ARTIFACT_REF,
  business_name: process.env.BUSINESS_NAME,
  cms_base_url: process.env.PAYLOAD_PUBLIC_SERVER_URL,
};
fs.writeFileSync(process.env.OUT_FILE, JSON.stringify(payload, null, 2) + '\n');
console.log(JSON.stringify(payload));
" \
  SITE_SLUG="$SITE_SLUG" SITE_ID="$SITE_ID" HOSTNAME="$HOSTNAME" \
  PREVIEW_URL="$PREVIEW_URL" PAYLOAD_SYNC_REF="$PAYLOAD_SYNC_REF" \
  ARTIFACT_REF="$ARTIFACT_REF" BUSINESS_NAME="$BUSINESS_NAME" \
  OUT_FILE="$OUT_FILE" PAYLOAD_PUBLIC_SERVER_URL="$PAYLOAD_PUBLIC_SERVER_URL"

echo "Wrote $OUT_FILE"
