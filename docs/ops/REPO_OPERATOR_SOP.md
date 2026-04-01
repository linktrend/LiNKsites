# LiNKsites Factory Kit - Repository Operator SOP

This is the step-by-step operating guide for the two active GitHub repositories used by LiNKsites Factory Kit.

Audience:
- non-technical operator
- project owner
- operations assistant
- anyone coordinating work with an AI coding assistant

Use this guide when you need to:
- understand what each repo is for
- pull the latest work from GitHub
- prepare a safe change
- push work back to GitHub
- merge work into `main`
- keep the repos clean
- recover from common git mistakes

## 1. What This System Is

LiNKsites Factory Kit is split into two main code repositories:

1. CMS repo
   - Purpose: stores and serves content, site records, domain mappings, admin workflows, and APIs
   - Local path: `/Users/linktrend/Projects/LiNKsites/apps/cms`
   - GitHub repo: `https://github.com/linktrend/website-payload-cms`

2. Frontend template repo
   - Purpose: renders the public websites that visitors see
   - Local path: `/Users/linktrend/Projects/LiNKsites/apps/web-master`
   - GitHub repo: `https://github.com/linktrend/website-master-template`

Think of it like this:
- CMS repo = the control panel and content engine
- Frontend repo = the website template and public-facing pages

## 2. Source Of Truth

GitHub is the source of truth.

That means:
1. The final official copy of work must exist on GitHub.
2. Local changes only count after they are committed and pushed.
3. `main` is the official production-ready branch in both repos.

## 3. Golden Rules

Follow these rules every time:

1. Never work directly in the wrong repo.
2. Never commit secrets.
   - Do not commit `.env`
   - Do not commit API keys
   - Do not commit passwords or tokens
3. Start by pulling the latest `main`.
4. Make changes on a branch first.
5. Merge into `main` only after checks pass.
6. Keep both repos clean.
   - "Clean" means `git status` shows no unexpected changes.
7. If you are unsure, stop and verify before pushing.

## 4. Which Repo Should I Use?

Use the CMS repo when the work involves:
- admin panel
- content collections
- site records
- domain mappings
- API endpoints
- publishing workflow
- seeding or site creation scripts

Use the frontend repo when the work involves:
- website layouts
- page rendering
- navigation on the public site
- templates
- public routes
- SEO output
- theme or design behavior

If one change affects both systems, treat it as a two-repo task:
1. update CMS repo
2. update frontend repo
3. push both repos
4. record both release tags together later

## 5. Before You Start

Open Terminal and verify you are in the correct repo.

CMS repo:

```bash
cd /Users/linktrend/Projects/LiNKsites/apps/cms
```

Frontend repo:

```bash
cd /Users/linktrend/Projects/LiNKsites/apps/web-master
```

Then confirm the remote GitHub repo:

```bash
git remote -v
```

Expected result:

CMS:

```bash
origin  https://github.com/linktrend/website-payload-cms.git (fetch)
origin  https://github.com/linktrend/website-payload-cms.git (push)
```

Frontend:

```bash
origin  https://github.com/linktrend/website-master-template.git (fetch)
origin  https://github.com/linktrend/website-master-template.git (push)
```

## 6. Daily Safety Check

Run these commands before doing any work:

```bash
git status --short --branch
git branch --show-current
git fetch origin --prune
git pull origin main
```

What you want to see:
1. You are on `main` before starting a new branch.
2. There are no unexpected local changes.
3. Your local copy matches GitHub.

If `git status` shows modified files before you start:
1. stop
2. decide whether those changes are intentional
3. do not start new work on top of unknown changes

## 7. Standard Workflow For Any Change

Use this process for almost every task.

### Step 1: Go to the correct repo

Example for the frontend repo:

```bash
cd /Users/linktrend/Projects/LiNKsites/apps/web-master
```

### Step 2: Update local `main`

```bash
git checkout main
git fetch origin --prune
git pull origin main
```

