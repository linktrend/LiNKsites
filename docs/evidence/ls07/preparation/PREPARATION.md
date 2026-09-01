# LS-07 quality harness preparation notes

## Status

Preparation scaffolding only. No LS-07 packet completion. No LS-06 completion.

| Dependency | Status | Reason |
| --- | --- | --- |
| LS-06 candidate | HOLD | Candidate `task_e_6a96ebe4cfa48326a241b54cb2140816` is not protected. |
| A1 | HOLD | Exact accepted provider/runtime chain is unavailable. |
| Live browser | HOLD | This lane is injected and dependency-independent. |
| Provider | HOLD | No provider checkout, fetch, or byte claim is permitted. |

## Contracts

The harness accepts an injected payload:

1. `providerIdentity` — repository, commit, tree (SHA-1). No provider bytes.
2. `runtimeIdentity` — packet `LS-06`, repository, commit, tree. Presence of a
   pin is not a pass for LS-06.
3. `fixtureIdentity` — named `injected-fake` source with `deterministic: true`.
4. `rendererOutput` — HTML, document metadata/JSON-LD/visible facts, performance
   numbers, optional injected accessibility violations, and no-network form/
   privacy side-effect observations.

Fail closed when identities or renderer output are missing. SSR/discoverability,
accessibility, performance, forms, and privacy dimensions score only the
injected fake document and observations.

Synthetic fixture SHAs (`aaaa…` / `cccc…`) are **not** production pins.
