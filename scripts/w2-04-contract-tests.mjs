import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFile(join(root, path), "utf8");
const fixture = JSON.parse(await read("apps/web-master/data/w2-04-published-fixture.json"));
const pageRoute = await read("apps/web-master/src/app/[lang]/[[...slug]]/page.tsx");
const client = await read("apps/web-master/src/lib/payload-client.ts");
const pagesSource = await read("apps/web-master/src/lib/repository/pages.ts");
const preview = await read("apps/web-master/src/app/[lang]/demo/[token]/[[...slug]]/page.tsx");
const css = await read("apps/web-master/src/styles/globals.css");
const siteContext = await read("apps/web-master/src/lib/site-context.ts");
const legalRoutes = await Promise.all([
  read("apps/web-master/src/app/[lang]/legal/privacy-policy/page.tsx"),
  read("apps/web-master/src/app/[lang]/legal/terms-of-use/page.tsx"),
  read("apps/web-master/src/app/[lang]/legal/cookie-policy/page.tsx"),
]);
const renderer = await read("apps/web-master/src/components/page-renderer.tsx");
const pricing = await read("apps/web-master/src/components/marketing/PricingHomepage.tsx");
const background = await read("apps/web-master/src/components/marketing/DynamicBgSection.tsx");
const markdownRoute = await read("apps/web-master/src/app/ai/markdown/route.ts");
const publicSurface = await read("apps/web-master/src/lib/public-surface.ts");
const siteContextSource = await read("apps/web-master/src/lib/site-context.ts");
const robots = await read("apps/web-master/src/app/robots.ts");
const sitemap = await read("apps/web-master/src/app/sitemap.ts");
const offerLayout = await read("apps/web-master/src/layouts/OfferPageLayout.tsx");
const offerIndexLayout = await read("apps/web-master/src/layouts/OfferIndexLayout.tsx");
const faqRoutes = await Promise.all([
  read("apps/web-master/src/app/[lang]/resources/faq/page.tsx"),
  read("apps/web-master/src/app/[lang]/resources/faq/[categorySlug]/page.tsx"),
  read("apps/web-master/src/app/[lang]/resources/faq/[categorySlug]/[articleSlug]/page.tsx"),
]);
const templateRegistry = await read("apps/web-master/src/templates/registry.ts");
const templateContext = await read("apps/web-master/src/lib/template-context.ts");
const templateAdmission = await read("apps/web-master/src/lib/template-admission.ts");
const publicRouteGuard = await read("apps/web-master/src/lib/public-route-guard.ts");
const cmsSites = await read("apps/cms/src/collections/Sites.ts");
const cmsSiteSettings = await read("apps/cms/src/collections/SiteSettings.ts");
const runtime = await read("apps/web-master/src/config/runtime.ts");
const readyz = await read("apps/web-master/src/app/api/readyz/route.ts");
const publicRoutes = await Promise.all([
  read("apps/web-master/src/app/llms.txt/route.ts"),
  read("apps/web-master/src/app/.well-known/ai-actions.json/route.ts"),
  read("apps/web-master/src/app/api/contact/route.ts"),
  read("apps/web-master/src/app/api/ai-actions/contact/route.ts"),
  read("apps/web-master/src/app/ai/markdown/route.ts"),
]);

assert.equal(fixture.fixtureName, "w2-04-published-content-contract");
assert.deepEqual(fixture.sites, [{ id: "demo-site", status: "published" }]);
assert.deepEqual(fixture.siteDomains, [
  { id: "demo-site-localhost", hostname: "localhost", site: "demo-site", primary: true },
]);
assert.deepEqual(
  ["home", "about", "services", "contact", "legal/privacy-policy", "legal/terms-of-use"],
  fixture.pages.map((page) => page.slug),
);
for (const page of fixture.pages) {
  assert.equal(page.status, "published", `${page.slug} must be published`);
  assert.equal(page.site, fixture.sites[0].id, `${page.slug} must be tenant scoped`);
  assert.ok(page.content.length > 0, `${page.slug} must contain blocks`);
  assert.ok(page.revision, `${page.slug} must carry a revision`);
}

