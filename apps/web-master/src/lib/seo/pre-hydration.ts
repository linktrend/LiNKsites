/**
 * Pre-hydration semantic HTML contract (LS-FR-17 / ISS-22).
 * Meaningful title, answer, one H1, landmarks and crawlable links must exist
 * in the server HTML before hydration.
 */

export type PreHydrationFinding = Readonly<{ code: string; message: string }>;

export type PreHydrationDocument = Readonly<{
  lang: string;
  title: string;
  answer: string;
  html: string;
}>;

const countMatches = (html: string, pattern: RegExp): number => [...html.matchAll(pattern)].length;

export function evaluatePreHydrationHtml(doc: PreHydrationDocument): PreHydrationFinding[] {
  const findings: PreHydrationFinding[] = [];
  if (!doc.lang.trim()) {
    findings.push({ code: "ssr_missing_lang", message: "document lang is required" });
  }
  if (!doc.title.trim()) {
    findings.push({ code: "ssr_missing_title", message: "pre-hydration title is required" });
  }
  if (!doc.answer.trim()) {
    findings.push({ code: "ssr_missing_answer", message: "pre-hydration answer/content is required" });
  }
  const html = doc.html;
  if (!html.trim()) {
    findings.push({ code: "ssr_missing_html", message: "pre-hydration html is required" });
    return findings;
  }
  if (!/\slang\s*=\s*["'][a-z]{2}/i.test(html) && !/\bdata-lang\s*=\s*["'][a-z]{2}/i.test(html)) {
    findings.push({ code: "ssr_missing_lang_attr", message: "html must declare lang or data-lang before hydration" });
  }
  if (!/<main[\s>]/i.test(html)) {
    findings.push({ code: "ssr_missing_main", message: "html must include a main landmark" });
  }
  if (!/<header[\s>]/i.test(html)) {
    findings.push({ code: "ssr_missing_header", message: "html must include a header landmark" });
  }
  const h1 = countMatches(html, /<h1[\s>]/gi);
  if (h1 !== 1) {
    findings.push({ code: "ssr_h1_count", message: `html must include exactly one h1 (found ${h1})` });
  }
  if (!/<a\s[^>]*href\s*=\s*["'][^"'#]/i.test(html)) {
    findings.push({ code: "ssr_missing_crawlable_link", message: "html must include at least one crawlable link" });
  }
  if (doc.title && html.includes(doc.title) === false) {
    findings.push({ code: "ssr_title_not_visible", message: "title must appear in pre-hydration html" });
  }
  if (doc.answer && html.includes(doc.answer) === false) {
    findings.push({ code: "ssr_answer_not_visible", message: "answer must appear in pre-hydration html" });
  }
  return findings;
}

export function assertPreHydrationHtml(doc: PreHydrationDocument): void {
  const findings = evaluatePreHydrationHtml(doc);
  if (findings.length > 0) {
    throw new Error(findings.map((item) => `${item.code}: ${item.message}`).join("; "));
  }
}
