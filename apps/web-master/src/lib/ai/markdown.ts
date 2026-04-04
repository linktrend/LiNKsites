import { buildCanonical, buildHreflang } from "@/lib/seo";
import { normalizeLocale } from "@/lib/locale-context";
import { getSiteUrl } from "@/config";
import type { CmsPage, CmsPageBlock } from "@/lib/repository/pages";
import type { CmsOffer } from "@/lib/repository/offers";
import type { CmsArticle } from "@/lib/repository/articles";
import type { CmsCaseStudy } from "@/lib/repository/caseStudies";
import type { CmsVideo } from "@/lib/repository/videos";
import type { CmsFaq } from "@/lib/repository/faq";
import type { CmsAbout } from "@/lib/repository/about";
import type { CmsContact } from "@/lib/repository/contact";
import type { CmsLegal } from "@/lib/repository/legal";

const escapeYaml = (value: string): string => {
  const normalized = value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return normalized.replace(/'/g, "''");
};

const toPlainText = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  const children = (value as any)?.root?.children ?? [];
  const parts: string[] = [];
  for (const node of children) {
    const text = (node?.children ?? []).map((c: any) => c?.text ?? "").join(" ").trim();
    if (text) parts.push(text);
  }
  return parts.join("\n\n");
};

const renderBlock = (block: CmsPageBlock): string => {
  const type = block.blockType;
  if (!type) return "";
  switch (type) {
    case "hero": {
      const heading = (block as any).title ?? (block as any).heading ?? "Overview";
      const subtitle = (block as any).subtitle ?? (block as any).subheading ?? "";
      const body = (block as any).body ?? "";
      const cta = (block as any).cta ?? {};
      const ctaText = cta?.text ?? "";
      const ctaUrl = cta?.url ?? "";
      return [
        `# ${heading}`,
        subtitle ? subtitle : "",
        body ? body : "",
        ctaText && ctaUrl ? `**CTA:** [${ctaText}](${ctaUrl})` : "",
      ]
        .filter(Boolean)
        .join("\n\n");
    }
    case "features": {
      const title = (block as any).title ?? "Features";
      const items = Array.isArray((block as any).items) ? (block as any).items : [];
      const lines = items.map((item: any) => `- **${item.title ?? "Feature"}**: ${item.description ?? ""}`);
      return [`## ${title}`, ...lines].join("\n");
    }
    case "pricing": {
      const title = (block as any).title ?? "Pricing";
      const plans = Array.isArray((block as any).plans) ? (block as any).plans : [];
      const lines = plans.map((plan: any) => `- **${plan.name ?? "Plan"}**: ${plan.price ?? ""} ${plan.period ?? ""}`.trim());
      return [`## ${title}`, ...lines].join("\n");
    }
    case "testimonials": {
      const title = (block as any).title ?? "Testimonials";
      const items = (block as any).items ?? (block as any).testimonials ?? [];
      const lines = items.map((item: any) => `- "${item.quote ?? ""}" — ${item.author ?? ""}`.trim());
      return [`## ${title}`, ...lines].join("\n");
    }
    case "cta": {
      const title = (block as any).title ?? "Call to Action";
      const text = (block as any).text ?? "";
      const button = (block as any).button ?? {};
      const buttonText = button?.text ?? "";
      const buttonUrl = button?.url ?? "";
      return [
        `## ${title}`,
        text,
        buttonText && buttonUrl ? `**Action:** [${buttonText}](${buttonUrl})` : "",
      ]
        .filter(Boolean)
        .join("\n\n");
    }
    case "faq": {
      const title = (block as any).title ?? "FAQ";
      const questions = Array.isArray((block as any).questions) ? (block as any).questions : [];
      const lines = questions.map((q: any) => `- **Q:** ${q.question ?? ""}\n  **A:** ${toPlainText(q.answer)}`);
      return [`## ${title}`, ...lines].join("\n");
    }
    case "richText":
    case "content": {
      return toPlainText((block as any).content ?? "");
    }
    case "media": {
      const caption = (block as any).caption ?? "";
      const altText = (block as any).altText ?? "";
      return [`## Media`, caption || altText].filter(Boolean).join("\n\n");
    }
    case "callout": {
      const message = toPlainText((block as any).message ?? "");
      return message ? `> ${message}` : "";
    }
    case "videoEmbed": {
      const caption = (block as any).caption ?? "";
      const youtubeId = (block as any).youtubeId ?? "";
      const url = youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : "";
      return [`## Video`, caption, url].filter(Boolean).join("\n\n");
    }
    case "newsletter": {
      return "## Newsletter\nStay updated with the latest announcements.";
    }
    default:
      return "";
  }
};

