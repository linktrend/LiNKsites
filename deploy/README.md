# LinkSites VPS deployment (Wave 9)

Production compose for Payload CMS + shared multi-tenant frontend on linkdroplet-00.

## Layout

| Service | Image | Traefik host |
|---------|-------|--------------|
| `payload` | `deploy/docker/cms.Dockerfile` | `cms.linktrend.internal` (priority 100) |
| `frontend-shared` | `deploy/docker/web-master.Dockerfile` | `*.linktrend.internal` preview sites (priority 10) |

CMS and frontend images build from the **monorepo root** so `pnpm-lock.yaml` and `@linksites/types` resolve (Wave 9.1 lockfile context fix).

## VPS path

```bash
cd /opt/linktrend/cms
./ops/render-runtime-env-from-gsm.sh prod --output /opt/linktrend/runtime/linksites-cms/prod.env.runtime
docker compose -f deploy/docker-compose.deploy.yml build
docker compose -f deploy/docker-compose.deploy.yml up -d --remove-orphans
```

Project name: **`cms`** (from compose `name:`).

## Wildcard preview (Wave 9.2)

Traefik routes `HostRegexp(\`^[a-z0-9-]+\\.linktrend\\.internal$\`)` to `frontend-shared`. Exact host `cms.linktrend.internal` stays on the CMS router (higher priority).

After MVO publish (`scripts/mvo-live-publish.sh`), verify:

```bash
curl -k -sS -o /dev/null -w "%{http_code}" "https://${SITE_SLUG}.linktrend.internal/en"
```

Expect `200` when the site domain exists in Payload `site-domains`.

## Environment

See `apps/cms/deploy/prod/.env.example`. Required at runtime:

- `DATABASE_URI` (GSM: `LINKSITES_CMS_DATABASE_URI`)
- `PAYLOAD_SECRET`
- `PAYLOAD_PUBLIC_SERVER_URL=https://cms.linktrend.internal`
- `NEXT_PUBLIC_PAYLOAD_API_URL=https://cms.linktrend.internal`

Hetzner migration (Wave 12) reuses this compose topology; only host/provider changes.
