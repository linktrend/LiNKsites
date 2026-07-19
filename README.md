# LiNKsites

LiNKsites is LiNKtrend's autonomous website factory and managed SMB website service. It assembles governed reusable foundations into real prospect previews and paying-customer sites, promotes content through a trusted Payload CMS path, and hosts them on a shared Next.js platform — with Sales owning commercial lifecycle and human day-to-day involvement limited to strategy and exceptional escalation.

Legacy name: Dev_Sites Website Factory (renamed **LiNKsites**).

## Start here (source of truth)

These documents are the current, authoritative description of this Program. If anything elsewhere in this repo (including older docs under `docs/archive/`) disagrees with them, **these win**:

- **[`docs/LINKSITES-INTENT.md`](docs/LINKSITES-INTENT.md)** — why LiNKsites exists, who it's for, scope, and what "done" means.
- **[`docs/LINKSITES-TECHNICAL-PRD.md`](docs/LINKSITES-TECHNICAL-PRD.md)** — the exhaustive technical reference: architecture, the twenty-Module lifecycle, CMS/Supabase, hosting, integrations, and exactly what is and isn't built.
- **[`docs/LINKSITES-OPERATIONS-MANUAL.md`](docs/LINKSITES-OPERATIONS-MANUAL.md)** — a plain-English handbook for the Principal: what your role is, how a site is born, and what isn't available yet.

For the day-to-day engineering build log, open/deferred items, and every "what was actually done and why" entry, see **[`docs/OPEN-ISSUES.md`](docs/OPEN-ISSUES.md)** (append-only; the honest record of what's real).

## Layout

```
LiNKsites/
├── apps/
│   ├── cms/           # Payload CMS (draft/published content authority)
│   ├── web-master/    # Primary multi-tenant Next.js frontend
│   └── web-company/   # Smaller starter template (investment paused; see OPEN-ISSUES)
├── packages/
│   ├── program-ledger/   # Issue/Run/Gate/Event + Postgres store
│   ├── factory-catalog/  # Vertical kits, foundations, promotion, preview path
│   └── types/            # Shared types
├── supabase/          # Migrations for lsites_ledger + lsites_sites (+ archive)
├── deploy/            # Docker + Traefik compose for CMS + shared frontend
├── audit/             # Phase 0 audit deliverables + living roadmap notes
├── execution/         # Program/Module/Issue execution artifacts
└── docs/              # Intent, Technical PRD, Operations Manual, OPEN-ISSUES; archive/
```

Older experiment/project copies previously under `sites_projects/` were archived to root `archive/` (preserved for reference, not part of the active build) — see `archive/old_linktrend-legacy-corporate-site/ARCHIVED.md`.

## Usage (short)

- The CMS lives in `apps/cms` and stores content for all sites.
- The primary website platform lives in `apps/web-master` (hostname → site).
- Sites are served in shared platform mode (many sites on one Next.js runtime). Premium/dedicated spin-off remains a tier/hosting-class concept, not a second equal primary codebase today.
- Factory work is recorded in `@linksites/program-ledger` and driven through `@linksites/factory-catalog` executors (see Technical PRD).

## Status

**Core CMS/frontend + Program Ledger + Phase 3/4 factory objects are real and tested on `development` (as of 2026-07-19).** Live Sales/Stripe/Odoo activation, full autonomous monitoring/backup, and the first real paying-customer pilot remain deliberately open — see Technical PRD §9 and Operations Manual "Current status."

Superseded documentation (24-section Program Manual, ADRs, ops SOPs, etc.) is under [`docs/archive/`](docs/archive/README.md).
