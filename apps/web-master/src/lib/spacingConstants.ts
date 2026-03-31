/**
 * Standardized Spacing System
 * 
 * Use these constants throughout the application to ensure consistent spacing
 * across all pages and components.
 */

export const SPACING = {
  // Hero Section
  hero: "py-16 sm:py-20", // 64px mobile / 80px desktop
  
  // Breadcrumbs
  breadcrumbs: "pt-8 sm:pt-12 pb-6 sm:pb-8", // 32/48px top, 24/32px bottom
  
  // After Breadcrumbs (pages without strips/search)
  afterBreadcrumbs: "pt-4 sm:pt-6", // 16px mobile / 24px desktop
  // Total gap from breadcrumbs: 40px mobile / 56px desktop
  
  // Category/Offer Navigation Strips
  strip: "pt-4 sm:pt-6 pb-6 sm:pb-8", // Creates 24/36px gap from breadcrumbs
  
  // After Strip (to search or content)
  afterStrip: "pt-4 sm:pt-6", // Creates 40/56px total gap from strip
  
  // Section Padding
  section: "py-12 sm:py-14", // 48px mobile / 56px desktop
  sectionTop: "pt-12 sm:pt-14",
  sectionBottom: "pb-12 sm:pb-14",
  
  // Reduced section padding (for tighter sections)
  sectionReduced: "py-6 sm:py-8", // 24px mobile / 32px desktop
  
  // Title and Subtitle Margins
  titleMargin: "mb-6", // 24px below main titles
  subtitleMargin: "mb-3", // 12px below subtitles
  titleMarginLarge: "mb-8", // 32px for larger spacing
  
  // Grid and Card Gaps
  cardGrid: "gap-6 lg:gap-8", // 24px mobile / 32px desktop
  cardGridTight: "gap-4", // 16px for tighter grids
  
  // Container Padding
  container: "px-4 sm:px-6",
  
  // Common Section Combinations
  sectionWithTitle: "pt-4 sm:pt-6 pb-12 sm:pb-14", // After breadcrumbs with content
  sectionAfterStrip: "pt-6 sm:pt-8 pb-8 sm:pb-12", // After category strip
} as const;

/**
 * Spacing Values (in pixels for reference)
 * 
 * Tailwind Scale:
 * - 2 = 8px
 * - 3 = 12px
 * - 4 = 16px
 * - 6 = 24px
 * - 8 = 32px
 * - 12 = 48px
 * - 14 = 56px
 * - 16 = 64px
 * - 20 = 80px
 */

export const SPACING_VALUES = {
  hero: { mobile: 64, desktop: 80 },
  breadcrumbsTop: { mobile: 32, desktop: 48 },
  breadcrumbsBottom: { mobile: 24, desktop: 32 },
  afterBreadcrumbs: { mobile: 16, desktop: 24 },
  section: { mobile: 48, desktop: 56 },
  titleMargin: 24,
  subtitleMargin: 12,
  cardGap: { mobile: 24, desktop: 32 },
} as const;
