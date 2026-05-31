# LiNKdev wire session — LiNKsites

- **Repo:** linktrend/LiNKsites
- **Branch:** development
- **Wire agent:** Cursor (Step A)
- **Session date:** 2026-05-31

## Principal launch (only these lines)

See `LiNKdev/factory/install/PRINCIPAL-LAUNCH.md`.

| Step | Status |
|------|--------|
| A — `EXECUTE-WIRE-LINKDEV.md` | **complete** |
| B — `EXECUTE-LINKDEV-UI-AUTOMATIONS.md` | **pending_codex_ui** |
| C — `EXECUTE-WIRE-LINKDEV-POST-UI.md` | **blocked** until B complete |
| 8 — Go (Planner) | **blocked** — MVO program home is LiNKtrend-System; no Go on this repo per `PROGRAM.md` |

## UI automations (Step B)

- **Status:** pending_codex_ui
- **Principal launches Codex with:** `Execute the EXECUTE-LINKDEV-UI-AUTOMATIONS.md prompt in LiNKdev/factory/install/`
- **Prep:** `wire-automation-setup.md` ready for Codex log rows; automation READMEs under `LiNKdev/factory/install/automations/`.

## Step C block

Step C (`EXECUTE-WIRE-LINKDEV-POST-UI.md`) requires all five core automations in `wire-automation-setup.md` with **Created=Y** and **Trigger verified=Y**. Do not launch Step C until Step B is **complete**.

## Checklist (CHECKLIST.md)

### §0 Prerequisites — complete

- [x] Branches: `development`, `staging`, `main` present locally and on origin
- [x] GitHub remote: `gh repo view` → `linktrend/LiNKsites` (GitHub default branch `main`; integration branch `development`)
- [x] Cursor/Codex accounts: assumed enabled for deployed instance (not verifiable from CLI)
- [x] Principal policy: **Go**, **Continue**, `staging`/`main` promotion are Principal-only per SPEC

### §1 Copy pack — complete

- [x] `LiNKdev/` at repository root
- [x] `.cursor/rules/00-linkdev-bootstrap.mdc` present (identical to `LiNKdev/factory/install/portable-cursor/.cursor/rules/00-linkdev-bootstrap.mdc`)
- [x] `LiNKdev/README.md` and `LiNKdev/factory/SPEC.md` present
- [x] Product rules: `.cursor/rules/` includes host rules (`01`–`07`, `10`–`12` LinkSites policy)

### §2 GitHub labels — complete

- [x] `LiNKdev/factory/scripts/install-labels.sh` exited 0 (15 definitions)
- [x] All `linkdev:*`, `runtime:*`, `tier:*` labels visible via `gh label list`

### §3 GitHub Actions guard — complete

- [x] `.github/workflows/linkdev-guard.yml` on `development`
- [x] Enabled when workflow file is on `development` (no Principal toggle required)

### §4 Cursor automations — pending_codex_ui

- [ ] LiNKdev-orchestrator — merge to `development`
- [ ] LiNKdev-reviewer — `linkdev:review-ready`
- [ ] LiNKdev-integrator — `linkdev:merge-ready`
- [ ] LiNKdev-executor-cursor — `linkdev:ready` + `runtime:cursor`

### §5 Codex automations — pending_codex_ui

- [ ] LiNKdev-executor-codex — `linkdev:ready` + `runtime:codex`

### §6 Skills — complete

- [x] `LiNKdev/skills/SKILLS_CATALOG.md` present
- [x] Bootstrap rule points to `LiNKdev/skills/` (not flat `.cursor/skills/` bodies)
- [x] Canonical agent entry: `LiNKdev/AGENTS.md` via bootstrap (host `AGENTS.md` template also present at repo root — not LiNKdev program entry)

### §7 Product program — complete

- [x] `LiNKdev/product/programs/linksites/PROGRAM.md` exists (status: awaiting-planner; execution target stub — canonical MVO program is `linktrend-system` on LiNKtrend-System)
- [x] No `LiNKdev/product/STATE.md` in this repo (expected per PROGRAM.md)
- [x] Planner / issue-group automations deferred (not this repo’s program home)

### §8 Go — not executed (Principal only; not applicable on this repo for MVO program)

- [ ] Principal **Go** runs in LiNKtrend-System program home only

### §9 Proof of wire — blocked until Step B + C

- [ ] Dry-run test issue: executor automation fired
- [ ] Report contains proof block
- [x] `verify.sh` exits 0 (Step A proof below)

## Agent log

### Commands run (Step A)

```bash
cd /Users/linktrend/Projects/LiNKsites
git branch -a
# * development, main, staging; remotes origin/development, origin/main, origin/staging

gh repo view --json nameWithOwner,defaultBranchRef,url
# {"nameWithOwner":"linktrend/LiNKsites","defaultBranchRef":{"name":"main"},"url":"https://github.com/linktrend/LiNKsites"}

LiNKdev/factory/scripts/install-labels.sh
# OK: labels ensured on linktrend/LiNKsites (15 definitions)

gh label list --limit 200 | grep -E 'linkdev:|runtime:|tier:'
# 11 linkdev:* + runtime:cursor + runtime:codex + tier:standard + tier:critical

diff -q .cursor/rules/00-linkdev-bootstrap.mdc LiNKdev/factory/install/portable-cursor/.cursor/rules/00-linkdev-bootstrap.mdc
# (no output — identical)

LiNKdev/factory/scripts/verify.sh
# == verify passed == ; VERIFY OK: tier A gates passed ; exit 0
```

### verify.sh summary (Step A proof)

```
== LiNKdev verify (tier=standard scope=LiNKdev) ==
state json ok
VERIFY OK: no obvious secret assignments in LiNKdev
VERIFY OK: scripts present
VERIFY OK: contracts json valid
== verify passed ==
== LiNKdev gates tier=A scope=LiNKdev program=— report=— ==
GATE OK:   verify_subset
GATE OK:   secrets_scan
GATE SKIP: proof_block_present (no --report)
GATE SKIP: allowed_files_respected (no --report)
GATE SKIP: working_tree_clean (no --report)
== gates summary tier=A passed=2 skipped=3 failed=0 ==
VERIFY OK: tier A gates passed
```

**Result:** Step A checks pass. UI automations remain **pending_codex_ui**.
