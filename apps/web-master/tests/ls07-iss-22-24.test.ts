import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  assertNoLeak,
  projectPublishedAuthority,
  PublishedAuthorityError,
} from "../src/lib/seo/published-authority.ts";
import {
  assertJsonLdMatchesVisibleFacts,
  collectVisibleFacts,
  projectVisibleJsonLd,
  VisibleFactError,
} from "../src/lib/seo/visible-facts.ts";
import { evaluatePreHydrationHtml } from "../src/lib/seo/pre-hydration.ts";
import {
  buildDiscoverabilityRollbackPlan,
  publishedAuthorityDigest,
} from "../src/lib/seo/discoverability-rollback.ts";
import {
  activateSideEffect,
  rejectFakeSuccess,
  resolveConfiguredHook,
} from "../src/lib/forms/side-effect-policy.ts";
import {
  ACCESSIBILITY_MATRIX,
  evaluateAccessibilityMatrix,
  evaluatePerformanceBudgets,
  PERFORMANCE_BUDGETS,
  VISUAL_REGRESSION_FIXTURES,
  WCAG_TARGET,
} from "../src/lib/seo/quality-matrix.ts";
import { buildArticleJsonLd } from "../src/lib/seo.ts";

const root = dirname(fileURLToPath(import.meta.url));

const records = [
  { family: "home", locale: "en", path: "/en", status: "published" as const },
  { family: "home", locale: "es", path: "/es", status: "published" as const },
  { family: "contact", locale: "en", path: "/en/contact", status: "published" as const },
  { family: "contact", locale: "en", path: "/en/draft-contact", status: "draft" as const },
  { family: "home", locale: "en", path: "/en/private", status: "private" as const },
  { family: "home", locale: "en", path: "/en/old", status: "redirect" as const },
];

test("ISS-22 published authority excludes drafts/private/redirects from sitemap robots llms and AI", () => {
  const authority = projectPublishedAuthority({
    baseUrl: "https://example.test",
    locales: ["en", "es"],
    defaultLocale: "en",
    records,
    publicEligible: true,
    production: true,
  });
  assert.equal(authority.urls.length, 3);
  assert.ok(authority.sitemap.every((entry) => !entry.url.includes("draft") && !entry.url.includes("private") && !entry.url.includes("/old")));
  assert.equal(authority.robots.allowCrawling, true);
  assert.equal(authority.robots.sitemap, "https://example.test/sitemap.xml");
  assert.match(authority.llmsTxt, /https:\/\/example\.test\/en\/contact/);
  assert.doesNotMatch(authority.llmsTxt, /draft-contact/);
  assert.deepEqual(
    authority.aiProjection.map((item) => item.canonical).sort(),
    authority.sitemap.map((item) => item.url).sort(),
  );
  assert.equal(authority.hreflang["/"]["x-default"], "https://example.test/en");
  assert.equal(authority.hreflang["/"]["es"], "https://example.test/es");
});

test("ISS-22 non-production or ineligible sites omit sitemap and disallow robots", () => {
  const hidden = projectPublishedAuthority({
    baseUrl: "https://example.test",
    locales: ["en"],
    defaultLocale: "en",
    records,
    publicEligible: true,
    production: false,
  });
  assert.equal(hidden.sitemap.length, 0);
  assert.equal(hidden.robots.allowCrawling, false);
  assert.equal(hidden.aiProjection.length, 0);
});

test("ISS-22 leaks fail closed", () => {
  assert.throws(
    () =>
      assertNoLeak(records, [
        { family: "home", locale: "en", path: "/en/private", canonical: "https://example.test/en/private" },
      ]),
    PublishedAuthorityError,
  );
});

test("ISS-22 visible-fact JSON-LD omits invented fields and mismatches fail", () => {
  const facts = collectVisibleFacts({ name: "Acme", url: "https://example.test/en", author: "" });
  const jsonLd = projectVisibleJsonLd("Organization", facts);
  assert.equal(jsonLd.name, "Acme");
  assert.equal(jsonLd.author, undefined);
  assertJsonLdMatchesVisibleFacts(jsonLd, facts, ["name", "url"]);
  assert.throws(
    () => assertJsonLdMatchesVisibleFacts({ ...jsonLd, name: "Other" }, facts, ["name"]),
    VisibleFactError,
  );
  const article = buildArticleJsonLd({
    title: "Guide",
    description: "Visible excerpt",
    url: "/en/resources/articles/guide",
    image: "",
    datePublished: "",
    author: "",
  });
  assert.equal(article.headline, "Guide");
  assert.equal(article.image, undefined);
  assert.equal(article.author, undefined);
});

test("ISS-22 pre-hydration HTML requires title answer one h1 landmarks and crawlable links", () => {
  const html = `<html lang="en"><body><header><a href="/en">Home</a></header><main><h1>Welcome</h1><p>We install pumps.</p></main></body></html>`;
  const findings = evaluatePreHydrationHtml({ lang: "en", title: "Welcome", answer: "We install pumps.", html });
  assert.deepEqual(findings, []);
  const missing = evaluatePreHydrationHtml({ lang: "en", title: "Welcome", answer: "We install pumps.", html: "<div></div>" });
  assert.ok(missing.some((item) => item.code === "ssr_missing_main"));
  assert.ok(missing.some((item) => item.code === "ssr_h1_count"));
});

