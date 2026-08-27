# LS-11 repository release proof

GitHub planning issue `361`; implementation issue `391`.

## Bound parent

Protected `origin/development` at preparation:

- commit `d5056f8e4ce832a759fda18f8b3282eba170b471`
- tree `3358c4ae4e33143799b301aa5c34f498f6a3d7ac`

The checkpoint SHA after this evidence lands is a different identity and must
not replace the parent binding.

## What this proves

- LS-10 and Harness H-09 exact identities are bound and accepted.
- Exact-tree Full, rollback rehearsal, admission, release and handoff pass.
- Main repository promotion is founder-authorized.

## What this does not prove

- Hosted publication and production deployment are not claimed.
- VPS mutation and a live canary remain outside this repository proof.

## Commands

```text
node docs/evidence/profile-v2-release/validators/validate-ls11-release-evidence.mjs \
  --dir docs/evidence/profile-v2-release \
  --releases-dir docs/releases
node --test docs/evidence/profile-v2-release/validators/validate-ls11-release-evidence.test.mjs
git diff --check d5056f8e4ce832a759fda18f8b3282eba170b471
```
