import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { execFileSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicSurface = resolve(root, "apps/web-master/src/lib/public-surface.ts");
const templateAdmission = resolve(root, "apps/web-master/src/lib/template-admission.ts");
const testSource = `
  import assert from "node:assert/strict";
  import {
    isPageVisibleToAudience,
    isPublicSiteEligible,
  selectPageForAudience,
  countPublicPages,
} from ${JSON.stringify(publicSurface)};
  import { getAdmittedTemplateReceipt } from ${JSON.stringify(templateAdmission)};

  const publicPage = { previewEnvironment: "public", id: "public" };
  const privatePage = { previewEnvironment: "private-preview", id: "private" };
  const unknownPage = { previewEnvironment: "internal-only", id: "unknown" };

  assert.equal(isPageVisibleToAudience(privatePage, "public"), false);
  assert.equal(isPageVisibleToAudience(privatePage, "private-preview"), true);
  assert.equal(isPageVisibleToAudience(unknownPage, "public"), false);
  assert.equal(isPageVisibleToAudience(unknownPage, "private-preview"), false);
  assert.equal(selectPageForAudience([privatePage, publicPage], "public"), publicPage);
  assert.equal(selectPageForAudience([publicPage, privatePage], "private-preview"), privatePage);
  assert.equal(selectPageForAudience([privatePage], "public"), null);
  assert.equal(selectPageForAudience([publicPage], "private-preview"), null);
  assert.equal(countPublicPages([privatePage]), 0);
  assert.equal(countPublicPages([privatePage, publicPage]), 1);

  const receiptJson = process.env.LINKSITES_ADMITTED_TEMPLATE_RECEIPT_JSON;
  const templateSha = process.env.LINKSITES_ADMITTED_TEMPLATE_SHA;
  delete process.env.LINKSITES_ADMITTED_TEMPLATE_RECEIPT_JSON;
  delete process.env.LINKSITES_ADMITTED_TEMPLATE_SHA;
  assert.throws(() => getAdmittedTemplateReceipt(), /no admitted receipt/);
  if (receiptJson !== undefined) process.env.LINKSITES_ADMITTED_TEMPLATE_RECEIPT_JSON = receiptJson;
  if (templateSha !== undefined) process.env.LINKSITES_ADMITTED_TEMPLATE_SHA = templateSha;

  assert.equal(isPublicSiteEligible({ id: "site-1", status: "published" }, 1), true);
  assert.equal(isPublicSiteEligible({ id: "site-1", status: "draft" }, 1), false);
  assert.equal(isPublicSiteEligible({ id: "site-1", status: "archived" }, 1), false);
  assert.equal(isPublicSiteEligible({ id: "site-1", status: "published" }, 0), false);
  assert.equal(isPublicSiteEligible({ status: "published" }, 1), false);
`;

execFileSync(process.execPath, [
  "--experimental-strip-types",
  "--input-type=module",
  "--eval",
  testSource,
], { stdio: "inherit" });

console.log("W2-04 behavioral adversarial tests: PASS");
console.log("tenant: draft/archived/unpublished/missing-id sites fail closed");
console.log("preview: private/unknown audiences cannot select ordinary-route content");
