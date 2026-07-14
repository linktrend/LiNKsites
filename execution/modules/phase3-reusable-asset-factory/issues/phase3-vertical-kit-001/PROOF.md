---
proof_id: "proof-phase3-vertical-kit-001"
subject_type: "issue"
subject_id: "phase3-vertical-kit-001"
status: "draft"
criteria_evidence:
  - criterion: "HOME_SERVICES_KIT is status 'candidate', and assertKitIsProductionReady() rejects it as-is"
    evidence: "tests/verticalKit.spec.ts: 'is deliberately a candidate, not active' and 'is rejected as production-ready while still a candidate' -- both passing"
  - criterion: "A Kit Tier Variant's page limit never overrides a more restrictive base Tier Specification limit, and vice versa"
    evidence: "tests/verticalKit.spec.ts 'resolveEffectiveMaxPages (manual §08.17)' describe block, 2 tests covering both directions -- passing"
  - criterion: "getKitTierVariant() throws a clear, typed error for an undefined tier variant"
    evidence: "test 'throws for a Kit with no variant for the requested tier' -- passing"
artifacts:
  - "packages/factory-catalog/src/verticalKit.ts"
  - "packages/factory-catalog/tests/verticalKit.spec.ts"
verification_summary:
  - "packages/factory-catalog test run: 22/22 passing (14 Tier Specification + 8 Vertical Kit)"
  - "packages/factory-catalog typecheck: clean"
  - "Workspace-wide typecheck (6 packages): clean"
  - "packages/program-ledger re-verification: 36/36 still passing (unaffected)"
optional_fields:
  commands_run:
    - "pnpm exec vitest run (packages/factory-catalog)"
    - "pnpm exec tsc -p tsconfig.json (packages/factory-catalog)"
    - "pnpm run typecheck (workspace-wide)"
    - "pnpm --filter @linksites/program-ledger run test (regression check)"
  open_gaps:
    - "Real Home Services content does not exist -- HOME_SERVICES_KIT's page types are structural placeholders only, and it is correctly blocked from production use by its 'candidate' status."
    - "Reusable Site Foundation (the third of the manual's three distinct objects, §08.2) is not yet built -- next Issue."
  notes:
    - "This Issue deliberately does not invent Home Services business content, consistent with manual doctrine against fabricating business/vertical specifics without evidence."
---

# Proof

## Subject

`phase3-vertical-kit-001` -- Vertical Kit schema and the Home Services pilot candidate.

## Criteria To Evidence Map / Artifacts / Verification Summary

See front matter.

## Failures Or Gaps

See front matter `open_gaps`.

## Gate Guidance

Non-vacuous: every criterion maps to specific, named, passing tests.
