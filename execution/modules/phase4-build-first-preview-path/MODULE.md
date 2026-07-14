---
module_id: "phase4-build-first-preview-path"
title: "Phase 4 — Build-first preview path"
status: "in_progress"
parent_program: "linksites-manual-alignment"
objective: "Build the manual's build-first-sell-later preview production model (manual §10) on top of Phase 2 (Program Ledger) and Phase 3 (reusable-asset factory): matching a new lead to a reserved Reusable Site Foundation, adapting it into a real preview, and eventually tracking a Preview Inventory and Proof Level engine, per audit/14_implementation_roadmap.md's Phase 4 description."
scope:
  - "Foundation matching: hard filters on real data (status/Kit/tier/reservation) + a recency ranking signal + auto-reserve (done: phase4-foundation-matching-001, GAP-16 first slice)"
  - "Proof Level engine: Levels 0-4, versioned Proof Specifications, budget-disposition checking, history-preserving escalation, explicitly separate from paid tier (done: phase4-proof-level-engine-001, manual §10.8)"
  - "Preview Inventory portfolio snapshot: pure aggregation of Foundation/reservation/adaptation data into the metrics that data can support today (done: phase4-preview-inventory-001, manual §10.38 first slice)"
  - "Conversion Lock: locks a Foundation relationship on Sales-authorized, Stripe/Odoo-referenced conversion, blocking recycling (done: phase4-conversion-lock-001, manual §10.33)"
  - "Preview Deployment record object: deployment identity, isolation (no shared analytics identity), noindex-by-default, servability/expiration (done: phase4-preview-deployment-001, manual §10.25)"
  - "Outcome Record + Sales-outcome-to-technical-disposition mapping: the single, deterministic, type-enforced mapping from Sales's CRM vocabulary to LiNKsites' technical action vocabulary (done: phase4-outcome-record-001, manual §10.31)"
  - "Conversion Lock wired into archiveAndRecycleFoundation() as an optional, backward-compatible recycle-blocking gate (done: phase4-deployment-outcome-wiring-001)"
out_of_scope:
  - "The manual's full multi-factor Foundation ranking (engagement evidence, content fit, conversion objective, distinctiveness, historical quality, adaptation effort, rendering cost, operational simplicity) -- requires telemetry/data this repository does not have yet"
  - "The manual's remaining Foundation hard filters with no backing data yet: content availability, design-profile compatibility, locale/script, runtime mode, integration availability, accessibility status, performance budget, security policy, incident/suspension status"
  - "Real Preview generation itself -- depends on the still-absent Promotion Service Payload-backed target (GAP-50) and a real content-production pipeline"
  - "A real orchestrator that automatically calls createLock()/archiveAndRecycleFoundation() from an OutcomeRecord's technical disposition -- OutcomeRecord's requiresConversionLock()/requiresRecycling() predicates exist but are unwired to any automatic trigger"
  - "A real Stripe/Odoo integration behind Conversion Lock's opaque refs -- blocked on cross-Program access (GAP-33/34/35)"
  - "The manual's full seven-object inventory model -- no real deployed-preview or Sales-outcome integration exists to back further objects beyond what's built"
phases: []
read_first:
  - ".cursor/execution/INDEX.yaml"
  - "execution/PROGRAM.md"
  - "audit/14_implementation_roadmap.md (Phase 4 section)"
  - "docs/specs/linksites-program-manual/10_preview_inventory_and_build_first_sell_later_production_model.md"
read_forbidden:
  - "unrelated modules"
module_definition_of_done:
  - "Preview Inventory and Proof Level engine exist and are tested (manual §10's exit criteria, not yet formally restated here in full)."
  - "A prospect can be matched to a Foundation, a preview built, and the Foundation correctly locked/recycled based on conversion outcome."
optional_fields:
  risk_summary:
    - "This module depends on Phase 3's reusable-asset factory (done) and, for anything beyond Foundation matching itself, on the still-open Promotion Service Payload-backed target (GAP-50) and real content production, neither of which exist yet."
  notes:
    - "Issues completed so far: phase4-foundation-matching-001, phase4-proof-level-engine-001, phase4-preview-inventory-001, phase4-conversion-lock-001, phase4-preview-deployment-001, phase4-outcome-record-001, phase4-deployment-outcome-wiring-001. Seven real, tested objects/integrations, 219 passing tests in packages/factory-catalog (up from 128 when this module was created). This module was created because Foundation matching (GAP-16, a specifically-named open gap tracked across several prior work batches) is genuinely Phase 4 scope per the manual's own phase ordering, not Phase 3 -- it decides which Foundation feeds the first real Preview build, not which reusable assets exist. Every Issue in this module was built with an explicit, honestly-documented scope boundary against data/integrations this repository does not have (Sales telemetry, live Stripe/Odoo, live Payload/hosting) -- see each Issue's own PROOF.md open_gaps for specifics. Remaining Phase 4 work needs either real cross-Program access (Stripe/Odoo, GAP-33/34/35) or real content-production/live-hosting infrastructure (GAP-50) to progress further; this module has otherwise built everything genuinely buildable without those."
---

# Module

## Objective

See front matter.

## Scope

### In Scope

- See front matter.

### Out Of Scope

- See front matter.

## Phases

No formal phase-level checkpointing has been introduced yet; Issues are tracked directly under this module (see `execution/modules/phase4-build-first-preview-path/issues/`).

## Progressive Disclosure Inputs

### Read First

- See front matter.

### Read Forbidden

- See front matter.

## Module Definition Of Done

See front matter.

## Roll-Up Semantics

Same as Phase 2/3's modules -- Issue completion rolls into module progress; module completion requires the module definition of done AND mandatory module review, which has not occurred yet for any Issue in this module.

## Gate Notes

- Readiness gate: satisfied for all seven Issues in this module (each Issue's dependencies are prior, completed Issues in this or the Phase 3 module).
- Review gate: NOT yet satisfied at module level.
- Integration gate: all seven Issues have been merged into `development` alongside the rest of this session's work (per Carlos's explicit merge authorization), but independent review has not occurred.

## Review Requirements

Module review is mandatory before this module should be treated as complete. This has not occurred yet.

## Progressive Disclosure

Read next (most recent Issue first):

1. `execution/modules/phase4-build-first-preview-path/issues/phase4-deployment-outcome-wiring-001/ISSUE.md`
2. its `PROOF.md`
3. the other six Issues' `ISSUE.md`/`PROOF.md` pairs in this module's `issues/` directory as needed

## Remaining Phase 4 Scope (not yet started)

- A real orchestrator connecting an `OutcomeRecord`'s technical disposition to `ConversionLockRegistry.createLock()` / `archiveAndRecycleFoundation()` automatically.
- A real `PayloadDraftTarget`/hosting-backed Preview Deployment -- blocked on GAP-50 (live Payload/Postgres) and real content production.
- A real Stripe/Odoo integration behind Conversion Lock's opaque refs -- blocked on cross-Program access (GAP-33/34/35).
- The manual's full seven-object inventory model, cost/conversion/coverage-rate portfolio metrics, and full multi-factor Foundation ranking -- all need data (cost ledgers, Sales telemetry, engagement history) this repository does not have.
