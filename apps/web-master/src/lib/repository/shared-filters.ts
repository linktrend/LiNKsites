export const siteLocaleFilter = (siteId: string, locale: string) => ({
  and: [
    { site: { equals: siteId } },
    { locale: { equals: locale } },
    { status: { equals: "published" } },
  ],
});
