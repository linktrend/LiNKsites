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

## Version-skew finding

| App | Next.js | React |
|---|---|---|
| apps/cms | 16.1.0 | 19.1.0 |
| apps/web-master | 14.2.33 | 18.3.1 |
| apps/web-company | 14.0.0 | 18.2.0 |

Three different Next.js majors/minors and two different React majors coexist in one monorepo with no documented compatibility/upgrade plan found. This is a repository-audit finding, not a recommendation to upgrade during this read-only phase (manual §5 forbids version changes during audit).
