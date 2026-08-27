# LS-07 quality harness preparation notes

## Status

Preparation scaffolding only. No LS-07 packet completion. No LS-06 completion.

## Contracts

The harness accepts an injected payload:

1. `providerIdentity` — repository, commit, tree (SHA-1). No provider bytes.
2. `runtimeIdentity` — packet `LS-06`, repository, commit, tree. Presence of a
   pin is not a pass for LS-06.
3. `rendererOutput` — HTML, document metadata/JSON-LD/visible facts, performance
   numbers, optional injected accessibility violations.

Fail closed when identities or renderer output are missing. Accessibility,
performance, and SEO dimensions then score only the injected document.

Synthetic fixture SHAs (`aaaa…` / `cccc…`) are **not** production pins.
