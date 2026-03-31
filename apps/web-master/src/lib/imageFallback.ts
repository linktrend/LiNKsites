/**
 * Image Fallback Helper
 * 
 * Provides consistent fallback images across the application.
 * All placeholder images are stored in /public/placeholders/
 */

export type FallbackImageType = 'hero' | 'avatar' | 'article' | 'offer' | 'case' | 'default';

/**
 * Get the appropriate fallback image path for a given type
 * @param type - The type of fallback image needed
 * @returns The path to the fallback image (relative to /public)
 */
export function getFallbackImage(type: FallbackImageType = 'default'): string {
  const fallbackMap: Record<FallbackImageType, string> = {
    hero: '/placeholders/hero.jpg',
    avatar: '/placeholders/avatar.jpg',
    article: '/placeholders/article.jpg',
    offer: '/placeholders/offer.jpg',
    case: '/placeholders/case.jpg',
    default: '/placeholders/default.jpg',
  };

  return fallbackMap[type] || fallbackMap.default;
}

/**
 * Get image source with fallback support
 * @param imageSrc - The primary image source (can be null/undefined)
 * @param fallbackType - The type of fallback to use if primary is not available
 * @returns The image source to use
 */
export function getImageWithFallback(
  imageSrc: string | null | undefined,
  fallbackType: FallbackImageType = 'default'
): string {
  return imageSrc || getFallbackImage(fallbackType);
}
