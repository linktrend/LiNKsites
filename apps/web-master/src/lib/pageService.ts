import { normalizeLocale } from "./locale-context";
import { listOffers, getOfferBySlug, CmsOffer } from "@/lib/repository/offers";
import { listArticles, getArticleBySlug, CmsArticle } from "@/lib/repository/articles";
import { listCaseStudies, getCaseStudyBySlug, CmsCaseStudy } from "@/lib/repository/caseStudies";
import { listVideos, getVideoBySlug, CmsVideo } from "@/lib/repository/videos";
import { listFaq, CmsFaq } from "@/lib/repository/faq";
import { CmsSiteSettings, getSiteSettings } from "@/lib/repository/siteSettings";
import { getNavigation, CmsNavigation } from "@/lib/repository/navigation";
import { getAbout, CmsAbout } from "@/lib/repository/about";
import { getContact, CmsContact } from "@/lib/repository/contact";
import { CmsLegal, getLegalBySlug, listLegal } from "@/lib/repository/legal";
import { resolveCaseOffers, resolveRelatedVideos, resolveVideoArticles } from "./relationshipIntegrity";

export type Page<T> = {
  lang: string;
  slug: string;
  seo: Record<string, unknown>;
  data: T;
};

type CmsResource = CmsArticle;

const buildContext = (lang: string, siteId: string) => ({
  siteId,
  locale: normalizeLocale(lang),
});

export async function getOfferIndex(
  lang: string,
  siteId: string,
): Promise<Page<{ offers: Awaited<ReturnType<typeof listOffers>> }>> {
  const offers = await listOffers({ siteId, locale: normalizeLocale(lang) });
  const sortedOffers = offers
    .filter((o: any) => o.status === "published")
    .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
  return { lang, slug: "/offers", seo: {}, data: { offers: sortedOffers } };
}

export async function getOfferPage(
  lang: string,
  siteId: string,
  offerSlug: string
): Promise<
  Page<{
    offer?: Awaited<ReturnType<typeof getOfferBySlug>>;
    resources: CmsArticle[];
    caseStudies: CmsCaseStudy[];
    videos: CmsVideo[];
    faqs: CmsFaq[];
  }>
> {
  const locale = normalizeLocale(lang);
  const offer = await getOfferBySlug({ siteId, locale, slug: offerSlug });
  const articles = await listArticles({ siteId, locale });
  const filteredArticles = articles.filter((r) => r.offerSlug === offerSlug);
  const caseStudies = (await listCaseStudies({ siteId, locale })).filter((c) =>
    (c.relatedOffers ?? []).includes(offerSlug),
  );
  const videos = (await listVideos({ siteId, locale })).filter((v) => {
    const relatedArticles = (v.relatedArticles ?? []) as string[];
    return relatedArticles.some((slug) => filteredArticles.some((a) => a.slug === slug));
  });
  const faqs = await listFaq({ siteId, locale });
  const resources = [...filteredArticles];
  return {
    lang,
    slug: `/offers/${offerSlug}`,
    seo: {},
    data: { offer, resources: resources as CmsResource[], caseStudies, videos, faqs }
  };
}

export async function getResourceIndex(
  lang: string,
  siteId: string,
): Promise<Page<{ resources: CmsArticle[] }>> {
  const resources = await listArticles({ siteId, locale: normalizeLocale(lang) });
  return { lang, slug: "/resources", seo: {}, data: { resources } };
}

export async function getArticles(lang: string, siteId: string): Promise<Page<{ articles: CmsResource[] }>> {
  const resources = await listArticles({ siteId, locale: normalizeLocale(lang) });
  return { lang, slug: "/resources/articles", seo: {}, data: { articles: resources as CmsResource[] } };
}

