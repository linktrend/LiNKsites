# LiNKsites

See `README.md` and `docs/LINKSITES-TECHNICAL-PRD.md` for product/architecture. Standard dev
commands live in the root and per-app `package.json` (`pnpm install`, `pnpm dev`, `pnpm lint`,
`pnpm test` via Turbo; per app: `pnpm --filter @linksites/cms dev`,
`pnpm --filter @linksites/web-master dev`).

## Cursor Cloud specific instructions

Dependencies for this repo are installed automatically on VM startup (`pnpm install`). The two
runnable apps are the Payload CMS (`apps/cms`) and the public Next.js frontend
(`apps/web-master`). Non-obvious caveats when running/testing them in this environment:

### Database (CMS)
- `apps/cms` requires Postgres (`@payloadcms/db-postgres`). There is no Docker in the VM; use the
  local PostgreSQL server instead (`sudo pg_ctlcluster 16 main start`) with a `payload`
  role/db/password, and point `apps/cms/.env` `DATABASE_URI` at
  `postgresql://payload:payload@127.0.0.1:5432/payload`. `apps/cms/docker-compose.yml` documents
  the same `payload/payload/payload` credentials if Docker is available elsewhere.
- In dev (`NODE_ENV!=production`) Payload runs with `push: true`, so the schema is auto-created on
  first request to `/admin` — no manual migration needed. `apps/cms/.env` is git-ignored; create it
  from `apps/cms/.env.example`.

### CMS env loading gotcha
- `next dev` loads `apps/cms/.env`, but the `tsx` factory/seed scripts (`scripts/*.ts`, e.g.
  `pnpm factory:bootstrap`) do NOT auto-load it. Export it first:
  `set -a && . ./.env && set +a` before running them, or they fail with
  "DATABASE_URI environment variable is required".

### Seeding + auth gotchas (content authoring)
- `pnpm factory:bootstrap` seeds languages, a Super Admin role, the default Site, site-domains, and
  site-settings. The first admin user is created via `POST /api/users/first-register`, which
  requires `roles`, `assignedSites`, and `allowedLocales`.
- Permission resolution is by role NAME against `defaultRolePermissions` in
  `src/utils/permissions.ts` (keys are slugs like `admin` / `super-admin`). The bootstrap role is
  named `"Super Admin"`, which is NOT a key in that map, so a user holding only that role resolves
  to no permissions and CMS create/read return HTTP 403. Assign/rename the role to a value present
  in `defaultRolePermissions` (e.g. `admin`) for authoring to work.
- The publish-validation hook (`src/hooks/validatePublishPermissions.ts`) rejects writes whose
  locale isn't in the user's `allowedLocales`. Governed seed/factory scripts should set
  `LINKSITES_FACTORY_MODE=1` (or run in bootstrap mode with no users) to bypass it.

### web-master frontend
- Runs standalone with no DB in mock mode (`NEXT_PUBLIC_CMS_PROVIDER=mock`, the default in
  `.env.example`); set the provider to `payload` and `PAYLOAD_BASE_URL` to the CMS to read live CMS
  content. `.env.local` is git-ignored.
- The homepage redirects `/` -> `/en` (next-intl locale routing).
- Run it on a different port from the CMS with `PORT=3001 pnpm dev`. Do NOT use
  `pnpm dev -- -p 3001`; the `--` passes `-p` as a positional and Next treats it as a project dir.

### Lint
- `apps/web-company` is a paused starter and its `next lint` script is broken on Next 16 (turbo
  `pnpm lint` fails there). Lint the active apps directly:
  `pnpm --filter @linksites/web-master lint` and `pnpm --filter @linksites/cms lint`.
