# LiNKsites CI suite

## Decision

LiNKsites keeps one repository-owned workflow, `CI`, and the managed delivery
workflows. `CI` supplies application-specific validation; it does not replace
or alter the managed Phase, receipt, branch-source, review-ready, or promotion
policies.

The workflow is intentionally split by event:

| Event | Required LiNKsites result | Command / evidence | Why it exists |
| --- | --- | --- | --- |
| Phase PR opened, updated, reopened, or marked ready | `LiNKsites CI` | `scripts/ci-fast.sh` and its artifact | Lint, type, runtime-configuration contract, receipt-verifier, active-surface, and changed-range secret checks. The script fails after 300 seconds. |
| Final Phase PR labelled `linktrend-full-suite` | `full-production-suite` | `scripts/ci-required.sh` and `linksites-full-suite-<head>` | Exact-Fast receipt, application tests/builds, Supabase RLS, focused browser proof, Docker, deployment contract, and recovery rehearsal. The checkout and receipt use the exact Phase head SHA. |
| Promotion PR to `staging` or `main` | `LiNKsites Promotion Receipt` | `scripts/ci_full_suite_receipt.py verify` | Reuses an unexpired successful `full-production-suite` artifact only when the Git tree and lockfile identity match. It never runs the Full application suite. |

The managed `Linktrend Fast Checks`, `Linktrend Full Suite`, `Linktrend Receipt
Gate`, and `Linktrend Branch Source Policy` remain separate required delivery
controls. In particular, the managed receipt is still the authority for the
managed delivery identity. The LiNKsites promotion receipt additionally proves
that the application-specific Full suite passed for the identical tree.

## Inventory and classification (2026-08-14)

| Before check / workflow | Before trigger | Classification | After disposition and protected risk |
| --- | --- | --- | --- |
| `CI / required-production-gate` | Push to `development`, `staging`, `main`; all PRs | MOVE | Becomes `LiNKsites CI`, Phase PR only. It protects source quality, runtime configuration, receipt-parser correctness, retired-surface exclusion, and changed-range secrets. Checkpoint pushes and promotions provided duplicate or irrelevant execution. |
| `CI / full-production-suite` | `ready_for_review` on any PR to `development` | MOVE | Runs once only on the final Phase label and exact head. It protects application, data/RLS, migration dependency, browser, Docker, deployment, recovery, and dependency risks. |
| `CI / required-production-gate` on promotion | Promotion PRs | CONSOLIDATE | Replaced by `LiNKsites Promotion Receipt`. Fast and secret checks are already proven by the final Phase candidate; the new job verifies the retained application Full receipt instead. |
| `CI / full-production-suite` on promotion | Not selected, but a skipped required check remained | REMOVE | The Full suite is never executed during promotion; exact-tree receipt verification is required instead. |
| `Linktrend Fast Checks` | Phase PR updates / reconciled manual canary | KEEP | Managed exact-head Phase and cancellation control. It remains a distinct managed delivery check. |
| `Linktrend Full Suite` | Final Phase label / reconciled manual canary | KEEP | Managed exact-head receipt and final-candidate lifecycle. It is not modified here. |
| `Linktrend Development Receipt Gate` and `Linktrend Main Receipt Gate` | Promotion PR events | KEEP | Managed identity verification, no candidate-code execution. |
| `Linktrend Branch Source Policy` | PRs to protected branches | KEEP | Blocks invalid source branches. |
| `LiNKtrend Cleanup Merged Branches` | Manual dispatch | ADVISORY | Operational cleanup, never a merge requirement. |
| `LiNKtrend Repair Observer` | Managed event observer | ADVISORY | Operational diagnosis; its high repetition is managed-system behavior and is out of this change scope. |
| CodeQL | Dynamic GitHub security analysis | KEEP | Security analysis; not altered by this repository-owned CI change. |
| Dependabot Updates | GitHub-managed schedule | ADVISORY | Dependency maintenance, not a branch-merge check. |

## Command-level reduction (revision after PR #164 baseline)

