# 11 — Test, CI, and Release Baseline

## Test inventory (manual §38)

| Layer | Location | Count | Status |
|---|---|---|---|
| Unit/component/contract (Vitest) | `apps/cms/tests/{contracts,cache,performance,int}` | 7 files | Present, not executed live in this audit |
| E2E (Playwright) | `apps/cms/tests/e2e/frontend.e2e.spec.ts` | 1 file | Present, not executed live in this audit |
| Frontend unit/integration | `apps/web-master`, `apps/web-company` | 0 files | Absent |
| Package-level tests | `packages/*` | 0 files | Absent |
| Accessibility (axe-core or equivalent) | anywhere | 0 files | Absent |
| Visual regression | anywhere | 0 files | Absent |
| Load/failure-injection | anywhere | 0 files | Absent |
| Backup/restore drills | anywhere | 0 files | Absent |
| Tenant-isolation negative-test matrix | anywhere | 0 files | Absent (see GAP-06, Critical) |

## CI/CD inventory (manual §37)

| Workflow | Trigger | Real gate? | Recent result |
|---|---|---|---|
| `ci.yml` | push/PR → main, staging, development | **No** — placeholder echo only | Trivial success |
| `branch-source-policy.yml` | PR → main, staging, development | Yes — enforces branch-source policy | Working (evidence: policy file content + no override PRs observed) |
| CodeQL (GitHub-managed scheduled scan) | scheduled, main | Yes — real static analysis | Passing (2026-06-23, 06-30, 07-07 per `gh run list`) |
| Dependabot Updates | dependency PR | Yes (intended) | **Broken** — 10 of last 15 recorded runs failed (js-yaml, @babel/core, ws, undici; root, apps/web-master, sites_projects/old_linktrend) |

## Release baseline

- No git tags/releases were located.
- No release/deployment manifest (Launch Manifest / Release record per manual doctrine) exists.
- `docs/ops/RELEASE_LOG.md` exists but is an empty table template — no releases have been logged through this mechanism yet.
- Payload migrations directory (`apps/cms/src/migrations/index.ts`) is an **empty array**; schema-push mode is used outside production per `payload.config.ts` logic (`NODE_ENV !== 'production'`), meaning there is currently no versioned, replayable migration history for the Payload schema — a reproducibility gap for any future production database.

## What "passing CI" currently proves (and does not prove)

Per manual §37/§46: a green `ci.yml` run currently proves only that a shell `echo` command executed successfully. It does **not** prove that the code builds, type-checks, lints cleanly, or that any test passes. A green `branch-source-policy.yml` run **does** prove that PR branch-naming/target policy was respected. A green CodeQL run **does** prove that GitHub's static-analysis scan found no flagged issues at that commit. This distinction must be preserved in any future status reporting to Carlos — do not conflate "CI is green" with "the product works."

## Recommended baseline to establish first (Phase 1 scope, not executed in this audit)

1. Replace the `ci.yml` placeholder with real `pnpm install && turbo run lint typecheck build` plus the existing Vitest/Playwright suites, gating merges to `development`.
2. Diagnose and fix (or explicitly accept with a dated waiver) the repeated Dependabot failures.
3. Add contract/unit test coverage for `apps/web-master` and `apps/web-company`, starting with the hostname→Site-ID resolution fail-closed path.
4. Add the tenant-isolation negative-test matrix from manual §18.85 before any real customer data is loaded.
5. Re-enable Payload migration generation (move off ad hoc schema-push) before any production database is created from this schema.
