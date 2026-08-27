/**
 * Consumer-owned A2/A3 HTML fixtures for ISS-29 paired slots.
 * Markup is generated here. It is not provider A2/A3 bytes.
 */

import { PERF_LAB_BUDGETS, TENANT_ID, VIEWPORTS } from "./constants.mjs";
import { sha256Hex } from "./identities.mjs";
import { resolveLayoutAdapter, resolvePlanSemantics } from "./layout-adapters/index.mjs";

const DIMENSION_COPY = Object.freeze({
  semantic: {
    title: "Semantic mapping",
    heading: "Semantic IDs remain distinct",
    family: "hybrid",
    semanticId: "provider:product:fasteners",
    counterpartId: "provider:service:installation",
    body: "Product and service semantic IDs stay distinct across additive A2/A3 mappings.",
  },
  functional: {
    title: "Functional hooks",
    heading: "Real hooks reject fake success",
    family: "service",
    semanticId: "provider:service:installation",
    counterpartId: "provider:product:fasteners",
    body: "Forms and side effects stay fail-closed. Fake success is rejected.",
  },
  visual: {
    title: "Visual structure",
    heading: "Layout regions stay distinct",
    family: "product",
    semanticId: "provider:product:fasteners",
    counterpartId: "provider:service:installation",
    body: "A2 split-shell and A3 stacked-shell remain visually distinct from frozen A1.",
  },
  accessibility: {
    title: "Accessibility landmarks",
    heading: "One H1 and labeled images",
    family: "resources",
    semanticId: "provider:article:guide-a2a3",
    counterpartId: "provider:product:fasteners",
    body: "Landmarks, language, and alt text are present. Legal certification is not claimed.",
  },
  performance: {
    title: "Lab performance budgets",
    heading: "Representative lab budgets",
    family: "lifecycle",
    semanticId: "provider:lifecycle:perf-lab",
    counterpartId: "provider:product:fasteners",
    body: "Lab budgets are labeled. Field, VPS, and live measurements are not claimed.",
  },
});

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function navForPlan(plan) {
  if (plan.isolatedShell) {
    return `<nav data-shell="type-l-isolated" data-global-navigation="false"><a href="/en/contact">Contact</a></nav>`;
  }
  return `<nav data-shell="brand-nav-locale" data-global-navigation="true"><a href="/en">Home</a><a href="/en/contact">Contact</a><a data-action="primary-cta" href="/en/offers">Primary</a></nav>`;
}

function jsonLd(copy) {
  const type =
    copy.family === "service" ? "Service" : copy.family === "product" ? "Product" : "WebPage";
  return {
    "@context": "https://schema.org",
    "@type": type,
    name: copy.heading,
    identifier: copy.semanticId,
    description: copy.body,
  };
}

function extraRegions(adapter, copy) {
  if (adapter.layoutPack === "a2") {
    return `<aside data-region="aside"><p>${escapeHtml(copy.title)}</p></aside>`;
  }
  if (adapter.layoutPack === "a3") {
    return `<section data-region="secondary"><p>${escapeHtml(copy.title)}</p></section>`;
  }
  return "";
}

/**
 * @param {{ layoutPack: string, surface: string, planId: string, dimension: string }} slot
 */
export function renderSlotHtml(slot) {
  const copy = DIMENSION_COPY[slot.dimension];
  if (!copy) throw new Error(`unknown dimension ${slot.dimension}`);
  const adapter = resolveLayoutAdapter(slot.layoutPack);
  const plan = resolvePlanSemantics(slot.planId);
  const viewport = slot.surface === "browser" ? VIEWPORTS.desktop : null;
  const mobile = slot.surface === "browser" ? VIEWPORTS.mobile : null;
  const viewportMeta = viewport
    ? `<meta name="viewport" content="width=${viewport.width}"><meta name="viewport-mobile" content="width=${mobile.width}">`
    : "";
  const json = jsonLd(copy);
  const functionalBanner =
    slot.dimension === "functional"
      ? `<form data-hook="contact" data-fake-success="false" data-consent="required"><button type="submit">Send</button></form>`
      : "";
  const perfBanner =
    slot.dimension === "performance"
      ? `<p data-perf-class="${PERF_LAB_BUDGETS.class}" data-field-data="false" data-vps-proof="false" data-live-proof="false" data-lcp-budget="${PERF_LAB_BUDGETS.lcpSeconds}" data-inp-budget="${PERF_LAB_BUDGETS.inpMs}" data-cls-budget="${PERF_LAB_BUDGETS.cls}">Lab budgets only.</p>`
      : "";
  const privacy = `<p data-analytics="inactive" data-consent="required">No tracker runs before consent.</p>`;
  const hybridExtra =
    slot.dimension === "semantic"
      ? `<section data-family="service" data-semantic-id="${escapeHtml(copy.counterpartId)}"><h2>Installation service</h2><p>Distinct from product ${escapeHtml(copy.semanticId)}.</p></section>`
      : "";
  const img = `<img alt="${escapeHtml(copy.heading)}" src="/fixtures/${slot.layoutPack}-${slot.dimension}.png">`;
  const extra = extraRegions(adapter, copy);
  const a2WrapOpen = adapter.layoutPack === "a2" ? `<div data-composition="split">` : "";
  const a2WrapClose = adapter.layoutPack === "a2" ? `</div>` : "";
  const a2Aside = adapter.layoutPack === "a2" ? extra : "";
  const a3Secondary = adapter.layoutPack === "a3" ? extra : "";

  const html = `<!doctype html>
<html lang="en" data-tenant-id="${TENANT_ID}" data-layout-pack="${adapter.layoutPack}" data-plan-id="${slot.planId}" data-dimension="${slot.dimension}" data-surface="${slot.surface}" data-page-renderer="${adapter.pageRenderer}" data-architecture-ready="${adapter.architectureReady ? "true" : "false"}" data-provider-bytes="false" data-a1-mutated="false">
<head>
<meta charset="utf-8">
<title>${escapeHtml(copy.title)} (${adapter.layoutPack.toUpperCase()})</title>
${viewportMeta}
<link rel="canonical" href="https://ls09.example/en/${slot.layoutPack}/${slot.dimension}">
<link rel="alternate" hreflang="en" href="https://ls09.example/en/${slot.layoutPack}/${slot.dimension}">
<script type="application/ld+json">${JSON.stringify(json)}</script>
</head>
<body>
<header data-region="site-header">${navForPlan(plan)}</header>
${a2WrapOpen}${a2Aside}
<main data-region="main" data-family="${copy.family}" data-semantic-id="${escapeHtml(copy.semanticId)}" data-counterpart-id="${escapeHtml(copy.counterpartId)}">
<h1>${escapeHtml(copy.heading)}</h1>
<p>${escapeHtml(copy.body)}</p>
${img}
${hybridExtra}
${functionalBanner}
${perfBanner}
${privacy}
</main>
${a3Secondary}${a2WrapClose}
<footer data-region="site-footer" data-shell="five-zone">Policies</footer>
</body>
</html>
`;
  return { html, sha256: sha256Hex(html), copy, viewport, adapter };
}

export function slotHtmlPath(slot) {
  return `fixtures/slots/${slot.surface}-${slot.layoutPack}-${slot.planId}-${slot.dimension}.html`;
}
