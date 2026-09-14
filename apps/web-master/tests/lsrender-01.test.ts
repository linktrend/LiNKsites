import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { REQUIRED_A1_PROVIDER_ROLES } from "@linksites/factory-catalog";

import {
  assertConsumerAdapterSurface,
  assertNotAllHeroProjection,
} from "../src/components/page-renderer/adapter-surface.ts";
import { composeLayoutBody, pageRendererMountAttributes } from "../src/components/page-renderer/compose-layout.ts";
import { resolveLayoutRuntime } from "../src/components/page-renderer/layout-packs.ts";
import { collectionActive, resolvePlanActivation } from "../src/components/page-renderer/plan-behavior.ts";
import { mapBlockToPayloadType } from "../src/components/page-renderer/semantic-map.ts";
import { resolveFamilyRoute } from "../src/lib/routes.ts";
import { jsonLdForVisibleFamily, visibleFactsFromPage } from "../src/lib/seo/family-jsonld.ts";
import { evaluatePreHydrationHtml } from "../src/lib/seo/pre-hydration.ts";
import { renderSlot } from "../src/lib/slotRenderer.tsx";

const root = dirname(fileURLToPath(import.meta.url));

test("LSRENDER-01 adapter surface covers every required A1 role without all-Hero flattening", () => {
  assertConsumerAdapterSurface();
  for (const role of REQUIRED_A1_PROVIDER_ROLES) {
    const mapped = mapBlockToPayloadType({ providerRole: role });
    assert.notEqual(mapped.payloadBlockType, "", role);
  }
  assert.throws(
    () => assertNotAllHeroProjection(["hero", "hero", "hero"]),
    /all-Hero projection is not admitted/,
  );
});

test("LSRENDER-01 A/B/C/L keep products and services distinct and isolate Type L", () => {
  assert.equal(collectionActive("A", "products"), false);
  assert.equal(collectionActive("A", "services"), true);
  assert.equal(collectionActive("C", "products"), true);
  assert.equal(collectionActive("C", "services"), false);
  assert.equal(collectionActive("B", "products"), true);
  assert.equal(collectionActive("B", "services"), true);
  const typeL = resolvePlanActivation("L");
  assert.equal(typeL.typeLIsolation, true);
  assert.equal(typeL.newsletter, false);
  assert.equal(typeL.cookies, false);
  assert.equal(resolveFamilyRoute("/en/products").kind, "ok");
  assert.equal(resolveFamilyRoute("/en/services").kind, "ok");
  assert.equal(resolveFamilyRoute("/en/team/ada").kind, "ok");
  assert.equal(resolveFamilyRoute("/en/locations/hq").kind, "ok");
  assert.notEqual(resolveFamilyRoute("/en/products").kind === "ok" && resolveFamilyRoute("/en/services").kind === "ok", false);
});

test("LSRENDER-01 server HTML renders structural A1 vs A2 and bound facts without placeholders", () => {
  const blocks = [
    { id: "b1", blockType: "hero", title: "Acme Pumps", subtitle: "We install pumps." },
    { id: "b2", providerRole: "featured_services", title: "Services", items: [{ title: "Install" }] },
    { id: "b3", providerRole: "featured_products", title: "Products", items: [{ title: "Pump 200" }] },
  ];
  const mapped = blocks.map((block) => mapBlockToPayloadType(block));
  assert.deepEqual(
    mapped.map((item) => item.payloadBlockType),
    ["hero", "services", "products"],
  );
  assertNotAllHeroProjection(mapped.map((item) => item.payloadBlockType));
  const a1 = resolveLayoutRuntime({ layoutPackId: "A1", planId: "B" });
  const a2 = resolveLayoutRuntime({ layoutPackId: "A2", planId: "B" });
  const a3 = resolveLayoutRuntime({ layoutPackId: "A3", planId: "C" });
  const main = createElement(
    "div",
    { "data-region": "main" },
    createElement("h1", null, "Acme Pumps"),
    createElement("p", null, "We install pumps."),
    createElement("section", { "data-payload-block-type": "services" }, "Install"),
    createElement("section", { "data-payload-block-type": "products" }, "Pump 200"),
  );
  const markupA1 = renderToStaticMarkup(
    createElement("div", pageRendererMountAttributes(a1), composeLayoutBody(a1, main, "Acme Pumps")),
  );
  const markupA2 = renderToStaticMarkup(
    createElement("div", pageRendererMountAttributes(a2), composeLayoutBody(a2, main, "Acme Pumps")),
  );
  const markupA3 = renderToStaticMarkup(
    createElement("div", pageRendererMountAttributes(a3), composeLayoutBody(a3, main, "Acme Pumps")),
  );
  assert.match(markupA1, /data-layout-pack="A1"/);
  assert.match(markupA1, /data-architecture-ready="true"/);
  assert.match(markupA1, /data-payload-block-type="services"/);
  assert.match(markupA1, /data-payload-block-type="products"/);
  assert.doesNotMatch(markupA1, /placeholder/i);
  assert.doesNotMatch(markupA1, /data-region="aside"/);
  assert.match(markupA2, /data-region="aside"/);
  assert.match(markupA3, /data-region="secondary"/);
  const wrapped = `<html lang="en"><body><header><a href="/en">Home</a></header><main>${markupA1}</main></body></html>`;
  const findings = evaluatePreHydrationHtml({
    lang: "en",
    title: "Acme Pumps",
    answer: "We install pumps.",
    html: wrapped,
  });
  assert.deepEqual(findings, []);
});

test("LSRENDER-01 visible family JSON-LD stays bound to published facts", () => {
  const facts = visibleFactsFromPage({ name: "Acme Pumps", url: "https://example.test/en", description: "We install pumps." });
  const service = jsonLdForVisibleFamily("service", facts);
  assert.equal(service["@type"], "Service");
  assert.equal(service.name, "Acme Pumps");
  assert.equal(service.author, undefined);
});

test("LSRENDER-01 slots and unmapped required ids fail closed", () => {
  assert.throws(() => renderSlot({ slotName: "hero", slotType: "hero", contentBindings: {} }), /Unmapped required slot/);
});

test("LSRENDER-01 template config is not an all-hero projection", () => {
  const config = JSON.parse(readFileSync(resolve(root, "../template.config.json"), "utf8"));
  const pages = Object.values(config.pages) as Array<{ slots: Record<string, unknown> }>;
  for (const page of pages) {
    const slotNames = Object.keys(page.slots);
    assert.ok(slotNames.some((name) => name !== "hero"), JSON.stringify(slotNames));
  }
  assert.equal(config.pages["/contact"].slots.cta.url, "/contact");
});
