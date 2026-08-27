# ISS-35 — Final exact-tree Full, rollback rehearsal, receipt binding

Packet `LS-11`. GitHub issue `361`. Full and rollback evidence is bound.

## Full suite

- [x] Accepted final Full executed on the exact reviewed product tree
- [x] Full receipt present and tree-bound
- [x] No skipped, cancelled or local substitute result is used

## Migration / rollback rehearsal

- [x] Migration rehearsal executed
- [x] Rollback rehearsal restored the prior active pin
- [x] Failed upgrade preserves active state

## Receipt binding (fail closed until exact identities exist)

- [x] Harness receipt bound
- [x] Profile / LS-10 cutover bound
- [x] Provider receipt bound
- [x] Consumer receipt bound
- [x] Configuration receipt bound

Placeholder names are not identities. Binding `satisfied: true` against null
commit/tree, `unknown`, `PENDING`, or all-zero SHAs must fail closed.
