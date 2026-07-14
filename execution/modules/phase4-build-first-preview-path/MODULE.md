---
module_id: "phase4-build-first-preview-path"
title: "Phase 4 — Build-first preview path"
status: "in_progress"
parent_program: "linksites-manual-alignment"
objective: "Build the manual's build-first-sell-later preview production model (manual §10) on top of Phase 2 (Program Ledger) and Phase 3 (reusable-asset factory): matching a new lead to a reserved Reusable Site Foundation, adapting it into a real preview, and eventually tracking a Preview Inventory and Proof Level engine, per audit/14_implementation_roadmap.md's Phase 4 description."
scope:
  - "Foundation matching: hard filters on real data (status/Kit/tier/reservation) + a recency ranking signal + auto-reserve (done: phase4-foundation-matching-001, GAP-16 first slice)"
  - "Preview Inventory tracking (which Foundations exist, their state, recycling history) -- not yet started"
  - "Proof Level engine (manual's tiered evidence-of-real-work model gating what a prospect is shown) -- not yet started"
  - "Conversion-lock mechanism (preventing a sold preview from being reused/recycled) -- not yet started"
out_of_scope:
  - "The manual's full multi-factor Foundation ranking (engagement evidence, content fit, conversion objective, distinctiveness, historical quality, adaptation effort, rendering cost, operational simplicity) -- requires telemetry/data this repository does not have yet"
  - "The manual's remaining Foundation hard filters with no backing data yet: content availability, design-profile compatibility, locale/script, runtime mode, integration availability, accessibility status, performance budget, security policy, incident/suspension status"
  - "Real Preview generation itself -- depends on the still-absent Promotion Service Payload-backed target (GAP-50) and a real content-production pipeline"
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
    - "Issues completed so far: phase4-foundation-matching-001. This module was created because Foundation matching (GAP-16, a specifically-named open gap tracked across several prior work batches) is genuinely Phase 4 scope per the manual's own phase ordering, not Phase 3 -- it decides which Foundation feeds the first real Preview build, not which reusable assets exist. It was built ahead of some other Phase 3/4 boundary work because it was concretely unblocked once packages/factory-catalog's Reusable Site Foundation object (Phase 3) existed."
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

- Readiness gate: satisfied for `phase4-foundation-matching-001` (its dependency, `phase3-reusable-foundation-001`, is complete).
- Review gate: NOT yet satisfied at module level.
- Integration gate: this module's one Issue has been merged into `development` alongside the rest of this session's work (per Carlos's explicit merge authorization), but independent review has not occurred.

## Review Requirements

Module review is mandatory before this module should be treated as complete. This has not occurred yet.

## Progressive Disclosure

Read next:

1. `execution/modules/phase4-build-first-preview-path/issues/phase4-foundation-matching-001/ISSUE.md`
2. its `PROOF.md`

## Remaining Phase 4 Scope (not yet started)

- Preview Inventory tracking (Foundation state/history beyond simple reservation).
- Proof Level engine (manual §10's tiered evidence-of-real-work model).
- Conversion-lock mechanism for sold previews.
- Real Preview generation -- blocked on GAP-50 (live Payload/Postgres) and real content production.
