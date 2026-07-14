---
proof_id: "proof-hardening-security-001"
subject_type: "issue"
subject_id: "hardening-security-001"
status: "draft"
criteria_evidence:
  - criterion: "pnpm audit reports zero known vulnerabilities after the fix"
    evidence: "Before: 'drizzle-orm SQL injection' (high, GHSA-gpj5-g38j-94v9) + 'esbuild arbitrary file read' (low, GHSA-g7r4-m6w7-qqqr), 2 total. After: 'No known vulnerabilities found'."
  - criterion: "Full workspace verification remains green"
    evidence: "typecheck (6 packages), factory-catalog (219 tests at the time), program-ledger (36 tests), CMS integration tests (18 tests), both frontend builds, lint -- all green after the override change"
  - criterion: "CI's new audit step exits 0"
    evidence: "pnpm audit --audit-level=moderate run locally, exits 0 with 'No known vulnerabilities found'"
artifacts:
  - "package.json (pnpm.overrides)"
  - "pnpm-lock.yaml"
  - ".github/workflows/ci.yml"
verification_summary:
  - "pnpm audit: 0 vulnerabilities (was 2: 1 high, 1 low)"
  - "Full CI-equivalent gate green after the change"
optional_fields:
  commands_run:
    - "pnpm audit (before and after)"
    - "pnpm install (to apply overrides)"
    - "pnpm run typecheck (workspace-wide)"
    - "pnpm --filter @linksites/factory-catalog run test"
    - "pnpm --filter @linksites/program-ledger run test"
    - "pnpm --filter @linksites/cms run test:int"
    - "pnpm exec turbo run lint --filter=@linksites/cms --filter=@linksites/web-master"
    - "pnpm --filter @linksites/web-master run build"
    - "pnpm --filter @linksites/web-company run build"
  open_gaps:
    - "GitHub's own Dependabot alert count on the repository will continue to show a stale, high figure until these (and all prior) fixes are promoted from development through staging to main -- that promotion is explicitly Principal-only and out of scope for this Issue."
  notes:
    - "This Issue clarifies a real point of confusion from earlier in the session: the '222 vulnerabilities' message shown on every git push is a property of the DEFAULT branch (main), confirmed via `gh repo view --json defaultBranchRef` to be 'main', not 'development'. It is not evidence that this session's security work regressed or was ineffective."
---

# Proof

## Subject

`hardening-security-001` -- dependency vulnerability remediation + CI audit gate.

## Criteria To Evidence Map / Artifacts / Verification Summary

See front matter.

## Failures Or Gaps

See front matter `open_gaps`.

## Gate Guidance

Non-vacuous: before/after pnpm audit output is directly quoted, not summarized as a bare pass/fail claim.
