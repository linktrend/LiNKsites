---
issue_id: "phase4-foundation-matching-001"
title: "Foundation Matching Engine (first slice): hard filters on real data + recency ranking + auto-reserve"
status: "review_ready"
parent_program: "linksites-manual-alignment"
parent_module: "phase4-build-first-preview-path"
parent_phase: ""
depends_on:
  - "phase3-reusable-foundation-001"
objective: "Build a real, honestly-scoped first slice of the Foundation-matching process (manual §08.16/§08.28/§10.18) that decides which Reusable Site Foundation to reserve for a new prospect/lead: hard filters using only data that genuinely exists today (lifecycle status, Vertical Kit match, tier match, current reservation state), a single real ranking signal (most-recently-created-first, since no engagement/telemetry data exists yet to rank by anything richer), and auto-reservation of the winner via the existing FoundationReservationManager. This closes the concrete, honestly-scoped part of GAP-16 (audit/14_implementation_roadmap.md) -- a real Preview Inventory / matching engine to decide which archived-and-recycled Foundation should be re-offered to a new lead."
scope:
  - "packages/factory-catalog/src/foundationMatching.ts: FoundationMatchingError, FoundationMatchRequest, FoundationMatchResult, findEligibleFoundations(), rankFoundations(), findAndReserveFoundation()"
  - "packages/factory-catalog/src/index.ts: export the new module"
out_of_scope:
  - "The manual's full multi-factor ranking engine (foundation reuse, vertical suitability, content fit, conversion objective, distinctiveness, historical quality, engagement evidence, adaptation effort, rendering cost, operational simplicity) -- requires engagement/telemetry/content-fit data this repository does not have yet"
  - "The manual's remaining hard filters that have no backing data in this repository yet: content availability, design-profile compatibility, locale/script, runtime mode, integration availability, accessibility status, performance budget, security policy, incident/suspension status"
  - "Persistence of match decisions/history -- this module is a pure decision function plus the existing in-memory FoundationReservationManager, no new store"
inputs:
  - "docs/specs/linksites-program-manual (manual §08.16, §08.28, §10.18)"
  - "packages/factory-catalog/src/reusableFoundation.ts (ReusableSiteFoundation, FoundationReservationManager, FoundationReservation -- prior Issue phase3-reusable-foundation-001)"
  - "audit/14_implementation_roadmap.md (GAP-16)"
expected_outputs:
  - "foundationMatching.ts with tested hard filters, ranking, and combined find-and-reserve flow"
acceptance_criteria:
  - "findEligibleFoundations() excludes Foundations that fail any single hard filter (wrong kitId, wrong tierId, non-active status, already-reserved) and includes a genuinely eligible Foundation"
  - "rankFoundations() orders eligible candidates most-recently-created first, tie-breaks deterministically by foundationId ascending on identical createdAt, and never mutates its input"
  - "findAndReserveFoundation() reserves the correctly-ranked winner and records a real, confirmable active reservation; throws FoundationMatchingError naming the requested kitId/tierId when no candidate survives the hard filters (including an empty pool); and correctly skips an already-reserved top candidate in favor of the next-best eligible one"
proof_requirements:
  - "Test run showing all 12 new tests passing, plus the 128 prior factory-catalog tests unaffected (140 total)"
review_requirements:
  - "Independent reviewer confirms the hard-filter and ranking scope claims in the doc comments match what the code actually checks -- no overclaiming beyond the 4 real hard-filter data points and the single recency ranking signal"
integration_requirements:
  - "Merge via the existing draft-PR stack once reviewed"
suggested_role_types:
  - "backend-developer"
read_first:
  - "packages/factory-catalog/src/reusableFoundation.ts"
  - "packages/factory-catalog/src/foundationMatching.ts"
read_forbidden:
  - "unrelated modules"
blocking_questions: []
optional_fields:
  priority: "high"
  risk_level: "low -- additive, delegates reservation exclusivity to the existing FoundationReservationManager, no new persistence"
---

# Issue

## Objective

See front matter.

## Scope / Out Of Scope / Inputs / Expected Outputs / Acceptance Criteria

See front matter.

## Dependency Notes

Depends on `phase3-reusable-foundation-001` for `ReusableSiteFoundation`, `FoundationReservationManager`, and `FoundationReservation`. Does not modify that Issue's file.

## Why Phase 4, Not Phase 3

This Issue is genuinely Phase 4 scope ("Build-first preview path") per the manual's own phase ordering -- Foundation matching decides which Foundation feeds the first real Preview build, not which reusable assets exist. It is being built ahead of some other Phase 3/4 boundary work in this module because it was a specifically-named open gap (GAP-16 in `audit/14_implementation_roadmap.md`) and is genuinely unblocked once `ReusableSiteFoundation` and `FoundationReservationManager` exist (they do, from `phase3-reusable-foundation-001`).

## Proof Requirements / Review Requirements / Integration Requirements

See front matter and `PROOF.md` in this directory.

## State Semantics

`review_ready`.

## Progressive Disclosure

Read next: `PROOF.md` in this same directory.
