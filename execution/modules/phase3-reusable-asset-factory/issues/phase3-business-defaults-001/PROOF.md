---
proof_id: "proof-phase3-business-defaults-001"
subject_type: "issue"
subject_id: "phase3-business-defaults-001"
status: "draft"
criteria_evidence:
  - criterion: "Standard/Premium page counts fall within researched ranges; Premium exceeds Standard"
    evidence: "tests/tierSpecification.spec.ts 'research-grounded page-count defaults' block, 3 tests -- passing"
  - criterion: "Every tier's customerCmsAccess is 'none' at launch, no Enterprise exception"
    evidence: "tests/tierSpecification.spec.ts 'customerCmsAccess launch default' block, first test -- passing"
  - criterion: "futureCmsAccessCandidate correctly marked false/true/true"
    evidence: "tests/tierSpecification.spec.ts 'customerCmsAccess launch default' block, second test -- passing"
  - criterion: "priceUsdPerMonthProvisional present/increasing for Standard/Premium, absent for Enterprise"
    evidence: "tests/tierSpecification.spec.ts 'priceUsdPerMonthProvisional' block, 2 tests -- passing"
  - criterion: "HOME_SERVICES_KIT is active and passes assertKitIsProductionReady() without override"
    evidence: "tests/verticalKit.spec.ts 'HOME_SERVICES_KIT' block, updated tests -- passing"
  - criterion: "TRUST_PROFESSIONAL_STYLE's accessibility claim is independently re-verified, not just asserted"
    evidence: "tests/designCatalog.spec.ts 'TRUST_PROFESSIONAL_STYLE' block, 3 dedicated WCAG relative-luminance contrast-calculation tests (primary/white, accent/white, text/background), all independently computing the ratio in the test rather than trusting the constant's own claim -- passing"
artifacts:
  - "packages/factory-catalog/src/tierSpecification.ts"
  - "packages/factory-catalog/src/verticalKit.ts"
  - "packages/factory-catalog/src/designCatalog.ts"
  - "packages/factory-catalog/tests/tierSpecification.spec.ts"
  - "packages/factory-catalog/tests/verticalKit.spec.ts"
  - "packages/factory-catalog/tests/designCatalog.spec.ts"
  - "packages/factory-catalog/tests/siteSpecification.spec.ts (one negative-path test fixed to explicitly construct a non-active Kit override, since the Kit is no longer non-active by default)"
  - "packages/factory-catalog/tests/siteAssemblyManifest.spec.ts (same fix)"
verification_summary:
  - "packages/factory-catalog test run: 128/128 passing (114 prior + 14 new; several pre-existing tests were updated in place to match the new HOME_SERVICES_KIT default status, not counted as 'new')"
  - "packages/program-ledger test run: unaffected (not re-run in this Issue, no program-ledger files touched)"
  - "Workspace-wide typecheck (6 packages): clean"
optional_fields:
  commands_run:
    - "pnpm exec vitest run (packages/factory-catalog)"
    - "pnpm run typecheck (workspace-wide)"
  open_gaps:
    - "priceUsdPerMonthProvisional is illustrative market-rate research, not LiNKtrend's real cost structure or an approved price -- Carlos must still set the real number before any customer-facing pricing is shown."
    - "HOME_SERVICES_KIT's page-structure content is a reasonable structural default, not verified real business copy for an actual Home Services customer."
    - "futureCmsAccessCandidate does not build any real future access mechanism -- it is a data marker only, so a future customer-CMS-access feature still needs its own design and Issue."
  notes:
    - "Every numeric/status change in this Issue is a single-line edit to a plain data structure -- exactly the 'trivially changeable later' property Carlos asked for. No structural/type changes were needed beyond adding two new optional-shaped fields (futureCmsAccessCandidate, priceUsdPerMonthProvisional), both additive and non-breaking."
    - "This Issue also fixed two pre-existing test fixtures that had encoded an assumption (HOME_SERVICES_KIT defaults to a non-active status) that this Issue deliberately overturned -- both fixes were verified to still exercise the same rejection behavior they were written to test, just via an explicit override instead of relying on the constant's old default."
---

# Proof

## Subject

`phase3-business-defaults-001` -- research-grounded provisional business defaults.

## Criteria To Evidence Map / Artifacts / Verification Summary

See front matter.

## Failures Or Gaps

See front matter `open_gaps`.

## Gate Guidance

Non-vacuous: the accessibility claim is checked via an independently-computed contrast ratio inside the test, not a trust-the-constant assertion; the page-count claims are checked via inequality ranges tied to the cited research bounds, not exact-match assertions that would silently pass for any number.
