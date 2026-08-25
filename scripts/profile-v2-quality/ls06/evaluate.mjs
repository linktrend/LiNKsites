import {
  CHECK_IDS,
  CONFIGURATION_SCHEMA,
  CONTRACT_SCHEMA,
  EVIDENCE_BOUNDARIES,
  HARNESS_ID,
  HARNESS_VERSION,
  INDEPENDENT_OF,
  NOT_COMPLETION_OF,
  PACKET_SCHEMA,
  REQUIRED_FAMILY_IDS,
  REQUIRED_LAYOUT_PACKS,
  REQUIRED_SHELL_BEHAVIOR,
  REQUIRED_SHELL_REGIONS,
  ROLLBACK_SCHEMA,
} from "./constants.mjs";
import {
  collectForbiddenKeys,
  identitySources,
  isForbiddenSource,
  isInjectedSource,
  isNonEmptyString,
  missingIdentityBlocks,
  missingLayoutFields,
  missingLs04Fields,
  missingLs05Fields,
  missingProviderFields,
} from "./identities.mjs";
import { loadPacket } from "./load-packet.mjs";

/**
 * @param {string} id
 * @param {"PASS" | "FAIL"} status
 * @param {string} detail
 */
function check(id, status, detail) {
  return { id, status, detail };
}

/**
 * @param {unknown} contract
 * @returns {string[]}
 */
function compositionDefects(contract) {
  if (!contract || typeof contract !== "object") {
    return ["contract missing"];
  }
  const rec = /** @type {Record<string, unknown>} */ (contract);
  if (rec.schemaVersion !== CONTRACT_SCHEMA) {
    return [`expected schemaVersion ${CONTRACT_SCHEMA}`];
  }
  const compositions = rec.compositions;
  if (!compositions || typeof compositions !== "object") {
    return ["compositions missing"];
  }
  const table = /** @type {Record<string, unknown>} */ (compositions);
  const defects = [];
  /** @type {string[]} */
  const rendererIds = [];
  /** @type {string[]} */
  const regionSignatures = [];
  for (const pack of REQUIRED_LAYOUT_PACKS) {
    const row = table[pack];
    if (!row || typeof row !== "object") {
      defects.push(`missing composition ${pack}`);
      continue;
    }
    const item = /** @type {Record<string, unknown>} */ (row);
    if (!isNonEmptyString(item.pageRenderer)) {
      defects.push(`${pack}.pageRenderer missing`);
    } else {
      rendererIds.push(item.pageRenderer);
    }
    if (!Array.isArray(item.regions) || item.regions.length === 0) {
      defects.push(`${pack}.regions missing`);
    } else {
      regionSignatures.push(item.regions.join("|"));
      for (const region of REQUIRED_SHELL_REGIONS) {
        if (!item.regions.includes(region)) {
          defects.push(`${pack} missing required region ${region}`);
        }
      }
    }
  }
  if (new Set(rendererIds).size !== rendererIds.length) {
    defects.push("pageRenderer identities are not structurally distinct");
  }
  if (new Set(regionSignatures).size !== regionSignatures.length) {
    defects.push("region sets are not structurally distinct across A1/A2/A3");
  }
  return defects;
}

/**
 * @param {unknown} contract
 */
function shellDefects(contract) {
  if (!contract || typeof contract !== "object") return ["contract missing"];
  const rec = /** @type {Record<string, unknown>} */ (contract);
  const shell = rec.resolvedShell;
  if (!shell || typeof shell !== "object") return ["resolvedShell missing"];
  const item = /** @type {Record<string, unknown>} */ (shell);
  const defects = [];
  for (const key of REQUIRED_SHELL_BEHAVIOR) {
    if (key === "actions") {
      if (!Array.isArray(item.actions) || item.actions.length === 0) {
        defects.push("resolvedShell.actions missing");
      }
      continue;
    }
    if (!isNonEmptyString(item[key])) defects.push(`resolvedShell.${key} missing`);
  }
  if (item.header === "placeholder" || item.footer === "placeholder") {
    defects.push("resolvedShell uses placeholder header/footer");
  }
  return defects;
}

/**
 * @param {unknown} packet
 * @param {unknown} contract
 * @param {unknown} configuration
 */
