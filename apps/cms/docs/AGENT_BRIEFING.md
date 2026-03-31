# Agent Briefing

Date: Dec 22, 2025

## 1. Project Overview
- Multi-site content management platform (PayloadCMS + Next.js) with public read APIs and authenticated write workflows.
- Tech stack: PayloadCMS 3.69.0, Next.js 16.1.0 (App Router), React 19.1.0, TypeScript 5.7.3, PostgreSQL/Supabase.
- Status: Functionally production-ready; all tests pass; production build still blocked by TypeScript errors in `scripts/` (see `KNOWN_ISSUES.md`).

## 2. Quick Start
- Prereqs: Node 18.20.2+ or 20.9+, pnpm 9/10, PostgreSQL or Supabase connection string.
- Setup: `cp .env.example .env` and fill database + auth secrets.
- Install: `pnpm install`
- Dev server: `pnpm dev` (Next.js + Payload local admin at http://localhost:3000/admin)
- Tests: `pnpm test` (runs vitest integration then Playwright e2e); or `pnpm test:int`, `pnpm test:e2e`.
- Build (blocked today): `pnpm build` → TypeScript errors in `scripts/` (see `KNOWN_ISSUES.md`).
- Admin access: create an admin user via `scripts/create-first-user*.ts` helpers or Payload admin UI after starting dev server.

## 3. Architecture Summary
- 26 collections + 5 globals with site scoping and locale-aware content.
- Multi-site: per-request site scoping enforced via `src/hooks/enforceSiteScope.ts`.
- Multi-locale: locales `en`, `zh-TW`, `es` with validation in publishing hooks.
- Key features: workflow/publish permissions, translation queue, navigation/media, API key auth, public read APIs.
See `ARCHITECTURE.md` for full detail.

## 4. Current State (Wave 3 baseline)
- Working: Dev server, APIs, admin, public read endpoints, hooks, workflows, security controls.
- Tests: 19/19 passing (vitest + Playwright).
- Security: 0 critical/high vulnerabilities; one moderate dev-only item (esbuild CORS).
- Blockers: Production build fails on `scripts/` TypeScript errors; see VAL-001/VAL-002 in `KNOWN_ISSUES.md`.

## 5. Key Files & Locations
- Collections: `src/collections/`
- Hooks: `src/hooks/`
- Tests: `tests/` (integration, e2e, contracts)
- Scripts: `scripts/` (dev utilities; currently TypeScript errors)
- Config: `src/payload.config.ts`
- Docs: `docs/` (this folder); archives in `docs/archive/`

## 6. Common Tasks
- Add a collection: clone an existing collection in `src/collections/`, register in `src/payload.config.ts`, add access controls and hooks as needed, update types via `pnpm run generate:types`.
- Run tests: `pnpm test` or scoped `pnpm test:int` / `pnpm test:e2e`.
- Lint: `pnpm lint` (ESLint via Next).
- Database migrations: use Payload migrations in `src/migrations/`; for Supabase, ensure SSL and run migrations before deploy.

## 7. Known Issues & Workarounds
- VAL-002 (blocker): Production build blocked by `scripts/` TypeScript errors. Workaround: run dev server; exclude `scripts/` from build if needed temporarily.
- VAL-001: TypeScript errors in `scripts/` (dev utilities). Fix or temporarily exclude from tsconfig build scope.
- VAL-003: ESLint warnings (non-blocking). Run `pnpm lint` and address.
See `KNOWN_ISSUES.md` for full details.

## 8. Branch Structure
- Main: production-ready baseline.
- Work branches (planned for Wave 5): `callisto`, `europa`, `titan`, `enceladus`.

## 9. Testing Strategy
- Integration: `vitest` against application logic (`tests/int`, `tests/contracts`).
- E2E: `playwright` against Next.js front/admin flows.
- Contract/business logic: located under `tests/contracts/`.

## 10. Important Notes
- Always run tests before committing; keep `scripts/` TypeScript fixes prioritized.
- Do not bypass site scoping or locale validation; they are critical to permissions.
- `scripts/` directory is dev-only—avoid including in production artifacts until errors are resolved.
- For security posture and history, see `SECURITY_AUDIT.md`; for migrations, see `MIGRATION_GUIDE.md`.
