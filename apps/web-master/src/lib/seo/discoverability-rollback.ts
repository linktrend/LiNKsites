import { createHash } from "node:crypto";

import type { PublishedAuthority } from "@/lib/seo/published-authority";

export const DISCOVERABILITY_ROLLBACK_SCHEMA = "ls07-discoverability-rollback/v1" as const;

export type DiscoverabilityRollbackPlan = Readonly<{
  schemaVersion: typeof DISCOVERABILITY_ROLLBACK_SCHEMA;
  mode: "implementation";
  restoreWithoutProviderCheckout: true;
  readbackRequired: true;
  mutatesRuntime: false;
  previous: Readonly<{ authorityDigest: string }>;
  current: Readonly<{ authorityDigest: string }>;
}>;

const canonical = (value: unknown): string => {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  const rec = value as Record<string, unknown>;
  return `{${Object.keys(rec)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonical(rec[key])}`)
    .join(",")}}`;
};

export function publishedAuthorityDigest(authority: PublishedAuthority): string {
  const hex = createHash("sha256")
    .update(
      canonical({
        schemaVersion: authority.schemaVersion,
        baseUrl: authority.baseUrl,
        urls: authority.urls,
        sitemap: authority.sitemap,
        robots: authority.robots,
        aiProjection: authority.aiProjection,
        llmsTxt: authority.llmsTxt,
      }),
      "utf8",
    )
    .digest("hex");
  return `sha256:${hex}`;
}

export function buildDiscoverabilityRollbackPlan(input: {
  previousDigest: string;
  current: PublishedAuthority;
}): DiscoverabilityRollbackPlan {
  const currentDigest = publishedAuthorityDigest(input.current);
  return Object.freeze({
    schemaVersion: DISCOVERABILITY_ROLLBACK_SCHEMA,
    mode: "implementation",
    restoreWithoutProviderCheckout: true,
    readbackRequired: true,
    mutatesRuntime: false,
    previous: Object.freeze({ authorityDigest: input.previousDigest }),
    current: Object.freeze({ authorityDigest: currentDigest }),
  });
}
