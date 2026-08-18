# Issue 188 — Local Mac Mini preview of the Library master draft

This is a **private local preview** on the Mac Mini. It is **not** a live website, not VPS, not staging, and not production.

**Pin:** Library `issue/134-master-template-look-and-feel` @ `6b87993ddaf403aebe7bef97bd268a543a1d14eb`  
**artifactTreeSha1:** `a2bf0d2e7759e5e6952dacfdeab3ef9b03657d3d`  
**Identity:** `master-template-type-1@1.0.0` draft / non_selectable  
**Look-and-feel:** authored `theme.json` CSS variables only. Generated `tokens.css` / `tokens.json` / `variants.json` are not overlaid. No dentist preset.

## What Principal can open

On this Mini, a private preview is running now:

1. Home: `http://127.0.0.1:4312/en/demo/local-northline-preview`
2. About: `http://127.0.0.1:4312/en/demo/local-northline-preview/about`
3. Contact: `http://127.0.0.1:4312/en/demo/local-northline-preview/contact`

Wrong token or missing token returns 404. Public `/en` is not a live Northline site.

The pages are Northline starter copy (Home / About / Contact) styled with pine, steel, and cool stone paper from the Library theme.

## What this proof does

- Loads the pinned Library bundle from the consumer fixture cache.
- Runs the candidate probe (inspect draft, do not admit it).
- Seeds projected Home / About / Contact into a disposable CMS fixture (lite) or disposable Payload (full W2-04 path).
- Reuses the existing `/en/demo/<token>` private preview route. No new public surface.
- Sets `LINKSITES_MASTER_TEMPLATE_LOOK_AND_FEEL_PROOF=1` only. That flag is parallel to `LINKSITES_W2_04_LOCAL_PROOF` and does not replace the old marketing demo.

## What stays fail-closed

- Production admission still requires an approved catalog entry.
- `selectMasterTemplateForProduction()` still rejects this draft.
- The proof flag does **not** emit production admission evidence.
- The draft stays `non_selectable`.

## Commands

```bash
# Focused tests
pnpm --filter @linksites/factory-catalog test tests/masterTemplateLookAndFeel.spec.ts tests/masterTemplateConnection.spec.ts
pnpm --filter @linksites/web-master exec tsx --test tests/master-template-look-and-feel.test.ts tests/master-template-candidate-preview.test.ts

# Lite browser preview (fixture CMS, no disposable Postgres)
LINKSITES_MASTER_TEMPLATE_PREVIEW_KEEP=1 bash scripts/master-template-candidate-preview-lite.sh

# Full W2-04 mechanism (disposable Supabase + Payload on :4311 / :4312)
bash scripts/master-template-candidate-preview.sh
```

## Gaps

The lite harness opens the same token URL and pages without starting disposable Postgres. The full script is the W2-04 Payload path. Production selectability is not opened by either path.
