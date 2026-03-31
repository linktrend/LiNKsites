const resolve = (name: string, value: string | undefined, fallback?: string): string => {
  return value || fallback || "";
};

const payloadBaseUrl =
  resolve("PAYLOAD_BASE_URL", process.env.PAYLOAD_BASE_URL) ||
  resolve("PAYLOAD_PUBLIC_SERVER_URL", process.env.PAYLOAD_PUBLIC_SERVER_URL) ||
  resolve("NEXT_PUBLIC_PAYLOAD_API_URL", process.env.NEXT_PUBLIC_PAYLOAD_API_URL) ||
  "http://localhost:3000";

const defaultSiteId = resolve("DEFAULT_SITE_ID", process.env.DEFAULT_SITE_ID, "");
const dedicatedSiteId = resolve("SITE_ID", process.env.SITE_ID, "");

export const runtimeConfig = {
  payloadBaseUrl,
  payloadApiKey: process.env.PAYLOAD_API_KEY,
  defaultSiteId,
  dedicatedSiteId,
};

export type RuntimeConfig = typeof runtimeConfig;
