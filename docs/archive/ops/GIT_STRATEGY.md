# LiNKsites Factory Kit - Git Strategy

This strategy applies to the two active git repositories:

- CMS: `/Users/linktrend/Projects/LiNKsites/apps/cms`
- Shared frontend: `/Users/linktrend/Projects/LiNKsites/apps/web-master`

Both repos currently use `main` as the default branch.

## Goals

1. Keep `main` always deployable.
2. Make hotfixes fast and safe.
3. Keep release history clear enough for rollback.

## Branch Model

Use a lightweight trunk model:

1. `main`
   - Production-ready branch.
2. `feat/<short-description>`
   - New work (example: `feat/template-lawncare-v1`).
3. `fix/<short-description>`
   - Normal bugfixes (example: `fix/navigation-filter`).
4. `hotfix/<short-description>`
   - Urgent production fixes (example: `hotfix/tenant-domain-resolution`).
5. `release/<version>`
   - Optional short-lived stabilization branch for large releases.

## Commit Rules

1. Keep commits small and focused.
2. Message format:
   - `feat: ...`
   - `fix: ...`
   - `docs: ...`
   - `chore: ...`
3. Never commit secrets (`.env`, API keys, private tokens).

## Pull Request / Merge Rules

1. Open PR to `main`.
2. Require passing CI checks.
3. Require at least one review before merge (even if from AI-assisted workflow).
4. Use squash merge for cleaner history unless preserving multiple commits is important.

## Release Tags

Tag both repos for every production release.

Recommended tag format:
- `vYYYY.MM.DD.N`
- Example: `v2026.02.17.1`

Tag message should include:
1. Short summary of release.
2. Breaking changes (if any).
3. Rollback notes.

## Hotfix Flow

1. Create `hotfix/...` branch from current `main`.
2. Apply minimal fix only.
3. Validate fix quickly (build + smoke test).
4. Merge to `main`.
5. Tag a new patch release immediately.

If a release branch is active:
1. Cherry-pick hotfix into that release branch too.

## Rollback Flow

Two rollback levels:

1. App rollback (preferred first)
   - Redeploy previous known-good image/tag for CMS or frontend.
2. Data rollback (high risk, last resort)
   - Use DB backups only if data corruption occurred.

Standard rollback steps:
1. Identify last known-good release tag.
2. Redeploy that tag.
3. Run smoke tests:
   - home page loads
   - tenant domain resolves
   - CMS admin accessible
4. Record incident and root cause before next release.

## Multi-Repo Release Rule

Because CMS and frontend are separate repos, every production release should produce:

1. CMS tag
2. Frontend tag
3. Release note entry mapping the pair

Keep this mapping in a simple release log (recommended file):
- `/Users/linktrend/Projects/LiNKsites/library/operations/RELEASE_LOG.md`
