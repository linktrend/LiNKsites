import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'es', 'zh-tw', 'zh-cn'],

  // Used when no locale matches
  defaultLocale: 'en',

  // Always use a prefix for all locales
  localePrefix: 'always'
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(en|es|zh-tw|zh-cn)/:path*']
};
