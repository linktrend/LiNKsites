import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = dirname(fileURLToPath(import.meta.url));
const component = (path: string) => readFileSync(resolve(root, "../src/components", path), "utf8");

test("modal exposes dialog state, traps keyboard focus, and restores the opener", () => {
  const source = component("common/Modal.tsx");

  assert.match(source, /role="dialog"/);
  assert.match(source, /aria-modal="true"/);
  assert.match(source, /aria-labelledby=\{titleId\}/);
  assert.match(source, /event\.key === "Escape"/);
  assert.match(source, /event\.key !== "Tab"/);
  assert.match(source, /returnFocusRef\.current\?\.focus\(\)/);
});

test("header keyboard focus remains visibly indicated", () => {
  const source = component("navigation/Header.tsx");

  assert.doesNotMatch(source, /focus-visible:outline-none(?![^"\n]*focus-visible:ring)/);
  assert.match(source, /focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2/);
});

test("cookie policy disclosure publishes its expanded state and controlled region", () => {
  const source = component("modals/CookiePreferencesModal.tsx");

  assert.match(source, /aria-expanded=\{policyOpen\}/);
  assert.match(source, /aria-controls="cookie-policy-details"/);
  assert.match(source, /id="cookie-policy-details"/);
});
