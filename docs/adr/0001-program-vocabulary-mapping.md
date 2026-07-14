# ADR 0001 — Program/Module/Stage/Issue/Run ↔ Suite/Module/Project/Phase/Issue/Assignee/Run Mapping

- **Status:** Accepted
- **Date:** 2026-07-13
- **Decided by:** Carlos (Decision DR-04, `audit/13_decision_and_contradiction_register.md`)
- **Context source:** LiNKsites Program Manual (`docs/specs/linksites-program-manual/`) vs. always-applied workspace rule `07-suite-project-terminology.mdc` (IDE Development workspace)

## Context

Two authoritative-sounding vocabularies exist for describing governed work:

1. **LiNKsites Program Manual** (internal, engineering-facing): `Program → Module → Stage → Issue → Run`, with LiNKsites itself as one Program decomposed into 20 Modules (M01–M20), executed by Executors, gated by Gates.
2. **LiNKaios-approved UI vocabulary** (company-wide, user-facing): `Suite → Module → Project → Phase → Issue → Assignee → Run`, where "Module" means a vendor-published catalog recipe inside a Suite, "Project" means one tenant's live instantiation of that recipe, and "Run" maps to a Plane Cycle.

These vocabularies were never reconciled and, notably, **both reuse the word "Module" for different concepts** — the manual's Module is an internal engineering division of the LiNKsites Program itself; the LiNKaios vocabulary's Module is a vendor-published template catalog entry inside a Suite. Left unresolved, this risked silent confusion in any future cross-system reporting or dashboard work.

## Decision

Carlos directed: **define the mapping now, and follow the manual** — i.e., the LiNKsites Program Manual's vocabulary remains authoritative for all LiNKsites-internal engineering artifacts (code, schemas, database tables, Issue/Run records, work packets). The LiNKaios-facing vocabulary is used only at the presentation boundary, when/if LiNKsites data is ever projected into a LiNKaios dashboard — it does not replace or rename any LiNKsites-internal object.

## The mapping

| Manual concept (LiNKsites-internal, authoritative) | Nearest LiNKaios-facing concept | Relationship |
|---|---|---|
| **LiNKsites** (the whole Program) | **Suite** | LiNKsites presents itself as one subscribed Suite in LiNKaios's catalog, when/if it is ever surfaced there. |
| **Module** (M01–M20; an internal engineering division of the Program itself, e.g. "Preview Intake," "Paid Order Intake") | *(no direct equivalent — see note below)* | The manual's Module is an internal factory subsystem, not a customer-facing template recipe. It does **not** map to LiNKaios's "Module" (a vendor-published catalog recipe). Do not conflate these. |
| A specific **customer's website production instance** as it moves through the relevant Modules/Stages (M06–M19) for one site | **Project** | This is the correct mapping point: one tenant's live, in-progress (or completed) website production run is a "Project" in LiNKaios vocabulary, exactly matching LiNKaios's definition ("tenant-created live work"). |
| **Stage** (an ordered segment inside a Module) | **Phase** | Direct conceptual match — both are ordered sub-groupings of work inside a larger unit. |
| **Issue** (smallest atomic, schedulable, governed unit of work) | **Issue** | Same word, same concept — no translation needed. |
| **Executor** (script, service, AI agent, browser automation, or human that performs a Run) | **Assignee** | Direct conceptual match — "who runs the Issue." |
| **Run** (one immutable execution attempt of an Issue) | **Run** (maps to a Plane Cycle) | Caution: the manual's Run is scoped to *one Issue's* execution attempt; the LiNKaios vocabulary's Run is described as "one pass through project modules" — a broader, project-level cycle. **These are not the same granularity.** When/if LiNKsites Issue-level Runs are ever surfaced in a LiNKaios Project view, they should be presented as sub-events within one LiNKaios-level Run/Cycle, not conflated with it. |

## Consequences

- LiNKsites code, schemas, and internal documentation continue to use `Program/Module/Stage/Issue/Run/Executor` exactly as the manual defines them. **No renaming of LiNKsites-internal objects is required or permitted by this ADR.**
- If a future LiNKaios-facing dashboard needs to display LiNKsites data, the presentation-layer mapping above is the approved translation — implement it as a display/reporting adapter, not as a rename of the underlying LiNKsites data model.
- The Run-granularity mismatch (Issue-level Run vs. Project-level Run/Cycle) must be handled explicitly in any future reporting adapter — do not silently roll up multiple LiNKsites Runs into one LiNKaios Run without preserving the distinction.
- This ADR resolves manual audit Decision DR-04. No further action is required unless a LiNKaios-facing LiNKsites dashboard is scoped in a future phase, at which point this ADR should be referenced and, if needed, superseded with implementation-specific detail.

## Alternatives considered

- **Do nothing / defer indefinitely:** rejected by Carlos — explicit instruction was to define now.
- **Rename LiNKsites-internal vocabulary to match LiNKaios's:** rejected — would contradict the Program Manual's own authority (manual §24 §3: the manual is reconciled current doctrine for LiNKsites engineering) and would require touching every LiNKsites-internal schema/code reference for no functional benefit today.
