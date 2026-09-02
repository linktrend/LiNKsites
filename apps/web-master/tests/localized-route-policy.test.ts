import assert from "node:assert/strict";
import test from "node:test";

import {
  canonicalLocalizedUrl,
  resolveLocalePolicy,
} from "../src/lib/localized-route-policy.ts";

test("locale policy uses exact locales and only an explicit live fallback", () => {
  assert.deepEqual(
    resolveLocalePolicy({ requestedLocale: "es", availableLocales: ["en", "es"] }),
    { kind: "exact", locale: "es" },
  );
  assert.deepEqual(
    resolveLocalePolicy({ requestedLocale: "zh-tw", availableLocales: ["en"], fallbackLocale: "en" }),
    { kind: "fallback", locale: "en", requestedLocale: "zh-tw" },
  );
});

test("locale policy deterministically rejects unknown, unavailable, and invalid fallback locales", () => {
  assert.deepEqual(
    resolveLocalePolicy({ requestedLocale: "fr", availableLocales: ["en"], fallbackLocale: "en" }),
    { kind: "reject", reason: "unsupported-locale" },
  );
  assert.deepEqual(
    resolveLocalePolicy({ requestedLocale: "es", availableLocales: ["zh-cn"], fallbackLocale: "en" }),
    { kind: "reject", reason: "locale-unavailable" },
  );
  assert.deepEqual(
    resolveLocalePolicy({ requestedLocale: "es", availableLocales: ["en"], fallbackLocale: "fr" }),
    { kind: "reject", reason: "invalid-fallback" },
  );
});

test("canonical localized URLs are stable across prefixed and unprefixed input", () => {
  const expected = {
    status: "READY",
    locale: "es",
    pathname: "/es/resources/articles/launch",
    canonical: "https://example.test/es/resources/articles/launch",
  };
  assert.deepEqual(canonicalLocalizedUrl({
    baseUrl: "https://example.test/",
    requestedLocale: "es",
    availableLocales: ["en", "es"],
    pathname: "/resources/articles/launch",
  }), expected);
  assert.deepEqual(canonicalLocalizedUrl({
    baseUrl: "https://example.test",
    requestedLocale: "es",
    availableLocales: ["en", "es"],
    pathname: "/en/resources/articles/launch",
  }), expected);
});

test("missing live canonical configuration stays explicit HOLD", () => {
  assert.deepEqual(canonicalLocalizedUrl({
    requestedLocale: "en",
    availableLocales: ["en"],
    pathname: "/about",
  }), { status: "HOLD", reason: "missing-live-base-url" });
  assert.deepEqual(canonicalLocalizedUrl({
    baseUrl: "https://example.test",
    requestedLocale: "en",
    pathname: "/about",
  }), { status: "HOLD", reason: "missing-live-locale-configuration" });
});

test("canonical generation rejects malformed, private, stale, and unsupported-locale routes", () => {
  const base = {
    baseUrl: "https://example.test",
    requestedLocale: "en",
    availableLocales: ["en"],
  } as const;
  for (const pathname of [
    "/about?preview=1",
    "/about#fragment",
    "//about",
    "/demo",
    "/home",
    "/resources/unknown/item",
  ]) {
    assert.deepEqual(canonicalLocalizedUrl({ ...base, pathname }), {
      status: "REJECT",
      reason: "invalid-public-route",
    });
  }
  assert.deepEqual(canonicalLocalizedUrl({ ...base, requestedLocale: "fr", pathname: "/about" }), {
    status: "REJECT",
    reason: "unsupported-locale",
  });
});
