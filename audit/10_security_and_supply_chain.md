# 10 — Security, Reliability, Data, and Supply-Chain Findings

Assessed against manual §33-§39 (security architecture, secret audit, dependency/fork audit, supply-chain audit, CI/CD audit, test audit), referencing NIST SSDF / OWASP ASVS per manual §100. No secret values are reproduced anywhere in this document.

## Tenant isolation (manual §18, §33)

- **Positive evidence:** `site_id`/`site` scoping is present in both layers — Supabase RLS policy (`lsites_site_isolation`, evaluated via `current_setting('app.site_id', true)`) and Payload access-control module (`apps/cms/src/access/index.ts`) with site-scoped read filters.
- **Critical gap:** No cross-tenant negative test suite was found (GAP-06). Manual §18.84 explicitly states a suite of only successful paths is incomplete evidence. Until the 10-vector isolation matrix (§18.85) is implemented and passing, tenant isolation must be treated as **unverified**, not **verified-working**, regardless of how reasonable the access-control code looks on inspection.
- **Unresolved architecture question:** whether Payload and the Supabase working layer will ever share one physical Postgres instance via `schemaName` co-location. Manual §12.9.2 calls this experimental and requires either a version-specific safety test or the two-database fallback. No such test or explicit decision was found.

## Secrets (manual §34, §18.45-49)

- No secret values were found committed to git (`git ls-files | grep -i env` returned only `*.env.example` files across `apps/cms`, `apps/web-master`, `apps/web-company`, and `LiNKdev/skills/gstack`).
- A real `.env` exists on local disk at `apps/cms/deploy/prod/.env` but is correctly gitignored; its contents were not inspected (secret-value handling rule).
- `apps/cms/ops/render-runtime-env-from-gsm.sh` implies GSM is the intended runtime secret source, consistent with the always-applied workspace secrets rule — but this is `configured-unverified`, not confirmed live.
- **Recommendation for the implementation phase (not executed here):** run a full secret-scanning tool (e.g. gitleaks/trufflehog) across the entire git history, not just the current tree, since manual §34 requires checking "source history, CI logs, .env files, workflow definitions, images, backups, and documentation" — this audit checked the current tree and workflow files only.

## Dependency and supply chain (manual §35-§37)

- Root `package.json` carries an unusually large `pnpm.overrides` block forcing minimum versions for Next.js and Payload packages — this is evidence that known CVEs have already been proactively floor-pinned, a good sign, but was not cross-checked against a live vulnerability database in this pass.
- **Dependabot Updates workflow is broken**: repeated failing update PRs for `js-yaml`, `@babel/core`, `ws`, `undici` across the root workspace, `apps/web-master`, and the legacy `sites_projects/old_linktrend` subtree, spanning 2026-06-22 through 2026-07-10 (10 failed runs observed in the last 15 `gh run list` entries). This means dependency-vulnerability remediation PRs are not landing — a supply-chain hygiene gap (GAP-11 style item; add as a Phase 1 backlog item, root cause not diagnosed in this pass since it requires deeper CI log inspection than this audit's time-box allowed).
- CodeQL scheduled scans on `main` are passing (2026-06-23, 06-30, 07-07) — this is genuine positive supply-chain evidence.
- No SBOM generation, artifact attestation, or SLSA-style provenance was found configured anywhere in `.github/workflows/` or `deploy/`.
- Three different Next.js majors and two different React majors coexist across the three apps with no documented reconciliation plan — a maintainability and patch-surface risk (see `05_current_architecture.md`).

## CI/CD (manual §37)

- `.github/workflows/ci.yml` triggers on push/PR to `main`/`staging`/`development` but its only step is an echo of a placeholder string. It reports success unconditionally. Per manual §37 ("a badge or workflow file does not prove a healthy pipeline"), this must be treated as **no CI gate exists today**, not as evidence of quality.
- `.github/workflows/branch-source-policy.yml` is a real, working control — it enforces the `issue/*|dev/*` → `development` → `staging` → `main` promotion policy at the PR level. This is genuine, working governance and should be preserved (`reuse` disposition).

## Test baseline (manual §38)

- 9 test files exist, all under `apps/cms/tests/` (contract tests for site-scoping, publish-permissions, translation-workflow, moderation-workflow; a cache test; a performance/projections test; an integration API test; an admin-UI integration test; one Playwright e2e test for the frontend).
- `apps/web-master`, `apps/web-company`, and all `packages/*` have **zero** test files.
- No accessibility test tooling (axe-core) was found anywhere, despite manual §19 treating WCAG 2.2 AA as a non-tier-varying requirement.
- No load, failure-injection, backup/restore, or tenant-isolation-negative tests exist.

## Security-finding presumptive blockers (manual §47)

No unresolved Supabase/provider security findings involving public tables or exposed data could be verified either way in this audit — this requires a live connection to the Supabase project (out of reach in this pass). This should be the **first live-environment check** in Phase 0 continuation, since manual §47 treats such findings as presumptive release blockers until disproven.

## Working-tree hygiene (cross-cutting, manual §5/§46)

The current working tree has 1,314 uncommitted deletions and 30 uncommitted modifications (see `13_decision_and_contradiction_register.md`, DR-01). While not itself a security vulnerability, an uncommitted, half-finished structural change of this size sitting on a branch named `issue/wave9-linksites-prod` (a deploy-oriented branch) is an operational risk: if this branch were deployed as-is, the deployed artifact would not match any committed, reviewable state.
