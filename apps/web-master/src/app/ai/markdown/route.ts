import { NextRequest, NextResponse } from "next/server";
import { AI_FEATURES, DEFAULT_LANGUAGE, isLanguageSupported } from "@/config";
import { normalizeLocale } from "@/lib/locale-context";
import { getSiteIdFromRequest } from "@/lib/site-context";
import { getPageBySlug } from "@/lib/repository/pages";
import { getLegalBySlug } from "@/lib/repository/legal";
import {
  getOfferIndex,
  getOfferPage,
  getResourceIndex,
  getResourceArticle,
  getVideosPage,
  getVideoResource,
  getCasesPage,
  getCaseStudyPage,
  getFaqPage,
  getAboutIndex,
  getContactPage,
} from "@/lib/pageService";
import {
  markdownForPage,
  markdownForOffer,
  markdownForArticle,
  markdownForCaseStudy,
  markdownForVideo,
  markdownForFaq,
  markdownForAbout,
  markdownForContact,
  markdownForLegal,
} from "@/lib/ai/markdown";

export const dynamic = "force-dynamic";

const buildIndexMarkdown = (title: string, items: Array<{ title?: string; slug?: string }>, basePath: string) => {
  const lines = items.map((item) => `- ${item.title ?? "Item"}: ${basePath}/${item.slug ?? ""}`.trim());
  return [`# ${title}`, ...lines].join("\n");
};

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!AI_FEATURES.enableMarkdownViews) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const rawPath = request.nextUrl.searchParams.get("path") ?? "/";
  const normalizedPath = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  const segments = normalizedPath.split("/").filter(Boolean);

  let lang: string = DEFAULT_LANGUAGE;
  let slugSegments = segments;
  if (segments[0] && isLanguageSupported(segments[0])) {
    lang = segments[0];
    slugSegments = segments.slice(1);
  }
  const locale = normalizeLocale(lang);
  const siteId = await getSiteIdFromRequest();

  let markdown = "";

  if (slugSegments.length === 0) {
    const page = await getPageBySlug({ siteId, locale, slugSegments });
    markdown = page ? markdownForPage(page, locale) : "# Home\nContent unavailable.";
  } else if (slugSegments[0] === "offers") {
    if (slugSegments.length === 1) {
      const page = await getOfferIndex(locale, siteId);
      markdown = buildIndexMarkdown("Offers", page.data.offers, `/${lang}/offers`);
    } else {
      const offerSlug = slugSegments[1];
      const page = await getOfferPage(locale, siteId, offerSlug);
      const offer = page.data.offer;
      if (!offer) return new NextResponse("Not Found", { status: 404 });
      markdown = markdownForOffer(offer, locale);
    }
  } else if (slugSegments[0] === "resources") {
    const resourceType = slugSegments[1] ?? "";
    if (!resourceType) {
      const page = await getResourceIndex(locale, siteId);
      markdown = buildIndexMarkdown("Resources", page.data.resources, `/${lang}/resources/articles`);
    } else if (resourceType === "articles" && slugSegments[2]) {
      const page = await getResourceArticle(locale, siteId, slugSegments[2]);
      const article = page.data.article;
      if (!article) return new NextResponse("Not Found", { status: 404 });
      markdown = markdownForArticle(article, locale);
    } else if (resourceType === "videos" && slugSegments[2]) {
      const page = await getVideoResource(locale, siteId, slugSegments[2]);
      const video = page.data.video;
      if (!video) return new NextResponse("Not Found", { status: 404 });
      markdown = markdownForVideo(video, locale);
    } else if (resourceType === "cases" && slugSegments[2]) {
      const page = await getCaseStudyPage(locale, siteId, slugSegments[2]);
      const caseStudy = page.data.case;
      if (!caseStudy) return new NextResponse("Not Found", { status: 404 });
      markdown = markdownForCaseStudy(caseStudy, locale);
    } else if (resourceType === "videos" && !slugSegments[2]) {
      const page = await getVideosPage(locale, siteId);
      markdown = buildIndexMarkdown("Videos", page.data.videos, `/${lang}/resources/videos`);
    } else if (resourceType === "cases" && !slugSegments[2]) {
      const page = await getCasesPage(locale, siteId);
      markdown = buildIndexMarkdown("Case Studies", page.data.cases, `/${lang}/resources/cases`);
    } else if (resourceType === "faq") {
      const page = await getFaqPage(locale, siteId);
      markdown = markdownForFaq(page.data.faqs, locale);
    } else {
      markdown = "# Resources\nContent unavailable.";
    }
  } else if (slugSegments[0] === "about") {
    const page = await getAboutIndex(locale, siteId);
    markdown = markdownForAbout(page.data.about ?? null, locale);
  } else if (slugSegments[0] === "contact") {
    const page = await getContactPage(locale, siteId);
    markdown = markdownForContact(page.data.contact ?? null, locale);
  } else if (slugSegments[0] === "legal") {
    const slug = slugSegments[1] ?? "terms-of-use";
    const legal = await getLegalBySlug({ siteId, locale, slug });
    markdown = markdownForLegal(legal, locale, slug);
  } else {
    const page = await getPageBySlug({ siteId, locale, slugSegments });
    if (!page) return new NextResponse("Not Found", { status: 404 });
    markdown = markdownForPage(page, locale);
  }

  return new NextResponse(markdown, {
    status: 200,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "x-content-type-options": "nosniff",
    },
  });
}
