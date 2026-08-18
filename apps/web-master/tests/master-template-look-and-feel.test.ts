import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { isMasterTemplateLookAndFeelProofHarnessEnabled } from "../../../packages/factory-catalog/src/masterTemplatePreviewSeam.ts";
import { assertThemeContractCss, renderThemeContractCss } from "../../../packages/factory-catalog/src/masterTemplateTokens.ts";

const THEME_JSON = resolve(dirname(fileURLToPath(import.meta.url)), "../config/theme.json");
const THEME_HELPER = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../src/lib/master-template-theme.ts",
);

test("theme.json becomes data-theme CSS without overlaying generated token files", () => {
  const theme = JSON.parse(readFileSync(THEME_JSON, "utf8")) as unknown;
  const helper = readFileSync(THEME_HELPER, "utf8");
  assert.match(helper, /from "\.\.\/\.\.\/config\/theme\.json"/);
  assert.match(helper, /renderThemeContractCss/);
  assert.doesNotMatch(helper, /from ["'].*tokens\.(css|json)["']/);
  assert.doesNotMatch(helper, /from ["'].*variants\.json["']/);
  const css = renderThemeContractCss(theme);
  assertThemeContractCss(css);
  assert.match(css, /--color-primary: #1e5a40/);
  assert.match(css, /--color-accent: #2a6f97/);
  assert.match(css, /--color-background: #eef1ef/);
  assert.match(css, /Libre Franklin/);
  assert.match(css, /data-theme="default"/);
  assert.match(css, /data-theme="light"/);
  assert.match(css, /data-theme="dark"/);
  assert.doesNotMatch(css, /dentist/);
  assert.doesNotMatch(css, /SINGLE SOURCE OF TRUTH/);
});

test("step 3 look-and-feel proof harness stays unused even if the flag is set", () => {
  assert.equal(
    isMasterTemplateLookAndFeelProofHarnessEnabled({
      LINKSITES_MASTER_TEMPLATE_LOOK_AND_FEEL_PROOF: "1",
      LINKSITES_W2_04_LOCAL_PROOF: "1",
      LINKSITES_W2_04_LOCAL_PROOF_TEMPLATE_ID: "marketing-smb-v1",
    }),
    false,
  );
});