const buildFrontMatter = (meta: {
  title: string;
  description?: string;
  lang: string;
  canonical: string;
  verifiedBy?: string;
  verificationDate?: string;
}) => {
  return [
    "---",
    `title: "${escapeYaml(meta.title)}"`,
    meta.description ? `description: "${escapeYaml(meta.description)}"` : "",
    `lang: "${meta.lang}"`,
    `canonical: "${meta.canonical}"`,
    meta.verifiedBy ? `verified_by: "${escapeYaml(meta.verifiedBy)}"` : "",
    meta.verificationDate ? `verification_date: "${meta.verificationDate}"` : "",
    "---",
    "",
  ]
    .filter(Boolean)
    .join("\n");
};

export const markdownForPage = (page: CmsPage, lang: string): string => {
  const locale = normalizeLocale(lang);
  const slug = page.slug === "home" ? "/" : `/${page.slug}`;
  const canonical = page.seo?.canonicalUrl ?? buildCanonical(locale, slug);
  const blocks = Array.isArray(page.content) ? page.content : [];
  const body = blocks.map(renderBlock).filter(Boolean).join("\n\n");
  return [
    buildFrontMatter({
      title: page.title ?? "Page",
      description: page.seo?.description,
      lang: locale,
      canonical,
      verifiedBy: (page as any).reviewedBy?.name ?? undefined,
      verificationDate: (page as any).reviewedAt ?? undefined,
    }),
    body || "Content unavailable.",
    "",
    "## Language Alternates",
    ...buildHreflang(slug).map((h) => `- ${h.hrefLang}: ${getSiteUrl()}${h.href}`),
  ].join("\n");
};

export const markdownForOffer = (offer: CmsOffer, lang: string): string => {
  const canonical = buildCanonical(lang, `/offers/${offer.slug}`);
  return [
    buildFrontMatter({
      title: offer.title ?? "Offer",
      description: offer.short_description ?? offer.description,
      lang,
      canonical,
      verifiedBy: (offer as any).reviewedBy?.name ?? undefined,
      verificationDate: (offer as any).reviewedAt ?? undefined,
    }),
    `# ${offer.title ?? "Offer"}`,
    offer.short_description ?? offer.description ?? "",
    offer.description ?? "",
  ]
    .filter(Boolean)
    .join("\n\n");
};

export const markdownForArticle = (article: CmsArticle, lang: string): string => {
  const canonical = buildCanonical(lang, `/resources/articles/${article.slug}`);
  return [
    buildFrontMatter({
      title: article.title ?? "Article",
      description: article.excerpt,
      lang,
      canonical,
      verifiedBy: (article as any).reviewedBy?.name ?? undefined,
      verificationDate: (article as any).reviewedAt ?? undefined,
    }),
    `# ${article.title ?? "Article"}`,
    article.excerpt ?? "",
    toPlainText(article.body ?? ""),
  ]
    .filter(Boolean)
    .join("\n\n");
};

