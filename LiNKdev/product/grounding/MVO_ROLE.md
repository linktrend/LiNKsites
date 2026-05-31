# LinkSites role in MVO

**Status:** May 2026  
**Audience:** Executors working in **LiNKsites** when an issue lists this file in `read_first`

## What this repo owns

**LiNKsites** is the **LinkSites suite product repo**. It implements the website factory:

- Industry **templates** (`apps/web-master`, `apps/web-company`, shared packages)
- **Payload CMS** content model and admin (`apps/cms`)
- **Publish** path to live sites at `businessname.linktrend.media`
- Hostname routing, shared platform mode, and premium spin-off deployments

LiNKaios orchestrates the lead-to-outreach loop; **this repo builds and publishes the site**.

## MVO loop (LinkSites stages)

One lead must flow through the full loop governed from **LiNKtrend-System**:

| Stage | This repo's role |
|-------|------------------|
| Lead discovery / qualification | None — LiNKbot + Capabilities in LiNKaios |
| Template selection | Expose template registry; industry templates live here |
| Build | Custom copy, media, style within selected template |
| **Publish** | Payload sync + frontend deploy → temp URL `businessname.linktrend.media` |
| Outreach / close | None — LiNKbot + Capabilities; site URL is input |

Partial demos (preview without publish, CSV-only leads) do **not** count as MVO complete.

## Canonical product definition

Full MVO scope, planes, and Definition of Done live in **LiNKtrend-System**:

- Relative (sibling monorepo): `../../../LiNKtrend-System/LiNKdev/product/grounding/PRINCIPAL_PRODUCT_DEFINITION.md`
- GitHub: https://github.com/linktrend/LiNKtrend-System/blob/development/LiNKdev/product/grounding/PRINCIPAL_PRODUCT_DEFINITION.md

Cross-service contracts: `CONTRACTS_MVO.md` in that same folder (referenced from LiNKaios; not duplicated here).

## Governance proof (every side-effecting step)

Even when implementation is in this repo, MVO requires artifacts from LiNKaios planes:

- LinkSkills capability lease/run
- LiNKautowork workflow run (deterministic steps)
- LiNKbrain event/audit/memory write
- LiNKaios trace/status visibility
- LiNKguard session cleanup on bot runs

Do not treat local-only publish or missing audit as MVO proof.
