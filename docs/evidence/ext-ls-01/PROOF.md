# EXT-LS-01 protected A1 consumer

Issue `#551` repairs the failed independent review of Issue `#547`. This packet
consumes the exact protected Master Website Template A1 provider handoff through
the native LiNKsites consumer. It does not copy provider bytes into LiNKsites
source and does not claim production selectability, provider conformance,
deployment, live traffic, MWT-08, A2/A3, catalogue selectability, or final 2.0.0.

## Independently recomputed provider identity

From the admitted read-only LiNKlibraries commit
`998c02c29fae5acc429804d7e03dcc74df7e7a52`
tree `63c7f6f8811b93f90a1dcc101cdeea94bdc6d4b3`:

- `master-template-type-1@2.0.0-a1.1`
- artifact tree SHA-1 `6aadb2dff52efe30f512ddb2a5510a881fc027e2`
- catalogue.bound `false` (no 2.0.0-a1.1 catalogue row)

## Demonstrated consumer behavior

A clean independent reviewer can run:

```bash
node scripts/profile-v2-quality/ext-ls-01/generate-consumer-proof.mjs --clean \
  --candidate-commit df53bbaf854a44ea651deb5af4f165aa9df4cccb \
  --candidate-tree 4d08448f5e629747b0df93a6d80f52fc5402be66
node scripts/profile-v2-quality/ext-ls-01/generate-consumer-proof.mjs --verify
```

That generator:

1. Isolates a detached provider worktree at the protected pin.
2. Materializes only with explicit `draft_candidate_probe` into an out-of-repo cache.
3. Executes the materialized native `src/layouts/a1/render.mjs` for plans A/B/C/L.
4. Removes the isolated provider worktree.
5. Restarts from the consumer cache and recomputes the same native HTML.
6. Retains tamper rejection and rollback of the consumer cache.
7. Writes `.git/linktrend-evidence/ext-ls-01-issue551/consumer-proof-receipt.json`.

Missing receipt bytes fail closed. `requireExtLs01Receipt` cannot report
`bound=true` when the file is absent. The complete candidate-evidence fixture no
longer carries Issue 301, commit `2ba3bd70`, or an all-`a` `consumerCacheTree`.
The `mwt-input/` tree remains historical HOLD input from an earlier candidate
and is not this repair's demonstrated identity.
