---
module_id: "phase3-reusable-asset-factory"
title: "Phase 3 — Reusable asset and assembly foundation"
status: "in_progress"
parent_program: "linksites-manual-alignment"
objective: "Build the manual's reusable-asset factory objects (Vertical Kit, Tier Specification, Design Intelligence Catalog, Component Registry, Reusable Site Foundation -- manual §06-§08) as real, versioned, tested code, so deterministic assembly can eventually produce valid sites from versioned specifications."
scope:
  - "packages/factory-catalog: Tier Specification + entitlement enforcement (done: phase3-tier-specification-001)"
  - "Vertical Kit schema and lifecycle (done: phase3-vertical-kit-001)"
  - "Reusable Site Foundation manifests, prospect-neutrality scanner, reservation exclusivity (done: phase3-reusable-foundation-001)"
  - "Design Intelligence Catalog token hierarchy + accessibility-gated admission (done: phase3-design-catalog-001)"
  - "Component Registry machine object, seeded from real web-master components (done: phase3-component-registry-001)"
out_of_scope:
  - "The Promotion Service (Supabase working -> Payload draft) -- separate Phase 3 Issue, needs a live Supabase/Payload connection to test meaningfully beyond types"
  - "Real Vertical Kit content for the Home Services pilot vertical (Decision DR-06) -- that requires business/content input from Carlos or Sales research, not something to invent"
  - "Site Specification object (per-site resolved contract combining Kit + Tier + Foundation + Design Profile + Component selections) -- done: phase3-site-specification-001"
  - "Prospect Adaptation record, reservation-matching guard, close-or-recycle lifecycle -- done: phase3-prospect-adaptation-001"
  - "Real Design Intelligence Catalog content from ui-ux-pro-max-skill -- not reachable from this repository; only a structural placeholder exists"
phases: []
read_first:
  - ".cursor/execution/INDEX.yaml"
  - "execution/PROGRAM.md"
  - "audit/14_implementation_roadmap.md (Phase 3 section)"
  - "docs/specs/linksites-program-manual/08_vertical_kits_tier_specifications_and_reusable_site_foundations.md"
read_forbidden:
  - "unrelated modules"
module_definition_of_done:
  - "Deterministic assembly produces valid sites from versioned specifications (manual §63 exit gate)."
  - "Component, design, tier, and Payload mappings pass tests."
  - "Assets have rights/provenance state."
optional_fields:
  risk_summary:
    - "Numeric tier limits (page counts, change allowances, etc.) are explicitly provisional placeholders per manual §03's deferred-decisions list -- must not be treated as real commercial commitments until Carlos approves actual values."
  notes:
    - "Issues completed so far: phase3-tier-specification-001, phase3-vertical-kit-001, phase3-reusable-foundation-001, phase3-design-catalog-001, phase3-component-registry-001, phase3-site-specification-001, phase3-prospect-adaptation-001. Seven real, tested objects, 85 passing tests in packages/factory-catalog. This closes the reusable-asset factory's core object set for this module. Next work in this area is either promotion of provisional/placeholder content to active (needs Carlos/business input, not something to invent) or the Promotion Service / Site Assembly Engine (GAP-04) which is Phase 4/5 territory."
---

# Module

## Objective

See front matter.

## Scope

See front matter.

## Phases

Not yet checkpointed; Issues tracked directly under this module.

## Module Definition Of Done

See front matter (manual §63 exit gate).

## Roll-Up Semantics

Same as Phase 2's module (see `execution/modules/phase2-program-ledger/MODULE.md`) -- Issue completion rolls into module progress; module completion requires mandatory review, which has not occurred yet for any Issue in this stack.

## Progressive Disclosure

Read next: `execution/modules/phase3-reusable-asset-factory/issues/phase3-tier-specification-001/ISSUE.md`
