# LiNKsites Factory Kit

Factory-style workspace for generating many SMB websites from reusable templates, backed by a centralized Payload CMS.

Previously named: "Dev_Sites Website Factory".

## Structure

```
Dev_Sites/ (workspace root)
├── library/               # Central documentation library (SOPs, runbooks, env matrix)
├── sites_specs/           # Authoritative specifications (system + architectures)
├── apps/                  # Runtime apps
│   ├── cms/               # Payload CMS app (Next.js + Payload)
│   ├── web-master/        # Primary Next.js template (starting point)
│   └── web-company/       # Smaller starter template
├── packages/              # Shared packages (types, ui, blocks, config, utils)
├── supabase/              # Supabase migrations, functions, schemas
└── sites_projects/        # Experiments / older project copies (not the primary path)
```

## Usage

- The CMS lives in `apps/cms` and stores content for all sites.
- Website templates live in `apps/web-master` and `apps/web-company`.
- Sites are served in two modes:
  - Shared platform mode (many sites on one running Next.js platform, by hostname).
  - Premium spin-off mode (dedicated frontend deployment per site, still using the central CMS by `siteId`).

## Documentation Library (Primary Entry Point)

Use the central documentation library first:

- `/Users/linktrend/Projects/LiNKsites/library/README.md`

The library includes:
- workflow and architecture references
- implementation and operations SOPs
- environment matrix and runbooks
- business/pricing SOPs
- links to source specs and active code repositories

## Legacy Top-Level Docs

These are still valid and linked from the library:
- `LINKSITES_FACTORY_KIT_WORKFLOW.md`
- `IMPLEMENTATION_PLAN.md`
- `APPROACH_EVALUATION.md`
- `TEMPLATE_CREATION_GUIDE.md`
- `LINKSITES_FACTORY_ARCHITECTURE.md`
- `VPS_DEPLOYMENT_GUIDE.md`
- `GODADDY_DNS_SETUP.md`
- `SUPABASE_SETUP.md`
