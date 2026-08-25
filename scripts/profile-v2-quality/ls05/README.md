# LS-05 A1 consumption harness (preparation)

Injected-adapter scaffolding for ISS-16. Not a product adapter and not an A1
receipt.

- `provider-adapter.mjs` — required identity + adapter interface; fail closed
  when identity is absent.
- `harness.mjs` — atomic materialize, prior-cache preservation, rollback
  pointer, offline restart from cache.
- `fixtures/injected-provider.mjs` — synthetic bytes only.
- `tests/harness.test.mjs` — deterministic focused tests.

Do not import this from `packages/` or `apps/` until a later owned LS-05
implementation issue binds a real adapter.
