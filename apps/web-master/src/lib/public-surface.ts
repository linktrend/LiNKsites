export type PublicSiteRecord = {
  id?: string | number;
  status?: string;
};

export type PageAudience = "public" | "private-preview";

export type AudiencePage = {
  previewEnvironment?: string | null;
};

/**
 * A hostname mapping is not enough to make a tenant public. The CMS must
 * identify the site as published and expose at least one published page.
 */
export const isPublicSiteEligible = (
  site: PublicSiteRecord | null | undefined,
  publishedPageCount: number,
): boolean =>
  Boolean(site?.id) && site?.status === "published" && publishedPageCount > 0;

/**
 * Private-preview documents share the published CMS read path but are only
 * selectable by the token-gated preview route. Unknown audience markers are
 * denied from both surfaces.
 */
export const isPageVisibleToAudience = (
  page: AudiencePage,
  audience: PageAudience,
): boolean => {
  if (audience === "private-preview") {
    return page.previewEnvironment === "private-preview";
  }

  return (
    page.previewEnvironment === undefined ||
    page.previewEnvironment === null ||
    page.previewEnvironment === "public"
  );
};

export const selectPageForAudience = <T extends AudiencePage>(
  pages: T[],
  audience: PageAudience,
): T | null => pages.find((page) => isPageVisibleToAudience(page, audience)) ?? null;

export const countPublicPages = (pages: AudiencePage[]): number =>
  pages.filter((page) => isPageVisibleToAudience(page, "public")).length;
