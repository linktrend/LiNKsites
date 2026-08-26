import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  FAMILY_IDS,
  resolveFamilyRoute,
  tenantSafeWhere,
} from "../src/lib/routes.ts";
import {
  LAYOUT_COMPOSITIONS,
  LAYOUT_PACK_IDS,
  assertStructurallyDistinctCompositions,
  resolveLayoutRuntime,
} from "../src/components/page-renderer/layout-packs.ts";
import {
  bindAcceptedLayoutIdentities,
  loadAcceptedLayoutRuntime,
} from "../src/components/page-renderer/accepted-identities.ts";
import { mapBlockToPayloadType } from "../src/components/page-renderer/semantic-map.ts";
import {
  IMPLEMENTATION_ROLLBACK_SCHEMA,
  buildImplementationRendererConfiguration,
  buildImplementationRollbackPlan,
  readbackRendererConfiguration,
  rendererConfigurationDigest,
} from "../src/components/page-renderer/renderer-rollback.ts";
import { evaluateIss1921RuntimeProof } from "../src/components/page-renderer/runtime-proof.ts";
import { FOOTER_ZONES, resolveShell, resolvedSocialLinks } from "../src/components/shell/resolved-shell.ts";

const root = dirname(fileURLToPath(import.meta.url));

const acceptedLs04 = {
  source: "injected" as const,
  workingContentIdentity: "ls04:working-content:injected:v1",
  promotionReceiptIdentity: "ls04:promotion-receipt:injected:v1",
};

const acceptedLs05 = {
  source: "injected" as const,
  adapterIdentity: "ls05:adapter:injected:v1",
  materializationReceiptIdentity: "ls05:materialization:injected:v1",
};

const acceptedProvider = {
  source: "injected" as const,
  providerId: "master-template-type-1",
  semver: "2.0.0-a1.1",
  layoutPackId: "A1" as const,
  candidateIdentity: "provider:injected:layout-A1",
};

const acceptedLayout = {
  source: "injected" as const,
  layoutPackId: "A1" as const,
  planId: "B" as const,
  shellId: "marketing-shell",
};

test("ISS-19 A1/A2/A3 PageRenderer compositions are structurally distinct", () => {
  assertStructurallyDistinctCompositions();
  assert.equal(LAYOUT_COMPOSITIONS.A1.pageRenderer, "composition-a1-linear-shell");
  assert.equal(LAYOUT_COMPOSITIONS.A2.architectureReady, true);
  assert.equal(LAYOUT_COMPOSITIONS.A3.architectureReady, true);
  assert.deepEqual([...LAYOUT_PACK_IDS], ["A1", "A2", "A3"]);
  const a1 = resolveLayoutRuntime({ layoutPackId: "A1", planId: "A" });
  const a2 = resolveLayoutRuntime({ layoutPackId: "A2", planId: "B" });
  const a3 = resolveLayoutRuntime({ layoutPackId: "A3", planId: "C" });
  assert.notEqual(a1.composition.regions.join("|"), a2.composition.regions.join("|"));
  assert.notEqual(a2.composition.regions.join("|"), a3.composition.regions.join("|"));
  assert.throws(() => resolveLayoutRuntime({ layoutPackId: "A9", planId: "A" }), /Unknown required layout pack/);
});

test("ISS-19 binds layoutPackId/planId from accepted LS-04/LS-05 identities and fails closed when absent", () => {
  const bound = bindAcceptedLayoutIdentities({
    ls04: acceptedLs04,
    ls05: acceptedLs05,
    provider: acceptedProvider,
    layout: acceptedLayout,
  });
  assert.equal(bound.ls05.layoutPackId, "A1");
  assert.equal(bound.ls04.capabilityPlanId, "B");
  assert.throws(() => resolveLayoutRuntime({ planId: "A" }), /LS-05 layoutPackId is absent/);
  assert.throws(() => resolveLayoutRuntime({ layoutPackId: "A1" }), /LS-04 planId is absent/);
  assert.throws(() => bindAcceptedLayoutIdentities({}), /LS-04 identity is absent/);
  assert.throws(
    () => bindAcceptedLayoutIdentities({ ls04: acceptedLs04, ls05: acceptedLs05 }),
    /layoutPackId is absent/,
  );
  assert.throws(
    () =>
      bindAcceptedLayoutIdentities({
        ls04: acceptedLs04,
        ls05: acceptedLs05,
        provider: { ...acceptedProvider, layoutPackId: "" },
        layout: { ...acceptedLayout, layoutPackId: "", planId: "B" },
      }),
    /layoutPackId is absent/,
  );
  assert.throws(
    () =>
      loadAcceptedLayoutRuntime({
        LINKSITES_LS04_IDENTITY_JSON: JSON.stringify(acceptedLs04),
      }),
    /accepted LS-04\/LS-05 identities are absent/,
  );
  const fromEnv = loadAcceptedLayoutRuntime({
    LINKSITES_LS06_ACCEPTED_IDENTITIES_JSON: JSON.stringify({
      ls04: acceptedLs04,
      ls05: acceptedLs05,
      provider: acceptedProvider,
      layout: acceptedLayout,
    }),
  });
  assert.equal(fromEnv.layoutPackId, "A1");
  assert.equal(fromEnv.planId, "B");
  const layout = readFileSync(resolve(root, "../src/app/(public)/[lang]/layout.tsx"), "utf8");
  const packs = readFileSync(resolve(root, "../src/components/page-renderer/layout-packs.ts"), "utf8");
  const settings = readFileSync(resolve(root, "../src/lib/repository/siteSettings.ts"), "utf8");
  assert.doesNotMatch(layout, /getSiteSettings/);
  assert.doesNotMatch(packs, /\? "A1"/);
  assert.doesNotMatch(packs, /\? "A"/);
  assert.doesNotMatch(settings, /layoutPackId/);
  assert.doesNotMatch(settings, /planId/);
});

