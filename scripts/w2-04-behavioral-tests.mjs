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
  const evidenceJson = process.env.LINKSITES_ADMITTED_TEMPLATE_EVIDENCE_JSON;
  const templateSha = process.env.LINKSITES_ADMITTED_TEMPLATE_SHA;
  delete process.env.LINKSITES_ADMITTED_TEMPLATE_RECEIPT_JSON;
  delete process.env.LINKSITES_ADMITTED_TEMPLATE_EVIDENCE_JSON;
  delete process.env.LINKSITES_ADMITTED_TEMPLATE_SHA;
  assert.throws(() => getAdmittedTemplateReceipt(), /no (authoritative )?receipt/);
  if (receiptJson !== undefined) process.env.LINKSITES_ADMITTED_TEMPLATE_RECEIPT_JSON = receiptJson;
  if (evidenceJson !== undefined) process.env.LINKSITES_ADMITTED_TEMPLATE_EVIDENCE_JSON = evidenceJson;
  if (templateSha !== undefined) process.env.LINKSITES_ADMITTED_TEMPLATE_SHA = templateSha;

  const fabricatedReceipt = {
    schemaVersion: { major: 1, minor: 0 },
    receiptId: "library-consumption:marketing-smb-v1:" + "a".repeat(40),
    consumer: "linksites",
    entryId: "marketing-smb-v1",
    catalogCommitSha: "a".repeat(40),
    libraryCommitSha: "a".repeat(40),
    verificationId: "self-asserted",
    entryChecksum: "0".repeat(64),
    assetChecksums: { "assets/marketingSmbV1.ts": "0".repeat(64) },
    entrypoint: "assets/marketingSmbV1.ts",
    testFiles: ["assets/marketingSmbV1.ts"],
    compatibility: { compatible: true, consumer: "linksites", nodeMajor: 22, runtimes: ["node", "browser"] },
    recordedAt: "2026-08-05T00:00:00.000Z",
  };
  process.env.LINKSITES_ADMITTED_TEMPLATE_RECEIPT_JSON = JSON.stringify(fabricatedReceipt);
  process.env.LINKSITES_ADMITTED_TEMPLATE_EVIDENCE_JSON = JSON.stringify({
    entry: { entryId: "marketing-smb-v1", status: "approved" },
    files: { "assets/marketingSmbV1.ts": "fabricated materialized bytes" },
    receipt: fabricatedReceipt,
    verification: { verificationId: "self-asserted" },
  });
  process.env.LINKSITES_ADMITTED_TEMPLATE_SHA = "a".repeat(40);
  assert.throws(
    () => getAdmittedTemplateReceipt(),
    /factory-catalog authoritative verification|source-owned W1-05 offline authority|Invalid LiNKsites Library consumption receipt/,
    "a fabricated environment receipt must not be admitted",
  );

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
