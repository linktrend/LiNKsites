# Branching & Release SOP (LiNKsites)

## Goal
Keep `main` production‑ready at all times, with all development flowing through staging and feature branches.

## Branches
- **`main`**: Production only. Deploys to VPS from here.
- **`staging`**: Integration branch. All feature work merges here first.
- **`agent/<name>`** or **`feature/<ticket>`**: Short‑lived dev branches for each agent or task.

## Workflow (best‑practice)
1. **Create feature branch** from `staging`.
2. **Commit locally**, push to remote.
3. **Open PR** into `staging`.
4. **Resolve conflicts in PR** (not on `main`).
5. **Merge to `staging`** after checks pass.
6. **Promote to `main`** via PR from `staging`.
7. **Deploy to VPS** from `main`.

## Branch Protection (recommended GitHub settings)
- `main`:
  - Require PRs (no direct push)
  - Require status checks
  - Require linear history (optional)
  - Restrict who can push
- `staging`:
  - Require PRs
  - Require basic checks

## Why this works
- `main` stays clean and deployable.
- `staging` is where conflicts are surfaced and resolved.
- Each agent works in isolation, avoiding direct `main` edits.

## Naming conventions
- `agent/<agent-name>-<task>`
- `feature/<short-desc>`
- `fix/<short-desc>`

## Quick commands
```bash
# start new work
git checkout staging
git pull
git checkout -b agent/<name>-<task>

# push and PR
git push -u origin agent/<name>-<task>
```
