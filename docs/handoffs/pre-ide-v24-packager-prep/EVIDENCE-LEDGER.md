# Evidence ledger — focused/fast only (no Full)

Phase candidate: `phase/pre-ide-v24-accepted-consolidation`  
Integration HEAD at evidence capture (before handoff commit): `16e384bcd4386eeca920fd0aa1b0b12677ba62a2`  
Tree: `f2ed3c777fbb564735165de6ef52370443ad6b28`  
Base: `d773991729db7a2f9cfbf0d26cd0e3b312efef77`  
Captured: 2026-08-17T14:51:11Z  
Scope: focused contract tests + affected package tests/typecheck + diff/shell checks. **Full suite intentionally not run.**

## Commands and results

| Command | Exit |
| --- | --- |
| `pnpm install --frozen-lockfile --prefer-offline` | 0 |
| `node --test scripts/tests/test_affected_docker_images.mjs scripts/tests/test_ci_cache_contract.mjs scripts/tests/test_factory_catalog_exports.mjs scripts/tests/test_full_required_components.mjs scripts/tests/test_full_runtime_preflight_contract.mjs scripts/tests/test_recovery_diagnostics_contract.mjs scripts/tests/test_verify_docker_build_contract.mjs` | 0 (7 pass) |
| `git diff --check` | 0 |
| `git diff --exit-code` / `git diff --cached --exit-code` | 0 |
| `git diff --check origin/development...HEAD` | 0 |
| `pnpm --filter @linksites/types test` | 0 (27 pass) |
| `pnpm --filter @linksites/types typecheck` | 0 |
| `pnpm --filter @linksites/factory-catalog test` | 0 (287 pass / 4 skipped) |
| `pnpm --filter @linksites/factory-catalog typecheck` | 0 |
| `pnpm --filter @linksites/program-ledger test` | 0 (139 pass / 1 skipped) |
| `pnpm --filter @linksites/program-ledger typecheck` | 0 |
| `pnpm --filter @linksites/program-orchestrator test` | 0 (62 pass) |
| `pnpm --filter @linksites/program-orchestrator typecheck` | 0 |
| `bash -n` on changed CI/proof shell scripts | 0 |

## Explicitly not run

- Linktrend Full Suite / `full-production-suite`
- Hosted master-template paired proof
- Staging/main promotion receipt generation
- Bugbot request
- PR open/update

## Hosted historical evidence (source tips; not re-run here)

- PR #164 accepted head: hosted Fast + application Full previously green on `99716bb…` (see PR checks).
- PR #180 tip: hosted Fast green on `f758632…`; Full intentionally deferred on that PR body.
- Item5 / closed #184: historical checks on earlier SHAs; accepted tip includes post-close hardening on the issue branch.
