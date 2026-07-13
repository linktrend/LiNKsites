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
- **Dependabot Updates workflow — root cause diagnosed and partially fixed (2026-07-13, GAP-48, PR #42):** the repeated failing update PRs for `js-yaml`, `@babel/core`, `ws`, `undici` were investigated by pulling the actual failed-run logs. These are **not CI pipeline failures** — Dependabot's own updater correctly determined the patched version could not be resolved within then-existing constraints and reported `security_update_not_possible` (a normal, expected Dependabot outcome, not evidence of a broken pipeline). Resolved for `js-yaml` and `@babel/core` via narrow, same-major-bounded `pnpm.overrides`; `ws` and `undici` were already covered by GAP-47's overrides. Not yet re-verified live against a Dependabot rescan (requires PRs #38-#42 to merge first).
- **Full Dependabot alert triage performed (2026-07-13, GAP-42, PRs #39/#41/#42):** of the 222 open alerts found, 66 (30%) are scoped entirely to the retired `sites_projects/old_linktrend` app (residual risk, not actively remediated — see decision needed in `09_gap_and_risk_register.yaml` GAP-42); ~34 are `next`-package advisories resolved by GAP-44/45's version-truth fix; all 6 CRITICAL findings were individually triaged, with 4 of 6 fixed directly:
  - **CRITICAL — Payload pre-authentication account takeover** (`payload < 3.79.1`) — fixed; also uncovered a more serious *internal* version mismatch within Payload's own package family (GAP-47: `payload`/`@payloadcms/next` had been silently bumped to 3.81.0 by an existing override while `@payloadcms/db-postgres`/`@payloadcms/richtext-lexical`/`@payloadcms/ui` remained at the old, vulnerable 3.69.0 — all now aligned at 3.81.0).
  - **CRITICAL — Vitest UI arbitrary file read/execution** (`vitest < 3.2.6`) — fixed (dev-tooling only, not shipped to production).
  - **CRITICAL — Next.js Authorization Bypass in Middleware** (`apps/web-company`) — covered by GAP-44/45's version-truth fix (declared version now correctly reflects the actually-running, already-patched Next.js 16.2.2).
  - **CRITICAL — Next.js RCE in React flight protocol** (`sites_projects/old_linktrend`, 2 duplicate entries) — scoped to the retired legacy app; not fixed, logged as accepted/pending-decision residual risk.
  - A representative set of HIGH/MEDIUM transitive findings (`vite`, `undici`, `minimatch`, `fast-uri`, `ws`, `form-data`, `flatted`) were also patched via the same narrow-override pattern.
- **Important lesson reinforced during this remediation:** an initial attempt to add an unbounded `"vite@>=7.3.5"` override caused pnpm to resolve `vite` to a new major (8.1.4) with an unmet peer dependency — the exact GAP-44 failure mode, caught and corrected before merging by adding an explicit upper bound (`<8.0.0`). Every override added in PRs #41/#42 is same-major-bounded; the **pre-existing** `next@`/`esbuild@`/`ajv@`/`file-type@`/`dompurify@`/`lodash@` overrides that predate this session were deliberately **not** retroactively rewritten (touching them risks undoing the already-tested GAP-44/45 Next.js migration) — this is a known residual inconsistency in the override file, not a new regression.
- **Not yet re-triaged:** the remaining ~100 medium / 31 low findings beyond the CRITICAL/representative-HIGH set above. Recommend a follow-up pass once PRs #38-#42 merge and Dependabot rescans, to see the true remaining count.
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
