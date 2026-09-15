# Historical gitleaks baseline

The root `.gitleaksignore` contains exact fingerprints for 37 findings across
six historical commits. It does not allowlist paths, rules, or future
findings.

- Commit `251cf0e52cd839489685d79c74fd687736d21a0c` contains security-test inputs,
  synthetic credential fixtures, and captured security-benchmark responses.
- Commit `cf39aedcff7d65200b50e260f93b10ac62cf8b23` contains placeholder request
  examples and removed CMS bootstrap scripts. The hard-coded bootstrap password
  has no occurrence in the current tree and must be treated as compromised and
  never reused.
- Commit `95f0edb6413ce8834955067257ef20401482c823` introduced a test-only Autowork
  `idempotencyKey` fixture (`idempotency-1234567890`) in
  `apps/program-orchestrator/tests/autowork-client.test.ts`. The same fixture
  remained in the tree of follow-on commit
  `2b35d94a156aada2688e3fef070ea1ab51d4fad5` without a separate gitleaks
  finding (unchanged line). Tip remediation already replaced it with the
  low-entropy non-secret value `test-only-test-only`. The single exact
  fingerprint allowlisted here is the introducing-commit false positive under
  `generic-api-key`; it is not a production secret.

The CI gate continues to scan every commit introduced by a pull request or
push. New findings fail closed unless they are separately investigated and
added as an exact fingerprint through a reviewed change.

## Successor source reconciliation (2026-09-15)

Hosted run `34924739082` scanned all 40 introduced commits and reported four
additional matches. Each historical blob was inspected at the exact commit
and line before adding its fingerprint; no path or rule exemption was added.

- `106b33f54e376cdf5842da50d6cec528b18f5adb`,
  `docs/production-roadmap/phase-2/EXECUTION-MANIFEST.json:32`, and
  `685e1267fc4718eaea808afc0c36459e9d739e14`, the same path at lines 32 and 45:
  the review command contains `Cursor-REST-API-SDK` followed by the model name
  `Grok-4.6-Medium`. This is historical routing metadata, not authentication
  material. These three `generic-api-key` matches are false positives.
- `60274ade7e910f814b0816e74de011281d536dc2`,
  `deploy/config/production.env.example:30`: the commented signing-secret
  example uses the explicit synthetic value `ltfx.placeholder.5e0a9b3c2eac.v1`.
  It is a placeholder, not a usable credential. The current candidate replaces
  that assignment with an instruction to obtain the secret from the secret
  store. The exception binds only this historical `generic-api-key` fingerprint.

Hosted changed-range scanning must pass on the resulting candidate. These
source dispositions do not constitute independent release review.
