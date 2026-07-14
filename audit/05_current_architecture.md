# 05 — Current-State Architecture

## Observed topology (as code/config describe it, not as verified live)

```
Visitor
   │
   ▼
[Cloudflare — documented in docs/ops/VPS_REVERSE_PROXY_AND_CLOUDFLARE.md, not present as executable config in deploy/]
   │
   ▼
Traefik (deploy/docker-compose.deploy.yml)
   ├─ Host(cms.linktrend.internal)              → apps/cms  (Payload, Next.js 16 / React 19)
   └─ HostRegexp({subdomain}.linktrend.internal) → apps/web-master (Next.js 14.2 / React 18.3), priority 10 (preview)
                                                     apps/web-company (Next.js 14.0 / React 18.2) — not wired into deploy compose

apps/web-master
   └─ CMS provider switch (config/env.config.ts): default = "mock" content client;
      "payload" provider only when NEXT_PUBLIC_CMS_PROVIDER=payload is set explicitly.
   └─ Hostname → Site ID resolution: src/lib/site-context.ts
      priority: dedicated SITE_ID env → site-domains hostname lookup → DEFAULT_SITE_ID fallback

apps/cms (Payload)
   └─ postgres-payload (via @payloadcms/db-postgres, Supabase-hosted Postgres reachable via DATABASE_URI)
   └─ 25 collections, 5 globals, site-scoped access control (src/access/index.ts)
   └─ Outbound: n8n webhook trigger on publish (triggerRebuild.ts); inbound webhook middleware
   └─ Admin custom views: Approval Queue, Translation Queue, Site Dashboard

supabase/ (schema lsites_core)
   └─ sites, site_domains, content/sync tables; RLS by site_id via current_setting('app.site_id')
   └─ No @supabase/supabase-js client anywhere — accessed as plain Postgres, not via Supabase SDK/Data API in code

packages/{types,ui,blocks,config,utils}
   └─ types: real (LocaleCode, SiteId, imports Supabase JSON schema as data contract)
   └─ ui, blocks, config, utils: placeholder stubs (`export {}`)

sites_specs/, sites_projects/, library/
   └─ Narrative/legacy — not machine-readable Site Specification instances, not on the active factory path
```

## What this current state actually is, versus the manual's target vocabulary

- There is **no Program Ledger** (Issues/Runs/Gates/Events per manual §04/§20) anywhere in the repository. Workflow state, if any, lives implicitly in Payload's own `workflowFields` (draft/pending/published) and in ad hoc n8n webhook calls — not in a governed, auditable ledger.
- There is **no Component Registry as a machine-readable, versioned object** (manual §07) — the closest analog is `apps/web-master/docs/components/index.json`, which is documentation of 77 components, not a governed registry with the 15-field record schema, lifecycle states, or compatibility matrix the manual requires.
- There is **no Vertical Kit, Tier Specification, Design Intelligence Catalog, or Reusable Site Foundation object** (manual §06/§08) anywhere in code or schema — these exist only as manual doctrine and as narrative text in `sites_specs/`.
- There is **no Preview Inventory, Proof Level engine, or conversion-lock mechanism** (manual §10/§13) — `apps/web-master` has a single template (`marketing-smb-v1`) and no reservation/lineage/recycling data model.
- There is **no cross-Program integration surface** (Integration Ledger, Odoo Adapter, Stripe ingress, Sales contracts — manual §21) — 0 code hits for Odoo, Stripe (active path), Sales, or OpenClaw.
- There **is** a real, reasonably mature Payload CMS application with genuine multi-site data modeling (`Sites`, `SiteDomains`, role/permission-scoped publish workflow) and a real, reasonably mature multi-tenant Next.js frontend with hostname-based site resolution — these are the most doctrine-aligned, reusable assets found (see `12_reusable_asset_register.yaml`).
- The **working tree itself is mid-restructure**: 1,314 uncommitted deletions remove the entire embedded `LiNKdev/` factory, `.agent/`, `.codex/skills`, and the repo's own `.cursor/{rules,skills,commands,agents}` directories, while `.cursor` is now an untracked symlink to the sibling `IDE Development` workspace's `.cursor/`. This is a live architectural transition away from an embedded-per-repo agent framework toward a shared cross-repo one — not yet committed, and not something this audit should resolve unilaterally (see Decision/Contradiction Register DR-01).

## Version-skew finding — CORRECTED 2026-07-13 (Phase 1, first CI work packet)

The original audit pass (2026-07-13, read-only) reported apparent Next.js version skew based on
**declared** `package.json` versions:

| App | Declared Next.js (package.json) | React |
|---|---|---|
| apps/cms | 16.1.0 | 19.1.0 |
| apps/web-master | 14.2.33 | 18.3.1 |
| apps/web-company | 14.0.0 | 18.2.0 |

**This was incomplete.** While implementing the first real Phase 1 work packet (fixing the CI
placeholder), local installation and testing revealed the **actually-installed** Next.js version in
every app's `node_modules` is uniformly **16.2.2** — not the declared versions above:

```
apps/cms/node_modules/next        → 16.2.2
apps/web-master/node_modules/next → 16.2.2 (declared 14.2.33)
apps/web-company/node_modules/next → 16.2.2 (declared 14.0.0)
```

**Root cause:** the root `package.json`'s `pnpm.overrides` block (intended to floor-pin CVE-affected
`next@` ranges to safe patch versions) contains several overrides whose ranges span across major
versions rather than staying within one major — for example `"next@>=13.0.0 <15.0.8": ">=15.0.8"`
and `"next@>=9.5.0 <15.5.13": ">=15.5.13"`. pnpm evaluates overrides cumulatively/cascadingly, so a
package declaring `"next": "14.2.33"` gets bumped to `>=15.0.8`, which is then itself caught by the
next broader override, and so on, until it lands on the newest override's floor — currently `16.1.5`
et al., resolved by pnpm to `16.2.2`. **This is a real, previously-undiscovered bug in the dependency
override strategy, not an intentional or harmless version-skew situation.**

**Concrete, verified consequence:** Next.js 16 removed the built-in `next lint` CLI subcommand. Since
`apps/web-master` and `apps/web-company` both declared `"lint": "next lint"` while actually running
Next 16.2.2, their lint scripts were silently broken (`Invalid project directory provided, no such
directory: .../lint`) — this is very likely why the CI placeholder (`ci.yml`) was never wired up to
run real lint/build commands: doing so previously would have failed immediately, in a confusing way,
for apps declaring an older Next.js major than what actually runs.

**Immediate fix applied (Phase 1, this same work packet):** `apps/web-master`'s `lint` script was
changed from `next lint` to `eslint src` (mirroring `apps/cms`'s already-correct pattern), and two
pre-existing real lint errors (`react/no-unescaped-entities` in `page-renderer.tsx`) were fixed.
`apps/web-company`'s lint was left out of the new CI gate (Decision DR-02 — paused, and it has no
`eslint` devDependency installed at all, a separate pre-existing gap).

**Not yet fixed (tracked as GAP-44):** the override-cascade behavior itself, and the mismatch between
every app's *declared* Next.js version and its *actual* installed version. This should be treated as
a dedicated Phase 1 work packet — likely resolved by rewriting the `pnpm.overrides` block to use
narrower, same-major version ranges (or per-app overrides) instead of the current broad ranges, then
deciding deliberately which Next.js major each app should actually run.
