# ISS-35 — Final exact-tree Full, rollback rehearsal, receipt binding

Packet `LS-11`. GitHub issue `361`. Full and rollback have **not** been run.

## Full suite

- [ ] One final Full executed on the exact reviewed tree
- [ ] Full receipt present and tree-bound
- [ ] Skipped, cancelled or local substitute results are rejected

## Migration / rollback rehearsal

- [ ] Migration rehearsal executed on the exact tree
- [ ] Rollback rehearsal restored the prior active pin
- [ ] Failed upgrade preserves active state

## Receipt binding (fail closed until exact identities exist)

- [ ] Harness receipt bound to `FUTURE_HARNESS_H09_CONFORMANCE_IDENTITY` replacement SHA pair
- [ ] Profile / LS-10 cutover bound to `FUTURE_LS10_CUTOVER_IDENTITY` replacement SHA pair
- [ ] Provider receipt bound
- [ ] Consumer receipt bound
- [ ] Configuration receipt bound

Placeholder names are not identities. Binding `satisfied: true` against null
commit/tree, `unknown`, `PENDING`, or all-zero SHAs must fail closed.
