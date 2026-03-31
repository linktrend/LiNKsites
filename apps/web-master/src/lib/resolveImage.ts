import { FALLBACK_IMAGES } from "@/config";

export function resolveImage(imageUrl?: string) {
  if (imageUrl) return imageUrl;
  // Return the article fallback image
  return FALLBACK_IMAGES.article;
}
