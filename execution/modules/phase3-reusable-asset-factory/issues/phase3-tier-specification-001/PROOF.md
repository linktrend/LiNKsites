---
proof_id: "proof-phase3-tier-specification-001"
subject_type: "issue"
subject_id: "phase3-tier-specification-001"
status: "draft"
criteria_evidence:
  - criterion: "Exactly 3 tiers (standard/premium/enterprise) are modeled"
    evidence: "tests/tierSpecification.spec.ts: 'defines exactly the 3 provisional tiers per manual §03' -- passing"
  - criterion: "checkEntitlement() returns the correct disposition for each capability kind"
    evidence: "10 tests in tests/tierSpecification.spec.ts covering page_count, custom_component_code, additional_localization_locale, additional_integration, dedicated_runtime -- all passing"
  - criterion: "Base-product custom code is ALWAYS exception_required regardless of tier"
    evidence: "test 'always requires exception review for base-product custom code, regardless of tier' iterates all 3 tiers and asserts exception_required for each -- passing"
  - criterion: "resolveMostRestrictive() never lets a Kit Tier Variant enlarge entitlement beyond the base tier"
    evidence: "2 tests in the 'resolveMostRestrictive (manual §08.17)' describe block -- passing"
artifacts:
  - "packages/factory-catalog/src/tierSpecification.ts"
  - "packages/factory-catalog/tests/tierSpecification.spec.ts"
  - "packages/types/src/index.ts (SchemaVersion relocated here as the single canonical source)"
  - "packages/program-ledger/src/types.ts (updated to import SchemaVersion from packages/types instead of duplicating it)"
verification_summary:
  - "packages/factory-catalog test run: 14/14 passing"
  - "packages/program-ledger test run (re-verified after the SchemaVersion relocation): 36/36 still passing"
  - "Workspace-wide typecheck (6 packages: cms, web-master, web-company, program-ledger, factory-catalog, types): clean"
  - "apps/cms test:int: 18/19 passing (1 correctly skipped); both frontend builds succeed"
optional_fields:
  commands_run:
    - "pnpm exec vitest run (packages/factory-catalog)"
    - "pnpm exec vitest run (packages/program-ledger, re-verification)"
    - "pnpm run typecheck (workspace-wide)"
    - "pnpm --filter @linksites/cms run test:int"
    - "pnpm --filter @linksites/web-master run build"
    - "pnpm --filter @linksites/web-company run build"
  open_gaps:
    - "Vertical Kit and Kit Tier Variant objects don't exist yet -- resolveMostRestrictive() is tested in isolation with plain numbers, not against a real Kit Tier Variant object, since that object doesn't exist yet (next Issue)."
    - "All numeric tier limits are provisional placeholders, explicitly marked as such -- real values require Carlos's business decision."
  notes:
    - "Found and fixed a minor design smell while building this Issue: SchemaVersion was being duplicated as an inline type in program-ledger/types.ts rather than living in the shared packages/types package, contradicting this repo's own docs/archive/policies/CONTRACT_AND_SCHEMA_VERSIONING_POLICY.md ('one canonical source of truth per schema'). Relocated it."
---

# Proof

## Subject

`phase3-tier-specification-001` -- Tier Specification schema and entitlement enforcement engine.

## Criteria To Evidence Map / Artifacts / Verification Summary

See front matter.

## Failures Or Gaps

See front matter `open_gaps`.

## Gate Guidance

Non-vacuous: every criterion maps to specific, named, passing tests exercising real entitlement-decision logic, not placeholder assertions.
