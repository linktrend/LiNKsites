# CMS Payload → Template Mapping (structure-only)

- Pages: resolved by `cms.pages` (one per language) with `layout` + `layoutVersion`.
- Slots: resolved by `cms.slots` with `contentBindings` doc_ids; renderer fetches text from `ContentItems`.
- Navigation: labels are doc_ids; slugs are stored structurally.
- Legal: doc_ids from `template.config.json` map to `/legal/[legalSlug]`.
- SEO: `seoDocId` on pages; `seoPages` for SEO landers.
- Themes: CMS stores `themeId`; frontend loads theme tokens (`src/themes`) and applies CSS vars via `data-theme`.

### Example (offer page)
- Layout: `offer-page`
- Slots:
  - `hero`: `{ title: "offer-hero-title", subtitle: "offer-hero-subtitle", body: "offer-hero-body" }`
  - `features`: `{ collectionDocId: "offer-features" }`
  - `useCases`: `{ collectionDocId: "offer-usecases" }`
  - `pricing`: `{ collectionDocId: "offer-pricing" }`
  - `testimonials`: `{ collectionDocId: "offer-testimonials" }`
  - `relatedResources`: `{ collectionDocId: "offer-related-resources" }`