test("ISS-22 rollback plan is readback-bound and does not mutate runtime", () => {
  const authority = projectPublishedAuthority({
    baseUrl: "https://example.test",
    locales: ["en"],
    defaultLocale: "en",
    records,
    publicEligible: true,
    production: true,
  });
  const plan = buildDiscoverabilityRollbackPlan({
    previousDigest: "sha256:previous",
    current: authority,
  });
  assert.equal(plan.mutatesRuntime, false);
  assert.equal(plan.restoreWithoutProviderCheckout, true);
  assert.equal(plan.current.authorityDigest, publishedAuthorityDigest(authority));
  assert.notEqual(plan.previous.authorityDigest, plan.current.authorityDigest);
});

test("ISS-23 fake success is rejected and unconfigured booking/ecommerce stay inactive", () => {
  assert.equal(rejectFakeSuccess({ transportOk: true, payloadSuccess: true, enqueued: false }).success, false);
  assert.equal(rejectFakeSuccess({ transportOk: true, payloadSuccess: true, enqueued: true }).success, true);
  const booking = activateSideEffect({
    kind: "booking",
    endpoint: "/api/booking",
    configured: resolveConfiguredHook("booking", {}),
    requiresConsent: true,
    consentGranted: false,
  });
  assert.equal(booking.ok, false);
  if (!booking.ok) assert.equal(booking.code, "hook_not_configured");
  const ecommerce = activateSideEffect({
    kind: "ecommerce",
    endpoint: "/api/ecommerce",
    configured: true,
    requiresConsent: true,
    consentGranted: false,
  });
  assert.equal(ecommerce.ok, false);
  if (!ecommerce.ok) assert.equal(ecommerce.code, "consent_required");
  const newsletter = activateSideEffect({
    kind: "newsletter",
    endpoint: "https://example.test/fake",
    configured: true,
    requiresConsent: true,
    consentGranted: true,
  });
  assert.equal(newsletter.ok, false);
  if (!newsletter.ok) assert.equal(newsletter.code, "unreal_endpoint");
});

test("ISS-23 analytics requires consent", () => {
  const blocked = activateSideEffect({
    kind: "analytics",
    endpoint: "consent-gated-providers",
    configured: true,
    requiresConsent: true,
    consentGranted: false,
  });
  assert.equal(blocked.ok, false);
  const allowed = activateSideEffect({
    kind: "analytics",
    endpoint: "consent-gated-providers",
    configured: true,
    requiresConsent: true,
    consentGranted: true,
  });
  assert.equal(allowed.ok, true);
});

test("ISS-24 accessibility matrix performance budgets and visual fixtures exist with truthful labels", () => {
  assert.equal(WCAG_TARGET, "WCAG 2.2 AA");
  assert.ok(ACCESSIBILITY_MATRIX.some((row) => row.mode === "legal" && row.proof === "not-claimed"));
  assert.ok(ACCESSIBILITY_MATRIX.some((row) => row.mode === "manual"));
  const html = `<html lang="en"><body><main><h1>Shop</h1><img src="/a.png" alt="Pump"></main></body></html>`;
  const matrix = evaluateAccessibilityMatrix(html);
  assert.equal(matrix.find((row) => row.id === "a11y.h1")?.status, "PASS");
  assert.equal(matrix.find((row) => row.id === "a11y.legal")?.status, "NOT_CLAIMED");
  assert.equal(matrix.find((row) => row.id === "a11y.keyboard")?.status, "MANUAL");
  const perf = evaluatePerformanceBudgets({ lcpMs: 1800, inpMs: 120, cls: 0.05, transferBytes: 200000 });
  assert.ok(perf.every((row) => row.status === "PASS"));
  assert.equal(PERFORMANCE_BUDGETS.source, "lab");
  assert.ok(VISUAL_REGRESSION_FIXTURES.some((fixture) => fixture.id === "home-mobile"));
  assert.ok(VISUAL_REGRESSION_FIXTURES.some((fixture) => fixture.planId === "L"));
});

test("ISS-22/23/24 product files exist in owned surfaces", () => {
  const files = [
    "../src/lib/seo/published-authority.ts",
    "../src/lib/seo/published-catalog.ts",
    "../src/app/sitemap.ts",
    "../src/app/robots.ts",
    "../src/app/llms.txt/route.ts",
    "../src/app/api/newsletter/route.ts",
    "../src/app/api/booking/route.ts",
    "../src/app/api/ecommerce/route.ts",
    "../src/components/common/NewsletterSection.tsx",
  ];
  for (const file of files) {
    const text = readFileSync(resolve(root, file), "utf8");
    assert.ok(text.length > 0);
  }
  const newsletter = readFileSync(resolve(root, "../src/components/common/NewsletterSection.tsx"), "utf8");
  assert.doesNotMatch(newsletter, /Simulate API call/);
  assert.match(newsletter, /\/api\/newsletter/);
});
