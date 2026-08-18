# Master template connection proof

**This is not a live website.** Nothing was deployed. No VPS, staging, or main was touched. The Principal can read this file and re-run one local test on the Mini.

## What was tested

LiNKsites can **inspect** the Library master skeleton as a draft candidate, and it still **refuses** to treat that draft as a production template.

Pin used (do **not** use the older skeleton SHA `d7997b6`):

- Library branch: `issue/133-master-template-token-override-hygiene`
- Library SHA: `3bf53b8b407545fc7ed359f29cb8a5810295e8de`
- Identity: `master-template-type-1@1.0.0`
- Status: draft / not selectable
- Artifact tree: `92e6d6ad7b070671ad5b3b3ddadc4574309ce414`

## Result

**Pass.** 8 focused tests, 0 failed.

The test proved:

1. Catalogue, manifest, inventory, receipt, and artifact-tree hashes match this pin.
2. A candidate probe can look at the draft. The production path still rejects it.
3. Source inventory uses Library shape: `template.sourceRepository`, `source.commitSha`, `source.treeSha`.
4. Page types `home | about | contact | legal | collection | detail` and named sections map to LiNKsites symbols. An unknown section fails. Sections are **not** all forced into a hero.
5. Site id, language, publish state, and routes stay on the LiNKsites side.
6. Theme / default copy / module “on by default” overlays are allowed. Generated `tokens.css`, `tokens.json`, and `variants.json` overlays are refused.
7. Older Library SHAs (`d7997b6`, `9bdee5dd`, `b2d2bbb0`) and the old `marketing-smb-v1` “approved” fixture cannot override this quarantine.

No database migration was added. No visual redesign. No production selectability change.

## How to re-run on the Mini

From this repo, on branch `issue/186-master-template-connection-proof`:

```bash
cd packages/factory-catalog
pnpm exec vitest run tests/masterTemplateConnection.spec.ts
```

If `pnpm` has not been installed in this worktree, this also works when the main LiNKsites checkout already has dependencies:

```bash
/Users/linktrend/Projects/LiNKsites/packages/factory-catalog/node_modules/.bin/vitest run tests/masterTemplateConnection.spec.ts
```

Do **not** run the full test suite for this proof.

## What to open locally

- This file: `PROOF.md`
- The test: `packages/factory-catalog/tests/masterTemplateConnection.spec.ts`
- The pinned copies (not a live Library checkout): `packages/factory-catalog/tests/fixtures/linklibraries/master-template-type-1-1.0.0/`

There is no browser preview for this pin. The existing `pnpm dev` website is the older in-repo template, not this Library draft.

## Command output (this session)

```
 ✓ tests/masterTemplateConnection.spec.ts (8 tests) 168ms

 Test Files  1 passed (1)
      Tests  8 passed (8)
```