function typeLDefects(packet, contract, configuration) {
  const defects = [];
  const contractRec =
    contract && typeof contract === "object"
      ? /** @type {Record<string, unknown>} */ (contract)
      : {};
  const configRec =
    configuration && typeof configuration === "object"
      ? /** @type {Record<string, unknown>} */ (configuration)
      : {};
  if (contractRec.typeLIsolation !== true) {
    defects.push("contract.typeLIsolation is not true");
  }
  if (configRec.typeLIsolation !== true) {
    defects.push("configuration.typeLIsolation is not true");
  }
  const identities =
    packet && typeof packet === "object"
      ? /** @type {Record<string, unknown>} */ (packet).identities
      : null;
  const layout =
    identities && typeof identities === "object"
      ? /** @type {Record<string, unknown>} */ (identities).layout
      : null;
  const planId =
    layout && typeof layout === "object"
      ? /** @type {Record<string, unknown>} */ (layout).planId
      : null;
  if (planId === "L") {
    const isolationMode = configRec.typeLShellMode;
    if (isolationMode !== "isolated") {
      defects.push("Type L requires configuration.typeLShellMode isolated");
    }
  }
  return defects;
}

/**
 * @param {unknown} node
 */
function claimsCompletion(node) {
  if (!node || typeof node !== "object") return false;
  const rec = /** @type {Record<string, unknown>} */ (node);
  if (rec.ls06Complete === true) return true;
  if (rec.preparationOnly === false && rec.packetComplete === true) return true;
  if (typeof rec.completionClaim === "string" && rec.completionClaim.includes("LS-06 complete")) {
    return true;
  }
  if (Array.isArray(rec.notCompletionOf) && rec.notCompletionOf.length === 0) {
    return true;
  }
  return false;
}

/**
 * @param {string} packetDir
 */
