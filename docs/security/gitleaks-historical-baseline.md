# Historical gitleaks baseline

The root `.gitleaksignore` contains exact fingerprints for 33 findings across
three historical commits. It does not allowlist paths, rules, or future
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
