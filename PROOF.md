# Issue 187 — Master-template look-and-feel render

LiNKsites now consumes the landed Library look-and-feel pin, not the superseded token-hygiene SHA.

**Pin:** `issue/134-master-template-look-and-feel` @ `6b87993ddaf403aebe7bef97bd268a543a1d14eb`  
**artifactTreeSha1:** `a2bf0d2e7759e5e6952dacfdeab3ef9b03657d3d`  
**Identity:** `master-template-type-1@1.0.0` draft / non_selectable  
**Rejected:** `3bf53b8` / `92e6d6ad…`, plus earlier retired prefixes

## What now looks styled

Authored `theme.json` only. Generated `tokens.css` / `tokens.json` / `variants.json` are not overlaid. In-memory CSS keeps the existing variable names (`--color-primary`, `--color-accent`, `--font-family`, spacing, radius) on `:root`, `data-theme="default|light|dark"`, and the ten industry ids. No dentist preset.

The inspectable composition maps Northline starter pages to distinct regions, not a flattened hero:

- Home: hero, features, proof, cta
- About: prose, collection, cta
- Contact: hero, form, features, collection

Look: cool stone paper (`#eef1ef`), pine (`#1e5a40`), steel (`#2a6f97`), Libre Franklin.

## What this is not

- Production still rejects this draft. `apps/web-master` admission still requires `approved`.
- W2-04 / `marketing-smb-v1` is the old demo, not this master.
- Local preview (`/en/demo/<token>`, Payload seed) is step 3 and is not implemented. The unused flag does nothing.
- No dentists. No implementer PR.

## Validation

- `packages/factory-catalog` focused: `tests/masterTemplateConnection.spec.ts` and `tests/masterTemplateLookAndFeel.spec.ts` — 13 passed
- `apps/web-master` `tests/master-template-look-and-feel.test.ts` plus existing private-preview query test
