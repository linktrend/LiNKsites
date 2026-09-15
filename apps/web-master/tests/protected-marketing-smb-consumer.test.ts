import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import test from "node:test";

import {
  ExactProviderAdoptionError,
  LSFACT01_HOLD,
  LSFACT01_PROTECTED_MARKETING_SMB,
  bindExactProviderHandoff,
  materializeExactProvider,
  restartExactProviderFromCache,
  selectExactProviderForProduction,
} from "../../../packages/factory-catalog/src/exactProviderAdoption.ts";
import { loadProtectedMarketingSmbHandoff } from "../../../packages/factory-catalog/src/protectedMarketingSmbHandoff.ts";
import { selectMasterTemplateForProduction } from "../../../packages/factory-catalog/src/masterTemplateConsumer.ts";
import { MASTER_TEMPLATE_PIN } from "../../../packages/factory-catalog/src/masterTemplatePin.ts";
import { loadPinnedMasterTemplateBundle } from "../../../packages/factory-catalog/src/masterTemplatePreviewSeam.ts";
import { TemplateAdmissionError, assertTemplateAdmission } from "../src/lib/template-admission.ts";

const PRODUCTION_REJECTION_OR_PROVIDER_PIN_MISMATCH =
  /Production path rejects|(?:Catalogue file|Manifest|Inventory) SHA-256 does not match the pinned receipt\./;

test("protected marketing-smb-v1 binds, renders identity, restarts, and rejects tamper without mixing the A1 lane", () => {
  delete process.env.LINKSITES_MASTER_TEMPLATE_LOOK_AND_FEEL_PROOF;
  const handoff = loadProtectedMarketingSmbHandoff();
  const bound = bindExactProviderHandoff(handoff);
  assert.equal(bound.handoff.pin.commit, LSFACT01_PROTECTED_MARKETING_SMB.commit);
  assert.equal(bound.handoff.pin.tree, LSFACT01_PROTECTED_MARKETING_SMB.tree);
  assert.equal(bound.handoff.selectability, "selectable");
  assert.equal(bound.handoff.compatibility, "unknown");
  assert.equal(bound.productionSelectable, false);
  assert.equal(bound.hold, LSFACT01_HOLD.marketingSmbV1Protected);

  const markup = renderToStaticMarkup(
    createElement(
      "article",
      {
        "data-provider-family": bound.family,
        "data-provider-commit": bound.handoff.producer.commit,
        "data-provider-tree": bound.handoff.producer.tree,
        "data-library-local-selectable": bound.handoff.selectability,
        "data-production-selectable": String(bound.productionSelectable),
        "data-a1-lane": "separate",
      },
      "marketing-smb-v1 consumer identity",
    ),
  );
  assert.match(markup, /data-provider-family="marketing-smb-v1"/);
  assert.match(markup, new RegExp(LSFACT01_PROTECTED_MARKETING_SMB.commit));
  assert.match(markup, /data-production-selectable="false"/);
  assert.match(markup, /data-a1-lane="separate"/);

  const cacheRoot = mkdtempSync(join(tmpdir(), "iss549-smb-"));
  try {
    const receipt = materializeExactProvider(bound, cacheRoot);
    assert.equal(receipt.providerCheckoutRequired, false);
    assert.equal(restartExactProviderFromCache(cacheRoot, bound.digest).digest, bound.digest);
  } finally {
    rmSync(cacheRoot, { recursive: true, force: true });
  }

  const tamperedFiles = [...handoff.files];
  tamperedFiles[0] = { ...tamperedFiles[0], bytes: `${tamperedFiles[0].bytes} ` };
  assert.throws(
    () => bindExactProviderHandoff({ ...handoff, files: tamperedFiles }),
    ExactProviderAdoptionError,
  );
  assert.throws(() => selectExactProviderForProduction(handoff), /Production selection fail-closed/);

  assert.throws(
    () => selectMasterTemplateForProduction(loadPinnedMasterTemplateBundle()),
    PRODUCTION_REJECTION_OR_PROVIDER_PIN_MISMATCH,
  );
  assert.throws(() => assertTemplateAdmission(MASTER_TEMPLATE_PIN.entryId), TemplateAdmissionError);
});
