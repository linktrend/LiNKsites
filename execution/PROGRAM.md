---
program_id: "linksites-manual-alignment"
title: "Bring LiNKsites into alignment with the reconciled Program Manual"
status: "in_progress"
objective: "Audit the existing LiNKsites repository against the 24-section LiNKsites Program Manual, stabilize and secure what already exists, then build the manual's required Program/execution core and reusable-asset factory in dependency order, so LiNKsites can eventually run one real customer end to end autonomously."
scope:
  - "Repository audit and Phase 0/1 stabilization (security, CI, dependency alignment)"
  - "Phase 2: Program Ledger (Issue/Run/Gate/Event/Idempotency execution core)"
  - "Phase 3 onward: reusable asset factory, preview pipeline, commercial spine, hosting operations, observability, pilot (per audit/14_implementation_roadmap.md)"
out_of_scope:
  - "Cross-Program repositories this workspace cannot reach (LiNKtrend Sales, Odoo, live Stripe) until they are made available"
  - "Any live-infrastructure (Supabase/production) verification while working remotely without a live connection"
modules:
  - module_id: "phase0-phase1-stabilization"
    path: "audit/14_implementation_roadmap.md"
  - module_id: "phase2-program-ledger"
    path: "execution/modules/phase2-program-ledger/MODULE.md"
  - module_id: "phase3-reusable-asset-factory"
    path: "execution/modules/phase3-reusable-asset-factory/MODULE.md"
  - module_id: "phase4-preview-path"
    path: "execution/modules/phase4-preview-path/MODULE.md"
  - module_id: "phase5-commercial-spine"
    path: "execution/modules/phase5-commercial-spine/MODULE.md"
  - module_id: "phase6-customer-fulfilment"
    path: "execution/modules/phase6-customer-fulfilment/MODULE.md"
  - module_id: "phase7-autonomous-hosting"
    path: "execution/modules/phase7-autonomous-hosting/MODULE.md"
  - module_id: "phase8-observability-economics"
    path: "execution/modules/phase8-observability-economics/MODULE.md"
  - module_id: "phase9-controlled-pilot"
    path: "execution/modules/phase9-controlled-pilot/MODULE.md"
  - module_id: "phase10-expansion"
    path: "execution/modules/phase10-expansion/MODULE.md"
read_first:
  - ".cursor/execution/INDEX.yaml"
  - ".cursor/execution/CANONICAL-LAWS.md"
  - ".cursor/execution/MINIMUM-RUNTIME-MODEL.md"
  - "docs/archive/specs/linksites-program-manual/24_repository_audit_implementation_roadmap_acceptance_criteria_and_glossary.md"
  - "audit/14_implementation_roadmap.md"
read_forbidden:
  - "sibling LiNKtrend repositories not reachable from this workspace"
program_definition_of_done:
  - "All manual §81 Final Program Acceptance criteria are met with verified evidence (per audit/14_implementation_roadmap.md and docs/archive/specs/linksites-program-manual §81)"
global_constraints:
  - "Follow docs/archive/policies/CONTRACT_AND_SCHEMA_VERSIONING_POLICY.md for every new contract/schema"
  - "No live-infrastructure claims without live verification; pglite/mocked verification is clearly labeled as such, never conflated with live-environment proof"
  - "Every PR stays narrowly scoped, verified locally (lint/typecheck/test/build as applicable), and stops at review_ready (draft PR) for independent review before integration"
release_requirements:
  - "Carlos (or a designated reviewer) reviews and merges each draft PR before it is treated as integrated"
optional_fields:
  owner: "Carlos (Principal)"
  decision_log_refs:
    - "audit/13_decision_and_contradiction_register.md"
  notes:
    - "Phase 0 (audit) and most of the security/stability portion of Phase 1 are complete as of PRs #36-#46 (see audit/14_implementation_roadmap.md's PR table). Phase 2 (Program Ledger) foundation is in progress as of PR #47/#48."
    - "EXECUTION MODE (Decision DR-08, 2026-07-14): Carlos rejected treating this as a slow, session-bounded effort requiring re-approval between phases. Per LiNKdeveloper doctrine, this program executes continuously: pick the next ready Issue by dependency order, execute it, produce proof, stop only at review_ready (draft PR) -- do not pause for conversational check-ins between Issues. Genuine stops are: a failing gate that cannot be resolved with available information/access, a real architectural or business decision only Carlos can make, or exhaustion of what is safely buildable without live infrastructure. This manual (docs/archive/specs/linksites-program-manual/) plus audit/14_implementation_roadmap.md IS the plan -- no separate PRD is being produced, per manual §56's own instruction that a PRD should reference, not duplicate, the manual."
