import { getThemeFromRequest } from "@/config";

/**
 * @deprecated Use getThemeFromRequest from @/config instead
 * This function is kept for backward compatibility
 */
export async function themeFromRequest() {
  return getThemeFromRequest();
}
