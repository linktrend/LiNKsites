# LiNKsites Factory Kit - Pricing & Packaging SOP

This SOP standardizes how offers are packaged and sold.

Business model:
- Build first, sell later.
- Keep delivery fast and repeatable.
- Upsell only controlled custom work.

## 1) Plan Definitions

## Standard Plan (default, most clients)

Delivery model:
- Runs on shared multi-tenant platform.
- Client domain mapped to their `siteId`.
- Content managed in central CMS.

Includes:
1. Template-based site setup.
2. Basic content updates through defined CMS scope.
3. Hosting on shared platform.
4. SSL and domain mapping support.
5. Basic uptime monitoring.

Excludes:
1. Full redesign.
2. Net-new custom product features.
3. Dedicated server/resources.

## Premium Plan (isolated frontend)

Delivery model:
- Dedicated frontend deployment (same VPS, isolated service/container).
- Still uses central CMS by `siteId`.

Includes:
1. Everything in Standard Plan.
2. Isolated frontend runtime.
3. Priority incident handling window.

Excludes:
1. Custom backend rewrite.
2. Unlimited feature development.

## 2) Custom Work Policy

Allowed custom work (paid add-on):
1. Small layout/content adjustments inside existing template capability.
2. Minor section reorder, style adjustments, extra page blocks.
3. Limited integration wiring that already exists in platform capabilities.

Not allowed as “small custom work”:
1. New CMS collections or core schema changes for one client only.
2. New product modules (booking engine, custom portals, payment flows) unless separately scoped.
3. Unlimited revision loops.

Rule:
- If request affects many future clients, treat it as template/platform investment.
- If request is one-off and heavy, quote as separate project.

## 3) Sales-to-Delivery Workflow SOP

1. Build demo on subdomain (`clientname.linktrend.media`).
2. Send demo link with “take it as is + optional add-ons” framing.
3. If client accepts:
   - choose Standard or Premium
   - collect domain access/DNS action
4. Map domain and go live.
5. Apply only approved scoped custom items.

## 4) Scope Guardrails (To Protect Margin)

1. Every sale must have a written scope summary.
2. Every custom request must be classified:
   - included
   - add-on
   - out of scope
3. Out-of-scope items need change-order approval before work starts.

## 5) Recommended Commercial Structure

Use this structure consistently:

1. One-time setup fee
2. Monthly fee for hosting/maintenance/content operations
3. Premium isolation surcharge (monthly and/or one-time)
4. Custom add-ons as separate line items

## 6) Handover / Ownership SOP

If ownership transfer is part of the sale:

1. Confirm payment terms completed.
2. Transfer domain ownership only after contractual trigger is met.
3. Keep CMS tenant (`siteId`) and content ownership records documented.
4. Keep a rollback/support period after handover (recommended: defined in contract).
