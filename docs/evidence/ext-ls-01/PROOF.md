# EXT-LS-01 A1 consumer proof validator

Gate: `EXT-LS-01`
Issue: `#301`
Owner paths: `docs/evidence/ext-ls-01/**`, `scripts/profile-v2-quality/ext-ls-01/**`

This packet adds a fail-closed consumer validator. It does not check out
LiNKlibraries, does not copy provider or MWT bytes, and does not edit
`packages/factory-catalog` or H-09 handoff paths.

## Candidate inputs

Pre-repair candidate (exact, before this issue's commits):

- commit `2ba3bd70244061985a3896e748fb75e92dfb6c69`
- tree `606fcb986b8eb9af476aea369d94990357ff9681`

Those identities are validator inputs, not a protected-integration readback.

## Behavior

The validator requires a 40-character consumer commit and tree. Optional A1 /
provider / consumer receipts may be inline JSON or filesystem paths. A provider
checkout path is rejected.

When the provider or A1 receipt is absent, every lane is an explicit **HOLD**
(`provider_or_a1_receipt_absent`). HOLD is success of the fail-closed rule, not
acceptance.

Lanes:

- materialization without provider checkout
- A/B/C/L resolver (capacities 30/15/6/0, Type L minimal shell)
- Payload projection (semantic IDs, Products ≠ Services)
- server HTML, browser, accessibility, visual, link, SEO, privacy
- existing-site pin and simulated rollback

Overall results are `FAIL`, `HOLD`, or `CANDIDATE_EVIDENCE_COMPLETE`. The
validator never emits ACCEPT, protected integration, provider conformance, or
production proof.

## Commands

```text
node --test scripts/profile-v2-quality/ext-ls-01/tests/consumer-proof-validator.test.mjs
node scripts/profile-v2-quality/ext-ls-01/consumer-proof-validator.mjs \
  --input scripts/profile-v2-quality/ext-ls-01/fixtures/absent-receipt.input.json \
  --candidate-commit 2ba3bd70244061985a3896e748fb75e92dfb6c69 \
  --candidate-tree 606fcb986b8eb9af476aea369d94990357ff9681
git diff --check
```

## Focused validation (this issue)

| Command | Result |
| --- | --- |
| `node --test scripts/profile-v2-quality/ext-ls-01/tests/consumer-proof-validator.test.mjs` | 10/10 pass |
| `node --check` on validator/lanes/tests | pass |
| CLI against pre-repair candidate identities with absent A1 receipt | `overall=HOLD`, `provider_or_a1_receipt_absent` |
| `git diff --check` | pass |

Recorded CLI output: `docs/evidence/ext-ls-01/validator-run.json`.

## Scope limit

Independent acceptance, Phase edits, and protected `development` readback remain
out of this issue.
