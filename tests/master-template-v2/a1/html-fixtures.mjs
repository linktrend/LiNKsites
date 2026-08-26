/**
 * Consumer-owned A1 HTML fixtures for ISS-25 server and browser slots.
 * Markup is generated here. It is not provider A1 bytes.
 */

import { LAYOUT_PACK, TENANT_ID, VIEWPORTS } from "./constants.mjs";
import { sha256Hex } from "./identities.mjs";

const SCENARIO_COPY = Object.freeze({
  product: {
    title: "A1 product catalog",
    heading: "Industrial fasteners",
    family: "product",
    semanticId: "provider:product:fasteners",
    counterpartId: "provider:service:installation",
    body: "Product SKUs remain distinct from services.",
  },
  service: {
    title: "A1 service catalog",
    heading: "Installation service",
    family: "service",
    semanticId: "provider:service:installation",
    counterpartId: "provider:product:fasteners",
    body: "Service offers remain distinct from products.",
  },
  hybrid: {
    title: "A1 hybrid catalog",
    heading: "Product and service together",
    family: "hybrid",
    semanticId: "provider:product:fasteners",
    counterpartId: "provider:service:installation",
    body: "Hybrid pages keep product and service semantic IDs distinct.",
  },
  local: {
    title: "A1 local presence",
    heading: "Taipei studio",
    family: "local",
    semanticId: "provider:location:taipei",
    counterpartId: "provider:service:installation",
    body: "LocalBusiness facts stay visible and tenant-scoped.",
  },
  resources: {
    title: "A1 resources",
    heading: "Guides and FAQ",
    family: "resources",
    semanticId: "provider:article:guide-a1",
    counterpartId: "provider:product:fasteners",
    body: "Resources stay on the resources family route.",
  },
  trust: {
    title: "A1 trust and policies",
    heading: "Policies and provenance",
    family: "trust",
    semanticId: "provider:policy:privacy",
    counterpartId: "provider:review:forbidden-fake",
    body: "No fake reviews or unverifiable credentials.",
  },
  failure: {
    title: "A1 failure policy",
    heading: "Required content missing",
    family: "failure",
    semanticId: "provider:failure:missing-required",
    counterpartId: "provider:product:fasteners",
    body: "Fake success is rejected. The failure is visible.",
  },
  lifecycle: {
    title: "A1 lifecycle fixture",
    heading: "Cache restart and rollback",
    family: "lifecycle",
    semanticId: "provider:lifecycle:cache",
    counterpartId: "provider:product:fasteners",
    body: "Lifecycle proof uses consumer-owned cache bytes, not provider checkout.",
  },
});

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function navForPlan(planId) {
  if (planId === "l") {
    return `<nav data-shell="type-l-isolated" data-global-navigation="false"><a href="/en/contact">Contact</a></nav>`;
  }
  return `<nav data-shell="brand-nav-locale" data-global-navigation="true"><a href="/en">Home</a><a href="/en/contact">Contact</a><a data-action="primary-cta" href="/en/offers">Primary</a></nav>`;
}

function jsonLd(copy) {
  const type =
    copy.family === "local"
      ? "LocalBusiness"
      : copy.family === "service"
        ? "Service"
        : copy.family === "product"
          ? "Product"
          : "WebPage";
  return {
    "@context": "https://schema.org",
    "@type": type,
    name: copy.heading,
    identifier: copy.semanticId,
    description: copy.body,
  };
}

/**
 * @param {{ surface: string, planId: string, scenario: string }} slot
 * @returns {{ html: string, sha256: string, copy: object, viewport: object | null }}
 */
export function renderSlotHtml(slot) {
  const copy = SCENARIO_COPY[slot.scenario];
  if (!copy) {
    throw new Error(`unknown scenario ${slot.scenario}`);
  }
  const viewport = slot.surface === "browser" ? VIEWPORTS.desktop : null;
  const viewportMeta = viewport
    ? `<meta name="viewport" content="width=${viewport.width}">`
    : "";
  const json = jsonLd(copy);
  const failureBanner =
    slot.scenario === "failure"
      ? `<p data-failure="missing-required" data-fake-success="false" role="alert">Required content is missing. Request not accepted.</p>`
      : "";
  const trustBanner =
    slot.scenario === "trust"
      ? `<p data-fake-review="false" data-unverified-credential="false">Provenance is required. Fake reviews are absent.</p>`
      : "";
  const privacy =
    `<p data-analytics="inactive" data-consent="required">No tracker runs before consent.</p>`;
  const hybridExtra =
    slot.scenario === "hybrid"
      ? `<section data-family="service" data-semantic-id="${escapeHtml(copy.counterpartId)}"><h2>Installation service</h2><p>Distinct from product ${escapeHtml(copy.semanticId)}.</p></section>`
      : "";
  const img = `<img alt="${escapeHtml(copy.heading)}" src="/fixtures/a1-${slot.scenario}.png">`;

  const html = `<!doctype html>
<html lang="en" data-tenant-id="${TENANT_ID}" data-layout-pack="${LAYOUT_PACK}" data-plan-id="${slot.planId}" data-scenario="${slot.scenario}" data-surface="${slot.surface}" data-page-renderer="composition-a1-linear-shell" data-provider-bytes="false">
<head>
<meta charset="utf-8">
<title>${escapeHtml(copy.title)}</title>
${viewportMeta}
<link rel="canonical" href="https://ls08.example/en/${slot.scenario}">
<link rel="alternate" hreflang="en" href="https://ls08.example/en/${slot.scenario}">
<script type="application/ld+json">${JSON.stringify(json)}</script>
</head>
<body>
<header data-region="site-header">${navForPlan(slot.planId)}</header>
<main data-region="main" data-family="${copy.family}" data-semantic-id="${escapeHtml(copy.semanticId)}" data-counterpart-id="${escapeHtml(copy.counterpartId)}">
<h1>${escapeHtml(copy.heading)}</h1>
<p>${escapeHtml(copy.body)}</p>
${img}
${hybridExtra}
${failureBanner}
${trustBanner}
${privacy}
</main>
<footer data-region="site-footer" data-shell="five-zone">Policies</footer>
</body>
</html>
`;
  return { html, sha256: sha256Hex(html), copy, viewport };
}

export function slotHtmlPath(slot) {
  return `fixtures/slots/${slot.surface}-${slot.planId}-${slot.scenario}.html`;
}
