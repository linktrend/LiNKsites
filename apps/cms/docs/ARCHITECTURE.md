# Architecture

Date: Dec 22, 2025

## 1. System Overview
Text diagram:
```
Client (web/admin)
   ↓ HTTPS (Next.js routes + Payload REST/GraphQL)
Next.js App Router (app/)
   ↓ PayloadCMS handlers (`src/payload.config.ts`)
Payload Collections / Globals
   ↓ PostgreSQL (Supabase) via @payloadcms/db-postgres
```
- Multi-site: every request scoped via site ID; content filtered and enforced in hooks.
- Multi-locale: localized fields for `en`, `zh-TW`, `es`; publish validation guards.
- Public read APIs, authenticated writes; admin UI served by Next.js + Payload.

## 2. Technology Stack
- Next.js 16.1.0 (App Router)
- PayloadCMS 3.69.0
- React 19.1.0, TypeScript 5.7.3
- PostgreSQL (Supabase recommended)
- Tooling: pnpm, vitest, Playwright, ESLint, TailwindCSS

## 3. Collections Structure
- Core: `Users`, `Sites`, `Languages`, `Roles`, `APIKeys`
- Content: `Articles`, `HelpArticles`, `Videos`
- Pages: `Pages`, `OfferPage`, `CaseStudyPage`, `VideoPage`, `FAQPage`, `TermsPage`, `PrivacyPage`
- Taxonomy: category collections for articles/offers/case studies/videos/help
- System: `Media`, `Navigation`, `Testimonials`, `SiteSettings`, `TranslationQueue`

## 4. Globals
- `HeaderGlobal`, `FooterGlobal`, `SEOGlobal`, `LegalGlobal`, `ContactInfoGlobal`

## 5. Access Control
- Site scoping enforced in `src/hooks/enforceSiteScope.ts` and related helpers.
- Locale permissions checked in `src/hooks/validatePublishPermissions.ts`.
- Role-based access per collection; API key authentication supported (`APIKeys`).
- Public read access for most content; writes require auth and pass hook validations.

## 6. Hooks System
- Global hooks defined in `src/hooks/globalHooks.ts` and `src/hooks/globalHookTargets.ts`.
- Site scope enforcement runs before operations to constrain queries/mutations.
- Publish permissions and site access validation hooks guard localized content.
- Translation queue and rebuild triggers handled via dedicated hook utilities.

## 7. API Structure
- Public read endpoints exposed via Payload REST/GraphQL and Next.js routes under `src/app/(payload)/api`.
- Authenticated write endpoints require JWT/admin session; API key support for server-to-server.
- Custom routes exist for help search, offers, legal pages, and YouTube ingestion under `src/app/(payload)/api`.

## 8. Database Schema
- PostgreSQL with `@payloadcms/db-postgres`.
- Dev: migrations auto-push via Payload when configured; Supabase supported with SSL.
- Prod: run Payload migrations before deploy; keep connection strings SSL-enabled.
