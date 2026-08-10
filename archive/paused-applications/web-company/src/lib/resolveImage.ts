import { fallbackArticleImages } from "./siteConfig";

export function resolveImage(imageUrl?: string) {
  if (imageUrl) return imageUrl;
  const idx = Math.floor(Math.random() * fallbackArticleImages.length);
  return fallbackArticleImages[idx];
}
