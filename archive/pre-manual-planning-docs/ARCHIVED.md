# ARCHIVED — Pre-manual planning documents

**Archived:** 2026-07-14, per Carlos's explicit instruction to clean up repository content that
does not relate to the LiNKsites Program Manual's intent, as part of a hardening/testing pass
before the Supabase/Odoo integration phases.

## What this is

Early planning documents written before the 24-section LiNKsites Program Manual
(`docs/archive/specs/linksites-program-manual/`) was ingested into this repository on 2026-07-13. Three
groups are archived here:

- `sites_specs/` — three narrative architecture/specification `.txt` documents describing a
  simpler "LiNKsites Factory Kit" model. Already flagged for retirement in
  `audit/12_reusable_asset_register.yaml` (`asset-sites-specs-narrative-docs`, disposition
  "retire (with lineage preserved, not deleted)") during the initial audit, which deliberately did
  not touch it (read-only audit). This cleanup pass executes that already-recorded disposition.
- `product/` — four pre-manual product docs (`260327`/`260330`/`260331` PRDs and the "Master
  Template Website Improvement Proposal v 4.0"), previously at `docs/product/`.
- `reference/` — five pre-manual "LiNKsites Factory Kit" planning/workflow docs (architecture
  notes, workflow overview, approach evaluation, implementation plan, template creation guide),
  previously at `docs/archive/reference/`.

## Why these, specifically, and not the rest of `docs/archive/reference/`

All eight archived documents describe the same simpler, pre-manual mental model (one shared
Next.js platform + one central Payload CMS + a simple "template" concept + an optional premium
dedicated frontend) using vocabulary and structure the Program Manual has since replaced with much
more rigor: Vertical Kit, Tier Specification, Reusable Site Foundation, Component Registry, Site
Assembly Manifest, Program Ledger, Proof Level, Preview Inventory, Conversion Lock, etc. (all now
real, tested code in `packages/factory-catalog` and `packages/program-ledger`). Leaving these
prominently in `docs/archive/reference/` and `docs/product/` risked a future reader citing the old,
simpler "Template Creation Guide" or "Implementation Plan" as if it were still current doctrine,
when the manual and this repository's own `execution/` and `packages/factory-catalog/` records are
now authoritative.

The remaining `docs/archive/reference/` documents (`GODADDY_DNS_SETUP.md`, `SUPABASE_SETUP.md`,
`VPS_DEPLOYMENT_GUIDE.md`, `security_best_practices_report.md`) were deliberately **NOT** archived
— they are narrow, still-useful operational how-to guides (DNS records, a Supabase connection
walkthrough, a VPS layout outline, a secret-scanning report) that the manual does not replace with
its own equivalent, and remain directly relevant to the still-upcoming Supabase/hosting work.

## Why archived, not deleted

Per the manual's own doctrine (do not delete/rewrite without preserving lineage) and this
repository's existing convention (see `archive/old_linktrend-legacy-corporate-site/ARCHIVED.md`
for the same pattern applied to a different asset): nothing here is deleted. These documents may
still be useful as historical context, or for extracting a specific idea (e.g. the DNS/VPS
approach they describe is directionally consistent with, not contradicted by, the manual) — but
they are not the current source of truth for how LiNKsites works.

## If this needs to be referenced again

Treat it as historical input only. Any idea worth reusing should be re-expressed in the manual's
current vocabulary and, where applicable, as real code in `packages/factory-catalog`,
`packages/program-ledger`, or a new `execution/` Issue — not by reviving these documents in place.
