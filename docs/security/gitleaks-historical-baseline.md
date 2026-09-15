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

Hosted Fast CI (`scripts/ci-secret-scan.sh`) loads `.github/gitleaks.toml`,
which extends the default gitleaks rules. Issue 556 adds one exact-string
allowlist regex: the SHA-256 of copied `design/tokens.json` in the
LiNKlibraries WP-0 marketing-smb-v1 A1 receipt
(`ea0415a8c9478ef8d9e829247800f3ed56c2602a0fb12cd6287b7fd8c0a8120a`). That
digest is file-hash evidence, not a credential; the rest of the receipt is
unchanged. Path-wide and rule-wide disables are not used.

The same Phase PR #555 `generic-api-key` report also named:

- The public review-route model name previously inlined next to
  `Cursor-REST-API-SDK` in `docs/production-roadmap/phase-2/EXECUTION-MANIFEST.json`.
  Current tip uses the low-entropy placeholder `review-route-grok-medium`.
  Introducing-commit fingerprints remain in `.gitleaksignore`.
- The historical commented Autowork signing-secret example assignment in
  `deploy/config/production.env.example`. Current tip does not assign that
  value in Git. The introducing-commit fingerprint remains in `.gitleaksignore`.

The CI gate continues to scan every commit introduced by a pull request or
push. New findings fail closed unless they are separately investigated and
added as an exact fingerprint or an equally tight documented string regex
through a reviewed change.

The first Issue 556 repair commit `f232d3819f940576388999b1c750876ed721ab52`
is also fingerprinted: it temporarily inlined a higher-entropy review-route
placeholder and quoted the historical Autowork example assignment. The
follow-up commit removes those strings from the current tree.
