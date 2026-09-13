# EXT-LS-01 protected A1 consumer

Issue `#547`. This packet consumes the exact protected Master Website Template A1
provider handoff through the native LiNKsites consumer. It does not copy provider
bytes into LiNKsites source, does not claim production selectability, provider
conformance, deployment, live traffic, MWT-08, A2/A3, or final 2.0.0.

## Independently recomputed provider identity

From LiNKlibraries `development` commit `998c02c29fae5acc429804d7e03dcc74df7e7a52`
tree `63c7f6f8811b93f90a1dcc101cdeea94bdc6d4b3`:

- `master-template-type-1@2.0.0-a1.1`
- artifact tree SHA-1 `6aadb2dff52efe30f512ddb2a5510a881fc027e2`
- release receipt SHA-256 `9e53946b4dadcec3e939bd1f42bb41b1d8851d29ac7c2de3f4a66dcdd9ce1021`
- catalogue-binding receipt SHA-256 `a1b47f09f981c4db4150ee2297a9c4cd6ca45a0f8487449ac1791147cd1aa6d3`
- manifest SHA-256 `b4e0b141631694101b8daf5494499160b31e2ba6cbe66d0ec622f9690d567026`
- inventory SHA-256 `29262c08e9db2797ff292dc8179965c0ed080064a0b71d1bb477c4e0d63f0f72`
- catalogue file SHA-256 `5f9c0f6bbfcede994411f8dabe04a89809d7959550985e0a7dda8c9988be22ee`
- catalogue records SHA-256 `749e2d6a340fad7be1fb68bad2d03c5f472a3976275048fa7a845bf3fd99f4ee`
- catalogue.bound `false` (no 2.0.0-a1.1 catalogue row)
- rollback `node scripts/v2/rebind-master-template-v2-release.mjs --version 2.0.0-a1.1 --rollback` retaining staging `95d0a2d168b60ba2b4afd32c71928efe3797d2bc`

## Consumer behavior

- Explicit `draft_candidate_probe` is required; selectable/production paths fail closed.
- Native materialization writes a consumer-owned cache outside the repository.
- Offline restart, tamper rejection, and rollback/reselection run from that cache with `providerCheckoutRequired=false`.

The out-of-tree receipt is `.git/linktrend-evidence/ext-ls-01-issue547/consumer-proof-receipt.json`.
