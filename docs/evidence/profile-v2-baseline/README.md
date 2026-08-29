# Profile v2 baseline evidence (LS-00)

Packet `LS-00` / Issues `ISS-01`, `ISS-02`, `ISS-03`.

This directory is the machine-readable exact baseline and authority map for
LiNKsites Profile v2. It is documentation and validation evidence only. It
does not change product source.

## Owned paths

- `docs/evidence/profile-v2-baseline/**`
- `scripts/validate-profile-v2-baseline.mjs`

## Exact identities recorded here

- Advertised `development` commit `a23f87aa44a8625a32bb2f0d5015d7c0cf57f33d`
- Advertised tree `cc444092dfc07c9e77d9eb6f441751e5b9fec3d0`
- Planning 2.5.1 `main` pin commit `e46ce0c657a7445bfb898ac208f6f5d889b550f2`
  tree `3e98a86abbdc753933e9c7238d9c29f47b03022e`
- Installed IDE Development `2.5.2`
- Work branch `dev/cloudcursor/linksites-ls-00-d5e7` (GitHub issue 266)
- `profileDigest`: sha256:55fde39afcbfe06b5cb1bafc681c4f957a66b0885df19053a9df4813cd45a3e5 (canonical hash of identity.json with profileDigest deleted, then remaining JSON files in filename order).

Prior accepted LS-00 files from commit `75ef17776e66cc8f0237089d45ff9bcf52820ce7`
were refreshed in place; ISS-02/ISS-03 maps were not rewritten from scratch.

## Fail-closed validator

```bash
node scripts/validate-profile-v2-baseline.mjs
```

The validator emits no `PASS` and exits nonzero when evidence is absent,
unreadable, malformed, stale/mismatched, or marked `unknown`.
