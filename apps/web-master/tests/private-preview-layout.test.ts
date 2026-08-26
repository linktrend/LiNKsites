import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { MASTER_TEMPLATE_PIN } from "@linksites/factory-catalog/master-template-pin";

import {
  composeLayoutBody,
  pageRendererMountAttributes,
} from "../src/components/page-renderer/compose-layout.ts";
import { resolveLayoutRuntime } from "../src/components/page-renderer/layout-packs.ts";
import { loadPrivatePreviewLayoutRuntime } from "../src/lib/private-preview-layout.ts";

const root = dirname(fileURLToPath(import.meta.url));
const demoPage = readFileSync(
  resolve(root, "../src/app/(private)/[lang]/demo/[[...slug]]/page.tsx"),
  "utf8",
);
const tokenDemoPage = readFileSync(
  resolve(root, "../src/app/(private)/[lang]/demo/[token]/[[...slug]]/page.tsx"),
  "utf8",
);
const middleware = readFileSync(resolve(root, "../src/middleware.ts"), "utf8");

const acceptedIdentities = {
  ls04: {
    source: "injected" as const,
    workingContentIdentity: "ls04:working-content:injected:v1",
    promotionReceiptIdentity: "ls04:promotion-receipt:injected:v1",
  },
  ls05: {
    source: "injected" as const,
    adapterIdentity: "ls05:adapter:injected:v1",
    materializationReceiptIdentity: "ls05:materialization:injected:v1",
  },
  provider: {
    source: "injected" as const,
    providerId: MASTER_TEMPLATE_PIN.entryId,
    semver: MASTER_TEMPLATE_PIN.version,
    layoutPackId: "A1" as const,
    candidateIdentity: "provider:injected:layout-A1",
  },
  layout: {
    source: "injected" as const,
    layoutPackId: "A1" as const,
    planId: "B" as const,
    shellId: "marketing-shell",
  },
};

test("private preview pages bind layoutPackId/planId instead of rendering without accepted identities", () => {
  for (const source of [demoPage, tokenDemoPage]) {
    assert.match(source, /loadPrivatePreviewLayoutRuntime/);
    assert.match(source, /layoutPackId=\{runtime\.layoutPackId\}/);
    assert.match(source, /planId=\{runtime\.planId\}/);
    assert.match(source, /data-private-preview="true"/);
    assert.doesNotMatch(source, /getSiteSettings/);
  }
  assert.match(middleware, /x-linksites-preview-key/);
  assert.match(middleware, /noindex, nofollow, noarchive/);
  assert.match(middleware, /private, no-store, max-age=0/);
});

test("PageRenderer still fail-closes when layout identities are omitted", () => {
  assert.throws(() => resolveLayoutRuntime({}), /LS-05 layoutPackId is absent/);
});

test("private preview layout runtime binds injected LS-04/LS-05 identities", () => {
  const runtime = loadPrivatePreviewLayoutRuntime({
    LINKSITES_LS06_ACCEPTED_IDENTITIES_JSON: JSON.stringify(acceptedIdentities),
  });
  assert.equal(runtime.layoutPackId, "A1");
  assert.equal(runtime.planId, "B");
});

test("private preview layout runtime fails closed without identities outside local proof", () => {
  assert.throws(
    () => loadPrivatePreviewLayoutRuntime({}),
    /accepted LS-04\/LS-05 identities are absent/,
  );
});

test("W2-04 local proof can bind preview layout identities without LS-06 env JSON", () => {
  const runtime = loadPrivatePreviewLayoutRuntime({
    LINKSITES_W2_04_LOCAL_PROOF: "1",
  });
  assert.equal(runtime.layoutPackId, "A1");
  assert.equal(runtime.planId, "B");
});

test("injected LS-06 identities take precedence over the W2-04 local-proof fallback", () => {
  const runtime = loadPrivatePreviewLayoutRuntime({
    LINKSITES_W2_04_LOCAL_PROOF: "1",
    LINKSITES_LS06_ACCEPTED_IDENTITIES_JSON: JSON.stringify({
      ...acceptedIdentities,
      layout: { ...acceptedIdentities.layout, planId: "C" },
      ls04: { ...acceptedIdentities.ls04, capabilityPlanId: "C" },
    }),
  });
  assert.equal(runtime.planId, "C");
  assert.equal(runtime.layoutPackId, "A1");
});

test("W2-04 private preview markup satisfies render-gate markers without omitting layout identity", () => {
  const runtime = loadPrivatePreviewLayoutRuntime({ LINKSITES_W2_04_LOCAL_PROOF: "1" });
  const main = createElement("div", { "data-region": "main" }, createElement("h1", null, "Private preview"));
  const inner = renderToStaticMarkup(
    createElement("div", pageRendererMountAttributes(runtime), composeLayoutBody(runtime, main, "Home")),
  );
  const html = `<div data-private-preview="true">${inner}</div>`;
  assert.match(html, /data-private-preview="true"/);
  assert.match(html, /<h1>Private preview<\/h1>/);
  assert.match(html, /data-layout-pack="A1"/);
  assert.match(html, /data-plan-id="B"/);
});
