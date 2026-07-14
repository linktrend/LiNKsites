---
module_id: "phase3-reusable-asset-factory"
title: "Phase 3 — Reusable asset and assembly foundation"
status: "in_progress"
parent_program: "linksites-manual-alignment"
objective: "Build the manual's reusable-asset factory objects (Vertical Kit, Tier Specification, Design Intelligence Catalog, Component Registry, Reusable Site Foundation -- manual §06-§08) as real, versioned, tested code, so deterministic assembly can eventually produce valid sites from versioned specifications."
scope:
  - "packages/factory-catalog: Tier Specification + entitlement enforcement (this session)"
  - "Vertical Kit schema and lifecycle (next)"
  - "Design Intelligence Catalog and token hierarchy (next)"
  - "Component Registry machine object (apps/web-master/docs/components/index.json is documentation only today, per GAP-07 -- needs a real governed schema)"
  - "Reusable Site Foundation manifests and adaptation contracts"
out_of_scope:
  - "The Promotion Service (Supabase working -> Payload draft) -- separate Phase 3 Issue, needs a live Supabase/Payload connection to test meaningfully beyond types"
  - "Real Vertical Kit content for the Home Services pilot vertical (Decision DR-06) -- that requires business/content input from Carlos or Sales research, not something to invent"
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
    - "Issues completed so far: phase3-tier-specification-001 (this session)."
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
