# EXT-LS-01 MWT input (candidate-bound, not accepted)

GitHub issue `299`. Gate `EXT-LS-01`. Preparation only.

This directory is **immutable-receipt / checksum / manifest-amendment input**
for Master Website Template EXT-LS-01. It binds the exact LiNKsites candidate
commit/tree named before repair integration. It is not an accepted consumer
receipt, not provider bytes, not A1 acceptance, and not protected integration.

## Bound candidate (pre-integration)

| Field | Exact value |
| --- | --- |
| Repository | `linktrend/LiNKsites` |
| Commit | `2ba3bd70244061985a3896e748fb75e92dfb6c69` |
| Tree | `606fcb986b8eb9af476aea369d94990357ff9681` |
| Branch where head | `issue/297-repair-ls-04-content-production-polynomial-regex` |

Protected `origin/development` at evidence preparation was
`6169548ddbf6bff99a3eb8de3716e9fd3a843b11` /
`24e5b46566a45a58de3df243b45e7918d419cb2c`. That identity is **not** the
candidate. Do not treat this issue branch tip as the candidate.

## Fail-closed claims

All of the following remain false until the candidate is protected-integrated
and exact protected development is read back, and until an independent
EXT-LS-01 receipt is accepted:

- `ACCEPT`
- protected integration
- provider conformance
- production proof
- A1 consumer proof
- MWT-08–11 dispatch / selectability

## Owned paths

- `docs/evidence/ext-ls-01/mwt-input/**`
- `docs/evidence/mwt-handoff/**`

Product source, H-09 paths, and validator implementation are out of scope.

## Validation

```bash
python3 docs/evidence/ext-ls-01/mwt-input/validate_mwt_input.py
git diff --check
```