export async function getResourceArticle(
  lang: string,
  siteId: string,
  articleSlug: string
): Promise<Page<{ article?: CmsResource; related: CmsResource[]; offer?: any }>> {
  const locale = normalizeLocale(lang);
  const article = (await getArticleBySlug({ siteId, locale, slug: articleSlug })) || undefined;
  const resources = await listArticles({ siteId, locale });
  const related = resources.filter((r) => r.slug !== articleSlug);
  const offer = article?.offerSlug
    ? await getOfferBySlug({ siteId, locale, slug: article.offerSlug })
    : undefined;
  return { lang, slug: `/resources/articles/${articleSlug}`, seo: {}, data: { article, related, offer } };
}

export async function getVideosPage(lang: string, siteId: string): Promise<Page<{ videos: CmsVideo[] }>> {
  const videos = await listVideos({ siteId, locale: normalizeLocale(lang) });
  return { lang, slug: "/resources/videos", seo: {}, data: { videos } };
}

export async function getVideoResource(
  lang: string,
  siteId: string,
  videoSlug: string
): Promise<Page<{ video?: CmsVideo; relatedVideos: CmsVideo[]; relatedArticles: CmsResource[] }>> {
  const locale = normalizeLocale(lang);
  const video = await getVideoBySlug({ siteId, locale, slug: videoSlug });
  
  if (!video) {
    return { lang, slug: `/resources/videos/${videoSlug}`, seo: {}, data: { video: undefined, relatedVideos: [], relatedArticles: [] } };
  }
  
  // Use safe resolution helpers to handle broken references gracefully
  const allVideos = await listVideos({ siteId, locale });
  const allArticles = await listArticles({ siteId, locale });
  const { videos: relatedVideos } = resolveRelatedVideos(video as any, allVideos as any);
  const { articles: relatedArticles } = resolveVideoArticles(video as any, allArticles as any);
  
  return {
    lang,
    slug: `/resources/videos/${videoSlug}`,
    seo: {},
    data: { video, relatedVideos: relatedVideos as any, relatedArticles: relatedArticles as any },
  };
}

export async function getCasesPage(
  lang: string,
  siteId: string,
): Promise<Page<{ cases: CmsCaseStudy[] }>> {
  const cases = await listCaseStudies({ siteId, locale: normalizeLocale(lang) });
  return { lang, slug: "/resources/cases", seo: {}, data: { cases } };
}

export async function getCaseStudyPage(
  lang: string,
  siteId: string,
  caseSlug: string
): Promise<Page<{ case?: CmsCaseStudy; relatedOffers: CmsOffer[] }>> {
  const locale = normalizeLocale(lang);
  const caseStudy = await getCaseStudyBySlug({ siteId, locale, slug: caseSlug });
  
  if (!caseStudy) {
    return { lang, slug: `/resources/cases/${caseSlug}`, seo: {}, data: { case: undefined, relatedOffers: [] } };
  }
  
  // Use safe resolution helpers to handle broken references gracefully
  const offers = await listOffers({ siteId, locale });
  const { offers: relatedOffers } = resolveCaseOffers(caseStudy as any, offers as any);
  
  return { lang, slug: `/resources/cases/${caseSlug}`, seo: {}, data: { case: caseStudy, relatedOffers: relatedOffers as any } };
}

export async function getFaqPage(lang: string, siteId: string): Promise<Page<{ faqs: CmsFaq[] }>> {
  const faqs = await listFaq({ siteId, locale: normalizeLocale(lang) });
  return { lang, slug: "/resources/faq", seo: {}, data: { faqs } };
}

export async function getDocsPage(lang: string): Promise<Page<{ docs: any[] }>> {
  return { lang, slug: "/resources/docs", seo: {}, data: { docs: [] } };
}

export async function getAboutIndex(lang: string, siteId: string): Promise<Page<{ about: CmsAbout }>> {
  const about = await getAbout(normalizeLocale(lang));
  return { lang, slug: "/about", seo: {}, data: { about: (about ?? {}) as CmsAbout } };
}

export async function getContactPage(lang: string, siteId: string): Promise<Page<{ contact: CmsContact }>> {
  const contact = await getContact({ siteKey: siteId, locale: normalizeLocale(lang) });
  return { lang, slug: "/contact", seo: {}, data: { contact: (contact ?? {}) as CmsContact } };
}
