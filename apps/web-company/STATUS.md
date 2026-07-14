# Status: `apps/web-company` — Special Case, Paused

**Decision:** DR-02, `audit/13_decision_and_contradiction_register.md`
**Decided by:** Carlos
**Date:** 2026-07-13

## What this app actually is

Despite `README.md`'s framing as a generic "Company-Site Template" for the LiNKsites factory,
`apps/web-company` was **originally started as a special-case build of the LiNKtrend company's own
website** (linktrend.media / corporate presence), not as a reusable customer-facing template.

This is a genuine exception to the LiNKsites Program Manual's usual doctrine — LiNKtrend's own
corporate site is not a paying LiNKsites customer, and this app does not need to satisfy the same
multi-tenant/Vertical-Kit/Tier-Specification doctrine that customer sites do (manual §01/§03/§08).

## Current disposition

- **Paused, not abandoned.** It may already be partially or substantially finished.
- **Do not delete.** Preserve all existing code, docs, and history.
- **Not part of the active customer-facing pipeline.** `apps/web-master` is the shared, multi-tenant
  frontend that actually serves paying LiNKsites customers today (see `audit/05_current_architecture.md`).
  `apps/web-company` should not receive further customer-factory-oriented investment (Vertical Kit
  wiring, tier enforcement, hostname multi-tenancy) until its status changes.
- **Next step (when picked back up):** confirm current completion state against the LiNKtrend
  corporate site's actual requirements, decide whether to finish it as the LiNKtrend company site,
  retire it in favor of another approach, or fold any reusable pieces (theming, i18n routing, layout
  patterns) back into `apps/web-master`/`packages/*` as shared assets.

## Do not

- Do not treat this app's README literally as evidence that it is (or should become) a second
  general-purpose customer template — that framing predates this clarification.
- Do not assume it is safe to delete or repurpose without Carlos's further input, even though it is
  currently idle.
