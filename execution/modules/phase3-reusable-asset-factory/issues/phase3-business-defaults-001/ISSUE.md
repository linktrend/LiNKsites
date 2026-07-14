---
issue_id: "phase3-business-defaults-001"
title: "Research-grounded provisional business defaults: tier limits, pilot vertical promotion, one visual style, launch-time CMS access rule"
status: "review_ready"
parent_program: "linksites-manual-alignment"
parent_module: "phase3-reusable-asset-factory"
parent_phase: ""
depends_on:
  - "phase3-tier-specification-001"
  - "phase3-vertical-kit-001"
  - "phase3-design-catalog-001"
objective: "Carlos explicitly instructed that engineering should not wait on final commercial/business decisions, and directed quick web research to ground the previously-arbitrary tier/vertical/style placeholders in realistic 2026 small-business-website market norms, on the explicit condition that every value stays trivially changeable later. This Issue records that research, applies the resulting defaults, and implements Carlos's explicit CMS-access clarification: no customer of any tier gets CMS access at launch."
scope:
  - "packages/factory-catalog/src/tierSpecification.ts: Standard/Premium page-count and change-allowance defaults, customerCmsAccess launch-time uniform 'none', new futureCmsAccessCandidate roadmap field, new priceUsdPerMonthProvisional illustrative-only field"
  - "packages/factory-catalog/src/verticalKit.ts: promote HOME_SERVICES_KIT from 'candidate' to 'active'; align its per-tier page-variant limits with the updated Tier Specification defaults"
  - "packages/factory-catalog/src/designCatalog.ts: add TRUST_PROFESSIONAL_STYLE, a second, real, 'active' StyleFamily with WCAG-verified contrast, alongside the existing PLACEHOLDER_STYLE_FAMILY test fixture"
out_of_scope:
  - "LiNKtrend's actual cost structure, margins, or a final approved price -- priceUsdPerMonthProvisional is illustrative market-rate research only, explicitly not an approved price; Carlos must still set the real number"
  - "Real, verified Home Services business copy/content -- the page-structure content remains a reasonable structural default, not verified real business copy"
  - "Building the future customer-CMS-access capability itself -- futureCmsAccessCandidate is a forward-looking data marker only, no access-granting mechanism is implemented"
inputs:
  - "Web research (2026-07-14): small-business website package page counts (5-8 starter, 10-15 business/growth tiers), maintenance-plan change-request allowances (~2-6/month at comparable price points), and small-business color-psychology/font-pairing guidance (blue for trust/stability, Montserrat+Open Sans for 'confidence and versatility')"
expected_outputs:
  - "Updated tierSpecification.ts, verticalKit.ts, designCatalog.ts with research-grounded, Carlos-approved provisional defaults, all trivially editable later"
acceptance_criteria:
  - "Standard's maxPages falls within the researched 5-8 page range; Premium's falls within the researched 10-15 page range; Premium always exceeds Standard"
  - "Every tier's customerCmsAccess is 'none' at launch, with no exception for Enterprise"
  - "futureCmsAccessCandidate is false for Standard and true for Premium/Enterprise, as a forward-looking-only marker"
  - "priceUsdPerMonthProvisional is present and increasing from Standard to Premium, and deliberately absent for Enterprise"
  - "HOME_SERVICES_KIT.status is 'active' and passes assertKitIsProductionReady() without any test override"
  - "TRUST_PROFESSIONAL_STYLE is 'active', accessibilityContrastPassed is true, and that claim is independently re-verified by a WCAG relative-luminance contrast calculation performed in the test itself (not merely asserted)"
proof_requirements:
  - "Test run showing all new/updated tests passing, 128/128 total in packages/factory-catalog; program-ledger's own 36 tests unaffected"
review_requirements:
  - "Independent reviewer confirms every changed numeric value is clearly commented as either research-grounded-but-provisional or explicitly illustrative-only, per Carlos's instruction that nothing here should be mistaken for a final commercial commitment"
integration_requirements:
  - "Merge via the existing consolidated branch/PR for this batch"
suggested_role_types:
  - "backend-developer"
read_first:
  - "packages/factory-catalog/src/tierSpecification.ts"
  - "packages/factory-catalog/src/verticalKit.ts"
  - "packages/factory-catalog/src/designCatalog.ts"
read_forbidden: []
blocking_questions: []
optional_fields:
  priority: "high"
  risk_level: "low -- values remain structurally identical to the prior placeholders (same fields, same shape), only the numbers/status/comments changed; every prior test still needed only surgical, well-understood fixes"
  research_citations:
    - "Small-business starter website packages typically span 3-8 pages (Onyxarro, Keka Web Studio, Horizons Design, VVRapid, XBTECH Studio, 2026)."
    - "Business/growth-tier packages typically span 10-15 pages (XBTECH Studio, Upgrade Digitals, 2026)."
    - "Comparable monthly maintenance/website-management plans in the $75-$500/month range typically include roughly 1-6 content-update allowances per month, scaling with price (Boostify USA, Bochi Web, Expressive Web Design, Upgrade Digitals, 2026)."
    - "Blue conveys trust/stability/competence in small-business color psychology, a strong fit for a trades/home-services vertical (Peter Avey, 2026); the 60/30/10 color-allocation rule and a maximum of two font families are widely recommended for brand consistency (Monolit, Peter Avey, 2026); Montserrat+Open Sans is a commonly recommended pairing for 'confidence and versatility.'"
---

# Issue

## Objective

See front matter.

## Scope / Out Of Scope / Inputs / Expected Outputs / Acceptance Criteria

See front matter.

## Proof Requirements / Review Requirements / Integration Requirements

See front matter and `PROOF.md`.

## State Semantics

`review_ready`.

## Progressive Disclosure

Read next: `PROOF.md` in this same directory.
