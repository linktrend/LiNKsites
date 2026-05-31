# MVO GitHub Strategy — Four-Repo Workspace

**Status:** Canonical for MVO multi-repo development (May 2026)  
**Companion:** `LiNKdev/factory/install/WORKSPACE-GITHUB.md` (detailed policy)  
**Workspace file:** `LiNKtrend-System.code-workspace`

This document unifies Git workflow across the four active MVO repositories opened together in Cursor. **All four repos use the same branch model** — there is no separate “SOP v2” integration path.

---

## Repositories in scope

| Repo | Role | GitHub |
|------|------|--------|
| **LiNKtrend-System** | LiNKaios monorepo — control plane, suites, LinkSkills, LiNKbrain, LiNKbot wiring | `linktrend/LiNKtrend-System` |
| **LiNKbot-core** | OpenClaw fork — LiNKbot runtime engine | `linktrend/LiNKbot-core` |
| **LiNKautowork** | n8n gateway — deterministic automation plane | `linktrend/LiNKautowork` |
| **LiNKsites** | Website factory — Payload CMS, templates, publish stack | `linktrend/LiNKsites` |

**External but orchestrated:** LiNKsites product code is not in LiNKtrend-System; suite orchestration and traces live in `suites/linksites/` in System.

---

## Branch model (all four repos — unified)

Each repo maintains three stable branches: **`development`**, **`staging`**, **`main`**.

| Branch | Purpose | Who merges |
|--------|---------|------------|
| **`development`** | Integration — all issue and ad-hoc work lands here via PR | **Integrator** (after Reviewer PASS) |
| **`staging`** | Pre-production validation before release | **Principal only** (after Release OK) |
| **`main`** | Production — deploy only from tagged commits here | **Principal only** (after Release OK) |

### Work branches

| Prefix | Use | Merge target |
|--------|-----|--------------|
| `issue/<id>-<slug>` | LiNKdev issue execution (one branch per issue, LAW-05) | **`development`** (Integrator only) |
| `dev/<machine><ide>` | Optional ad-hoc IDE work per host SOP | **`development`** via PR |

### Promotion flow

```
issue/* or dev/*  →  PR to development  →  Integrator merges when merge-ready
development       →  PR to staging      →  Principal
staging           →  PR to main         →  Principal
```

**Laws:** `LiNKdev/factory/laws/LINKDEV_LAWS.md` — LAW-05 (one branch per issue; no worktrees), LAW-06 (no `staging`/`main` without Principal Release OK).

Allowed PR sources into `development` are enforced in `.github/workflows/branch-source-policy.yml` (template: `LiNKdev/factory/install/github/branch-source-policy.yml`).

---

## Cross-repo coordination

- **LiNKtrend-System** program issues may touch only System, or may specify companion PRs in sibling repos — record linked PR URLs in issue `report_path`.
- Branch names are consistent across repos (`development`, `issue/*`, `dev/*`).
- MVO proof spans repos: one LinkSites lead loop may require merges in System + LiNKsites + LiNKautowork; trace artifacts must land in LiNKbrain via System orchestration.

---

## Commit and PR conventions

- **Conventional commits:** `type(scope): summary` — `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`
- **Scope:** plane or app name (`linkaios-web`, `linksites`, `n8n-gateway`, `openclaw`)
- **PR body:** Summary, test plan, behavior proof for side-effecting changes
- **Secrets:** never commit — GSM naming `LINKTREND_[SERVICE]_[ENV]_[RESOURCE]_[IDENTIFIER]`

---

## LiNKdev program integration

When executing a LiNKdev issue (any MVO repo):

1. Read `LiNKdev/AGENTS.md` → active issue `read_first` only
2. Branch `issue/<issue-id>-<slug>` from **`development`**
3. Run `LiNKdev/factory/scripts/verify.sh` before `linkdev:merge-ready`
4. Integrator merges to **`development`** only — not `staging`/`main`
5. Write proof to issue `report_path`

Labels: `LiNKdev/factory/contracts/labels.md` (`linkdev:ready`, `linkdev:merge-ready`, `linkdev:done`).

---

## Fork policy (`link-*` repos)

**LiNKbot-core** is an OpenClaw fork. Modify for LiNKtrend integration; **never push upstream**.

- Upstream sync lands in **`development`** with conflict resolution before Principal promotion.
- Example: `openclaw/openclaw` → `linktrend/LiNKbot-core` **`development`**.

Nested forks (e.g. `link-n8n/` in LiNKautowork) follow the same rule — sync to **`development`**, never upstream PRs.

---

## Agent routing

| Task | Primary repo | Read first |
|------|--------------|------------|
| LiNKaios UI, suites, capabilities | LiNKtrend-System | `LiNKdev/product/grounding/` + issue |
| Bot runtime, channels, gateway | LiNKbot-core | `AGENTS.md` + scoped subtree |
| n8n workflows, automation gateway | LiNKautowork | `AGENTS.md` + compose docs |
| Payload, templates, publish | LiNKsites | `docs/README.md` + `sites_specs/` |

---

## Related docs

- **Workspace GitHub policy:** `LiNKdev/factory/install/WORKSPACE-GITHUB.md`
- **LiNKdev SPEC §8:** `LiNKdev/factory/SPEC.md`
- **Per-host branching:** `.cursor/rules/01-git-branching.mdc`
- **LiNKsites deploy policy:** `docs/BRANCHING_AND_DEPLOYMENT_POLICY.md`

See `LiNKtrend-System.code-workspace` for multi-root folder paths.
