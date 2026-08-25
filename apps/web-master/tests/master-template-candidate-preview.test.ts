import assert from "node:assert/strict";
import test from "node:test";

import { selectMasterTemplateForProduction } from "../../../packages/factory-catalog/src/masterTemplateConsumer.ts";
import { MASTER_TEMPLATE_PIN } from "../../../packages/factory-catalog/src/masterTemplatePin.ts";
import { loadPinnedMasterTemplateBundle } from "../../../packages/factory-catalog/src/masterTemplatePreviewSeam.ts";
import { TemplateAdmissionError, assertTemplateAdmission, getAdmittedTemplateEvidence } from "../src/lib/template-admission.ts";

const PRODUCTION_REJECTION_OR_PROVIDER_PIN_MISMATCH =
  /Production path rejects|(?:Catalogue file|Manifest|Inventory) SHA-256 does not match the pinned receipt\./;

test("production admission still rejects the draft when the proof flag is off", () => {
  delete process.env.LINKSITES_MASTER_TEMPLATE_LOOK_AND_FEEL_PROOF;
  assert.throws(
    () => selectMasterTemplateForProduction(loadPinnedMasterTemplateBundle()),
    PRODUCTION_REJECTION_OR_PROVIDER_PIN_MISMATCH,
  );
  assert.throws(() => getAdmittedTemplateEvidence(), TemplateAdmissionError);
  assert.throws(() => assertTemplateAdmission(MASTER_TEMPLATE_PIN.entryId), TemplateAdmissionError);
});

test("proof flag inspects the pinned draft without emitting approved admission evidence", () => {
  process.env.LINKSITES_MASTER_TEMPLATE_LOOK_AND_FEEL_PROOF = "1";
  try {
    try {
      const receipt = assertTemplateAdmission(MASTER_TEMPLATE_PIN.entryId);
      assert.equal(receipt.entryId, "master-template-type-1");
      assert.match(receipt.receiptId, /^proof-only-not-admitted:/);
      assert.equal(receipt.libraryCommitSha, "6b87993ddaf403aebe7bef97bd268a543a1d14eb");
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      assert.match(
        error.message,
        /(?:Catalogue file|Manifest|Inventory) SHA-256 does not match the pinned receipt\./,
      );
    }
    assert.throws(() => getAdmittedTemplateEvidence(), /does not emit production admission evidence/);
    assert.throws(
      () => assertTemplateAdmission("marketing-smb-v1"),
      /only inspects pinned master-template-type-1/,
    );
    assert.throws(
      () => selectMasterTemplateForProduction(loadPinnedMasterTemplateBundle()),
      PRODUCTION_REJECTION_OR_PROVIDER_PIN_MISMATCH,
    );
  } finally {
    delete process.env.LINKSITES_MASTER_TEMPLATE_LOOK_AND_FEEL_PROOF;
  }
});
