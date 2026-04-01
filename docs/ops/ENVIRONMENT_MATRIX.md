# LiNKsites Factory Kit - Environment Matrix

This document defines environment variables by service and by environment.

Environments:
- `local`: developer machine
- `staging`: pre-production validation
- `production`: live customer traffic

Services:
- `cms`: Payload CMS (`/apps/cms`)
- `frontend-shared`: multi-tenant shared frontend (`/apps/web-master`)
- `frontend-dedicated`: premium spin-off frontend (same codebase, fixed `SITE_ID`)

## 1) CMS (`payload-cms`) Variables

| Variable | local | staging | production | Notes |
|---|---|---|---|---|
| `DATABASE_URI` | Required | Required | Required | Supabase Postgres connection string |
| `PAYLOAD_SECRET` | Required | Required | Required | Strong secret, unique per env |
| `PAYLOAD_PUBLIC_SERVER_URL` | Required | Required | Required | Public URL of CMS for that env |
| `WEBHOOK_SECRET` | Optional | Recommended | Recommended | Content/webhook auth |
| `N8N_WEBHOOK_URL` | Optional | Optional | Optional | If automation is used |
| `N8N_WEBHOOK_SECRET` | Optional | Optional | Optional | If automation is used |
| `YOUTUBE_WEBHOOK_SECRET` | Optional | Optional | Optional | If YouTube ingestion is used |
| `REBUILD_WEBHOOK_URL` | Optional | Recommended | Recommended | Trigger frontend rebuild/revalidate |
| `REBUILD_STALE_DAYS` | Optional | Optional | Optional | Cache/rebuild tuning |
| `SEARCH_INDEX_ENDPOINT` | Optional | Optional | Optional | Only if search indexing exists |
| `PAYLOAD_CACHE_TTL_MS` | Optional | Optional | Optional | Internal cache tuning |
| `PAYLOAD_CACHE_CAPACITY` | Optional | Optional | Optional | Internal cache tuning |
| `DRAFT_MAX_AGE_DAYS` | Optional | Optional | Optional | Editorial hygiene |

## 2) Shared Frontend Variables (`website-master-template`)

Core variables used by the current multi-tenant runtime:

| Variable | local | staging | production | Notes |
|---|---|---|---|---|
| `PAYLOAD_BASE_URL` | Required | Required | Required | Server-side CMS base URL |
| `PAYLOAD_PUBLIC_SERVER_URL` | Required | Required | Required | Public CMS URL |
| `NEXT_PUBLIC_PAYLOAD_API_URL` | Required | Required | Required | Client-visible CMS URL |
| `NEXT_PUBLIC_CMS_PROVIDER` | Required | Required | Required | Use `payload` for live environments |
| `PAYLOAD_API_KEY` | Optional | Optional | Optional | For private/authenticated CMS reads |
| `DEFAULT_SITE_ID` | Optional | Optional | Optional | Local fallback only |
| `SITE_ID` | Empty | Empty | Empty | Must be empty for shared runtime |

Additional branding/analytics variables can be set per deployment if needed:
- `NEXT_PUBLIC_SITE_NAME`
- `NEXT_PUBLIC_SITE_URL`
- analytics IDs (`NEXT_PUBLIC_GA_MEASUREMENT_ID`, etc.)
- app URLs (`NEXT_PUBLIC_APP_LOGIN_URL`, etc.)

## 3) Dedicated Frontend Variables (Premium Spin-Off)

Same frontend codebase, but with tenant lock:

| Variable | local | staging | production | Notes |
|---|---|---|---|---|
| `PAYLOAD_BASE_URL` | Required | Required | Required | CMS URL |
| `PAYLOAD_PUBLIC_SERVER_URL` | Required | Required | Required | CMS public URL |
| `NEXT_PUBLIC_PAYLOAD_API_URL` | Required | Required | Required | CMS API URL |
| `NEXT_PUBLIC_CMS_PROVIDER` | Required | Required | Required | `payload` |
| `SITE_ID` | Required | Required | Required | Lock to one tenant (`siteId`) |
| `PAYLOAD_API_KEY` | Optional | Recommended | Recommended | Prefer read-only key per site |
| `DEFAULT_SITE_ID` | Optional | Optional | Optional | Usually not needed when `SITE_ID` set |

## 4) Reverse Proxy / Edge Variables (Traefik or Nginx)

These are not in app `.env.example`, but are required operationally:

| Setting | staging | production | Notes |
|---|---|---|---|
| ACME email | Required | Required | TLS certificate registration |
| Domain routing rules | Required | Required | Hostname -> service mapping |
| Rate limits / security headers | Recommended | Required | Basic hardening |
| Access logs | Recommended | Required | Incident debugging |

## 5) Secret Handling Rules

1. Never commit `.env` files.
2. Use different secrets for each environment.
3. Rotate production secrets on a schedule.
4. Prefer a secrets manager for staging/production.
5. For premium sites, prefer a scoped read-only API key per site.

## 6) Recommended Env Files

For clarity and consistency:

- CMS:
  - `.env.local`
  - `.env.staging`
  - `.env.production`
- Frontend shared:
  - `.env.local`
  - `.env.staging`
  - `.env.production`
- Premium frontend instances:
  - same as shared, but each deployment sets a different `SITE_ID`
