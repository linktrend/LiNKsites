import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { FAMILY_IDS, resolveFamilyRoute } from "@/lib/routes";
import {
  LAYOUT_COMPOSITIONS,
  assertStructurallyDistinctCompositions,
  resolveLayoutRuntime,
} from "@/components/page-renderer/layout-packs";
import { bindAcceptedLayoutIdentities } from "@/components/page-renderer/accepted-identities";
import { composeLayoutBody, pageRendererMountAttributes } from "@/components/page-renderer/compose-layout";
import { mapBlockToPayloadType } from "@/components/page-renderer/semantic-map";
import {
  IMPLEMENTATION_ROLLBACK_SCHEMA,
  buildImplementationRendererConfiguration,
  buildImplementationRollbackPlan,
  readbackRendererConfiguration,
  rendererConfigurationDigest,
} from "@/components/page-renderer/renderer-rollback";
import { resolveShell } from "@/components/shell/resolved-shell";

export const RUNTIME_PROOF_HARNESS_ID = "ls06-iss-19-21-runtime-proof";

type Check = Readonly<{ id: string; status: "PASS" | "FAIL"; detail: string }>;

const acceptedIdentities = {
  ls04: {
    source: "injected",
    workingContentIdentity: "ls04:working-content:injected:v1",
    promotionReceiptIdentity: "ls04:promotion-receipt:injected:v1",
  },
  ls05: {
    source: "injected",
    adapterIdentity: "ls05:adapter:injected:v1",
    materializationReceiptIdentity: "ls05:materialization:injected:v1",
  },
  provider: {
    source: "injected",
    providerId: "master-template-type-1",
    semver: "2.0.0-a1.1",
    layoutPackId: "A1",
    candidateIdentity: "provider:injected:layout-A1",
  },
  layout: {
    source: "injected",
    layoutPackId: "A1",
    planId: "B",
    shellId: "marketing-shell",
  },
} as const;

function check(id: string, ok: boolean, pass: string, fail: string): Check {
  return { id, status: ok ? "PASS" : "FAIL", detail: ok ? pass : fail };
}

function safe(id: string, run: () => string): Check {
  try {
    return check(id, true, run(), "unexpected");
  } catch (error) {
    return check(id, false, "", error instanceof Error ? error.message : String(error));
  }
}