export function evaluatePacket(packetDir) {
  const loaded = loadPacket(packetDir);
  /** @type {{ id: string, status: "PASS" | "FAIL", detail: string }[]} */
  const checks = [];

  if (!loaded.ok) {
    const schemaFail = loaded.error?.code === "PACKET_SCHEMA";
    checks.push(
      check(
        CHECK_IDS.PACKET_SCHEMA,
        schemaFail ? "FAIL" : loaded.packet ? "PASS" : "FAIL",
        loaded.error?.message ?? "packet load failed",
      ),
    );
    checks.push(
      check(
        CHECK_IDS.LS04_IDENTITY,
        "FAIL",
        "fail closed: packet did not load, LS-04 identity not proven",
      ),
    );
    checks.push(
      check(
        CHECK_IDS.LS05_IDENTITY,
        "FAIL",
        "fail closed: packet did not load, LS-05 identity not proven",
      ),
    );
    checks.push(
      check(
        CHECK_IDS.PROVIDER_IDENTITY,
        "FAIL",
        "fail closed: packet did not load, provider identity not proven",
      ),
    );
    const status = "FAIL";
    return report(status, checks, loaded);
  }

  const packet = loaded.packet;
  const identities = packet.identities;
  const missingBlocks = missingIdentityBlocks(identities);
  const ls04Missing = missingLs04Fields(
    identities && typeof identities === "object" ? identities.ls04 : null,
  );
  const ls05Missing = missingLs05Fields(
    identities && typeof identities === "object" ? identities.ls05 : null,
  );
  const providerMissing = missingProviderFields(
    identities && typeof identities === "object" ? identities.provider : null,
  );
  const layoutMissing = missingLayoutFields(
    identities && typeof identities === "object" ? identities.layout : null,
  );

  checks.push(
    check(
      CHECK_IDS.PACKET_SCHEMA,
      packet.schemaVersion === PACKET_SCHEMA ? "PASS" : "FAIL",
      packet.schemaVersion === PACKET_SCHEMA
        ? PACKET_SCHEMA
        : `unexpected schema ${String(packet.schemaVersion)}`,
    ),
  );

  const preparationOk =
    packet.preparationOnly === true &&
    Array.isArray(packet.notCompletionOf) &&
    packet.notCompletionOf.includes("LS-06");
  checks.push(
    check(
      CHECK_IDS.PREPARATION_ONLY,
      preparationOk ? "PASS" : "FAIL",
      preparationOk
        ? "preparationOnly=true and notCompletionOf includes LS-06"
        : "packet must declare preparationOnly and must not complete LS-06",
    ),
  );

  checks.push(
    check(
      CHECK_IDS.LS04_IDENTITY,
      ls04Missing.length === 0 && !missingBlocks.includes("ls04") ? "PASS" : "FAIL",
      ls04Missing.length === 0 && !missingBlocks.includes("ls04")
        ? "injected LS-04 working-content and promotion identities present"
        : `fail closed: absent LS-04 identity (${[...missingBlocks.filter((id) => id === "ls04"), ...ls04Missing].join(", ") || "ls04"})`,
    ),
  );
  checks.push(
    check(
      CHECK_IDS.LS05_IDENTITY,
      ls05Missing.length === 0 && !missingBlocks.includes("ls05") ? "PASS" : "FAIL",
      ls05Missing.length === 0 && !missingBlocks.includes("ls05")
        ? "injected LS-05 adapter and materialization identities present"
        : `fail closed: absent LS-05 identity (${[...missingBlocks.filter((id) => id === "ls05"), ...ls05Missing].join(", ") || "ls05"})`,
    ),
  );
  checks.push(
    check(
      CHECK_IDS.PROVIDER_IDENTITY,
      providerMissing.length === 0 && !missingBlocks.includes("provider")
        ? "PASS"
        : "FAIL",
      providerMissing.length === 0 && !missingBlocks.includes("provider")
        ? "injected provider identity present"
        : `fail closed: absent provider identity (${[...missingBlocks.filter((id) => id === "provider"), ...providerMissing].join(", ") || "provider"})`,
    ),
  );
  checks.push(
    check(
      CHECK_IDS.LAYOUT_IDENTITY,
      layoutMissing.length === 0 && !missingBlocks.includes("layout")
        ? "PASS"
        : "FAIL",
      layoutMissing.length === 0 && !missingBlocks.includes("layout")
        ? "injected layout identity present"
        : `fail closed: absent layout identity (${[...missingBlocks.filter((id) => id === "layout"), ...layoutMissing].join(", ") || "layout"})`,
    ),
  );

  const sources = identitySources(identities);
  const injectedOk =
    sources.length === 4 &&
    sources.every((row) => isInjectedSource(row.source)) &&
    sources.every((row) => !isForbiddenSource(row.source));
  checks.push(
    check(
      CHECK_IDS.INJECTED_ONLY,
      injectedOk ? "PASS" : "FAIL",
      injectedOk
        ? "all identity sources are injected"
        : "fail closed: identities must be injected; live/discovered/checkout sources are rejected",
    ),
  );

  const provider =
    identities && typeof identities === "object" ? identities.provider : null;
  const layout =
    identities && typeof identities === "object" ? identities.layout : null;
  const packMatch =
    provider &&
    layout &&
    typeof provider === "object" &&
    typeof layout === "object" &&
    provider.layoutPackId === layout.layoutPackId &&
    isNonEmptyString(provider.layoutPackId);
  checks.push(
    check(
      CHECK_IDS.LAYOUT_PROVIDER_MATCH,
      packMatch ? "PASS" : "FAIL",
      packMatch
        ? `layoutPackId ${String(layout.layoutPackId)} matches provider`
        : "fail closed: layout and provider layoutPackId must match",
    ),
  );

  const distinctDefects = compositionDefects(loaded.contract);
  checks.push(
    check(
      CHECK_IDS.CONTRACT_DISTINCT,
      distinctDefects.length === 0 ? "PASS" : "FAIL",
      distinctDefects.length === 0
        ? "A1/A2/A3 PageRenderer compositions are structurally distinct"
        : distinctDefects.join("; "),
    ),
  );

  const shellIssues = shellDefects(loaded.contract);
  checks.push(
    check(
      CHECK_IDS.CONTRACT_SHELL,
      shellIssues.length === 0 ? "PASS" : "FAIL",
      shellIssues.length === 0
        ? "header/footer/mobile/locale/action shell is resolved in contract"
        : shellIssues.join("; "),
    ),
  );

  const typeLIssues = typeLDefects(packet, loaded.contract, loaded.configuration);
  checks.push(
    check(
      CHECK_IDS.CONTRACT_TYPE_L,
      typeLIssues.length === 0 ? "PASS" : "FAIL",
      typeLIssues.length === 0
        ? "Type L shell isolation is declared"
        : typeLIssues.join("; "),
    ),
  );

  const contractRec =
    loaded.contract && typeof loaded.contract === "object"
      ? /** @type {Record<string, unknown>} */ (loaded.contract)
      : {};
  const configRec =
    loaded.configuration && typeof loaded.configuration === "object"
      ? /** @type {Record<string, unknown>} */ (loaded.configuration)
      : {};
  const noPlaceholders =
    contractRec.noPlaceholders === true && configRec.noPlaceholders === true;
  checks.push(
    check(
      CHECK_IDS.CONTRACT_NO_PLACEHOLDERS,
      noPlaceholders ? "PASS" : "FAIL",
      noPlaceholders
        ? "contract and configuration forbid placeholders"
        : "placeholders are not forbidden",
    ),
  );

  const families = Array.isArray(configRec.families) ? configRec.families : [];
  const familiesOk = REQUIRED_FAMILY_IDS.every((id) => families.includes(id));
  const configOffline =
    configRec.schemaVersion === CONFIGURATION_SCHEMA &&
    configRec.mode === "offline" &&
    configRec.source === "injected" &&
    familiesOk;
  checks.push(
    check(
      CHECK_IDS.CONFIG_OFFLINE,
      configOffline ? "PASS" : "FAIL",
      configOffline
        ? "configuration is offline, injected, and enumerates family routes"
        : "configuration must be offline/injected with every active family",
    ),
  );

  const configBind =
    layout &&
    typeof layout === "object" &&
    configRec.layoutPackId === layout.layoutPackId &&
    configRec.planId === layout.planId &&
    configRec.shellId === layout.shellId;
  checks.push(
    check(
      CHECK_IDS.CONFIG_BIND,
      configBind ? "PASS" : "FAIL",
      configBind
        ? "configuration is bound to injected layout identity"
        : "configuration is not bound to injected layout identity",
    ),
  );

  const rollback =
    loaded.rollback && typeof loaded.rollback === "object"
      ? /** @type {Record<string, unknown>} */ (loaded.rollback)
      : {};
  const previous =
    rollback.previous && typeof rollback.previous === "object"
      ? /** @type {Record<string, unknown>} */ (rollback.previous)
      : null;
  const previousOk =
    previous !== null &&
    isNonEmptyString(previous.adoptionIdentity) &&
    isNonEmptyString(previous.rendererConfigurationDigest);
  checks.push(
    check(
      CHECK_IDS.ROLLBACK_PREVIOUS,
      previousOk ? "PASS" : "FAIL",
      previousOk
        ? "previous adoption and renderer configuration identities are present"
        : "fail closed: rollback previous identities are absent",
    ),
  );

  const readbackOk =
    rollback.schemaVersion === ROLLBACK_SCHEMA &&
    rollback.readbackRequired === true &&
    rollback.mutatesRuntime === false;
  checks.push(
    check(
      CHECK_IDS.ROLLBACK_READBACK,
      readbackOk ? "PASS" : "FAIL",
      readbackOk
        ? "rollback requires readback and does not mutate runtime"
        : "rollback must require readback and must not mutate runtime",
    ),
  );

  const rollbackOffline =
    rollback.mode === "offline" && rollback.restoreWithoutProviderCheckout === true;
  checks.push(
    check(
      CHECK_IDS.ROLLBACK_OFFLINE,
      rollbackOffline ? "PASS" : "FAIL",
      rollbackOffline
        ? "rollback is offline and does not require a provider checkout"
        : "rollback must restore offline without provider checkout",
    ),
  );

  const current =
    rollback.current && typeof rollback.current === "object"
      ? /** @type {Record<string, unknown>} */ (rollback.current)
      : {};
  const configDigest = loaded.digests[loaded.rels.configuration];
  const digestOk =
    isNonEmptyString(current.rendererConfigurationDigest) &&
    current.rendererConfigurationDigest === configDigest;
  checks.push(
    check(
      CHECK_IDS.ROLLBACK_DIGEST,
      digestOk ? "PASS" : "FAIL",
      digestOk
        ? "rollback current digest matches configuration.json"
        : "rollback current digest does not match configuration.json",
    ),
  );

  const forbidden = collectForbiddenKeys({
    packet,
    contract: loaded.contract,
    configuration: loaded.configuration,
    rollback: loaded.rollback,
  });
  checks.push(
    check(
      CHECK_IDS.NO_PROVIDER_BYTES,
      forbidden.length === 0 ? "PASS" : "FAIL",
      forbidden.length === 0
        ? "no provider bytes or product-path keys"
        : `fail closed: forbidden keys ${forbidden.join(", ")}`,
    ),
  );

  const completion =
    claimsCompletion(packet) ||
    claimsCompletion(loaded.contract) ||
    claimsCompletion(loaded.configuration) ||
    claimsCompletion(loaded.rollback);
  checks.push(
    check(
      CHECK_IDS.NO_COMPLETION,
      completion ? "FAIL" : "PASS",
      completion
        ? "fail closed: packet claims LS-06 completion"
        : "no LS-06 completion claim",
    ),
  );

  const status = checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";
  return report(status, checks, loaded);
}

/**
 * @param {"PASS" | "FAIL"} status
 * @param {{ id: string, status: string, detail: string }[]} checks
 * @param {ReturnType<typeof loadPacket>} loaded
 */
function report(status, checks, loaded) {
  return {
    harnessId: HARNESS_ID,
    harnessVersion: HARNESS_VERSION,
    status,
    preparationOnly: true,
    ls06Complete: false,
    scope: "ls06-preparation-only",
    notCompletionOf: [...NOT_COMPLETION_OF],
    independentOf: [...INDEPENDENT_OF],
    evidenceBoundaries: EVIDENCE_BOUNDARIES,
    inputDigests: loaded.digests,
    loadError: loaded.error,
    checks,
  };
}