test("ISS-19 provider semantics fail closed for unknown required ids", () => {
  const mapped = mapBlockToPayloadType({ blockType: "hero" });
  assert.equal(mapped.payloadBlockType, "hero");
  const fromRole = mapBlockToPayloadType({ providerRole: "hero" });
  assert.equal(fromRole.payloadBlockType, "hero");
  assert.equal(fromRole.reactSymbol, "PageHero");
  assert.throws(() => mapBlockToPayloadType({ providerRole: "not-a-role" }), /Unknown required provider semantic/);
  assert.throws(() => mapBlockToPayloadType({ blockType: "mystery" }), /Unknown required block type/);
});

test("ISS-20 resolved shell has no placeholders and isolates Type L", () => {
  const marketing = resolveShell({ locale: "en", planId: "A" });
  assert.equal(marketing.header, "brand-nav-locale");
  assert.equal(marketing.footer, "five-zone");
  assert.equal(marketing.mobile, "accessible-disclosure");
  assert.equal(marketing.locale, "en");
  assert.deepEqual([...marketing.actions], ["contact", "primary-cta"]);
  assert.equal(marketing.noPlaceholders, true);
  assert.equal(marketing.typeLShellMode, "not-applicable");
  const typeL = resolveShell({ locale: "es", planId: "L" });
  assert.equal(typeL.typeLIsolation, true);
  assert.equal(typeL.typeLShellMode, "isolated");
  assert.deepEqual([...typeL.actions], ["contact"]);
  assert.deepEqual([...FOOTER_ZONES], ["brand", "navigation", "contact", "social", "policy"]);
  assert.equal(resolvedSocialLinks({ twitter: "@company", linkedin: "" }).length, 0);
  assert.equal(resolvedSocialLinks({ linkedin: "https://linkedin.com/company/real" }).length, 1);
  const header = readFileSync(resolve(root, "../src/components/navigation/Header.tsx"), "utf8");
  const footer = readFileSync(resolve(root, "../src/components/navigation/Footer.tsx"), "utf8");
  assert.doesNotMatch(header, /placeholder/i);
  assert.doesNotMatch(header, /animate-pulse/);
  assert.doesNotMatch(footer, /linkedin\.com"/);
  assert.doesNotMatch(footer, /placeholder/i);
  assert.match(header, /data-shell-header/);
  assert.match(footer, /data-footer-zones/);
  assert.doesNotMatch(header, /planId = "A"/);
  assert.doesNotMatch(footer, /planId = "A"/);
});

test("ISS-21 family route/locale/redirect/collision/retirement rules", () => {
  assert.deepEqual([...FAMILY_IDS], ["home", "about", "contact", "legal", "collection", "detail"]);
  assert.equal(resolveFamilyRoute("/en").kind, "ok");
  assert.equal(resolveFamilyRoute("/en/about").kind, "ok");
  assert.equal(resolveFamilyRoute("/en/contact").kind, "ok");
  assert.equal(resolveFamilyRoute("/en/legal/privacy-policy").kind, "ok");
  assert.equal(resolveFamilyRoute("/en/offers").kind, "ok");
  assert.equal(resolveFamilyRoute("/en/offers/launch").kind, "ok");
  assert.equal(resolveFamilyRoute("/en/resources/articles/hello").kind, "ok");
  const homeRedirect = resolveFamilyRoute("/en/home");
  assert.equal(homeRedirect.kind, "redirect");
  if (homeRedirect.kind === "redirect") assert.equal(homeRedirect.to, "/en");
  assert.equal(resolveFamilyRoute("/en/index").kind, "not_found");
  assert.equal(resolveFamilyRoute("/en/demo").kind, "collision");
  assert.equal(resolveFamilyRoute("/en/api").kind, "collision");
  assert.equal(resolveFamilyRoute("/fr/about").kind, "not_found");
  assert.equal(resolveFamilyRoute("/en/legal/unknown").kind, "not_found");
  assert.throws(() => tenantSafeWhere("", "en"), /tenant-safe/);
  const tenant = tenantSafeWhere("site-1", "en");
  assert.deepEqual(tenant, { siteId: "site-1", locale: "en" });
});

test("ISS-21 path-level docs and FAQ article family authority", () => {
  assert.equal(resolveFamilyRoute("/en/resources/faq").kind, "ok");
  assert.equal(resolveFamilyRoute("/en/resources/faq/billing").kind, "ok");
  const docsEn = resolveFamilyRoute("/en/resources/docs");
  assert.equal(docsEn.kind, "redirect");
  if (docsEn.kind === "redirect") {
    assert.equal(docsEn.to, "/en/resources");
    assert.equal(docsEn.locale, "en");
  }
  const docsNested = resolveFamilyRoute("/es/resources/docs/guide");
  assert.equal(docsNested.kind, "redirect");
  if (docsNested.kind === "redirect") {
    assert.equal(docsNested.to, "/es/resources");
    assert.equal(docsNested.locale, "es");
  }
  const faqArticle = resolveFamilyRoute("/en/resources/faq/billing/why-invoice");
  assert.equal(faqArticle.kind, "redirect");
  if (faqArticle.kind === "redirect") {
    assert.equal(faqArticle.to, "/en/resources/faq/billing");
    assert.equal(faqArticle.locale, "en");
  }
  const faqArticleZh = resolveFamilyRoute("/zh-tw/resources/faq/payments/receipt");
  assert.equal(faqArticleZh.kind, "redirect");
  if (faqArticleZh.kind === "redirect") {
    assert.equal(faqArticleZh.to, "/zh-tw/resources/faq/payments");
    assert.equal(faqArticleZh.locale, "zh-tw");
  }
  assert.equal(resolveFamilyRoute("/en/resources/faq/billing/why-invoice/extra").kind, "collision");
  const pageService = readFileSync(resolve(root, "../src/lib/pageService.ts"), "utf8");
  const docsPage = readFileSync(resolve(root, "../src/app/(public)/[lang]/resources/docs/page.tsx"), "utf8");
  const faqIndex = readFileSync(resolve(root, "../src/app/(public)/[lang]/resources/faq/page.tsx"), "utf8");
  const faqCategory = readFileSync(
    resolve(root, "../src/app/(public)/[lang]/resources/faq/[categorySlug]/page.tsx"),
    "utf8",
  );
  assert.doesNotMatch(pageService, /getDocsPage/);
  assert.doesNotMatch(docsPage, /getDocsPage/);
  assert.match(faqIndex, /tenantSafeWhere/);
  assert.match(faqCategory, /tenantSafeWhere/);
  assert.match(faqIndex, /page\.data\.faqs\.length === 0/);
  assert.match(faqCategory, /faqs\.length === 0/);
});

test("implementation renderer-configuration rollback digest readback is distinct from preparation rollback.json", () => {
  const configuration = buildImplementationRendererConfiguration({
    layoutPackId: "A1",
    planId: "B",
    locale: "en",
  });
  const current = rendererConfigurationDigest(configuration);
  const previous = rendererConfigurationDigest(
    buildImplementationRendererConfiguration({ layoutPackId: "A3", planId: "L", locale: "es" }),
  );
  const plan = buildImplementationRollbackPlan({ previousDigest: previous, configuration });
  assert.equal(plan.schemaVersion, IMPLEMENTATION_ROLLBACK_SCHEMA);
  assert.equal(plan.distinctFromPreparationRollback, true);
  assert.notEqual(plan.schemaVersion, "ls06-rollback-plan/v1");
  assert.equal(readbackRendererConfiguration(configuration, current), current);
  assert.throws(() => readbackRendererConfiguration(configuration, previous), /readback mismatch/);
  const rollbackSource = readFileSync(resolve(root, "../src/components/page-renderer/renderer-rollback.ts"), "utf8");
  assert.match(rollbackSource, /ls06-implementation-rollback\/v1/);
  assert.doesNotMatch(rollbackSource, /scripts\/profile-v2-quality\/ls06\/fixtures/);
});

test("ISS-19..21 runtime proof harness passes without claiming packet acceptance", () => {
  const report = evaluateIss1921RuntimeProof();
  assert.equal(report.status, "PASS");
  assert.equal(report.preparationOnly, false);
  assert.equal(report.runtimeProof, true);
  assert.equal(report.ls06Complete, false);
  assert.equal(report.packetAcceptanceClaimed, false);
  assert.ok(report.checks.every((item) => item.status === "PASS"), JSON.stringify(report.checks, null, 2));
});
