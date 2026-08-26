# LS-02 H-09/H-10 provider handoff successor

Issue: `#300` (packet identity). Work issue: `#352`.
Owner paths: `docs/evidence/ls02/handoff-successor/**`,
`scripts/profile-v2-quality/ls02-handoff/**`

This is an identity-only, candidate-bound rebind package. It does not copy
LiNKharness or LiNKlibraries bytes, run provider or H-09 work, or admit
H-09/H-10.

## Candidate binding

The package is bound to the exact pre-change protected development parent:

- commit: `fd36e3084ddbd26356e3c12883c8754003d671ce`
- tree: `b0772be140486124362ee9bba4eb7d4447ecd227`

The pair is checked together. A stale commit/tree or a foreign repository/issue
is a hard failure. The resulting checkpoint identity is recorded separately by
the owner after commit; it must not replace this input binding.

## LS-08 A1 and provider pins (identity only)

- LS-08 A1 consumer checkpoint: `7e9596ef009d509f0683b69e5df1d7fb2f156664` /
  tree `a67c3604ae15c07e4889ed2ebe718d726f0e5eab`
- MWT-07 protected provider: `f28fd53d454cbc33d97951d8e62826dae5a83e40` /
  tree `34dc7467f4eb382ab7fbe258c5adc0f857d8ab5b`
- LS-08 ISS-27 consumer receipt sha256:
  `2373efd24a502dc04260217f4c90a9f088609f647bb468e01400ad34e5260646`
- LS-08 evidence CHECKSUMS.json sha256:
  `33f4a1925a056602ebf4c0a5d79f876e660a79eb282311a303a5ad3d14e555ac`

## Handoff contract

- H-09 action is `rebind-required`; `conformanceAccepted` is `false`.
- H-10 action is `blocked-until-h09-rebind`; `reviewAccepted` is `false`.
- LiNKlibraries is a pin-only provider reference; provider bytes are absent.
- No product, EXT, MWT, provider, or Harness path is owned by this packet.

## H-09 / H-10 rebind instructions

1. Rebind the H-09 consumer receipt to LiNKsites
   `fd36e3084ddbd26356e3c12883c8754003d671ce` /
   `b0772be140486124362ee9bba4eb7d4447ecd227`.
2. Keep the LS-08 A1 checkpoint and MWT-07 pin above as identity references.
3. Rerun H-09. Fail closed on any other sites commit/tree.
4. Keep H-10 blocked until that H-09 rebind completes.

## Validation

```text
node --test scripts/profile-v2-quality/ls02-handoff/tests/rebind-validator.test.mjs
node scripts/profile-v2-quality/ls02-handoff/rebind-validator.mjs \
  --input docs/evidence/ls02/handoff-successor/handoff-successor.json \
  --manifest docs/evidence/ls02/handoff-successor/manifest.json \
  --checksums docs/evidence/ls02/handoff-successor/SHA256SUMS.json
git diff --check
```

The validator intentionally rejects stale candidate identities, foreign
repository/issue inputs, provider-byte claims, H-09/H-10 admission claims,
owned-path escapes, and checksum drift. A validator PASS means only that this
identity package is internally coherent; it is not a H-09, H-10, or release
verdict.