export function evaluateIss1921RuntimeProof(rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "../../..")) {
  const checks: Check[] = [];

  try {
    assertStructurallyDistinctCompositions();
    checks.push(
      check(
        "iss19.compositions",
        LAYOUT_COMPOSITIONS.A1.pageRenderer !== LAYOUT_COMPOSITIONS.A2.pageRenderer &&
          LAYOUT_COMPOSITIONS.A2.architectureReady &&
          LAYOUT_COMPOSITIONS.A3.architectureReady,
        "A1/A2/A3 PageRenderer compositions are structurally distinct",
        "compositions are not structurally distinct",
      ),
    );
  } catch (error) {
    checks.push(
      check("iss19.compositions", false, "", error instanceof Error ? error.message : String(error)),
    );
  }

  checks.push((() => {
    try {
      mapBlockToPayloadType({ providerRole: "hero" });
      try {
        mapBlockToPayloadType({ blockType: "mystery" });
        return check("iss19.semantics", false, "", "unknown block type did not fail closed");
      } catch {
        return check("iss19.semantics", true, "provider semantics fail closed for unknown required ids", "");
      }
    } catch (error) {
      return check("iss19.semantics", false, "", error instanceof Error ? error.message : String(error));
    }
  })());

  checks.push(
    safe("iss19.identities.bind", () => {
      const bound = bindAcceptedLayoutIdentities(acceptedIdentities);
      const runtime = resolveLayoutRuntime({
        layoutPackId: bound.ls05.layoutPackId,
        planId: bound.ls04.capabilityPlanId,
      });
      return `${runtime.layoutPackId}/${runtime.planId}`;
    }),
  );

  checks.push((() => {
    try {
      resolveLayoutRuntime({});
      return check("iss19.identities.fail_closed", false, "", "empty runtime still resolved");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return check(
        "iss19.identities.fail_closed",
        message.includes("absent"),
        "absent LS-04/LS-05 layoutPackId/planId fail closed",
        message,
      );
    }
  })());

  checks.push((() => {
    try {
      bindAcceptedLayoutIdentities({
        ls04: acceptedIdentities.ls04,
        ls05: acceptedIdentities.ls05,
      });
      return check("iss19.identities.packet_fields_required", false, "", "packet without layout/provider still bound");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return check(
        "iss19.identities.packet_fields_required",
        message.includes("absent"),
        "LS-04/LS-05 identities without layoutPackId/planId fail closed",
        message,
      );
    }
  })());

  const layoutSource = readFileSync(resolve(rootDir, "src/app/(public)/[lang]/layout.tsx"), "utf8");
  const packsSource = readFileSync(resolve(rootDir, "src/components/page-renderer/layout-packs.ts"), "utf8");
  const legalSource = readFileSync(resolve(rootDir, "src/layouts/legal-family-page.ts"), "utf8");
  const catchAll = readFileSync(resolve(rootDir, "src/app/(public)/[lang]/[[...slug]]/page.tsx"), "utf8");
  const settingsSource = readFileSync(resolve(rootDir, "src/lib/repository/siteSettings.ts"), "utf8");
  const noSettingsAuthority =
    !layoutSource.includes("getSiteSettings") &&
    !legalSource.includes("getSiteSettings") &&
    !catchAll.includes("getSiteSettings") &&
    !packsSource.includes('? "A1"') &&
    !packsSource.includes('? "A"') &&
    !settingsSource.includes("layoutPackId") &&
    !settingsSource.includes("planId");
  checks.push(
    check(
      "iss19.no_settings_default",
      noSettingsAuthority,
      "CmsSiteSettings is not a fail-open A1/A layout authority",
      "CmsSiteSettings or A1/A defaults remain in the layout bind path",
    ),
  );

  checks.push(
    safe("iss19.runtime_markup", () => {
      const bound = bindAcceptedLayoutIdentities(acceptedIdentities);
      const a1 = resolveLayoutRuntime({ layoutPackId: bound.ls05.layoutPackId, planId: bound.ls04.capabilityPlanId });
      const a2 = resolveLayoutRuntime({ layoutPackId: "A2", planId: "B" });
      const a3 = resolveLayoutRuntime({ layoutPackId: "A3", planId: "C" });
      const main = createElement("div", { "data-region": "main" }, "body");
      const markupA1 = renderToStaticMarkup(createElement("div", pageRendererMountAttributes(a1), composeLayoutBody(a1, main, "Home")));
      const markupA2 = renderToStaticMarkup(createElement("div", pageRendererMountAttributes(a2), composeLayoutBody(a2, main, "Home")));
      const markupA3 = renderToStaticMarkup(createElement("div", pageRendererMountAttributes(a3), composeLayoutBody(a3, main, "Home")));
      if (!markupA1.includes('data-page-renderer="composition-a1-linear-shell"')) {
        throw new Error("A1 runtime markup missing linear renderer");
      }
      if (!markupA2.includes('data-region="aside"') || markupA1.includes('data-region="aside"')) {
        throw new Error("A2 runtime markup is not distinct from A1");
      }
      if (!markupA3.includes('data-region="secondary"') || markupA2.includes('data-region="secondary"')) {
        throw new Error("A3 runtime markup is not distinct from A2");
      }
      return `${a1.composition.pageRenderer}|${a2.composition.pageRenderer}|${a3.composition.pageRenderer}`;
    }),
  );

  const shell = resolveShell({ locale: "en", planId: "B" });
  const typeL = resolveShell({ locale: "en", planId: "L" });
  checks.push(
    check(
      "iss20.shell",
      shell.noPlaceholders &&
        shell.header !== ("placeholder" as string) &&
        typeL.typeLShellMode === "isolated",
      "resolved Header/Footer/mobile/locale/action shell isolates Type L",
      "shell placeholders or Type L isolation failed",
    ),
  );

  const familiesOk =
    FAMILY_IDS.every((id) => ["home", "about", "contact", "legal", "collection", "detail"].includes(id)) &&
    resolveFamilyRoute("/en").kind === "ok" &&
    resolveFamilyRoute("/en/demo").kind === "collision" &&
    resolveFamilyRoute("/en/home").kind === "redirect";
  checks.push(
    check(
      "iss21.families",
      familiesOk,
      "active family/locale/redirect/collision/retirement rules are enforced",
      "family route rules failed",
    ),
  );

  const docsEn = resolveFamilyRoute("/en/resources/docs");
  const docsEs = resolveFamilyRoute("/es/resources/docs/intro");
  const faqArticle = resolveFamilyRoute("/en/resources/faq/billing/why-invoice");
  const faqCategory = resolveFamilyRoute("/en/resources/faq/billing");
  const docsPage = readFileSync(resolve(rootDir, "src/app/(public)/[lang]/resources/docs/page.tsx"), "utf8");
  const pageService = readFileSync(resolve(rootDir, "src/lib/pageService.ts"), "utf8");
  const docsFaqOk =
    docsEn.kind === "redirect" &&
    docsEn.to === "/en/resources" &&
    docsEs.kind === "redirect" &&
    docsEs.to === "/es/resources" &&
    faqArticle.kind === "redirect" &&
    faqArticle.to === "/en/resources/faq/billing" &&
    faqCategory.kind === "ok" &&
    resolveFamilyRoute("/zh-tw/resources/faq/a/b").kind === "redirect" &&
    resolveFamilyRoute("/en/resources/faq/a/b/c").kind === "collision" &&
    !pageService.includes("getDocsPage") &&
    !docsPage.includes("getDocsPage");
  checks.push(
    check(
      "iss21.docs_faq_paths",
      docsFaqOk,
      "unimplemented docs and FAQ article paths retire or locale-safe redirect",
      "docs/FAQ article family authority does not match pages",
    ),
  );

  checks.push(
    safe("iss21.rollback_readback", () => {
      const configuration = buildImplementationRendererConfiguration({
        layoutPackId: "A1",
        planId: "B",
        locale: "en",
      });
      const digest = rendererConfigurationDigest(configuration);
      const previous = rendererConfigurationDigest(
        buildImplementationRendererConfiguration({ layoutPackId: "A2", planId: "C", locale: "en" }),
      );
      const plan = buildImplementationRollbackPlan({ previousDigest: previous, configuration });
      const readback = readbackRendererConfiguration(configuration, digest);
      if (plan.schemaVersion !== IMPLEMENTATION_ROLLBACK_SCHEMA) {
        throw new Error("implementation rollback schema missing");
      }
      if (plan.distinctFromPreparationRollback !== true) {
        throw new Error("implementation rollback is not distinct from preparation");
      }
      if (readback !== plan.current.rendererConfigurationDigest) {
        throw new Error("current digest does not match readback");
      }
      try {
        readbackRendererConfiguration(configuration, previous);
        throw new Error("mismatched digest did not fail closed");
      } catch (error) {
        if (error instanceof Error && error.message.includes("did not fail closed")) throw error;
      }
      return readback;
    }),
  );

  const status = checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";
  return {
    harnessId: RUNTIME_PROOF_HARNESS_ID,
    status,
    preparationOnly: false,
    runtimeProof: true,
    ls06Complete: false,
    packetAcceptanceClaimed: false,
    checks,
  };
}
