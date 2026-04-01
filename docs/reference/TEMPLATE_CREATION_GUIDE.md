# LiNKsites Factory Kit - Template Creation Guide

This guide explains how to create new templates so most work is "variant templates" (fast) instead of "new capabilities" (slow).

## What a Template Is (3 parts that must stay aligned)

1. Frontend presentation
   - Theme (colors, fonts, spacing, components)
   - Layout defaults (which sections appear on which pages)
2. CMS seed preset
   - A repeatable "starter dataset" for a new site using this template
   - Navigation, pages, sample offers/resources, globals
3. Template registration
   - A template ID (example: `marketing-smb-v1`)
   - Capability flags (what the template expects to exist)

If these 3 parts drift apart, templates become painful to maintain.

## Variant Template vs. New Capability (decision rule)

### Variant template (preferred)
Choose this when you only need:
- A different look and feel (colors, typography, imagery style)
- Different default section ordering
- Different wording and positioning (copy)
- Slightly different page composition using existing blocks

This should be 80%+ of templates.

### New capability (use sparingly)
Choose this when you truly need new data or behavior:
- A new CMS collection (example: restaurant menus)
- A new block type with new fields and rendering logic
- A new workflow feature (booking, payments, portal)

New capability templates cost more to build and maintain.

## Template #1: marketing-smb-v1 (baseline)

Template #1 is your "maximum coverage" baseline. Most future templates should be variants of this.

Capabilities to include in the baseline:
- CMS-driven pages with blocks
- Offers/services index + detail
- Articles/blog
- Case studies
- Testimonials
- Videos
- FAQ/help
- Legal pages
- Contact form + webhook
- Newsletter signup
- Multi-language
- Multi-location
- Team members page

### Current baseline coverage (implemented or explicitly supported)

- Tenant resolution by hostname (`*.linktrend.media` demos, plus real domains)
- CMS reads scoped by `siteId` + `locale` + `status=published`
- Pages composed from CMS blocks (single Pages collection)
- Hero (badge, title, subtitle/body, background image, CTA, social proof)
- Features (supports optional per-item link)
- Pricing (plans, highlighted plan, plan CTA, plan features)
- Testimonials (select testimonial docs)
- FAQ (question + rich-text answer)
- Articles + Case studies (select docs)
- Media block, RichText block, CTA block, Newsletter block
- Callout block, Video embed block, Related content block, Single testimonial block
- Locations (multi-location)
- Team members

## How to Create a New Variant Template (step-by-step)

### Step 1: Choose the template's target business type
Examples:
- Accountant (solo / firm)
- Lawn care
- HVAC
- Dentist
- School

### Step 2: Define what changes compared to the baseline
Keep this list short:
- Color palette and typography direction
- Hero tone and CTA style
- Default homepage sections
- Navigation order (rarely the routes)

### Step 3: Implement the frontend module
Create a new template module that:
- Exports a `templateId`
- Exports theme defaults
- Optionally overrides a small set of components (hero, header, cards)
- Defines which CMS blocks are used and how they appear

Key rule:
- Do not fork the platform. Templates are modules inside one shared platform.

Where this happens in code (shared platform repo):
- Template modules live in:
  - `/Users/linktrend/Projects/LiNKsites/apps/web-master/src/templates`
- The template registry lives in:
  - `/Users/linktrend/Projects/LiNKsites/apps/web-master/src/templates/registry.ts`

For a new template, you typically:
1. Duplicate the existing module:
   - `/Users/linktrend/Projects/LiNKsites/apps/web-master/src/templates/marketing-smb-v1.ts`
2. Change the `id` to something new (example: `lawn-care-v1`)
3. Optionally create a new PageRenderer (or reuse the current one)
4. Register the new template in `registry.ts`

### Step 4: Create the CMS seed preset
Write a seed preset for that template that:
- Creates a Site record (or works with an existing Site record)
- Seeds navigation (primary + footer)
- Seeds pages with sensible block content
- Seeds at least:
  - 1-3 offers/services
  - 1-3 articles
  - 1-2 case studies
  - multi-location (at least 1 location)
  - team members (at least 1 profile)
- Publishes the content

Where this happens in code (CMS repo):
- The factory seed script is:
  - `/Users/linktrend/Projects/LiNKsites/apps/cms/scripts/factory/create-demo-site.ts`

Current behavior:
- `create-demo-site.ts` seeds the baseline Template #1 dataset and sets `templateId` on the Site + Site Settings.

How new templates should be added:
- Add a simple `switch (templateId)` in `create-demo-site.ts`
  - `marketing-smb-v1` -> baseline seed
  - `lawn-care-v1` -> mostly the same seed, but with different copy, block ordering, and design defaults

### Step 5: Register the template
Add the template to a template registry so the factory command can use it:
- `create-demo-site --template <templateId> --hostname <host>`

### Step 6: Quality check (Definition of Done)
Before using a template for outreach:
- Home renders from CMS (not fallback)
- Header and footer nav render from CMS
- Offers index and offer detail render
- Articles index and article detail render
- Case studies index and case detail render
- Contact form works (hits webhook or logs)
- Legal pages render
- Multi-location page renders and shows correct addresses
- Team page renders and shows staff profiles
- Mobile layout looks intentional
- SEO metadata is present (title/description/canonical/hreflang where applicable)

## How to Add a New Capability Safely

If you must add a capability:
1. Add the CMS schema change (new collection or new fields).
2. Update the shared platform repository layer to fetch it with `siteId` + locale filters.
3. Update the rendering layer (components) and add normalization if needed.
4. Update Template #1 seed preset (so the capability is always available going forward).
5. Update the QA checklist.

Key principle:
- If a capability is "common across many SMBs", it belongs in Template #1.
- If it is "rare or expensive", it should be an optional paid add-on and not part of the baseline.
