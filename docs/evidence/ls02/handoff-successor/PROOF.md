# LS-02 H-09/H-10 provider handoff successor

Issue: `#300`
Owner paths: `docs/evidence/ls02/handoff-successor/**`,
`scripts/profile-v2-quality/ls02-handoff/**`

This is an identity-only, candidate-bound rebind package produced after the
previous Cursor handoff stalled. It does not copy LiNKharness or LiNKlibraries
bytes, run provider conformance, or admit H-09/H-10.

## Candidate binding

The package is bound to the exact pre-change candidate parent:

- commit: `2ba3bd70244061985a3896e748fb75e92dfb6c69`
- tree: `606fcb986b8eb9af476aea369d94990357ff9681`

The pair is checked together. A stale commit/tree or a foreign repository/issue
is a hard failure. The resulting checkpoint identity is recorded separately by
the owner after commit; it must not replace this input binding.

## Handoff contract

- H-09 action is `rebind-required`; `conformanceAccepted` is `false`.
- H-10 action is `blocked-until-h09-rebind`; `reviewAccepted` is `false`.
- LiNKlibraries is a pin-only provider reference; provider bytes are absent.
- No product, EXT, MWT, provider, or Harness path is owned by this packet.

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
repository/issue inputs, provider-byte claims, H-09/H-10 acceptance claims,
owned-path escapes, and checksum drift. A validator PASS means only that this
identity package is internally coherent; it is not a conformance or release
verdict.
