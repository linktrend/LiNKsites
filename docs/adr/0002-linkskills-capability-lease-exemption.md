# ADR 0002 — LiNKsites Exemption from LinkSkills Capability Leases (Interim)

- **Status:** Superseded by ADR 0003
- **Date:** 2026-07-13
- **Decided by:** Carlos (Decision DR-03, `audit/13_decision_and_contradiction_register.md`)
- **Context source:** LiNKsites Program Manual §01/§02/§24 §4 vs. always-applied workspace rules `02-ecosystem-boundaries.mdc`, `05-security-cost-and-side-effects.mdc` (IDE Development workspace)

## Context

The IDE Development workspace's always-applied rules state that "All external side effects must be governed through LinkSkills capability leases in the MVO design, even if the implementation is simplified," and list risky side effects (sending emails, publishing public sites, writing to CRM, creating invoices, charging payments, modifying production workflows, deploying infrastructure) that should be governed this way.

The LiNKsites Program Manual, by contrast, is explicit that LiNKsites is an **independent Program**: "LiNKaios is postponed and not a LiNKsites dependency" (manual §24 §4), and OpenClaw is "an external oversight adapter, not the runtime/control plane" (same). Nothing in the manual's own internal doctrine (Sections 01–23) describes a LinkSkills capability-lease wrapper for any LiNKsites action — the manual's own equivalent concepts (Executor capability envelopes, §18.70; the Capability Broker, §22.27-29) are LiNKsites-internal constructs, not references to the company-wide LinkSkills system.

This is a genuine, unresolved tension between two authoritative-sounding sources at different organizational scopes (logged as Decision DR-03).

## Decision

Carlos agreed with the audit's recommendation: **LiNKsites is exempt from routing its external side effects through the company-wide LinkSkills capability-lease system for now**, using its own lighter-weight logging/governance instead. This exemption is **interim, not permanent** — it will be revisited once LiNKsites has built its own internal Program Ledger (Phase 2 of `audit/14_implementation_roadmap.md`) and governance layer.

## Rationale

- Building full LinkSkills integration before LiNKsites has even its own governance layer (Program Ledger, Executor capability envelopes) would be premature — there is no LiNKsites-internal governed action model yet to *wrap* with a company-wide lease.
- The manual's own doctrine gives LiNKsites a complete, self-sufficient internal governance model (Program Ledger, Gates, Executor capability envelopes, Capability Broker, Approval Records) that does not presuppose LinkSkills. Building that internal model first, then deciding how (or whether) to bridge it to LinkSkills, is lower-risk than building both simultaneously or guessing at an integration contract that doesn't yet exist on either side.
- Revisiting later carries low rework cost: LiNKsites' own Executor capability envelope (manual §18.70) and Capability Broker (manual §22.27-29) are structurally similar to a capability-lease pattern already — a future LinkSkills bridge would likely be an adapter around these, not a rewrite.

## Scope of the exemption

- Applies to LiNKsites-internal side effects governed by its own future Program Ledger/Executor model (Payload publish actions, preview builds, n8n webhook triggers, future Stripe/Odoo Adapter calls, future AI-provider media-generation calls).
- Does **not** exempt LiNKsites from any other always-applied workspace rule (secrets management via GSM, no committed credentials, branch/PR discipline, etc.) — this ADR is narrowly scoped to the LinkSkills capability-lease requirement only.
- Does **not** apply to any other LiNKtrend repository or system — this is a LiNKsites-specific, Carlos-approved exception.

## Revisit trigger

Revisit this decision once **Phase 2 (Program core and governed execution)** of the implementation roadmap is substantially built — at that point, a follow-up ADR should evaluate whether LiNKsites' own Executor capability envelope should become (or be wrapped by) a LinkSkills capability lease.

## Alternatives considered

- **Full LinkSkills integration now:** rejected — no LiNKsites-internal governance model exists yet to integrate against; would slow Phase 1/2 for no near-term benefit.
- **Permanent exemption:** rejected — Carlos's decision is explicitly interim, tied to a future re-evaluation trigger, not a standing policy.
