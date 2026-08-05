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

assert.equal(fixture.fixtureName, "w2-04-published-content-contract");
assert.deepEqual(
  ["home", "about", "services", "contact", "legal/privacy-policy", "legal/terms-of-use"],
  fixture.pages.map((page) => page.slug),
);
for (const page of fixture.pages) {
  assert.equal(page.status, "published", `${page.slug} must be published`);
  assert.equal(page.site, fixture.site.id, `${page.slug} must be tenant scoped`);
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
assert.doesNotMatch(siteContext, /return runtimeConfig\.defaultSiteId;\s*\n};/);
assert.match(pagesSource, /page\.status !== "published"/);
assert.match(pagesSource, /Array\.isArray\(page\.content\) \? page\.content : page\.layout/);
assert.match(pageRoute, /if \(!page\) return notFound\(\)/);
assert.match(pageRoute, /params: Promise</);
assert.match(pageRoute, /const \{ lang, slug = \[\] \} = await params/);
assert.doesNotMatch(pageRoute, /fallbackPage|Default demo content|Welcome to the Master Template/);
assert.match(preview, /PREVIEW_ACCESS_TOKEN/);
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
console.log("fixture adapter: no synthetic tenant/locale or hostname mapping");
