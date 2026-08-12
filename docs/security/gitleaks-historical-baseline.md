# Historical gitleaks baseline

The root `.gitleaksignore` contains exact fingerprints for 32 findings in two
historical commits. It does not allowlist paths, rules, or future findings.

- Commit `251cf0e52cd839489685d79c74fd687736d21a0c` contains security-test inputs,
  synthetic credential fixtures, and captured security-benchmark responses.
- Commit `cf39aedcff7d65200b50e260f93b10ac62cf8b23` contains placeholder request
  examples and removed CMS bootstrap scripts. The hard-coded bootstrap password
  has no occurrence in the current tree and must be treated as compromised and
  never reused.

The CI gate continues to scan every commit introduced by a pull request or
push. New findings fail closed unless they are separately investigated and
added as an exact fingerprint through a reviewed change.
