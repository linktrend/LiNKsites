---
proof_id: "proof-remove-stray-lockfile-001"
subject_type: "issue"
subject_id: "remove-stray-lockfile-001"
status: "draft"
criteria_evidence:
  - criterion: "Everything remains green after removal"
    evidence: "pnpm install, workspace-wide typecheck (6 packages), factory-catalog (230 tests), program-ledger (44 tests), CMS integration tests (18 tests), lint, both frontend builds, and pnpm audit ('No known vulnerabilities found') all confirmed after removal"
  - criterion: "Nothing references the stray lockfile"
    evidence: "Repo-wide grep for 'apps/web-master/pnpm-lock' across *.json/*.yml/*.yaml found zero matches; git log showed its only history was the original monorepo-init commit, never touched since"
artifacts:
  - "apps/web-master/pnpm-lock.yaml (deleted)"
  - "audit/12_reusable_asset_register.yaml (new asset-stray-web-master-lockfile entry)"
verification_summary:
  - "Full CI-equivalent gate green after removal, including pnpm audit reporting zero known vulnerabilities"
optional_fields:
  commands_run:
    - "find . -name pnpm-lock.yaml -not -path '*/node_modules/*' (confirmed exactly 2 lockfiles existed)"
    - "git log --oneline -- apps/web-master/pnpm-lock.yaml (confirmed it was never touched since the initial monorepo-init commit)"
    - "pnpm install"
    - "pnpm run typecheck (workspace-wide)"
    - "pnpm --filter @linksites/factory-catalog run test"
    - "pnpm --filter @linksites/program-ledger run test"
    - "pnpm --filter @linksites/cms run test:int"
    - "pnpm --filter @linksites/web-master run build"
    - "pnpm --filter @linksites/web-company run build"
    - "pnpm audit"
  open_gaps:
    - "GitHub's own Dependabot alert count will only reflect this fix after it next rescans the promoted main branch -- this is outside this repository's control (GitHub-side scan timing), not something this Issue can force synchronously."
  notes:
    - "Found while investigating why GitHub reported 26 vulnerabilities on main immediately after a prior clean promotion, despite pnpm audit reporting zero on the exact same tree. The discrepancy was real and specific (a dead, unscanned-by-pnpm lockfile with stale versions), not a caching artifact -- confirmed by GitHub's own Dependabot API naming the exact manifest_path."
---

# Proof

## Subject

`remove-stray-lockfile-001` -- removing an orphaned, dead pnpm lockfile that GitHub scanned as if live.

## Criteria To Evidence Map / Artifacts / Verification Summary

See front matter.

## Failures Or Gaps

See front matter `open_gaps`.

## Gate Guidance

Non-vacuous: the root cause was confirmed via GitHub's own Dependabot API response (which explicitly named the stray file's path for every one of the 26 findings), not guessed.
