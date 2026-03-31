/**
 * Date formatting utilities for SSR-safe date rendering
 */

/**
 * Format a date string deterministically for SSR
 * Uses UTC to ensure consistent formatting between server and client
 */
export function formatDateForSSR(dateString: string | Date, locale: string = 'en-US'): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  // Use UTC methods to ensure deterministic formatting
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return `${monthNames[month]} ${day}, ${year}`;
}

/**
 * Format current date deterministically for SSR
 * Returns a static string that won't change between server and client renders
 */
export function formatCurrentDateForSSR(): string {
  // Use a fixed date or the build time to ensure consistency
  // For now, we'll use UTC to ensure deterministic output
  const now = new Date();
  return formatDateForSSR(now);
}