| Component | Decision | Coverage / boundary |
| --- | --- | --- |
| Full lint and typecheck | REMOVE | The final workflow requires successful exact-head `CI` before Full. |
| CMS production build | KEEP (one execution) | `cms-production-build` runs `pnpm --filter @linksites/cms run build` exactly once. `test:local` remains test-only. |
| Generic web pre-build | REMOVE | Recovery owns the authoritative URL-specific web build. |
| Duplicate runtime test | REMOVE | `deploy/tests/*.test.mjs` includes it. |
| Blanket skipped/todo regex | REMOVE | Required suite exit statuses remain fail-closed. |
| Per-candidate audit | SCHEDULED / ADVISORY | Weekly/manual production-dependency audit at high severity. |
| Browser discovery | KEEP, corrected | Resolves Playwright installed Chromium, not only system Chrome. |
| Component timings and coverage manifest | KEEP, added | JSONL timestamps/results plus `full-required-coverage.json` fail closed when any declared mandatory component is absent. |
| Runtime preflight and browser bindings | KEEP, consolidated | Before application builds/tests, Node 22, pnpm, Docker, Supabase and one Playwright Chromium bootstrap are verified. The exact resolved browser path is bound separately to `W2_02_CHROMIUM_EXECUTABLE` and `W2_04_CHROMIUM_EXECUTABLE`; the Full script rejects a missing binding rather than provisioning a second browser. |
| Docker validation | PATH-LIMIT | The fail-closed classifier builds all images for shared, deployment, lockfile, unknown, or unreadable changes; isolated mapped service changes build only their image(s). Classification is uploaded as evidence. |
| Recovery rehearsal | KEEP / SCHEDULED | The candidate Full retains a destructive disposable recovery proof. A weekly/manual hosted recovery workflow supplies comprehensive recurrence. Separate disposable Supabase instances remain intentional: the recovery rehearsal destructively truncates/restores state and cannot safely share the migration/RLS or CMS test database. |
| pnpm, Playwright, Turbo, BuildKit caches | KEEP | Lockfile/source-keyed caches accelerate inputs only. They never count as component evidence or replace a test/build. |

The #164 baseline Full ran 9m55s and failed only at recovery-browser discovery.
The first revised Full ran 9m50s but exposed an omitted CMS production build;
it is not a releasable receipt. The next exact-head candidate must show the
coverage manifest, including `cms-production-build`, before its receipt is
accepted. GitHub's timing API does not report billable ARM minutes, so elapsed
time—not an invented billing value—is the recorded measure.

## Required-check contract

The branch rules must name only checks that active workflows actually produce:

| Branch | Required contexts |
| --- | --- |
| `development` | `Linktrend Branch Source Policy`, `Linktrend Fast Checks`, `LiNKsites CI`, `Linktrend Full Suite`, `full-production-suite`, `Cursor Bugbot` |
| `staging` | `Linktrend Branch Source Policy`, `Linktrend Receipt Gate`, `LiNKsites Promotion Receipt` |
| `main` | `Linktrend Branch Source Policy`, `Linktrend Receipt Gate`, `LiNKsites Promotion Receipt` |

Cancelled, skipped, missing, or neutral checks are not accepted as successful.
`Cursor Bugbot` belongs only to the final Phase candidate; requiring it on a
promotion head would name a check no active promotion workflow produces.

## Measurements and rollback

The 12 most recent legacy `CI` runs sampled on 2026-08-14 had an average
executing job duration of 37 seconds (median 41 seconds); eight succeeded and
four failed. Two of the failures were promotion receipt misses, while the
remaining promotion executions repeated Fast and secret scanning after the
candidate had already been tested. The managed workflow history in the same
sample also shows cancellation of obsolete Phase work.

Expected per accepted Phase candidate: one Fast application run (maximum five
minutes, historically about 41 seconds), one final Full application run, and
no application Full rerun on the two promotions. Relative to the prior flow,
this removes the three branch-push Fast/secret executions and replaces the two
promotion Fast executions with short receipt checks. Exact GitHub billed
minutes are unavailable from the GitHub Actions timing endpoint for these
ARM-hosted runs, so this is an elapsed-time estimate rather than a billing
claim.

Rollback is surgical: restore `.github/workflows/ci.yml`,
`scripts/ci-fast.sh`, and `scripts/ci-secret-scan.sh` from the preceding
commit, then restore the captured branch-ruleset JSON for rule IDs
`20623043`, `20623044`, and `20623046`. That restores each retired check name
and trigger without changing managed workflow files or product behavior.