assert.match(client, /cmsProvider === "fixture"/);
assert.match(client, /doc\.status !== undefined && doc\.status !== "published"/);
assert.match(client, /collection === "pages" && doc\.status !== "published"/);
assert.doesNotMatch(client, /mock\.site\?\.id \|\| "company-site"/);
assert.doesNotMatch(client, /hostname: hostnameFilter, site: siteId/);
assert.match(client, /site: siteId/);
assert.match(siteContext, /throw new SiteResolutionError\(host\)/);
assert.match(siteContext, /collection: "sites"/);
assert.match(siteContext, /status: \{ equals: "published" \}/);
assert.doesNotMatch(siteContext, /defaultSiteId|DEFAULT_SITE_ID/);
assert.doesNotMatch(runtime, /defaultSiteId|DEFAULT_SITE_ID/);
assert.doesNotMatch(readyz, /DEFAULT_SITE_ID/);
assert.match(publicSurface, /site\?\.status === "published"/);
assert.match(publicSurface, /previewEnvironment === "private-preview"/);
assert.match(publicSurface, /countPublicPages/);
assert.match(siteContextSource, /hasPublicPage/);
assert.match(siteContextSource, /countPublicPages\(result\.docs\)/);
assert.match(robots, /getSiteIdFromRequest/);
assert.match(sitemap, /isPageVisibleToAudience\(page, "public"\)/);
assert.doesNotMatch(sitemap, /listOffers|listArticles|listCaseStudies|listVideos/);
assert.doesNotMatch(offerLayout, /mockCaseStudies|mockResources|mockFaqs|SOC 2|GDPR|CCPA|1,000\+/);
assert.doesNotMatch(offerIndexLayout, /Solutions Built for Scale|Enterprise-grade|Ready to Get Started/);
for (const faqRoute of faqRoutes) {
  assert.doesNotMatch(faqRoute, /helpMockData|HelpCentrePageContent/);
}
assert.doesNotMatch(templateRegistry, /marketingSmbV1|marketing-smb-v1/);
assert.doesNotMatch(templateContext, /DEFAULT_TEMPLATE_ID|\|\|/);
assert.match(templateContext, /assertTemplateAdmission/);
assert.match(templateAdmission, /LINKSITES_ADMITTED_TEMPLATE_RECEIPT_JSON/);
assert.match(templateAdmission, /LINKSITES_ADMITTED_TEMPLATE_EVIDENCE_JSON/);
assert.match(templateAdmission, /assertLibraryConsumptionReceipt/);
assert.match(templateAdmission, /assertLibraryConsumptionEvidence/);
assert.match(templateAdmission, /materializedAssetBytes/);
assert.match(templateAdmission, /evidence\.files/);
assert.match(publicRouteGuard, /getSiteIdFromRequest/);
assert.match(publicRouteGuard, /status: 404/);
for (const publicRoute of publicRoutes) {
  assert.match(publicRoute, /getPublicSiteIdOrNull|getSiteIdFromRequest/);
  assert.match(publicRoute, /publicRouteNotFound|catch\(\(\) => null\)/);
}
assert.match(templateAdmission, /LINKSITES_ADMITTED_TEMPLATE_SHA/);
assert.doesNotMatch(cmsSites, /defaultValue:\s*['"]marketing-smb-v1/);
assert.doesNotMatch(cmsSiteSettings, /defaultValue:\s*['"]marketing-smb-v1/);
assert.match(pagesSource, /page\.status !== "published"/);
assert.match(pagesSource, /Array\.isArray\(page\.content\) \? page\.content : page\.layout/);
assert.match(pagesSource, /audience = "public"/);
assert.match(pageRoute, /if \(!page\) return notFound\(\)/);
assert.match(pageRoute, /params: Promise</);
assert.match(pageRoute, /const \{ lang, slug = \[\] \} = await params/);
assert.doesNotMatch(pageRoute, /fallbackPage|Default demo content|Welcome to the Master Template/);
assert.match(preview, /PREVIEW_ACCESS_TOKEN/);
assert.match(preview, /getPreviewSiteIdFromRequest/);
assert.doesNotMatch(preview, /getSiteIdFromRequest/);
assert.match(preview, /audience: "private-preview"/);
assert.match(preview, /index: false, follow: false/);
assert.match(preview, /data-private-preview/);
for (const legalRoute of legalRoutes) {
  assert.match(legalRoute, /getPageBySlug/);
  assert.doesNotMatch(legalRoute, /getLegalBySlug|LegalLayout/);
}
assert.doesNotMatch(renderer, /SignupHero/);
assert.doesNotMatch(renderer, /heading = block\.title \?\? "Welcome"/);
assert.doesNotMatch(pricing, /defaultPricingPlans|Perfect for pilots|Unlimited automations/);
assert.doesNotMatch(background, /fallbackBackgroundImages|getFallbackImage/);
assert.doesNotMatch(markdownRoute, /getLegalBySlug|markdownForLegal/);
assert.match(css, /@media/);

console.log("W2-04 contract tests: PASS");
console.log("routes: home, about, services, contact, privacy, terms, not-found/error");
console.log("privacy: token wall + noindex/nofollow + no-store headers");
console.log("content: explicit published-only fixture; no production fallback");
console.log("adversarial: unknown tenant, unpublished/layout contract, legal bypass, demo fallbacks");
console.log("fixture adapter: explicit published site + hostname mapping only; no DEFAULT_SITE_ID synthesis");
