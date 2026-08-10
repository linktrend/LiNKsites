# W2-04 — Master Template and Private Demo

**Status:** Planned — requires Wave 1 PASS
**Wave:** 2
**Executor:** one Codex Luna High implementation agent
**Safe lane:** `web-master` plus paired substantive LiNKlibraries artifact

## Outcome

Turn `marketing-smb-v1` into a production-capable reusable master template that renders complete CMS content and produces a private, non-indexable demo suitable for the first end-to-end test.

## Required implementation

1. Remove production dependence on mock/example/fallback business data. Missing required CMS data must produce a controlled error or gate failure, not a plausible fake website.
2. Render the canonical page/section/content schema from Payload published content with organization/site routing and correct revision/cache behavior.
3. Support the approved optional sections and vertical/theme tokens without embedding lead-specific logic in reusable components.
4. Complete responsive layouts, navigation, forms or non-submitting contact affordances as specified, media rendering, error/not-found behavior, metadata, sitemap/robots policy, and accessibility semantics.
5. Ensure private demos are protected by the approved privacy wall and emit `noindex,nofollow`; unpublished/draft data must not leak through public routes, metadata, caches, source maps, or APIs.
6. Implement health/readiness endpoints appropriate to deployment and fail readiness if the mandatory CMS dependency/configuration is invalid.
7. Provide functional, schema/render, accessibility, SEO/privacy, broken-link, responsive viewport, and deterministic visual-regression tests.
8. Move or publish the real reusable implementation through LiNKlibraries according to W1-05. Record the exact approved/candidate status honestly and pin the final tested SHA in LiNKsites.
9. Keep LiNKsites-specific catalog/lifecycle logic outside the library artifact.
10. Prove a clean production build and runtime against real local Payload content produced by W2-03.

## Required test pages

At minimum test the complete set required by the accepted site specification, commonly home, about, service/list and detail pages, contact, privacy/legal pages, and not-found/error paths. The executor must derive the definitive list from the accepted template contract and record it; no required route may be skipped.

## Acceptance gates

- Every required route renders real lead-specific CMS content with no mock markers.
- Private preview is inaccessible without authorization and is non-indexable even if a URL leaks.
- Anonymous users cannot query draft/private content outside the allowed protected render path.
- Production build, browser E2E, accessibility, link, responsive, and visual checks pass.
- The exact LiNKlibraries SHA and artifact checksum are recorded in the Factory Catalog/ledger evidence.

## Evidence and handoff

Provide route/content matrix, screenshots at defined viewports, accessibility/SEO/privacy reports, build/test output, protected-access proof, exact LiNKsites and LiNKlibraries SHAs, library receipt, and deployment assumptions for W2-07.

