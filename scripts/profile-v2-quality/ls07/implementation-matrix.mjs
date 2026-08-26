/**
 * LS-07 implementation quality fixtures: accessibility matrix, lab performance
 * budgets, and responsive/visual regression descriptors. Manual and legal rows
 * are labeled; they are not certification claims.
 */

export const IMPLEMENTATION_A11Y_MATRIX = Object.freeze({
  target: "WCAG 2.2 AA",
  legalCertificationClaimed: false,
  rows: [
    { id: "a11y.lang", mode: "automated" },
    { id: "a11y.main", mode: "automated" },
    { id: "a11y.h1", mode: "automated" },
    { id: "a11y.alt", mode: "automated" },
    { id: "a11y.keyboard", mode: "manual", proof: "lab/manual" },
    { id: "a11y.legal", mode: "legal", proof: "not-claimed" },
  ],
});

export const IMPLEMENTATION_VISUAL_FIXTURES = Object.freeze([
  { id: "home-desktop", viewport: "1280x720" },
  { id: "home-mobile", viewport: "390x844" },
  { id: "type-l-isolated", viewport: "1280x720", planId: "L" },
]);
