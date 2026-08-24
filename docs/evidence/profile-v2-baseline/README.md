# Profile v2 baseline evidence (LS-00)

Packet `LS-00` / Issues `ISS-01`, `ISS-02`, `ISS-03`.

This directory is the machine-readable exact baseline and authority map for
LiNKsites Profile v2. It is documentation and validation evidence only. It
does not change product source.

## Owned paths

- `docs/evidence/profile-v2-baseline/**`
- `scripts/validate-profile-v2-baseline.mjs`

## Exact identities recorded here

- Advertised `development` commit `75ef17776e66cc8f0237089d45ff9bcf52820ce7`
- Advertised tree `67b1a23655d5b4ce9fc02da291dea906b9ecab94`
- Planning 2.5.1 `main` pin commit `e46ce0c657a7445bfb898ac208f6f5d889b550f2`
  tree `3e98a86abbdc753933e9c7238d9c29f47b03022e`
- `profileDigest`: sha256:1bcb94d32250a954c455188904e63d2e1a5066ccd4103864c8415c0152b5e7c1 (canonical hash of identity.json with profileDigest deleted, then remaining JSON files in filename order).

## Fail-closed validator

```bash
node scripts/validate-profile-v2-baseline.mjs
```

The validator emits no `PASS` and exits nonzero when evidence is absent,
unreadable, malformed, stale/mismatched, or marked `unknown`.
