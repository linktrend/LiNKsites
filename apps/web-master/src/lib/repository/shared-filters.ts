export type ContentStatus = "draft" | "published";

/**
 * Scope a CMS content query to one tenant, locale, and workflow state.
 * Public callers deliberately retain the published default. The token-gated
 * preview route must opt into draft records explicitly; `draft=true` alone
 * only changes Payload's version read mode and does not remove this filter.
 */
export const siteLocaleFilter = (
  siteId: string,
  locale: string,
  status: ContentStatus = "published",
) => ({
  and: [
    { site: { equals: siteId } },
    { locale: { equals: locale } },
    { status: { equals: status } },
  ],
});
