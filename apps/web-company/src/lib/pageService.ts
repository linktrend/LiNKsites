import { getContentByDocId } from "./contentClient";
import { resolveImage } from "./resolveImage";

export async function getHomePage(lang: string) {
  // Fetch structural page + slots; placeholder shape for now.
  return { lang, seo: {}, slots: {}, slug: "/", imageResolver: resolveImage };
}

export async function getOfferIndex(lang: string) {
  return { lang, slug: "/offers", seo: {}, slots: {} };
}

export async function getOfferPage(lang: string, offerSlug: string) {
  return { lang, slug: `/offers/${offerSlug}`, seo: {}, slots: {}, imageResolver: resolveImage };
}

export async function getResourceIndex(lang: string) {
  return { lang, slug: "/resources", seo: {}, slots: {} };
}

export async function getResourceArticle(lang: string, articleSlug: string) {
  return { lang, slug: `/resources/${articleSlug}`, seo: {}, slots: {}, imageResolver: resolveImage };
}

export async function getResourceCategory(lang: string, categorySlug: string) {
  return { lang, slug: `/resources/category/${categorySlug}`, seo: {}, slots: {} };
}

export async function getVideoResource(lang: string, videoSlug: string) {
  return { lang, slug: `/videos/${videoSlug}`, seo: {}, slots: {} };
}

export async function getAboutIndex(lang: string) {
  return { lang, slug: "/about", seo: {}, slots: {} };
}

export async function getAboutCompany(lang: string) {
  return { lang, slug: "/about/company", seo: {}, slots: {} };
}

export async function getAboutTeam(lang: string) {
  return { lang, slug: "/about/team", seo: {}, slots: {} };
}

export async function getAboutMission(lang: string) {
  return { lang, slug: "/about/mission", seo: {}, slots: {} };
}

export async function getAboutCareers(lang: string) {
  return { lang, slug: "/about/careers", seo: {}, slots: {} };
}

export async function getContactPage(lang: string) {
  return { lang, slug: "/contact", seo: {}, slots: {} };
}

export async function getLegalPage(lang: string, legalSlug: string) {
  return { lang, slug: `/legal/${legalSlug}`, seo: {}, slots: {} };
}

export async function getFaqPage(lang: string) {
  return { lang, slug: "/faq", seo: {}, slots: {} };
}

export async function getCaseStudyPage(lang: string, caseSlug: string) {
  return { lang, slug: `/cases/${caseSlug}`, seo: {}, slots: {} };
}
