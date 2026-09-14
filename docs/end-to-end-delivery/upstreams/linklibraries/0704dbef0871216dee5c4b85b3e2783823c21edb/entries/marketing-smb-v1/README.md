# Marketing SMB v1

Selectable LiNKlibraries template entry for a portable, draft-only SMB marketing
site contract. Admission is Library-local: structural, schema, provenance, asset,
secret-scan, and deterministic catalogue proof. This record does **not** prove
LiNKsites renderer compatibility, Payload CMS compatibility, consumer
integration, provider live state, deployment, or production publication.

## Library-local selectable status

This entry is `usable` and `selectable` only as a LiNKlibraries catalogue row.
Consumers must still apply their own preview and publication gates. Unknown or
unqualified entries remain non-selectable.

## What this entry provides

- A stable `marketing-smb-v1` template identity and version.
- Capability flags and required content surfaces for a small-business marketing
  site information architecture.
- Page and navigation blueprints for home, about, offers, resources, videos, help,
  locations, team, contact, and legal pages.
- A draft-only, tokenized complete output that a consumer can materialize using
  `src/index.mjs` without a framework or network dependency.
- `content/content.schema.json`, the formal consumer-input contract.
- `content/baseline-copy.json`, neutral original copy that must be reviewed before use.
- `assets/asset-inventory.json` and local replace-before-publication SVG placeholders.

## Ownership and boundary

LiNKlibraries owns this reusable portable component, layout, design-token, media, and
content package. A consumer may supply its own adapter and publication process, but this
entry does not create a customer site, configure a domain, select a webhook, provide
credentials, or deploy anything.

The executable draft is intentionally `draft` and uses relative paths plus substitution
markers. Any later consumer implementation must validate every substituted value, apply
tenant and locale scoping, and pass that consumer's own preview/publication gates before use.

## Use

Import `createMarketingSmbV1Draft`, `createMarketingSmbV1SiteTree`, or
`renderMarketingSmbV1Html` from `src/index.mjs`. Each consumes the checked-in design tokens,
baseline copy, local media inventory, and strict content schema. The export rejects unknown
fields, invalid locales, missing variables, unresolved markers, invalid assembled output,
and every non-draft status. Run the entry test from the repository root:

```bash
node --test entries/marketing-smb-v1/tests/marketing-smb-v1.test.mjs
```

This entry is reusable internal LiNKtrend content and is not a live customer-site
implementation. Library selection is not approval for a customer site, publication,
deployment, credentials, or any bypass of the consumer's own preview and publication gates.
