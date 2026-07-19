# ARCHIVED — Not part of the active LiNKsites codebase

**Archived:** 2026-07-14, per Carlos's decision (see `audit/13_decision_and_contradiction_register.md`,
and this repository's active manual doctrine at `docs/archive/specs/linksites-program-manual/`).

## What this was

A standalone Next.js corporate marketing site for LiNKtrend (pricing, platform, solutions,
enterprise, about, resources, help-center, terms, privacy pages), including a direct Stripe
checkout integration. It predates the reconciled LiNKsites Program Manual's architecture and was
never part of the pnpm workspace (`pnpm-workspace.yaml` only includes `apps/*` and `packages/*`)
— it has not been built, linted, or deployed as part of this repository's active pipeline.

## Why it's archived here instead of deleted

Per Carlos's instruction: preserve what might still be useful, stop using and stop actively
maintaining the rest. Nothing in this directory is built, tested, deployed, or referenced by any
active app (`apps/cms`, `apps/web-master`, `apps/web-company`) or package. It is kept only as a
historical/content reference.

## Why it does NOT get ported into the active codebase

- **Direct Stripe checkout integration is out of scope for LiNKsites** per the Program Manual
  (`docs/archive/specs/linksites-program-manual/21_cross_program_contracts_with_linktrend_sales_odoo_stripe_and_shared_services.md`):
  Stripe/payment handling belongs to the LiNKtrend Sales Program; LiNKsites only ever receives a
  verified **Paid Website Activation Package** after Sales confirms Stripe + Odoo state. This
  legacy app's direct Stripe SDK checkout code represents the *old*, superseded architecture, not
  a pattern to reuse — it is preserved for historical reference only, not as a code source.
- **This app's actual purpose (LiNKtrend's own corporate/marketing site) is superseded by
  `apps/web-company`**, which Decision DR-02 (`audit/13_decision_and_contradiction_register.md`)
  identifies as the current, paused, special-case build of the same site. If/when
  `apps/web-company` work resumes, its owner may reference this archive for design/copy/content
  ideas (pricing page structure, solutions/enterprise page content, etc.) — but should not copy
  code directly; `apps/web-company` follows the current shared design-token/component conventions
  documented in `.cursor/rules/12-linksites-ui-policy.mdc`, which this legacy app predates.

## What was removed from this snapshot (and why)

- `package-lock.json` and `pnpm-lock.yaml` — removed. This app is not installed or built from
  this location; the lockfiles were the primary source of ~66 of the 222 Dependabot security
  findings triaged during the Phase 0/1 audit (`audit/09_gap_and_risk_register.yaml`, GAP-42),
  all for a dependency tree that is never actually run. `package.json` itself was renamed to
  `package.json.snapshot` so it is no longer detected as a live manifest by GitHub's dependency
  graph / Dependabot scanning, while its content remains available for reference.

## If this needs to be resurrected

Do not `git mv` it back and `pnpm install` in place. Treat it as a reference only: extract the
specific page content/design pattern you need, and rebuild it inside `apps/web-company` (or its
successor) using the current shared conventions, doctrine, and dependency versions — not by
reviving this snapshot's own toolchain.
