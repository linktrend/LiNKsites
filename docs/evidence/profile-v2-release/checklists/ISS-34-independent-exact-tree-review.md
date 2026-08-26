# ISS-34 — Independent exact-tree review checklist (fail closed)

Packet `LS-11`. GitHub issue `361`. Review has **not** been run.

Repair findings through owning packets. Do not patch product/runtime here.

## Exact head

- [ ] Bound head equals protected development commit `02ebf5d8710c50c1f2c390989239f0baf916ba97`
- [ ] Bound tree equals `fb427d30ea7c3e7060fc9cc1a63a1110266dd755` **or** a later exact LS-10-integrated tree after that packet exists
- [ ] Working tree is clean at the reviewed SHA

## Dimensions (all must be recorded; any blocker fails closed)

- [ ] Architecture
- [ ] Security
- [ ] Tenant isolation
- [ ] Migration
- [ ] Accessibility
- [ ] Visual
- [ ] Evidence integrity

## Verdicts

- [ ] No unresolved blocker remains
- [ ] No dimension is marked PASS while `reviewRun` is false
- [ ] `packetCompletion` remains false until every later LS-11 gate also passes

A checked box on this scaffolding copy is not a review verdict. Live
`templates/exact-tree-review.json` stays `NOT_RUN` until a later exact packet
rewrites it against bound identities.
