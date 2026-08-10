# Company-Site Template

> **Status (2026-07-13, Decision DR-02, approved by Carlos):** This app was originally started as a
> **special-case build of the LiNKtrend company website itself** (linktrend.media / corporate site),
> not as a generic customer-factory template. It is **paused, not abandoned** — it may already be
> partially finished and should be preserved, not deleted, pending review. It is **not** currently
> part of the active customer-facing LiNKsites production pipeline (that role belongs to
> `apps/web-master`). See `audit/13_decision_and_contradiction_register.md` (DR-02) and
> `apps/web-company/STATUS.md` for full context before making further changes here.

AI-first, multi-language, CMS-driven corporate/marketing site starter for the LiNKsites Factory Kit. Aligns with LinkTrend architecture and centralized text system.

## Key characteristics
- Next.js 14 App Router, TypeScript, Tailwind + shadcn/ui.
- Multi-language roots (`/en`, `/es`, `/zh-tw`, `/zh-cn`) with hreflang + canonicals.
- Templates for offers, resources (articles + videos), about, contact (map + form + scheduling CTA), and legal.
- Themes via tokens → CSS variables (`data-theme`) with `designSystemVersion` support; CMS stores `themeId`.
- CMS (Payload) integration split: structural (`cmsStructureClient`) vs. content (`contentClient` from `ContentItems`).
- Static generation + ISR; on-demand revalidation hooks (scaffolded).

## Usage
1) Copy this template into `projects/<site-name>`.
2) Set env (site ID, Payload URL/keys, theme defaults). See `.env.example`.
3) Wire CMS endpoints and CMS Payload mappings using `template.config.json`.
4) Vendor shared assets/components you need from `templates/shared/` (no runtime imports).

## Reference
- Architecture: `../../sites_specs/Linktrend FULL WEBSITE ARCHITECTURE DESCRIPTION.txt`
- Factory system: `../../sites_specs/LiNKsites Factory Kit - Full System Specification.txt`