---

# Program

## Objective

See front matter. This program operationalizes the LiNKsites Program Manual
(`docs/archive/specs/linksites-program-manual/`) into a bounded, evidence-driven
implementation roadmap, executed as a stack of small, independently
verifiable Issues (in practice, one draft GitHub PR per Issue in this
repository).

## Scope

### In Scope

- Everything reachable from this repository (`apps/`, `packages/`, `supabase/`, `docs/`).

### Out Of Scope

- Cross-Program repositories and live infrastructure not reachable from this workspace (see manual §8 audit scope and `audit/09_gap_and_risk_register.yaml`'s cross-Program gaps).

## Modules

Per the manual's own dependency ordering (§59: "Audit and safety baseline → canonical contracts
and target architecture → Program core and security foundations → reusable asset factory →
preview production path → paid commercial handoff → customer fulfilment and hosting operations →
observability, autonomy, and exception oversight → controlled pilot → measured expansion").

| Module | Manual Phase | Status | Path |
|---|---|---|---|
| Phase 0/1 stabilization | §60-61 | Largely complete | `audit/14_implementation_roadmap.md` |
| Phase 2: Program Ledger | §62 | In progress | `execution/modules/phase2-program-ledger/MODULE.md` |
| Phase 3: Reusable asset factory | §63 | Not started | `execution/modules/phase3-reusable-asset-factory/MODULE.md` |
| Phase 4: Build-first preview path | §64 | Not started, depends on Phase 3 | `execution/modules/phase4-preview-path/MODULE.md` |
| Phase 5: Commercial/paid-activation spine | §65 | Blocked on cross-Program access (GAP-33/34/35) | `execution/modules/phase5-commercial-spine/MODULE.md` |
| Phase 6: Customer finalization/launch | §66 | Not started, depends on Phase 5 | `execution/modules/phase6-customer-fulfilment/MODULE.md` |
| Phase 7: Autonomous hosting/lifecycle ops | §67 | Not started | `execution/modules/phase7-autonomous-hosting/MODULE.md` |
| Phase 8: Observability/economics/OpenClaw | §68 | Not started | `execution/modules/phase8-observability-economics/MODULE.md` |
| Phase 9: Controlled pilot/stabilization | §69 | Not reachable until 0-8 close | `execution/modules/phase9-controlled-pilot/MODULE.md` |
| Phase 10: Expansion/regional scaling | §70 | Not reachable until 9 closes | `execution/modules/phase10-expansion/MODULE.md` |

Module artifacts for Phases 3-10 are created just-in-time, one phase ahead of execution (per
Canonical Law 19, progressive disclosure) rather than all up front -- each will be written with a
concrete Issue breakdown when that phase actually becomes the active module, not sketched in
detail this far in advance where assumptions would go stale.

## Progressive Disclosure Inputs

### Read First

- `audit/14_implementation_roadmap.md` (current status and PR table)
- `audit/09_gap_and_risk_register.yaml` (open gaps)
- the target module's `MODULE.md`

### Read Forbidden

- Unrelated module trees not needed for the current Issue.

## Global Constraints

See front matter.

## Program Definition Of Done

See front matter (manual §81).

## Roll-Up Semantics

- Program progress rolls up from module progress.
- Program completion requires the manual §81 Final Program Acceptance criteria, not merely "all modules marked done" — per the Canonical Law that higher-level completion is stricter than lower-level completion.

## Release Requirements

See front matter.

## Progressive Disclosure

Read next:

1. the current module's `MODULE.md` (`execution/modules/phase2-program-ledger/MODULE.md` as of this writing)
2. only the Issue artifacts listed under that module
3. `audit/14_implementation_roadmap.md` again only if module-level constraints are ambiguous
