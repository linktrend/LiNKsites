# Marketing SMB v1

Experimental, non-selectable LiNKlibraries artifact for the LiNKsites baseline marketing template.
It carries a portable executable export, formal consumer-input schema, CMS-oriented page
blueprint, neutral baseline copy, local asset inventory, and complete executable draft.

## Experimental and non-selectable status

This entry is quarantined and must not be selected or admitted for production use. LiNKsites
renderer compatibility and Payload CMS compatibility are **unknown and unverified**.
Independent certification is required before selection or production admission.

## What this entry provides

- A stable `marketing-smb-v1` template identity and version.
- Capability flags and required content surfaces aligned with the existing LiNKsites
  `web-master` template registry and CMS factory shape.
- Page and navigation blueprints for home, about, offers, resources, videos, help,
  locations, team, contact, and legal pages.
- A draft-only, tokenized complete output that a consumer can materialize using
  `src/index.mjs` without a framework or network dependency.
- `content/content.schema.json`, the formal consumer-input contract.
- `content/baseline-copy.json`, neutral original copy that must be reviewed before use.
- `assets/asset-inventory.json` and a local replace-before-publication SVG placeholder.

## Ownership and boundary

LiNKlibraries owns this reusable portable component, layout, design-token, media, and
content package. A consumer may supply its own adapter and publication process, but this
entry does not create a customer site, configure a domain, select a webhook, provide
credentials, or deploy anything.

The executable draft is intentionally `draft` and uses relative paths plus substitution
markers. A later LiNKsites implementation must validate every substituted value, apply
tenant and locale scoping, and pass the normal preview/publication gates before use.

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
implementation. Its executable draft is not approval for consumer selection, a customer site,
publication, deployment, credentials, or any bypass of the consumer's own preview and
publication gates.
