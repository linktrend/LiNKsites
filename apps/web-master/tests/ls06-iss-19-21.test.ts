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
import { mapBlockToPayloadType } from "../src/components/page-renderer/semantic-map.ts";
import { FOOTER_ZONES, resolveShell, resolvedSocialLinks } from "../src/components/shell/resolved-shell.ts";

const root = dirname(fileURLToPath(import.meta.url));

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
  assert.throws(() => resolveLayoutRuntime({ layoutPackId: "A9" }), /Unknown required layout pack/);
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

test("packet surfaces do not advertise LS-06 acceptance in product code", () => {
  const renderer = readFileSync(resolve(root, "../src/components/page-renderer.tsx"), "utf8");
  assert.doesNotMatch(renderer, /LS-06 complete/);
  assert.match(renderer, /data-page-renderer/);
});