### Step 3: Create a branch

Use a short descriptive name.

Examples:
- `feat/new-template-section`
- `fix/contact-form-routing`
- `docs/repo-operator-sop`
- `hotfix/domain-resolution`

Command:

```bash
git checkout -b feat/short-description
```

### Step 4: Make the change

This might be:
- editing files yourself
- asking Codex to make the change
- reviewing changed files

### Step 5: Review the change

```bash
git status
git diff --stat
```

If you want to see the full changes:

```bash
git diff
```

Check for:
1. wrong files
2. secrets
3. temporary files
4. build artifacts

### Step 6: Run checks

CMS repo:

```bash
pnpm lint
pnpm build
```

Frontend repo:

```bash
pnpm lint
pnpm build
```

If build cannot run because environment variables are missing, note that clearly in the task log or PR.

### Step 7: Stage files

Stage everything only if all files belong to the same change:

```bash
git add -A
```

If you only want specific files:

```bash
git add path/to/file
```

### Step 8: Commit

Use one of these formats:
- `feat: ...`
- `fix: ...`
- `docs: ...`
- `chore: ...`

Example:

```bash
git commit -m "docs: add repo operator SOP"
```

### Step 9: Push the branch

```bash
git push -u origin feat/short-description
```

### Step 10: Merge to `main`

Preferred path:
1. open a pull request on GitHub
2. review the file list and checks
3. merge into `main`

If you are intentionally doing a local fast-forward merge because the branch is already validated and approved:

```bash
git checkout main
git pull origin main
git merge --ff-only feat/short-description
git push origin main
```

### Step 11: Clean up the branch

Delete the local branch:

```bash
git branch -d feat/short-description
```

Delete the remote branch after merge:

```bash
git push origin --delete feat/short-description
```

## 8. Workflow For Changes That Touch Both Repos

Some work needs updates in both repos. Example:
- new site/domain logic
- CMS schema change plus frontend rendering support

Use this order:

1. update the CMS repo
2. update the frontend repo
3. run checks in both repos
4. push both branches
5. merge both branches
6. confirm both `main` branches are up to date

At the end, verify both repos:

CMS:

```bash
cd /Users/linktrend/Projects/LiNKsites/apps/cms
git status --short --branch
git log --oneline -n 3
```

Frontend:

```bash
cd /Users/linktrend/Projects/LiNKsites/apps/web-master
git status --short --branch
git log --oneline -n 3
```

## 9. How To Check Whether A Repo Is Clean

Use:

```bash
git status --short --branch
```

Clean example:

```bash
## main...origin/main
```

Not clean example:

```bash
## main...origin/main
 M README.md
?? temp-file.txt
```

Meaning:
- `M` = modified tracked file
- `??` = untracked file

If the repo is not clean:
1. decide whether the files belong to your task
2. if yes, commit them
3. if not, stop and sort them out before continuing

## 10. How To Confirm GitHub Matches Local

Use:

```bash
git fetch origin --prune
git status --short --branch
```

Healthy result:

```bash
## main...origin/main
```

Also check recent commits:

```bash
git log --oneline --decorate -n 5
```

## 11. Hotfix Workflow

Use this only for urgent production issues.

### Step 1: Start from `main`

```bash
git checkout main
git fetch origin --prune
git pull origin main
git checkout -b hotfix/short-description
```

### Step 2: Make the minimum fix only

Do not bundle unrelated work into a hotfix.

### Step 3: Validate

```bash
pnpm lint
pnpm build
```

### Step 4: Commit and push

```bash
git add -A
git commit -m "fix: short hotfix description"
git push -u origin hotfix/short-description
```

### Step 5: Merge to `main`

Merge quickly after checks and review.

### Step 6: Record the release

Use:
- `/Users/linktrend/Projects/LiNKsites/library/operations/RELEASE_LOG.md`

## 12. Release Workflow

For every production release, there should be:

1. one CMS tag
2. one frontend tag
3. one release log entry that maps the pair

Tag format:

```bash
vYYYY.MM.DD.N
```

Example:

```bash
v2026.03.02.1
```

Create a tag:

```bash
git tag -a v2026.03.02.1 -m "Release summary"
git push origin v2026.03.02.1
```

After tagging both repos, update:
- `/Users/linktrend/Projects/LiNKsites/library/operations/RELEASE_LOG.md`

## 13. Commands Reference

### Repo Identification

```bash
git remote -v
git branch --show-current
git status --short --branch
```

### Get Latest

```bash
git fetch origin --prune
git pull origin main
```

### Start Work

```bash
git checkout main
git checkout -b feat/short-description
```

### Review Work

```bash
git status
git diff --stat
git diff
```

### Save Work

```bash
git add -A
git commit -m "feat: short description"
git push -u origin feat/short-description
```

### Merge Validated Branch

```bash
git checkout main
git pull origin main
git merge --ff-only feat/short-description
git push origin main
```

### Delete Finished Branch

```bash
git branch -d feat/short-description
git push origin --delete feat/short-description
```

## 14. Common Problems And Fixes

### Problem: "I do not know which repo to use"

Fix:
1. If the change affects content structure, admin, or API, use the CMS repo.
2. If the change affects what the public website looks like, use the frontend repo.
3. If still unsure, ask before changing anything.

### Problem: "git status shows files I did not expect"

Fix:
1. stop
2. review with `git diff`
3. separate your intended work from unrelated files
4. do not push unknown changes

### Problem: "My branch will not push"

Fix:
1. confirm you are on the branch you mean to push
2. run `git remote -v`
3. run `git fetch origin --prune`
4. try again:

```bash
git push -u origin your-branch-name
```

### Problem: "main is behind GitHub"

Fix:

```bash
git checkout main
git fetch origin --prune
git pull origin main
```

### Problem: "There are merge conflicts"

Fix:
1. stop
2. do not guess
3. ask for help or have the coding assistant resolve the conflicts carefully
4. run checks again after resolution

### Problem: "pnpm build fails because env vars are missing"

Fix:
1. confirm the repo has the correct environment file for the machine
2. compare against `.env.example` or `.env.local.example`
3. retry the build

Important:
- do not commit the real `.env` file
- only commit the example env file when documentation needs updating

### Problem: "I accidentally changed local-only files"

Examples:
- `.env.local`
- `.env`
- `.DS_Store`
- build cache files

Fix:
1. do not commit them
2. check `.gitignore`
3. remove them from staging if needed:

```bash
git restore --staged path/to/file
```

### Problem: "I merged a branch locally but forgot to push"

Fix:

```bash
git checkout main
git status --short --branch
git push origin main
```

### Problem: "I think GitHub and local do not match"

Fix:

```bash
git fetch origin --prune
git status --short --branch
git log --oneline --decorate -n 5
git ls-remote --heads origin
```

## 15. Operator Checklist

Use this short checklist before ending any repo task:

1. Was I in the correct repo?
2. Did I pull the latest `main` first?
3. Did I work on a branch?
4. Did I review the file list?
5. Did I avoid committing secrets?
6. Did lint/build run, or did I clearly note why not?
7. Did I push the branch or `main` to GitHub?
8. Is `git status` now clean?
9. If this was a production release, did I tag it and update the release log?

## 16. Related Documents

Use these together with this SOP:

- Workflow overview: `/Users/linktrend/Projects/LiNKsites/LINKSITES_FACTORY_KIT_WORKFLOW.md`
- Git strategy: `/Users/linktrend/Projects/LiNKsites/library/operations/GIT_STRATEGY.md`
- Ops runbook: `/Users/linktrend/Projects/LiNKsites/library/operations/OPS_RUNBOOK.md`
- Release log: `/Users/linktrend/Projects/LiNKsites/library/operations/RELEASE_LOG.md`