export const markdownForCaseStudy = (caseStudy: CmsCaseStudy, lang: string): string => {
  const canonical = buildCanonical(lang, `/resources/cases/${caseStudy.slug}`);
  return [
    buildFrontMatter({
      title: caseStudy.title ?? "Case Study",
      description: caseStudy.summary ?? "",
      lang,
      canonical,
      verifiedBy: (caseStudy as any).reviewedBy?.name ?? undefined,
      verificationDate: (caseStudy as any).reviewedAt ?? undefined,
    }),
    `# ${caseStudy.title ?? "Case Study"}`,
    caseStudy.summary ?? "",
    caseStudy.challenge ? `## Challenge\n${caseStudy.challenge}` : "",
    caseStudy.solution ? `## Solution\n${caseStudy.solution}` : "",
    caseStudy.impact ? `## Impact\n${caseStudy.impact}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
};

export const markdownForVideo = (video: CmsVideo, lang: string): string => {
  const canonical = buildCanonical(lang, `/resources/videos/${video.slug}`);
  return [
    buildFrontMatter({
      title: video.title ?? "Video",
      description: video.description ?? "",
      lang,
      canonical,
      verifiedBy: (video as any).reviewedBy?.name ?? undefined,
      verificationDate: (video as any).reviewedAt ?? undefined,
    }),
    `# ${video.title ?? "Video"}`,
    video.description ?? "",
    video.youtubeId ? `https://www.youtube.com/watch?v=${video.youtubeId}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
};

export const markdownForFaq = (faqs: CmsFaq[], lang: string): string => {
  const canonical = buildCanonical(lang, "/resources/faq");
  const items = faqs.map((faq) => `- **Q:** ${faq.question}\n  **A:** ${faq.answer ?? ""}`);
  return [
    buildFrontMatter({
      title: "FAQ",
      description: "Frequently asked questions.",
      lang,
      canonical,
    }),
    "# Frequently Asked Questions",
    ...items,
  ]
    .filter(Boolean)
    .join("\n\n");
};

export const markdownForAbout = (about: CmsAbout | null, lang: string): string => {
  const canonical = buildCanonical(lang, "/about");
  const title = about?.heroTitle ?? "About";
  const subtitle = about?.heroSubtitle ?? "";
  const sections = Array.isArray(about?.sections)
    ? about?.sections.map((section) => `## ${section.title ?? "Section"}\n${section.body ?? ""}`).join("\n\n")
    : "";
  return [
    buildFrontMatter({
      title,
      description: subtitle,
      lang,
      canonical,
    }),
    `# ${title}`,
    subtitle,
    sections,
  ]
    .filter(Boolean)
    .join("\n\n");
};

export const markdownForContact = (contact: CmsContact | null, lang: string): string => {
  const canonical = buildCanonical(lang, "/contact");
  const title = contact?.page?.title ?? "Contact";
  const subtitle = contact?.page?.subtitle ?? "";
  const channels = Array.isArray(contact?.channels)
    ? contact?.channels.map((channel: any) => `- ${channel?.label ?? "Channel"}: ${channel?.contactValue ?? ""}`)
    : [];
  return [
    buildFrontMatter({
      title,
      description: subtitle,
      lang,
      canonical,
    }),
    `# ${title}`,
    subtitle,
    channels.length > 0 ? "## Contact Channels\n" + channels.join("\n") : "",
  ]
    .filter(Boolean)
    .join("\n\n");
};

export const markdownForLegal = (legal: CmsLegal | null, lang: string, slug: string): string => {
  const canonical = buildCanonical(lang, `/legal/${slug}`);
  return [
    buildFrontMatter({
      title: legal?.title ?? "Legal",
      description: legal?.summary ?? "",
      lang,
      canonical,
      verifiedBy: (legal as any)?.reviewedBy?.name ?? undefined,
      verificationDate: (legal as any)?.reviewedAt ?? undefined,
    }),
    `# ${legal?.title ?? "Legal"}`,
    legal?.summary ?? "",
    legal?.body ?? "",
  ]
    .filter(Boolean)
    .join("\n\n");
};
