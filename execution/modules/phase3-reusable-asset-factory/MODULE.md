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
  - "Site Assembly Manifest: deterministic resolution of a Site Specification + Prospect Adaptation into an ordered page/component plan (done: phase3-site-assembly-manifest-001, manual §07)"
  - "Promotion Service: Supabase working package -> Payload draft, with idempotency/checksum-conflict detection and readback verification (done: phase3-promotion-service-001, manual §12)"
  - "Program Ledger <-> factory-catalog integration for both of the above via real executors (done: phase3-assembly-and-promotion-ledger-integration-001)"
  - "Research-grounded provisional business defaults (tier page-counts/change-allowances/CMS-access/illustrative pricing, Home Services Kit promoted to active, one real visual style with WCAG-verified accessibility) -- done: phase3-business-defaults-001, per Carlos's explicit 2026-07-14 instruction"
out_of_scope:
  - "A real PayloadDraftTarget backed by live Payload/Postgres -- needs live infrastructure not available in this environment (GAP-50); an in-memory test double stands in today"
  - "LiNKtrend's actual cost structure/margins or a final approved price -- priceUsdPerMonthProvisional (phase3-business-defaults-001) is illustrative market-rate research only"
  - "Real, verified Home Services business copy/content -- the page-structure content (even now that the Kit is active) remains a reasonable structural default, not verified real business copy"
  - "Building any future customer-CMS-access mechanism -- futureCmsAccessCandidate (phase3-business-defaults-001) is a forward-looking data marker only"
  - "Site Specification object (per-site resolved contract combining Kit + Tier + Foundation + Design Profile + Component selections) -- done: phase3-site-specification-001"
  - "Prospect Adaptation record, reservation-matching guard, close-or-recycle lifecycle -- done: phase3-prospect-adaptation-001"
  - "Program Ledger <-> factory-catalog integration via a real executor -- done: phase3-ledger-executor-integration-001"
  - "Real Design Intelligence Catalog content from ui-ux-pro-max-skill -- not reachable from this repository; only a structural placeholder exists"
  - "Publication (Payload draft -> published) -- a separate, later authority; the Promotion Service in this module only ever writes drafts"
  - "Automatic pipeline chaining (Site Specification -> Site Assembly -> Promotion as one flow) -- each remains an independently dispatchable Issue type for now"
phases: []
read_first:
  - ".cursor/execution/INDEX.yaml"
  - "execution/PROGRAM.md"
  - "audit/14_implementation_roadmap.md (Phase 3 section)"
  - "docs/archive/specs/linksites-program-manual/08_vertical_kits_tier_specifications_and_reusable_site_foundations.md"
read_forbidden:
  - "unrelated modules"
module_definition_of_done:
  - "Deterministic assembly produces valid sites from versioned specifications (manual §63 exit gate)."
  - "Component, design, tier, and Payload mappings pass tests."
  - "Assets have rights/provenance state."
optional_fields:
  risk_summary:
    - "Numeric tier limits, launch CMS-access rule, and pilot vertical/style are now research-grounded, Carlos-approved provisional defaults (2026-07-14) rather than arbitrary placeholders, but pricing remains explicitly illustrative-only pending Carlos's real cost/margin numbers -- see phase3-business-defaults-001."
  notes:
    - "Issues completed so far: phase3-tier-specification-001, phase3-vertical-kit-001, phase3-reusable-foundation-001, phase3-design-catalog-001, phase3-component-registry-001, phase3-site-specification-001, phase3-prospect-adaptation-001, phase3-ledger-executor-integration-001, phase3-site-assembly-manifest-001, phase3-promotion-service-001, phase3-assembly-and-promotion-ledger-integration-001, phase3-business-defaults-001. Twelve real, tested objects/integrations/decisions, 128 passing tests in packages/factory-catalog (plus 36 unaffected in packages/program-ledger). GAP-04 (Promotion Service / Site Assembly Engine) remains closed at the code-object level (Site Assembly Manifest + Promotion Service, wired to the Program Ledger via dedicated executors). phase3-business-defaults-001 additionally promoted HOME_SERVICES_KIT to active and added a second real, accessibility-verified StyleFamily (TRUST_PROFESSIONAL_STYLE), so the full Site Specification / Site Assembly pipeline can now run end to end without any test-only status overrides. What remains before Phase 3's exit gate is fully met in production: a real Payload-backed PayloadDraftTarget (needs live infrastructure, GAP-50) and Carlos's final sign-off on real (non-illustrative) pricing."
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
